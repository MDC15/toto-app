import ActivityBreakdownChart from '@/components/summary/ActivityBreakdownChart';
import SummaryCard from '@/components/summary/SummaryCard';
import SummaryTabs from '@/components/summary/SummaryTabs';
import TasksOverviewChart from '@/components/summary/TasksOverviewChart';
import {
    PeriodType,
    usePercentageChange,
    useSummaryData,
} from '@/hooks/useSummaryData';
import React from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';

export default function SummaryScreen() {
    const {
        stats,
        timeSeriesData,
        activityBreakdown,
        loading,
        error,
        refreshData,
        setPeriod,
        currentPeriod,
    } = useSummaryData('weekly');

    // 🔄 Refresh handler
    const onRefresh = React.useCallback(async () => {
        try {
            await refreshData();
        } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Failed to refresh data');
        }
    }, [refreshData]);

    // 🗓 Change period handler
    const handlePeriodChange = (period: PeriodType) => {
        setPeriod(period);
    };

    // 📈 Calculate percentage changes
    const taskCompletionChange = usePercentageChange(stats?.completedTasks || 0, currentPeriod, 'tasks');
    const habitsChange = usePercentageChange(stats?.activeHabits || 0, currentPeriod, 'habits');
    const eventsChange = usePercentageChange(stats?.totalEvents || 0, currentPeriod, 'events');
    const productivityChange = usePercentageChange(stats?.productivityScore || 0, currentPeriod, 'productivity');

    // ⚠️ Error fallback
    if (error && !stats) {
        return (
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
            >
                <SummaryTabs selected={currentPeriod} onTabChange={handlePeriodChange} />
                <View style={styles.errorContainer}>
                    <SummaryCard
                        title="Error"
                        value="Failed to load data"
                        subtitle={error}
                        loading={false}
                    />
                </View>
            </ScrollView>
        );
    }

    // ✅ Normal render
    return (
        <View style={styles.container}>
            <SummaryTabs selected={currentPeriod} onTabChange={handlePeriodChange} />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
            >
                {/* --- Summary Cards Row 1 --- */}
                <View style={styles.row}>
                    <SummaryCard
                        title="Tasks Completed"
                        value={stats ? `${stats.completedTasks}/${stats.totalTasks}` : '0/0'}
                        change={loading ? undefined : taskCompletionChange.percentageChange}
                        positive={taskCompletionChange.isPositive}
                        loading={loading}
                        subtitle={stats ? `${stats.completionRate}% completion rate` : undefined}
                    />
                    <SummaryCard
                        title="Habits Tracked"
                        value={stats ? `${stats.activeHabits}/${stats.totalHabits}` : '0/0'}
                        change={loading ? undefined : habitsChange.percentageChange}
                        positive={habitsChange.isPositive}
                        loading={loading}
                    />
                </View>

                {/* --- Summary Cards Row 2 --- */}
                <View style={styles.row}>
                    <SummaryCard
                        title="Events"
                        value={stats ? `${stats.upcomingEvents}/${stats.totalEvents}` : '0/0'}
                        change={loading ? undefined : eventsChange.percentageChange}
                        positive={eventsChange.isPositive}
                        loading={loading}
                        subtitle="upcoming/total"
                    />
                    <SummaryCard
                        title="Productivity Score"
                        value={stats?.productivityScore || 0}
                        change={loading ? undefined : productivityChange.percentageChange}
                        positive={productivityChange.isPositive}
                        loading={loading}
                    />
                </View>

                {/* --- Charts --- */}
                <TasksOverviewChart data={timeSeriesData} loading={loading} period={currentPeriod} />
                <ActivityBreakdownChart data={activityBreakdown} loading={loading} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    content: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
