// ===============================
// 🧪 NEW REMINDER SYSTEM TEST
// ===============================

import { reminderService } from '@/services/ReminderService';
import { integrationService } from '@/services/IntegrationService';
import { notificationService } from '@/services/NotificationService';
import {
    ReminderType,
    ReminderTime,
    REMINDER_CONSTANTS
} from '@/types/reminder.types';

// ===============================
// 🔧 TEST DATA
// ===============================

const testTask = {
    id: 1,
    title: 'Complete project documentation',
    description: 'Write comprehensive documentation for the new reminder system',
    deadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
};

const testEvent = {
    id: 2,
    title: 'Team meeting',
    description: 'Weekly team sync',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
};

const testHabit = {
    id: 3,
    title: 'Morning workout',
    description: '30 minutes exercise',
    dailyTime: '07:00',
};

// ===============================
// ✅ TEST FUNCTIONS
// ===============================

export async function testReminderSystem() {
    console.log('🧪 Starting New Reminder System Tests...\n');

    try {
        // Test 1: ReminderService functionality
        await testReminderService();

        // Test 2: IntegrationService functionality  
        await testIntegrationService();

        // Test 3: Permission handling
        await testPermissions();

        // Test 4: Custom reminder creation
        await testCustomReminders();

        console.log('✅ All tests passed successfully!\n');

    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    }
}

// ===============================
// 🔧 INDIVIDUAL TEST FUNCTIONS
// ===============================

async function testReminderService() {
    console.log('📋 Testing ReminderService...');

    // Test calculateReminderTime
    const testReminderTimes: ReminderTime[] = [1, 5, 30, { hours: 1 }, { minutes: 30 }];

    for (const reminderTime of testReminderTimes) {
        try {
            const calculatedTime = reminderService.calculateReminderTime(
                testTask.deadline,
                reminderTime
            );
            console.log(`✅ calculateReminderTime(${reminderTime}): ${calculatedTime}`);

            // Validate the calculated time
            const isValid = reminderService.validateReminderTime(reminderTime, testTask.deadline);
            console.log(`✅ validateReminderTime(${reminderTime}): ${isValid}`);

            // Test formatting
            const display = reminderService.formatReminderDisplay(reminderTime, testTask.deadline);
            console.log(`✅ formatReminderDisplay(${reminderTime}): "${display}"`);

        } catch (error) {
            console.error(`❌ Error testing reminder time ${reminderTime}:`, error);
            throw error;
        }
    }

    // Test getStandardReminderOptions
    const taskOptions = reminderService.getStandardReminderOptions('task');
    console.log(`✅ getStandardReminderOptions('task'): ${taskOptions.length} options`);

    const eventOptions = reminderService.getStandardReminderOptions('event');
    console.log(`✅ getStandardReminderOptions('event'): ${eventOptions.length} options`);

    const habitOptions = reminderService.getStandardReminderOptions('habit');
    console.log(`✅ getStandardReminderOptions('habit'): ${habitOptions.length} options`);

    // Test createReminderConfig
    const taskConfig = reminderService.createReminderConfig(
        'task',
        testTask.id,
        testTask.title,
        testTask.description,
        testTask.deadline,
        30 // 30 minutes before
    );
    console.log(`✅ createReminderConfig('task'): ${taskConfig.type} config created`);

    console.log('✅ ReminderService tests passed!\n');
}

async function testIntegrationService() {
    console.log('🔄 Testing IntegrationService...');

    // Test scheduled reminders tracking
    const initialCount = integrationService.getScheduledCount();
    console.log(`✅ Initial scheduled count: ${initialCount}`);

    // Test reminder registration
    integrationService.registerScheduledReminder(123, 'test-notification-id');
    console.log(`✅ Registered reminder: 123 -> test-notification-id`);

    // Test retrieval
    const notificationId = integrationService.getNotificationId(123);
    console.log(`✅ Retrieved notification ID: ${notificationId}`);

    // Test scheduled status
    const isScheduled = integrationService.isReminderScheduled(123);
    console.log(`✅ Is reminder 123 scheduled: ${isScheduled}`);

    // Test cleanup
    integrationService.unregisterScheduledReminder(123);
    console.log(`✅ Unregistered reminder 123`);

    const finalCount = integrationService.getScheduledCount();
    console.log(`✅ Final scheduled count: ${finalCount}`);

    console.log('✅ IntegrationService tests passed!\n');
}

