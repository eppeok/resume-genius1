-- Fix referrals table: Add explicit policies to prevent manipulation
CREATE POLICY "Prevent user inserts on referrals" 
ON public.referrals FOR INSERT 
WITH CHECK (false);

CREATE POLICY "Prevent user updates on referrals" 
ON public.referrals FOR UPDATE 
USING (false);

CREATE POLICY "Prevent user deletes on referrals" 
ON public.referrals FOR DELETE 
USING (false);

-- Fix credit_transactions table: Add explicit immutability policies
CREATE POLICY "Prevent transaction updates" 
ON public.credit_transactions FOR UPDATE 
USING (false);

CREATE POLICY "Prevent transaction deletes" 
ON public.credit_transactions FOR DELETE 
USING (false);