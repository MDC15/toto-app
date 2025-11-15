import React, { useMemo } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Svg, { Defs, G, LinearGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { PeriodType } from '../../hooks/useSummaryData';
import { TimeSeriesData } from '../../utils/dataAnalysis';

interface Props {
    data?: TimeSeriesData[];
    loading?: boolean;
    period?: PeriodType;
}

export default function TaskOverviewChart({ data, loading = false, period = 'weekly' }: Props) {
    const { width } = Dimensions.get('window');
    const animatedValue = React.useRef(new Animated.Value(0)).current;

    // Animate the chart on data load
    React.useEffect(() => {
        if (data && data.length > 0) {
            Animated.spring(animatedValue, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }).start();
        }
    }, [data, animatedValue]);

    /** 📊 Enhanced chart data processing **/
    const chartData = useMemo(() => {
        if (!data || data.length === 0)
            return { labels: [], datasets: [{ data: [] }] };

        const formatLabel = (date: string, period: PeriodType, index: number) => {
            const dateObj = new Date(date);

            switch (period) {
                case 'daily':
                    return dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                case 'weekly':
                    return `Week ${index + 1}`;
                case 'monthly':
                    return dateObj.toLocaleDateString('en-US', { month: 'short' });
                default:
                    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
        };

        const labels = data.map((item, index) => formatLabel(item.date, period, index));

        // Enhanced completion rate calculation with better visual feedback
        const rates = data.map((item) => {
            const rate = item.total > 0 ? (item.completed / item.total) * 100 : 0;
            return Math.round(rate * 10) / 10; // Round to 1 decimal place
        });

        return { labels, datasets: [{ data: rates }] };
    }, [data, period]);

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <Text style={styles.icon}>📈</Text>
                        <View>
                            <Text style={styles.title}>Task Progress Overview</Text>
                            <Text style={styles.subtitle}>
                                {period === 'daily' ? 'Daily completion rates' :
                                    period === 'weekly' ? 'Weekly completion rates' :
                                        'Monthly completion rates'}
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={styles.center}>
                    <Animated.View>
                        <ActivityIndicator size="large" color="#4CAF50" />
                    </Animated.View>
                    <Text style={styles.loadingText}>Loading data...</Text>
                </View>
            </View>
        );
    }

    return (
        <Animated.View style={[styles.container, { opacity: animatedValue }]}>
            {/* --- ENHANCED HEADER --- */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.icon}>📈</Text>
                    <View>
                        <Text style={styles.title}>Task Progress Overview</Text>
                        <Text style={styles.subtitle}>
                            {period === 'daily' ? 'Daily completion rates' :
                                period === 'weekly' ? 'Weekly completion rates' :
                                    'Monthly completion rates'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* --- ENHANCED CHART --- */}
            {data && data.length > 0 ? (
                <View style={styles.chartContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={{ paddingVertical: 20, paddingHorizontal: 20 }}>
                            <Svg width={width * 1.5} height={280}>
                                <Defs>
                                    <LinearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <Stop offset="0%" stopColor="#4CAF50" />
                                        <Stop offset="100%" stopColor="#2E7D32" />
                                    </LinearGradient>
                                </Defs>

                                {/* Enhanced Y-axis labels */}
                                {[0, 25, 50, 75, 100].map((value, index) => (
                                    <G key={index}>
                                        <SvgText
                                            x={30}
                                            y={220 - (value / 100) * 200}
                                            fontSize="12"
                                            fill="#6B7280"
                                            fontWeight="500"
                                            textAnchor="middle"
                                        >
                                            {value}%
                                        </SvgText>
                                        <Rect
                                            x={45}
                                            y={220 - (value / 100) * 200}
                                            width={width * 1.4}
                                            height={1}
                                            fill="#E5E7EB"
                                        />
                                    </G>
                                ))}

                                {/* Enhanced X-axis labels and bars */}
                                {chartData.labels.map((label, index) => {
                                    const completionRate = chartData.datasets[0].data[index];
                                    const barHeight = (completionRate / 100) * 200;
                                    const barWidth = Math.max((width * 1.4) / chartData.labels.length - 15, 20);
                                    const x = 60 + index * ((width * 1.4) / chartData.labels.length);
                                    const y = 220 - barHeight;

                                    // Dynamic coloring based on performance
                                    const getBarColor = () => {
                                        if (completionRate >= 80) return "#4CAF50";
                                        if (completionRate >= 60) return "#FFC107";
                                        if (completionRate >= 40) return "#FF9800";
                                        return "#F44336";
                                    };

                                    // Adjust font size based on period and label length
                                    const getFontSize = () => {
                                        if (period === 'monthly' && label.length > 3) return 10;
                                        if (period === 'daily' && label.length > 3) return 10;
                                        return 11;
                                    };

                                    return (
                                        <G key={index}>
                                            {/* Enhanced Bar with gradient */}
                                            <Rect
                                                x={x}
                                                y={y}
                                                width={barWidth}
                                                height={barHeight}
                                                fill={getBarColor()}
                                                rx={8}
                                            />

                                            {/* Highlight effect */}
                                            <Rect
                                                x={x + 1}
                                                y={y + 1}
                                                width={barWidth - 2}
                                                height={Math.max(barHeight - 2, 0)}
                                                fill="rgba(255,255,255,0.2)"
                                                rx={7}
                                            />

                                            {/* Value on top of bar */}
                                            <SvgText
                                                x={x + barWidth / 2}
                                                y={y - 12}
                                                fontSize="12"
                                                fill="#374151"
                                                fontWeight="700"
                                                textAnchor="middle"
                                            >
                                                {completionRate}%
                                            </SvgText>

                                            {/* Enhanced X-axis label */}
                                            <SvgText
                                                x={x + barWidth / 2}
                                                y={250}
                                                fontSize={getFontSize().toString()}
                                                fill="#6B7280"
                                                textAnchor="middle"
                                                fontWeight="500"
                                            >
                                                {label}
                                            </SvgText>
                                        </G>
                                    );
                                })}
                            </Svg>
                        </View>
                    </ScrollView>

                    {/* Chart summary */}
                    <View style={styles.summaryContainer}>
                        <Text style={styles.summaryText}>
                            📊 Total: {data.length} {period === 'daily' ? 'days' : period === 'weekly' ? 'weeks' : 'months'}
                        </Text>
                    </View>
                </View>
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📊</Text>
                    <Text style={styles.emptyTitle}>No data available</Text>
                    <Text style={styles.emptySubtitle}>
                        Complete some tasks to see your progress here.
                    </Text>
                </View>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        overflow: 'hidden',
    },
    header: {
        padding: 20,
        backgroundColor: '#F9FAFB',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: { fontSize: 24, marginRight: 12 },
    title: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
    subtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    chartContainer: {
        backgroundColor: '#FFFFFF',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 200,
    },
    loadingText: { marginTop: 10, color: '#666' },
    emptyContainer: {
        height: 250,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        backgroundColor: '#F9FAFB',
    },
    emptyIcon: { fontSize: 48, marginBottom: 16 },
    emptyTitle: { fontSize: 18, fontWeight: '600', color: '#6B7280', marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: '#9CA3AF', textAlign: 'center' },
    summaryContainer: {
        backgroundColor: '#F8F9FA',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    summaryText: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '600',
        textAlign: 'center',
    },
});
