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
import { deleteHabit, getHabits, isHabitCompletedForDate, markHabitCompletedForDate } from '@/db/database';
import { getNow } from '@/utils/dateUtils';
import { useFocusEffect } from '@react-navigation/native';

type FilterType = 'all' | 'active' | 'completed';

export default function HabitsScreen() {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(getNow());
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [habits, setHabits] = useState<any[]>([]);
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [, setLastSelectedDate] = useState(getNow());
    const slideAnim = useRef(new Animated.Value(0)).current;

    // Calculate overall progress for selected date
    const overallProgress = React.useMemo(() => {
        if (habits.length === 0) return 0;
        const totalProgress = habits.reduce((sum, habit) => sum + habit.progress, 0);
        // Progress is already 0-100, so we just calculate the average
        return Math.round(totalProgress / habits.length);
    }, [habits]);

    // Load habits from database
    const loadHabits = React.useCallback(async () => {
        try {
            const dbHabits = await getHabits();

            const selectedDateStr = new Date(selectedDate).toISOString().split('T')[0];

            const habitsWithProgress = dbHabits.map((habit: any) => {
                // Check if habit is completed for selected date
                const isCompletedForDate = isHabitCompletedForDate(habit.id, selectedDateStr);

                // Determine if check-in should be allowed for this date
                const todayStr = new Date().toISOString().split('T')[0];
                // Allow check-in for today and past dates (but not future dates)
                const canCheckIn = (habit.allow_multiple_per_day || !isCompletedForDate) && selectedDateStr <= todayStr;

                // Check-in logic for habits

                // Calculate progress - simplified for daily habits only
                let progress = 0;
                let completedCount = 0;
                let totalDays = 1;
                let dateRangeText = '';

                // Get date range for calculation
                const startDate = habit.start_date ? new Date(habit.start_date) : new Date();
                const endDate = habit.end_date ? new Date(habit.end_date) : null;

                // For daily habits (simplified), calculate progress based on completion status
                completedCount = isCompletedForDate ? 1 : 0;
                progress = (completedCount / totalDays) * 100;
                dateRangeText = endDate
                    ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                    : `From ${startDate.toLocaleDateString()}`;

                return {
                    id: habit.id,
                    title: habit.title,
                    dateRange: dateRangeText,
                    progress: Math.min(progress, 100), // Cap at 100%
                    color: habit.color || '#fed7aa',
                    currentCount: habit.current_count,
                    targetCount: habit.target_count,
                    frequency: habit.frequency,
                    description: habit.description,
                    reminder: habit.reminder,
                    isCompletedForDate,
                    completedCount,
                    totalDays,
                    canCheckIn,
                };
            });

            // Apply filter based on selected filter type
            let filteredByType = habitsWithProgress;

            switch (filterType) {
                case 'active':
                    filteredByType = habitsWithProgress.filter((h: any) => {
                        // Show habits that can be checked in for selected date (not yet completed)
                        return h.canCheckIn;
                    });
                    break;
                case 'completed':
                    filteredByType = habitsWithProgress.filter((h: any) => h.isCompletedForDate);
                    break;
                case 'all':
                default:
                    filteredByType = habitsWithProgress;
                    break;
            }

            setHabits(filteredByType);
        } catch (error) {
            console.error('Error loading habits:', error);
        }
    }, [selectedDate, filterType]);

    useFocusEffect(
        React.useCallback(() => {
            loadHabits();
        }, [loadHabits])
    );

    // Handle habit card press - navigate to view details screen
    const handleHabitPress = (habitId: number) => {
        router.push({ pathname: '/pages/viewhabit', params: { id: habitId } });
    };

    // Handle habit check-in for selected date
    const handleHabitCheckIn = async (habitId: number) => {
        const selectedDateStr = new Date(selectedDate).toISOString().split('T')[0];
        const todayStr = new Date().toISOString().split('T')[0];

        // Allow check-in for today and past dates only (prevent future dates)
        if (selectedDateStr > todayStr) {
            console.log('Cannot check-in for future dates');
            return;
        }

        // Find the habit to check if multiple check-ins are allowed
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return;

        // If multiple check-ins are not allowed and habit is already completed, prevent check-in
        if (!habit.allow_multiple_per_day && isHabitCompletedForDate(habitId, selectedDateStr)) {
            console.log('Habit already completed for this date and multiple check-ins not allowed');
            return;
        }

        // Mark as completed for this specific date
        markHabitCompletedForDate(habitId, selectedDateStr);
        await loadHabits(); // Reload to update progress
    };

    // Handle habit deletion
    const handleDeleteHabit = async (habitId: number) => {
        try {
            await deleteHabit(habitId);
            await loadHabits(); // Reload to update list
        } catch (error) {
            console.error('Error deleting habit:', error);
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
                subtitle={habits.length === 0 ? "Start building your habits!" : `${overallProgress}% completed today`}
                progress={overallProgress}
            />
            <WeekCalendar
                selectedDate={new Date(selectedDate)}
                onSelectDate={(date) => {
                    setLastSelectedDate(selectedDate);
                    setSelectedDate(date);
                    // Reset filter to 'all' when changing dates to show consistent state
                    setFilterType('all');
                }}
            />

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                {(['all', 'active', 'completed'] as FilterType[]).map((filter) => (
                    <TouchableOpacity
                        key={filter}
                        style={[styles.filterTab, filterType === filter && styles.filterTabActive]}
                        onPress={() => setFilterType(filter)}
                    >
                        <Text style={[styles.filterText, filterType === filter && styles.filterTextActive]}>
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.list}>
                    {habits.map((h, i) => (
                        <HabitCard
                            key={h.id || i}
                            title={h.title}
                            progress={h.progress}
                            color={h.color}
                            onPress={() => handleHabitPress(h.id)}
                            onDelete={() => handleDeleteHabit(h.id)}
                            onEdit={() => router.push({ pathname: '/pages/edithabit', params: { id: h.id } })}
                            onCheckIn={() => handleHabitCheckIn(h.id)}
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
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#f8f9fa',
        gap: 8,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e1e5e9',
    },
    filterTabActive: {
        backgroundColor: '#f97316',
        borderColor: '#f97316',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    filterTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
});


