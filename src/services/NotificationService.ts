import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
    }),
});

// ===============================
// 📱 PERMISSION MANAGEMENT
// ===============================
export const requestNotificationPermissions = async (): Promise<boolean> => {
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

        // Handle platform-specific setup
        if (Platform.OS === 'android') {
            // Create default channel first
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
                enableVibrate: true,
                enableLights: true,
            });

            // Create specific channels for different notification types
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
        }

        // If permission is granted, immediately schedule a test notification to confirm
        if (finalStatus === 'granted') {
            try {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: "🎉 Notifications Enabled!",
                        body: "You'll now receive reminders and updates.",
                        sound: 'default',
                    },
                    trigger: null, // Send immediately
                });
                console.log('✅ Test notification sent to confirm permissions are working');
            } catch (testError) {
                console.warn('⚠️ Test notification failed but permission is granted:', testError);
            }
        }

        return finalStatus === 'granted';
    } catch (error) {
        console.error('❌ Error requesting notification permissions:', error);
        return false;
    }
};

export const getNotificationStatus = async (): Promise<boolean> => {
    try {
        const { status } = await Notifications.getPermissionsAsync();
        const hasPermission = status === 'granted';
        console.log('🔍 Current notification status:', status, hasPermission);
        return hasPermission;
    } catch (error) {
        console.error('❌ Error getting notification status:', error);
        return false;
    }
};

// ===============================
// 🔔 SCHEDULING NOTIFICATIONS
// ===============================

// Schedule a task reminder
export const scheduleTaskReminder = async (
    taskId: number,
    taskTitle: string,
    taskDescription: string,
    reminderTime: string,
    isDeadline: boolean = false
): Promise<string | null> => {
    try {
        console.log('🔔 Service: Scheduling task reminder:', { taskId, taskTitle, reminderTime, isDeadline });

        const hasPermission = await getNotificationStatus();
        if (!hasPermission) {
            console.warn('⚠️ Service: No notification permission for task reminder');
            return null;
        }

        const triggerDate = new Date(reminderTime);
        console.log('⏰ Service: Trigger date:', triggerDate);

        const identifier = await Notifications.scheduleNotificationAsync({
            content: {
                title: isDeadline ? '⏰ Task Deadline!' : '📋 Task Reminder',
                body: `${taskTitle}${taskDescription ? `\n${taskDescription}` : ''}`,
                data: {
                    type: 'task',
                    taskId,
                    isDeadline,
                },
                sound: 'default',
            },
            trigger: {
                date: triggerDate,
            } as any,
        });

        console.log(`✅ Service: Task reminder scheduled successfully: ${identifier}`);
        return identifier;
    } catch (error) {
        console.error('❌ Service: Error scheduling task reminder:', error);
        return null;
    }
};

// Schedule an event reminder
export const scheduleEventReminder = async (
    eventId: number,
    eventTitle: string,
    eventDescription: string,
    reminderTime: string,
    isStartTime: boolean = true
): Promise<string | null> => {
    try {
        console.log('🔔 Service: Scheduling event reminder:', { eventId, eventTitle, reminderTime, isStartTime });

        const hasPermission = await getNotificationStatus();
        if (!hasPermission) {
            console.warn('⚠️ Service: No notification permission for event reminder');
            return null;
        }

        const triggerDate = new Date(reminderTime);
        console.log('⏰ Service: Trigger date:', triggerDate);

        const identifier = await Notifications.scheduleNotificationAsync({
            content: {
                title: isStartTime ? '🗓️ Event Starting Soon!' : '⏰ Event Reminder',
                body: `${eventTitle}${eventDescription ? `\n${eventDescription}` : ''}`,
                data: {
                    type: 'event',
                    eventId,
                    isStartTime,
                },
                sound: 'default',
            },
            trigger: {
                date: triggerDate,
            } as any,
        });

        console.log(`✅ Service: Event reminder scheduled successfully: ${identifier}`);
        return identifier;
    } catch (error) {
        console.error('❌ Service: Error scheduling event reminder:', error);
        return null;
    }
};

