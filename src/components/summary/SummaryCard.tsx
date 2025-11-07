import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface SummaryCardProps {
    title: string;
    value: string | number;
    change?: number;
    positive?: boolean;
    loading?: boolean;
    subtitle?: string;
}

export default function SummaryCard({
    title,
    value,
    change,
    positive,
    loading = false,
    subtitle
}: SummaryCardProps) {
    const formatValue = (val: string | number): string => {
        if (typeof val === 'number') {
            return val.toString();
        }
        return val;
    };

    const formatChange = (changeValue: number | undefined): string => {
        if (changeValue === undefined) return '';
        const sign = changeValue >= 0 ? '+' : '';
        return `${sign}${changeValue.toFixed(1)}%`;
    };

    const getIconName = (): keyof typeof Ionicons.glyphMap => {
        const lower = title.toLowerCase();
        if (lower.includes('task')) return 'checkmark-done-outline';
        if (lower.includes('habit')) return 'repeat-outline';
        if (lower.includes('event')) return 'calendar-outline';
        if (lower.includes('productivity')) return 'flash-outline';
        return 'bar-chart-outline';
    };

    return (
        <View style={styles.card}>
            <LinearGradient
                colors={['#ffffff', '#f8f9ff']}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.iconContainer}>
                    <Ionicons name={getIconName()} size={22} color="#4CAF50" />
                </View>

                <Text style={styles.title}>{title}</Text>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#4CAF50" />
                    </View>
                ) : (
                    <>
                        <Text style={styles.value}>{formatValue(value)}</Text>
                        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                    </>
                )}

                {change !== undefined && !loading && (
                    <View style={styles.changeContainer}>
                        <Text
                            style={[
                                styles.change,
                                { color: positive ? '#4CAF50' : '#F44336' },
                            ]}
                        >
                            {formatChange(change)} from last period
                        </Text>
                    </View>
                )}
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        marginHorizontal: 6,
    },
    gradient: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 8,
    },
    value: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginVertical: 4,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'center',
        marginBottom: 8,
    },
    changeContainer: {
        backgroundColor: 'rgba(0,0,0,0.04)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    change: {
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
    },
    loadingContainer: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
