import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
    title: string;
    description: string;
};

export default function RecommendedHabitCard({ title, description }: Props) {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.desc}>{description}</Text>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>See More</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFF4E8',
        borderRadius: 12,
        padding: 16,
        width: '45%',
        marginBottom: 16,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
        color: '#333',
    },
    desc: {
        fontSize: 12,
        color: '#666',
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#FF8C42',
        borderRadius: 8,
        paddingVertical: 6,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
    },
});
