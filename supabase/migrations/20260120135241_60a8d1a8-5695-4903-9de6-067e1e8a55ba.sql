-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update all profiles (for credit adjustments)
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all resumes
CREATE POLICY "Admins can view all resumes"
ON public.resumes FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all credit transactions
CREATE POLICY "Admins can view all transactions"
ON public.credit_transactions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all referrals
CREATE POLICY "Admins can view all referrals"
ON public.referrals FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));