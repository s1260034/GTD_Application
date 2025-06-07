import React, { useState } from 'react';
import { Task } from '../../../types';
import { useProcessContext } from '../../../contexts/ProcessContext';
import { Calendar, ListChecks, HelpCircle } from 'lucide-react';

interface Step6Props {
  task: Task;
}

const Step6Schedule: React.FC<Step6Props> = ({ task }) => {
  const { completeStep } = useProcessContext();
  const [date, setDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };

  const handleSchedule = () => {
    completeStep(6, { 
      yes: true, 
      date: new Date(date) 
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 flex items-start">
        <HelpCircle className="text-blue-500 mr-2 mt-0.5 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
        <div>
          <p className="text-xs sm:text-sm text-blue-700">
            特定の日に実行する必要がありますか？ある場合は、スケジュールを設定しましょう。
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        <button
          onClick={handleSchedule}
          className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-3 sm:p-4 text-left flex items-start transition-colors"
        >
          <div className="bg-purple-100 p-2 rounded-full mr-3 sm:mr-4 flex-shrink-0">
            <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-gray-800 mb-1 text-sm sm:text-base">はい、スケジュールを設定</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              特定の日に実行する必要があります
            </p>
          </div>
        </button>
        
        <button
          onClick={() => completeStep(6, 'no')}
          className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-3 sm:p-4 text-left flex items-start transition-colors"
        >
          <div className="bg-blue-100 p-2 rounded-full mr-3 sm:mr-4 flex-shrink-0">
            <ListChecks className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-gray-800 mb-1 text-sm sm:text-base">いいえ、次のアクションリストへ</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              できるだけ早く実行します
            </p>
          </div>
        </button>
      </div>
      
      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
        <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
          いつ実行する必要がありますか？
        </h4>
        
        <input
          type="date"
          value={date}
          onChange={handleDateChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
        
        <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
          <p>
            <strong>ヒント:</strong> 特定の日に実行する必要があるタスクのみをスケジュールしてください。
            それ以外は次のアクションリストに追加しましょう。
          </p>
        </div>
      </div>
    </div>
  );
};

export default Step6Schedule;