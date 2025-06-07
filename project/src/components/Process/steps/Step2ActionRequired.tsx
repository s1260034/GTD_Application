import React from 'react';
import { Task } from '../../../types';
import { useProcessContext } from '../../../contexts/ProcessContext';
import { Archive, Trash2, Clock, HelpCircle } from 'lucide-react';

interface Step2Props {
  task: Task;
}

const Step2ActionRequired: React.FC<Step2Props> = ({ task }) => {
  const { completeStep } = useProcessContext();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 flex items-start">
        <HelpCircle className="text-blue-500 mr-2 mt-0.5 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
        <div>
          <p className="text-xs sm:text-sm text-blue-700">
            このアイテムについて行動を起こす必要がありますか？ない場合は、どうするか決めましょう。
          </p>
        </div>
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        <button
          onClick={() => completeStep(2, 'yes')}
          className="w-full bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-3 sm:p-4 text-left flex items-start transition-colors"
        >
          <div className="bg-green-100 p-2 rounded-full mr-3 sm:mr-4 flex-shrink-0">
            <svg className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-gray-800 mb-1 text-sm sm:text-base">はい、行動が必要です</h3>
            <p className="text-xs sm:text-sm text-gray-600">このアイテムについて何かする必要があります</p>
          </div>
        </button>
        
        <div className="border-t border-gray-200 pt-3 sm:pt-4 pb-1 sm:pb-2">
          <h4 className="text-xs sm:text-sm font-medium text-gray-500">行動は必要ありません</h4>
        </div>
        
        <div className="space-y-2 sm:space-y-3">
          <button
            onClick={() => completeStep(2, { no: true, subType: 'reference' })}
            className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-3 sm:p-4 text-left flex items-start transition-colors"
          >
            <div className="bg-gray-100 p-2 rounded-full mr-3 sm:mr-4 flex-shrink-0">
              <Archive className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-gray-800 mb-1 text-sm sm:text-base">参考資料として保管</h3>
              <p className="text-xs sm:text-sm text-gray-600">将来の参考のためにこの情報を保管します</p>
            </div>
          </button>
          
          <button
            onClick={() => completeStep(2, { no: true, subType: 'someday' })}
            className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-3 sm:p-4 text-left flex items-start transition-colors"
          >
            <div className="bg-gray-100 p-2 rounded-full mr-3 sm:mr-4 flex-shrink-0">
              <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-gray-800 mb-1 text-sm sm:text-base">いつか/たぶん</h3>
              <p className="text-xs sm:text-sm text-gray-600">将来的にやりたいかもしれません</p>
            </div>
          </button>
          
          <button
            onClick={() => completeStep(2, { no: true, subType: 'trash' })}
            className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-3 sm:p-4 text-left flex items-start transition-colors"
          >
            <div className="bg-gray-100 p-2 rounded-full mr-3 sm:mr-4 flex-shrink-0">
              <Trash2 className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-gray-800 mb-1 text-sm sm:text-base">削除する</h3>
              <p className="text-xs sm:text-sm text-gray-600">この情報は必要ありません</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step2ActionRequired;