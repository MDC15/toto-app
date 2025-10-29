import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { responsive } from '@/constants/theme';

type Props = {
    title: string;
    dateRange: string;
    progress: number;
    color: string;
    onPress?: () => void;
};

export default function HabitCard({ title, dateRange, progress, color, onPress }: Props) {
    return (
        <TouchableOpacity style={[styles.card, { backgroundColor: color + '20', borderColor: color }]} onPress={onPress}>
            <View style={styles.header}>
                <Text style={[styles.title, { color }]}>{title}</Text>
                <View style={styles.checkboxContainer}>
                    <Ionicons
                        name={progress === 100 ? 'checkmark-circle' : 'radio-button-off'}
                        size={24}
                        color={progress === 100 ? '#10b981' : '#9ca3af'}
                    />
                </View>
            </View>
            <Text style={styles.date}>{dateRange}</Text>

            <View style={styles.progressContainer}>
                <View
                    style={[styles.progressBar, { backgroundColor: color, width: `${progress}%` }]}
                />
            </View>

            <Text style={[styles.percent, { color }]}>{Math.round(progress)}%</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 1.5,
        borderRadius: responsive.spacing(12),
        padding: responsive.spacing(12),
        marginVertical: responsive.spacing(6),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontWeight: 'bold',
        fontSize: responsive.fontSize(15),
        flex: 1,
    },
    checkboxContainer: {
        marginLeft: responsive.spacing(8),
    },
    date: {
        color: '#888',
        fontSize: responsive.fontSize(12),
        marginTop: responsive.spacing(4),
    },
    progressContainer: {
        height: responsive.spacing(6),
        backgroundColor: '#eee',
        borderRadius: responsive.spacing(3),
        marginTop: responsive.spacing(8),
    },
    progressBar: {
        height: '100%',
        borderRadius: responsive.spacing(3),
    },
    percent: {
        textAlign: 'right',
        fontWeight: '600',
        marginTop: responsive.spacing(4),
    },
});
