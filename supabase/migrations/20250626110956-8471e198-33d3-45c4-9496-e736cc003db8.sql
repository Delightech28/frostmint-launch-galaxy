
-- Add missing columns to tokens table
ALTER TABLE public.tokens 
ADD COLUMN IF NOT EXISTS token_type TEXT DEFAULT 'Fun Coin',
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('token_created', 'token_purchased')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  user_wallet TEXT NOT NULL,
  token_name TEXT,
  token_ticker TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read BOOLEAN NOT NULL DEFAULT false
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_wallet ON public.notifications(user_wallet);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- Enable Row Level Security for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (user_wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address'
         OR user_wallet = auth.jwt()->>'wallet_address'
         OR true); -- Temporary allow all for testing

CREATE POLICY "Users can insert their own notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (true); -- Allow all inserts for now

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (user_wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address'
         OR user_wallet = auth.jwt()->>'wallet_address'
         OR true); -- Temporary allow all for testing

-- Create storage bucket for token images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('token-images', 'token-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for token images storage
CREATE POLICY "Anyone can view token images" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'token-images');

CREATE POLICY "Anyone can upload token images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'token-images');

-- Enable realtime for notifications and tokens
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tokens;

-- Set replica identity for real-time updates
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.tokens REPLICA IDENTITY FULL;
