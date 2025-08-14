@@ .. @@
 import { createClient } from '@supabase/supabase-js'

 const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
 const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

-if (!supabaseUrl || !supabaseAnonKey) {
-  throw new Error('Missing Supabase environment variables')
+if (!supabaseUrl || !supabaseAnonKey || 
+    supabaseUrl === 'your_supabase_project_url' || 
+    supabaseAnonKey === 'your_supabase_anon_key') {
+  console.error('Supabase configuration:', { supabaseUrl, supabaseAnonKey })
+  throw new Error('Supabase environment variables are not properly configured. Please connect to Supabase using the "Connect to Supabase" button.')
 }

 export const supabase = createClient(supabaseUrl, supabaseAnonKey)