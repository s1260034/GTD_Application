import React from 'react'
import { AlertTriangle, Crown, TrendingUp } from 'lucide-react'
import { useSubscription } from '../../contexts/SubscriptionContext'

interface UsageBannerProps {
  onUpgrade: () => void
}

const UsageBanner: React.FC<UsageBannerProps> = ({ onUpgrade }) => {
  const { usageLimits, planLimits, isPro, canCreateTask, canCreateProject } = useSubscription()

  if (isPro || !usageLimits) return null

  const taskUsagePercentage = (usageLimits.tasks_created_this_month / planLimits.maxTasksPerMonth) * 100
  const projectUsagePercentage = (usageLimits.projects_created_this_month / planLimits.maxProjectsPerMonth) * 100

  const isNearTaskLimit = taskUsagePercentage >= 80
  const isNearProjectLimit = projectUsagePercentage >= 80
  const isAtTaskLimit = !canCreateTask
  const isAtProjectLimit = !canCreateProject

  if (!isNearTaskLimit && !isNearProjectLimit && !isAtTaskLimit && !isAtProjectLimit) {
    return null
  }

  const getAlertLevel = () => {
    if (isAtTaskLimit || isAtProjectLimit) return 'error'
    if (isNearTaskLimit || isNearProjectLimit) return 'warning'
    return 'info'
  }

  const alertLevel = getAlertLevel()

  const getBannerStyles = () => {
    switch (alertLevel) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  const getIcon = () => {
    switch (alertLevel) {
      case 'error':
      case 'warning':
        return <AlertTriangle className="w-5 h-5 flex-shrink-0" />
      default:
        return <TrendingUp className="w-5 h-5 flex-shrink-0" />
    }
  }

  const getMessage = () => {
    if (isAtTaskLimit && isAtProjectLimit) {
      return '今月のタスクとプロジェクトの作成上限に達しました。'
    } else if (isAtTaskLimit) {
      return '今月のタスク作成上限に達しました。'
    } else if (isAtProjectLimit) {
      return '今月のプロジェクト作成上限に達しました。'
    } else if (isNearTaskLimit && isNearProjectLimit) {
      return '今月のタスクとプロジェクトの作成上限に近づいています。'
    } else if (isNearTaskLimit) {
      return '今月のタスク作成上限に近づいています。'
    } else if (isNearProjectLimit) {
      return '今月のプロジェクト作成上限に近づいています。'
    }
    return ''
  }

  return (
    <div className={`border rounded-lg p-4 mb-4 ${getBannerStyles()}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {getIcon()}
          <div className="flex-1">
            <p className="font-medium mb-2">{getMessage()}</p>
            
            <div className="space-y-2 mb-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>タスク作成</span>
                  <span>{usageLimits.tasks_created_this_month} / {planLimits.maxTasksPerMonth}</span>
                </div>
                <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isAtTaskLimit ? 'bg-red-500' : 
                      isNearTaskLimit ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(100, taskUsagePercentage)}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>プロジェクト作成</span>
                  <span>{usageLimits.projects_created_this_month} / {planLimits.maxProjectsPerMonth}</span>
                </div>
                <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isAtProjectLimit ? 'bg-red-500' : 
                      isNearProjectLimit ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(100, projectUsagePercentage)}%` }}
                  />
                </div>
              </div>
            </div>
            
            <p className="text-sm opacity-90">
              Proプランにアップグレードして無制限に利用しましょう。
            </p>
          </div>
        </div>
        
        <button
          onClick={onUpgrade}
          className="ml-4 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 flex-shrink-0"
        >
          <Crown className="w-4 h-4" />
          <span>アップグレード</span>
        </button>
      </div>
    </div>
  )
}

export default UsageBanner