import {
    calculateReminderTime,
    cancelAllNotifications,
    cancelNotification,
    getDefaultReminderTimes,
    getNotificationStatus,
    isReminderTimeValid,
    requestNotificationPermissions,
    scheduleEventReminder,
    scheduleHabitReminder,
    scheduleTaskReminder,
    setupNotificationListeners,
} from "@/services/NotificationService";
import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

// ===============================
// 🔹 Types
// ===============================
type NotificationContextType = {
    // Permission state
    hasPermission: boolean;
    requestPermission: () => Promise<boolean>;

    // Scheduled notifications
    scheduledTaskReminders: Map<number, string>; // taskId -> notificationId
    scheduledEventReminders: Map<number, string>; // eventId -> notificationId
    scheduledHabitReminders: Map<number, string>; // habitId -> notificationId

    // Actions
    scheduleTaskNotification: (
        taskId: number,
        title: string,
        description: string,
        deadline: string,
        reminderOffset?: { hours?: number; minutes?: number }
    ) => Promise<string | null>;

    scheduleEventNotification: (
        eventId: number,
        title: string,
        description: string,
        startTime: string,
        reminderOffset?: { hours?: number; minutes?: number }
    ) => Promise<string | null>;

    scheduleHabitNotification: (
        habitId: number,
        title: string,
        description: string,
        reminderTime: string,
        frequency?: 'daily' | 'weekly' | 'custom'
    ) => Promise<string | null>;

    cancelTaskNotification: (taskId: number) => Promise<void>;
    cancelEventNotification: (eventId: number) => Promise<void>;
    cancelHabitNotification: (habitId: number) => Promise<void>;
    cancelAllNotificationSchedules: () => Promise<void>;

    // Utility functions
    getDefaultReminderOptions: (type: 'task' | 'event' | 'habit') => {
        label: string;
        value: any;
    }[];
    calculateReminderTime: (
        mainTime: string,
        offset: { hours?: number; minutes?: number }
    ) => string;
    isValidReminderTime: (reminderTime: string) => boolean;

    // Notification handling
    lastNotification: any | null;
    handleNotificationPressed: (response: any) => void;
};

