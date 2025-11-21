import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

// Components
import MonthCalendar from "@/components/events/MonthCalendar";
import FloatingAddButton from "@/components/tasks/FloatingAddButton";
import { useEventReminders } from '@/contexts/NotificationContext';
import { deleteEvent, getEvents } from "@/db/database";
import { getNow } from "@/utils/dateUtils";
import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';

const getIconForTitle = (title: string): string => {
    if (title.toLowerCase().includes('read')) return 'book-open-page-variant';
    if (title.toLowerCase().includes('workout')) return 'weight-lifter';
    if (title.toLowerCase().includes('grocery')) return 'cart';
    if (title.toLowerCase().includes('meeting')) return 'account-group';
    if (title.toLowerCase().includes('doctor')) return 'doctor';
    return 'calendar';
};

export default function EventsScreen() {
    const { cancelEventReminder } = useEventReminders();
    const [selectedDate, setSelectedDate] = React.useState(getNow());
    const [events, setEvents] = useState<any[]>([]);

    const fetchEvents = async () => {
        const dbEvents = await getEvents();
        const formattedEvents = dbEvents.map((event: any) => {
            const startTime = new Date(event.start_time);
            const endTime = new Date(event.end_time);
            return {
                id: event.id,
                title: event.title,
                timeRange: `${format(startTime, 'p')} - ${format(endTime, 'p')}`,
                date: format(startTime, 'E, d MMM yyyy'),
                icon: getIconForTitle(event.title),
                description: event.description,
                completed: !!event.completed,
                color: event.color || "#f97316",
                reminder: event.reminder,
                startTime: startTime,
            };
        });
        setEvents(formattedEvents);
    };


    useFocusEffect(
        React.useCallback(() => {
            fetchEvents();
        }, [])
    );


    const handleDelete = async (eventId: number) => {
        Alert.alert(
            'Delete Event',
            'Are you sure you want to delete this event?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        // Cancel notification before deleting
                        await cancelEventReminder(eventId);
                        await deleteEvent(eventId);
                        await fetchEvents();
                    }
                }
            ]
        );
    };

    const handleEdit = (eventId: number) => {
        router.push({ pathname: "/pages/editevent", params: { id: String(eventId) } });
    };


    return (
        <View style={styles.container}>
            <MonthCalendar
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                events={events}
                onEditEvent={handleEdit}
                onDeleteEvent={handleDelete}
                onViewEvents={(date) => router.push({ pathname: "/pages/eventlist", params: { date: date.toISOString() } })}
            />
            <FloatingAddButton onPress={() => router.push("/pages/createevent")} />
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
});

