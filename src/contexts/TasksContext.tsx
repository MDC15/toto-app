import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    useMemo
} from "react";
import {
    addTask as dbAddTask,
    deleteTask as dbDeleteTask,
    getTasks as dbGetTasks,
    updateTask as dbUpdateTask,
    initDatabase,
} from "../db/database";
import { useNotifications } from "./NotificationContext";

// ===============================
// 🔹 Kiểu dữ liệu Task
// ===============================
export type Task = {
    date: any;
    due: any;
    id: number;
    title: string;
    description?: string;
    priority: "High" | "Medium" | "Low";
    deadline: string; // 2025-05-15
    reminder?: string; // Reminder time
    completed: boolean;
};

// ===============================
// 🔹 Kiểu dữ liệu Context
// ===============================
type TasksContextType = {
    tasks: Task[];
    addTask: (task: Omit<Task, "id" | "completed">, scheduleNotification?: boolean) => Promise<void>;
    updateTask: (id: number, updates: Partial<Omit<Task, "id">>, scheduleNotification?: boolean) => Promise<void>;
    deleteTask: (id: number) => Promise<void>;
    toggleComplete: (id: number) => Promise<void>;
    getTaskById: (id: number) => Task | undefined;
};

// ===============================
// 🔹 Tạo Context
// ===============================
const TasksContext = createContext<TasksContextType | undefined>(undefined);

