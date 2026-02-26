import { GoogleGenAI } from '@google/genai';
import { supabase } from '../client.ts';
import { systemLogger } from '../logger.ts';
import express, {} from 'express';
import { body, param } from 'express-validator';
import { handleValidationErrors } from './validationMiddleware.ts';
const jobsRouter = express.Router();
// Receive a new applicant for a job
jobsRouter.post('/:id/apply', [
    param('id').isString().notEmpty().withMessage('Job ID must be provided'),
    body('name').isString().notEmpty().withMessage('Name must be a non-empty string'),
    body('email').isEmail().withMessage('Email must be valid'),
    body('telephone').isString().notEmpty().withMessage('Telephone must be a non-empty string'),
    body('linkedin').optional().isURL().withMessage('LinkedIn must be a valid URL if provided'),
    body('github').optional().isURL().withMessage('GitHub must be a valid URL if provided'),
    body('facebook').optional().isURL().withMessage('Facebook must be a valid URL if provided'),
    body('twitter').optional().isURL().withMessage('Twitter must be a valid URL if provided'),
    body('dribbble').optional().isURL().withMessage('Dribbble must be a valid URL if provided'),
    body('behance').optional().isURL().withMessage('Behance must be a valid URL if provided'),
], handleValidationErrors, async (req, res) => {
    const { id } = req.params;
    systemLogger.info(`Jobs: NEW APPLICATION FOR JOB ID: ${id}`);
    const { data: job, error: jobError } = await supabase
        .from('job')
        .select('*')
        .eq('id', id)
        .single();
    if (jobError || !job) {
        systemLogger.error(`Jobs: JOB NOT FOUND OR DB ERROR: ${jobError?.message}`);
        return res.status(404).json({ error: 'Job not found' });
    }
    const { name, email, linkedin, github, facebook, twitter, dribbble, behance, telephone, work_experience, education, skills, projects, certifications } = req.body;
    systemLogger.info(`Jobs: APPLICANT NAME: ${name}, EMAIL: ${email}`);
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
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
        Do not give recommendations or opinions.
        Note result must be returned as JSON in the structure
        {
            match_category: string,
            key_strenghts: string,
            missing_gaps: string,
        } and nothing else. no keywords before or after and no markings like \\n as the response will be on a html page `;
    const contents = [prompt, `[Resume] ${resume}`, `[Job Requirements] ${job.job_requirements}`, `[Job Description] ${job.job_description}`];
    systemLogger.info(`Jobs: STARTING AI PROCESSING FOR ATS SCORE`);
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents,
    });
    const ats = response.text;
    systemLogger.info(`Jobs: AI RESPONSE GENERATED: ${ats}`);
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
        if (error) {
            systemLogger.error(`Jobs: SUPABASE INSERT ERROR: ${error.message}`);
            throw error;
        }
        systemLogger.info(`Jobs: APPLICATION SUBMITTED SUCCESSFULLY FOR ${name}`);
        res.status(201).json(data[0]);
    }
    catch (error) {
        systemLogger.error(`Jobs: ${error}`);
        res.status(500).json({ error: 'Failed to submit application' });
    }
});
// all jobs
jobsRouter.get("/", async (req, res) => {
    systemLogger.info(`Jobs: GET ALL JOBS`);
    try {
        const { data, error } = await supabase
            .from('job')
            .select('*, organization(*)')
            .order('created_date', { ascending: false });
        if (error) {
            systemLogger.error(`Jobs: SUPABASE ERROR: ${error.message}`);
            throw error;
        }
        systemLogger.info(`Jobs: RETURNED ${data?.length} JOBS`);
        res.status(200).json(data);
    }
    catch (error) {
        systemLogger.error(`Jobs: ${error}`);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});
jobsRouter.get("/:id", [
    param('id').isString().notEmpty().withMessage('Job ID must be provided')
], handleValidationErrors, async (req, res) => {
    const { id } = req.params;
    systemLogger.info(`Jobs: GET SINGLE JOB ID: ${id}`);
    try {
        const { data: job, error: jobError } = await supabase
            .from('job')
            .select('*')
            .eq('id', id)
            .single();
        if (jobError || !job) {
            systemLogger.error(`Jobs: JOB NOT FOUND OR DB ERROR: ${jobError?.message}`);
            return res.status(404).json({ error: 'Job not found' });
        }
        systemLogger.info(`Jobs: RETURNED JOB DATA FOR ID: ${id}`);
        res.status(200).json(job);
    }
    catch (error) {
        systemLogger.error(`Jobs: ${error}`);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});
export default jobsRouter;
//# sourceMappingURL=jobs.js.map