import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, responsive } from "@/constants/theme";
import { useEventReminders } from '@/contexts/NotificationContext';
import { deleteEvent, getEvents } from "@/db/database";
import { isSameDay } from "@/utils/dateUtils";
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

export default function EventListScreen() {
    const { date } = useLocalSearchParams();
    const selectedDate = React.useMemo(() => new Date(date as string), [date]);

    const { cancelEventReminder } = useEventReminders();
    const [events, setEvents] = useState<any[]>([]);

    const hourHeight = 80;
    const totalHeight = 24 * hourHeight;
    const timeColumnWidth = 60;

    const fetchEvents = React.useCallback(async () => {
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
                startTime,
                endTime,
            };
        });

        const dayEvents = formattedEvents.filter(ev => isSameDay(ev.startTime, selectedDate));
        dayEvents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

        setEvents(dayEvents);
    }, [selectedDate]);

    useFocusEffect(
        React.useCallback(() => {
            fetchEvents();
        }, [fetchEvents])
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
        <SafeAreaView style={styles.container}>
            {/* ====================== HEADER ====================== */}
            <View style={styles.header}>
                <Text style={styles.title}>
                    Events on {format(selectedDate, 'E, d MMM yyyy')}
                </Text>
            </View>

            {/* ====================== SCROLL AREA ====================== */}
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <View style={[styles.timeGrid, { height: totalHeight }]}>

                    {/* ===== LEFT HOUR COLUMN ===== */}
                    <View style={[styles.timeColumn, { width: timeColumnWidth }]}>
                        {Array.from({ length: 24 }, (_, i) => (
                            <Text key={i} style={styles.timeLabel}>
                                {`${i.toString().padStart(2, '0')}:00`}
                            </Text>
                        ))}
                    </View>

                    {/* ===== EVENTS AREA ===== */}
                    <View style={styles.eventsArea}>
                        {Array.from({ length: 24 }, (_, i) => (
                            <View
                                key={`line-${i}`}
                                style={[styles.hourLine, { top: (i + 1) * hourHeight - 1 }]}
                            />
                        ))}

                        {/* ===== EVENT CARDS ===== */}
                        {events.map((event) => {
                            const startHour = event.startTime.getHours();
                            const startMinute = event.startTime.getMinutes();

                            const top = startHour * hourHeight + (startMinute / 60) * hourHeight;

                            const durationMinutes =
                                (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60);

                            const height = Math.max((durationMinutes / 60) * hourHeight, 60);

                            return (
                                <TouchableOpacity
                                    key={event.id}
                                    style={[
                                        styles.eventItem,
                                        { top, height, backgroundColor: event.color }
                                    ]}
                                    onPress={() => handleEdit(event.id)}
                                    onLongPress={() => handleDelete(event.id)}
                                >
                                    <Text style={styles.eventTitle}>{event.title}</Text>

                                    {event.description && (
                                        <Text style={styles.eventDescription} numberOfLines={2}>
                                            {event.description}
                                        </Text>
                                    )}

                                    <Text style={styles.eventTime}>{event.timeRange}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

/* ===========================================================
                        STYLES – NEW UI
   =========================================================== */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
        paddingBottom: responsive.spacing(56),
        paddingTop: responsive.spacing(-50),
    },

    /* ===== HEADER ===== */
    header: {
        paddingVertical: responsive.spacing(25),
        borderBottomWidth: 1.5,
        borderBottomColor: '#e2e8f0',
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8fafc",
    },
    title: {
        fontSize: responsive.fontSize(20),
        fontWeight: '800',
        color: Colors.light.text,
        alignItems: 'center',
    },

    /* ===== TIMELINE ===== */
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: responsive.spacing(16),
    },
    timeGrid: {
        flexDirection: 'row',
    },

    timeLabel: {
        height: 80,
        textAlign: 'center',
        fontSize: responsive.fontSize(12),
        color: '#64748b',
        paddingTop: 8,
    },

    timeColumn: {},

    eventsArea: {
        flex: 1,
        position: 'relative',
    },

    hourLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#e2e8f0',
    },

    /* ===== EVENT CARD ===== */
    eventItem: {
        position: 'absolute',
        left: 10,
        right: 10,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        justifyContent: "flex-start",

        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 3,
        elevation: 2,
    },

    eventTitle: {
        fontSize: responsive.fontSize(15),
        fontWeight: "700",
        color: "#ffffff",
        marginBottom: 4,
    },

    eventDescription: {
        fontSize: responsive.fontSize(12),
        color: "#f8fafc",
        lineHeight: 16,
        marginTop: 4,
    },

    eventTime: {
        fontSize: responsive.fontSize(12),
        fontWeight: "500",
        color: "#f1f5f9",
        marginTop: 6,
    },
});
