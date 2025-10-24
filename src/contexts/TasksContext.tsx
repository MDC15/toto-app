import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState
} from "react";
import {
    addTask as dbAddTask,
    deleteTask as dbDeleteTask,
    getTasks as dbGetTasks,
    updateTask as dbUpdateTask,
    initDatabase,
} from "../db/database";

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
    completed: boolean;
};

// ===============================
// 🔹 Kiểu dữ liệu Context
// ===============================
type TasksContextType = {
    tasks: Task[];
    addTask: (task: Omit<Task, "id" | "completed">) => Promise<void>;
    updateTask: (id: number, updates: Partial<Omit<Task, "id">>) => Promise<void>;
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
    const isInitialized = useRef(false);

    // 🔸 Load tasks từ database
    const loadTasks = useCallback(async () => {
        try {
            const loaded = await dbGetTasks();

            // Map dữ liệu DB → model Task
            const mapped = loaded.map((t: any) => {
                let deadline: Date;
                try {
                    deadline = t.deadline ? new Date(t.deadline) : new Date();
                    // Validate the date
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
                    completed: !!t.completed,
                } as Task;
            });

            setTasks(mapped);
        } catch (err) {
            console.error("❌ Error loading tasks:", err);
        }
    }, []);

    // 🔸 Khởi tạo DB + load dữ liệu (chỉ một lần)
    useEffect(() => {
        if (!isInitialized.current) {
            isInitialized.current = true;
            (async () => {
                await initDatabase();
                await loadTasks();
            })();
        }
    }, [loadTasks]);

    // 🔸 Thêm task
    const addTask = async (task: Omit<Task, "id" | "completed">) => {
        try {
            await dbAddTask(
                task.title,
                task.description ?? "",
                task.deadline,
                task.priority
            );
            await loadTasks();
        } catch (err) {
            console.error("❌ Error adding task:", err);
        }
    };

    // 🔸 Cập nhật task
    const updateTask = async (id: number, updates: Partial<Omit<Task, "id">>) => {
        const task = tasks.find((t) => t.id === id);
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
                merged.completed
            );
            await loadTasks();
        } catch (err) {
            console.error("❌ Error updating task:", err);
        }
    };

    // 🔸 Xóa task
    const deleteTask = async (id: number) => {
        try {
            await dbDeleteTask(id);
            await loadTasks();
        } catch (err) {
            console.error("❌ Error deleting task:", err);
        }
    };

    // 🔸 Toggle hoàn thành
    const toggleComplete = async (id: number) => {
        const task = tasks.find((t) => t.id === id);
        if (!task) return;

        const deadline = new Date(task.deadline);

        try {
            await dbUpdateTask(
                id,
                task.title,
                task.description ?? "",
                deadline.toISOString(),
                task.priority,
                !task.completed
            );
            await loadTasks();
        } catch (err) {
            console.error("❌ Error toggling complete:", err);
        }
    };

    // 🔸 Lấy task theo id
    const getTaskById = (id: number) => tasks.find((t) => t.id === id);

    return (
        <TasksContext.Provider
            value={{
                tasks,
                addTask,
                updateTask,
                deleteTask,
                toggleComplete,
                getTaskById,
            }}
        >
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
