-- Create coupons table
CREATE TABLE public.coupons (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value INTEGER NOT NULL CHECK (discount_value > 0),
    max_uses INTEGER DEFAULT NULL,
    current_uses INTEGER NOT NULL DEFAULT 0,
    min_purchase_amount INTEGER DEFAULT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coupon_redemptions table to track usage
CREATE TABLE public.coupon_redemptions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    transaction_id UUID REFERENCES public.credit_transactions(id),
    discount_applied INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for coupons
CREATE POLICY "Admins can manage all coupons"
ON public.coupons
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view active coupons"
ON public.coupons
FOR SELECT
USING (is_active = true);

-- RLS policies for coupon_redemptions
CREATE POLICY "Admins can view all redemptions"
ON public.coupon_redemptions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own redemptions"
ON public.coupon_redemptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert redemptions"
ON public.coupon_redemptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_coupons_updated_at
BEFORE UPDATE ON public.coupons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to validate and apply coupon
CREATE OR REPLACE FUNCTION public.validate_coupon(p_code TEXT, p_user_id UUID, p_purchase_amount INTEGER)
RETURNS TABLE (
    is_valid BOOLEAN,
    coupon_id UUID,
    discount_type TEXT,
    discount_value INTEGER,
    error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_coupon public.coupons%ROWTYPE;
    v_user_redemptions INTEGER;
BEGIN
    -- Find the coupon
    SELECT * INTO v_coupon FROM public.coupons WHERE UPPER(code) = UPPER(p_code);
    
    IF v_coupon.id IS NULL THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::INTEGER, 'Invalid coupon code'::TEXT;
        RETURN;
    END IF;
    
    -- Check if active
    IF NOT v_coupon.is_active THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::INTEGER, 'This coupon is no longer active'::TEXT;
        RETURN;
    END IF;
    
    -- Check expiration
    IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at < now() THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::INTEGER, 'This coupon has expired'::TEXT;
        RETURN;
    END IF;
    
    -- Check max uses
    IF v_coupon.max_uses IS NOT NULL AND v_coupon.current_uses >= v_coupon.max_uses THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::INTEGER, 'This coupon has reached its usage limit'::TEXT;
        RETURN;
    END IF;
    
    -- Check minimum purchase amount (in cents)
    IF v_coupon.min_purchase_amount IS NOT NULL AND p_purchase_amount < v_coupon.min_purchase_amount THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::INTEGER, 
            ('Minimum purchase of $' || (v_coupon.min_purchase_amount / 100.0)::TEXT || ' required')::TEXT;
        RETURN;
    END IF;
    
    -- Check if user already used this coupon
    SELECT COUNT(*) INTO v_user_redemptions 
    FROM public.coupon_redemptions 
    WHERE coupon_id = v_coupon.id AND user_id = p_user_id;
    
    IF v_user_redemptions > 0 THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::INTEGER, 'You have already used this coupon'::TEXT;
        RETURN;
    END IF;
    
    -- Coupon is valid
    RETURN QUERY SELECT true, v_coupon.id, v_coupon.discount_type, v_coupon.discount_value, NULL::TEXT;
END;
$$;