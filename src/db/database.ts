import { getDateString } from '@/utils/dateUtils';
import * as SQLite from 'expo-sqlite';

// Mở database đồng bộ
const db = SQLite.openDatabaseSync('todolist.db');

// ==========================
// 📅 DATE UTILITIES
// ==========================
/**
 * Helper function to parse habit date (handles both old and new formats)
 */
export const parseHabitDate = (dateString: string): Date => {
    try {
        // Try to parse as YYYY-MM-DD format first (new format)
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            const [year, month, day] = dateString.split('-').map(Number);
            return new Date(year, month - 1, day);
        }
        // Fallback to standard Date parsing for other formats
        return new Date(dateString);
    } catch (error) {
        console.warn('Error parsing date:', dateString, error);
        return new Date(); // Return current date as fallback
    }
};

/**
 * Check if a date string is in the completed dates array (handles both old and new formats)
 */
export const isDateInCompletedDates = (completedDates: string[], targetDate: string): boolean => {
    try {
        // Normalize date strings to YYYY-MM-DD format for comparison
        const normalizedTarget = targetDate.match(/^\d{4}-\d{2}-\d{2}$/)
            ? targetDate
            : getDateString(parseHabitDate(targetDate));

        return completedDates.includes(normalizedTarget);
    } catch (error) {
        console.warn('Error checking habit completion:', error);
        return false;
    }
};

// ==========================
// 🏗️ Khởi tạo Database
// ==========================
export const initDatabase = (): void => {
    try {
        db.withTransactionSync(() => {
            // Create tasks table
            db.execSync(`
                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT,
                    deadline TEXT,
                    priority TEXT,
                    completed INTEGER DEFAULT 0
                );
            `);

            // Create events table
            db.execSync(`
                CREATE TABLE IF NOT EXISTS events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    start_time TEXT,
                    end_time TEXT,
                    description TEXT,
                    completed INTEGER DEFAULT 0
                );
            `);

            // Create habits table
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
                    completed INTEGER DEFAULT 0
                );
            `);

            // Add new columns if they don't exist
            addColumnIfNotExists('events', 'reminder', 'TEXT');
            addColumnIfNotExists('events', 'color', 'TEXT');
            addColumnIfNotExists('habits', 'start_date', 'TEXT');
            addColumnIfNotExists('habits', 'end_date', 'TEXT');
            addColumnIfNotExists('habits', 'reminder', 'TEXT');
            addColumnIfNotExists('habits', 'completed_dates', 'TEXT'); // JSON array of completed dates
            addColumnIfNotExists('habits', 'allow_multiple_per_day', 'INTEGER DEFAULT 0');
        });

        if (!(global as any).dbInitialized) {
            console.log('✅ Database initialized successfully');
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

// ==========================
// 📋 TASK FUNCTIONS
// ==========================
export const addTask = (title: string, description: string, deadline: string, priority: string): void => {
    try {
        db.withTransactionSync(() => {
            db.runSync(
                `INSERT INTO tasks (title, description, deadline, priority, completed) VALUES (?, ?, ?, ?, 0);`,
                [title, description, deadline, priority]
            );
        });
        console.log('✅ Task added successfully');
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
    completed: boolean
): void => {
    try {
        db.runSync(
            `UPDATE tasks SET title = ?, description = ?, deadline = ?, priority = ?, completed = ? WHERE id = ?;`,
            [title, description, deadline, priority, completed ? 1 : 0, id]
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
export const addEvent = (title: string, startTime: string, endTime: string, description: string, reminder?: string, color?: string): void => {
    try {
        db.runSync(
            `INSERT INTO events (title, start_time, end_time, description, reminder, color) VALUES (?, ?, ?, ?, ?, ?);`,
            [title, startTime, endTime, description, reminder || null, color || null]
        );
        console.log('✅ Event added');
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
export const addHabit = (title: string, description: string, frequency: string, targetCount: number, color?: string, startDate?: string, endDate?: string, reminder?: string, allowMultiplePerDay?: boolean): void => {
    try {
        db.runSync(
            `INSERT INTO habits (title, description, frequency, target_count, current_count, color, start_date, end_date, reminder, completed_dates, allow_multiple_per_day) VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?);`,
            [title, description, frequency, targetCount, color || null, startDate || null, endDate || null, reminder || null, '[]', allowMultiplePerDay ? 1 : 0]
        );
        console.log('✅ Habit added successfully');
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
