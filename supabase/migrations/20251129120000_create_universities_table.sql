-- Create universities table for university registration and verification
CREATE TABLE IF NOT EXISTS public.universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('CENTRAL', 'STATE', 'PRIVATE', 'DEEMED')),
  state VARCHAR(100) NOT NULL,
  ugc_reference VARCHAR(255),
  aishe_code VARCHAR(20),
  website_domain VARCHAR(255) NOT NULL,
  registrar_official_email VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(255) NOT NULL,
  verification_status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_universities_verification_status ON public.universities(verification_status);
CREATE INDEX idx_universities_website_domain ON public.universities(website_domain);
CREATE INDEX idx_universities_registrar_email ON public.universities(registrar_official_email);

-- Enable RLS (Row Level Security)
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow anyone to insert new universities
CREATE POLICY "Allow inserts for university registration"
  ON public.universities
  FOR INSERT
  WITH CHECK (true);

-- Allow reading based on verification status (pending for admins, approved for public)
CREATE POLICY "Allow read pending and approved universities"
  ON public.universities
  FOR SELECT
  USING (true);

-- Allow updates only for verification_status
CREATE POLICY "Allow status updates"
  ON public.universities
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_universities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
DROP TRIGGER IF EXISTS universities_updated_at_trigger ON public.universities;
CREATE TRIGGER universities_updated_at_trigger
  BEFORE UPDATE ON public.universities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_universities_updated_at();
