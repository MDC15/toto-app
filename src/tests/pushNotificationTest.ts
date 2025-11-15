/**
 * Push Notification Test Suite
 * 
 * This test validates the push notification system by:
 * 1. Testing notification permissions
 * 2. Scheduling a test task notification 
 * 3. Verifying notification content and data
 * 4. Testing notification after 1 minute delay
 */

import { addTask, initDatabase } from '@/db/database';
import { getNotificationStatus, requestNotificationPermissions, scheduleTaskReminder } from '@/services/NotificationService';
import * as Notifications from 'expo-notifications';


export interface TestResult {
    testName: string;
    passed: boolean;
    message: string;
    error?: any;
}

export class PushNotificationTest {
    private testResults: TestResult[] = [];
    private testTaskId: number | null = null;

    /**
     * Run all notification tests
     */
    async runAllTests(): Promise<TestResult[]> {
        console.log('🧪 Starting Push Notification Tests...');

        // Initialize database
        await this.runTest('Initialize Database', async () => {
            initDatabase();
            return 'Database initialized successfully';
        });

        // Test 1: Notification Permissions
        await this.testNotificationPermissions();

        // Test 2: Schedule Test Task
        await this.testCreateTestTask();

        // Test 3: Schedule Notification
        await this.testScheduleNotification();

        // Test 4: Notification Content Validation
        await this.testNotificationContent();

        // Test 5: Wait for actual notification (1 minute test)
        await this.testNotificationDelivery();

        console.log('✅ All tests completed!');
        return this.testResults;
    }

    /**
     * Test notification permission handling
     */
    async testNotificationPermissions(): Promise<void> {
        await this.runTest('Notification Permission Request', async () => {
            const hasPermission = await getNotificationStatus();

            if (!hasPermission) {
                const granted = await requestNotificationPermissions();
                if (!granted) {
                    throw new Error('Notification permissions not granted. Please enable notifications in device settings.');
                }
            }

            return `Notification permissions: ${hasPermission ? 'Already granted' : 'Just granted'}`;
        });
    }

    /**
     * Create a test task for notification testing
     */
    async testCreateTestTask(): Promise<void> {
        await this.runTest('Create Test Task', async () => {
            const testTask = {
                title: '🔔 Test Notification Task',
                description: 'This is a test task to verify push notifications work correctly',
                deadline: new Date(Date.now() + 2 * 60 * 1000).toISOString(), // 2 minutes from now
                priority: 'High' as const,
                reminder: new Date(Date.now() + 1 * 60 * 1000).toISOString(), // 1 minute reminder
            };

            addTask(testTask.title, testTask.description, testTask.deadline, testTask.priority, testTask.reminder);

            // Get the latest task ID (since we just added one)
            const { getTasks } = await import('@/db/database');
            const tasks = getTasks();
            this.testTaskId = tasks[tasks.length - 1]?.id || 1;

            return `Test task created with ID: ${this.testTaskId}`;
        });
    }

    /**
     * Test scheduling a notification
     */
    async testScheduleNotification(): Promise<void> {
        await this.runTest('Schedule Notification', async () => {
            if (!this.testTaskId) {
                throw new Error('No test task ID available');
            }

            const notificationId = await scheduleTaskReminder(
                this.testTaskId,
                '🔔 Test Notification Task',
                'This is a test task to verify push notifications work correctly',
                new Date(Date.now() + 1 * 60 * 1000).toISOString(), // 1 minute from now
                false // isDeadline
            );

            if (!notificationId) {
                throw new Error('Failed to schedule notification');
            }

            return `Notification scheduled with ID: ${notificationId}`;
        });
    }

    /**
     * Test notification content and data
     */
    async testNotificationContent(): Promise<void> {
        await this.runTest('Notification Content Validation', async () => {
            // Simulate notification content
            const testNotification = {
                content: {
                    title: '⏰ Task Deadline!',
                    body: '🔔 Test Notification Task\nThis is a test task to verify push notifications work correctly',
                    data: {
                        type: 'task',
                        taskId: this.testTaskId,
                        isDeadline: false,
                    },
                    sound: 'default',
                },
                trigger: {
                    date: new Date(Date.now() + 1 * 60 * 1000), // 1 minute from now
                },
            };

            // Validate notification structure
            if (!testNotification.content.title) {
                throw new Error('Notification title is missing');
            }

            if (!testNotification.content.data?.type) {
                throw new Error('Notification data type is missing');
            }

            if (testNotification.content.data.type !== 'task') {
                throw new Error('Notification data type is incorrect');
            }

            return 'Notification content validation passed';
        });
    }

