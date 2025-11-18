import React, { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import {
    useNotifications,
    useReminderConfig
} from '@/contexts/NotificationContext';
import {
    ReminderType,
    ReminderTime
} from '@/types/reminder.types';

interface UnifiedReminderSelectorProps {
    type: ReminderType;
    enabled: boolean;
    value: string | null; // Changed from reminderTime to value to match usage
    onToggle: (enabled: boolean) => void;
    onChange: (reminderTime: string | null) => void; // Changed to string | null
    mainTime?: string; // For tasks/events: deadline/start time
    disabled?: boolean;
}

export function UnifiedReminderSelector({
    type,
    enabled,
    value,
    onToggle,
    onChange,
    mainTime,
    disabled = false
}: UnifiedReminderSelectorProps) {
    // ===============================
    // 🎯 HOOKS
    // ===============================

    const { hasPermission, requestPermission } = useNotifications();
    const { formatDisplay, getOptions } = useReminderConfig();

    // ===============================
    // 📊 LOCAL STATE
    // ===============================

    const [showSelector, setShowSelector] = useState(false);

    // ===============================
    // 🎨 GETTERS
    // ===============================

    const getCurrentDisplay = () => {
        if (!enabled) return 'Off';
        if (value === null) return 'Select time';
        // For string values, just return the string directly
        return value;
    };

    const getIconName = () => {
        if (!enabled) return 'notifications-off-outline';
        if (!value) return 'time-outline';
        if (type === 'habit') return 'fitness-outline';
        if (type === 'event') return 'calendar-outline';
        return 'checkbox-outline';
    };

    const getColor = () => {
        if (!enabled) return '#999';
        return value ? '#007AFF' : '#FF9500';
    };

    // ===============================
    // 🎯 EVENT HANDLERS
    // ===============================

    const handleOptionSelect = (reminderValue: any) => {
        setShowSelector(false);

        if (reminderValue === null) {
            // Turn off reminders
            onToggle(false);
            onChange(null);
        } else {
            // Convert reminder value to string format
            let stringValue = '';
            if (typeof reminderValue === 'number') {
                stringValue = `${reminderValue} minutes before`;
            } else if (typeof reminderValue === 'object' && reminderValue.hours) {
                stringValue = `${reminderValue.hours} hour${reminderValue.hours > 1 ? 's' : ''} before`;
            } else if (typeof reminderValue === 'object' && reminderValue.minutes) {
                stringValue = `${reminderValue.minutes} minutes before`;
            } else {
                stringValue = '5 minutes before'; // Default
            }
            onChange(stringValue);
        }
    };

    // ===============================
    // 🎨 RENDER
    // ===============================

    if (!hasPermission) {
        return (
            <ThemedView style={[styles.container, disabled && styles.disabled]}>
                <TouchableOpacity
                    style={styles.permissionRequest}
                    onPress={requestPermission}
                    disabled={disabled}
                >
                    <Ionicons name="notifications-off-outline" size={24} color="#FF9500" />
                    <ThemedText style={styles.permissionText}>
                        Enable notifications for reminders
                    </ThemedText>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={[styles.container, disabled && styles.disabled]}>
            {/* Toggle */}
            <View style={styles.toggleContainer}>
                <View style={styles.toggleLeft}>
                    <Ionicons
                        name={getIconName()}
                        size={20}
                        color={getColor()}
                    />
                    <ThemedText style={[styles.toggleLabel, { color: getColor() }]}>
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

            {/* Settings */}
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
                                    {getCurrentDisplay()}
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
                        <ThemedText style={styles.modalTitle}>
                            Select reminder time
                        </ThemedText>

                        {getOptions(type).map((option) => (
                            <TouchableOpacity
                                key={option.label}
                                style={styles.modalOption}
                                onPress={() => handleOptionSelect(option.value)}
                            >
                                <Ionicons
                                    name={option.icon as any}
                                    size={20}
                                    color="#007AFF"
                                />
                                <ThemedText style={styles.modalOptionText}>
                                    {option.label}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </ThemedView>
    );
}

// ===============================
// 🎨 STYLES
// ===============================

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
});