import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useNotifications } from '@/contexts/NotificationContext';
import { Ionicons } from '@expo/vector-icons';

export function NotificationTest() {
    const {
        hasPermission,
        requestPermission,
        scheduleTaskNotification,
        scheduleEventNotification,
        scheduleHabitNotification,
        cancelAllNotificationSchedules
    } = useNotifications();

    const [testResults, setTestResults] = useState<string[]>([]);

    const addTestResult = (message: string) => {
        setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const testTaskNotification = async () => {
        if (!hasPermission) {
            addTestResult('❌ No permission for task test');
            return;
        }

        try {
            const testDeadline = new Date(Date.now() + 120000); // 2 minutes from now
            const result = await scheduleTaskNotification(
                999, // Test task ID
                '🧪 Test Task',
                'This is a test notification for task reminders',
                testDeadline.toISOString(),
                { minutes: 1 } // 1 minute before deadline
            );

            if (result) {
                addTestResult('✅ Task notification scheduled - will trigger in 1 minute');
            } else {
                addTestResult('❌ Failed to schedule task notification');
            }
        } catch (error) {
            addTestResult(`❌ Task test error: ${error}`);
        }
    };

    const testEventNotification = async () => {
        if (!hasPermission) {
            addTestResult('❌ No permission for event test');
            return;
        }

        try {
            const testStartTime = new Date(Date.now() + 180000); // 3 minutes from now
            const result = await scheduleEventNotification(
                999, // Test event ID
                '🧪 Test Event',
                'This is a test event notification',
                testStartTime.toISOString(),
                { minutes: 2 } // 2 minutes before start time
            );

            if (result) {
                addTestResult('✅ Event notification scheduled - will trigger in 2 minutes');
            } else {
                addTestResult('❌ Failed to schedule event notification');
            }
        } catch (error) {
            addTestResult(`❌ Event test error: ${error}`);
        }
    };

    const testHabitNotification = async () => {
        if (!hasPermission) {
            addTestResult('❌ No permission for habit test');
            return;
        }

        const now = new Date();
        const testTime = new Date(now);
        testTime.setMinutes(testTime.getMinutes() + 3); // 3 minutes from now

        const result = await scheduleHabitNotification(
            999, // Test habit ID
            'Test Habit',
            'This is a test habit notification',
            testTime.toISOString(),
            'daily'
        );

        if (result) {
            addTestResult('✅ Habit notification scheduled successfully');
        } else {
            addTestResult('❌ Failed to schedule habit notification');
        }
    };

    const testImmediateNotification = async () => {
        if (!hasPermission) {
            addTestResult('❌ No permission for immediate test');
            return;
        }

        try {
            // Test with immediate notification
            const testDeadline = new Date(Date.now() + 10000); // 10 seconds from now
            const result = await scheduleTaskNotification(
                998, // Test task ID for immediate test
                '🚀 Immediate Test',
                'This notification should appear in 10 seconds!',
                testDeadline.toISOString(),
                { minutes: 0 } // No offset - should be immediate
            );

            if (result) {
                addTestResult('✅ Immediate notification scheduled (10 seconds)');
            } else {
                addTestResult('❌ Failed to schedule immediate notification');
            }
        } catch (error) {
            addTestResult(`❌ Immediate test error: ${error}`);
        }
    };

    const testPermissionRequest = async () => {
        const granted = await requestPermission();
        if (granted) {
            addTestResult('✅ Notification permission granted');
        } else {
            addTestResult('❌ Notification permission denied');
        }
    };

    const clearAllNotifications = async () => {
        await cancelAllNotificationSchedules();
        addTestResult('🗑️ All notifications cleared');
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedText style={styles.title}>🔔 Notification System Test</ThemedText>

            <View style={styles.permissionStatus}>
                <ThemedText style={styles.status}>
                    Permission: {hasPermission ? '✅ Granted' : '❌ Not Granted'}
                </ThemedText>
            </View>

            <View style={styles.testButtons}>
                {!hasPermission && (
                    <TouchableOpacity
                        style={styles.testButton}
                        onPress={testPermissionRequest}
                    >
                        <Ionicons name="notifications" size={20} color="#FF9500" />
                        <ThemedText style={styles.buttonText}>Request Permission</ThemedText>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={styles.testButton}
                    onPress={testImmediateNotification}
                    disabled={!hasPermission}
                >
                    <Ionicons name="flash" size={20} color="#FF3B30" />
                    <ThemedText style={styles.buttonText}>🚀 Test Immediate (10 sec)</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.testButton}
                    onPress={testTaskNotification}
                    disabled={!hasPermission}
                >
                    <Ionicons name="checkbox" size={20} color="#34C759" />
                    <ThemedText style={styles.buttonText}>📋 Test Task (1 min)</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.testButton}
                    onPress={testEventNotification}
                    disabled={!hasPermission}
                >
                    <Ionicons name="calendar" size={20} color="#007AFF" />
                    <ThemedText style={styles.buttonText}>📅 Test Event (2 min)</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.testButton}
                    onPress={testHabitNotification}
                    disabled={!hasPermission}
                >
                    <Ionicons name="fitness" size={20} color="#FF9500" />
                    <ThemedText style={styles.buttonText}>🏃 Test Habit (3 min)</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={clearAllNotifications}
                >
                    <Ionicons name="trash" size={20} color="#FF3B30" />
                    <ThemedText style={styles.clearButtonText}>🗑️ Clear All</ThemedText>
                </TouchableOpacity>
            </View>

            <ThemedText style={styles.resultsTitle}>Test Results:</ThemedText>
            <View style={styles.resultsContainer}>
                {testResults.length === 0 ? (
                    <ThemedText style={styles.noResults}>No tests run yet</ThemedText>
                ) : (
                    testResults.map((result, index) => (
                        <ThemedText key={index} style={styles.resultText}>{result}</ThemedText>
                    ))
                )}
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    permissionStatus: {
        alignItems: 'center',
        marginBottom: 16,
    },
    status: {
        fontSize: 16,
        fontWeight: '600',
    },
    testButtons: {
        marginBottom: 16,
    },
    testButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F8FF',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    buttonText: {
        fontSize: 16,
        color: '#007AFF',
        marginLeft: 8,
        fontWeight: '500',
    },
    clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF0F0',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    clearButtonText: {
        fontSize: 16,
        color: '#FF3B30',
        marginLeft: 8,
        fontWeight: '500',
    },
    resultsTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    resultsContainer: {
        maxHeight: 200,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 8,
        padding: 12,
    },
    noResults: {
        fontStyle: 'italic',
        color: '#999',
        textAlign: 'center',
        marginTop: 20,
    },
    resultText: {
        fontSize: 14,
        marginBottom: 4,
    },
});