# MediScan Data Architecture Documentation

## Storage Components

### 1. Google Cloud Storage Buckets
The system uses Google Cloud Storage buckets to store medical documents:
- Location: Defined by `BUCKET_NAME` environment variable
- Structure:
  - `/uploads/` - Directory for storing uploaded PDF files
  - Files are renamed using UUID to ensure uniqueness
  - Original file metadata and content type are preserved

### 2. PostgreSQL Database Schema

#### Database Tables Overview

##### Patients Table
```sql
patients (
    patient_id   UUID (Primary Key)
    firstname    VARCHAR(100)
    lastname     VARCHAR(100)
    email        VARCHAR(255) UNIQUE
    phone        VARCHAR(50)
    secret_key   UUID
    created_at   TIMESTAMP
)
```

##### Doctors Table
```sql
doctors (
    doctor_id    UUID (Primary Key)
    firstname    VARCHAR(100)
    lastname     VARCHAR(100)
    email        VARCHAR(255) UNIQUE
    phone        VARCHAR(50)
    secret_key   UUID
    created_at   TIMESTAMP
)
```

##### Files Table
```sql
files (
    file_id      UUID (Primary Key)
    origin       JSONB
    file_url     TEXT
    created_at   TIMESTAMP
)
```

##### Analyses Table
```sql
analyses (
    case_id          UUID (Primary Key)
    case_no          VARCHAR(100)
    related_file_id  UUID (Foreign Key)
    doctor_id        UUID (Foreign Key)
    patient_id       UUID (Foreign Key)
    ai_comments      VARCHAR(8192)
    created_at       TIMESTAMP
)
```

## Relationships and Data Flow

### Table Relationships

1. **Analyses -> Files**
   - One-to-one relationship
   - `analyses.related_file_id` references `files.file_id`
   - When a file is deleted, the reference is set to NULL

2. **Analyses -> Doctors**
   - Many-to-one relationship
   - `analyses.doctor_id` references `doctors.doctor_id`
   - When a doctor is deleted, their references are set to NULL

3. **Analyses -> Patients**
   - Many-to-one relationship
   - `analyses.patient_id` references `patients.patient_id`
   - When a patient is deleted, their references are set to NULL

### Security Features

1. **User Authentication**
   - Both patients and doctors have unique `secret_key` UUIDs
   - Keys are automatically generated upon user creation
   - Used for secure access to medical data

2. **Data Access Control**
   - Patients can only access their own analyses
   - Doctors can only access analyses they've created
   - Access verification is handled by the `doctoatlas.py` function

### File Storage Flow

1. **Upload Process**
   - File is uploaded through `doctobuckentrypoint.py`
   - Stored in Google Cloud Storage bucket
   - File reference stored in `files` table
   - File URL format: `gs://{BUCKET_NAME}/uploads/{uuid}.pdf`

2. **Analysis Process**
   - File is analyzed by Vertex AI Gemini model
   - Analysis results stored in `analyses.ai_comments`
   - Maximum comment length: 8192 characters

### Data Integrity

- UUID used for all primary keys
- Foreign key constraints ensure referential integrity
- Timestamps track creation time for all records
- Email uniqueness enforced for both patients and doctors
- Soft delete approach for referenced records

## Usage Patterns

1. **Medical Report Upload**
   - Create file record
   - Create analysis record
   - Link to patient and doctor
   - Generate AI analysis

2. **Report Access**
   - Verify user credentials
   - Check relationship to analysis
   - Serve file and/or AI comments