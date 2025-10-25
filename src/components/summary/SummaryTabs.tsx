
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const tabs = ['Daily', 'Weekly', 'Monthly'] as const;
type TabType = (typeof tabs)[number];

export default function SummaryTabs() {
    const [selected, setSelected] = useState<TabType>('Weekly');

    return (
        <View style={styles.container}>
            {tabs.map((tab) => (
                <TouchableOpacity
                    key={tab}
                    style={[styles.tab, selected === tab && styles.activeTab]}
                    onPress={() => setSelected(tab)}
                >
                    <Text style={[styles.text, selected === tab && styles.activeText]}>{tab}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: '#f1f1f1',
        borderRadius: 12,
        marginBottom: 16,
        padding: 4,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: '#FFD580',
    },
    text: {
        fontWeight: '600',
        color: '#555',
    },
    activeText: {
        color: '#000',
    },
});
