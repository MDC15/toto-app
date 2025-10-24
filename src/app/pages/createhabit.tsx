import RecommendedHabitCard from '@/components/habits/RecommendedHabitCard';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CreateHabit() {
    const habits = [
        { title: 'Personal Development', description: 'Learn techniques to improve' },
        { title: 'Eat Healthy', description: 'Learn techniques to improve' },
        { title: 'Eat Healthy', description: 'Learn techniques to improve' },
        { title: 'Eat Healthy', description: 'Learn techniques to improve' },
        { title: 'Eat Healthy', description: 'Learn techniques to improve' },
        { title: 'Eat Healthy', description: 'Learn techniques to improve' },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Habit</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* ➕ Nút tròn */}
                <View style={styles.centerButton}>
                    <TouchableOpacity style={styles.addButton}>
                        <Ionicons name="add" size={48} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Danh sách habits */}
                <Text style={styles.sectionTitle}>Recommended habits</Text>
                <View style={styles.grid}>
                    {habits.map((h, i) => (
                        <RecommendedHabitCard key={i} {...h} />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 20,
    },
    centerButton: {
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
    },
    addButton: {
        width: 100,
        height: 100,
        backgroundColor: '#FF8C42',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 4,
    },
    title: {
        color: '#333',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 20,
        marginBottom: 10,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
        paddingBottom: 40,
    },
});
