import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import NameInputModal from '@/components/common/NameInputModal';
import CalendarCard from '@/components/home/CalendarCard';
import GreetingCard from '@/components/home/GreetingCard';
import TaskSection from '@/components/home/TaskSection';
import { TaskItem, TaskTypes } from '@/components/home/types';
import { responsive } from '@/constants/theme';
import { useTasks } from '@/contexts/TasksContext';
import { useUser } from '@/contexts/UserContext';
import { getEvents } from '@/db/database';
import Banner from '@/services/ads/Banner';
import { getDateString } from '@/utils/dateUtils';
import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import { router } from 'expo-router';

const getIconForTitle = (title: string): React.ComponentProps<typeof MaterialCommunityIcons>['name'] => {
    if (title.toLowerCase().includes('read')) return 'book-open-page-variant';
    if (title.toLowerCase().includes('workout')) return 'weight-lifter';
    if (title.toLowerCase().includes('grocery')) return 'cart';
    if (title.toLowerCase().includes('meeting')) return 'account-group';
    if (title.toLowerCase().includes('doctor')) return 'doctor';
    return 'checkbox-marked-circle-outline';
};

export default function HomeScreen() {
    const { userName, setUserName, isLoading } = useUser();
    const { tasks } = useTasks();
    const [events, setEvents] = useState<TaskItem[]>([]);
    const [selectedDate, setSelectedDate] = React.useState(new Date());
    const [showNameModal, setShowNameModal] = useState(false);
    const [eventDates, setEventDates] = useState<{ date: string; color?: string }[]>([]);

    useEffect(() => {
        if (!isLoading && !userName) {
            setShowNameModal(true);
        }
    }, [isLoading, userName]);

    const handleNameConfirm = async (name: string) => {
        await setUserName(name);
        setShowNameModal(false);
    };

    const handleNameCancel = () => {
        setShowNameModal(false);
    };

    const fetchEvents = async () => {
        const dbEvents = await getEvents();
        const formattedEvents: TaskItem[] = dbEvents.map((event: any) => {
            const startTime = new Date(event.start_time);
            const endTime = new Date(event.end_time);
            return {
                id: event.id,
                title: event.title,
                timeRange: `${format(startTime, 'p')} - ${format(endTime, 'p')}`,
                date: format(startTime, 'E, d MMM yyyy'),
                icon: getIconForTitle(event.title),
                color: event.color || '#ec4899', // Default color if none set
            };
        });
        setEvents(formattedEvents);

        // Extract event dates for calendar dots
        const datesWithEvents = dbEvents.map((event: any) => {
            const startTime = new Date(event.start_time);
            return {
                date: format(startTime, 'yyyy-MM-dd'),
                color: event.color || '#cc5f24' // Darker orange color
            };
        });
        setEventDates(datesWithEvents);
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchEvents();
        }, [])
    );

    const todayString = new Date().toDateString();
    const selectedDateString = selectedDate.toDateString();
    const selectedTasks: TaskItem[] = tasks
        .filter(task => {
            const taskDate = new Date(task.deadline).toDateString();
            return taskDate === selectedDateString;
        })
        .map(task => {
            const deadline = new Date(task.deadline);
            return {
                id: task.id,
                title: task.title,
                description: task.description,
                due: `${selectedDateString === todayString ? 'Today' : selectedDate.toLocaleDateString()}, ${deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                icon: getIconForTitle(task.title),
            };
        });

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
        >
            <GreetingCard username={userName || 'User'} />
            <CalendarCard
                onDateSelect={(date) => {
                    setSelectedDate(date);
                    // Navigate to events tab with selected date as YYYY-MM-DD (avoid TZ offsets)
                    router.push({
                        pathname: '/(tabs)/events',
                        params: { selectedDate: getDateString(date) }
                    });
                }}
                markedData={eventDates}
            />
            <TaskSection
                title={`${selectedDateString === todayString ? 'Today\'s' : 'Selected Date'} Tasks`}
                items={selectedTasks}
                type={TaskTypes.TASK}
                colors={['#f97316', '#facc15'] as const}
                iconName="format-list-checks"
                onAdd={() => router.push('/pages/addtask')}
            />
            <TaskSection
                title="Upcoming Events"
                items={events}
                type={TaskTypes.EVENT}
                colors={['#ec4899', '#fcd34d'] as const}
                iconName="calendar-month"
                onAdd={() => router.push('/pages/createevent')}
            />
            <NameInputModal
                visible={showNameModal}
                onConfirm={handleNameConfirm}
                onCancel={handleNameCancel}
            />
            <Banner />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    contentContainer: {
        paddingHorizontal: responsive.spacing(16),
        paddingTop: responsive.spacing(56),
        paddingBottom: responsive.spacing(32),
    },
});
