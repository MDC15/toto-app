import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Rect, Text as SvgText } from 'react-native-svg';

interface ChartProps {
  data: {
    label: string;
    value: number;
  }[];
  title: string;
}

export default function TaskCompletionChart({ data, title }: ChartProps) {
  const barWidth = 30;
  const chartWidth = data.length * (barWidth + 10);
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Svg width={chartWidth} height={200}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 150;
          return (
            <React.Fragment key={index}>
              <Rect
                x={index * (barWidth + 10)}
                y={200 - barHeight}
                width={barWidth}
                height={barHeight}
                fill="#f97316"
              />
              <SvgText
                x={index * (barWidth + 10) + barWidth / 2}
                y={195 - barHeight}
                fill="#000"
                fontSize="12"
                textAnchor="middle"
              >
                {item.value}
              </SvgText>
              <SvgText
                x={index * (barWidth + 10) + barWidth / 2}
                y={215}
                fill="#000"
                fontSize="12"
                textAnchor="middle"
              >
                {item.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
