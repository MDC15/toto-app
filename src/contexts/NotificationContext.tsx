import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react';

import { integrationService } from '@/services/IntegrationService';
import { notificationService } from '@/services/NotificationService';
import { reminderService } from '@/services/ReminderService';
import {
    NotificationContextType,
    ReminderConfig,
    ReminderResult,
    ReminderTime,
    ReminderType,
    StandardReminderTime
} from '@/types/reminder.types';

// ===============================
// 🏗️ NOTIFICATION CONTEXT
// ===============================

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// ===============================
// 🔹 PROVIDER COMPONENT
// ===============================

interface NotificationProviderProps {
    children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
    // ===============================
    // 📊 STATE MANAGEMENT
    // ===============================

    const [hasPermission, setHasPermission] = useState(false);
    const [scheduledReminders, setScheduledReminders] = useState(new Map<number, string>());
    const [lastNotification, setLastNotification] = useState<any | null>(null);

    // Use refs for stable references to prevent re-renders
    const mountedRef = useRef(true);
    const scheduledRemindersRef = useRef(scheduledReminders);

    // Keep scheduledReminders ref in sync with state
    useEffect(() => {
        scheduledRemindersRef.current = scheduledReminders;
    }, [scheduledReminders]);

    // ===============================
    // 🔧 HELPER FUNCTIONS
    // ===============================

    /**
     * Handle notification pressed
     */
    const handleNotificationPressed = useCallback((response: any) => {
        try {
            // Add null safety checks
            if (!response || !response.notification || !response.notification.request) {
                console.warn('⚠️ NotificationProvider: Invalid notification response structure');
                return;
            }

            const data = response.notification.request.content?.data;

            if (data) {
                console.log('📋 NotificationProvider: Processing notification data:', data);

                // Handle different notification types
                switch (data.type) {
                    case 'task':
                        console.log('📋 Navigate to task:', data.entityId);
                        // Navigation logic would go here
                        break;
                    case 'event':
                        console.log('📅 Navigate to event:', data.entityId);
                        // Navigation logic would go here
                        break;
                    case 'habit':
                        console.log('🏃 Navigate to habit:', data.entityId);
                        // Navigation logic would go here
                        break;
                    default:
                        console.log('🔔 Unknown notification type:', data.type);
                }
            }
        } catch (error) {
            console.error('❌ NotificationProvider: Error handling notification press:', error);
        }
    }, []);

    // ===============================
    // 🚀 INITIALIZATION
    // ===============================

    useEffect(() => {
        let cleanup: (() => void) | undefined;

        const initializeNotifications = async () => {
            try {
                // Check permission status
                const permission = await notificationService.getNotificationStatus();
                if (mountedRef.current) {
                    setHasPermission(permission);
                }

                console.log('🚀 NotificationProvider: Initialized with permission:', permission);

                // Setup notification listeners
                const listenerCleanup = notificationService.setupNotificationListeners(
                    // Notification received
                    (notification) => {
                        if (mountedRef.current) {
                            console.log('📱 NotificationProvider: Notification received:', notification);
                            setLastNotification(notification);
                        }
                    },
                    // Notification pressed
                    (response) => {
                        if (mountedRef.current) {
                            console.log('👆 NotificationProvider: Notification pressed:', response);
                            handleNotificationPressed(response);
                        }
                    }
                );

                cleanup = listenerCleanup;
            } catch (error) {
                console.error('❌ NotificationProvider: Initialization error:', error);
            }
        };

        mountedRef.current = true;
        initializeNotifications();

        return () => {
            mountedRef.current = false;
            if (cleanup) {
                cleanup();
            }
        };
    }, [handleNotificationPressed]);

    // ===============================
    // 🎯 CORE FUNCTIONS
    // ===============================

