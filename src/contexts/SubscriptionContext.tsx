@@ .. @@
      } else {
        // Create usage limits for current month if they don't exist
        // Initialize with current project count to handle existing projects
        const { data: projectCount } = await supabase
          .from('projects')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('status', 'active')

        const currentProjectCount = projectCount?.length || 0

-        const { data: newUsageData, error: createError } = await supabase
+        const { error: upsertError } = await supabase
          .from('usage_limits')
-          .insert({
+          .upsert({
             user_id: user.id,
             month_year: currentMonth,
             tasks_created_this_month: 0,
             projects_created_this_month: currentProjectCount, // Set to current project count
-          })
-          .select()
-          .single()
+          }, {
+            onConflict: 'user_id,month_year',
+            ignoreDuplicates: true
+          })

-        if (createError) {
-          // Handle race condition - if another process created the entry, fetch it
-          if (createError.code === '23505') {
-            const { data: existingUsageData, error: fetchError } = await supabase
-              .from('usage_limits')
-              .select('*')
-              .eq('user_id', user.id)
-              .eq('month_year', currentMonth)
-              .single()
-
-            if (fetchError) {
-              console.error('Error fetching existing usage limits:', fetchError)
-            } else {
-              // Update existing usage data with current project count if it's less
-              if (existingUsageData.projects_created_this_month < currentProjectCount) {
-                const { data: updatedUsageData, error: updateError } = await supabase
-                  .from('usage_limits')
-                  .update({
-                    projects_created_this_month: currentProjectCount
-                  })
-                  .eq('id', existingUsageData.id)
-                  .select()
-                  .single()
-
-                if (updateError) {
-                  console.error('Error updating usage limits:', updateError)
-                  setUsageLimits({
-                    ...existingUsageData,
-                    created_at: new Date(existingUsageData.created_at),
-                    updated_at: new Date(existingUsageData.updated_at),
-                  })
-                } else {
-                  setUsageLimits({
-                    ...updatedUsageData,
-                    created_at: new Date(updatedUsageData.created_at),
-                    updated_at: new Date(updatedUsageData.updated_at),
-                  })
-                }
-              } else {
-                finalUsageLimits = {
-                  ...existingUsageData,
-                  created_at: new Date(existingUsageData.created_at),
-                  updated_at: new Date(existingUsageData.updated_at),
-                }
-              }
-            }
-          } else {
-            console.error('Error creating usage limits:', createError)
-          }
-        } else {
-          finalUsageLimits = {
-            ...newUsageData,
-            created_at: new Date(newUsageData.created_at),
-            updated_at: new Date(newUsageData.updated_at),
-          }
+        if (upsertError) {
+          console.error('Error upserting usage limits:', upsertError)
+        }
+
+        // Always fetch the current usage limits after upsert
+        const { data: currentUsageData, error: fetchError } = await supabase
+          .from('usage_limits')
+          .select('*')
+          .eq('user_id', user.id)
+          .eq('month_year', currentMonth)
+          .single()
+
+        if (fetchError) {
+          console.error('Error fetching usage limits after upsert:', fetchError)
+        } else {
+          finalUsageLimits = {
+            ...currentUsageData,
+            created_at: new Date(currentUsageData.created_at),
+            updated_at: new Date(currentUsageData.updated_at),
+          }
         }
       }