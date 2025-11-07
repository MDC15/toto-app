import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import { ActivityBreakdown } from '../../utils/dataAnalysis';

interface ActivityBreakdownChartProps {
    data?: ActivityBreakdown | null;
    loading?: boolean;
}

export default function ActivityBreakdownChart({ data, loading = false }: ActivityBreakdownChartProps) {
    const chartData = useMemo(() => {
        if (!data) return [];
        const total = data.tasks + data.events + data.habits;
        if (total === 0) return [];

        return [
            {
                name: 'Tasks',
                population: data.tasks,
                color: '#00bbffff',
                legendFontColor: '#777',
                legendFontSize: 12
            },
            {
                name: 'Events',
                population: data.events,
                color: '#FF6347',
                legendFontColor: '#777',
                legendFontSize: 12
            },
            {
                name: 'Habits',
                population: data.habits,
                color: '#61e73cff',
                legendFontColor: '#777',
                legendFontSize: 12
            },
        ].filter(item => item.population > 0);
    }, [data]);

    const getTopActivity = (): string => {
        if (!data) return '';
        const activities = [
            { name: 'Tasks', count: data.tasks },
            { name: 'Events', count: data.events },
            { name: 'Habits', count: data.habits }
        ].sort((a, b) => b.count - a.count);
        return activities[0]?.name || '';
    };

    // Tổng để tính %
    const total = data ? data.tasks + data.events + data.habits : 0;

    // Góc biểu đồ
    const segments = chartData.map((item, index) => {
        const startAngle = chartData.slice(0, index).reduce((sum, prev) => sum + (prev.population / total) * 360, 0);
        const endAngle = startAngle + (item.population / total) * 360;
        return { ...item, startAngle, endAngle };
    });

    const renderDonutChart = () => {
        if (!total) return null;

        const centerX = 100;
        const centerY = 100;
        const radius = 80;
        const innerRadius = 50;

        return (
            <Svg width={200} height={200} style={{ marginVertical: 20 }}>
                {segments.map((segment, index) => {
                    const startAngle = (segment.startAngle - 90) * Math.PI / 180;
                    const endAngle = (segment.endAngle - 90) * Math.PI / 180;

                    const x1 = centerX + radius * Math.cos(startAngle);
                    const y1 = centerY + radius * Math.sin(startAngle);
                    const x2 = centerX + radius * Math.cos(endAngle);
                    const y2 = centerY + radius * Math.sin(endAngle);

                    const largeArcFlag = segment.endAngle - segment.startAngle > 180 ? 1 : 0;

                    const outerPath = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
                    const innerPath = `M ${centerX + innerRadius * Math.cos(endAngle)} ${centerY + innerRadius * Math.sin(endAngle)} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${centerX + innerRadius * Math.cos(startAngle)} ${centerY + innerRadius * Math.sin(startAngle)}`;

                    return (
                        <G key={index}>
                            <Path
                                d={`${outerPath} L ${centerX + innerRadius * Math.cos(endAngle)} ${centerY + innerRadius * Math.sin(endAngle)} ${innerPath} Z`}
                                fill={segment.color}
                            />
                        </G>
                    );
                })}

                {/* Vòng tròn trung tâm */}
                <Circle cx={centerX} cy={centerY} r={innerRadius} fill="white" />

                {/* Text ở giữa */}
                <SvgText
                    x={centerX}
                    y={centerY - 5}
                    fontSize="14"
                    fontWeight="bold"
                    fill="#1F2937"
                    textAnchor="middle"
                >
                    {total}
                </SvgText>
                <SvgText
                    x={centerX}
                    y={centerY + 10}
                    fontSize="10"
                    fill="#6B7280"
                    textAnchor="middle"
                >
                    Total
                </SvgText>
            </Svg>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Ionicons name="pie-chart-outline" size={22} color="#4B5563" style={{ marginRight: 10 }} />
                    <View>
                        <Text style={styles.title}>Activity Breakdown</Text>
                        <Text style={styles.subtitle}>Tasks vs Events vs Habits</Text>
                    </View>
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                </View>
            ) : data && chartData.length > 0 ? (
                <View style={styles.contentContainer}>
                    <View style={styles.chartSection}>{renderDonutChart()}</View>

                    {/* Legend có thêm % */}
                    <View style={styles.legendContainer}>
                        {chartData.map((item, index) => {
                            const percentage = ((item.population / total) * 100).toFixed(1);
                            return (
                                <View key={index} style={styles.legendItem}>
                                    <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                                    <Text style={styles.legendText}>
                                        {item.name}: {item.population} ({percentage}%)
                                    </Text>
                                </View>
                            );
                        })}
                    </View>

                    <View style={styles.summaryContainer}>
                        <Text style={styles.summaryText}>
                            Top category: {getTopActivity()}
                        </Text>
                    </View>
                </View>
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="bar-chart-outline" size={40} color="#9CA3AF" style={{ marginBottom: 10 }} />
                    <Text style={styles.emptyText}>No activities recorded</Text>
                    <Text style={styles.emptySubtext}>
                        Start adding tasks, events, and habits to see your breakdown
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
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
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    subtitle: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    chartSection: {
        alignItems: 'center',
    },
    legendContainer: {
        marginTop: 16,
        marginBottom: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    legendText: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    summaryContainer: {
        backgroundColor: '#F3F4F6',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    summaryText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        fontWeight: '500',
    },
    loadingContainer: {
        height: 220,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        height: 220,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 20,
    },
    emptyText: {
        color: '#6B7280',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtext: {
        color: '#9CA3AF',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
});
