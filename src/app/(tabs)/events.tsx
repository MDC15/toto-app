import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";

// Components
import EventCard from "@/components/events/EventCard";
import FloatingAddButton from "@/components/tasks/FloatingAddButton";
import WeekCalendar from "@/components/tasks/WeekCalendar";
import { deleteEvent, getEvents, updateEvent } from "@/db/database";
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

    // Filter events for selected date
    const eventsForDate = React.useMemo(() => {
        const selectedDateString = selectedDate.toDateString();
        return events.filter((event) => {
            return event.startTime.toDateString() === selectedDateString;
        });
    }, [events, selectedDate]);

    useFocusEffect(
        React.useCallback(() => {
            fetchEvents();
        }, [])
    );

    const handleToggleComplete = async (eventId: number) => {
        const event = events.find(e => e.id === eventId);
        if (event) {
            const startTime = new Date(event.start_time || new Date());
            const endTime = new Date(event.end_time || new Date());
            await updateEvent(
                eventId,
                event.title,
                startTime.toISOString(),
                endTime.toISOString(),
                event.description || '',
                !event.completed,
                event.reminder,
                event.color
            );
            await fetchEvents();
        }
    };

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
            <WeekCalendar
                selectedDate={new Date(selectedDate)}
                onSelectDate={(date) => setSelectedDate(date)}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
                    {eventsForDate.map((event) => (
                        <EventCard
                            key={event.id}
                            title={event.title}
                            timeRange={event.timeRange}
                            date={event.date}
                            icon={event.icon}
                            completed={event.completed}
                            color={event.color}
                            reminder={event.reminder}
                            onToggleComplete={() => handleToggleComplete(event.id)}
                            onEdit={() => handleEdit(event.id)}
                            onDelete={() => handleDelete(event.id)}
                        />
                    ))}
                </View>
            </ScrollView>

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
