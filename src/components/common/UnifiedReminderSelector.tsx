import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useNotifications } from '@/contexts/NotificationContext';
import DateTimePicker from "@react-native-community/datetimepicker";


interface UnifiedReminderSelectorProps {
    type: 'task' | 'event' | 'habit';
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
    value: string | null; // ISO string for reminder time
    onChange: (reminderTime: string | null) => void;
    mainTime?: string; // For tasks/events: deadline/start time
    disabled?: boolean;
}

export function UnifiedReminderSelector({
    type,
    enabled,
    onToggle,
    value,
    onChange,
    mainTime,
    disabled = false
}: UnifiedReminderSelectorProps) {
    const { hasPermission, requestPermission } = useNotifications();
    const [showSelector, setShowSelector] = useState(false);
    const [showCustomTimeModal, setShowCustomTimeModal] = useState(false);
    const [customTime, setCustomTime] = useState(() => {
        // Set default to current time rounded to nearest 5 minutes
        const now = new Date();
        const roundedMinutes = Math.ceil(now.getMinutes() / 5) * 5;
        now.setMinutes(roundedMinutes, 0, 0);
        return now;
    });
    const [timeError, setTimeError] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState(false);

    // Predefined reminder options (in minutes before main time)
    const reminderOptions = [
        { label: '1 minute before', value: 1, icon: 'time-outline' },
        { label: '15 minutes before', value: 15, icon: 'time-outline' },
        { label: '30 minutes before', value: 30, icon: 'time-outline' },
        { label: '1 hour before', value: 60, icon: 'time-outline' },
        { label: '2 hours before', value: 120, icon: 'time-outline' },
    ];

    const handleOptionSelect = (minutesBefore: number | 'custom' | null) => {
        if (minutesBefore === null) {
            // "Off" option - disable notifications
            onToggle(false);
            onChange(null);
            setShowSelector(false);
        } else if (minutesBefore === 'custom') {
            // Open custom time modal
            setShowSelector(false);
            setTimeError(null);
            setIsValidating(false);

            // Set appropriate default time based on context
            const now = new Date();
            let defaultTime: Date;

            if (mainTime) {
                const mainDate = new Date(mainTime);

                // Validate mainTime is valid
                if (isNaN(mainDate.getTime())) {
                    setTimeError('Invalid task/event time');
                    return;
                }

                // For tasks/events, set to 1 hour before main time, but not in the past
                defaultTime = new Date(Math.max(
                    mainDate.getTime() - (60 * 60 * 1000), // 1 hour before
                    now.getTime() + (5 * 60 * 1000) // at least 5 minutes from now
                ));
            } else {
                // For habits, use current time rounded to nearest 5 minutes
                const roundedMinutes = Math.ceil(now.getMinutes() / 5) * 5;
                defaultTime = new Date(now);
                defaultTime.setMinutes(roundedMinutes, 0, 0);
            }

            setCustomTime(defaultTime);
            setShowCustomTimeModal(true);
        } else {
            // Handle predefined options
            try {
                if (mainTime) {
                    const mainDate = new Date(mainTime);

                    // Validate mainTime is valid
                    if (isNaN(mainDate.getTime())) {
                        setTimeError('Invalid task/event time');
                        return;
                    }

                    const reminderTime = new Date(mainDate.getTime() - (minutesBefore * 60 * 1000));

                    // Ensure reminder is at least 1 minute in the future
                    const oneMinuteFromNow = new Date(Date.now() + 60 * 1000);
                    if (reminderTime <= oneMinuteFromNow) {
                        setTimeError('Selected time would be too soon. Please choose a different option.');
                        return;
                    }

                    onChange(reminderTime.toISOString());
                } else {
                    // For habits, set a daily reminder
                    const now = new Date();
                    const reminderTime = new Date();
                    reminderTime.setHours(customTime.getHours());
                    reminderTime.setMinutes(customTime.getMinutes());
                    reminderTime.setSeconds(0);
                    reminderTime.setMilliseconds(0);

                    // If the time has already passed today, set for tomorrow
                    if (reminderTime <= now) {
                        reminderTime.setDate(reminderTime.getDate() + 1);
                    }

                    onChange(reminderTime.toISOString());
                }
                setShowSelector(false);
                setTimeError(null);
            } catch (error) {
                console.error('Error setting reminder:', error);
                setTimeError('Failed to set reminder. Please try again.');
            }
        }
    };

    const handleCustomTimeSave = async () => {
        try {
            setIsValidating(true);
            setTimeError(null);

            if (mainTime) {
                // For tasks/events: validate custom time is before main time
                const mainDate = new Date(mainTime);
                const selectedTime = new Date(customTime);

                // Validate mainTime is valid
                if (isNaN(mainDate.getTime())) {
                    setTimeError('Invalid task/event time');
                    return;
                }

                // Ensure reminder is before main time
                if (selectedTime.getTime() >= mainDate.getTime()) {
                    setTimeError('Reminder must be before the task/event time');
                    return;
                }

                // Ensure reminder is at least 1 minute in the future
                const oneMinuteFromNow = new Date(Date.now() + 60 * 1000);
                if (selectedTime <= oneMinuteFromNow) {
                    setTimeError('Reminder must be at least 1 minute in the future');
                    return;
                }

                onChange(selectedTime.toISOString());
            } else {
                // For habits: set as daily reminder time
                const now = new Date();
                const habitTime = new Date();
                habitTime.setHours(customTime.getHours());
                habitTime.setMinutes(customTime.getMinutes());
                habitTime.setSeconds(0);
                habitTime.setMilliseconds(0);

                // If the time has already passed today, set for tomorrow
                if (habitTime <= now) {
                    habitTime.setDate(habitTime.getDate() + 1);
                }

                onChange(habitTime.toISOString());
            }

            setShowCustomTimeModal(false);
        } catch (error) {
            console.error('Error saving custom time:', error);
            setTimeError('Failed to save custom time. Please try again.');
        } finally {
            setIsValidating(false);
        }
    };

    const handleTimeChange = (event: any, time: Date | undefined) => {
        try {
            if (time) {
                // Keep the original date, only update time
                const updatedTime = new Date(customTime);
                updatedTime.setHours(time.getHours());
                updatedTime.setMinutes(time.getMinutes());
                updatedTime.setSeconds(0);
                updatedTime.setMilliseconds(0);
                setCustomTime(updatedTime);
                setTimeError(null); // Clear any previous errors
            }
        } catch (error) {
            console.error('Error changing time:', error);
            setTimeError('Invalid time selected');
        }
    };

    const getCurrentSelectionLabel = () => {
        if (!enabled) return 'Off';
        if (!value) return 'Select time';

        const reminderDate = new Date(value);
        const now = new Date();

        if (reminderDate < now) return 'Past time';

        if (type === 'habit' && (reminderDate.getTime() - now.getTime()) < 24 * 60 * 60 * 1000) {
            return `Daily at ${reminderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }

        if (mainTime) {
            const mainDate = new Date(mainTime);
            const timeDiff = mainDate.getTime() - reminderDate.getTime();
            const minutesBefore = Math.round(timeDiff / (1000 * 60));

            if (minutesBefore >= 60) {
                const hours = Math.floor(minutesBefore / 60);
                return `${hours} hour${hours > 1 ? 's' : ''} before`;
            } else {
                return `${minutesBefore} minutes before`;
            }
        } else {
            return reminderDate.toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    const getIconName = () => {
        if (!enabled) return 'notifications-off-outline';
        if (!value) return 'time-outline';
        if (type === 'habit') return 'fitness-outline';
        if (type === 'event') return 'calendar-outline';
        return 'checkbox-outline';
    };

    // Function removed - using the new handleOptionSelect above

    const formatReminderText = () => {
        if (!enabled) return 'Notifications off';
        return getCurrentSelectionLabel();
    };

    const getReminderColor = () => {
        if (!enabled) return '#999';
        return value ? '#007AFF' : '#FF9500';
    };

    if (!hasPermission) {
        return (
            <ThemedView style={[styles.container, disabled && styles.disabled]}>
                <TouchableOpacity
                    style={styles.permissionRequest}
                    onPress={requestPermission}
                    disabled={disabled}
                >
                    <Ionicons name="notifications-off-outline" size={24} color="#FF9500" />
                    <ThemedText style={styles.permissionText}>Enable notifications for reminders</ThemedText>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={[styles.container, disabled && styles.disabled]}>
            {/* Main Reminder Toggle */}
            <View style={styles.toggleContainer}>
                <View style={styles.toggleLeft}>
                    <Ionicons
                        name={getIconName()}
                        size={20}
                        color={getReminderColor()}
                    />
                    <ThemedText style={[styles.toggleLabel, { color: getReminderColor() }]}>
                        Reminder
                    </ThemedText>
                </View>
                <TouchableOpacity
                    style={[
                        styles.toggleSwitch,
                        enabled ? styles.toggleSwitchOn : styles.toggleSwitchOff
                    ]}
                    onPress={() => onToggle(!enabled)}
                    disabled={disabled}
                >
                    <View style={[
                        styles.toggleThumb,
                        enabled ? styles.toggleThumbOn : styles.toggleThumbOff
                    ]} />
                </TouchableOpacity>
            </View>

            {/* Reminder Settings (shown when enabled) */}
            {enabled && (
                <View style={styles.reminderSettings}>
                    <TouchableOpacity
                        style={styles.selector}
                        onPress={() => !disabled && setShowSelector(!showSelector)}
                        disabled={disabled}
                    >
                        <View style={styles.selectorContent}>
                            <Ionicons name="time-outline" size={18} color="#666" />
                            <View style={styles.selectorTextContainer}>
                                <ThemedText style={styles.selectorLabel}>When</ThemedText>
                                <ThemedText style={[
                                    styles.selectorValue,
                                    !value && styles.placeholder
                                ]}>
                                    {formatReminderText()}
                                </ThemedText>
                            </View>
                        </View>
                        <Ionicons
                            name="chevron-down"
                            size={18}
                            color="#999"
                            style={showSelector && styles.rotated}
                        />
                    </TouchableOpacity>

                    {/* Custom Time Picker for Habits */}
                    {type === 'habit' && value && (
                        <View style={styles.customTimeContainer}>
                            <TouchableOpacity
                                style={styles.customTimeSelector}
                                onPress={() => setShowCustomTimeModal(true)}
                            >
                                <Ionicons name="settings-outline" size={16} color="#666" />
                                <ThemedText style={styles.customTimeText}>
                                    Set daily time: {customTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}

            {/* Options Modal */}
            <Modal
                visible={showSelector}
                transparent
                animationType="fade"
                onRequestClose={() => setShowSelector(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowSelector(false)}
                >
                    <View style={styles.modalContent}>
                        <ThemedText style={styles.modalTitle}>Select reminder time</ThemedText>

                        {reminderOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={styles.modalOption}
                                onPress={() => handleOptionSelect(option.value)}
                            >
                                <Ionicons name={option.icon as any} size={20} color="#007AFF" />
                                <ThemedText style={styles.modalOptionText}>{option.label}</ThemedText>
                            </TouchableOpacity>
                        ))}

                        <View style={styles.modalSeparator} />

                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => handleOptionSelect('custom')}
                        >
                            <Ionicons name="time-outline" size={20} color="#FF9500" />
                            <ThemedText style={styles.modalOptionText}>Custom time...</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => handleOptionSelect(null)}
                        >
                            <Ionicons name="notifications-off" size={20} color="#FF3B30" />
                            <ThemedText style={styles.modalOptionText}>Turn off reminders</ThemedText>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Custom Time Picker Modal */}
            <Modal
                visible={showCustomTimeModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCustomTimeModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => {
                        setShowCustomTimeModal(false);
                        setTimeError(null);
                    }}
                >
                    <View style={styles.customTimeModalContent}>
                        <ThemedText style={styles.modalTitle}>
                            {mainTime ? 'Custom reminder time' : 'Daily reminder time'}
                        </ThemedText>

                        {mainTime ? (
                            <ThemedText style={styles.customTimeSubtitle}>
                                Set time before {new Date(mainTime).toLocaleString()}
                            </ThemedText>
                        ) : (
                            <ThemedText style={styles.customTimeSubtitle}>
                                Choose a time for daily reminder
                            </ThemedText>
                        )}

                        <View style={styles.timePickerContainer}>
                            <DateTimePicker
                                value={customTime}
                                mode="time"
                                is24Hour={false}
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={handleTimeChange}
                                minimumDate={new Date()}
                            />
                        </View>

                        {timeError && (
                            <ThemedText style={styles.errorText}>{timeError}</ThemedText>
                        )}

                        <View style={styles.customTimeButtons}>
                            <TouchableOpacity
                                style={[styles.customTimeButton, styles.cancelButton]}
                                onPress={() => {
                                    setShowCustomTimeModal(false);
                                    setTimeError(null);
                                }}
                                disabled={isValidating}
                            >
                                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.customTimeButton,
                                    styles.saveButton,
                                    (timeError || isValidating) && styles.disabledButton
                                ]}
                                onPress={timeError || isValidating ? undefined : handleCustomTimeSave}
                                disabled={!!timeError || isValidating}
                            >
                                <ThemedText style={styles.saveButtonText}>
                                    {isValidating ? 'Saving...' : 'Save'}
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        overflow: 'hidden',
    },
    disabled: {
        opacity: 0.5,
    },
    permissionRequest: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        padding: 16,
    },
    permissionText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: '#FF9500',
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    toggleLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toggleLabel: {
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 8,
    },
    toggleSwitch: {
        width: 50,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        paddingHorizontal: 3,
    },
    toggleSwitchOn: {
        backgroundColor: '#007AFF',
    },
    toggleSwitchOff: {
        backgroundColor: '#E5E5EA',
    },
    toggleThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    toggleThumbOn: {
        alignSelf: 'flex-end',
    },
    toggleThumbOff: {
        alignSelf: 'flex-start',
    },
    reminderSettings: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
    },
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    selectorContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    selectorTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    selectorLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 2,
    },
    selectorValue: {
        fontSize: 14,
        color: '#333',
    },
    placeholder: {
        color: '#999',
        fontStyle: 'italic',
    },
    rotated: {
        transform: [{ rotate: '180deg' }],
    },
    customTimeContainer: {
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    customTimeSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        paddingLeft: 16,
    },
    customTimeText: {
        fontSize: 13,
        color: '#666',
        marginLeft: 8,
    },
    timePickerContainer: {
        alignItems: 'center',
        padding: 8,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    timePickerOverlay: {
        backgroundColor: 'rgba(0,0,0,0.1)',
        padding: 10,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        margin: 20,
        maxWidth: 300,
        width: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 16,
        color: '#333',
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    modalOptionText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 12,
    },
    modalSeparator: {
        height: 1,
        backgroundColor: '#E5E5EA',
        marginVertical: 8,
    },
    customTimeModalContent: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        margin: 20,
        maxWidth: 320,
        width: '85%',
    },
    customTimeSubtitle: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 16,
    },
    customTimeButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        gap: 12,
    },
    customTimeButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F2F2F7',
    },
    cancelButtonText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '500',
    },
    saveButton: {
        backgroundColor: '#007AFF',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 8,
    },
    disabledButton: {
        opacity: 0.5,
    },
});