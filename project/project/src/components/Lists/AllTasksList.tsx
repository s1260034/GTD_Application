import React, { useState } from 'react';
import { useTaskContext } from '../../contexts/TaskContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useTaskSearch } from '../../hooks/useTaskSearch';
import TaskItem from '../common/TaskItem';
import SearchAndFilter, { SearchFilters } from '../common/SearchAndFilter';
import { Search, Clock } from 'lucide-react';

const AllTasksList: React.FC = () => {
  const { tasks } = useTaskContext();
  const { isPro } = useSubscription();
  const [filters, setFilters] = useState<SearchFilters>({
    searchText: '',
  });

  // Exclude deleted tasks from search
  const searchableTasks = tasks.filter(task => task.status !== 'deleted');
  const filteredTasks = useTaskSearch(searchableTasks, filters);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <Search className="w-6 h-6 mr-2 text-blue-500" />
          タスク検索
        </h1>
        <p className="text-gray-600">
          すべてのタスクを検索・フィルターできます
        </p>
      </div>
      
      <SearchAndFilter
        filters={filters}
        onFiltersChange={setFilters}
        showAdvanced={isPro}
      />
      
      {filteredTasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-lg">
          <Clock className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            {filters.searchText || Object.keys(filters).some(key => key !== 'searchText' && filters[key as keyof SearchFilters])
              ? '検索結果が見つかりません'
              : 'タスクがありません'
            }
          </h3>
          <p className="text-gray-500 max-w-md">
            {filters.searchText || Object.keys(filters).some(key => key !== 'searchText' && filters[key as keyof SearchFilters])
              ? '検索条件を変更してみてください。'
              : 'タスクを作成すると、ここに表示されます。'
            }
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            検索結果 ({filteredTasks.length})
          </h2>
          <div className="space-y-3">
            {filteredTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllTasksList;