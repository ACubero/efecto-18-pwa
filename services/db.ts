
import { Category, Task, TaskStatus, DbExport, Reflection } from '../types';

const DB_NAME = 'Effect18DB';
const DB_VERSION = 2; // Incremented for reflections store

export class DBService {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.openDB();
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
          taskStore.createIndex('status', 'status', { unique: false });
          taskStore.createIndex('plannedDate', 'plannedDate', { unique: false });
        }

        if (!db.objectStoreNames.contains('reflections')) {
          const refStore = db.createObjectStore('reflections', { keyPath: 'id', autoIncrement: true });
          refStore.createIndex('date', 'date', { unique: true });
        }
      };

      request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
      request.onerror = (event) => reject((event.target as IDBOpenDBRequest).error);
    });
  }

  // --- Categories ---

  async getCategories(): Promise<Category[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('categories', 'readonly');
      const store = transaction.objectStore('categories');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveCategory(category: Category): Promise<number> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('categories', 'readwrite');
      const store = transaction.objectStore('categories');
      const request = store.put(category);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  // --- Tasks ---

  async getTasksByDate(date: string): Promise<Task[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('tasks', 'readonly');
      const store = transaction.objectStore('tasks');
      const request = store.getAll();
      request.onsuccess = () => {
        const allTasks = request.result as Task[];
        const relevantTasks = allTasks.filter(t => 
          (t.status === TaskStatus.PLANNED && t.plannedDate === date) ||
          (t.status === TaskStatus.COMPLETED && t.plannedDate === date) || 
          t.status === TaskStatus.BANK
        );
        resolve(relevantTasks);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllTasks(): Promise<Task[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('tasks', 'readonly');
      const store = transaction.objectStore('tasks');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveTask(task: Task): Promise<number> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('tasks', 'readwrite');
      const store = transaction.objectStore('tasks');
      const request = store.put(task);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  // --- Reflections ---

  async saveReflection(reflection: Reflection): Promise<number> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('reflections', 'readwrite');
      const store = transaction.objectStore('reflections');
      
      // Check if exists for date (simple override logic since index is unique)
      const index = store.index('date');
      const checkReq = index.getKey(reflection.date);
      
      checkReq.onsuccess = () => {
        if (checkReq.result) {
            reflection.id = checkReq.result as number;
        }
        const request = store.put(reflection);
        request.onsuccess = () => resolve(request.result as number);
        request.onerror = () => reject(request.error);
      };
    });
  }

  async getReflections(): Promise<Reflection[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('reflections', 'readonly');
        const store = transaction.objectStore('reflections');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result.sort((a,b) => b.createdAt - a.createdAt));
        request.onerror = () => reject(request.error);
    });
  }

  // --- Backup/Restore ---

  async exportData(): Promise<DbExport> {
    const categories = await this.getCategories();
    const tasks = await this.getAllTasks();
    const reflections = await this.getReflections();
    return {
      categories,
      tasks,
      reflections,
      exportDate: new Date().toISOString(),
    };
  }

  async restoreData(data: DbExport): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['categories', 'tasks', 'reflections'], 'readwrite');
      
      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();

      const catStore = transaction.objectStore('categories');
      const taskStore = transaction.objectStore('tasks');
      const refStore = transaction.objectStore('reflections');

      catStore.clear();
      taskStore.clear();
      refStore.clear();

      data.categories.forEach(c => catStore.add(c));
      data.tasks.forEach(t => taskStore.add(t));
      if (data.reflections) {
        data.reflections.forEach(r => refStore.add(r));
      }
    });
  }
}

export const dbService = new DBService();
