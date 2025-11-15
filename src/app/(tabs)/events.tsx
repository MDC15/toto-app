import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import { Alert, ScrollView, StyleSheet, View, Text } from "react-native";

// Components
import EventCard from "@/components/events/EventCard";
import FloatingAddButton from "@/components/tasks/FloatingAddButton";
import WeekCalendar from "@/components/tasks/WeekCalendar";
import EmptyState from "@/components/common/EmptyState";
import { deleteEvent, getEvents, updateEvent } from "@/db/database";
import { getNow } from "@/utils/dateUtils";
import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import { useNotifications } from '@/contexts/NotificationContext';

const getIconForTitle = (title: string): string => {
    if (title.toLowerCase().includes('read')) return 'book-open-page-variant';
    if (title.toLowerCase().includes('workout')) return 'weight-lifter';
    if (title.toLowerCase().includes('grocery')) return 'cart';
    if (title.toLowerCase().includes('meeting')) return 'account-group';
    if (title.toLowerCase().includes('doctor')) return 'doctor';
    return 'calendar';
};

export default function EventsScreen() {
    const { selectedDate: selectedDateParam } = useLocalSearchParams<{ selectedDate?: string }>();
    const { cancelEventNotification } = useNotifications();
    const [selectedDate, setSelectedDate] = React.useState(getNow());
    const [events, setEvents] = useState<any[]>([]);

    // Handle date navigation from home screen
    useEffect(() => {
        if (selectedDateParam) {
            const navDate = new Date(selectedDateParam);
            setSelectedDate(navDate);
        }
    }, [selectedDateParam]);

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
                        // Cancel notification before deleting
                        await cancelEventNotification(eventId);
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

            {/* Date indicator when navigated from home screen */}
            {selectedDateParam && (
                <View style={styles.dateIndicator}>
                    <Text style={styles.dateIndicatorText}>
                        Viewing events for {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
                    </Text>
                </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
                    {eventsForDate.length > 0 ? (
                        eventsForDate.map((event) => (
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
                        ))
                    ) : (
                        <EmptyState
                            message="No events for this day"
                            buttonText=""
                            onButtonPress={() => {}}
                        />
                    )}
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
    dateIndicator: {
        backgroundColor: '#f97316',
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        borderRadius: 8,
        marginBottom: 10,
    },
    dateIndicatorText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
});

