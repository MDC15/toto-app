import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useNotifications } from '@/contexts/NotificationContext';

interface EnhancedReminderSelectorProps {
    type: 'task' | 'event' | 'habit';
    value: string | null;
    onChange: (reminderTime: string | null) => void;
    mainTime?: string; // For tasks/events: deadline/start time
    disabled?: boolean;
}

export function EnhancedReminderSelector({
    type,
    value,
    onChange,
    mainTime,
    disabled = false
}: EnhancedReminderSelectorProps) {
    const { hasPermission, requestPermission, getDefaultReminderOptions } = useNotifications();
    const [showSelector, setShowSelector] = useState(false);
    const [customTime] = useState('');

    const reminderOptions = getDefaultReminderOptions(type);

    const handleOptionSelect = (option: any) => {
        if (!option || !hasPermission) {
            onChange(null);
            setShowSelector(false);
            return;
        }

        if (option.value === null) {
            // None option
            onChange(null);
            setShowSelector(false);
        } else if (option.value.hour !== undefined) {
            // Daily habit reminder at specific time
            const now = new Date();
            const reminderTime = new Date(now);
            reminderTime.setHours(option.value.hour);
            reminderTime.setMinutes(option.value.minute);
            reminderTime.setSeconds(0);
            reminderTime.setMilliseconds(0);

            onChange(reminderTime.toISOString());
            setShowSelector(false);
        } else if (mainTime) {
            // Calculate reminder time before main time (for tasks/events)
            const mainDate = new Date(mainTime);
            const reminderTime = new Date(mainDate);

            if (option.value.hours) {
                reminderTime.setHours(reminderTime.getHours() - option.value.hours);
            }
            if (option.value.minutes) {
                reminderTime.setMinutes(reminderTime.getMinutes() - option.value.minutes);
            }

            onChange(reminderTime.toISOString());
            setShowSelector(false);
        } else {
            // Custom time input
            setShowSelector(false);
            if (customTime) {
                onChange(new Date(customTime).toISOString());
            }
        }
    };

    const formatCurrentSelection = () => {
        if (!value) return 'No reminder';

        const date = new Date(value);
        const now = new Date();

        if (date < now) return 'Past time';

        const isToday = date.toDateString() === now.toDateString();

        if (type === 'habit' && date > now && (date.getTime() - now.getTime()) < 24 * 60 * 60 * 1000) {
            return `Daily at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }

        if (isToday) {
            return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return date.toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    const getIconName = () => {
        if (!value) return 'notifications-off-outline';
        if (type === 'habit') return 'fitness-outline';
        if (type === 'event') return 'calendar-outline';
        return 'checkbox-outline';
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
            <TouchableOpacity
                style={styles.selector}
                onPress={() => !disabled && setShowSelector(!showSelector)}
                disabled={disabled}
            >
                <View style={styles.selectorContent}>
                    <Ionicons
                        name={getIconName()}
                        size={24}
                        color={value ? "#007AFF" : "#999"}
                    />
                    <View style={styles.textContainer}>
                        <ThemedText style={styles.label}>Reminder</ThemedText>
                        <ThemedText style={[styles.value, !value && styles.placeholder]}>
                            {formatCurrentSelection()}
                        </ThemedText>
                    </View>
                </View>
                <Ionicons
                    name="chevron-down"
                    size={20}
                    color="#999"
                    style={showSelector && styles.rotated}
                />
            </TouchableOpacity>

            {showSelector && (
                <ThemedView style={styles.optionsContainer}>
                    {reminderOptions.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.option,
                                (value === null && option.value === null) && styles.selectedOption
                            ]}
                            onPress={() => handleOptionSelect(option)}
                        >
                            <ThemedText style={styles.optionText}>{option.label}</ThemedText>
                            {value === null && option.value === null && (
                                <Ionicons name="checkmark" size={20} color="#007AFF" />
                            )}
                            {value !== null && option.value === null && (
                                <View style={styles.dot} />
                            )}
                        </TouchableOpacity>
                    ))}

                    {mainTime && (
                        <>
                            <View style={styles.separator} />
                            <TouchableOpacity
                                style={styles.option}
                                onPress={() => {
                                    // Open custom time picker
                                    setShowSelector(false);
                                }}
                            >
                                <ThemedText style={styles.optionText}>Custom time...</ThemedText>
                                <Ionicons name="time-outline" size={20} color="#999" />
                            </TouchableOpacity>
                        </>
                    )}

                    <TouchableOpacity
                        style={styles.option}
                        onPress={() => onChange(null)}
                    >
                        <ThemedText style={styles.optionText}>Turn off reminders</ThemedText>
                        <Ionicons name="notifications-off" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                </ThemedView>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    disabled: {
        opacity: 0.5,
    },
    permissionRequest: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#FF9500',
    },
    permissionText: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: '#FF9500',
    },
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    selectorContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    textContainer: {
        marginLeft: 12,
        flex: 1,
    },
    label: {
        fontSize: 12,
        color: '#999',
        marginBottom: 2,
    },
    value: {
        fontSize: 16,
        color: '#333',
    },
    placeholder: {
        color: '#999',
        fontStyle: 'italic',
    },
    rotated: {
        transform: [{ rotate: '180deg' }],
    },
    optionsContainer: {
        marginTop: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    selectedOption: {
        backgroundColor: '#F0F8FF',
    },
    optionText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    separator: {
        height: 1,
        backgroundColor: '#E5E5EA',
        marginHorizontal: 12,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#999',
    },
});