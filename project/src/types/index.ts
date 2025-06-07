// Task-related types
export type TaskStatus = 'inbox' | 'next' | 'waiting' | 'scheduled' | 'project' | 'someday' | 'completed' | 'deleted' | 'reference';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  created: Date;
  updated?: Date;
  dueDate?: Date;
  completedDate?: Date;
  assignedTo?: string;
  projectId?: string;
  timeEstimate?: number; // in minutes
  isMultiStep?: boolean;
}

// Project-related types
export interface Project {
  id: string;
  title: string;
  description?: string;
  tasks: string[]; // Array of task IDs
  created: Date;
  updated?: Date;
  completedDate?: Date;
  progress: number; // 0-100
}

// GTD Step types
export type GTDStep = 1 | 2 | 3 | 4 | 5 | 6;
export interface ProcessingState {
  task: Task;
  currentStep: GTDStep;
}