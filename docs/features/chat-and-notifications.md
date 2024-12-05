# Chat and Notification System Design

## Overview
This document outlines the design for implementing chat functionality and a comprehensive notification system for groups and activities.

## Features

### 1. Chat System
#### Group Chat
- Real-time chat functionality for group members
- Message persistence
- Message types (text, links, etc.)
- Chat history per member
- Unread message tracking

#### Activity Chat
- Event-specific chat channels
- Pre and post-event discussions
- RSVP and attendance discussions
- Activity updates and changes

### 2. Change Tracking
#### Group Changes
- Membership changes
- Group settings/details updates
- New activities created
- Changes to existing activities
- Sub-group creation/modification

#### Activity Changes
- Date/time modifications
- Location updates
- Participant list changes
- Description or details updates
- Status changes (scheduled, cancelled, etc.)

### 3. User Notification Preferences
#### Profile Settings
- Notification level preferences:
  - All changes
  - Important changes only
  - Minimal (critical updates only)
  - Custom settings
- Per-group notification settings
- Per-activity notification settings
- Notification methods:
  - In-app notifications
  - Email notifications
  - Push notifications (future)

#### Change Categories
- Administrative changes
- Membership changes
- Chat messages
- Activity updates
- RSVP/Attendance changes
- General announcements

## Database Schema Changes

### Chat Messages Table
```sql
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES groups(id),
    activity_id UUID REFERENCES activities(id),
    user_id UUID REFERENCES auth.users(id),
    message TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_edited BOOLEAN DEFAULT FALSE,
    parent_message_id UUID REFERENCES chat_messages(id)
);
```

### Message Read Status Table
```sql
CREATE TABLE message_read_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES chat_messages(id),
    user_id UUID REFERENCES auth.users(id),
    read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);
```

### Change History Table
```sql
CREATE TABLE change_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL, -- 'group' or 'activity'
    entity_id UUID NOT NULL,
    change_type VARCHAR(50) NOT NULL,
    change_data JSONB NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### User Notification Preferences Table
```sql
CREATE TABLE user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    entity_type VARCHAR(50), -- NULL for global settings
    entity_id UUID, -- NULL for global settings
    notification_level VARCHAR(50) NOT NULL,
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, entity_type, entity_id)
);
```

## Implementation Phases

### Phase 1: Foundation
1. Database schema implementation
2. Basic chat functionality
3. Message persistence and retrieval
4. User notification preferences UI

### Phase 2: Change Tracking
1. Group change tracking
2. Activity change tracking
3. Change history UI
4. Change notification system

### Phase 3: Enhanced Chat
1. Real-time chat updates
2. Message read status
3. Chat history per member
4. Message types and formatting

### Phase 4: Notification System
1. In-app notifications
2. Email notification system
3. Notification preferences management
4. Per-entity notification settings

### Phase 5: Optimization
1. Performance improvements
2. Message pagination
3. Notification batching
4. Real-time sync optimization

## Technical Considerations

### Real-time Updates
- Use Supabase real-time subscriptions for chat
- Implement efficient message delivery
- Handle offline/online state

### Data Management
- Message pagination and lazy loading
- Efficient change tracking
- Notification aggregation
- Data retention policies

### Security
- Message access control
- User permission validation
- Rate limiting
- Content moderation capabilities

### Performance
- Message caching
- Notification batching
- Database indexing
- Query optimization

## Next Steps
1. Review and finalize database schema
2. Create detailed UI mockups
3. Implement foundation phase
4. Set up testing environment
5. Begin incremental feature implementation 