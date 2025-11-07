import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PeriodType } from '../../hooks/useSummaryData';

const tabMap = [
    { key: 'daily', label: 'Daily', icon: 'calendar-outline' },
    { key: 'weekly', label: 'Weekly', icon: 'bar-chart-outline' },
    { key: 'monthly', label: 'Monthly', icon: 'calendar-number-outline' },
] as const;

interface SummaryTabsProps {
    selected: PeriodType;
    onTabChange: (period: PeriodType) => void;
}

export default function SummaryTabs({ selected, onTabChange }: SummaryTabsProps) {
    return (
        <View style={styles.container}>
            {tabMap.map((tab) => {
                const isActive = selected === tab.key;
                return (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, isActive && styles.activeTab]}
                        onPress={() => onTabChange(tab.key)}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={tab.icon as any}
                            size={18}
                            color={isActive ? '#1F2937' : '#6B7280'}
                            style={styles.icon}
                        />
                        <Text style={[styles.text, isActive && styles.activeText]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 16,
        padding: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
    },
    activeTab: {
        backgroundColor: '#f4b072',
        shadowColor: '#4CAF50',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 2,
    },
    icon: {
        marginRight: 6,
    },
    text: {
        fontWeight: '600',
        color: '#6B7280',
        fontSize: 13,
    },
    activeText: {
        color: '#1F2937',
        fontWeight: '700',
    },
});
