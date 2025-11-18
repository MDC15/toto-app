import {
    IIntegrationService,
    NotificationContent,
    ReminderConfig,
    ReminderResult
} from '@/types/reminder.types';
import { notificationService } from './NotificationService';
import { reminderService } from './ReminderService';

// ===============================
// 🔄 INTEGRATION SERVICE - ORCHESTRATION
// ===============================

class IntegrationService implements IIntegrationService {

    // ===============================
    // 🏗️ SETUP REMINDERS
    // ===============================

    /**
     * Setup a complete reminder with all validation and scheduling
     */
    async setupReminder(config: ReminderConfig): Promise<ReminderResult> {
        try {
            console.log('🔄 IntegrationService: Setting up reminder', { type: config.type, id: config.id });

            // Validate the reminder configuration
            const validationResult = this.validateReminderConfig(config);
            if (!validationResult.isValid) {
                return {
                    success: false,
                    error: validationResult.error
                };
            }

            // Calculate reminder time
            const mainTime = this.getMainTimeForConfig(config);
            let calculatedTime: string;

            try {
                calculatedTime = reminderService.calculateReminderTime(mainTime, config.reminderTime);
            } catch (error) {
                return {
                    success: false,
                    error: `Failed to calculate reminder time: ${error instanceof Error ? error.message : 'Unknown error'}`
                };
            }

            // Validate calculated time is in the future
            if (!reminderService.validateReminderTime(config.reminderTime, mainTime)) {
                return {
                    success: false,
                    error: 'Reminder time must be in the future'
                };
            }

            // Create notification content
            const notificationContent = this.createNotificationContent(config, calculatedTime);

            // Schedule the notification
            const scheduleResult = await notificationService.scheduleNotification(config, calculatedTime);

            if (scheduleResult.success) {
                console.log('✅ IntegrationService: Reminder scheduled successfully', {
                    id: config.id,
                    notificationId: scheduleResult.notificationId
                });
            }

            return {
                ...scheduleResult,
                reminderTime: calculatedTime
            };

        } catch (error) {
            console.error('❌ IntegrationService: Error setting up reminder', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Cancel a specific reminder
     */
    async cancelReminder(config: ReminderConfig): Promise<void> {
        try {
            console.log('🔄 IntegrationService: Canceling reminder', { type: config.type, id: config.id });

            // Get the scheduled notification ID
            const notificationId = this.scheduledReminders.get(config.id);

            if (notificationId) {
                await notificationService.cancelNotification(notificationId);
                this.scheduledReminders.delete(config.id);
                console.log('✅ IntegrationService: Reminder canceled successfully');
            } else {
                console.warn('⚠️ IntegrationService: No scheduled reminder found for ID:', config.id);
            }
        } catch (error) {
            console.error('❌ IntegrationService: Error canceling reminder', error);
            throw error;
        }
    }

    /**
     * Cancel all scheduled reminders
     */
    async cancelAllReminders(): Promise<void> {
        try {
            console.log('🔄 IntegrationService: Canceling all reminders');

            await notificationService.cancelAllNotifications();
            this.scheduledReminders.clear();

            console.log('✅ IntegrationService: All reminders canceled');
        } catch (error) {
            console.error('❌ IntegrationService: Error canceling all reminders', error);
            throw error;
        }
    }

    /**
     * Get all scheduled reminders
     */
    getScheduledReminders(): Map<number, string> {
        return new Map(this.scheduledReminders);
    }

    // ===============================
    // ✅ VALIDATION METHODS
    // ===============================

    /**
     * Validate reminder configuration
     */
    private validateReminderConfig(config: ReminderConfig): { isValid: boolean; error?: string } {
        // Check if reminder is enabled
        if (!config.enabled) {
            return { isValid: true }; // Disabled reminders are valid
        }

        // Check if reminder time is provided
        if (config.reminderTime === null || config.reminderTime === undefined) {
            return { isValid: false, error: 'Reminder time is required when reminder is enabled' };
        }

        // Get main time based on type
        const mainTime = this.getMainTimeForConfig(config);

        if (!mainTime) {
            return { isValid: false, error: 'Main time (deadline/start time) is required' };
        }

        // Validate main time format
        const mainDate = new Date(mainTime);
        if (isNaN(mainDate.getTime())) {
            return { isValid: false, error: 'Invalid main time format' };
        }

        // Validate reminder time
        if (!reminderService.validateReminderTime(config.reminderTime, mainTime)) {
            return { isValid: false, error: 'Reminder time is invalid or in the past' };
        }

        return { isValid: true };
    }

    /**
     * Get main time based on reminder config type
     */
    private getMainTimeForConfig(config: ReminderConfig): string {
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
    }

    // ===============================
    // 📱 NOTIFICATION CONTENT
    // ===============================

    /**
     * Create notification content for different reminder types
     */
    private createNotificationContent(config: ReminderConfig, reminderTime: string): NotificationContent {
        const { type, title, description, priority } = config;

        let notificationTitle: string;
        let notificationBody: string;

        switch (type) {
            case 'task':
                notificationTitle = '📋 Task Reminder';
                notificationBody = this.formatTaskNotificationBody(title, description);
                break;

            case 'event':
                notificationTitle = '🗓️ Event Reminder';
                notificationBody = this.formatEventNotificationBody(title, description);
                break;

            case 'habit':
                notificationTitle = '🏃 Habit Reminder';
                notificationBody = this.formatHabitNotificationBody(title, description);
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
     * Format task notification body
     */
    private formatTaskNotificationBody(title: string, description: string): string {
        let body = title;
        if (description) {
            body += `\n${description}`;
        }
        body += `\n\n📅 Task deadline approaching!`;
        return body;
    }

    /**
     * Format event notification body
     */
    private formatEventNotificationBody(title: string, description: string): string {
        let body = title;
        if (description) {
            body += `\n${description}`;
        }
        body += `\n\n🕐 Event starting soon!`;
        return body;
    }

    /**
     * Format habit notification body
     */
    private formatHabitNotificationBody(title: string, description: string): string {
        let body = `Time for: ${title}`;
        if (description) {
            body += `\n${description}`;
        }
        return body;
    }

    // ===============================
    // 🏷️ INTERNAL STATE
    // ===============================

    /**
     * Internal map of scheduled reminders
     * entityId -> notificationId
     */
    private scheduledReminders: Map<number, string> = new Map();

    // ===============================
    // 🛠️ UTILITY METHODS
    // ===============================

    /**
     * Register a scheduled reminder in internal state
     */
    registerScheduledReminder(entityId: number, notificationId: string): void {
        this.scheduledReminders.set(entityId, notificationId);
    }

    /**
     * Unregister a scheduled reminder from internal state
     */
    unregisterScheduledReminder(entityId: number): void {
        this.scheduledReminders.delete(entityId);
    }

    /**
     * Check if a reminder is currently scheduled
     */
    isReminderScheduled(entityId: number): boolean {
        return this.scheduledReminders.has(entityId);
    }

    /**
     * Get notification ID for a reminder
     */
    getNotificationId(entityId: number): string | undefined {
        return this.scheduledReminders.get(entityId);
    }

    /**
     * Get scheduled reminders count
     */
    getScheduledCount(): number {
        return this.scheduledReminders.size;
    }
}

// ===============================
// 🔄 EXPORT SINGLETON INSTANCE
// ===============================

export const integrationService = new IntegrationService();