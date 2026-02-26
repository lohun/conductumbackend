import express from 'express';
import type { Request, Response } from 'express';
import { supabase } from '../client.ts'
import { identifyUsersByCookies } from './utility.ts'

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



// update application status
router.patch("/applications/:id/status", async (req: Request, res: Response) => {
    try {
        const { user } = await identifyUsersByCookies(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { id } = req.params;
        const { status, reason } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        // Call the RPC function to update status atomically
        const { error } = await supabase.rpc('update_application_status', {
            p_application_id: id,
            p_new_status: status,
            p_reason: reason,
            p_user_id: user.id
        });

        if (error) {
            console.error('Error updating application status:', error);
            // Capture specific RPC exception messages if possible
            return res.status(400).json({ error: error.message || 'Failed to update status' });
        }

        res.status(200).json({ message: 'Status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// update application status
router.patch("/applications/status", async (req: Request, res: Response) => {
    try {
        const { user } = await identifyUsersByCookies(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { ids, status, reason } = req.body;

        if (!status || !Array.isArray(ids)) {
            return res.status(400).json({ error: 'Status and an array of ids are required' });
        }

        // Execute all updates in parallel
        const results = await Promise.all(ids.map(id =>
            supabase.rpc('update_application_status', {
                p_application_id: id,
                p_new_status: status,
                p_reason: reason,
                p_user_id: user.id
            })
        ));

        const firstError = results.find(r => r.error);
        if (firstError) {
            console.error('Error updating application statuses:', firstError.error);
            return res.status(400).json({ error: 'Failed to update statuses' });
        }

        res.status(200).json({ message: 'Statuses updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET all applications for this organization's jobs
router.get("/applications", async (req: Request, res: Response) => {
    try {
        const { organization } = await identifyUsersByCookies(req);

        if (!organization) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { data: applications, error } = await supabase
            .from('applicant')
            .select(`
                *,
                job!inner(*)
            `)
            .eq('job.organization_id', organization.organizationId);

        if (error) throw error;

        // Apply PII Masking
        const maskedApplications = applications.map(app => {
            if (app.current_status === 'submitted') {
                return {
                    ...app,
                    email: app.email?.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email keeping first 2 chars
                    telephone: app.telephone ? '***-***-****' : null
                };
            }
            return app;
        });

        res.status(200).json(maskedApplications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});


// GET all applications for this organization's jobs
router.get("/applications/:id", async (req: Request, res: Response) => {
    try {

        const { id } = req.params;
        const { organization } = await identifyUsersByCookies(req);

        if (!organization) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { data: applications, error } = await supabase
            .from('applicant')
            .select(`
                *
            `)
            .eq("job_id", id);

        if (error) throw error;

        // Apply PII Masking
        const maskedApplications = applications.map(app => {
            if (app.current_status === 'submitted') {
                return {
                    ...app,
                    email: app.email?.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email keeping first 2 chars
                    telephone: app.telephone ? '***-***-****' : null
                };
            }
            return app;
        });

        res.status(200).json(maskedApplications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// get applicants
router.get("/applications/:jobId/:id", async (req: Request, res: Response) => {
    try {
        const { jobId, id } = req.params;
        const { organization } = await identifyUsersByCookies(req);

        if (!organization) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { data: application, error } = await supabase
            .from('applicant')
            .select(`
                *
            `)
            .eq("id", id)
            .eq("job_id", jobId)
            .single();

        if (error) throw error;

        res.status(200).json(application);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
})

// Send email to candidate using Brevo
router.post("/contact-candidate", async (req: Request, res: Response) => {
    try {
        const { user } = await identifyUsersByCookies(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { application_id, template_id, custom_message } = req.body;

        if (!application_id || !template_id) {
            return res.status(400).json({ error: 'Application ID and Template ID are required' });
        }

        // Fetch candidate data securely from DB
        const { data: application, error: fetchError } = await supabase
            .from('applicant')
            .select('email, name')
            .eq('id', application_id)
            .single();

        if (fetchError || !application) {
            return res.status(404).json({ error: 'Applicant not found' });
        }

        // Integrate with Brevo API for transactional email
        const brevoApiKey = process.env.BREVO_API_KEY;
        if (!brevoApiKey) {
            console.warn('BREVO_API_KEY is not defined. Simulate sending email.');
        } else {
            let htmlContent = `<p>Hi ${application.name},</p>`;

            if (template_id === 'interview_invite') {
                htmlContent += `<p>We would like to invite you for an interview!</p>`;
            } else if (template_id === 'rejection_notice') {
                htmlContent += `<p>Thank you for applying. Unfortunately, we are moving forward with other candidates.</p>`;
            }

            if (custom_message) {
                htmlContent += `<p>${custom_message}</p>`;
            }

            const emailData = {
                sender: { email: "nwankpele@gmail.com", name: "Conductum ATS" },
                to: [{ email: application.email, name: application.name }],
                subject: "Update on your application",
                htmlContent: htmlContent
            };

            const response = await fetch("https://api.brevo.com/v3/smtp/email", {
                method: "POST",
                headers: {
                    "accept": "application/json",
                    "api-key": brevoApiKey,
                    "content-type": "application/json"
                },
                body: JSON.stringify(emailData)
            });
            console.log(response)

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Brevo API error:", errorData);
                return res.status(500).json({ error: 'Failed to send email via provider' });
            }
        }

        // Save to recruiter_activity_logs
        const { error: logError } = await supabase
            .from('recruiter_activity_logs')
            .insert([{
                application_id,
                recruiter_id: user.id,
                activity_type: 'EMAIL_SENT',
                content: `Sent template: ${template_id}. Custom Note: ${custom_message || 'None'}`
            }]);

        if (logError) {
            console.error('Failed to log email activity:', logError);
            // Non-blocking error for the email send
        }

        res.status(200).json({ message: 'Message sent and logged successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to contact candidate' });
    }
});

export default router;