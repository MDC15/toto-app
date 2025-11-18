import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useCake } from '../../contexts/CakeContext';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';

interface AchievementsViewProps {
    showUnlockedOnly?: boolean;
    onAchievementPress?: (achievementId: string) => void;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({
    showUnlockedOnly = false,
    onAchievementPress
}) => {
    const { getAchievements, getUnlockedAchievements } = useCake();

    const achievements = showUnlockedOnly ? getUnlockedAchievements() : getAchievements();
    const unlockedCount = getUnlockedAchievements().length;
    const totalCount = getAchievements().length;

    const renderAchievement = (achievement: any) => {
        const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;
        const isUnlocked = achievement.isUnlocked;

        return (
            <TouchableOpacity
                key={achievement.id}
                style={[
                    styles.achievementCard,
                    isUnlocked && styles.achievementCardUnlocked
                ]}
                onPress={() => onAchievementPress?.(achievement.id)}
                activeOpacity={0.7}
            >
                {/* Icon and Status */}
                <View style={styles.achievementHeader}>
                    <View style={[
                        styles.achievementIcon,
                        { backgroundColor: isUnlocked ? achievement.color : '#E0E0E0' }
                    ]}>
                        <Text style={[
                            styles.achievementIconText,
                            { color: isUnlocked ? 'white' : '#999' }
                        ]}>
                            {achievement.icon}
                        </Text>
                    </View>

                    {isUnlocked && (
                        <View style={styles.unlockedBadge}>
                            <Text style={styles.unlockedText}>✓</Text>
                        </View>
                    )}
                </View>

                {/* Content */}
                <View style={styles.achievementContent}>
                    <ThemedText style={[
                        styles.achievementName,
                        !isUnlocked && styles.achievementNameLocked
                    ]}>
                        {achievement.name}
                    </ThemedText>

                    <ThemedText style={[
                        styles.achievementDescription,
                        !isUnlocked && styles.achievementDescriptionLocked
                    ]}>
                        {achievement.description}
                    </ThemedText>

                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${Math.min(progressPercentage, 100)}%`,
                                        backgroundColor: isUnlocked ? achievement.color : '#E0E0E0'
                                    }
                                ]}
                            />
                        </View>
                        <ThemedText style={[
                            styles.progressText,
                            !isUnlocked && styles.progressTextLocked
                        ]}>
                            {achievement.progress} / {achievement.maxProgress}
                        </ThemedText>
                    </View>

                    {/* Reward */}
                    {achievement.reward && (
                        <View style={styles.rewardContainer}>
                            <Text style={styles.rewardIcon}>🎁</Text>
                            <ThemedText style={styles.rewardText}>
                                Reward: {achievement.reward.type === 'unlock_cake' ? 'Unlock Cake' :
                                    achievement.reward.type === 'special_title' ? 'Special Title' :
                                        'Extra Features'}
                            </ThemedText>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <ThemedText style={styles.title}>Achievements</ThemedText>
                    <ThemedText style={styles.subtitle}>
                        {unlockedCount} of {totalCount} unlocked
                    </ThemedText>
                </View>
                <View style={styles.progressCircle}>
                    <Text style={styles.progressCircleText}>
                        {Math.round((unlockedCount / totalCount) * 100)}%
                    </Text>
                </View>
            </View>

            {/* Progress Overview */}
            <View style={styles.overview}>
                <View style={styles.statItem}>
                    <Text style={styles.statIcon}>🏆</Text>
                    <View>
                        <ThemedText style={styles.statValue}>{unlockedCount}</ThemedText>
                        <ThemedText style={styles.statLabel}>Unlocked</ThemedText>
                    </View>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statIcon}>🎯</Text>
                    <View>
                        <ThemedText style={styles.statValue}>{totalCount - unlockedCount}</ThemedText>
                        <ThemedText style={styles.statLabel}>Remaining</ThemedText>
                    </View>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statIcon}>⭐</Text>
                    <View>
                        <ThemedText style={styles.statValue}>
                            {getUnlockedAchievements().filter(a => a.reward?.type === 'special_title').length}
                        </ThemedText>
                        <ThemedText style={styles.statLabel}>Titles</ThemedText>
                    </View>
                </View>
            </View>

            {/* Achievements List */}
            <ScrollView
                style={styles.achievementsList}
                showsVerticalScrollIndicator={false}
            >
                {achievements.length > 0 ? (
                    achievements.map(renderAchievement)
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>🎯</Text>
                        <ThemedText style={styles.emptyTitle}>
                            {showUnlockedOnly ? 'No achievements unlocked yet' : 'No achievements available'}
                        </ThemedText>
                        <ThemedText style={styles.emptyMessage}>
                            {showUnlockedOnly
                                ? 'Keep baking to unlock your first achievement!'
                                : 'Complete baking challenges to earn achievements.'
                            }
                        </ThemedText>
                    </View>
                )}
            </ScrollView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
        opacity: 0.6,
        marginTop: 2,
    },
    progressCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressCircleText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    overview: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        borderRadius: 12,
        paddingVertical: 16,
        marginBottom: 16,
    },
    statItem: {
        alignItems: 'center',
    },
    statIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
        opacity: 0.6,
    },
    achievementsList: {
        flex: 1,
    },
    achievementCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    achievementCardUnlocked: {
        backgroundColor: 'rgba(0, 255, 0, 0.1)',
        borderWidth: 2,
        borderColor: '#4CAF50',
    },
    achievementHeader: {
        position: 'relative',
        marginRight: 16,
    },
    achievementIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    achievementIconText: {
        fontSize: 24,
    },
    unlockedBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
    },
    unlockedText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    achievementContent: {
        flex: 1,
    },
    achievementName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    achievementNameLocked: {
        opacity: 0.5,
    },
    achievementDescription: {
        fontSize: 14,
        opacity: 0.8,
        marginBottom: 12,
        lineHeight: 18,
    },
    achievementDescriptionLocked: {
        opacity: 0.4,
    },
    progressContainer: {
        marginBottom: 8,
    },
    progressBar: {
        height: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 4,
        marginBottom: 6,
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        opacity: 0.6,
    },
    progressTextLocked: {
        opacity: 0.4,
    },
    rewardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rewardIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    rewardText: {
        fontSize: 12,
        opacity: 0.7,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 64,
        paddingHorizontal: 32,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyMessage: {
        fontSize: 14,
        opacity: 0.6,
        textAlign: 'center',
        lineHeight: 20,
    },
});
