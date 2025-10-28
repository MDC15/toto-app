import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View, ViewStyle
} from 'react-native';
import EmptyState from '../common/EmptyState';
import EventCardHome from './EventCardHome';
import TaskCardHome from './TaskCardHome';
import { TaskItem } from './types';

interface TaskSectionProps {
    title: string;
    items: TaskItem[];
    type?: 'task' | 'event'; // phân biệt giữa task và event
    colors?: readonly [string, string];
    iconName?: string; // icon bên cạnh tiêu đề
    iconColor?: string;
    onSeeAll?: () => void;
    onAdd?: () => void;
    containerStyle?: ViewStyle;
}

export default function TaskSection({
    title,
    items,
    type = 'task',
    colors,
    iconName,
    iconColor = '#f97316',
    onSeeAll,
    onAdd,
    containerStyle,
}: TaskSectionProps) {
    const router = useRouter();

    const handleSeeAll = () => {
        if (type === 'task') {
            router.push('/(tabs)/tasks');
        } else if (type === 'event') {
            router.push('/(tabs)/events');
        }
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    {iconName && (
                        <MaterialCommunityIcons
                            name={iconName as any}
                            size={24}
                            color={iconColor}
                            style={{ marginRight: 6 }}
                        />
                    )}
                    <Text style={styles.headerTitle}>{title}</Text>
                </View>

                <TouchableOpacity onPress={handleSeeAll}>
                    <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
            </View>

            {/* Cards */}
            {items.length > 0 ? (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContainer}
                >
                    {items.map((item) => (
                        type === 'task' ? (
                            <TaskCardHome
                                key={item.id}
                                item={item}
                                colors={colors}
                                style={{ marginRight: 14 }}
                            />
                        ) : (
                            <EventCardHome
                                key={item.id}
                                item={item}
                                colors={colors}
                                style={{ marginRight: 14 }}
                            />
                        )
                    ))}
                </ScrollView>
            ) : (
                <EmptyState
                    message={`No ${type === 'task' ? 'tasks' : 'events'} for today.`}
                    buttonText={`Create ${type === 'task' ? 'Task' : 'Event'}`}
                    onButtonPress={onAdd ? onAdd : () => { }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 18,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111',
    },
    seeAll: {
        fontSize: 14,
        color: '#9ca3af',
        fontWeight: '500',
    },
    scrollContainer: {
        paddingRight: 12,
    },
});