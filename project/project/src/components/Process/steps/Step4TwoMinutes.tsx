import React, { useState } from 'react';
import { Task } from '../../../types';
import { useProcessContext } from '../../../contexts/ProcessContext';
import { Clock, CheckCircle, HelpCircle } from 'lucide-react';

interface Step4Props {
  task: Task;
}

const Step4TwoMinutes: React.FC<Step4Props> = ({ task }) => {
  const { completeStep } = useProcessContext();
  const [timeEstimate, setTimeEstimate] = useState<number>(5);
  
  const timeOptions = [
    { value: 5, label: '5分' },
    { value: 15, label: '15分' },
    { value: 30, label: '30分' },
    { value: 60, label: '1時間' },
    { value: 120, label: '2時間以上' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 flex items-start">
        <HelpCircle className="text-blue-500 mr-2 mt-0.5 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
        <div>
          <p className="text-xs sm:text-sm text-blue-700">
            2分以内で完了できますか？できる場合は、今すぐ実行しましょう。
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        <button
          onClick={() => completeStep(4, 'yes')}
          className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-3 sm:p-4 text-left flex items-start transition-colors"
        >
          <div className="bg-green-100 p-2 rounded-full mr-3 sm:mr-4 flex-shrink-0">
            <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-gray-800 mb-1 text-sm sm:text-base">はい、今すぐやります</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              2分以内で完了できるので今すぐ実行して完了にします
            </p>
          </div>
        </button>
        
        <button
          onClick={() => completeStep(4, { no: true, timeEstimate })}
          className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-3 sm:p-4 text-left flex items-start transition-colors"
        >
          <div className="bg-blue-100 p-2 rounded-full mr-3 sm:mr-4 flex-shrink-0">
            <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-gray-800 mb-1 text-sm sm:text-base">いいえ、後で行います</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              2分以上かかるので後で実行します
            </p>
          </div>
        </button>
      </div>
      
      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
        <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
          このタスクにはどのくらい時間がかかりますか？
        </h4>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {timeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTimeEstimate(option.value)}
              className={`py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-colors
                ${timeEstimate === option.value
                  ? 'bg-blue-100 text-blue-700 border-blue-200 border'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        
        <div className="mt-3 text-xs text-gray-600">
          <p>
            <strong>ヒント:</strong> 「今すぐやります」を選択すると、タスクは完了済みに移動します。
          </p>
        </div>
      </div>
    </div>
  );
};

export default Step4TwoMinutes;