// ===============================
// 🔹 Create Context
// ===============================
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// ===============================
// 🔹 Provider
// ===============================
export function NotificationProvider({ children }: { children: ReactNode }) {
    const [hasPermission, setHasPermission] = useState(false);
    const [scheduledTaskReminders, setScheduledTaskReminders] = useState(new Map());
    const [scheduledEventReminders, setScheduledEventReminders] = useState(new Map());
    const [scheduledHabitReminders, setScheduledHabitReminders] = useState(new Map());
    const [lastNotification, setLastNotification] = useState(null);

    // Check and update permission status
    const checkPermissionStatus = useCallback(async () => {
        const status = await getNotificationStatus();
        setHasPermission(status);
        return status;
    }, []);

    // Handle notification pressed
    const handleNotificationPressed = useCallback((response: any) => {
        try {
            // Add null safety checks
            if (!response || !response.notification || !response.notification.request || !response.notification.request.content) {
                console.warn('⚠️ Invalid notification response structure');
                return;
            }

            const data = response.notification.request.content.data;

            // Handle different notification types
            if (data && data.type === 'task') {
                // Navigate to task details
                console.log('📋 Navigate to task:', data.taskId);
            } else if (data && data.type === 'event') {
                // Navigate to event details
                console.log('📅 Navigate to event:', data.eventId);
            } else if (data && data.type === 'habit') {
                // Navigate to habit details
                console.log('🏃 Navigate to habit:', data.habitId);
            } else {
                console.log('🔔 Unknown notification type:', data);
            }
        } catch (error) {
            console.error('❌ Error handling notification press:', error);
        }
    }, []);

    // Check notification status on mount and setup listeners
    useEffect(() => {
        const initializeNotifications = async () => {
            const status = await checkPermissionStatus();
            console.log('🚀 Notification context initialized with permission:', status);
        };

        initializeNotifications();

        // Setup notification listeners
        const cleanup = setupNotificationListeners(
            (notification) => {
                console.log('📱 Notification received:', notification);
                setLastNotification(notification);
            },
            (response) => {
                console.log('👆 Notification pressed:', response);
                handleNotificationPressed(response);
            }
        );

        return cleanup;
    }, [checkPermissionStatus, handleNotificationPressed]); // ✅ thêm dependencies


    // Request permission
    const requestPermission = useCallback(async (): Promise<boolean> => {
        const granted = await requestNotificationPermissions();
        setHasPermission(granted);
        console.log('🔐 Permission request result:', granted);
        return granted;
    }, []);

    // Schedule task notification
    const scheduleTaskNotification = useCallback(async (
        taskId: number,
        title: string,
        description: string,
        deadline: string,
        reminderOffset: { hours?: number; minutes?: number } = { hours: 1 }
    ): Promise<string | null> => {
        console.log('🧪 Testing task notification scheduling:', { taskId, title, hasPermission });

        if (!hasPermission) {
            console.log('❌ No permission for task notification');
            return null;
        }

        const reminderTime = calculateReminderTime(deadline, reminderOffset);
        console.log('🕐 Calculated reminder time:', reminderTime);

        if (!isReminderTimeValid(reminderTime)) {
            console.warn('⚠️ Reminder time is in the past');
            return null;
        }

        const isDeadline = reminderOffset.hours === 0 || !reminderOffset;
        console.log('📋 Scheduling task reminder:', { taskId, title, reminderTime, isDeadline });

        try {
            const notificationId = await scheduleTaskReminder(
                taskId,
                title,
                description,
                reminderTime,
                isDeadline
            );

            if (notificationId) {
                console.log('✅ Task notification scheduled successfully:', notificationId);
                setScheduledTaskReminders(prev => new Map(prev.set(taskId, notificationId)));
            } else {
                console.log('❌ Failed to get notification ID from service');
            }

            return notificationId;
        } catch (error) {
            console.error('❌ Error in scheduleTaskNotification:', error);
            return null;
        }
    }, [hasPermission]);

    // Schedule event notification
    const scheduleEventNotification = useCallback(async (
        eventId: number,
        title: string,
        description: string,
        startTime: string,
        reminderOffset: { hours?: number; minutes?: number } = { minutes: 30 }
    ): Promise<string | null> => {
        console.log('🧪 Testing event notification scheduling:', { eventId, title, hasPermission });

        if (!hasPermission) {
            console.log('❌ No permission for event notification');
            return null;
        }

        const reminderTime = calculateReminderTime(startTime, reminderOffset);
        console.log('🕐 Calculated reminder time:', reminderTime);

        if (!isReminderTimeValid(reminderTime)) {
            console.warn('⚠️ Reminder time is in the past');
            return null;
        }

        console.log('📅 Scheduling event reminder:', { eventId, title, reminderTime });

        try {
            const notificationId = await scheduleEventReminder(
                eventId,
                title,
                description,
                reminderTime,
                true // isStartTime
            );

            if (notificationId) {
                console.log('✅ Event notification scheduled successfully:', notificationId);
                setScheduledEventReminders(prev => new Map(prev.set(eventId, notificationId)));
            } else {
                console.log('❌ Failed to get notification ID from service');
            }

            return notificationId;
        } catch (error) {
            console.error('❌ Error in scheduleEventNotification:', error);
            return null;
        }
    }, [hasPermission]);

    // Schedule habit notification
    const scheduleHabitNotification = useCallback(async (
        habitId: number,
        title: string,
        description: string,
        reminderTime: string,
        frequency: 'daily' | 'weekly' | 'custom' = 'daily'
    ): Promise<string | null> => {
        console.log('🧪 Testing habit notification scheduling:', { habitId, title, hasPermission });

        if (!hasPermission) {
            console.log('❌ No permission for habit notification');
            return null;
        }

        console.log('🏃 Scheduling habit reminder:', { habitId, title, reminderTime, frequency });

        try {
            if (!isReminderTimeValid(reminderTime)) {
                console.warn('⚠️ Reminder time is in the past');
                return null;
            }

            const notificationId = await scheduleHabitReminder(
                habitId,
                title,
                description,
                reminderTime,
                frequency
            );

            if (notificationId) {
                console.log('✅ Habit notification scheduled successfully:', notificationId);
                setScheduledHabitReminders(prev => new Map(prev.set(habitId, notificationId)));
            } else {
                console.log('❌ Failed to get notification ID from service');
            }

            return notificationId;
        } catch (error) {
            console.error('❌ Error in scheduleHabitNotification:', error);
            return null;
        }
    }, [hasPermission]);

    // Cancel task notification
    const cancelTaskNotification = useCallback(async (taskId: number) => {
        const notificationId = scheduledTaskReminders.get(taskId);
        if (notificationId) {
            await cancelNotification(notificationId);
            setScheduledTaskReminders(prev => {
                const newMap = new Map(prev);
                newMap.delete(taskId);
                return newMap;
            });
        }
    }, [scheduledTaskReminders]);

    // Cancel event notification
    const cancelEventNotification = useCallback(async (eventId: number) => {
        const notificationId = scheduledEventReminders.get(eventId);
        if (notificationId) {
            await cancelNotification(notificationId);
            setScheduledEventReminders(prev => {
                const newMap = new Map(prev);
                newMap.delete(eventId);
                return newMap;
            });
        }
    }, [scheduledEventReminders]);

    // Cancel habit notification
    const cancelHabitNotification = useCallback(async (habitId: number) => {
        const notificationId = scheduledHabitReminders.get(habitId);
        if (notificationId) {
            await cancelNotification(notificationId);
            setScheduledHabitReminders(prev => {
                const newMap = new Map(prev);
                newMap.delete(habitId);
                return newMap;
            });
        }
    }, [scheduledHabitReminders]);

    // Cancel all notifications
    const cancelAllNotificationSchedules = useCallback(async () => {
        await cancelAllNotifications();
        setScheduledTaskReminders(new Map());
        setScheduledEventReminders(new Map());
        setScheduledHabitReminders(new Map());
    }, []);

    // Utility functions
    const getDefaultReminderOptions = useCallback((type: 'task' | 'event' | 'habit') => {
        return getDefaultReminderTimes(type);
    }, []);

    const calculateReminderTimeWrapper = useCallback((
        mainTime: string,
        offset: { hours?: number; minutes?: number }
    ) => {
        return calculateReminderTime(mainTime, offset);
    }, []);

    const isValidReminderTimeWrapper = useCallback((reminderTime: string) => {
        return isReminderTimeValid(reminderTime);
    }, []);

    const value: NotificationContextType = {
        hasPermission,
        requestPermission,
        scheduledTaskReminders,
        scheduledEventReminders,
        scheduledHabitReminders,
        scheduleTaskNotification,
        scheduleEventNotification,
        scheduleHabitNotification,
        cancelTaskNotification,
        cancelEventNotification,
        cancelHabitNotification,
        cancelAllNotificationSchedules,
        getDefaultReminderOptions,
        calculateReminderTime: calculateReminderTimeWrapper,
        isValidReminderTime: isValidReminderTimeWrapper,
        lastNotification,
        handleNotificationPressed,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

// ===============================
// 🔹 Hook
// ===============================
export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
}