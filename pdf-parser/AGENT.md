Agent Rule Set: RAG-Enhanced Resume Parser
1. Ingestion & Pre-processing Rules
File Handling: Use multer with memory storage to ingest the PDF. Immediately pass the buffer to pdf-parse-new. Do not write the raw PDF to Supabase Storage until the extraction is successful to save bandwidth.

Chunking Strategy: Implement semantic chunking. Break the extracted text into blocks (paragraphs or logical sections).

Cleaning: Remove excessive whitespace and non-ASCII characters that might confuse the embedding model before sending data to Chroma DB.

2. Chroma DB & Embedding Rules
Model Selection: Configure the Chroma client to use the all-mpnet-base-v2 embedding function for local semantic representation.

Transient Collections: Create a unique, ephemeral collection ID for each request (e.g., resume_${userId}_${timestamp}).

Semantic Indexing: Metadata must include the original line number/order to allow the LLM to understand the chronological flow of a candidate's career.

Cleanup: Explicitly delete the collection from Chroma DB immediately after the JSON is generated to prevent memory leakage in the vector store.

3. @google/genai (Gemini) Integration Rules
Role Prompting: System instruction must define Gemini as a "Senior Technical Recruiter and Data Specialist."

Context Injection: Provide the top-K most relevant chunks retrieved from Chroma DB, but always include the full "Header" section (name/contact) regardless of vector score.

Schema Enforcement:

Strictly enforce the provided JSON structure.

Null Safety Rule: If a field (e.g., twitter or facebook) is not found, the agent must return an empty string (""), never null or undefined.

Date Normalization: Ensure the period field in work_experience remains as string text (e.g., "2021 - Present") to match the OpenAPI spec.

4. Security & Auth Rules (Better Auth + Supabase)
Session Verification: Wrap the route with Better Auth middleware. Only allow authenticated users to trigger the @google/genai pipeline to prevent API cost abuse.

4. Error Handling & Validation Rules
Zod Post-Processing: After Gemini returns the JSON, run it through a Zod schema validation. If the LLM misses a field, the Zod "default" should be an empty string.

Fallback Logic: If the PDF is encrypted or unreadable by pdf-parse-new, return a 422 Unprocessable Entity with a clear message: "PDF text layer not accessible."

Data Structure Mapping Guide
The agent must ensure the following mapping logic is applied during the RAG "Refine" step:PDF Content,JSON Target,Transformation Rule
Contact Section,"telephone, email",Standardize phone to international format if possible.
Social Links,"linkedin, github, facebook, twitter, dribbble, behance .",Extract full URIs only.
Job Bullets,achievements,"Split into an array of strings; remove bullet characters (•, -)."
Schooling,education,"Map to institution, degree, and year." all data must be returned as clear and precise json. no extra markers before or after