import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
    title: string;
    subtitle: string;
    progress: number;
};

export default function ProgressHeader({ title, subtitle, progress }: Props) {
    return (
        <LinearGradient
            colors={['#FF8C42', '#FF5E62']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.percent}>{progress}%</Text>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        margin: 16,
        padding: 16,
    },
    title: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    subtitle: {
        color: '#fff',
        marginTop: 4,
    },
    progressContainer: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 3,
        marginTop: 10,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 3,
    },
    percent: {
        color: '#fff',
        textAlign: 'right',
        fontWeight: 'bold',
        marginTop: 4,
    },
});
