-- Drop the overly permissive coupon policy that allows all users to view all active coupons
DROP POLICY IF EXISTS "Users can view active coupons" ON public.coupons;

-- Create a more restrictive policy: users can only validate coupons through the RPC function
-- The validate_coupon function already handles coupon lookup securely
-- Users don't need direct SELECT access to the coupons table

-- Create a policy that only allows admins to view coupons
CREATE POLICY "Only admins can view coupons"
ON public.coupons
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);