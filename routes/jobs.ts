import express from 'express';
import type { Request, Response } from 'express';
import { supabase } from '../client.ts';
import { GoogleGenAI } from '@google/genai';
import { identifyUsersByCookies } from './utility.ts';

const jobsRouter = express.Router();

// Receive a new applicant for a job
jobsRouter.post('/:id/apply', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { data: job, error: jobError } = await supabase
        .from('job')
        .select('*')
        .eq('id', id)
        .single();

    if (jobError || !job) {
        return res.status(404).json({ error: 'Job not found' });
    }

    const {
        name,
        email,
        linkedin,
        github,
        facebook,
        twitter,
        dribbble,
        behance,
        telephone,
        work_experience,
        education,
        skills,
        projects,
        certifications
    } = req.body;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const resume = JSON.stringify({ resume: req.body });

    const prompt = `Role: Act as an expert Senior Technical Recruiter and ATS Parser.

        Task: Compare the provided [Resume] against the [Job Description] and [Job Requirements]. Assign a total Suitability Score out of 100 based on the following weighted criteria:

        Core Hard Skills (40%): Does the candidate possess the "Must-Have" technical tools and certifications? Do the skills match the context of their experience or projects?

        Experience Level & Seniority (30%): Does the candidate's years of experience and previous job titles align with the role's requirements?

        Quantifiable Achievements (20%): Does the resume show impact (e.g., "Increased revenue by 20%" vs. "Responsible for sales")?

        Industry Relevance & Education (10%): Relevant degree or experience within the specific sector (e.g., FinTech, FMCG).

        Output Format:

        Total Score: [X/100]

        Match Category: [Strong Match / Potential Match / Low Match]

        Key Strengths: (3 bullet points)

        Missing Gaps: (List specific missing keywords or experiences)

        Constraint: Be objective. If a skill is not explicitly stated or implied by context, do not award points for it.
        Do not give recommendations or opinions`

    const contents = [prompt, `[Resume] ${resume}`, `[Job Requirements] ${job.job_requirements}`, `[Job Description] ${job.job_description}`]

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents,
    });

    const ats = response.text;

    try {
        const { data, error } = await supabase
            .from('applicant')
            .insert([{
                job_id: id,
                name,
                email,
                linkedin,
                github,
                facebook,
                twitter,
                dribbble,
                behance,
                telephone,
                work_experience,
                education,
                skills,
                projects,
                certifications,
                ats
            }]).select();

        if (error) throw error;
        res.status(201).json(data[0]);

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to submit application' });
    }
});


// all jobs
jobsRouter.get("/", async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('job')
            .select('*, organization(*)')
            .order('created_date', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
})

export default jobsRouter;
