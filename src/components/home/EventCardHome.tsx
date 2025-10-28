import React from 'react';
import GradientCard from './GradientCard';
import { TaskItem } from './types';

interface EventCardHomeProps {
    item: TaskItem;
    colors?: readonly [string, string];
    style?: any;
}

export default function EventCardHome({ item, colors, style }: EventCardHomeProps) {
    return (
        <GradientCard
            title={item.title}
            subtitle1={item.timeRange}
            subtitle2={item.date}
            colors={colors}
            style={style}
        />
    );
}