import { reminderService } from '@/services/ReminderService';
import {
    INotificationService,
    NotificationContent,
    ReminderConfig,
    ReminderResult,
    ReminderTime
} from '@/types/reminder.types';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ===============================
// 🔔 NOTIFICATION SERVICE - PLATFORM INTEGRATION
// ===============================

class NotificationService implements INotificationService {

    constructor() {
        this.initializeNotificationHandler();
        this.setupNotificationChannels();
    }

    // ===============================
    // 🚀 INITIALIZATION
    // ===============================

    /**
     * Initialize notification behavior
     */
    private initializeNotificationHandler(): void {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldPlaySound: true,
                shouldSetBadge: true,
                shouldShowBanner: true,
                shouldShowList: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
            }),
        });
    }

    /**
     * Setup notification channels for Android
     */
    private async setupNotificationChannels(): Promise<void> {
        if (Platform.OS !== 'android') {
            return;
        }

        try {
            // Create default channel first
            await Notifications.setNotificationChannelAsync('default', {
                name: 'Default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
                enableVibrate: true,
                enableLights: true,
            });

            // Create specific channels for different reminder types
            await Notifications.setNotificationChannelAsync('task-reminders', {
                name: 'Task Reminders',
                description: 'Notifications for task deadlines and reminders',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
                enableVibrate: true,
                enableLights: true,
            });

            await Notifications.setNotificationChannelAsync('event-reminders', {
                name: 'Event Reminders',
                description: 'Notifications for upcoming events',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#2196F3',
                enableVibrate: true,
                enableLights: true,
            });

            await Notifications.setNotificationChannelAsync('habit-reminders', {
                name: 'Habit Reminders',
                description: 'Daily habit reminders',
                importance: Notifications.AndroidImportance.DEFAULT,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#4CAF50',
                enableVibrate: true,
                enableLights: true,
            });

        } catch (error) {
            console.warn('⚠️ NotificationService: Failed to setup channels:', error);
        }
    }

    // ===============================
    // 🔐 PERMISSION MANAGEMENT
    // ===============================

    /**
     * Request notification permissions
     */
    async requestPermissions(): Promise<boolean> {
        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            // If no permission, request it
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync({
                    ios: {
                        allowAlert: true,
                        allowBadge: true,
                        allowSound: true,
                    },
                });
                finalStatus = status;
            }

            // If permission is granted, send a test notification
            if (finalStatus === 'granted') {
                await this.sendTestNotification();
            }

            return finalStatus === 'granted';
        } catch (error) {
            console.error('❌ NotificationService: Error requesting permissions:', error);
            return false;
        }
    }

    /**
     * Get current notification permission status
     */
    async getNotificationStatus(): Promise<boolean> {
        try {
            const { status } = await Notifications.getPermissionsAsync();
            const hasPermission = status === 'granted';
            console.log('🔍 NotificationService: Current status:', status, hasPermission);
            return hasPermission;
        } catch (error) {
            console.error('❌ NotificationService: Error getting status:', error);
            return false;
        }
    }

    /**
     * Send test notification to verify permissions
     */
    private async sendTestNotification(): Promise<void> {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "🎉 Notifications Enabled!",
                    body: "You'll now receive reminders and updates.",
                    sound: 'default',
                },
                trigger: null, // Send immediately
            });
            console.log('✅ NotificationService: Test notification sent');
        } catch (error) {
            console.warn('⚠️ NotificationService: Test notification failed:', error);
        }
    }

    // ===============================
    // 📅 SCHEDULING NOTIFICATIONS
    // ===============================

    /**
     * Schedule a notification for a reminder
     */
    async scheduleNotification(config: ReminderConfig, reminderTime: string): Promise<ReminderResult> {
        try {
            console.log('📅 NotificationService: Scheduling notification', {
                type: config.type,
                id: config.id,
                reminderTime
            });

            // Check permissions first
            const hasPermission = await this.getNotificationStatus();
            if (!hasPermission) {
                return {
                    success: false,
                    error: 'Notification permissions not granted'
                };
            }

            // Create notification content
            const notificationContent = this.createNotificationContent(config, reminderTime);

            // Determine trigger based on config type
            const trigger = this.createTrigger(config, reminderTime);

            // Schedule the notification
            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: notificationContent.title,
                    body: notificationContent.body,
                    data: notificationContent.data,
                    sound: notificationContent.sound || 'default',
                },
                trigger,
            });

            console.log(`✅ NotificationService: Scheduled successfully - ${notificationId}`);

            return {
                success: true,
                notificationId,
                reminderTime
            };

        } catch (error) {
            console.error('❌ NotificationService: Error scheduling notification:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to schedule notification'
            };
        }
    }

    /**
     * Create notification content
     */
    private createNotificationContent(config: ReminderConfig, reminderTime: string): NotificationContent {
        const { type, title, description, priority } = config;

        let notificationTitle: string;
        let notificationBody: string;

        switch (type) {
            case 'task':
                notificationTitle = '📋 Task Reminder';
                notificationBody = title;
                if (description) {
                    notificationBody += `\n${description}`;
                }
                notificationBody += `\n\n⏰ Deadline approaching!`;
                break;

            case 'event':
                notificationTitle = '🗓️ Event Reminder';
                notificationBody = title;
                if (description) {
                    notificationBody += `\n${description}`;
                }
                notificationBody += `\n\n🕐 Starting soon!`;
                break;

            case 'habit':
                notificationTitle = '🏃 Habit Reminder';
                notificationBody = `Time for: ${title}`;
                if (description) {
                    notificationBody += `\n${description}`;
                }
                break;

            default:
                notificationTitle = '⏰ Reminder';
                notificationBody = title;
        }

        return {
            title: notificationTitle,
            body: notificationBody,
            data: {
                type,
                entityId: config.id,
                priority
            },
            sound: 'default'
        };
    }

    /**
     * Create trigger for different reminder types
     */
    private createTrigger(config: ReminderConfig, reminderTime: string): any {
        const triggerDate = new Date(reminderTime);

        switch (config.type) {
            case 'habit':
                // For habits, use daily repeating trigger
                return {
                    hour: triggerDate.getHours(),
                    minute: triggerDate.getMinutes(),
                    repeats: true,
                };

            default:
                // For tasks and events, use one-time trigger
                return {
                    date: triggerDate,
                };
        }
    }

    // ===============================
    // 🗑️ CANCELING NOTIFICATIONS
    // ===============================

    /**
     * Cancel a specific notification
     */
    async cancelNotification(notificationId: string): Promise<void> {
        try {
            await Notifications.cancelScheduledNotificationAsync(notificationId);
            console.log(`✅ NotificationService: Cancelled notification ${notificationId}`);
        } catch (error) {
            console.error('❌ NotificationService: Error cancelling notification:', error);
            throw error;
        }
    }

    /**
     * Cancel all scheduled notifications
     */
    async cancelAllNotifications(): Promise<void> {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
            console.log('✅ NotificationService: All notifications cancelled');
        } catch (error) {
            console.error('❌ NotificationService: Error cancelling all notifications:', error);
            throw error;
        }
    }

    // ===============================
    // 🎧 LISTENER MANAGEMENT
    // ===============================

    /**
     * Setup notification listeners
     */
    setupNotificationListeners(
        onNotificationReceived?: (notification: any) => void,
        onNotificationPressed?: (response: any) => void
    ): () => void {
        // Handle notification received while app is in foreground
        const notificationReceivedListener = Notifications.addNotificationReceivedListener(
            (notification) => {
                console.log('🔔 NotificationService: Notification received:', notification);
                onNotificationReceived?.(notification);
            }
        );

        // Handle notification pressed (when user taps on notification)
        const notificationResponseReceivedListener = Notifications.addNotificationResponseReceivedListener(
            (response) => {
                console.log('👆 NotificationService: Notification pressed:', response);
                onNotificationPressed?.(response);
            }
        );

        // Return cleanup function
        return () => {
            notificationReceivedListener.remove();
            notificationResponseReceivedListener.remove();
        };
    }
}

// ===============================
// 🔄 EXPORT SINGLETON INSTANCE & COMPATIBILITY FUNCTIONS
// ===============================

export const notificationService = new NotificationService();

// Compatibility exports for existing tests
export const getNotificationStatus = (): Promise<boolean> =>
    notificationService.getNotificationStatus();

export const requestNotificationPermissions = (): Promise<boolean> =>
    notificationService.requestPermissions();

export const scheduleTaskReminder = async (
    taskId: number,
    title: string,
    description: string,
    deadlineISO: string,
    isDeadline: boolean = false
): Promise<string | null> => {
    const config = reminderService.createReminderConfig(
        'task',
        taskId,
        title,
        description,
        deadlineISO,
        5 as ReminderTime
    );

    const result = await notificationService.scheduleNotification(config, deadlineISO);
    return result.success ? result.notificationId || null : null;
};