// ===============================
// 🎯 REMINDER TYPES & INTERFACES
// ===============================

export type ReminderType = 'task' | 'event' | 'habit';

export type ReminderPriority = 'low' | 'medium' | 'high';

export type NotificationChannel = 'default' | 'task-reminders' | 'event-reminders' | 'habit-reminders';

// ===============================
// ⏰ STANDARD REMINDER TIMES
// ===============================

export type StandardReminderTime = 1 | 5 | 30; // minutes before

export type RelativeReminderTime = { hours?: number; minutes?: number };

export type ReminderTime = StandardReminderTime | RelativeReminderTime | null;

// ===============================
// 🔧 CONFIGURATION INTERFACES
// ===============================

export interface BaseReminderConfig {
    type: ReminderType;
    id: number;
    title: string;
    description: string;
    reminderTime: ReminderTime;
    enabled: boolean;
    priority: ReminderPriority;
    channel: NotificationChannel;
}

export interface TaskReminderConfig extends BaseReminderConfig {
    type: 'task';
    deadline: string; // ISO string
    isDeadlineReminder: boolean;
}

export interface EventReminderConfig extends BaseReminderConfig {
    type: 'event';
    startTime: string; // ISO string
    isStartTimeReminder: boolean;
}

export interface HabitReminderConfig extends BaseReminderConfig {
    type: 'habit';
    frequency: 'daily' | 'weekly' | 'custom';
    dailyTime: string; // Time only (HH:mm)
}

export type ReminderConfig = TaskReminderConfig | EventReminderConfig | HabitReminderConfig;

// ===============================
// 📊 RESULT TYPES
// ===============================

export interface ReminderResult {
    success: boolean;
    notificationId?: string;
    error?: string;
    reminderTime?: string; // Calculated reminder time
}

export interface ReminderSchedule {
    id: string; // notification identifier
    config: ReminderConfig;
    scheduledTime: string;
    status: 'scheduled' | 'cancelled' | 'fired' | 'error';
}

// ===============================
// 🔔 NOTIFICATION PAYLOAD
// ===============================

export interface NotificationData {
    type: 'task' | 'event' | 'habit';
    entityId: number;
    reminderId?: string;
    priority: ReminderPriority;
    customData?: Record<string, any>;
    [key: string]: any;
}

export interface NotificationContent {
    title: string;
    body: string;
    data: NotificationData;
    sound?: string;
    badge?: number;
}

// ===============================
// ⚙️ SERVICE INTERFACES
// ===============================

export interface IReminderService {
    calculateReminderTime(mainTime: string, reminderTime: ReminderTime): string;
    validateReminderTime(reminderTime: ReminderTime, mainTime?: string): boolean;
    formatReminderDisplay(reminderTime: ReminderTime, mainTime?: string): string;
    getStandardReminderOptions(type: ReminderType): {
        label: string;
        value: ReminderTime;
        icon: string;
    }[];
}

export interface INotificationService {
    requestPermissions(): Promise<boolean>;
    scheduleNotification(config: ReminderConfig, reminderTime: string): Promise<ReminderResult>;
    cancelNotification(notificationId: string): Promise<void>;
    cancelAllNotifications(): Promise<void>;
    getNotificationStatus(): Promise<boolean>;
}

export interface IIntegrationService {
    setupReminder(config: ReminderConfig): Promise<ReminderResult>;
    cancelReminder(config: ReminderConfig): Promise<void>;
    cancelAllReminders(): Promise<void>;
    getScheduledReminders(): Map<number, string>;
}

// ===============================
// 🏗️ CONTEXT INTERFACE
// ===============================

export interface NotificationContextType {
    // State
    hasPermission: boolean;
    scheduledReminders: Map<number, string>;

    // Actions
    setupReminder: (config: ReminderConfig) => Promise<ReminderResult>;
    cancelReminder: (entityId: number) => Promise<void>;
    cancelAllReminders: () => Promise<void>;
    requestPermission: () => Promise<boolean>;
    checkPermission: () => Promise<boolean>;

    // Utility
    getReminderDisplay: (config: ReminderConfig) => string;
    getReminderOptions: (type: ReminderType) => {
        label: string;
        value: ReminderTime;
        icon: string;
    }[];
    getDefaultReminderOptions: (type: ReminderType) => {
        label: string;
        value: ReminderTime;
        icon: string;
    }[];
    validateReminderTime: (reminderTime: ReminderTime, mainTime?: string) => boolean;

    // Notification handling
    handleNotificationPressed: (response: any) => void;
    lastNotification: any | null;

    // ===============================
    // 🔄 LEGACY BACKWARD COMPATIBILITY
    // ===============================

    // Task notifications (legacy)
    scheduleTaskNotification: (
        taskId: number,
        title: string,
        description: string,
        deadlineISO: string,
        reminderOffset?: { hours?: number; minutes?: number }
    ) => Promise<ReminderResult>;
    cancelTaskNotification: (taskId: number) => Promise<void>;

    // Event notifications
    cancelEventNotification: (eventId: number) => Promise<void>;

    // Habit notifications (legacy)
    scheduleHabitNotification: (
        habitId: number,
        title: string,
        description: string,
        timeISO: string,
        frequency?: string
    ) => Promise<ReminderResult>;
    cancelHabitNotification: (habitId: number) => Promise<void>;

    // Legacy test notification
    cancelAllNotificationSchedules: () => Promise<void>;
}

// ===============================
// 🔄 CONSTANTS
// ===============================

export const REMINDER_CONSTANTS = {
    STANDARD_TIMES: {
        TASK: [1, 5, 30] as StandardReminderTime[],
        EVENT: [1, 5, 30] as StandardReminderTime[],
        HABIT: [1, 5, 30] as StandardReminderTime[]
    },

    DEFAULT_PRIORITY: 'medium' as ReminderPriority,

    CHANNELS: {
        TASK: 'task-reminders' as NotificationChannel,
        EVENT: 'event-reminders' as NotificationChannel,
        HABIT: 'habit-reminders' as NotificationChannel,
        DEFAULT: 'default' as NotificationChannel
    },

    VALIDATION: {
        MIN_MINUTES_AHEAD: 1, // Minimum 1 minute in the future
        MAX_HOURS_AHEAD: 24 * 7 // Maximum 7 days ahead
    }
} as const;