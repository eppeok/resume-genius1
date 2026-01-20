-- Create referrals table for tracking referral relationships
CREATE TABLE public.referrals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referred_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    referral_code text NOT NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
    credits_awarded boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    completed_at timestamptz
);

-- Add referral_code column to profiles
ALTER TABLE public.profiles ADD COLUMN referral_code text UNIQUE;

-- Create index for faster lookups
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON public.referrals(referred_id);
CREATE INDEX idx_referrals_status ON public.referrals(status);
CREATE INDEX idx_profiles_referral_code ON public.profiles(referral_code);

-- Enable RLS on referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS policies for referrals table
CREATE POLICY "Users can view their own referrals as referrer"
ON public.referrals FOR SELECT
USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view their own referrals as referred"
ON public.referrals FOR SELECT
USING (auth.uid() = referred_id);

-- Update handle_new_user function to generate referral codes and track referrals
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_referral_code text;
    v_referrer_id uuid;
    v_used_referral_code text;
BEGIN
    -- Generate unique referral code for the new user
    v_referral_code := UPPER(SUBSTR(MD5(NEW.id::text || RANDOM()::text), 1, 8));
    
    -- Create profile with referral code
    INSERT INTO public.profiles (id, email, full_name, credits, referral_code)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        3,
        v_referral_code
    );
    
    -- Assign default 'user' role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    -- Check if user signed up with a referral code
    v_used_referral_code := NEW.raw_user_meta_data->>'referral_code';
    
    IF v_used_referral_code IS NOT NULL AND v_used_referral_code != '' THEN
        -- Find the referrer by their referral code
        SELECT id INTO v_referrer_id 
        FROM public.profiles 
        WHERE referral_code = v_used_referral_code;
        
        -- Create referral record if referrer exists and it's not self-referral
        IF v_referrer_id IS NOT NULL AND v_referrer_id != NEW.id THEN
            INSERT INTO public.referrals (referrer_id, referred_id, referral_code, status)
            VALUES (v_referrer_id, NEW.id, v_used_referral_code, 'pending');
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Function to award referral credits (called from edge function)
CREATE OR REPLACE FUNCTION public.award_referral_credits(p_referred_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_referral_record public.referrals%ROWTYPE;
BEGIN
    -- Find pending referral for this user
    SELECT * INTO v_referral_record
    FROM public.referrals
    WHERE referred_id = p_referred_id 
      AND status = 'pending'
      AND credits_awarded = false
    LIMIT 1;
    
    -- If no pending referral, return false
    IF v_referral_record.id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Award 2 credits to referrer
    UPDATE public.profiles 
    SET credits = credits + 2 
    WHERE id = v_referral_record.referrer_id;
    
    -- Award 2 credits to referred user
    UPDATE public.profiles 
    SET credits = credits + 2 
    WHERE id = p_referred_id;
    
    -- Update referral status
    UPDATE public.referrals
    SET status = 'completed',
        credits_awarded = true,
        completed_at = now()
    WHERE id = v_referral_record.id;
    
    RETURN true;
END;
$$;