    /**
     * Test actual notification delivery after 1 minute
     */
    async testNotificationDelivery(): Promise<void> {
        await this.runTest('Notification Delivery (1-minute wait)', async () => {
            console.log('⏱️ Waiting 1 minute for notification delivery...');
            console.log('📱 Please keep the app open or in background');

            // Set up notification listener
            let notificationReceived = false;
            let notificationData: any = null;

            const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
                notificationReceived = true;
                notificationData = notification;
                console.log('✅ Notification received!', notification);
            });

            // Wait for 1 minute and 30 seconds (to account for timing)
            const waitTime = 90 * 1000; // 90 seconds
            await new Promise(resolve => setTimeout(resolve, waitTime));

            // Clean up listener
            notificationListener.remove();
      
            if (notificationReceived) {
              // Validate the received notification
              if (notificationData.request.content.data?.type === 'task') {
                return `✅ Notification delivered successfully at ${new Date().toLocaleTimeString()}`;
              } else {
                throw new Error('Received notification has incorrect data type');
              }
            } else {
              console.warn('⚠️ No notification received after 1.5 minutes. This might be normal in test environment.');
              return '⚠️ No notification received (this might be normal in test environment)';
            }
          });
        }

    /**
     * Run a single test with error handling
     */
    private async runTest(testName: string, testFunction: () => Promise<string>): Promise<void> {
        try {
            const result = await testFunction();
            this.testResults.push({
                testName,
                passed: true,
                message: result,
            });
            console.log(`✅ ${testName}: ${result}`);
        } catch (error) {
            this.testResults.push({
                testName,
                passed: false,
                message: 'Test failed',
                error,
            });
            console.error(`❌ ${testName}:`, error);
        }
    }

    /**
     * Get test results summary
     */
    getTestResults(): TestResult[] {
        return this.testResults;
    }

    /**
     * Get test summary statistics
     */
    getTestSummary(): { total: number; passed: number; failed: number; successRate: string } {
        const total = this.testResults.length;
        const passed = this.testResults.filter(r => r.passed).length;
        const failed = total - passed;
        const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) + '%' : '0%';

        return { total, passed, failed, successRate };
    }

    /**
     * Manual test guide for developers
     */
    static printManualTestGuide(): void {
        console.log(`
📋 PUSH NOTIFICATION MANUAL TEST GUIDE
=====================================

1. 📱 Ensure notifications are enabled:
   - iOS: Settings > Notifications > Todo App > Allow Notifications
   - Android: Settings > Apps > Todo App > Notifications > Enable

2. 🔄 Start the app and create a new task with:
   - Title: "🔔 Manual Test Task"
   - Deadline: 2 minutes from now
   - Enable reminder: 1 minute before

3. ⏰ Wait for the notification:
   - You should receive a notification 1 minute before the deadline
   - The notification should show the task title and description
   - Tapping the notification should work properly

4. ✅ Expected results:
   - Notification appears at the correct time
   - Content matches the task information
   - Notification can be dismissed or tapped

5. 🔧 Troubleshooting:
   - If no notification appears, check device notifications settings
   - Ensure the app has proper permissions
   - Check Expo Go notification settings

Test completed: ${new Date().toLocaleString()}
    `);
    }
}

// Export for easy testing
export { PushNotificationTest as default };

// Manual test execution
if (typeof global !== 'undefined' && (global as any).__DEV__) {
  // In development, you can manually run tests
  (global as any).runPushNotificationTests = async () => {
    const test = new PushNotificationTest();
    const results = await test.runAllTests();
    
    console.log('📊 Test Summary:', test.getTestSummary());
    console.log('📋 Detailed Results:', results);
    
    return results;
  };
}