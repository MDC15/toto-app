import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

// Components
import StatCard from '@/components/summary/StatCard';
import TaskCompletionChart from '@/components/summary/TaskCompletionChart';

const summaryData = {
    tasksCompleted: 125,
    tasksInProgress: 20,
    habitsCompleted: 300,
    completionRate: 85,
};

const chartData = [
    { label: 'Mon', value: 10 },
    { label: 'Tue', value: 15 },
    { label: 'Wed', value: 8 },
    { label: 'Thu', value: 12 },
    { label: 'Fri', value: 20 },
    { label: 'Sat', value: 18 },
    { label: 'Sun', value: 22 },
];

export default function SummaryScreen() {
    return (
        <ScrollView style={styles.container}>
            <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>
                <StatCard title="Tasks Completed" value={String(summaryData.tasksCompleted)} icon="check-circle" />
                <StatCard title="Tasks In Progress" value={String(summaryData.tasksInProgress)} icon="trending-up" />
                <StatCard title="Habits Completed" value={String(summaryData.habitsCompleted)} icon="repeat" />
                <StatCard title="Completion Rate" value={`${summaryData.completionRate}%`} icon="pie-chart" />

                <TaskCompletionChart title="Weekly Task Completion" data={chartData} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});
