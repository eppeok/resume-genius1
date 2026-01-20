-- Fix the validate_coupon function with ambiguous column reference
CREATE OR REPLACE FUNCTION public.validate_coupon(p_code text, p_user_id uuid, p_purchase_amount integer)
 RETURNS TABLE(is_valid boolean, coupon_id uuid, discount_type text, discount_value integer, error_message text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    
    -- Check if user already used this coupon (using table alias to avoid ambiguity)
    SELECT COUNT(*) INTO v_user_redemptions 
    FROM public.coupon_redemptions cr
    WHERE cr.coupon_id = v_coupon.id AND cr.user_id = p_user_id;
    
    IF v_user_redemptions > 0 THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::INTEGER, 'You have already used this coupon'::TEXT;
        RETURN;
    END IF;
    
    -- Coupon is valid - use explicit column names to avoid ambiguity with return table columns
    RETURN QUERY SELECT 
        true AS is_valid, 
        v_coupon.id AS coupon_id, 
        v_coupon.discount_type AS discount_type, 
        v_coupon.discount_value AS discount_value, 
        NULL::TEXT AS error_message;
END;
$function$;