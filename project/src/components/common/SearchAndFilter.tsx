import React, { useState } from 'react';
import { Search, Filter, X, Calendar, User, Flag, Tag } from 'lucide-react';
import { TaskStatus } from '../../types';

export interface SearchFilters {
  searchText: string;
  status?: TaskStatus;
  priority?: number;
  assignedTo?: string;
  hasDeadline?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

interface SearchAndFilterProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  showAdvanced?: boolean;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  filters,
  onFiltersChange,
  showAdvanced = false
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const statusOptions: { value: TaskStatus; label: string }[] = [
    { value: 'inbox', label: 'インボックス' },
    { value: 'next', label: '次のアクション' },
    { value: 'waiting', label: '待ち項目' },
    { value: 'scheduled', label: '予定済み' },
    { value: 'project', label: 'プロジェクト' },
    { value: 'someday', label: 'いつか/たぶん' },
    { value: 'reference', label: '参考資料' },
    { value: 'completed', label: '完了済み' },
    { value: 'deleted', label: '削除済み' },
  ];

  const priorityOptions = [
    { value: 0, label: '優先度なし' },
    { value: 1, label: '低' },
    { value: 2, label: '中' },
    { value: 3, label: '高' },
    { value: 4, label: '緊急' },
    { value: 5, label: '最重要' },
  ];

  const handleSearchChange = (searchText: string) => {
    onFiltersChange({ ...filters, searchText });
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchText: '',
    });
    setShowFilters(false);
  };

  const hasActiveFilters = filters.status || filters.priority !== undefined || 
    filters.assignedTo || filters.hasDeadline !== undefined || filters.dateRange;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      {/* Search Bar */}
      <div className="flex items-center space-x-2 mb-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="タスクを検索..."
            value={filters.searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-md border transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-blue-50 border-blue-300 text-blue-600'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
        </button>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
            title="フィルターをクリア"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-3">
          {filters.status && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              ステータス: {statusOptions.find(s => s.value === filters.status)?.label}
              <button
                onClick={() => handleFilterChange('status', undefined)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.priority !== undefined && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              優先度: {priorityOptions.find(p => p.value === filters.priority)?.label}
              <button
                onClick={() => handleFilterChange('priority', undefined)}
                className="ml-1 text-orange-600 hover:text-orange-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.assignedTo && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              担当者: {filters.assignedTo}
              <button
                onClick={() => handleFilterChange('assignedTo', undefined)}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.hasDeadline !== undefined && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              期限: {filters.hasDeadline ? 'あり' : 'なし'}
              <button
                onClick={() => handleFilterChange('hasDeadline', undefined)}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="border-t border-gray-200 pt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ステータス
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">すべて</option>
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                優先度
              </label>
              <select
                value={filters.priority ?? ''}
                onChange={(e) => handleFilterChange('priority', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">すべて</option>
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Assigned To Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                担当者
              </label>
              <input
                type="text"
                placeholder="担当者名"
                value={filters.assignedTo || ''}
                onChange={(e) => handleFilterChange('assignedTo', e.target.value || undefined)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Deadline Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                期限
              </label>
              <select
                value={filters.hasDeadline === undefined ? '' : filters.hasDeadline.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange('hasDeadline', value === '' ? undefined : value === 'true');
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">すべて</option>
                <option value="true">期限あり</option>
                <option value="false">期限なし</option>
              </select>
            </div>

            {/* Advanced Filters (Pro only) */}
            {showAdvanced && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    開始日
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange?.start?.toISOString().split('T')[0] || ''}
                    onChange={(e) => {
                      const start = e.target.value ? new Date(e.target.value) : undefined;
                      handleFilterChange('dateRange', start ? {
                        start,
                        end: filters.dateRange?.end || new Date()
                      } : undefined);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    終了日
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange?.end?.toISOString().split('T')[0] || ''}
                    onChange={(e) => {
                      const end = e.target.value ? new Date(e.target.value) : undefined;
                      handleFilterChange('dateRange', end ? {
                        start: filters.dateRange?.start || new Date(),
                        end
                      } : undefined);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </>
            )}
          </div>

          {!showAdvanced && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <Tag className="w-4 h-4 inline mr-1" />
                高度な検索・フィルター機能はProプランで利用できます
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;