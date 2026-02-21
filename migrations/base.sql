CREATE TABLE Job (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_requirements TEXT,
    job_description TEXT,
    deadline DATE,
    organization_id TEXT,
    status varchar(10) default "open",
    created_date DATE DEFAULT NOW(),
    CONSTRAINT fk_jobs
        FOREIGN KEY (organization_id)
        REFERENCES organization(id)
);

CREATE TABLE Applicant (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    linkedIn VARCHAR(255),
    github VARCHAR(255),
    facebook VARCHAR(255),
    twitter VARCHAR(255),
    dribbble VARCHAR(255),
    behance VARCHAR(255),
    Telephone VARCHAR(50),
    work_experience TEXT,
    education TEXT,
    skills TEXT,
    projects TEXT,
    certifications TEXT,
    Resume TEXT,
    ats TEXT,
    CONSTRAINT fk_applicants
        FOREIGN KEY (job_id)
        REFERENCES Job(id),
    unique(email, job_id)

);

