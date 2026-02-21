import express from 'express';
import type { Request, Response } from 'express';
import { supabase } from '../client.ts'
import { identifyUsersByCookies } from './utility.ts'
import { auth } from '../auth.ts';
import { fromNodeHeaders } from 'better-auth/node';

const router = express.Router();

// Create a new job
router.post('/', async (req: Request, res: Response) => {
    const { title, job_requirements, job_description, deadline, location, company_name, job_type } = req.body;

    try {
        const organizations = await auth.api.listOrganizations({
            headers: fromNodeHeaders(req.headers),
        });

        const organization_id = organizations[0]!.id

        const { data, error } = await supabase
            .from('job')
            .insert([{ title, location, company_name, job_type, job_requirements, job_description, deadline, organization_id }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to create job' });
    }
});


// get all jobs in organization
router.get("/jobs", async (req: Request, res: Response) => {
    try {
        const organizations = await auth.api.listOrganizations({
            headers: fromNodeHeaders(req.headers),
        });

        const organization_id = organizations[0]!.id

        const { data, error } = await supabase
            .from('job')
            .select('*, organization(*)')
            .eq("organization.id", organization_id);

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
})



export default router;