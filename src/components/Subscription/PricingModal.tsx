import React, { useState } from 'react'
import { X, Check, Zap, Crown, Loader2 } from 'lucide-react'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { stripeProducts } from '../../stripe-config'

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false)
  const { createCheckoutSession, isPro } = useSubscription()

  if (!isOpen) return null

  const freeProduct = stripeProducts.find(p => p.name === '無料プラン')
  const proProduct = stripeProducts.find(p => p.name === 'ベーシックプラン')

  const handleUpgrade = async () => {
    if (!proProduct) return
    
    setLoading(true)
    try {
      const checkoutUrl = await createCheckoutSession(proProduct.priceId)
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('エラーが発生しました。しばらく時間をおいてから再度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  const features = {
    free: [
      '月50タスクまで作成可能',
      '5プロジェクトまで作成可能',
      '基本的な検索・フィルター',
      'タスク名の変更機能',
    ],
    pro: [
      '無制限のタスク・プロジェクト作成',
      '高度な検索・フィルター機能',
      'カスタムタグ・ラベル機能',
      '複数デバイス間の同期',
      'データのエクスポート機能',
      '優先サポート',
    ],
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">プランを選択</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-8">
            <h3 className="text-lg text-gray-600 mb-2">
              あなたの生産性を次のレベルへ
            </h3>
            <p className="text-gray-500">
              Focus Flowで、より効率的なタスク管理を始めましょう
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Free Plan */}
            <div className="border border-gray-200 rounded-xl p-6 relative">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-gray-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">{freeProduct?.name}</h4>
                <div className="text-3xl font-bold text-gray-800 mb-1">¥{freeProduct?.price}</div>
                <p className="text-gray-500">永続無料</p>
              </div>

              <ul className="space-y-3 mb-6">
                {features.free.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled
                className="w-full py-3 px-4 bg-gray-100 text-gray-500 rounded-lg font-medium cursor-not-allowed"
              >
                現在のプラン
              </button>
            </div>

            {/* Pro Plan */}
            <div className="border-2 border-blue-500 rounded-xl p-6 relative bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  おすすめ
                </span>
              </div>

              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">{proProduct?.name}</h4>
                <div className="text-3xl font-bold text-gray-800 mb-1">¥{proProduct?.price}</div>
                <p className="text-gray-500">月額（税込）</p>
              </div>

              <ul className="space-y-3 mb-6">
                {features.pro.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {isPro ? (
                <button
                  disabled
                  className="w-full py-3 px-4 bg-green-100 text-green-700 rounded-lg font-medium cursor-not-allowed flex items-center justify-center"
                >
                  <Check className="w-5 h-5 mr-2" />
                  現在のプラン
                </button>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      処理中...
                    </>
                  ) : (
                    'ベーシックプランにアップグレード'
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              • いつでもキャンセル可能 • 30日間返金保証 • 安全な決済処理
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingModal