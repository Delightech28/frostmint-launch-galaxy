
-- Remove unnecessary tables
DROP TABLE IF EXISTS public.checkin_history CASCADE;
DROP TABLE IF EXISTS public.daily_checkins CASCADE;
DROP TABLE IF EXISTS public.user_posts CASCADE;
DROP TABLE IF EXISTS public.x_accounts CASCADE;

-- Drop the functions that are no longer needed
DROP FUNCTION IF EXISTS public.has_x_account(text);
DROP FUNCTION IF EXISTS public.calculate_checkin_reward(integer);
DROP FUNCTION IF EXISTS public.process_daily_checkin(text);

-- Create tokens table to prevent duplicate names and tickers
CREATE TABLE public.tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  ticker TEXT NOT NULL,
  contract_address TEXT NOT NULL,
  creator_wallet TEXT NOT NULL,
  initial_supply BIGINT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraints to prevent duplicates
ALTER TABLE public.tokens ADD CONSTRAINT unique_token_name UNIQUE (name);
ALTER TABLE public.tokens ADD CONSTRAINT unique_token_ticker UNIQUE (ticker);
ALTER TABLE public.tokens ADD CONSTRAINT unique_contract_address UNIQUE (contract_address);

-- Add Row Level Security (make tokens publicly readable but only creators can insert)
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read tokens (for exploration/discovery)
CREATE POLICY "Anyone can view tokens" 
  ON public.tokens 
  FOR SELECT 
  USING (true);

-- Allow anyone to create tokens (since we're using wallet addresses, not auth users)
CREATE POLICY "Anyone can create tokens" 
  ON public.tokens 
  FOR INSERT 
  WITH CHECK (true);
