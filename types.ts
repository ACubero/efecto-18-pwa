
export enum TaskStatus {
  BANK = 'bank',
  PLANNED = 'planned',
  COMPLETED = 'completed',
  DELETED = 'deleted',
}

export interface Category {
  id?: number;
  name: string;
  createdAt: number;
}

export interface Task {
  id?: number;
  title: string;
  categoryId: number;
  status: TaskStatus;
  plannedDate: string | null; // YYYY-MM-DD
  timeSlot: string | null; // "09:00"
  createdAt: number;
}

export interface Reflection {
  id?: number;
  date: string; // YYYY-MM-DD
  text: string;
  createdAt: number;
}

export interface DbExport {
  categories: Category[];
  tasks: Task[];
  reflections: Reflection[];
  exportDate: string;
}

export type ViewState = 'setup' | 'focus' | 'review' | 'settings' | 'method' | 'history';