    /**
     * Setup a reminder using the integration service
     */
    const setupReminder = useCallback(async (config: ReminderConfig): Promise<ReminderResult> => {
        if (!mountedRef.current) {
            return { success: false, reminderTime: '' };
        }

        console.log('🔔 NotificationProvider: Setting up reminder', {
            type: config.type,
            id: config.id,
            enabled: config.enabled
        });

        // If reminder is disabled, cancel existing and return success
        if (!config.enabled) {
            const cancelReminderFn = (id: number) => scheduledRemindersRef.current.has(id);
            if (cancelReminderFn(config.id)) {
                // Inline cancellation logic to avoid dependency
                try {
                    const notificationId = scheduledRemindersRef.current.get(config.id);
                    if (notificationId) {
                        await notificationService.cancelNotification(notificationId);
                        setScheduledReminders(prev => {
                            const newMap = new Map(prev);
                            newMap.delete(config.id);
                            return newMap;
                        });
                        integrationService.unregisterScheduledReminder(config.id);
                    }
                } catch (error) {
                    console.error('❌ NotificationProvider: Error canceling reminder:', error);
                }
            }
            return {
                success: true,
                reminderTime: ''
            };
        }

        // Use integration service to setup the reminder
        const result = await integrationService.setupReminder(config);

        if (mountedRef.current && result.success && result.notificationId) {
            // Update internal state
            setScheduledReminders(prev => new Map(prev.set(config.id, result.notificationId!)));
            integrationService.registerScheduledReminder(config.id, result.notificationId!);
        }

        return result;
    }, []);

