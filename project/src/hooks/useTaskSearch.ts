import { useMemo } from 'react';
import { Task } from '../types';
import { SearchFilters } from '../components/common/SearchAndFilter';

export const useTaskSearch = (tasks: Task[], filters: SearchFilters) => {
  return useMemo(() => {
    let filteredTasks = [...tasks];

    // Text search
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (filters.status) {
      filteredTasks = filteredTasks.filter(task => task.status === filters.status);
    }

    // Priority filter
    if (filters.priority !== undefined) {
      filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
    }

    // Assigned to filter
    if (filters.assignedTo) {
      const assignedLower = filters.assignedTo.toLowerCase();
      filteredTasks = filteredTasks.filter(task =>
        task.assignedTo && task.assignedTo.toLowerCase().includes(assignedLower)
      );
    }

    // Deadline filter
    if (filters.hasDeadline !== undefined) {
      filteredTasks = filteredTasks.filter(task => {
        const hasDeadline = !!task.dueDate;
        return hasDeadline === filters.hasDeadline;
      });
    }

    // Date range filter
    if (filters.dateRange) {
      filteredTasks = filteredTasks.filter(task => {
        if (!task.created) return false;
        const taskDate = task.created;
        return taskDate >= filters.dateRange!.start && taskDate <= filters.dateRange!.end;
      });
    }

    return filteredTasks;
  }, [tasks, filters]);
};