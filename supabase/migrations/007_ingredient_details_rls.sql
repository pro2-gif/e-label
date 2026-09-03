-- Enable all operations for authenticated users on ingredient_details table

-- 1. Insert Policy
CREATE POLICY "Allow insert for authenticated users on ingredient_details"
ON public.ingredient_details FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 2. Update Policy
CREATE POLICY "Allow update for authenticated users on ingredient_details"
ON public.ingredient_details FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 3. Delete Policy
CREATE POLICY "Allow delete for authenticated users on ingredient_details"
ON public.ingredient_details FOR DELETE
USING (auth.role() = 'authenticated');
