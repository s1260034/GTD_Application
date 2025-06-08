import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { supabase } from '../../lib/supabase'
import { User, Settings, LogOut, ChevronDown, Crown, Zap } from 'lucide-react'

interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
}

interface UserMenuProps {
  onUpgrade?: () => void
}

const UserMenu: React.FC<UserMenuProps> = ({ onUpgrade }) => {
  const { user, signOut } = useAuth()
  const { subscription, isPro } = useSubscription()
  const [isOpen, setIsOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .eq('id', user.id)
      .single()

    if (data && !error) {
      setProfile(data)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
  }

  if (!user) return null

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'ユーザー'
  const avatarUrl = profile?.avatar_url

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center relative">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-white" />
          )}
          {isPro && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
              <Crown className="w-2.5 h-2.5 text-yellow-800" />
            </div>
          )}
        </div>
        <span className="text-sm font-medium text-gray-700 hidden sm:block">{displayName}</span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center relative">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                  {isPro && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Crown className="w-3 h-3 text-yellow-800" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  <div className="flex items-center mt-1">
                    {isPro ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Crown className="w-3 h-3 mr-1" />
                        Pro
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <Zap className="w-3 h-3 mr-1" />
                        無料
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="py-1">
              {!isPro && onUpgrade && (
                <button
                  onClick={() => {
                    setIsOpen(false)
                    onUpgrade()
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Proプランにアップグレード
                </button>
              )}
              
              <button
                onClick={() => {
                  setIsOpen(false)
                  // TODO: プロファイル設定画面を開く
                }}
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
                サインアウト
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default UserMenu