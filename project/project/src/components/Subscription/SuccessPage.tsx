import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { useSubscription } from '../../contexts/SubscriptionContext'

const SuccessPage: React.FC = () => {
  const navigate = useNavigate()
  const { refreshSubscription } = useSubscription()

  useEffect(() => {
    // Refresh subscription data after successful payment
    refreshSubscription()
  }, [refreshSubscription])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          お支払いが完了しました！
        </h1>
        
        <p className="text-gray-600 mb-6">
          ベーシックプランへのアップグレードが完了しました。
          これで無制限にタスクとプロジェクトを作成できます。
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">新機能が利用可能になりました：</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 無制限のタスク・プロジェクト作成</li>
            <li>• 高度な検索・フィルター機能</li>
            <li>• カスタムタグ・ラベル機能</li>
            <li>• データのエクスポート機能</li>
          </ul>
        </div>
        
        <button
          onClick={() => navigate('/')}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg flex items-center justify-center"
        >
          アプリに戻る
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
        
        <p className="text-xs text-gray-500 mt-4">
          ご利用いただきありがとうございます。
        </p>
      </div>
    </div>
  )
}

export default SuccessPage