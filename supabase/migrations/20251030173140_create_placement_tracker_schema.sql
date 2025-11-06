/*
  # Placement Tracker Database Schema

  1. New Tables
    - `students`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, student full name)
      - `email` (text, unique, student email)
      - `phone` (text, contact number)
      - `department` (text, academic department)
      - `graduation_year` (integer, year of graduation)
      - `cgpa` (numeric, cumulative GPA)
      - `created_at` (timestamptz, record creation time)
      - `updated_at` (timestamptz, last update time)
    
    - `companies`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, company name)
      - `industry` (text, industry sector)
      - `location` (text, company location)
      - `website` (text, company website)
      - `contact_person` (text, HR contact name)
      - `contact_email` (text, HR contact email)
      - `contact_phone` (text, HR contact phone)
      - `created_at` (timestamptz, record creation time)
      - `updated_at` (timestamptz, last update time)
    
    - `placements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `student_id` (uuid, foreign key to students)
      - `company_id` (uuid, foreign key to companies)
      - `position` (text, job position/role)
      - `package` (numeric, salary package)
      - `placement_date` (date, date of placement)
      - `status` (text, placement status)
      - `created_at` (timestamptz, record creation time)
      - `updated_at` (timestamptz, last update time)
    
    - `interviews`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `company_id` (uuid, foreign key to companies)
      - `interview_date` (timestamptz, date and time of interview)
      - `interview_type` (text, type of interview)
      - `location` (text, interview location)
      - `notes` (text, additional notes)
      - `created_at` (timestamptz, record creation time)
      - `updated_at` (timestamptz, last update time)
    
    - `interview_students`
      - `id` (uuid, primary key)
      - `interview_id` (uuid, foreign key to interviews)
      - `student_id` (uuid, foreign key to students)
      - `status` (text, interview status for this student)
      - `created_at` (timestamptz, record creation time)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Policies ensure users can only access data they created
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  department text NOT NULL,
  graduation_year integer NOT NULL,
  cgpa numeric(4,2) NOT NULL CHECK (cgpa >= 0 AND cgpa <= 10),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own students"
  ON students FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own students"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own students"
  ON students FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own students"
  ON students FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  industry text NOT NULL,
  location text NOT NULL,
  website text DEFAULT '',
  contact_person text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own companies"
  ON companies FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own companies"
  ON companies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own companies"
  ON companies FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create placements table
CREATE TABLE IF NOT EXISTS placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  position text NOT NULL,
  package numeric(10,2) NOT NULL,
  placement_date date NOT NULL,
  status text NOT NULL DEFAULT 'Confirmed',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE placements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own placements"
  ON placements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own placements"
  ON placements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own placements"
  ON placements FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own placements"
  ON placements FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  interview_date timestamptz NOT NULL,
  interview_type text NOT NULL,
  location text NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interviews"
  ON interviews FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interviews"
  ON interviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interviews"
  ON interviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own interviews"
  ON interviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create interview_students junction table
CREATE TABLE IF NOT EXISTS interview_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid REFERENCES interviews(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'Scheduled',
  created_at timestamptz DEFAULT now(),
  UNIQUE(interview_id, student_id)
);

ALTER TABLE interview_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view interview students for their interviews"
  ON interview_students FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = interview_students.interview_id
      AND interviews.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert interview students for their interviews"
  ON interview_students FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = interview_students.interview_id
      AND interviews.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update interview students for their interviews"
  ON interview_students FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = interview_students.interview_id
      AND interviews.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = interview_students.interview_id
      AND interviews.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete interview students for their interviews"
  ON interview_students FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = interview_students.interview_id
      AND interviews.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_placements_user_id ON placements(user_id);
CREATE INDEX IF NOT EXISTS idx_placements_student_id ON placements(student_id);
CREATE INDEX IF NOT EXISTS idx_placements_company_id ON placements(company_id);
CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_company_id ON interviews(company_id);
CREATE INDEX IF NOT EXISTS idx_interview_students_interview_id ON interview_students(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_students_student_id ON interview_students(student_id);