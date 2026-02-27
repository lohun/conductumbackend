import express from 'express';
import type { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { handleValidationErrors } from './validationMiddleware.ts';
import { supabase } from '../client.ts'
import { identifyUsersByCookies } from './utility.ts'
import { GoogleGenAI } from '@google/genai';
import { systemLogger } from '../logger.ts';


const router = express.Router();

// Create a new job
router.post('/',
    [
        body('title').isString().notEmpty().withMessage('Title must be a non-empty string'),
        body('requirements').isString().notEmpty().withMessage('Requirements must be a non-empty string'),
        body('description').isString().notEmpty().withMessage('Description must be a non-empty string'),
        body('deadline').isISO8601().withMessage('Deadline must be a valid ISO 8601 date'),
        body('location').isString().notEmpty().withMessage('Location must be a non-empty string'),
        body('company').isString().notEmpty().withMessage('Company must be a non-empty string'),
        body('type').isString().notEmpty().withMessage('Type must be a non-empty string'),
    ],
    handleValidationErrors,
    async (req: Request, res: Response) => {
        systemLogger.info("Recruiter: Create a New Job");
        const { title, requirements, description, deadline, location, company, type } = req.body;
        systemLogger.info(`Recruiter: JOB TITLE: ${title}`);
        systemLogger.info(`Recruiter: JOB REQUIREMENTS: ${requirements}`);
        systemLogger.info(`Recruiter: JOB DESCRIPTION: ${description}`);
        systemLogger.info(`Recruiter: JOB DEADLINE: ${deadline}`);
        systemLogger.info(`Recruiter: JOB LOCATION: ${location}`);
        systemLogger.info(`Recruiter: JOB COMPANY: ${company}`);
        systemLogger.info(`Recruiter: JOB TYPE: ${type}`);

        try {
            const { organization } = await identifyUsersByCookies(req);
            const organizationId = organization?.organizationId;
            systemLogger.info(`Recruiter: Organization Id  ${organizationId}`);

            const { data, error } = await supabase
                .from('job')
                .insert([{ title, location, company_name: company, job_type: type, job_requirements: requirements, job_description: description, deadline, organization_id: organizationId }])
                .select();

            if (error) {
                systemLogger.error(`Recruiter: SUPABASE ERROR ${error.message}`);
                throw error
            };
            systemLogger.info(`Recruiter: RESPONSE ${data}`);
            res.status(201).json(data[0]);

        } catch (error) {
            systemLogger.error(`Recruiter: ${error}`);
            res.status(500).json({ error: 'Failed to create job' });
        }
    });


// get all jobs in organization
router.get("/jobs", async (req: Request, res: Response) => {
    systemLogger.info(`Recruiter: GET ALL JOBS`);
    try {
        const { organization } = await identifyUsersByCookies(req);

        systemLogger.info(`Recruiter: ORGANIZATION ID ${organization}`);

        const { data, error } = await supabase
            .from('job')
            .select('*, organization!inner(*)')
            .eq("organization.id", organization?.organizationId);

        if (error) {
            systemLogger.error(`Recruiter: SUPABASE ERROR: ${error.message}`);
            throw error
        };

        systemLogger.info(`Recruiter: RESPONSE ${data}`);
        res.status(200).json(data);
    } catch (error) {
        systemLogger.error(`Recruiter: ${error}`);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
})



// update application status
router.patch("/applications/:id/status",
    [
        param('id').isString().notEmpty().withMessage('Application ID must be provided'),
        body('status').isString().notEmpty().withMessage('Status must be a non-empty string'),
        body('reason').optional().isString().withMessage('Reason must be a string if provided')
    ],
    handleValidationErrors,
    async (req: Request, res: Response) => {
        systemLogger.info(`Recruiter: UPDATE AN APPLICANTS STATUS`);
        try {
            const { user } = await identifyUsersByCookies(req);
            if (!user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            systemLogger.info(`Recruiter: USER: ${user.id}`);

            const { id } = req.params;
            const { status, reason } = req.body;
            systemLogger.info(`Recruiter: STATUS: ${status} `);
            systemLogger.info(`Recruiter: REASON: ${reason}`);


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
                systemLogger.error(`Recruiter: SUPABASE ERROR ${error.message}`);
                // Capture specific RPC exception messages if possible
                return res.status(400).json({ error: error.message || 'Failed to update status' });
            }

            res.status(200).json({ message: 'Status updated successfully' });
        } catch (error) {
            systemLogger.error(`Recruiter: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    });


// update application status
router.patch("/applications/status",
    [
        body('ids').isArray({ min: 1 }).withMessage('IDs must be a non-empty array'),
        body('ids.*').isString().withMessage('Each ID must be a string'),
        body('status').isString().notEmpty().withMessage('Status must be a non-empty string'),
        body('reason').optional().isString().withMessage('Reason must be a string if provided')
    ],
    handleValidationErrors,
    async (req: Request, res: Response) => {
        systemLogger.info(`Recruiter: BATCH UPDATE APPLICANTS STATUS`);
        try {
            const { user } = await identifyUsersByCookies(req);
            if (!user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            systemLogger.info(`Recruiter: USER: ${user.id}`);

            const { ids, status, reason } = req.body;
            systemLogger.info(`Recruiter: IDS: ${ids}`);
            systemLogger.info(`Recruiter: STATUS: ${status}`);
            systemLogger.info(`Recruiter: REASON: ${reason}`);

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
                systemLogger.error(`Recruiter: ERROR UPDATING BATCH STATUSES: ${firstError.error?.message}`);
                return res.status(400).json({ error: 'Failed to update statuses' });
            }

            systemLogger.info(`Recruiter: BATCH STATUS UPDATED SUCCESSFULLY`);
            res.status(200).json({ message: 'Statuses updated successfully' });
        } catch (error) {
            systemLogger.error(`Recruiter: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

// GET all applications for this organization's jobs
router.get("/applications", async (req: Request, res: Response) => {
    systemLogger.info(`Recruiter: GET ALL APPLICATIONS`);
    try {
        const { organization } = await identifyUsersByCookies(req);

        if (!organization) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        systemLogger.info(`Recruiter: ORGANIZATION ID: ${organization.organizationId}`);

        const { data: applications, error } = await supabase
            .from('applicant')
            .select(`
                *,
                job!inner(*)
            `)
            .eq('job.organization_id', organization.organizationId);

        if (error) {
            systemLogger.error(`Recruiter: SUPABASE ERROR: ${error.message}`);
            throw error;
        }

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

        systemLogger.info(`Recruiter: RETURNED ${maskedApplications.length} APPLICATIONS`);
        res.status(200).json(maskedApplications);
    } catch (error) {
        systemLogger.error(`Recruiter: ${error}`);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});


// GET all applications for this organization's jobs
router.get("/applications/:id",
    [
        param('id').isString().notEmpty().withMessage('Job ID must be provided')
    ],
    handleValidationErrors,
    async (req: Request, res: Response) => {
        const { id } = req.params;
        systemLogger.info(`Recruiter: GET APPLICATIONS FOR JOB ID: ${id}`);
        try {

            const { organization } = await identifyUsersByCookies(req);

            if (!organization) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            systemLogger.info(`Recruiter: ORGANIZATION ID: ${organization.organizationId}`);

            const { data: applications, error } = await supabase
                .from('applicant')
                .select(`
                *
            `)
                .eq("job_id", id);

            if (error) {
                systemLogger.error(`Recruiter: SUPABASE ERROR: ${error.message}`);
                throw error;
            }

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

            systemLogger.info(`Recruiter: RETURNED ${maskedApplications.length} APPLICATIONS`);
            res.status(200).json(maskedApplications);
        } catch (error) {
            systemLogger.error(`Recruiter: ${error}`);
            res.status(500).json({ error: 'Failed to fetch applications' });
        }
    });

// get applicants
router.get("/applications/:jobId/:id",
    [
        param('jobId').isString().notEmpty().withMessage('Job ID must be provided'),
        param('id').isString().notEmpty().withMessage('Applicant ID must be provided')
    ],
    handleValidationErrors,
    async (req: Request, res: Response) => {
        const { jobId, id } = req.params;
        systemLogger.info(`Recruiter: GET SINGLE APPLICATION. JOB ID: ${jobId}, APP ID: ${id}`);
        try {
            const { organization } = await identifyUsersByCookies(req);

            if (!organization) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            systemLogger.info(`Recruiter: ORGANIZATION ID: ${organization.organizationId}`);

            const { data: application, error } = await supabase
                .from('applicant')
                .select(`
                *
            `)
                .eq("id", id)
                .eq("job_id", jobId)
                .single();

            if (error) {
                systemLogger.error(`Recruiter: SUPABASE ERROR: ${error.message}`);
                throw error;
            }

            systemLogger.info(`Recruiter: RETURNED APPLICATION DATA`);
            res.status(200).json(application);
        }
        catch (error) {
            systemLogger.error(`Recruiter: ${error}`);
            res.status(500).json({ error: 'Failed to fetch applications' });
        }
    })

// Send email to candidate using Brevo
router.post("/contact-candidate",
    [
        body('application_id').isString().notEmpty().withMessage('Application ID is required'),
        body('template_id').isString().notEmpty().withMessage('Template ID is required'),
        body('custom_message').optional().isString().withMessage('Custom message must be a string if provided')
    ],
    handleValidationErrors,
    async (req: Request, res: Response) => {
        systemLogger.info(`Recruiter: CONTACT CANDIDATE`);
        try {
            const { user } = await identifyUsersByCookies(req);
            if (!user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            systemLogger.info(`Recruiter: USER: ${user.id}`);

            const { application_id, template_id, custom_message } = req.body;
            systemLogger.info(`Recruiter: APP ID: ${application_id}, TEMPLATE: ${template_id}`);

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
                systemLogger.error(`Recruiter: APPLICANT NOT FOUND OR DB ERROR: ${fetchError?.message}`);
                return res.status(404).json({ error: 'Applicant not found' });
            }

            // Integrate with Brevo API for transactional email
            const brevoApiKey = process.env.BREVO_API_KEY;
            if (!brevoApiKey) {
                systemLogger.warn('Recruiter: BREVO_API_KEY is not defined. Simulate sending email.');
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
                systemLogger.info(`Recruiter: BREVO RESPONSE STATUS: ${response.status}`);

                if (!response.ok) {
                    const errorData = await response.json();
                    systemLogger.error(`Recruiter: BREVO API ERROR: ${JSON.stringify(errorData)}`);
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
                systemLogger.error(`Recruiter: FAILED TO LOG EMAIL ACTIVITY: ${logError.message}`);
                // Non-blocking error for the email send
            }

            systemLogger.info(`Recruiter: MESSAGE SENT AND LOGGED SUCCESSFULLY`);
            res.status(200).json({ message: 'Message sent and logged successfully' });

        } catch (error) {
            systemLogger.error(`Recruiter: ${error}`);
            res.status(500).json({ error: 'Failed to contact candidate' });
        }
    });

// do more with ai chatbots
router.post("/chatbot/:id",
    [
        param('id').isString().notEmpty().withMessage('Job ID must be provided'),
        body('prompt').isString().notEmpty().withMessage('Prompt is required'),
        body('ids').optional().isArray().withMessage('IDs must be an array if provided')
    ],
    handleValidationErrors,
    async (req: Request, res: Response) => {
        const { id } = req.params;
        systemLogger.info(`Recruiter: CHATBOT INTERACTION FOR JOB ID: ${id}`);
        try {
            const { prompt, ids, history = [] } = req.body;
            systemLogger.info(`Recruiter: PROMPT: ${prompt}`);
            systemLogger.info(`Recruiter: IDS: ${ids}`);

            let query = supabase.from('applicant').select('*').eq('job_id', id);

            if (ids && ids.length > 0) {
                query = query.in('id', ids);
            } else {
                query = query.eq('status', 'interview');
            }

            const { data: jobDescription, error: jobError } = await supabase.from('job').select('*').eq('id', id).single();
            if (jobError) {
                systemLogger.error(`Recruiter: SUPABASE ERROR: ${jobError.message}`);
                throw jobError;
            }

            const { data: applicants, error: dbError } = await query;
            if (dbError) {
                systemLogger.error(`Recruiter: SUPABASE ERROR: ${dbError.message}`);
                throw dbError;
            }
            systemLogger.info(`Recruiter: FOUND ${applicants?.length} APPLICANTS FOR AI CONTEXT`);

            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
            const system = `Role: You are a Senior Recruitment AI Specialist with deep expertise in the West African labor market. Your task is to act as a high-level screening assistant for Recruitment Managers.

                Task: Analyze the provided [Job_Requirements] and the list of [applicants]. You must filter for the most qualified candidates while simultaneously flagging any anomalies, red flags (e.g., fraud, resume padding, duplicate submissions), or exceptional cultural fits.

                Evaluation Criteria:

                Skill Match: Compare technical skills and years of experience against the JD.

                Contextual Relevance: Note candidates with experience in relevant regional industries or reputable local/international institutions.

                Integrity Check: Identify patterns that suggest "gaming the system," such as multiple submissions under slight variations of the same name or inconsistent career timelines.

                Constraint: You must return your analysis strictly in the following JSON format:

                
                {
                "summary": "A high-level overview of the applicant pool, highlighting overall quality and any major concerns or trends found.",
                "applicants": [
                    {
                    "id": "Unique applicant ID",
                    "name": "Full name of the applicant",
                    "description": "A concise justification for why this applicant was selected or flagged. Mention specific strengths or specific red flags."
                    }
                ]
                }
        `;

            const contents = [system, `[instruction] ${prompt}`, `[Job_Requirements] ${JSON.stringify(applicants)}`, `[applicants] ${JSON.stringify(applicants)}`];

            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: contents,
            });


            systemLogger.info(`Recruiter: AI RESPONSE GENERATED`);
            systemLogger.info(`Recruiter: AI TEXT: ${response.data}`);

            if (!response) {
                systemLogger.error(`Recruiter: AI RESPONSE EMPTY`);
                return res.status(500).json({ error: 'There was an error, please try again later' });
            }


            res.json({ message: response.text });

        } catch (error) {
            systemLogger.error(`Recruiter: ${error}`);
            res.status(500).json({ error: 'There was an error, please try again later' });
        }
    });

export default router;