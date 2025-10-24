import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
    title: string;
    dateRange: string;
    progress: number;
    color: string;
};

export default function HabitCard({ title, dateRange, progress, color }: Props) {
    return (
        <View style={[styles.card, { borderColor: color }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color }]}>{title}</Text>
                <Ionicons
                    name={progress === 100 ? 'checkmark-circle' : 'checkmark'}
                    size={22}
                    color={color}
                />
            </View>
            <Text style={styles.date}>{dateRange}</Text>

            <View style={styles.progressContainer}>
                <View
                    style={[styles.progressBar, { backgroundColor: color, width: `${progress}%` }]}
                />
            </View>

            <Text style={[styles.percent, { color }]}>{progress}%</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 1.5,
        borderRadius: 12,
        padding: 12,
        marginVertical: 6,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 15,
    },
    date: {
        color: '#888',
        fontSize: 12,
        marginTop: 4,
    },
    progressContainer: {
        height: 6,
        backgroundColor: '#eee',
        borderRadius: 3,
        marginTop: 8,
    },
    progressBar: {
        height: '100%',
        borderRadius: 3,
    },
    percent: {
        textAlign: 'right',
        fontWeight: '600',
        marginTop: 4,
    },
});
