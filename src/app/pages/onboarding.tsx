import { LastOnboardingPage } from "@/components/onboarding/LastOnboardingPage";
import { OnboardingButton } from "@/components/onboarding/OnboardingButton";
import { OnboardingPage } from "@/components/onboarding/OnboardingPag";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import PagerView from "react-native-pager-view";

const pages = [
    {
        id: "1",
        image: require("../../../assets/images/onboarding/plan.png"),
        titleBold: "Plan easily",
        title: "Achieve more",
        subtitle: "Manage your tasks, events, and habits\nall in one place.",
        backgroundColor: "#fefefe",
    },
    {
        id: "2",
        image: require("../../../assets/images/onboarding/tasks.png"),
        titleBold: "Stay on top of",
        title: "your daily tasks",
        subtitle: "Create tasks, set priorities, and\nget timely reminders.",
        backgroundColor: "#fefefe",
    },
    {
        id: "3",
        image: require("../../../assets/images/onboarding/schedule.png"),
        titleBold: "Keep your",
        title: "schedule organized",
        subtitle: "Organize events and important\ndates easily.",
        backgroundColor: "#fefefe",
    },
    {
        id: "4",
        image: require("../../../assets/images/onboarding/habits.png"),
        titleBold: "Build better habits",
        title: "one day at a time",
        subtitle: "Check in daily to maintain\nyour streak.",
        backgroundColor: "#fefefe",
    },
    {
        id: "5",
        backgroundColor: "#fefefe",
    },
];

export default function OnboardingScreen() {
    const pagerRef = useRef<PagerView>(null);
    const [currentPage, setCurrentPage] = useState(0);

    const scrollOffset = useRef(new Animated.Value(0)).current;
    const position = useRef(new Animated.Value(0)).current;

    const onPageScroll = useCallback((event: any) => {
        scrollOffset.setValue(event.nativeEvent.offset);
        position.setValue(event.nativeEvent.position);
    }, [position, scrollOffset]);

    const onPageSelected = useCallback((event: any) => {
        setCurrentPage(event.nativeEvent.position);
    }, []);

    const handleNext = () => {
        if (currentPage < pages.length - 1) {
            pagerRef.current?.setPage(currentPage + 1);
        } else {
            router.replace("/pages/permission");
        }
    };

    const handleSkip = () => {
        router.replace("/pages/permission");
    };

    const isLastPage = currentPage === pages.length - 1;
    const showSkipButton = currentPage > 0 && currentPage < pages.length - 1;

    return (
        <View style={[styles.container, { backgroundColor: pages[currentPage].backgroundColor }]}>
            <PagerView
                ref={pagerRef}
                style={styles.pagerView}
                initialPage={0}
                onPageScroll={onPageScroll}
                onPageSelected={onPageSelected}
            >
                {pages.map((page, index) => (
                    <View key={page.id}>
                        {index === pages.length - 1 ? (
                            <LastOnboardingPage />
                        ) : (
                            <OnboardingPage
                                page={page}
                                index={index}
                                scrollOffset={scrollOffset}
                                position={position}
                            />
                        )}
                    </View>
                ))}
            </PagerView>

            {/* Pagination dots */}
            <View style={styles.dotsWrapper}>
                {pages.map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.dot,
                            i === currentPage && styles.dotActive,
                        ]}
                    />
                ))}
            </View>

            {/* Buttons */}
            <View style={[styles.buttonContainer, isLastPage && styles.centerButton, !showSkipButton && !isLastPage && styles.rightAlignButton]}>
                {showSkipButton && (
                    <OnboardingButton
                        onPress={handleSkip}
                        title="Skip"
                        variant="text"
                    />
                )}

                <OnboardingButton
                    onPress={handleNext}
                    title={isLastPage ? "Get Started" : "Next"}
                    variant="primary"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    pagerView: { flex: 1 },

    dotsWrapper: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        gap: 8,
    },

    dot: {
        width: 8,
        height: 8,
        marginBlock: 24,
        borderRadius: 4,
        backgroundColor: "#ddd",
    },
    dotActive: {
        width: 20,
        backgroundColor: "#ff9800",
    },

    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 30,
        paddingBottom: 40,
    },
    centerButton: {
        justifyContent: "center",
    },
    rightAlignButton: {
        justifyContent: "flex-end",
    },
});
