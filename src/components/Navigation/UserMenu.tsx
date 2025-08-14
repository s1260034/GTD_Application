import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { supabase } from '../../lib/supabase'
import { User, Settings, LogOut, ChevronDown, Crown, Zap, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Profile {
  id: string
  email: string
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

  useEffect(() => {
    if (user) {
      fetchProfile()
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
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
  }

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-900">
            {profile?.full_name || user.email}
          </div>
          <div className="text-xs text-gray-500 flex items-center">
            {isPro ? (
              <>
                <Crown className="w-3 h-3 mr-1 text-yellow-500" />
                Pro
              </>
            ) : (
              'Free'
            )}
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
          <div className="px-4 py-2 border-b">
            <div className="text-sm font-medium text-gray-900">
              {profile?.full_name || user.email}
            </div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
          
          <div className="py-1">
            {!isPro && onUpgrade && (
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
                className="w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 flex items-center"
              >
                <Shield className="w-4 h-4 mr-2" />
                管理者パネル
              </Link>
            )}
            
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <Settings className="w-4 h-4 mr-2" />
              設定
            </button>
            
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              ログアウト
            </button>
          </div>
        </div>
      )}
    </div>
  )
}