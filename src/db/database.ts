import { getDateString } from '@/utils/dateUtils';
import * as SQLite from 'expo-sqlite';

// Mở database đồng bộ với optimization flags
const db = SQLite.openDatabaseSync('todolist.db');

// Connection pool simulation for better performance
class DatabaseConnection {
  private static instance: DatabaseConnection;
  private connection: any;
  private isInitialized = false;

  private constructor() {
    this.connection = db;
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Enable WAL mode for better concurrency
      this.connection.execSync('PRAGMA journal_mode = WAL;');
      this.connection.execSync('PRAGMA synchronous = NORMAL;');
      this.connection.execSync('PRAGMA cache_size = 1000;');
      this.connection.execSync('PRAGMA temp_store = memory;');

      this.isInitialized = true;
      console.log('✅ Database optimized for performance');
    } catch (error) {
      console.error('❌ Database initialization error:', error);
      throw error;
    }
  }

  public getConnection() {
    if (!this.isInitialized) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.connection;
  }
}

// Optimized date utilities with caching
const dateCache = new Map<string, Date>();
const formatCache = new Map<string, string>();

/**
 * Helper function to parse habit date with caching
 */
export const parseHabitDate = (dateString: string): Date => {
  const cached = dateCache.get(dateString);
  if (cached) return cached;

  try {
    let parsedDate: Date;
    // Try to parse as YYYY-MM-DD format first (new format)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-').map(Number);
      parsedDate = new Date(year, month - 1, day);
    } else {
      // Fallback to standard Date parsing for other formats
      parsedDate = new Date(dateString);
    }

    dateCache.set(dateString, parsedDate);
    return parsedDate;
  } catch (error) {
    console.warn('Error parsing date:', dateString, error);
    const fallback = new Date();
    dateCache.set(dateString, fallback);
    return fallback;
  }
};

/**
 * Check if a date string is in the completed dates array with caching
 */
export const isDateInCompletedDates = (completedDates: string[], targetDate: string): boolean => {
  const cacheKey = `${JSON.stringify(completedDates)}_${targetDate}`;
  const cached = formatCache.get(cacheKey);
  if (cached !== undefined) return cached === 'true';

  try {
    // Normalize date strings to YYYY-MM-DD format for comparison
    const normalizedTarget = targetDate.match(/^\d{4}-\d{2}-\d{2}$/)
      ? targetDate
      : getDateString(parseHabitDate(targetDate));

    const result = completedDates.includes(normalizedTarget);
    formatCache.set(cacheKey, result ? 'true' : 'false');
    return result;
  } catch (error) {
    console.warn('Error checking habit completion:', error);
    return false;
  }
};

