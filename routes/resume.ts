import express from 'express';
import type { Request, Response } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse-new';
import { ChromaClient } from 'chromadb';
import { SentenceTransformersEmbeddingFunction } from '@chroma-core/sentence-transformer';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';


const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
const chromaClient = new ChromaClient();
const sentenceTransformerEF = new SentenceTransformersEmbeddingFunction({
    modelName: "all-MiniLM-L6-v2",
    device: "cpu",
    normalizeEmbeddings: false,
});
router.post('/parse', upload.single('resume'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        let pdfData;
        try {
            // @ts-ignore
            pdfData = await pdfParse(req.file.buffer);
        } catch (error) {
            return res.status(422).json({ error: 'PDF text layer not accessible.' });
        }

        const text = pdfData.text.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").replace(/\s+/g, " ");

        // Semantic Chunking Strategy (split by double newlines or large content blocks)
        const rawChunks = pdfData.text.split(/(?:\r?\n){2,}/);
        const chunks = rawChunks
            .map((chunk: string) => chunk.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").replace(/\s+/g, " ").trim())
            .filter((chunk: string) => chunk.length > 0);

        const collectionName = `resume_${Date.now()}`;
        const collection = await chromaClient.createCollection({ name: collectionName, embeddingFunction: sentenceTransformerEF });

        const ids = chunks.map((_: string, i: number) => `chunk_${i}`);
        const metadatas = chunks.map((_: string, i: number) => ({ lineNumber: i, isHeader: i === 0 }));

        await collection.add({
            ids,
            documents: chunks,
            metadatas,
        });
        console.log(collection);

        // Querying top chunks
        const queryResults = await collection.query({
            queryTexts: ["skills education experience projects contact work"],
            nResults: Math.min(chunks.length, 10),
        });

        const headerChunk = chunks[0] || "";
        const retrievedChunks = [headerChunk, ...(queryResults.documents[0] as string[] || [])];
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

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are a Senior Technical Recruiter and Data Specialist.",
                responseMimeType: "application/json",
            }
        });

        try {
            await chromaClient.deleteCollection({ name: collectionName });
        } catch (e) {
            console.error("Failed to delete chroma collection", e);
        }

        const jsonResp = JSON.parse(response.text || "{}");
        const validatedResponse = responseSchema.parse(jsonResp);

        res.status(200).json(validatedResponse);
    } catch (error) {
        console.error("Resume parsing error", error);
        res.status(500).json({ error: 'Failed to process resume' });
    }
});

export default router;
