import express from 'express';
import type { Request, Response } from 'express';
import { supabase } from '../client.ts'
import { identifyUsersByCookies } from './utility.ts'
import { auth } from '../auth.ts';
import { fromNodeHeaders } from 'better-auth/node';

const router = express.Router();

// Create a new job
router.post('/', async (req: Request, res: Response) => {
    const { title, requirements, description, deadline, location, company, type } = req.body;

    try {
        const { organization } = await identifyUsersByCookies(req);

        const organizationId = organization?.organizationId;

        const { data, error } = await supabase
            .from('job')
            .insert([{ title, location, company_name: company, job_type: type, job_requirements: requirements, job_description: description, deadline, organization_id: organizationId }])
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
        const { organization } = await identifyUsersByCookies(req);


        const { data, error } = await supabase
            .from('job')
            .select('*, organization!inner(*)')
            .eq("organization.id", organization?.organizationId);

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
})



export default router;