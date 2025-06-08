import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'
import { stripeProducts, getProductByPriceId } from '../stripe-config'

export interface StripeSubscription {
  customer_id: string
  subscription_id?: string
  subscription_status: string
  price_id?: string
  current_period_start?: number
  current_period_end?: number
  cancel_at_period_end?: boolean
  payment_method_brand?: string
  payment_method_last4?: string
}

export interface UsageLimits {
  id: string
  user_id: string
  tasks_created_this_month: number
  projects_created_this_month: number
  month_year: string
  created_at: Date
  updated_at: Date
}

interface PlanLimits {
  maxTasksPerMonth: number
  maxProjectsPerMonth: number
  hasAdvancedSearch: boolean
  hasCustomTags: boolean
  hasDataExport: boolean
  hasMultiDeviceSync: boolean
}

interface SubscriptionContextType {
  subscription: StripeSubscription | null
  usageLimits: UsageLimits | null
  planLimits: PlanLimits
  loading: boolean
  isPro: boolean
  canCreateTask: boolean
  canCreateProject: boolean
  createCheckoutSession: (priceId: string) => Promise<string>
  refreshSubscription: () => Promise<void>
  incrementTaskUsage: () => Promise<void>
  incrementProjectUsage: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    maxTasksPerMonth: 50,
    maxProjectsPerMonth: 5,
    hasAdvancedSearch: false,
    hasCustomTags: false,
    hasDataExport: false,
    hasMultiDeviceSync: false,
  },
  pro: {
    maxTasksPerMonth: Infinity,
    maxProjectsPerMonth: Infinity,
    hasAdvancedSearch: true,
    hasCustomTags: true,
    hasDataExport: true,
    hasMultiDeviceSync: true,
  },
}

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<StripeSubscription | null>(null)
  const [usageLimits, setUsageLimits] = useState<UsageLimits | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Determine plan type based on subscription
  const getPlanType = (): string => {
    if (!subscription || !subscription.price_id) return 'free'
    
    const product = getProductByPriceId(subscription.price_id)
    if (!product) return 'free'
    
    // Check if it's an active subscription
    if (subscription.subscription_status === 'active') {
      return product.name === 'ベーシックプラン' ? 'pro' : 'free'
    }
    
    return 'free'
  }

  const planType = getPlanType()
  const currentPlanLimits = PLAN_LIMITS[planType]
  const isPro = planType === 'pro'

  // For free users, check if they can create more items
  // For pro users, always allow creation
  const canCreateTask = isPro || (usageLimits ? 
    usageLimits.tasks_created_this_month < currentPlanLimits.maxTasksPerMonth : 
    true)

  const canCreateProject = isPro || (usageLimits ? 
    usageLimits.projects_created_this_month < currentPlanLimits.maxProjectsPerMonth : 
    true)

  useEffect(() => {
    if (user) {
      fetchSubscriptionData()
    } else {
      setSubscription(null)
      setUsageLimits(null)
      setLoading(false)
    }
  }, [user])

  const fetchSubscriptionData = async () => {
    if (!user) return

    try {
      // Fetch subscription data using the view
      const { data: subData, error: subError } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle()

      if (subError) {
        console.error('Error fetching subscription:', subError)
      } else if (subData) {
        setSubscription(subData)
      }

      // Fetch usage limits for current month
      const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
      const { data: usageData, error: usageError } = await supabase
        .from('usage_limits')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_year', currentMonth)
        .maybeSingle()

      if (usageError) {
        console.error('Error fetching usage limits:', usageError)
      } else if (usageData) {
        setUsageLimits({
          ...usageData,
          created_at: new Date(usageData.created_at),
          updated_at: new Date(usageData.updated_at),
        })
      } else {
        // Create usage limits for current month if they don't exist
        // Initialize with current project count to handle existing projects
        const { data: projectCount } = await supabase
          .from('projects')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('status', 'active')

        const currentProjectCount = projectCount?.length || 0

        const { data: newUsageData, error: createError } = await supabase
          .from('usage_limits')
          .insert({
            user_id: user.id,
            month_year: currentMonth,
            tasks_created_this_month: 0,
            projects_created_this_month: currentProjectCount, // Set to current project count
          })
          .select()
          .single()

        if (createError) {
          // Handle race condition - if another process created the entry, fetch it
          if (createError.code === '23505') {
            const { data: existingUsageData, error: fetchError } = await supabase
              .from('usage_limits')
              .select('*')
              .eq('user_id', user.id)
              .eq('month_year', currentMonth)
              .single()

            if (fetchError) {
              console.error('Error fetching existing usage limits:', fetchError)
            } else {
              // Update existing usage data with current project count if it's less
              if (existingUsageData.projects_created_this_month < currentProjectCount) {
                const { data: updatedUsageData, error: updateError } = await supabase
                  .from('usage_limits')
                  .update({
                    projects_created_this_month: currentProjectCount
                  })
                  .eq('id', existingUsageData.id)
                  .select()
                  .single()

                if (updateError) {
                  console.error('Error updating usage limits:', updateError)
                  setUsageLimits({
                    ...existingUsageData,
                    created_at: new Date(existingUsageData.created_at),
                    updated_at: new Date(existingUsageData.updated_at),
                  })
                } else {
                  setUsageLimits({
                    ...updatedUsageData,
                    created_at: new Date(updatedUsageData.created_at),
                    updated_at: new Date(updatedUsageData.updated_at),
                  })
                }
              } else {
                setUsageLimits({
                  ...existingUsageData,
                  created_at: new Date(existingUsageData.created_at),
                  updated_at: new Date(existingUsageData.updated_at),
                })
              }
            }
          } else {
            console.error('Error creating usage limits:', createError)
          }
        } else {
          setUsageLimits({
            ...newUsageData,
            created_at: new Date(newUsageData.created_at),
            updated_at: new Date(newUsageData.updated_at),
          })
        }
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error)
    } finally {
      setLoading(false)
    }
  }

  const createCheckoutSession = async (priceId: string): Promise<string> => {
    const { data, error } = await supabase.functions.invoke('stripe-checkout', {
      body: { 
        price_id: priceId,
        mode: 'subscription',
        success_url: `${window.location.origin}/subscription/success`,
        cancel_url: `${window.location.origin}/subscription/cancel`,
      },
    })

    if (error) throw error
    return data.url
  }

  const refreshSubscription = async () => {
    await fetchSubscriptionData()
  }

  const incrementTaskUsage = async () => {
    if (!user || !usageLimits || isPro) return

    const { error } = await supabase
      .from('usage_limits')
      .update({
        tasks_created_this_month: usageLimits.tasks_created_this_month + 1,
      })
      .eq('id', usageLimits.id)

    if (error) throw error

    setUsageLimits(prev => prev ? {
      ...prev,
      tasks_created_this_month: prev.tasks_created_this_month + 1,
    } : null)
  }

  const incrementProjectUsage = async () => {
    if (!user || !usageLimits || isPro) return

    const { error } = await supabase
      .from('usage_limits')
      .update({
        projects_created_this_month: usageLimits.projects_created_this_month + 1,
      })
      .eq('id', usageLimits.id)

    if (error) throw error

    setUsageLimits(prev => prev ? {
      ...prev,
      projects_created_this_month: prev.projects_created_this_month + 1,
    } : null)
  }

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        usageLimits,
        planLimits: currentPlanLimits,
        loading,
        isPro,
        canCreateTask,
        canCreateProject,
        createCheckoutSession,
        refreshSubscription,
        incrementTaskUsage,
        incrementProjectUsage,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = () => {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}