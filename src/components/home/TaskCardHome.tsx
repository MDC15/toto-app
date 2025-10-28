import React from 'react';
import GradientCard from './GradientCard';
import { TaskItem } from './types';

interface TaskCardHomeProps {
    item: TaskItem;
    colors?: readonly [string, string];
    style?: any;
}

export default function TaskCardHome({ item, colors, style }: TaskCardHomeProps) {
    return (
        <GradientCard
            title={item.title}
            subtitle1={item.description}
            subtitle2={item.due}
            colors={colors}
            style={style}
        />
    );
}