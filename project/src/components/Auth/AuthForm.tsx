import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Eye, EyeOff, Mail, Lock, User, Target, AlertCircle } from 'lucide-react'

type AuthMode = 'signin' | 'signup' | 'reset'

const AuthForm: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const { signIn, signUp, resetPassword } = useAuth()

  const getErrorMessage = (error: any): string => {
    const errorMessage = error?.message || ''
    
    // Handle specific Supabase error codes
    if (errorMessage.includes('Invalid login credentials') || errorMessage.includes('invalid_credentials')) {
      return 'メールアドレスまたはパスワードが正しくありません。'
    }
    
    if (errorMessage.includes('User already registered')) {
      return 'このメールアドレスは既に登録されています。サインインをお試しください。'
    }
    
    if (errorMessage.includes('Password should be at least')) {
      return 'パスワードは6文字以上で入力してください。'
    }
    
    if (errorMessage.includes('Invalid email')) {
      return '有効なメールアドレスを入力してください。'
    }
    
    if (errorMessage.includes('Email not confirmed')) {
      return 'メールアドレスの確認が完了していません。確認メールをご確認ください。'
    }
    
    if (errorMessage.includes('Too many requests')) {
      return 'リクエストが多すぎます。しばらく時間をおいてから再度お試しください。'
    }
    
    // Default error message
    return errorMessage || 'エラーが発生しました。しばらく時間をおいてから再度お試しください。'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) throw error
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password, displayName)
        if (error) throw error
        setMessage('確認メールを送信しました。メールをご確認ください。')
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email)
        if (error) throw error
        setMessage('パスワードリセットメールを送信しました。')
      }
    } catch (error: any) {
      setError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const getTitle = () => {
    switch (mode) {
      case 'signin':
        return 'サインイン'
      case 'signup':
        return 'アカウント作成'
      case 'reset':
        return 'パスワードリセット'
    }
  }

  const getButtonText = () => {
    if (loading) return '処理中...'
    switch (mode) {
      case 'signin':
        return 'サインイン'
      case 'signup':
        return 'アカウント作成'
      case 'reset':
        return 'リセットメール送信'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ロゴとタイトル */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Focus Flow
          </h1>
          <p className="text-gray-600 mt-2">Mind Like Water</p>
        </div>

        {/* フォーム */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {getTitle()}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-700">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-sm">{error}</span>
                {error.includes('メールアドレスまたはパスワードが正しくありません') && (
                  <div className="mt-2 text-xs text-red-600">
                    <p>• メールアドレスとパスワードをご確認ください</p>
                    <p>• パスワードを忘れた場合は「パスワードを忘れた方」をクリックしてください</p>
                  </div>
                )}
                {error.includes('このメールアドレスは既に登録されています') && (
                  <div className="mt-2">
                    <button
                      onClick={() => setMode('signin')}
                      className="text-xs text-red-600 underline hover:text-red-700"
                    >
                      サインインページに移動
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <span className="text-sm">{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label htmlFor="displayName\" className="block text-sm font-medium text-gray-700 mb-1">
                  表示名
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="田中太郎"
                    required={mode === 'signup'}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  パスワード
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <p className="text-xs text-gray-500 mt-1">6文字以上で入力してください</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {getButtonText()}
            </button>
          </form>

          {/* フォーム切り替え */}
          <div className="mt-6 text-center space-y-2">
            {mode === 'signin' && (
              <>
                <button
                  onClick={() => setMode('reset')}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  パスワードを忘れた方
                </button>
                <div className="text-sm text-gray-600">
                  アカウントをお持ちでない方は{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    こちら
                  </button>
                </div>
              </>
            )}

            {mode === 'signup' && (
              <div className="text-sm text-gray-600">
                すでにアカウントをお持ちの方は{' '}
                <button
                  onClick={() => setMode('signin')}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  サインイン
                </button>
              </div>
            )}

            {mode === 'reset' && (
              <button
                onClick={() => setMode('signin')}
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                サインインに戻る
              </button>
            )}
          </div>
        </div>

        {/* フッター */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 Focus Flow. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default AuthForm