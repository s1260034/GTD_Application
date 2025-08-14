@@ .. @@
 import React, { useState, useEffect } from 'react'
 import { useAuth } from '../../contexts/AuthContext'
 import { useSubscription } from '../../contexts/SubscriptionContext'
 import { supabase } from '../../lib/supabase'
-import { User, Settings, LogOut, ChevronDown, Crown, Zap } from 'lucide-react'
+import { User, Settings, LogOut, ChevronDown, Crown, Zap, Shield } from 'lucide-react'
+import { Link } from 'react-router-dom'

 interface Profile {
   id: string
@@ .. @@
   const { subscription, isPro } = useSubscription()
   const [isOpen, setIsOpen] = useState(false)
   const [profile, setProfile] = useState<Profile | null>(null)
+  const [isAdmin, setIsAdmin] = useState(false)

   useEffect(() => {
     if (user) {
       fetchProfile()
+      checkAdminStatus()
     }
   }, [user])
@@ .. @@
     }
   }

+  const checkAdminStatus = async () => {
+    if (!user) return
+
+    try {
+      const { data, error } = await supabase.rpc('is_admin')
+      if (!error) {
+        setIsAdmin(data)
+      }
+    } catch (error) {
+      console.error('Error checking admin status:', error)
+    }
+  }
+
   const handleSignOut = async () => {
     await signOut()
     setIsOpen(false)
@@ .. @@
             <div className="py-1">
               {!isPro && onUpgrade && (
                 <button
@@ .. @@
                 </button>
               )}
               
+              {isAdmin && (
+                <Link
+                  to="/admin"
+                  onClick={() => setIsOpen(false)}
+                  className="w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 flex items-center"
+                >
+                  <Shield className="w-4 h-4 mr-2" />
+                  管理者パネル
+                </Link>
+              )}
+              
               <button