    /**
     * Cancel a specific reminder
     */
    const cancelReminder = useCallback(async (entityId: number): Promise<void> => {
        try {
            console.log('🗑️ NotificationProvider: Canceling reminder', { entityId });

            const notificationId = scheduledRemindersRef.current.get(entityId);

            if (notificationId) {
                // Cancel with notification service
                await notificationService.cancelNotification(notificationId);

                // Update internal state
                setScheduledReminders(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(entityId);
                    return newMap;
                });

                // Update integration service
                integrationService.unregisterScheduledReminder(entityId);
            }
        } catch (error) {
            console.error('❌ NotificationProvider: Error canceling reminder:', error);
            throw error;
        }
    }, []);

    /**
     * Cancel all reminders
     */
    const cancelAllReminders = useCallback(async (): Promise<void> => {
        try {
            console.log('🗑️ NotificationProvider: Canceling all reminders');

            await integrationService.cancelAllReminders();
            setScheduledReminders(new Map());
        } catch (error) {
            console.error('❌ NotificationProvider: Error canceling all reminders:', error);
            throw error;
        }
    }, []);

    /**
     * Request notification permissions
     */
    const requestPermission = useCallback(async (): Promise<boolean> => {
        try {
            console.log('🔐 NotificationProvider: Requesting permissions');

            const granted = await notificationService.requestPermissions();
            setHasPermission(granted);

            console.log('🔐 NotificationProvider: Permission result:', granted);
            return granted;
        } catch (error) {
            console.error('❌ NotificationProvider: Error requesting permission:', error);
            return false;
        }
    }, []);

    /**
     * Check notification permissions
     */
    const checkPermission = useCallback(async (): Promise<boolean> => {
        try {
            const granted = await notificationService.getNotificationStatus();
            setHasPermission(granted);
            return granted;
        } catch (error) {
            console.error('❌ NotificationProvider: Error checking permission:', error);
            return false;
        }
    }, []);

    // ===============================
    // 🔧 HELPER FUNCTIONS
    // ===============================

    /**
     * Get main time based on reminder config type
     */
    const getMainTimeForConfig = useCallback((config: ReminderConfig): string => {
        switch (config.type) {
            case 'task':
                return config.deadline;
            case 'event':
                return config.startTime;
            case 'habit':
                return config.dailyTime;
            default:
                return '';
        }
    }, []);

    // ===============================
    // 🛠️ UTILITY FUNCTIONS
    // ===============================

    /**
     * Get formatted reminder display text
     */
    const getReminderDisplay = useCallback((config: ReminderConfig): string => {
        if (!config.enabled) {
            return 'Off';
        }

        const mainTime = getMainTimeForConfig(config);
        return reminderService.formatReminderDisplay(config.reminderTime, mainTime);
    }, [getMainTimeForConfig]);

    /**
     * Get standard reminder options for a type
     */
    const getReminderOptions = useCallback((type: ReminderType) => {
        return reminderService.getStandardReminderOptions(type);
    }, []);

    /**
     * Get default reminder options for a type (alias for getReminderOptions)
     */
    const getDefaultReminderOptions = useCallback((type: ReminderType) => {
        return reminderService.getStandardReminderOptions(type);
    }, []);

    /**
     * Validate reminder time
     */
    const validateReminderTime = useCallback((
        reminderTime: ReminderTime,
        mainTime?: string
    ): boolean => {
        return reminderService.validateReminderTime(reminderTime, mainTime);
    }, []);


    // ===============================
    // 🔄 LEGACY BACKWARD COMPATIBILITY
    // ===============================

    /**
     * Legacy function for scheduling task notifications
     * Maps old API to new clean architecture
     */
    const scheduleTaskNotification = useCallback(async (
        taskId: number,
        title: string,
        description: string,
        deadlineISO: string,
        reminderOffset?: { hours?: number; minutes?: number }
    ): Promise<ReminderResult> => {
        console.warn('⚠️ LEGACY API: scheduleTaskNotification is deprecated. Use setupTaskReminder instead.');

        try {
            // Calculate reminder time from deadline and offset
            const reminderTime: ReminderTime = reminderOffset
                ? (reminderOffset.minutes as StandardReminderTime) || 5 // Default 5 minutes
                : 5; // Default 5 minutes

            const config = reminderService.createReminderConfig(
                'task',
                taskId,
                title,
                description,
                deadlineISO,
                reminderTime
            );

            return await setupReminder(config);
        } catch (error) {
            console.error('❌ Legacy scheduleTaskNotification error:', error);
            throw error;
        }
    }, [setupReminder]);

    /**
     * Legacy function for canceling task notifications
     */
    const cancelTaskNotification = useCallback(async (taskId: number): Promise<void> => {
        console.warn('⚠️ LEGACY API: cancelTaskNotification is deprecated. Use cancelTaskReminder instead.');

        try {
            await cancelReminder(taskId);
        } catch (error) {
            console.error('❌ Legacy cancelTaskNotification error:', error);
            throw error;
        }
    }, [cancelReminder]);

    /**
     * Legacy function for canceling event notifications
     */
    const cancelEventNotification = useCallback(async (eventId: number): Promise<void> => {
        console.warn('⚠️ LEGACY API: cancelEventNotification is deprecated. Use cancelEventReminder instead.');

        try {
            await cancelReminder(eventId);
        } catch (error) {
            console.error('❌ Legacy cancelEventNotification error:', error);
            throw error;
        }
    }, [cancelReminder]);

    /**
     * Legacy function for scheduling habit notifications
     */
    const scheduleHabitNotification = useCallback(async (
        habitId: number,
        title: string,
        description: string,
        timeISO: string,
        frequency?: string
    ): Promise<ReminderResult> => {
        console.warn('⚠️ LEGACY API: scheduleHabitNotification is deprecated. Use setupHabitReminder instead.');

        try {
            // For habits, timeISO is actually daily time in HH:mm format
            const dailyTime = timeISO.includes('T')
                ? new Date(timeISO).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : timeISO;

            const config = reminderService.createReminderConfig(
                'habit',
                habitId,
                title,
                description,
                dailyTime,
                null // No relative offset for habits, they use daily time
            );

            return await setupReminder(config);
        } catch (error) {
            console.error('❌ Legacy scheduleHabitNotification error:', error);
            throw error;
        }
    }, [setupReminder]);

    /**
     * Legacy function for canceling habit notifications
     */
    const cancelHabitNotification = useCallback(async (habitId: number): Promise<void> => {
        console.warn('⚠️ LEGACY API: cancelHabitNotification is deprecated. Use cancelHabitReminder instead.');

        try {
            await cancelReminder(habitId);
        } catch (error) {
            console.error('❌ Legacy cancelHabitNotification error:', error);
            throw error;
        }
    }, [cancelReminder]);

    /**
     * Legacy function for canceling all notification schedules
     */
    const cancelAllNotificationSchedules = useCallback(async (): Promise<void> => {
        console.warn('⚠️ LEGACY API: cancelAllNotificationSchedules is deprecated. Use cancelAllReminders instead.');

        try {
            await cancelAllReminders();
        } catch (error) {
            console.error('❌ Legacy cancelAllNotificationSchedules error:', error);
            throw error;
        }
    }, [cancelAllReminders]);

    // ===============================
    // 📦 CONTEXT VALUE
    // ===============================

    const value: NotificationContextType = useMemo(() => ({
        // State
        hasPermission,
        scheduledReminders,

        // Actions
        setupReminder,
        cancelReminder,
        cancelAllReminders,
        requestPermission,
        checkPermission,

        // Utility
        getReminderDisplay,
        getReminderOptions,
        getDefaultReminderOptions,
        validateReminderTime,

        // Notification handling
        handleNotificationPressed,
        lastNotification,

        // Legacy backward compatibility
        scheduleTaskNotification,
        cancelTaskNotification,
        cancelEventNotification,
        scheduleHabitNotification,
        cancelHabitNotification,
        cancelAllNotificationSchedules,
    }), [
        hasPermission,
        scheduledReminders,
        setupReminder,
        cancelReminder,
        cancelAllReminders,
        requestPermission,
        checkPermission,
        getReminderDisplay,
        getReminderOptions,
        getDefaultReminderOptions,
        validateReminderTime,
        handleNotificationPressed,
        lastNotification,
        scheduleTaskNotification,
        cancelTaskNotification,
        cancelEventNotification,
        scheduleHabitNotification,
        cancelHabitNotification,
        cancelAllNotificationSchedules,
    ]);

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

