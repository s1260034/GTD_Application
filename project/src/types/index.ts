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
  priority?: number; // 0-5 (0=none, 1=low, 2=medium, 3=high, 4=urgent, 5=critical)
  energyLevel?: 'low' | 'medium' | 'high';
  context?: string; // @home, @office, @computer, etc.
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
  archivedAt?: Date;
  progress: number; // 0-100
}

// GTD Step types
export type GTDStep = 1 | 2 | 3 | 4 | 5 | 6;
export interface ProcessingState {
  task: Task;
  currentStep: GTDStep;
}