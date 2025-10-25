import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export default function TasksOverviewChart() {
    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                data: [180, 100, 240, 160, 190, 200],
                color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`,
            },
        ],
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Monthly Tasks Overview</Text>
            <LineChart
                data={data}
                width={Dimensions.get('window').width - 32}
                height={200}
                yAxisLabel=""
                chartConfig={{
                    backgroundColor: '#fff',
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`,
                    labelColor: () => '#777',
                }}
                bezier
                style={styles.chart}
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
    chart: {
        borderRadius: 16,
    },
});