// Schedule a habit reminder
export const scheduleHabitReminder = async (
    habitId: number,
    habitTitle: string,
    habitDescription: string,
    reminderTime: string,
    frequency: 'daily' | 'weekly' | 'custom' = 'daily'
): Promise<string | null> => {
    try {
        console.log('🔔 Service: Scheduling habit reminder:', { habitId, habitTitle, reminderTime, frequency });
        
        const hasPermission = await getNotificationStatus();
        if (!hasPermission) {
            console.warn('⚠️ Service: No notification permission for habit reminder');
            return null;
        }

        let trigger: any;

        if (frequency === 'daily') {
            // Extract time from reminderTime and create daily trigger
            const reminderDate = new Date(reminderTime);
            trigger = {
                hour: reminderDate.getHours(),
                minute: reminderDate.getMinutes(),
                repeats: true,
            };
            console.log('📅 Service: Daily habit trigger:', trigger);
        } else {
            // For weekly/custom, use one-time notification
            trigger = {
                date: new Date(reminderTime),
            };
            console.log('📅 Service: One-time habit trigger:', trigger);
        }

        const identifier = await Notifications.scheduleNotificationAsync({
            content: {
                title: '🏃 Habit Reminder',
                body: `Time for: ${habitTitle}${habitDescription ? `\n${habitDescription}` : ''}`,
                data: {
                    type: 'habit',
                    habitId,
                    frequency,
                },
                sound: 'default',
            },
            trigger,
        });

        console.log(`✅ Service: Habit reminder scheduled successfully: ${identifier}`);
        return identifier;
    } catch (error) {
        console.error('❌ Service: Error scheduling habit reminder:', error);
        return null;
    }
};

// ===============================
// 🗑️ CANCELING NOTIFICATIONS
// ===============================

export const cancelNotification = async (identifier: string): Promise<void> => {
    try {
        await Notifications.cancelScheduledNotificationAsync(identifier);
        console.log(`✅ Notification ${identifier} cancelled`);
    } catch (error) {
        console.error('❌ Error cancelling notification:', error);
    }
};

export const cancelAllNotifications = async (): Promise<void> => {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('✅ All notifications cancelled');
    } catch (error) {
        console.error('❌ Error cancelling all notifications:', error);
    }
};

// ===============================
// 📊 UTILITY FUNCTIONS
// ===============================

// Calculate reminder time based on deadline/start time and offset
export const calculateReminderTime = (
    mainTime: string,
    reminderOffset: { hours?: number; minutes?: number } = { hours: 1 }
): string => {
    const mainDate = new Date(mainTime);
    const reminderDate = new Date(mainDate);

    if (reminderOffset.hours) {
        reminderDate.setHours(reminderDate.getHours() - reminderOffset.hours);
    }
    if (reminderOffset.minutes) {
        reminderDate.setMinutes(reminderDate.getMinutes() - reminderOffset.minutes);
    }

    return reminderDate.toISOString();
};

// Check if a reminder time is in the future
export const isReminderTimeValid = (reminderTime: string): boolean => {
    const now = new Date();
    const reminderDate = new Date(reminderTime);
    return reminderDate > now;
};

// Get default reminder times for different types
export const getDefaultReminderTimes = (type: 'task' | 'event' | 'habit') => {
    switch (type) {
        case 'task':
            return [
                { label: '1 hour before', value: { hours: 1 } },
                { label: '2 hours before', value: { hours: 2 } },
                { label: '1 day before', value: { hours: 24 } },
                { label: 'None', value: null },
            ];
        case 'event':
            return [
                { label: '15 minutes before', value: { minutes: 15 } },
                { label: '30 minutes before', value: { minutes: 30 } },
                { label: '1 hour before', value: { hours: 1 } },
                { label: '2 hours before', value: { hours: 2 } },
                { label: 'None', value: null },
            ];
        case 'habit':
            return [
                { label: '9:00 AM', value: { hour: 9, minute: 0 } },
                { label: '12:00 PM', value: { hour: 12, minute: 0 } },
                { label: '6:00 PM', value: { hour: 18, minute: 0 } },
                { label: '9:00 PM', value: { hour: 21, minute: 0 } },
                { label: 'None', value: null },
            ];
        default:
            return [];
    }
};

// ===============================
// 🔄 SETUP NOTIFICATION LISTENERS
// ===============================

export const setupNotificationListeners = (
    onNotificationReceived?: (notification: any) => void,
    onNotificationPressed?: (response: any) => void
) => {
    // Handle notification received while app is in foreground
    const notificationReceivedListener = Notifications.addNotificationReceivedListener(
        (notification) => {
            console.log('🔔 Notification received:', notification);
            onNotificationReceived?.(notification);
        }
    );

    // Handle notification pressed (when user taps on notification)
    const notificationResponseReceivedListener = Notifications.addNotificationResponseReceivedListener(
        (response) => {
            console.log('👆 Notification pressed:', response);
            onNotificationPressed?.(response);
        }
    );

    // Return cleanup function
    return () => {
        notificationReceivedListener.remove();
        notificationResponseReceivedListener.remove();
    };
};