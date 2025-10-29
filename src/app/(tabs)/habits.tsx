import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from "react";
import { Animated, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import HabitCard from '@/components/habits/HabitCard';
import ProgressHeader from '@/components/habits/ProgressHeader';
import FloatingAddButton from '@/components/tasks/FloatingAddButton';
import WeekCalendar from "@/components/tasks/WeekCalendar";
import { getHabits, incrementHabitProgress } from '@/db/database';
import { getNow } from '@/utils/dateUtils';
import { useFocusEffect } from '@react-navigation/native';

export default function HabitsScreen() {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(getNow());
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [habits, setHabits] = useState<any[]>([]);
    const slideAnim = useRef(new Animated.Value(0)).current;

    // Calculate overall progress
    const overallProgress = React.useMemo(() => {
        if (habits.length === 0) return 0;
        const totalProgress = habits.reduce((sum, habit) => sum + habit.progress, 0);
        return Math.round(totalProgress / habits.length);
    }, [habits]);

    // Load habits from database
    const loadHabits = async () => {
        try {
            const dbHabits = await getHabits();
            const formattedHabits = dbHabits.map((habit: any) => ({
                id: habit.id,
                title: habit.title,
                dateRange: `Every ${habit.frequency} - Target: ${habit.target_count}`,
                progress: habit.target_count > 0 ? (habit.current_count / habit.target_count) * 100 : 0,
                color: habit.color || '#fed7aa',
                currentCount: habit.current_count,
                targetCount: habit.target_count,
                frequency: habit.frequency,
                description: habit.description,
            }));
            setHabits(formattedHabits);
        } catch (error) {
            console.error('Error loading habits:', error);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadHabits();
        }, [])
    );

    // Handle habit progress increment
    const handleHabitPress = async (habitId: number) => {
        try {
            await incrementHabitProgress(habitId);
            await loadHabits(); // Reload to update progress
        } catch (error) {
            console.error('Error updating habit progress:', error);
        }
    };

    const openModal = () => {
        setIsModalVisible(true);
        Animated.timing(slideAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closeModal = () => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => setIsModalVisible(false));
    };

    return (
        <SafeAreaView style={styles.container}>
            <ProgressHeader
                title="Combat Procrastination"
                subtitle={habits.length === 0 ? "Start building your habits!" : "You're making great progress!"}
                progress={overallProgress}
            />
            <WeekCalendar
                selectedDate={new Date(selectedDate)}
                onSelectDate={(date) => setSelectedDate(date)}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.list}>
                    {habits.map((h, i) => (
                        <HabitCard
                            key={h.id || i}
                            title={h.title}
                            dateRange={h.dateRange}
                            progress={h.progress}
                            color={h.color}
                            onPress={() => handleHabitPress(h.id)}
                        />
                    ))}
                </View>
            </ScrollView>

            <FloatingAddButton onPress={openModal} />

            {/* Modal */}
            <Modal
                visible={isModalVisible}
                animationType="none"
                transparent
                onRequestClose={closeModal}
            >
                {/* Vùng overlay bên ngoài modal */}
                <TouchableWithoutFeedback onPress={closeModal}>
                    <View style={styles.modalOverlay}>
                        {/* Ngăn chặn touch xuyên modal nội dung */}
                        <TouchableWithoutFeedback>
                            <Animated.View
                                style={[
                                    styles.modalContent,
                                    {
                                        transform: [
                                            {
                                                translateY: slideAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [600, 0],
                                                }),
                                            },
                                        ],
                                    },
                                ]}
                            >
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Create New Habit</Text>
                                    <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                                        <Ionicons name="close" size={24} color="#000" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.centerButton}>
                                    <TouchableOpacity style={styles.addButton} onPress={() => { closeModal(); router.push('/pages/createhabit'); }}>
                                        <Ionicons name="add" size={48} color="#fff" />
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.sectionTitle}>Quick Actions</Text>
                                <View style={styles.quickActions}>
                                    <TouchableOpacity style={styles.quickActionButton} onPress={() => {
                                        closeModal();
                                        router.push({ pathname: "/pages/createhabit", params: { reminder: "true" } });
                                    }}>
                                        <Ionicons name="time-outline" size={24} color="#666" />
                                        <Text style={styles.quickActionText}>Set Reminder</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.quickActionButton} onPress={() => {
                                        closeModal();
                                        router.push({ pathname: "/pages/templates", params: { type: "habit" } });
                                    }}>
                                        <Ionicons name="list-outline" size={24} color="#666" />
                                        <Text style={styles.quickActionText}>View Templates</Text>
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: -50,
        paddingBottom: 32,
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
        backgroundColor: '#f97316',
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
        marginBottom: 12,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
        marginTop: 8,
        paddingBottom: 40,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
    },
    quickActionButton: {
        alignItems: 'center',
        padding: 10,
    },
    quickActionText: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
});
