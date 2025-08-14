import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { supabase } from '../../lib/supabase'
import { User, Settings, LogOut, ChevronDown, Crown, Zap, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Link } from 'react-router-dom'

interface Profile {
  id: string
  email: string
  full_name?: string
  full_name?: string
  avatar_url?: string
}

interface UserMenuProps {
  onUpgrade?: () => void
}

export default function UserMenu({ onUpgrade }: UserMenuProps) {
  const { user, signOut } = useAuth()
  const { subscription, isPro } = useSubscription()
  const [isOpen, setIsOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (user) {
      fetchProfile()
      checkAdminStatus()
      checkAdminStatus()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const checkAdminStatus = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.rpc('is_admin')
      if (!error) {
        setIsAdmin(data)
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const checkAdminStatus = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.rpc('is_admin')
      if (!error) {
        setIsAdmin(data)
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
            <div className="px-4 py-2 border-b">
                {profile?.full_name || user.email}
                    setIsOpen(false)
              </div>
                  className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center"
            </div>
                  <Zap className="w-4 h-4 mr-2" />
                  Proにアップグレード
          
          <div className="py-1">
            {!isPro && onUpgrade && (
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 flex items-center"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  管理者パネル
                </Link>
              )}
              
              <button
                onClick={() => {
                  onUpgrade()
                  setIsOpen(false)
                }}
                className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center"
              >
                <Zap className="w-4 h-4 mr-2" />
                Proにアップグレード
              </button>
            )}
            
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <Shield className="w-4 h-4 mr-2" />
                管理者パネル
              </Link>
            )}
            
            <button
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <Settings className="w-4 h-4 mr-2" />
              設定
            </button>
            
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
            >
                ログアウト
              ログアウト
            </button>
          </div>
        </div>
      )}
    </div>
  )
}