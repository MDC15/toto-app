import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    View
} from 'react-native';
import Svg, {
    Circle,
    Defs,
    G,
    LinearGradient,
    Path,
    Stop,
    Text as SvgText
} from 'react-native-svg';
import { ActivityBreakdown } from '../../utils/dataAnalysis';

Dimensions.get('window');

// Professional color palette
const colors = {
    tasks: '#3B82F6',      // Blue
    events: '#EF4444',     // Red  
    habits: '#10B981',     // Emerald
    background: '#FFFFFF',
    text: '#1F2937',
    secondary: '#6B7280',
    light: '#F9FAFB',
    border: '#E5E7EB'
};

interface ActivityBreakdownChartProps {
    data?: ActivityBreakdown | null;
    loading?: boolean;
}

export default function ActivityBreakdownChart({ data, loading = false }: ActivityBreakdownChartProps) {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    // Enhanced color palette with gradients - memoized to prevent recreation
    const gradientColors = useMemo(() => [
        { primary: '#3B82F6', secondary: '#1E40AF', name: 'Tasks' },
        { primary: '#EF4444', secondary: '#DC2626', name: 'Events' },
        { primary: '#10B981', secondary: '#059669', name: 'Habits' },
        { primary: '#8B5CF6', secondary: '#7C3AED', name: 'Other' }
    ], []);

    const chartData = useMemo(() => {
        if (!data) return [];
        const total = data.tasks + data.events + data.habits;
        if (total === 0) return [];

        const activities = [
            { name: 'Tasks', population: data.tasks, color: colors.tasks },
            { name: 'Events', population: data.events, color: colors.events },
            { name: 'Habits', population: data.habits, color: colors.habits },
        ].filter(item => item.population > 0);

        return activities.map((item, index) => ({
            ...item,
            percentage: total > 0 ? (item.population / total) * 100 : 0,
            gradientColor: gradientColors[index] || gradientColors[gradientColors.length - 1]
        }));
    }, [data, gradientColors]);

    // Animation effects
    useEffect(() => {
        if (chartData.length > 0) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.timing(progressAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: false,
                })
            ]).start();
        }
    }, [chartData.length, progressAnim, scaleAnim]);

    const getTopActivity = (): string => {
        if (!data) return '';
        const activities = [
            { name: 'Tasks', count: data.tasks },
            { name: 'Events', count: data.events },
            { name: 'Habits', count: data.habits }
        ].sort((a, b) => b.count - a.count);
        return activities[0]?.name || '';
    };

    const total = data ? data.tasks + data.events + data.habits : 0;

    const segments = chartData.map((item, index) => {
        const startAngle = chartData.slice(0, index).reduce((sum, prev) => sum + (prev.population / total) * 360, 0);
        const endAngle = startAngle + (item.population / total) * 360;
        return { ...item, startAngle, endAngle };
    });

    const renderDonutChart = () => {
        if (!total) return null;

        const centerX = 120;
        const centerY = 120;
        const radius = 90;
        const innerRadius = 55;

        return (
            <Animated.View style={{
                transform: [{ scale: scaleAnim }],
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Svg width={240} height={240} style={{ marginVertical: 20 }}>
                    <Defs>
                        {segments.map((segment, index) => (
                            <LinearGradient
                                key={index}
                                id={`gradient_${index}`}
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                            >
                                <Stop offset="0%" stopColor={segment.gradientColor.primary} />
                                <Stop offset="100%" stopColor={segment.gradientColor.secondary} />
                            </LinearGradient>
                        ))}
                        <LinearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <Stop offset="0%" stopColor="#F9FAFB" />
                            <Stop offset="100%" stopColor="#FFFFFF" />
                        </LinearGradient>
                    </Defs>

                    {segments.map((segment, index) => {
                        const startAngle = (segment.startAngle - 90) * Math.PI / 180;
                        const endAngle = (segment.endAngle - 90) * Math.PI / 180;

                        const x1 = centerX + radius * Math.cos(startAngle);
                        const y1 = centerY + radius * Math.sin(startAngle);
                        const x2 = centerX + radius * Math.cos(endAngle);
                        const y2 = centerY + radius * Math.sin(endAngle);

                        const x3 = centerX + innerRadius * Math.cos(endAngle);
                        const y3 = centerY + innerRadius * Math.sin(endAngle);
                        const x4 = centerX + innerRadius * Math.cos(startAngle);
                        const y4 = centerY + innerRadius * Math.sin(startAngle);

                        const largeArcFlag = segment.endAngle - segment.startAngle > 180 ? 1 : 0;

                        // Create proper donut segment path
                        const pathData = [
                            `M ${x1} ${y1}`,                                    // Move to outer start
                            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`, // Outer arc to end
                            `L ${x3} ${y3}`,                                    // Line to inner end
                            `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`, // Inner arc back to start
                            'Z'                                                 // Close path
                        ].join(' ');

                        return (
                            <G key={index}>
                                <Path
                                    d={pathData}
                                    fill={`url(#gradient_${index})`}
                                    stroke="white"
                                    strokeWidth={2}
                                />

                                {/* Highlight effect */}
                                <Path
                                    d={pathData}
                                    fill="rgba(255,255,255,0.1)"
                                />
                            </G>
                        );
                    })}

                    {/* Enhanced center circle with gradient */}
                    <Circle
                        cx={centerX}
                        cy={centerY}
                        r={innerRadius}
                        fill="url(#centerGradient)"
                        stroke={colors.border}
                        strokeWidth={1}
                    />

                    {/* Center text with better styling */}
                    <SvgText
                        x={centerX}
                        y={centerY - 8}
                        fontSize="20"
                        fontWeight="bold"
                        fill={colors.text}
                        textAnchor="middle"
                    >
                        {total}
                    </SvgText>
                    <SvgText
                        x={centerX}
                        y={centerY + 8}
                        fontSize="12"
                        fill={colors.secondary}
                        textAnchor="middle"
                        fontWeight="600"
                    >
                        Total
                    </SvgText>
                </Svg>
            </Animated.View>
        );
    };

    const renderLegend = () => (
        <View style={styles.legendContainer}>
            {chartData.map((item, index) => {
                const percentage = item.percentage.toFixed(1);
                return (
                    <View key={index} style={styles.legendItem}>
                        <View style={styles.legendIconContainer}>
                            <View
                                style={[
                                    styles.legendColor,
                                    {
                                        backgroundColor: item.gradientColor.primary,
                                        shadowColor: item.gradientColor.primary,
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 4,
                                        elevation: 3
                                    }
                                ]}
                            />
                        </View>
                        <View style={styles.legendTextContainer}>
                            <Text style={styles.legendText}>{item.name}</Text>
                            <Text style={styles.legendSubtext}>
                                {item.population} items ({percentage}%)
                            </Text>
                        </View>
                    </View>
                );
            })}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="pie-chart" size={24} color={colors.tasks} />
                    </View>
                    <View>
                        <Text style={styles.title}>Activity Breakdown</Text>
                        <Text style={styles.subtitle}>Visual distribution of your activities</Text>
                    </View>
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <ActivityIndicator size="large" color={colors.tasks} />
                    </Animated.View>
                    <Text style={styles.loadingText}>Loading your insights...</Text>
                </View>
            ) : data && chartData.length > 0 ? (
                <View style={styles.contentContainer}>
                    <View style={styles.chartSection}>{renderDonutChart()}</View>
                    {renderLegend()}

                    <View style={styles.summaryContainer}>
                        <View style={styles.summaryContent}>
                            <Ionicons name="trending-up" size={16} color={colors.secondary} />
                            <Text style={styles.summaryText}>
                                Most active: {getTopActivity()}
                            </Text>
                        </View>
                    </View>
                </View>
            ) : (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconContainer}>
                        <Ionicons name="analytics-outline" size={48} color={colors.secondary} />
                    </View>
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
        backgroundColor: colors.background,
        borderRadius: 20,
        marginBottom: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
        borderWidth: 1,
        borderColor: colors.border,
    },
    header: {
        padding: 24,
        backgroundColor: colors.light,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 13,
        color: colors.secondary,
        fontWeight: '500',
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    chartSection: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    legendContainer: {
        marginTop: 24,
        marginBottom: 20,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: colors.light,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    legendIconContainer: {
        marginRight: 12,
    },
    legendColor: {
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    legendTextContainer: {
        flex: 1,
    },
    legendText: {
        fontSize: 15,
        color: colors.text,
        fontWeight: '600',
        marginBottom: 2,
    },
    legendSubtext: {
        fontSize: 13,
        color: colors.secondary,
        fontWeight: '500',
    },
    summaryContainer: {
        backgroundColor: colors.light,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    summaryContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    summaryText: {
        fontSize: 14,
        color: colors.secondary,
        textAlign: 'center',
        fontWeight: '600',
        marginLeft: 8,
    },
    loadingContainer: {
        height: 280,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.light,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: colors.secondary,
        fontWeight: '500',
    },
    emptyContainer: {
        height: 280,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.light,
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        marginBottom: 16,
        opacity: 0.6,
    },
    emptyText: {
        color: colors.text,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtext: {
        color: colors.secondary,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        fontWeight: '500',
    },
});
