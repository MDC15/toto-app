import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

export default function ActivityBreakdownChart() {
    const data = [
        { name: 'Tasks', population: 70, color: '#FFA500', legendFontColor: '#777', legendFontSize: 12 },
        { name: 'Events', population: 20, color: '#FF6347', legendFontColor: '#777', legendFontSize: 12 },
        { name: 'Habits', population: 10, color: '#E74C3C', legendFontColor: '#777', legendFontSize: 12 },
    ];
    const chartConfig = {
        backgroundColor: 'transparent',
        backgroundGradientFrom: 'transparent',
        backgroundGradientTo: 'transparent',
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        strokeWidth: 2,
    };

    console.log('ActivityBreakdownChart data:', data);
    console.log('Data validity:', data.map(item => ({ name: item.name, hasColor: !!item.color, color: item.color })));

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Activity Breakdown</Text>
            <PieChart
                data={data}
                width={Dimensions.get('window').width - 32}
                height={220}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="10"
                absolute
                chartConfig={chartConfig}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
});
