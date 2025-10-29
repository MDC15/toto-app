import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const taskTemplates = [
    { title: 'Morning Routine', description: 'Start your day with a healthy routine' },
    { title: 'Workout Plan', description: 'Stay fit with regular exercise' },
    { title: 'Meal Prep', description: 'Prepare healthy meals for the week' },
    { title: 'Study Session', description: 'Focus on learning and productivity' },
    { title: 'Project Planning', description: 'Organize your project tasks' },
    { title: 'Cleaning Schedule', description: 'Keep your space tidy and organized' },
];

const habitTemplates = [
    { title: 'Drink Water', description: 'Stay hydrated throughout the day' },
    { title: 'Read Daily', description: 'Build knowledge with daily reading' },
    { title: 'Exercise', description: 'Maintain physical fitness' },
    { title: 'Meditate', description: 'Practice mindfulness and relaxation' },
    { title: 'Journal', description: 'Reflect on your day and thoughts' },
    { title: 'Learn New Skill', description: 'Develop new abilities regularly' },
];

export default function TemplatesScreen() {
    const { type } = useLocalSearchParams<{ type?: string }>();
    const isHabit = type === 'habit';
    const templates = isHabit ? habitTemplates : taskTemplates;

    return (
        <View style={styles.container}>
            {/* Content */}
            <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                <Text style={styles.description}>
                    {isHabit
                        ? "Choose from pre-made habit templates to quickly create common habits."
                        : "Choose from pre-made templates to quickly create common tasks."
                    }
                </Text>

                <View style={styles.grid}>
                    {templates.map((template, i) => (
                        <TouchableOpacity
                            key={i}
                            style={styles.templateCard}
                            onPress={() => {
                                router.push({
                                    pathname: isHabit ? "/pages/createhabit" : "/pages/addtask",
                                    params: { title: template.title, description: template.description }
                                });
                            }}
                        >
                            <Text style={styles.templateTitle}>{template.title}</Text>
                            <Text style={styles.templateDesc}>{template.description}</Text>
                            <Ionicons name="chevron-forward" size={20} color="#666" style={styles.arrow} />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    description: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        lineHeight: 22,
    },
    grid: {
        gap: 12,
    },
    templateCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
    },
    templateTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    templateDesc: {
        fontSize: 14,
        color: '#666',
        flex: 1,
        marginLeft: 10,
    },
    arrow: {
        marginLeft: 10,
    },
});