// ===============================
// 🔹 CUSTOM HOOK
// ===============================

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
}

// ===============================
// 🔹 CONVENIENT HOOKS
// ===============================

/**
 * Hook for reminder configuration utilities
 */
export function useReminderConfig() {
    const { getReminderDisplay, getReminderOptions, validateReminderTime } = useNotifications();

    return {
        formatDisplay: getReminderDisplay,
        getOptions: getReminderOptions,
        validateTime: validateReminderTime,
    };
}

/**
 * Hook for task reminder specific operations
 */
export function useTaskReminders() {
    const { setupReminder, cancelReminder } = useNotifications();

    return {
        setupTaskReminder: async (
            taskId: number,
            title: string,
            description: string,
            deadline: string,
            reminderTime?: ReminderTime
        ) => {
            const config = reminderService.createReminderConfig(
                'task',
                taskId,
                title,
                description,
                deadline,
                reminderTime
            );
            return setupReminder(config);
        },
        cancelTaskReminder: (taskId: number) => cancelReminder(taskId),
    };
}

/**
 * Hook for event reminder specific operations
 */
export function useEventReminders() {
    const { setupReminder, cancelReminder } = useNotifications();

    return {
        setupEventReminder: async (
            eventId: number,
            title: string,
            description: string,
            startTime: string,
            reminderTime?: ReminderTime
        ) => {
            const config = reminderService.createReminderConfig(
                'event',
                eventId,
                title,
                description,
                startTime,
                reminderTime
            );
            return setupReminder(config);
        },
        cancelEventReminder: (eventId: number) => cancelReminder(eventId),
    };
}

/**
 * Hook for habit reminder specific operations
 */
export function useHabitReminders() {
    const { setupReminder, cancelReminder } = useNotifications();

    return {
        setupHabitReminder: async (
            habitId: number,
            title: string,
            description: string,
            dailyTime: string,
            reminderTime?: ReminderTime
        ) => {
            const config = reminderService.createReminderConfig(
                'habit',
                habitId,
                title,
                description,
                dailyTime,
                reminderTime
            );
            return setupReminder(config);
        },
        cancelHabitReminder: (habitId: number) => cancelReminder(habitId),
    };
}