// ==========================
// 🏗️ Khởi tạo Database với optimization
// ==========================
export const initDatabase = (): void => {
  try {
    const dbConnection = DatabaseConnection.getInstance();
    dbConnection.init();

    db.withTransactionSync(() => {
      // Create tasks table with optimized indexes
      db.execSync(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          deadline TEXT,
          priority TEXT,
          completed INTEGER DEFAULT 0,
          reminder TEXT,
          color TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
        CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
        CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
      `);

      // Create events table with optimized indexes
      db.execSync(`
        CREATE TABLE IF NOT EXISTS events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          start_time TEXT,
          end_time TEXT,
          description TEXT,
          completed INTEGER DEFAULT 0,
          reminder TEXT,
          color TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
        CREATE INDEX IF NOT EXISTS idx_events_completed ON events(completed);
      `);

      // Create habits table with optimized indexes
      db.execSync(`
        CREATE TABLE IF NOT EXISTS habits (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          frequency TEXT NOT NULL,
          target_count INTEGER NOT NULL,
          current_count INTEGER DEFAULT 0,
          color TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          completed INTEGER DEFAULT 0,
          start_date TEXT,
          end_date TEXT,
          reminder TEXT,
          completed_dates TEXT,
          allow_multiple_per_day INTEGER DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_habits_created_at ON habits(created_at);
        CREATE INDEX IF NOT EXISTS idx_habits_completed ON habits(completed);
        CREATE INDEX IF NOT EXISTS idx_habits_start_date ON habits(start_date);
      `);

      // Add new columns if they don't exist (optimized)
      addColumnIfNotExists('tasks', 'reminder', 'TEXT');
      addColumnIfNotExists('tasks', 'color', 'TEXT');
      addColumnIfNotExists('events', 'reminder', 'TEXT');
      addColumnIfNotExists('events', 'color', 'TEXT');
      addColumnIfNotExists('habits', 'start_date', 'TEXT');
      addColumnIfNotExists('habits', 'end_date', 'TEXT');
      addColumnIfNotExists('habits', 'reminder', 'TEXT');
      addColumnIfNotExists('habits', 'completed_dates', 'TEXT');
      addColumnIfNotExists('habits', 'allow_multiple_per_day', 'INTEGER DEFAULT 0');
    });

    if (!(global as any).dbInitialized) {
      console.log('✅ Database initialized successfully with optimizations');
      (global as any).dbInitialized = true;
    }
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
};

// Helper function to add columns safely
const addColumnIfNotExists = (table: string, column: string, type: string): void => {
  try {
    db.execSync(`ALTER TABLE ${table} ADD COLUMN ${column} ${type};`);
  } catch {
    // Column might already exist, ignore error
  }
};

// Batch operations for better performance
export class BatchOperations {
  private static batchSize = 100;

  public static async batchInsertTasks(tasks: Array<{
    title: string;
    description: string;
    deadline: string;
    priority: string;
    reminder?: string;
    color?: string;
  }>): Promise<void> {
    for (let i = 0; i < tasks.length; i += this.batchSize) {
      const batch = tasks.slice(i, i + this.batchSize);

      db.withTransactionSync(() => {
        const stmt = db.prepareSync(
          'INSERT INTO tasks (title, description, deadline, priority, reminder, color, completed) VALUES (?, ?, ?, ?, ?, ?, 0);'
        );

        try {
          for (const task of batch) {
            stmt.executeAsync([
              task.title,
              task.description,
              task.deadline,
              task.priority,
              task.reminder || null,
              task.color || null
            ]);
          }
        } finally {
          stmt.finalizeSync();
        }
      });
    }
  }

  public static async batchUpdateTasks(updates: Array<{
    id: number;
    title?: string;
    description?: string;
    deadline?: string;
    priority?: string;
    completed?: boolean;
    reminder?: string;
  }>): Promise<void> {
    for (let i = 0; i < updates.length; i += this.batchSize) {
      const batch = updates.slice(i, i + this.batchSize);

      db.withTransactionSync(() => {
        const stmt = db.prepareSync(
          'UPDATE tasks SET title = ?, description = ?, deadline = ?, priority = ?, completed = ?, reminder = ? WHERE id = ?;'
        );

        try {
          for (const update of batch) {
            stmt.executeAsync([
              update.title || '',
              update.description || '',
              update.deadline || '',
              update.priority || 'Medium',
              update.completed ? 1 : 0,
              update.reminder || null,
              update.id
            ]);
          }
        } finally {
          stmt.finalizeSync();
        }
      });
    }
  }
}

// Optimized query functions with pagination
export const getTasksPaginated = (page: number = 1, pageSize: number = 20, filter?: {
  completed?: boolean;
  priority?: string;
  deadline?: string;
}): any[] => {
  try {
    const offset = (page - 1) * pageSize;
    let query = 'SELECT * FROM tasks';
    const params: any[] = [];
    const conditions: string[] = [];

    if (filter) {
      if (filter.completed !== undefined) {
        conditions.push('completed = ?');
        params.push(filter.completed ? 1 : 0);
      }
      if (filter.priority) {
        conditions.push('priority = ?');
        params.push(filter.priority);
      }
      if (filter.deadline) {
        conditions.push('deadline = ?');
        params.push(filter.deadline);
      }
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY deadline ASC, priority DESC LIMIT ? OFFSET ?';
    params.push(pageSize, offset);

    const result = db.getAllSync(query, params);
    return result;
  } catch (error) {
    console.error('❌ Error fetching paginated tasks:', error);
    throw error;
  }
};

// ==========================
// 📋 TASK FUNCTIONS với optimization
// ==========================
export const addTask = (title: string, description: string, deadline: string, priority: string, reminder?: string, color?: string): number => {
  try {
    const result = db.runSync(
      `INSERT INTO tasks (title, description, deadline, priority, reminder, color, completed) VALUES (?, ?, ?, ?, ?, ?, 0);`,
      [title, description, deadline, priority, reminder || null, color || null]
    );
    console.log('✅ Task added successfully');
    return result.lastInsertRowId as number;
  } catch (error) {
    console.error('❌ Error adding task:', error);
    throw error;
  }
};

export const getTasks = (): any[] => {
  try {
    const result = db.getAllSync(`SELECT * FROM tasks ORDER BY id DESC;`);
    return result;
  } catch (error) {
    console.error('❌ Error fetching tasks:', error);
    throw error;
  }
};

export const updateTask = (
  id: number,
  title: string,
  description: string,
  deadline: string,
  priority: string,
  completed: boolean,
  reminder?: string,
  color?: string
): void => {
  try {
    db.runSync(
      `UPDATE tasks SET title = ?, description = ?, deadline = ?, priority = ?, completed = ?, reminder = ?, color = ? WHERE id = ?;`,
      [title, description, deadline, priority, completed ? 1 : 0, reminder || null, color || null, id]
    );
    console.log(`✅ Task ${id} updated`);
  } catch (error) {
    console.error('❌ Error updating task:', error);
    throw error;
  }
};

export const deleteTask = (id: number): void => {
  try {
    db.runSync(`DELETE FROM tasks WHERE id = ?;`, [id]);
    console.log(`🗑️ Task ${id} deleted`);
  } catch (error) {
    console.error('❌ Error deleting task:', error);
    throw error;
  }
};

// ==========================
// 📅 EVENT FUNCTIONS
// ==========================
export const addEvent = (title: string, startTime: string, endTime: string, description: string, reminder?: string, color?: string): number => {
  try {
    const result = db.runSync(
      `INSERT INTO events (title, start_time, end_time, description, reminder, color) VALUES (?, ?, ?, ?, ?, ?);`,
      [title, startTime, endTime, description, reminder || null, color || null]
    );
    console.log('✅ Event added');
    return result.lastInsertRowId as number;
  } catch (error) {
    console.error('❌ Error adding event:', error);
    throw error;
  }
};

export const getEvents = (): any[] => {
  try {
    const result = db.getAllSync(`SELECT * FROM events ORDER BY id DESC;`);
    return result;
  } catch (error) {
    console.error('❌ Error fetching events:', error);
    throw error;
  }
};

export const updateEvent = (
  id: number,
  title: string,
  startTime: string,
  endTime: string,
  description: string,
  completed?: boolean,
  reminder?: string,
  color?: string
): void => {
  try {
    const params = completed !== undefined
      ? [title, startTime, endTime, description, completed ? 1 : 0, reminder || null, color || null, id]
      : [title, startTime, endTime, description, reminder || null, color || null, id];

    const query = completed !== undefined
      ? `UPDATE events SET title = ?, start_time = ?, end_time = ?, description = ?, completed = ?, reminder = ?, color = ? WHERE id = ?;`
      : `UPDATE events SET title = ?, start_time = ?, end_time = ?, description = ?, reminder = ?, color = ? WHERE id = ?;`;

    db.runSync(query, params);
    console.log(`✅ Event ${id} updated`);
  } catch (error) {
    console.error('❌ Error updating event:', error);
    throw error;
  }
};

export const deleteEvent = (id: number): void => {
  try {
    db.runSync(`DELETE FROM events WHERE id = ?;`, [id]);
    console.log(`🗑️ Event ${id} deleted`);
  } catch (error) {
    console.error('❌ Error deleting event:', error);
    throw error;
  }
};

// ==========================
// 🏃 HABITS FUNCTIONS
// ==========================
export const addHabit = (title: string, description: string, frequency: string, targetCount: number, color?: string, startDate?: string, endDate?: string, reminder?: string, allowMultiplePerDay?: boolean): number => {
  try {
    const result = db.runSync(
      `INSERT INTO habits (title, description, frequency, target_count, current_count, color, start_date, end_date, reminder, completed_dates, allow_multiple_per_day) VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?);`,
      [title, description, frequency, targetCount, color || null, startDate || null, endDate || null, reminder || null, '[]', allowMultiplePerDay ? 1 : 0]
    );
    console.log('✅ Habit added successfully');
    return result.lastInsertRowId as number;
  } catch (error) {
    console.error('❌ Error adding habit:', error);
    throw error;
  }
};

export const getHabits = (): any[] => {
  try {
    const result = db.getAllSync(`SELECT * FROM habits ORDER BY id DESC;`);
    return result;
  } catch (error) {
    console.error('❌ Error fetching habits:', error);
    throw error;
  }
};

export const updateHabit = (
  id: number,
  title: string,
  description: string,
  frequency: string,
  targetCount: number,
  currentCount: number,
  color?: string,
  reminder?: string,
  startDate?: string,
  endDate?: string,
  completedDates?: string,
  allowMultiplePerDay?: boolean
): void => {
  try {
    const params = completedDates !== undefined
      ? [title, description, frequency, targetCount, currentCount, color || null, reminder || null, startDate || null, endDate || null, completedDates, allowMultiplePerDay ? 1 : 0, id]
      : [title, description, frequency, targetCount, currentCount, color || null, reminder || null, startDate || null, endDate || null, allowMultiplePerDay ? 1 : 0, id];

    const query = completedDates !== undefined
      ? `UPDATE habits SET title = ?, description = ?, frequency = ?, target_count = ?, current_count = ?, color = ?, reminder = ?, start_date = ?, end_date = ?, completed_dates = ?, allow_multiple_per_day = ? WHERE id = ?;`
      : `UPDATE habits SET title = ?, description = ?, frequency = ?, target_count = ?, current_count = ?, color = ?, reminder = ?, start_date = ?, end_date = ?, allow_multiple_per_day = ? WHERE id = ?;`;

    db.runSync(query, params);
    console.log(`✅ Habit ${id} updated`);
  } catch (error) {
    console.error('❌ Error updating habit:', error);
    throw error;
  }
};

export const incrementHabitProgress = (id: number): void => {
  try {
    db.runSync(
      `UPDATE habits SET current_count = current_count + 1 WHERE id = ? AND current_count < target_count;`,
      [id]
    );
    console.log(`✅ Habit ${id} progress incremented`);
  } catch (error) {
    console.error('❌ Error incrementing habit progress:', error);
    throw error;
  }
};

export const resetHabitProgress = (id: number): void => {
  try {
    db.runSync(`UPDATE habits SET current_count = 0 WHERE id = ?;`, [id]);
    console.log(`🔄 Habit ${id} progress reset`);
  } catch (error) {
    console.error('❌ Error resetting habit progress:', error);
    throw error;
  }
};

export const markHabitCompletedForDate = (id: number, date: string): void => {
  try {
    // Get current completed_dates
    const habit = db.getFirstSync(`SELECT completed_dates FROM habits WHERE id = ?;`, [id]) as any;
    if (!habit) {
      console.error(`❌ Habit with id ${id} not found in database`);
      return; // Don't throw error, just return silently
    }

    const completedDates = JSON.parse(habit.completed_dates || '[]');

    // Normalize the date to YYYY-MM-DD format for consistent storage
    const normalizedDate = date.match(/^\d{4}-\d{2}-\d{2}$/)
      ? date
      : getDateString(parseHabitDate(date));

    // Add date if not already completed
    if (!completedDates.includes(normalizedDate)) {
      completedDates.push(normalizedDate);
      db.runSync(
        `UPDATE habits SET completed_dates = ? WHERE id = ?;`,
        [JSON.stringify(completedDates), id]
      );
      console.log(`✅ Habit ${id} marked completed for ${normalizedDate}`);
    } else {
      console.log(`ℹ️ Habit ${id} already completed for ${normalizedDate}`);
    }
  } catch (error) {
    console.error('❌ Error marking habit completed for date:', error);
    // Don't throw error to prevent UI crashes
  }
};

export const isHabitCompletedForDate = (id: number, date: string): boolean => {
  try {
    const habit = db.getFirstSync(`SELECT completed_dates FROM habits WHERE id = ?;`, [id]) as any;
    if (!habit) return false;

    const completedDates = JSON.parse(habit.completed_dates || '[]');
    return isDateInCompletedDates(completedDates, date);
  } catch (error) {
    console.error('❌ Error checking habit completion for date:', error);
    return false;
  }
};

export const deleteHabit = (id: number): void => {
  try {
    db.runSync(`DELETE FROM habits WHERE id = ?;`, [id]);
    console.log(`🗑️ Habit ${id} deleted`);
  } catch (error) {
    console.error('❌ Error deleting habit:', error);
    throw error;
  }
};

// Cache management for better performance
export const clearCaches = (): void => {
  dateCache.clear();
  formatCache.clear();
  console.log('🧹 Database caches cleared');
};

// Memory leak prevention
export const cleanupDatabase = (): void => {
  clearCaches();
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
  console.log('🧹 Database cleanup completed');
};
