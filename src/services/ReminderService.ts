import {
    IReminderService,
    REMINDER_CONSTANTS,
    ReminderConfig,
    ReminderTime,
    ReminderType,
    StandardReminderTime
} from '@/types/reminder.types';

// ===============================
// 🔧 REMINDER SERVICE - BUSINESS LOGIC
// ===============================

class ReminderService implements IReminderService {

    // ===============================
    // 🧮 CORE CALCULATION METHODS
    // ===============================

    /**
     * Calculate reminder time based on main time and reminder configuration
     */
    calculateReminderTime(mainTime: string, reminderTime: ReminderTime): string {
        const mainDate = new Date(mainTime);

        if (!this.isValidDate(mainDate)) {
            throw new Error('Invalid main time provided');
        }

        if (reminderTime === null) {
            return ''; // No reminder
        }

        // Handle standard reminder times (1, 5, 30 minutes)
        if (typeof reminderTime === 'number') {
            const minutes = reminderTime as StandardReminderTime;
            return this.calculateStandardReminder(mainDate, minutes);
        }

        return '';
    }

    /**
     * Calculate standard reminder time (1, 5, 30 minutes before)
     */
    private calculateStandardReminder(mainDate: Date, minutesBefore: StandardReminderTime): string {
        const reminderDate = new Date(mainDate);
        reminderDate.setMinutes(reminderDate.getMinutes() - minutesBefore);
        return reminderDate.toISOString();
    }

    // ===============================
    // ✅ VALIDATION METHODS
    // ===============================

    /**
     * Validate if reminder time is valid
     */
    validateReminderTime(reminderTime: ReminderTime, mainTime?: string): boolean {
        // If no reminder time, it's valid
        if (reminderTime === null) {
            return true;
        }

        // For standard times, always valid (numbers are automatically valid)
        if (typeof reminderTime === 'number') {
            return true;
        }

        return false;
    }

    // ===============================
    // 🎨 FORMATTING METHODS
    // ===============================

    /**
     * Format reminder time for display
     */
    formatReminderDisplay(reminderTime: ReminderTime, mainTime?: string): string {
        if (reminderTime === null) {
            return 'Off';
        }

        if (typeof reminderTime === 'number') {
            return this.formatStandardReminder(reminderTime);
        }

        return 'Invalid';
    }

    /**
     * Format standard reminder display
     */
    private formatStandardReminder(minutes: StandardReminderTime): string {
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            return `${hours} hour${hours > 1 ? 's' : ''} before`;
        } else {
            return `${minutes} minute${minutes > 1 ? 's' : ''} before`;
        }
    }

    // ===============================
    // 📋 OPTIONS GENERATION
    // ===============================

    /**
     * Get standard reminder options for a type
     */
    getStandardReminderOptions(type: ReminderType): {
        label: string;
        value: ReminderTime;
        icon: string;
    }[] {
        const baseOptions = [
            {
                label: '1 minute before',
                value: 1 as ReminderTime,
                icon: 'time-outline'
            },
            {
                label: '5 minutes before',
                value: 5 as ReminderTime,
                icon: 'time-outline'
            },
            {
                label: '30 minutes before',
                value: 30 as ReminderTime,
                icon: 'time-outline'
            }
        ];

        const offOption = {
            label: 'Turn off reminders',
            value: null as ReminderTime,
            icon: 'notifications-off-outline'
        };

        return [...baseOptions, offOption];
    }

    // ===============================
    // 🛠️ UTILITY METHODS
    // ===============================

    /**
     * Check if date is valid
     */
    private isValidDate(date: Date): boolean {
        return date instanceof Date && !isNaN(date.getTime());
    }

    /**
     * Get default reminder time for a type
     */
    getDefaultReminderTime(type: ReminderType): ReminderTime {
        switch (type) {
            case 'task':
                return 30; // 30 minutes before deadline
            case 'event':
                return 5; // 5 minutes before start
            case 'habit':
                return 5; // 5 minutes before habit time
            default:
                return 5;
        }
    }

    /**
     * Create reminder config from basic parameters
     */
    createReminderConfig(
        type: ReminderType,
        id: number,
        title: string,
        description: string,
        mainTime: string,
        reminderTime?: ReminderTime
    ): ReminderConfig {
        const time = reminderTime ?? this.getDefaultReminderTime(type);

        const baseConfig = {
            type,
            id,
            title,
            description,
            reminderTime: time,
            enabled: time !== null,
            priority: REMINDER_CONSTANTS.DEFAULT_PRIORITY,
            channel: REMINDER_CONSTANTS.CHANNELS[type.toUpperCase() as keyof typeof REMINDER_CONSTANTS.CHANNELS]
        };

        switch (type) {
            case 'task':
                return {
                    ...baseConfig,
                    type: 'task' as const,
                    deadline: mainTime,
                    isDeadlineReminder: true
                };
            case 'event':
                return {
                    ...baseConfig,
                    type: 'event' as const,
                    startTime: mainTime,
                    isStartTimeReminder: true
                };
            case 'habit':
                return {
                    ...baseConfig,
                    type: 'habit' as const,
                    frequency: 'daily' as const,
                    dailyTime: mainTime
                };
            default:
                throw new Error(`Unknown reminder type: ${type}`);
        }
    }
}

// ===============================
// 🔄 EXPORT SINGLETON INSTANCE
// ===============================

export const reminderService = new ReminderService();