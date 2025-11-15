import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 🧩 Components
import EmptyState from '@/components/common/EmptyState';
import AddHabitModal from '@/components/habits/AddHabitModal';
import HabitCard from '@/components/habits/HabitCard';
import WeekCalendar from '@/components/tasks/WeekCalendar';

// 🗃️ Database utils
import ProgressHeader from '@/components/habits/ProgressHeader';
import {
    deleteHabit,
    getHabits,
    isHabitCompletedForDate,
    markHabitCompletedForDate,
    parseHabitDate,
} from '@/db/database';
import { getDateString, getNow } from '@/utils/dateUtils';
import { useNotifications } from '@/contexts/NotificationContext';

export default function HabitsScreen() {
    const router = useRouter();
    const { cancelHabitNotification } = useNotifications();
    const [selectedDate, setSelectedDate] = useState(getNow());
    const [habits, setHabits] = useState<any[]>([]);

    // 🧮 Tính tổng tiến trình trung bình
    const overallProgress = useMemo(() => {
        if (!habits.length) return 0;
        const total = habits.reduce((sum, h) => sum + h.progress, 0);
        return Math.round(total / habits.length);
    }, [habits]);

    // 📦 Load danh sách thói quen
    const loadHabits = useCallback(async () => {
        try {
            const dbHabits = await getHabits();
            const selectedDateString = getDateString(selectedDate);
            const todayString = getDateString(getNow());

            // Normalize selected date to ensure consistent comparison
            const normalizedSelectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
            const selectedDateObj = normalizedSelectedDate;

            const habitsWithProgress = await Promise.all(
                dbHabits.map(async (habit: any) => {
                    // Check if habit is completed for the selected date
                    const isDone = await isHabitCompletedForDate(habit.id, selectedDateString);

                    // Check if habit is active on the selected date using consistent date parsing
                    const start = parseHabitDate(habit.start_date || new Date().toISOString());
                    const end = habit.end_date ? parseHabitDate(habit.end_date) : null;

                    const isInDateRange =
                        start <= selectedDateObj &&
                        (!end || selectedDateObj <= end);

                    // Only show habits that are in their active date range
                    if (!isInDateRange) return null;

                    const canCheckIn =
                        (habit.allow_multiple_per_day || !isDone) &&
                        selectedDateString <= todayString;

                    // Calculate total days from start date to end date
                    const actualEndDate = end || selectedDateObj;
                    const totalDays = Math.ceil((actualEndDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

                    // Get all completed dates and filter to only include dates within the habit's date range
                    const completedDates = JSON.parse(habit.completed_dates || '[]');
                    const normalizedStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
                    const normalizedEnd = new Date(actualEndDate.getFullYear(), actualEndDate.getMonth(), actualEndDate.getDate());

                    const completedDatesInRange = completedDates.filter((date: string) => {
                        const completedDate = parseHabitDate(date);
                        const normalizedCompletedDate = new Date(completedDate.getFullYear(), completedDate.getMonth(), completedDate.getDate());
                        return normalizedCompletedDate >= normalizedStart && normalizedCompletedDate <= normalizedEnd;
                    }).length;

                    // Calculate progress based on completed dates within the habit's date range vs total possible days
                    const progress = totalDays > 0 ?
                        Math.min((completedDatesInRange / totalDays) * 100, 100) :
                        0;

                    return {
                        id: habit.id,
                        title: habit.title,
                        progress,
                        color: habit.color || '#fed7aa',
                        isCompletedForDate: isDone,
                        canCheckIn,
                        startDate: start,
                        endDate: end,
                        frequency: habit.frequency,
                        targetCount: habit.target_count,
                        completedCount: completedDatesInRange,
                        totalDaysInPeriod: totalDays,
                    };
                })
            );

            const validHabits = habitsWithProgress.filter(Boolean);
            setHabits(validHabits);
        } catch (error) {
            console.error('Error loading habits:', error);
            setHabits([]);
        }
    }, [selectedDate]);

    useFocusEffect(useCallback(() => void loadHabits(), [loadHabits]));

    // Reload habits when selected date changes
    useEffect(() => {
        loadHabits();
    }, [loadHabits, selectedDate]);

    // ✅ Sự kiện
    const handleCheckIn = async (id: number) => {
        const dateStr = getDateString(selectedDate);
        const todayStr = getDateString(getNow());
        if (dateStr > todayStr) return;

        const habit = habits.find((h) => h.id === id);
        if (!habit || (!habit.allow_multiple_per_day && habit.isCompletedForDate)) return;

        markHabitCompletedForDate(id, dateStr);
        await loadHabits();
    };

    const handleDelete = async (id: number) => {
        // Cancel notification before deleting
        await cancelHabitNotification(id);
        await deleteHabit(id);
        await loadHabits();
    };

    const navigate = (path: string, id: number) => {
        if (path === '/pages/viewhabit') {
            router.push({ pathname: '/pages/viewhabit', params: { id: id.toString() } });
        } else if (path === '/pages/edithabit') {
            router.push({ pathname: '/pages/edithabit', params: { id: id.toString() } });
        }
    };

    // 🖥️ Render UI
    return (
        <SafeAreaView style={styles.container}>
            <ProgressHeader
                title="Combat Procrastination"
                subtitle="You're making great progress!"
                progress={overallProgress}
            />

            <WeekCalendar
                selectedDate={new Date(selectedDate)}
                onSelectDate={(date) => setSelectedDate(date)}
            />

            {/* Danh sách thói quen */}
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.list}>
                    {habits.length === 0 ? (
                        <EmptyState
                            message="No habits for this day"
                            buttonText=""
                            onButtonPress={() => { }}
                        />
                    ) : (
                        habits.map((h) => (
                            <HabitCard
                                key={h.id}
                                title={h.title}
                                color={h.color}
                                startDate={h.startDate}
                                endDate={h.endDate}
                                frequency={h.frequency}
                                targetCount={h.targetCount}
                                completedCount={h.completedCount}
                                totalDaysInPeriod={h.totalDaysInPeriod}
                                onPress={() => navigate('/pages/viewhabit', h.id)}
                                onEdit={() => navigate('/pages/edithabit', h.id)}
                                onDelete={() => handleDelete(h.id)}
                                onCheckIn={() => handleCheckIn(h.id)}
                                canCheckIn={h.canCheckIn}
                                isCheckedIn={h.isCompletedForDate}
                            />
                        ))
                    )}
                </View>
            </ScrollView>

            <AddHabitModal />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 0,
    },
    list: {
        paddingHorizontal: 12,
        marginTop: 8,
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 20,
        fontSize: 15,
    },
});
