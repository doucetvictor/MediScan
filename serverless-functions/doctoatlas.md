# DoctoAtlas Function Documentation

## Overview
The `doctoatlas.py` file implements a serverless function that serves as a secure gateway for accessing medical analysis data and files. It's designed to work with a PostgreSQL database and Google Cloud Storage.

## Main Features
- Secure authentication for patients and doctors
- Access control for medical analyses
- File retrieval from Google Cloud Storage
- AI comments retrieval for medical analyses

## Function Components

### Database Connection
- Uses PostgreSQL for data storage
- Connects using environment variables for security:
  - DB_USER
  - DB_PASSWORD
  - DB_NAME
  - DB_HOST

### Main Entry Point: `atlas_entrypoint`
- HTTP endpoint function
- Handles requests for:
  - AI comments retrieval
  - Medical file access
- Required query parameters:
  - viewer (case_id)
  - user_id
  - user_type
  - secret_key
  - request

### Security Features
- Verifies user credentials against database
- Checks user permissions for specific cases
- Validates user types (patient/doctor)
- Ensures users can only access their own data

### File Handling
- Supports Google Cloud Storage integration
- Parses GCS URLs
- Downloads files securely
- Handles content types and filenames

## Usage Context
This function is part of a larger medical data management system, providing secure access to medical analyses and related files while ensuring proper authentication and authorization.