import { MaterialCommunityIcons } from '@expo/vector-icons';

export enum TaskTypes {
    TASK = 'task',
    EVENT = 'event',
}


export interface TaskItem {
    id: number;
    title: string;
    description?: string;
    due?: string;      // cho task
    timeRange?: string; // cho event
    date?: string;     // cho event
    icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
}