// ===============================
// 🔹 Provider
// ===============================
export function TasksProvider({ children }: { children: ReactNode }) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const mountedRef = useRef(true);
    const isInitialized = useRef(false);
    const { scheduleTaskNotification, cancelTaskNotification } = useNotifications();

    // Memoized notification handlers to prevent re-renders
    const scheduleTaskNotificationRef = useRef(scheduleTaskNotification);
    const cancelTaskNotificationRef = useRef(cancelTaskNotification);

    // Keep refs in sync
    useEffect(() => {
        scheduleTaskNotificationRef.current = scheduleTaskNotification;
        cancelTaskNotificationRef.current = cancelTaskNotification;
    }, [scheduleTaskNotification, cancelTaskNotification]);

    // 🔸 Optimized load tasks function with better error handling
    const loadTasks = useCallback(async () => {
        try {
            const loaded = await dbGetTasks();

            // Map dữ liệu DB → model Task with optimization
            const mapped = loaded.map((t: any) => {
                let deadline: Date;
                try {
                    deadline = t.deadline ? new Date(t.deadline) : new Date();
                    if (isNaN(deadline.getTime())) {
                        deadline = new Date();
                    }
                } catch {
                    deadline = new Date();
                }

                return {
                    id: t.id,
                    title: t.title,
                    description: t.description,
                    priority: t.priority as "High" | "Medium" | "Low",
                    deadline: deadline.toISOString(),
                    reminder: t.reminder,
                    completed: !!t.completed,
                } as Task;
            });

            // Only update state if component is still mounted and data has changed
            setTasks(prevTasks => {
                if (JSON.stringify(prevTasks) !== JSON.stringify(mapped)) {
                    return mapped;
                }
                return prevTasks;
            });
        } catch (err) {
            console.error("❌ Error loading tasks:", err);
        }
    }, []);

    // 🔸 Initialize DB and load data (only once)
    useEffect(() => {
        if (!isInitialized.current) {
            isInitialized.current = true;
            mountedRef.current = true;

            (async () => {
                await initDatabase();
                await loadTasks();
            })();
        }

        return () => {
            mountedRef.current = false;
        };
    }, [loadTasks]);

    // 🔸 Optimized add task function
    const addTask = useCallback(async (task: Omit<Task, "id" | "completed">, scheduleNotification: boolean = true) => {
        try {
            const newTaskId = await dbAddTask(
                task.title,
                task.description ?? "",
                task.deadline,
                task.priority,
                task.reminder
            );

            // Use ref to avoid dependency issues
            await loadTasks();

            // Schedule notification if requested (async to avoid blocking UI)
            if (scheduleNotification && task.reminder && newTaskId) {
                const reminderTime = new Date(task.reminder);
                const reminderOffset = {
                    hours: Math.max(0, Math.floor((reminderTime.getTime() - new Date(task.deadline).getTime()) / (1000 * 60 * 60))),
                    minutes: Math.floor(((reminderTime.getTime() - new Date(task.deadline).getTime()) % (1000 * 60 * 60)) / (1000 * 60))
                };

                scheduleTaskNotificationRef.current(
                    newTaskId,
                    task.title,
                    task.description || "",
                    task.deadline,
                    reminderOffset
                ).catch(console.error);
            }
        } catch (err) {
            console.error("❌ Error adding task:", err);
        }
    }, [loadTasks]);

    // 🔸 Optimized update task function
    const updateTask = useCallback(async (id: number, updates: Partial<Omit<Task, "id">>, scheduleNotification: boolean = true) => {
        // Use current tasks from state to avoid stale closure
        const currentTasks = tasks;
        const task = currentTasks.find((t) => t.id === id);
        if (!task) return;

        const merged = { ...task, ...updates };
        const deadline = updates.deadline ? new Date(updates.deadline) : new Date(task.deadline);

        try {
            await dbUpdateTask(
                id,
                merged.title,
                merged.description ?? "",
                deadline.toISOString(),
                merged.priority,
                merged.completed,
                merged.reminder
            );

            // Cancel existing notification
            await cancelTaskNotificationRef.current(id);

            // Schedule new notification if requested (async)
            if (scheduleNotification && merged.reminder) {
                const reminderTime = new Date(merged.reminder);
                const reminderOffset = {
                    hours: Math.max(0, Math.floor((reminderTime.getTime() - deadline.getTime()) / (1000 * 60 * 60))),
                    minutes: Math.floor(((reminderTime.getTime() - deadline.getTime()) % (1000 * 60 * 60)) / (1000 * 60))
                };

                scheduleTaskNotificationRef.current(
                    id,
                    merged.title,
                    merged.description || "",
                    deadline.toISOString(),
                    reminderOffset
                ).catch(console.error);
            }

            // Update state optimistically for better UX
            setTasks(prevTasks =>
                prevTasks.map(t => t.id === id ? merged as Task : t)
            );

            // Refresh from database to ensure consistency
            await loadTasks();
        } catch (err) {
            console.error("❌ Error updating task:", err);
            // Revert optimistic update on error
            await loadTasks();
        }
    }, [tasks, loadTasks]);

    // 🔸 Optimized delete task function
    const deleteTask = useCallback(async (id: number) => {
        try {
            // Cancel notification before deleting
            await cancelTaskNotificationRef.current(id);
            await dbDeleteTask(id);

            // Update state optimistically
            setTasks(prevTasks => prevTasks.filter(t => t.id !== id));

            // Refresh from database to ensure consistency
            await loadTasks();
        } catch (err) {
            console.error("❌ Error deleting task:", err);
            // Revert on error
            await loadTasks();
        }
    }, [loadTasks]);

    // 🔸 Optimized toggle complete function
    const toggleComplete = useCallback(async (id: number) => {
        // Use current tasks to find the task
        const task = tasks.find((t) => t.id === id);
        if (!task) return;

        const deadline = new Date(task.deadline);

        try {
            const newCompletedState = !task.completed;

            // Optimistic update
            setTasks(prevTasks =>
                prevTasks.map(t => t.id === id ? { ...t, completed: newCompletedState } : t)
            );

            await dbUpdateTask(
                id,
                task.title,
                task.description ?? "",
                deadline.toISOString(),
                task.priority,
                newCompletedState,
                task.reminder
            );

            // Refresh to ensure consistency
            await loadTasks();
        } catch (err) {
            console.error("❌ Error toggling complete:", err);
            // Revert on error
            await loadTasks();
        }
    }, [tasks, loadTasks]);

    // 🔸 Memoized get task by id function
    const getTaskById = useCallback((id: number) => {
        return tasks.find((t) => t.id === id);
    }, [tasks]);

    // 🔸 Memoized context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleComplete,
        getTaskById,
    }), [
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleComplete,
        getTaskById,
    ]);

    return (
        <TasksContext.Provider value={contextValue}>
            {children}
        </TasksContext.Provider>
    );
}

// ===============================
// 🔹 Hook tiện dụng
// ===============================
export function useTasks() {
    const ctx = useContext(TasksContext);
    if (!ctx) {
        throw new Error("useTasks must be used within a TasksProvider");
    }
    return ctx;
}
