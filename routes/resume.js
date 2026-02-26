import { z } from 'zod';
import { systemLogger } from '../logger.ts';
import express, {} from 'express';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import { CloudClient } from 'chromadb';
import { SentenceTransformersEmbeddingFunction } from '@chroma-core/sentence-transformer';
import path from 'path';
import PdfParse from 'pdf-parse-new';
const router = express.Router();
// Define the file filter function
const pdfFileFilter = (req, file, cb) => {
    // Allowed MIME types
    const allowedMimes = ['application/pdf'];
    // Check if the file's mimetype is in the allowed list
    const isMimeTypeAllowed = allowedMimes.includes(file.mimetype);
    // Allowed file extensions (regex for robust checking)
    const allowedExts = /.pdf$/;
    // Check if the file extension matches the regex
    const isExtAllowed = allowedExts.test(path.extname(file.originalname).toLowerCase());
    if (isMimeTypeAllowed && isExtAllowed) {
        // Accept the file
        cb(null, true);
    }
    else {
        // Reject the file and return an error message
        cb(new Error('Invalid file type, only PDF is allowed!'), false);
    }
};
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: pdfFileFilter, // Pass the filter function created above
});
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const chromaClient = new CloudClient();
const sentenceTransformerEF = new SentenceTransformersEmbeddingFunction({
    modelName: "all-MiniLM-L6-v2",
    device: "cpu",
    normalizeEmbeddings: false,
});
router.post('/parse', upload.single('resume'), async (req, res) => {
    systemLogger.info(`Resume: STARTING RESUME PARSE`);
    try {
        if (!req.file) {
            systemLogger.warn(`Resume: NO FILE UPLOADED`);
            return res.status(400).json({ error: 'No file uploaded' });
        }
        systemLogger.info(`Resume: RECEIVED FILE: ${req.file.originalname}, SIZE: ${req.file.size} bytes`);
        let pdfData;
        try {
            // @ts-ignore
            pdfData = await PdfParse(req.file.buffer);
            systemLogger.info(`Resume: PDF PARSED SUCCESSFULLY`);
        }
        catch (error) {
            systemLogger.error(`Resume: PDF PARSE ERROR: ${error}`);
            return res.status(422).json({ error: 'PDF text layer not accessible.' });
        }
        const text = pdfData.text.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").replace(/\s+/g, " ");
        // Semantic Chunking Strategy (split by double newlines or large content blocks)
        const rawChunks = pdfData.text.split(/(?:\r?\n){2,}/);
        const chunks = rawChunks
            .map((chunk) => chunk.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").replace(/\s+/g, " ").trim())
            .filter((chunk) => chunk.length > 0);
        systemLogger.info(`Resume: CREATED ${chunks.length} CHUNKS FROM PDF`);
        const collectionName = `resume_${Date.now()}`;
        systemLogger.info(`Resume: CREATING CHROMADB COLLECTION: ${collectionName}`);
        const collection = await chromaClient.createCollection({ name: collectionName, embeddingFunction: sentenceTransformerEF });
        const ids = chunks.map((_, i) => `chunk_${i}`);
        const metadatas = chunks.map((_, i) => ({ lineNumber: i, isHeader: i === 0 }));
        await collection.add({
            ids,
            documents: chunks,
            metadatas,
        });
        systemLogger.info(`Resume: ADDED CHUNKS TO CHROMADB`);
        // Querying top chunks
        const queryResults = await collection.query({
            queryTexts: ["skills education experience projects contact work"],
            nResults: Math.min(chunks.length, 10),
        });
        systemLogger.info(`Resume: QUERIED CHROMADB FOR TOP CHUNKS`);
        const headerChunk = chunks[0] || "";
        const retrievedChunks = [headerChunk, ...(queryResults.documents[0] || [])];
        const uniqueChunks = Array.from(new Set(retrievedChunks));
        const prompt = `
Extract the candidate's professional profile into the exact JSON schema provided.

Follow these Data Structure Mapping Rules:
-telephone. Standardize phone to international format if possible. 
-email. Extract full URIs only example name@gmail.com. 
-linkedin. Extract full linked URIs only eg https://www.linkedin.com/in/name-012345/. 
-github. Extract full URIs only eg https://github.com/name.
-facebook. Extract full URIs only eg https://web.facebook.com/name. 
-twitter. Extract full URIs only eg https://x.com/name. 
-dribbble. Extract full URIs only eg https://dribbble.com/name. 
-behance. Extract full URIs only eg https://behance.com/name.
- Work and Professional Experience: Get full work experience including locations worked, period worked, tasks and achievements. Split into an array of strings; remove bullet characters (•, -). Map to experience
- Schooling: education. Map to institution, degree, and year.
- Null Safety: If a field is not found, return an empty string "", NOT null or undefined.
- Date Normalization: Ensure the period field in work_experience remains as string text (e.g. "2021 - Present").
-skills: An array of all skills written

Here is the parsed context from the resume:
${uniqueChunks.join("\n\n---\n\n")}
        `;
        const responseSchema = z.object({
            email: z.string().default(""),
            telephone: z.string().default(""),
            linkedin: z.string().default(""),
            github: z.string().default(""),
            facebook: z.string().default(""),
            twitter: z.string().default(""),
            dribbble: z.string().default(""),
            behance: z.string().default(""),
            skills: z.array(z.string()).default([]),
            experience: z.array(z.object({
                company: z.string().default(""),
                title: z.string().default(""),
                period: z.string().default(""),
                achievements: z.array(z.string()).default([])
            })).default([]),
            education: z.array(z.object({
                institution: z.string().default(""),
                degree: z.string().default(""),
                year: z.string().default("")
            })).default([])
        });
        systemLogger.info(`Resume: STARTING AI GENERATION FOR EXTRACTION`);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are a Senior Technical Recruiter and Data Specialist.",
                responseMimeType: "application/json",
            }
        });
        systemLogger.info(`Resume: AI RESPONSE RECEIVED`);
        try {
            await chromaClient.deleteCollection({ name: collectionName });
            systemLogger.info(`Resume: DELETED CHROMADB COLLECTION: ${collectionName}`);
        }
        catch (e) {
            systemLogger.error(`Resume: FAILED TO DELETE CHROMADB COLLECTION: ${e}`);
        }
        const jsonResp = JSON.parse(response.text || "{}");
        systemLogger.info(`Resume: PARSED AI JSON RESPONSE`);
        const validatedResponse = responseSchema.parse(jsonResp);
        systemLogger.info(`Resume: VALIDATED RESPONSE WITH ZOD`);
        res.status(200).json(validatedResponse);
    }
    catch (error) {
        systemLogger.error(`Resume: PARSING ERROR: ${error}`);
        res.status(500).json({ error: 'Failed to process resume' });
    }
});
export default router;
//# sourceMappingURL=resume.js.map