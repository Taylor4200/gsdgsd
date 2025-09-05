-- Step 3: Update the get_or_create_user_profile function
CREATE OR REPLACE FUNCTION get_or_create_user_profile(
  p_user_id UUID,
  p_username TEXT
) RETURNS user_profiles AS $$
DECLARE
  profile user_profiles;
BEGIN
  -- Try to get existing profile
  SELECT * INTO profile FROM user_profiles WHERE user_id = p_user_id;
  
  -- If not found, create one
  IF NOT FOUND THEN
    INSERT INTO user_profiles (user_id, username, is_banned)
    VALUES (p_user_id, p_username, false)
    RETURNING * INTO profile;
  END IF;
  
  RETURN profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
