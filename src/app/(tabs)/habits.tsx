import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from "react";
import { Animated, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Compoents
import HabitCard from '@/components/habits/HabitCard';
import ProgressHeader from '@/components/habits/ProgressHeader';
import RecommendedHabitCard from '@/components/habits/RecommendedHabitCard';
import FloatingAddButton from '@/components/tasks/FloatingAddButton';
import WeekCalendar from "@/components/tasks/WeekCalendar";
import { getNow } from '@/utils/dateUtils';


const habits = [
    {
        title: 'Get up early',
        dateRange: 'Every day from 3 May to 10 May',
        progress: 75,
        color: '#FF6B6B',
    },
    {
        title: 'Drink 2 lit water',
        dateRange: 'Every day from 3 May to 20 May',
        progress: 75,
        color: '#3B82F6',
    },
];

const recommendedHabits = [
    { title: 'Personal Development', description: 'Learn techniques to improve' },
    { title: 'Eat Healthy', description: 'Learn techniques to improve' },
    { title: 'Eat Healthy', description: 'Learn techniques to improve' },
    { title: 'Eat Healthy', description: 'Learn techniques to improve' },
    { title: 'Eat Healthy', description: 'Learn techniques to improve' },
    { title: 'Eat Healthy', description: 'Learn techniques to improve' },
];

export default function HabitsScreen() {
    const [selectedDate, setSelectedDate] = useState(getNow());
    const [isModalVisible, setIsModalVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(0)).current;

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <ProgressHeader
                    title="Combat Procrastination"
                    subtitle="You're making great progress!"
                    progress={75}
                />

                {/* 📅 Lịch tuần */}
                <WeekCalendar
                    selectedDate={new Date(selectedDate)}
                    onSelectDate={(date) => setSelectedDate(date)}
                />

                <View style={styles.list}>
                    {habits.map((h, i) => (
                        <HabitCard key={i} {...h} />
                    ))}
                </View>
            </ScrollView>

            <FloatingAddButton onPress={() => {
                setIsModalVisible(true);
                Animated.timing(slideAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            }} />

            {/* Modal for creating habits */}
            <Modal
                visible={isModalVisible}
                animationType="none"
                transparent={true}
                onRequestClose={() => {
                    Animated.timing(slideAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }).start(() => setIsModalVisible(false));
                }}
            >
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => {
                    Animated.timing(slideAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }).start(() => setIsModalVisible(false));
                }}>
                    <Animated.View style={[styles.modalContent, {
                        transform: [{
                            translateY: slideAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [600, 0],
                            }),
                        }],
                    }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Create New Habit</Text>
                            <TouchableOpacity onPress={() => {
                                Animated.timing(slideAnim, {
                                    toValue: 0,
                                    duration: 300,
                                    useNativeDriver: true,
                                }).start(() => setIsModalVisible(false));
                            }} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
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
                                {recommendedHabits.map((h, i) => (
                                    <RecommendedHabitCard key={i} {...h} />
                                ))}
                            </View>
                        </ScrollView>
                    </Animated.View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    list: {
        paddingHorizontal: 12,
        marginTop: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        paddingBottom: 40,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    closeButton: {
        padding: 5,
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

