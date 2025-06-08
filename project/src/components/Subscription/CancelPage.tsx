import React from 'react'
import { useNavigate } from 'react-router-dom'
import { XCircle, ArrowLeft } from 'lucide-react'

const CancelPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          お支払いがキャンセルされました
        </h1>
        
        <p className="text-gray-600 mb-6">
          アップグレードはキャンセルされました。
          引き続き無料プランをご利用いただけます。
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">無料プランでも以下の機能をご利用いただけます：</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 月50タスクまで作成可能</li>
            <li>• 5プロジェクトまで作成可能</li>
            <li>• 基本的な検索・フィルター</li>
            <li>• シンプルなプロジェクト管理</li>
          </ul>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            アプリに戻る
          </button>
          
          <button
            onClick={() => navigate('/pricing')}
            className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            プランを再検討する
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          いつでもアップグレードできます。
        </p>
      </div>
    </div>
  )
}

export default CancelPage