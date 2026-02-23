-- ENUM for Applicant Status
CREATE TYPE application_status AS ENUM ('submitted', 'interview', 'accepted', 'rejected');

-- Alter Applicant table
ALTER TABLE Applicant
ADD COLUMN current_status application_status DEFAULT 'submitted',
ADD COLUMN last_updated_at TIMESTAMP DEFAULT NOW();

-- Create Application Status History table
CREATE TABLE application_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL,
    status application_status NOT NULL,
    reason TEXT,
    changed_by TEXT, -- Corresponds to Better Auth user ID (string)
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_application
        FOREIGN KEY (application_id)
        REFERENCES Applicant(id)
        ON DELETE CASCADE
);

-- Create Recruiter Activity Logs table
CREATE TABLE recruiter_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL,
    recruiter_id TEXT NOT NULL, -- Corresponds to Better Auth user ID
    activity_type VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    CONSTRAINT fk_application_log
        FOREIGN KEY (application_id)
        REFERENCES Applicant(id)
        ON DELETE CASCADE
);

-- Application Status Update Function (RPC)
CREATE OR REPLACE FUNCTION update_application_status(
    p_application_id UUID,
    p_new_status application_status,
    p_reason TEXT,
    p_user_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_status application_status;
BEGIN
    -- Get current status and lock the row for update
    SELECT current_status INTO v_current_status
    FROM Applicant
    WHERE id = p_application_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Application with ID % not found.', p_application_id;
    END IF;

    -- Validate illegal status jumps (example business rules)
    IF v_current_status = 'rejected' AND p_new_status != 'rejected' THEN
         RAISE EXCEPTION 'Cannot change status from rejected without high-level override.';
    END IF;

    -- Enforce reason requirement for rejected/accepted
    IF p_new_status IN ('rejected', 'accepted') AND (p_reason IS NULL OR trim(p_reason) = '') THEN
        RAISE EXCEPTION 'A reason must be provided when changing status to %.', p_new_status;
    END IF;

    -- Update application
    UPDATE Applicant
    SET 
        current_status = p_new_status,
        last_updated_at = NOW()
    WHERE id = p_application_id;

    -- Insert into history
    INSERT INTO application_status_history (
        application_id, 
        status, 
        reason, 
        changed_by
    ) VALUES (
        p_application_id,
        p_new_status,
        p_reason,
        p_user_id
    );

    RETURN TRUE;
END;
$$;
