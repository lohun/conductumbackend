1. Database Schema Design (PostgreSQL)
The design follows a relational approach where the applications table acts as the source of truth, and secondary tables handle the history and granular logs.

Primary & Secondary Tables
applications (Existing/Updated):

id: UUID (Primary Key)

current_status: Enum (submitted, interview, accepted, rejected)

last_updated_at: Timestamp

application_status_history (New - Tracking Table):

id: UUID

application_id: UUID (FK to applications)

status: Enum

reason: Text (The "Why" behind the status change)

changed_by: UUID (FK to Better Auth users/recruiters)

created_at: Timestamp

recruiter_activity_logs (New - Audit & Notes):

id: UUID

application_id: UUID (FK to applications)

recruiter_id: UUID (FK to Better Auth users)

activity_type: String (e.g., "NOTE_ADDED", "EMAIL_SENT", "INTERVIEW_CONDUCTED")

content: Text (Store interview notes, internal feedback, or email logs here)

created_at: Timestamp

2. Agent Rule Set: Applicant Management
A. Status Update Logic
Atomic Transactions: Status updates must be wrapped in a transaction. When applications.current_status is updated, a new entry must be created in application_status_history.

Validation: Prevent illegal status jumps (e.g., moving an applicant from rejected back to interview without a high-level override).

Reason Requirement: The reason field is mandatory for rejected and accepted statuses to maintain compliance and transparency.

B. Recruiter Activity & Interview Notes
Markdown Support: The content field in recruiter_activity_logs should support Markdown to allow recruiters to format interview feedback clearly.

Soft Deletion: Activity logs should never be hard-deleted. Use a deleted_at column to ensure an immutable audit trail for HR compliance.

C. Personalized Mailing Pipeline
Template Engine: Implement a rule to use Handlebars or simple template strings to inject applicant data ({{name}}, {{job_title}}) into the email body.

Trigger Points: Every time the status moves to interview or accepted, the system should automatically prompt the recruiter to send the pre-filled template.

Logging: Every mail sent must be logged in the recruiter_activity_logs with a reference to the email provider's Message ID.

3. Implementation Rules for the Mailing Route
Route Specification: POST /api/recruiter/contact-candidate
Auth Guard: Must verify the user has a recruiter role via Better Auth session metadata.

Input Schema:

application_id: UUID

template_id: String (e.g., "interview_invite", "rejection_notice")

custom_message: Text (Optional override for the recruiter)

Provider Integration: Use Brevo Transactional mails.

Supabase Integration: Fetch the applicant's email and name directly from the database using the application_id to prevent "email spoofing" where a recruiter might manually enter the wrong email address.

4. Security & Compliance Rules
PII Masking: Recruiters should only see sensitive contact data (phone/email) once an applicant has been moved past the submitted stage.