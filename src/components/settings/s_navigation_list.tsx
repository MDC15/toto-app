import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import NavigationItem from "./s_navigation_item";

interface NavigationListProps {
    onItemPress: (key: string) => void;
}

export default function NavigationList({ onItemPress }: NavigationListProps) {

    return (
        <View style={styles.container}>
            <NavigationItem
                icon="information-circle"
                title="About App"
                subtitle="Learn more about TodoList App"
                onPress={() => onItemPress('about')}
            />
            <NavigationItem
                icon="star"
                title="Premium Features"
                subtitle="Unlock advanced features"
                onPress={() => router.push('/premium' as any)}
            />
            <NavigationItem
                icon="document-text"
                title="Terms of Service"
                subtitle="Read our terms and conditions"
                onPress={() => onItemPress('terms')}
            />
            <NavigationItem
                icon="shield-checkmark"
                title="Privacy Policy"
                subtitle="Learn how we protect your data"
                onPress={() => onItemPress('privacy')}
            />
            <NavigationItem
                icon="star-half"
                title="Rate App"
                subtitle="Rate us on the app store"
                onPress={() => onItemPress('rate')}
            />
            <NavigationItem
                icon="help-circle"
                title="Help & Support"
                subtitle="Get help and contact support"
                onPress={() => onItemPress('help')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
});