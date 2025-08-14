export interface StripeProduct {
  id: string
  priceId: string
  name: string
  description: string
  mode: 'subscription' | 'payment'
  price: number
  currency: string
  interval?: 'month' | 'year'
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SSSZTB95fop71L',
    priceId: 'price_1RXXeSQ1bfh687PeM1cpNJJn',
    name: '無料プラン',
    description: 'タスク作成・管理（月50タスクまで）',
    mode: 'subscription',
    price: 0,
    currency: 'jpy',
    interval: 'month',
  },
  {
    id: 'prod_SSSaeXP7uWeSXo',
    priceId: 'price_1RXXflQ1bfh687PebpvIpq6e',
    name: 'ベーシックプラン',
    description: '無制限のタスク・プロジェクト作成',
    mode: 'subscription',
    price: 500,
    currency: 'jpy',
    interval: 'month',
  },
]

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId)
}

export const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id)
}