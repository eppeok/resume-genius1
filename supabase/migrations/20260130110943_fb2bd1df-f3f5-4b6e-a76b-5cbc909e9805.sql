-- Deny anonymous access to credit_transactions table
CREATE POLICY "Deny anonymous access to credit_transactions"
ON public.credit_transactions FOR SELECT
TO anon
USING (false);

CREATE POLICY "Deny anonymous insert to credit_transactions"
ON public.credit_transactions FOR INSERT
TO anon
WITH CHECK (false);

-- Deny anonymous access to coupons table
CREATE POLICY "Deny anonymous access to coupons"
ON public.coupons FOR SELECT
TO anon
USING (false);

CREATE POLICY "Deny anonymous insert to coupons"
ON public.coupons FOR INSERT
TO anon
WITH CHECK (false);

CREATE POLICY "Deny anonymous update to coupons"
ON public.coupons FOR UPDATE
TO anon
USING (false);

CREATE POLICY "Deny anonymous delete to coupons"
ON public.coupons FOR DELETE
TO anon
USING (false);

-- Deny anonymous access to bookmarked_jobs table
CREATE POLICY "Deny anonymous access to bookmarked_jobs"
ON public.bookmarked_jobs FOR SELECT
TO anon
USING (false);

CREATE POLICY "Deny anonymous insert to bookmarked_jobs"
ON public.bookmarked_jobs FOR INSERT
TO anon
WITH CHECK (false);

CREATE POLICY "Deny anonymous update to bookmarked_jobs"
ON public.bookmarked_jobs FOR UPDATE
TO anon
USING (false);

CREATE POLICY "Deny anonymous delete to bookmarked_jobs"
ON public.bookmarked_jobs FOR DELETE
TO anon
USING (false);

-- Deny anonymous access to job_searches table
CREATE POLICY "Deny anonymous access to job_searches"
ON public.job_searches FOR SELECT
TO anon
USING (false);

CREATE POLICY "Deny anonymous insert to job_searches"
ON public.job_searches FOR INSERT
TO anon
WITH CHECK (false);

CREATE POLICY "Deny anonymous delete to job_searches"
ON public.job_searches FOR DELETE
TO anon
USING (false);

-- Deny anonymous access to coupon_redemptions table
CREATE POLICY "Deny anonymous access to coupon_redemptions"
ON public.coupon_redemptions FOR SELECT
TO anon
USING (false);

CREATE POLICY "Deny anonymous insert to coupon_redemptions"
ON public.coupon_redemptions FOR INSERT
TO anon
WITH CHECK (false);

-- Deny anonymous access to referrals table
CREATE POLICY "Deny anonymous access to referrals"
ON public.referrals FOR SELECT
TO anon
USING (false);

-- Deny anonymous access to user_roles table
CREATE POLICY "Deny anonymous access to user_roles"
ON public.user_roles FOR SELECT
TO anon
USING (false);

CREATE POLICY "Deny anonymous insert to user_roles"
ON public.user_roles FOR INSERT
TO anon
WITH CHECK (false);

CREATE POLICY "Deny anonymous update to user_roles"
ON public.user_roles FOR UPDATE
TO anon
USING (false);

CREATE POLICY "Deny anonymous delete to user_roles"
ON public.user_roles FOR DELETE
TO anon
USING (false);