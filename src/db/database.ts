import * as SQLite from 'expo-sqlite';

// Mở database đồng bộ
const db = SQLite.openDatabaseSync('todolist.db');

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

            // Add new columns if they don't exist
            addColumnIfNotExists('events', 'reminder', 'TEXT');
            addColumnIfNotExists('events', 'color', 'TEXT');
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
