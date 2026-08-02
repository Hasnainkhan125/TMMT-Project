-- TAMMAT Supabase Database Setup
-- This script creates the necessary tables and policies for the authentication system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone_number TEXT,
    country TEXT,
    role TEXT CHECK (role IN ('user', 'amer', 'admin')) DEFAULT 'user',
    emirates_id TEXT,
    passport_number TEXT,
    company TEXT,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fraud_alerts table
CREATE TABLE IF NOT EXISTS fraud_alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    application_id TEXT NOT NULL,
    type TEXT CHECK (type IN ('document_forgery', 'identity_theft', 'multiple_applications', 'blacklisted_documents')) NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) NOT NULL,
    description TEXT NOT NULL,
    evidence TEXT[],
    status TEXT CHECK (status IN ('open', 'investigating', 'resolved', 'escalated')) DEFAULT 'open',
    assigned_to UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create penalties table
CREATE TABLE IF NOT EXISTS penalties (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    application_id TEXT NOT NULL,
    type TEXT CHECK (type IN ('fine', 'ban', 'blacklist', 'legal_action')) NOT NULL,
    amount DECIMAL(10,2),
    currency TEXT DEFAULT 'AED',
    duration TEXT,
    reason TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'issued', 'paid', 'disputed')) DEFAULT 'pending',
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE,
    applicant_name TEXT NOT NULL,
    document_type TEXT NOT NULL,
    fraud_evidence TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create otp_requests table
CREATE TABLE IF NOT EXISTS otp_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    application_id TEXT NOT NULL,
    type TEXT CHECK (type IN ('establishment_card', 'esignature_card', 'phone_verification')) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'sent', 'verified', 'expired')) DEFAULT 'pending',
    otp TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    applicant_name TEXT NOT NULL,
    contact_info TEXT NOT NULL,
    purpose TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_requests ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Fraud alerts policies
CREATE POLICY "Amer officers can view all fraud alerts" ON fraud_alerts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('amer', 'admin')
        )
    );

CREATE POLICY "Amer officers can insert fraud alerts" ON fraud_alerts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('amer', 'admin')
        )
    );

CREATE POLICY "Amer officers can update fraud alerts" ON fraud_alerts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('amer', 'admin')
        )
    );

-- Penalties policies
CREATE POLICY "Amer officers can view all penalties" ON penalties
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('amer', 'admin')
        )
    );

CREATE POLICY "Amer officers can insert penalties" ON penalties
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('amer', 'admin')
        )
    );

CREATE POLICY "Amer officers can update penalties" ON penalties
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('amer', 'admin')
        )
    );

-- OTP requests policies
CREATE POLICY "Amer officers can view all OTP requests" ON otp_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('amer', 'admin')
        )
    );

CREATE POLICY "Amer officers can insert OTP requests" ON otp_requests
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('amer', 'admin')
        )
    );

CREATE POLICY "Amer officers can update OTP requests" ON otp_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('amer', 'admin')
        )
    );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, first_name, last_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'firstName', ''),
        COALESCE(NEW.raw_user_meta_data->>'lastName', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fraud_alerts_updated_at
    BEFORE UPDATE ON fraud_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_penalties_updated_at
    BEFORE UPDATE ON penalties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_otp_requests_updated_at
    BEFORE UPDATE ON otp_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (optional - remove in production)
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES (
--     uuid_generate_v4(),
--     'admin@tammat.com',
--     crypt('admin123', gen_salt('bf')),
--     NOW(),
--     NOW(),
--     NOW()
-- );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_application_id ON fraud_alerts(application_id);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_status ON fraud_alerts(status);
CREATE INDEX IF NOT EXISTS idx_penalties_application_id ON penalties(application_id);
CREATE INDEX IF NOT EXISTS idx_penalties_status ON penalties(status);
CREATE INDEX IF NOT EXISTS idx_otp_requests_application_id ON otp_requests(application_id);
CREATE INDEX IF NOT EXISTS idx_otp_requests_status ON otp_requests(status);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Enable realtime for tables (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE fraud_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE penalties;
ALTER PUBLICATION supabase_realtime ADD TABLE otp_requests;
