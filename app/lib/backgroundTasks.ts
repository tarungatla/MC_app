import { Platform } from 'react-native';

/**
 * Utility for handling background tasks without blocking the UI
 */
export class BackgroundTaskManager {
  private static instance: BackgroundTaskManager;
  private taskQueue: Map<string, () => Promise<void>> = new Map();
  private isProcessing: boolean = false;

  private constructor() {}

  /**
   * Get the singleton instance of BackgroundTaskManager
   */
  public static getInstance(): BackgroundTaskManager {
    if (!BackgroundTaskManager.instance) {
      BackgroundTaskManager.instance = new BackgroundTaskManager();
    }
    return BackgroundTaskManager.instance;
  }

  /**
   * Add a task to the queue with a unique identifier
   * @param taskId Unique identifier for the task
   * @param task Function to execute in the background
   */
  public addTask(taskId: string, task: () => Promise<void>): void {
    this.taskQueue.set(taskId, task);
    this.processNextTask();
  }

  /**
   * Process the next task in the queue
   */
  private async processNextTask(): Promise<void> {
    if (this.isProcessing || this.taskQueue.size === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // Get the first task from the queue
      const [taskId, task] = this.taskQueue.entries().next().value;
      
      // Remove the task from the queue
      this.taskQueue.delete(taskId);
      
      // Execute the task
      await task();
    } catch (error) {
      console.error('Error processing background task:', error);
    } finally {
      this.isProcessing = false;
      
      // Process the next task if there are any left
      if (this.taskQueue.size > 0) {
        // Use setTimeout to prevent stack overflow with many tasks
        setTimeout(() => this.processNextTask(), 0);
      }
    }
  }

  /**
   * Clear all pending tasks
   */
  public clearTasks(): void {
    this.taskQueue.clear();
  }
}

/**
 * Execute a function in the background without blocking the UI
 * @param task Function to execute in the background
 * @returns Promise that resolves when the task is complete
 */
export function runInBackground<T>(task: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    // Use setTimeout to move the task to the next event loop cycle
    setTimeout(async () => {
      try {
        const result = await task();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }, 0);
  });
}

/**
 * Execute a function with a delay to prevent UI blocking
 * @param task Function to execute
 * @param delay Delay in milliseconds (default: 0)
 * @returns Promise that resolves when the task is complete
 */
export function executeWithDelay<T>(task: () => Promise<T>, delay: number = 0): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    setTimeout(async () => {
      try {
        const result = await task();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }, delay);
  });
}

/**
 * Debounce a function to limit how often it can be called
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle a function to limit how often it can be called
 * @param func Function to throttle
 * @param limit Limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  let lastFunc: NodeJS.Timeout;
  let lastRan: number;
  
  return function(...args: Parameters<T>): void {
    if (!inThrottle) {
      func(...args);
      lastRan = Date.now();
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
} 