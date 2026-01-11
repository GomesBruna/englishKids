-- Create class_category_videos table
CREATE TABLE IF NOT EXISTS public.class_category_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID NOT NULL REFERENCES public.class_categories(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    title TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.class_category_videos ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access"
    ON public.class_category_videos
    FOR SELECT
    TO public
    USING (true);

-- Allow authenticated users to manage videos (if needed, but usually restricted to admins via dashboard)
-- FOR NOW: Keeping it simple with public read.
