import React, { useState } from 'react';
import { Task } from '../../../types';
import { useProcessContext } from '../../../contexts/ProcessContext';
import { User, UserCheck, HelpCircle } from 'lucide-react';

interface Step5Props {
  task: Task;
}

const Step5Delegate: React.FC<Step5Props> = ({ task }) => {
  const { completeStep } = useProcessContext();
  const [person, setPerson] = useState('');
  
  const commonPeople = [
    'チームメンバー',
    'マネージャー',
    'アシスタント',
    '同僚',
    'パートナー',
  ];

  const handleDelegate = () => {
    completeStep(5, { 
      yes: true, 
      person: person.trim() || undefined 
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 flex items-start">
        <HelpCircle className="text-blue-500 mr-2 mt-0.5 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
        <div>
          <p className="text-xs sm:text-sm text-blue-700">
            このタスクを他の人に任せることはできますか？できる場合は、委任して結果を追跡しましょう。
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        <button
          onClick={handleDelegate}
          className="bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg p-3 sm:p-4 text-left flex items-start transition-colors"
        >
          <div className="bg-orange-100 p-2 rounded-full mr-3 sm:mr-4 flex-shrink-0">
            <User className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-gray-800 mb-1 text-sm sm:text-base">はい、委任します</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              他の人に任せることができます
            </p>
          </div>
        </button>
        
        <button
          onClick={() => completeStep(5, 'no')}
          className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-3 sm:p-4 text-left flex items-start transition-colors"
        >
          <div className="bg-blue-100 p-2 rounded-full mr-3 sm:mr-4 flex-shrink-0">
            <UserCheck className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-gray-800 mb-1 text-sm sm:text-base">いいえ、自分で行います</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              自分で対応する必要があります
            </p>
          </div>
        </button>
      </div>
      
      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
        <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
          誰に委任しますか？（任意）
        </h4>
        
        <div className="mb-3 sm:mb-4">
          <input
            type="text"
            value={person}
            onChange={(e) => setPerson(e.target.value)}
            placeholder="名前または役職を入力（後で設定することもできます）"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        
        <div>
          <p className="text-xs text-gray-500 mb-2">よく委任する相手：</p>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {commonPeople.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPerson(p)}
                className={`py-1 px-2 sm:px-3 rounded-md text-xs font-medium transition-colors
                  ${person === p
                    ? 'bg-orange-100 text-orange-700 border-orange-200 border'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mt-3 text-xs text-gray-600">
          <p>
            <strong>ヒント:</strong> 担当者は後から待ち項目リストで設定・変更できます。
          </p>
        </div>
      </div>
    </div>
  );
};

export default Step5Delegate;