-- Drop in existing tables
DROP TABLE IF EXISTS analyses, doctors, files, patients CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Patients table
CREATE TABLE patients (
    patient_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firstname VARCHAR(100) NOT NULL,
    lastname  VARCHAR(100) NOT NULL,
    email     VARCHAR(255) UNIQUE NOT NULL,
    phone     VARCHAR(50),
    secret_key UUID DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctors table
CREATE TABLE doctors (
    doctor_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firstname VARCHAR(100) NOT NULL,
    lastname  VARCHAR(100) NOT NULL,
    email     VARCHAR(255) UNIQUE NOT NULL,
    phone     VARCHAR(50),
    secret_key UUID DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Files table
CREATE TABLE files (
    file_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origin JSONB,
    file_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analyses table
CREATE TABLE analyses (
    case_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_no VARCHAR(100) NOT NULL,
    related_file_id UUID REFERENCES files(file_id) ON DELETE SET NULL,
    doctor_id UUID REFERENCES doctors(doctor_id) ON DELETE SET NULL,
    patient_id UUID REFERENCES patients(patient_id) ON DELETE SET NULL,
    ai_comments VARCHAR(8192),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
