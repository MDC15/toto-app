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
import Svg, { Defs, LinearGradient, Rect, G, Stop, Text as SvgText } from 'react-native-svg';
import { TimeSeriesData } from '../../utils/dataAnalysis';
import { PeriodType } from '../../hooks/useSummaryData';

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

        const formatLabel = (date: string, period: PeriodType) => {
            const dateObj = new Date(date);

            switch (period) {
                case 'daily':
                    return dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                case 'weekly':
                    return `${dateObj.toLocaleDateString('en-US', { month: 'short' })} ${getWeekNumber(dateObj)}`;
                case 'monthly':
                    return dateObj.toLocaleDateString('en-US', { month: 'short' });
                default:
                    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
        };

        const getWeekNumber = (date: Date) => {
            const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            const dayNum = d.getUTCDay() || 7;
            d.setUTCDate(d.getUTCDate() + 4 - dayNum);
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
            return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        };

        const labels = data.map((item) => formatLabel(item.date, period));

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
                    <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
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
                        <Text style={styles.title}>Tiến độ hoàn thành công việc</Text>
                        <Text style={styles.subtitle}>
                            {period === 'daily' ? 'Tỷ lệ hoàn thành hàng ngày' :
                                period === 'weekly' ? 'Tỷ lệ hoàn thành hàng tuần' :
                                    'Tỷ lệ hoàn thành hàng tháng'}
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
                            📊 Tổng cộng: {data.length} {period === 'daily' ? 'ngày' : period === 'weekly' ? 'tuần' : 'tháng'}
                        </Text>
                    </View>
                </View>
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📊</Text>
                    <Text style={styles.emptyTitle}>Không có dữ liệu</Text>
                    <Text style={styles.emptySubtitle}>
                        Hoàn thành một số công việc để xem tiến độ của bạn ở đây.
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
