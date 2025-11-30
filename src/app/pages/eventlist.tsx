import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Dimensions,
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
    const screenWidth = Dimensions.get('window').width;

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

    // Calculate overlapping events and their layout positions
    const getEventLayoutInfo = React.useMemo(() => {
        return (events: any[]) => {
            const eventLayouts: { [key: number]: { column: number; totalColumns: number; left: number; width: number; displayIndex: number; isHidden: boolean; adjustedHeight: number } } = {};

            // Group events by time slot (hour)
            const timeSlotGroups: { [key: number]: any[] } = {};

            events.forEach((event) => {
                const startHour = event.startTime.getHours();
                if (!timeSlotGroups[startHour]) {
                    timeSlotGroups[startHour] = [];
                }
                timeSlotGroups[startHour].push(event);
            });

            // Process each time slot
            Object.keys(timeSlotGroups).forEach((hourKey) => {
                const hourEvents = timeSlotGroups[parseInt(hourKey)];
                const maxDisplayed = 3;

                // Sort events by start time within the hour
                hourEvents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

                // Find all overlapping groups within this hour
                const processedIndices = new Set<number>();

                hourEvents.forEach((event, idx) => {
                    if (processedIndices.has(idx)) return;

                    const overlappingGroup = [event];
                    processedIndices.add(idx);

                    // Find all events that overlap with this event
                    for (let i = idx + 1; i < hourEvents.length; i++) {
                        if (processedIndices.has(i)) continue;
                        const otherEvent = hourEvents[i];

                        // Check if events overlap
                        if (event.startTime < otherEvent.endTime && event.endTime > otherEvent.startTime) {
                            overlappingGroup.push(otherEvent);
                            processedIndices.add(i);
                        }
                    }

                    // Assign columns to overlapping events
                    const totalColumns = overlappingGroup.length;
                    overlappingGroup.forEach((groupEvent, columnIdx) => {
                        const durationMinutes = (groupEvent.endTime.getTime() - groupEvent.startTime.getTime()) / (1000 * 60);
                        let eventHeight = Math.max((durationMinutes / 60) * hourHeight, 48);

                        // Cap height to not exceed current hour cell
                        const maxHeightInHour = hourHeight - 4;
                        eventHeight = Math.min(eventHeight, maxHeightInHour);

                        const columnWidth = 100 / Math.min(totalColumns, maxDisplayed);
                        const displayIndex = overlappingGroup.findIndex(e => e.id === groupEvent.id);
                        const isHidden = displayIndex >= maxDisplayed;

                        eventLayouts[groupEvent.id] = {
                            column: Math.min(columnIdx, maxDisplayed - 1),
                            totalColumns: Math.min(totalColumns, maxDisplayed),
                            left: Math.min(columnIdx, maxDisplayed - 1) * columnWidth,
                            width: columnWidth,
                            displayIndex: displayIndex,
                            isHidden: isHidden,
                            adjustedHeight: eventHeight,
                        };
                    });
                });
            });

            return eventLayouts;
        };
    }, [hourHeight]);

    const eventLayoutInfo = getEventLayoutInfo(events);

    // Count hidden events per hour
    const getHiddenEventCount = React.useCallback((hourSlot: number) => {
        const hourEvents = events.filter(e => e.startTime.getHours() === hourSlot);
        let hiddenCount = 0;

        hourEvents.forEach((event) => {
            const layout = eventLayoutInfo[event.id];
            if (layout?.isHidden) {
                hiddenCount++;
            }
        });

        return hiddenCount;
    }, [events, eventLayoutInfo]);

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
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                scrollEventThrottle={16}
            >
                <View style={[styles.timeGrid, { height: totalHeight }]}>

                    {/* ===== LEFT HOUR COLUMN (Fixed) ===== */}
                    <View style={[styles.timeColumn, { width: timeColumnWidth }]}>
                        {Array.from({ length: 24 }, (_, i) => (
                            <Text key={i} style={styles.timeLabel}>
                                {`${i.toString().padStart(2, '0')}:00`}
                            </Text>
                        ))}
                    </View>

                    {/* ===== EVENTS AREA WITH HORIZONTAL SCROLL ===== */}
                    <ScrollView
                        horizontal
                        scrollEventThrottle={16}
                        showsHorizontalScrollIndicator={true}
                        style={styles.eventsAreaScroll}
                        contentContainerStyle={styles.eventsAreaContent}
                    >
                        <View style={[styles.eventsArea, { minWidth: screenWidth - timeColumnWidth }]}>
                            {/* Hour cells with boundaries */}
                            {Array.from({ length: 24 }, (_, i) => (
                                <View
                                    key={`hour-cell-${i}`}
                                    style={[
                                        styles.hourCell,
                                        {
                                            height: hourHeight,
                                            top: i * hourHeight,
                                        }
                                    ]}
                                />
                            ))}

                            {/* Hour lines */}
                            {Array.from({ length: 24 }, (_, i) => (
                                <View
                                    key={`line-${i}`}
                                    style={[styles.hourLine, { top: (i + 1) * hourHeight - 1 }]}
                                />
                            ))}

                            {/* ===== EVENT CARDS ===== */}
                            {events.map((event) => {
                                const layout = eventLayoutInfo[event.id] || { column: 0, totalColumns: 1, left: 0, width: 100, displayIndex: 0, isHidden: false, adjustedHeight: 60 };

                                // Skip hidden events
                                if (layout.isHidden) {
                                    return null;
                                }

                                const startHour = event.startTime.getHours();
                                const startMinute = event.startTime.getMinutes();

                                const top = startHour * hourHeight + (startMinute / 60) * hourHeight;
                                const height = layout.adjustedHeight;
                                const marginLeft = (layout.left / 100) * (screenWidth - timeColumnWidth - 8);
                                const width = (layout.width / 100) * (screenWidth - timeColumnWidth - 8) - 4;

                                return (
                                    <TouchableOpacity
                                        key={event.id}
                                        style={[
                                            styles.eventItem,
                                            {
                                                top,
                                                height,
                                                backgroundColor: event.color,
                                                marginLeft,
                                                width,
                                            }
                                        ]}
                                        onPress={() => handleEdit(event.id)}
                                        onLongPress={() => handleDelete(event.id)}
                                    >
                                        <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>

                                        {event.description && (
                                            <Text style={styles.eventDescription} numberOfLines={1}>
                                                {event.description}
                                            </Text>
                                        )}

                                        <Text style={styles.eventTime} numberOfLines={1}>{event.timeRange}</Text>
                                    </TouchableOpacity>
                                );
                            })}

                            {/* ===== "+X MORE" INDICATORS ===== */}
                            {Array.from({ length: 24 }, (_, hourSlot) => {
                                const hiddenCount = getHiddenEventCount(hourSlot);
                                if (hiddenCount === 0) return null;

                                const hourEvents = events.filter(e => e.startTime.getHours() === hourSlot);
                                const maxDisplayed = 3;
                                const visibleEvents = hourEvents.filter((e) => {
                                    const layout = eventLayoutInfo[e.id];
                                    return layout && !layout.isHidden;
                                });

                                if (visibleEvents.length === 0) return null;

                                // Position the "+X more" after the last visible event
                                const lastVisibleEvent = visibleEvents[visibleEvents.length - 1];
                                const startMinute = lastVisibleEvent.startTime.getMinutes();
                                const top = hourSlot * hourHeight + (startMinute / 60) * hourHeight + 58;

                                return (
                                    <TouchableOpacity
                                        key={`more-${hourSlot}`}
                                        style={[
                                            styles.moreEventsIndicator,
                                            {
                                                top,
                                                left: 8,
                                            }
                                        ]}
                                    >
                                        <Text style={styles.moreEventsText}>+{hiddenCount} more</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </ScrollView>
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
        paddingVertical: responsive.spacing(16),
        paddingHorizontal: responsive.spacing(20),
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        zIndex: 10,
    },
    title: {
        fontSize: responsive.fontSize(18),
        fontWeight: '700',
        color: Colors.light.text,
        letterSpacing: 0.5,
    },

    /* ===== TIMELINE ===== */
    scrollView: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        paddingBottom: responsive.spacing(24),
    },
    timeGrid: {
        flexDirection: 'row',
        paddingTop: responsive.spacing(16),
    },

    timeLabel: {
        height: 80,
        textAlign: 'right',
        fontSize: responsive.fontSize(11),
        color: '#94a3b8',
        paddingRight: 12,
        paddingTop: 8,
        fontWeight: '500',
    },

    timeColumn: {
        backgroundColor: '#fff',
        zIndex: 10,
    },

    eventsAreaScroll: {
        flex: 1,
        overflow: 'hidden',
    },

    eventsAreaContent: {
        flexGrow: 1,
    },

    eventsArea: {
        position: 'relative',
        borderLeftWidth: 1,
        borderLeftColor: '#f1f5f9',
        backgroundColor: '#fff',
        overflow: 'hidden',
    },

    hourCell: {
        position: 'absolute',
        left: 0,
        right: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        overflow: 'hidden',
    },

    hourLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#f1f5f9',
    },

    /* ===== EVENT CARD ===== */
    eventItem: {
        position: 'absolute',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        justifyContent: "flex-start",
        borderLeftWidth: 4,
        borderLeftColor: 'rgba(0,0,0,0.1)',
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },

    eventTitle: {
        fontSize: responsive.fontSize(13),
        fontWeight: "700",
        color: "#ffffff",
        marginBottom: 2,
    },

    eventDescription: {
        fontSize: responsive.fontSize(11),
        color: "rgba(255,255,255,0.9)",
        lineHeight: 14,
        marginTop: 2,
    },

    eventTime: {
        fontSize: responsive.fontSize(10),
        fontWeight: "600",
        color: "rgba(255,255,255,0.8)",
        marginTop: 4,
    },

    /* ===== MORE EVENTS INDICATOR ===== */
    moreEventsIndicator: {
        position: 'absolute',
        backgroundColor: '#f3f4f6',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderLeftWidth: 3,
        borderLeftColor: '#d1d5db',
    },

    moreEventsText: {
        fontSize: responsive.fontSize(10),
        fontWeight: '600',
        color: '#6b7280',
        letterSpacing: 0.2,
    },
});
