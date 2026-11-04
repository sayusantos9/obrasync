-- The trigger must inspect the caller, not its definer.
alter function public.protect_profile_access_fields() security invoker;