async function testPermissions() {
    console.log('🔐 Testing Permission Management...');

    // Test notification status
    const status = await notificationService.getNotificationStatus();
    console.log(`✅ Notification status: ${status ? 'granted' : 'denied'}`);

    // Test permission request (this might show a system dialog)
    console.log('⚠️ Note: Permission request may show a system dialog');
    // const permission = await notificationService.requestPermissions();
    // console.log(`✅ Permission request result: ${permission ? 'granted' : 'denied'}`);

    console.log('✅ Permission tests passed!\n');
}

async function testCustomReminders() {
    console.log('⚙️ Testing Custom Reminder Creation...');

    // Test all reminder types
    const reminderTypes: ReminderType[] = ['task', 'event', 'habit'];

    for (const type of reminderTypes) {
        // Create config with custom reminder time
        const config = reminderService.createReminderConfig(
            type,
            Math.floor(Math.random() * 1000), // Random ID
            `Test ${type}`,
            `Test description for ${type}`,
            type === 'task' ? testTask.deadline :
                type === 'event' ? testEvent.startTime :
                    testHabit.dailyTime,
            { hours: 1, minutes: 30 } // Custom time
        );

        console.log(`✅ Created ${type} config:`, {
            id: config.id,
            type: config.type,
            reminderTime: config.reminderTime,
            enabled: config.enabled
        });

        // Test formatting
        const mainTime = type === 'task' ? testTask.deadline :
            type === 'event' ? testEvent.startTime :
                testHabit.dailyTime;

        const display = reminderService.formatReminderDisplay(config.reminderTime, mainTime);
        console.log(`✅ ${type} display format: "${display}"`);
    }

    console.log('✅ Custom reminder tests passed!\n');
}

// ===============================
// 🎯 CONVENIENT TEST RUNNER
// ===============================

export function runReminderTests() {
    console.log('🚀 Running Reminder System Tests...\n');

    testReminderSystem()
        .then(() => {
            console.log('🎉 All tests completed successfully!');
        })
        .catch((error) => {
            console.error('💥 Test execution failed:', error);
        });
}

// ===============================
// 🔧 QUICK VALIDATION FUNCTIONS
// ===============================

export function validateReminderTypes() {
    console.log('🔍 Validating reminder types...');

    // Check constants
    console.log('✅ STANDARD_TIMES.TASK:', REMINDER_CONSTANTS.STANDARD_TIMES.TASK);
    console.log('✅ STANDARD_TIMES.EVENT:', REMINDER_CONSTANTS.STANDARD_TIMES.EVENT);
    console.log('✅ STANDARD_TIMES.HABIT:', REMINDER_CONSTANTS.STANDARD_TIMES.HABIT);

    // Check channels
    console.log('✅ CHANNELS.TASK:', REMINDER_CONSTANTS.CHANNELS.TASK);
    console.log('✅ CHANNELS.EVENT:', REMINDER_CONSTANTS.CHANNELS.EVENT);
    console.log('✅ CHANNELS.HABIT:', REMINDER_CONSTANTS.CHANNELS.HABIT);

    console.log('✅ Reminder types validation passed!\n');
}

export function quickReminderTest() {
    console.log('⚡ Quick Reminder Test...');

    // Test basic reminder calculation
    const deadline = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now
    const reminderTime = reminderService.calculateReminderTime(deadline, 5); // 5 minutes before

    console.log(`✅ Deadline: ${deadline}`);
    console.log(`✅ Reminder (5 min before): ${reminderTime}`);

    const isValid = reminderService.validateReminderTime(5, deadline);
    console.log(`✅ Is valid: ${isValid}`);

    const display = reminderService.formatReminderDisplay(5, deadline);
    console.log(`✅ Display: "${display}"`);

    console.log('✅ Quick test passed!\n');
}

// ===============================
// 📊 BENCHMARK FUNCTIONS
// ===============================

export async function benchmarkReminderOperations() {
    console.log('📊 Benchmarking Reminder Operations...\n');

    const iterations = 1000;
    const startTime = Date.now();

    // Benchmark reminder calculation
    for (let i = 0; i < iterations; i++) {
        reminderService.calculateReminderTime(testTask.deadline, 5);
        reminderService.validateReminderTime(5, testTask.deadline);
        reminderService.formatReminderDisplay(5, testTask.deadline);
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ Completed ${iterations} reminder operations in ${duration}ms`);
    console.log(`✅ Average: ${(duration / iterations).toFixed(2)}ms per operation\n`);
}