# 📱 Push Notification System

A comprehensive push notification system for the Todo App that provides reminders for tasks, events, and habits.

## 🎯 Features

### ✅ Core Functionality
- **Task Reminders**: Notify users before task deadlines
- **Event Notifications**: Remind users of upcoming events
- **Habit Reminders**: Daily reminders for habit tracking
- **Permission Management**: Handles iOS and Android permission requests
- **Notification Channels**: Android-specific channels for different notification types
- **Custom Reminder Times**: Flexible reminder scheduling options

### 🏗️ System Architecture

#### 1. **NotificationService** (`src/services/NotificationService.ts`)
- Core notification management
- Permission handling
- Notification scheduling and cancellation
- Platform-specific configurations (iOS/Android)
- Utility functions for time calculations

#### 2. **NotificationContext** (`src/contexts/NotificationContext.tsx`)
- Global state management for notifications
- Context provider for easy access throughout the app
- Integration with Tasks, Events, and Habits contexts

#### 3. **Database Schema Updates** (`src/db/database.ts`)
- Added `reminder` field to tasks table
- Existing reminder support for events and habits
- Backward compatibility maintained

#### 4. **UI Components**
- **EnhancedReminderSelector**: Advanced reminder picker
- **NotificationPermission**: Permission request component
- **NotificationTest**: Testing and validation component

## 🔧 Implementation Details

### Permission Management
```typescript
// Request and check permissions
const hasPermission = await requestNotificationPermissions();
```

### Task Notifications
```typescript
// Schedule task reminder
await scheduleTaskNotification(
  taskId,
  taskTitle,
  taskDescription,
  deadline,
  { hours: 1 } // 1 hour before deadline
);
```

### Event Notifications
```typescript
// Schedule event reminder
await scheduleEventNotification(
  eventId,
  eventTitle,
  eventDescription,
  startTime,
  { minutes: 15 } // 15 minutes before start
);
```

### Habit Notifications
```typescript
// Schedule daily habit reminder
await scheduleHabitNotification(
  habitId,
  habitTitle,
  habitDescription,
  reminderTime,
  'daily' // frequency: daily, weekly, custom
);
```

## 📅 Default Reminder Options

### Tasks
- 1 hour before
- 2 hours before
- 1 day before
- Custom time
- No reminder

### Events
- 15 minutes before
- 30 minutes before
- 1 hour before
- 2 hours before
- Custom time
- No reminder

### Habits
- 9:00 AM daily
- 12:00 PM daily
- 6:00 PM daily
- 9:00 PM daily
- Custom time
- No reminder

## 🔔 Notification Channels (Android)

The system creates dedicated notification channels:
- **default**: General notifications
- **task-reminders**: Task deadline notifications
- **event-reminders**: Event notifications
- **habit-reminders**: Daily habit reminders

## 📱 Integration Guide

### 1. App Setup
- NotificationProvider wraps the entire app
- Automatic permission checking on app start

### 2. Task Integration
- Updated TasksContext to support reminders
- Automatic scheduling when tasks are created/updated
- Auto-cancellation when tasks are deleted

### 3. UI Integration
- Add reminder selector to any form
- Include notification permission component
- Test notifications in settings

## 🧪 Testing

### Test Component
Access the notification test in Settings:
- Test task notifications
- Test event notifications
- Test habit notifications
- Clear all scheduled notifications
- Permission management testing

### Manual Testing
1. Enable notifications in app settings
2. Create tasks with reminders
3. Create events with notifications
4. Set up habit reminders
5. Verify notifications appear at scheduled times

## 🚀 Usage Examples

### Adding to Existing Forms
```tsx
import { EnhancedReminderSelector } from '@/components/common/EnhancedReminderSelector';
import { useNotifications } from '@/contexts/NotificationContext';

function MyForm() {
  const { hasPermission } = useNotifications();
  const [reminderTime, setReminderTime] = useState<string | null>(null);

  return (
    <>
      {/* Your form fields */}
      
      <EnhancedReminderSelector
        type="task" // or "event" or "habit"
        value={reminderTime}
        onChange={setReminderTime}
        mainTime={deadline} // For tasks/events
        disabled={!hasPermission}
      />
    </>
  );
}
```

### Requesting Permissions
```tsx
import { NotificationPermission } from '@/components/common/NotificationPermission';

function MyScreen() {
  return (
    <>
      <NotificationPermission 
        showFullScreen={true}
        onPermissionGranted={() => console.log('Permission granted')}
        onPermissionDenied={() => console.log('Permission denied')}
      />
      {/* Rest of your screen */}
    </>
  );
}
```

## 🔒 Security & Privacy

- All notifications are stored locally on the device
- No external services required
- User can disable notifications at any time
- Permission requests are user-driven
- No tracking or analytics

## 📊 Performance

- Minimal battery impact
- Efficient notification scheduling
- Automatic cleanup of expired notifications
- Memory-efficient context management

## 🔄 Future Enhancements

Potential improvements:
- Notification snoozing
- Recurring notifications
- Custom notification sounds
- Notification grouping
- Smart notification timing based on user behavior

## 🐛 Troubleshooting

### Common Issues
1. **Notifications not appearing**: Check device settings and app permissions
2. **Permission denied**: Guide user to enable in system settings
3. **Scheduled notifications not working**: Verify time is in the future
4. **Android notifications not showing**: Check notification channel settings

### Debug Tools
- Use the NotificationTest component in settings
- Check console logs for error messages
- Verify permission status in app settings
- Test individual notification types separately

## 📝 Maintenance

- Regularly test notification functionality
- Monitor for iOS/Android API changes
- Update permission handling for new OS versions
- Clean up unused notification identifiers