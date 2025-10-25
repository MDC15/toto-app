import ActivityBreakdownChart from '@/components/summary/ActivityBreakdownChart';
import SummaryCard from '@/components/summary/SummaryCard';
import SummaryTabs from '@/components/summary/SummaryTabs';
import TasksOverviewChart from '@/components/summary/TasksOverviewChart';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';


export default function SummaryScreen() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <SummaryTabs />

            <View style={styles.row}>
                <SummaryCard title="Tasks Completed" value="12/15" change="+15.3%" positive />
                <SummaryCard title="Habits Tracked" value="6/7" change="+5.1%" positive />
            </View>

            <View style={styles.row}>
                <SummaryCard title="Events Attended" value="3" change="-2.4%" />
                <SummaryCard title="Productivity Score" value="88%" change="+7.8%" positive />
            </View>

            <TasksOverviewChart />
            <ActivityBreakdownChart />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
});
