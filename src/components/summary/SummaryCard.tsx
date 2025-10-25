import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface SummaryCardProps {
    title: string;
    value: string;
    change: string;
    positive?: boolean;
}

export default function SummaryCard({ title, value, change, positive }: SummaryCardProps) {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.value}>{value}</Text>
            <Text style={[styles.change, { color: positive ? '#2ecc71' : '#e74c3c' }]}>
                {change} from last period
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginHorizontal: 4,
    },
    title: {
        fontSize: 14,
        color: '#666',
    },
    value: {
        fontSize: 22,
        fontWeight: 'bold',
        marginVertical: 4,
    },
    change: {
        fontSize: 12,
        fontWeight: '500',
    },
});
