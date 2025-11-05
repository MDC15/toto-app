import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
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
} from '@/db/database';
import { getNow } from '@/utils/dateUtils';

export default function HabitsScreen() {
    const router = useRouter();
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
            const selectedDateString = new Date(selectedDate).toISOString().split('T')[0];
            const todayString = new Date().toISOString().split('T')[0];
            const selectedDateObj = new Date(selectedDate);

            const habitsWithProgress = await Promise.all(
                dbHabits.map(async (habit: any) => {
                    // Check if habit is completed for the selected date
                    const isDone = await isHabitCompletedForDate(habit.id, selectedDateString);

                    // Check if habit is active on the selected date
                    const start = new Date(habit.start_date || new Date());
                    const end = habit.end_date ? new Date(habit.end_date) : null;

                    const isInDateRange =
                        start <= selectedDateObj &&
                        (!end || selectedDateObj <= end);

                    // Only show habits that are in their active date range
                    if (!isInDateRange) return null;

                    const canCheckIn =
                        (habit.allow_multiple_per_day || !isDone) &&
                        selectedDateString <= todayString;

                    // Calculate progress based on completed dates in the current period
                    const completedDates = JSON.parse(habit.completed_dates || '[]');
                    const totalCompleted = completedDates.length;
                    const progress = habit.target_count > 0 ?
                        Math.min((totalCompleted / habit.target_count) * 100, 100) :
                        (isDone ? 100 : 0);

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
                        completedCount: totalCompleted,
                    };
                })
            );

            const validHabits = habitsWithProgress.filter(Boolean);
            setHabits(validHabits);
        } catch (e) {
            console.error('Error loading habits:', e);
            setHabits([]);
        }
    }, [selectedDate]);

    useFocusEffect(useCallback(() => void loadHabits(), [loadHabits]));

    // ✅ Sự kiện
    const handleCheckIn = async (id: number) => {
        const dateStr = new Date(selectedDate).toISOString().split('T')[0];
        const todayStr = new Date().toISOString().split('T')[0];
        if (dateStr > todayStr) return;

        const habit = habits.find((h) => h.id === id);
        if (!habit || (!habit.allow_multiple_per_day && habit.isCompletedForDate)) return;

        markHabitCompletedForDate(id, dateStr);
        await loadHabits();
    };

    const handleDelete = async (id: number) => {
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
                                progress={h.progress}
                                color={h.color}
                                startDate={h.startDate}
                                endDate={h.endDate}
                                frequency={h.frequency}
                                targetCount={h.targetCount}
                                completedCount={h.completedCount}
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
