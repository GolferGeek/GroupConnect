import { supabase } from '../config/supabase';
import { User } from '@supabase/supabase-js';

export interface Group {
  id: string;
  name: string;
  photo_url?: string;
  created_at: string;
  visibility?: 'public' | 'private';
  join_method?: 'direct' | 'invitation';
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  recurrence?: string;
  location?: string;
  date: string;
  notes?: string;
  url?: string;
  group_id: string;
  created_at: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role_id: string;
  user_type_id: number;
  other_types?: number[];
  created_at?: string;
}

export interface PublicGroup {
  id: string;
  name: string;
  description?: string;
  visibility: 'public';
  join_method: 'direct' | 'invitation';
  created_at: string;
  member_count: number;
  activity_count: number;
  latest_activity?: {
    title: string;
    date: string;
  };
  profiles: { username: string }[];
}

export interface JoinRequest {
  id: string;
  group_id: string;
  user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  group: {
    name: string;
  };
  profiles: {
    username: string;
    email: string;
  };
}

// User operations
export const createUserProfile = async (userData: Omit<UserProfile, 'created_at'>) => {
  const { error } = await supabase
    .from('profiles')
    .insert([{
      ...userData,
      role_id: userData.role_id || 'member',  // default role
      user_type_id: userData.user_type_id,
      other_types: userData.other_types || []
    }]);
  if (error) throw error;
};

export const getDefaultUserTypeId = async (): Promise<number> => {
  const { data, error } = await supabase
    .from('user_types')
    .select('id')
    .limit(1)
    .single();

  if (error) throw error;
  return data.id;
};

export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId: string, updates: Partial<Omit<UserProfile, 'id' | 'created_at'>>) => {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  if (error) throw error;
};

export const getUserTypes = async () => {
  const { data, error } = await supabase
    .from('user_types')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data;
};

export const getUserRoles = async () => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data;
};

// Group operations
export const createGroup = async (
  name: string, 
  userId: string, 
  visibility: 'public' | 'private' = 'private',
  join_method: 'direct' | 'invitation' = 'invitation'
) => {
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert([{ 
      name, 
      ...(visibility && { visibility }),
      ...(join_method && { join_method })
    }])
    .select()
    .single();

  if (groupError) throw groupError;

  const { error: memberError } = await supabase
    .from('group_members')
    .insert([
      {
        group_id: group.id,
        user_id: userId,
        role: 'admin',
      },
    ]);

  if (memberError) throw memberError;
  return group;
};

export const getUserGroups = async (userId: string) => {
  const { data, error } = await supabase
    .from('groups')
    .select(`
      *,
      group_members!inner(user_id)
    `)
    .eq('group_members.user_id', userId);

  if (error) throw error;
  return data;
};

export const getPublicGroups = async (excludeUserId?: string, options?: {
  sortBy?: 'member_count' | 'activity_count' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  joinMethod?: 'direct' | 'invitation';
  hasRecentActivity?: boolean;
}) => {
  // First, get the basic group information
  let query = supabase
    .from('groups')
    .select(`
      *,
      group_members:group_members(count),
      latest_activity:activities(
        title,
        date
      )
    `)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false });

  if (excludeUserId) {
    // Get groups where the user is not a member
    const { data: memberGroups } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', excludeUserId);
    
    if (memberGroups && memberGroups.length > 0) {
      const memberGroupIds = memberGroups.map(mg => mg.group_id);
      query = query.not('id', 'in', `(${memberGroupIds.join(',')})`);
    }
  }

  if (options?.joinMethod) {
    query = query.eq('join_method', options.joinMethod);
  }

  const { data: groups, error } = await query;
  if (error) throw error;

  // Get activity counts using a count of distinct activities
  const activityCounts: { [key: string]: number } = {};
  if (groups && groups.length > 0) {
    const { data: activities, error: activityError } = await supabase
      .from('activities')
      .select('group_id')
      .in('group_id', groups.map(g => g.id));

    if (activityError) throw activityError;

    // Count activities per group
    activities?.forEach(activity => {
      activityCounts[activity.group_id] = (activityCounts[activity.group_id] || 0) + 1;
    });
  }

  // Combine the data
  const enrichedGroups = groups?.map(group => ({
    ...group,
    member_count: group.group_members[0]?.count || 0,
    activity_count: activityCounts[group.id] || 0,
    latest_activity: group.latest_activity?.[0],
  })) || [];

  // Apply sorting
  if (options?.sortBy) {
    enrichedGroups.sort((a, b) => {
      const aValue = a[options.sortBy!];
      const bValue = b[options.sortBy!];
      const multiplier = options.sortOrder === 'asc' ? 1 : -1;
      return (aValue - bValue) * multiplier;
    });
  }

  console.log('Enriched public groups:', enrichedGroups);
  return enrichedGroups;
};

export const updateGroupSettings = async (
  groupId: string, 
  settings: { 
    visibility?: 'public' | 'private';
    join_method?: 'direct' | 'invitation';
    name?: string;
  }
) => {
  const updatedSettings = { ...settings };
  if (!updatedSettings.visibility) {
    delete updatedSettings.visibility;
  }
  if (!updatedSettings.join_method) {
    delete updatedSettings.join_method;
  }

  const { error } = await supabase
    .from('groups')
    .update(updatedSettings)
    .eq('id', groupId);

  if (error) throw error;
};

export const requestToJoinGroup = async (groupId: string, userId: string) => {
  // Get group settings
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('visibility, join_method')
    .eq('id', groupId)
    .single();

  if (groupError) throw groupError;

  // Private groups always require invitation
  if (!group.visibility || group.visibility === 'private') {
    throw new Error('This group requires an invitation to join');
  }

  // For public groups, check join method (default to invitation if column doesn't exist)
  if (!group.join_method || group.join_method === 'invitation') {
    // Create join request
    const { error: requestError } = await supabase
      .from('group_join_requests')
      .insert([{
        group_id: groupId,
        user_id: userId,
        status: 'pending'
      }]);

    if (requestError) throw requestError;
    return { status: 'requested' };
  } else {
    // Direct join
    const { error } = await supabase
      .from('group_members')
      .insert([{
        group_id: groupId,
        user_id: userId,
        role: 'member'
      }]);

    if (error) throw error;
    return { status: 'joined' };
  }
};

// Add function to handle join requests
export const handleJoinRequest = async (
  requestId: string,
  action: 'accept' | 'reject',
  adminUserId: string
) => {
  const { data: request, error: requestError } = await supabase
    .from('group_join_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (requestError) throw requestError;

  // Verify admin permission
  const { data: adminCheck, error: adminError } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', request.group_id)
    .eq('user_id', adminUserId)
    .single();

  if (adminError) throw adminError;
  if (adminCheck.role !== 'admin') {
    throw new Error('Only group admins can handle join requests');
  }

  if (action === 'accept') {
    // Add user to group
    const { error: joinError } = await supabase
      .from('group_members')
      .insert([{
        group_id: request.group_id,
        user_id: request.user_id,
        role: 'member'
      }]);

    if (joinError) throw joinError;
  }

  // Update request status
  const { error: updateError } = await supabase
    .from('group_join_requests')
    .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
    .eq('id', requestId);

  if (updateError) throw updateError;
};

// Activity operations
export const createActivity = async (activity: Omit<Activity, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('activities')
    .insert([activity])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getGroupActivities = async (groupId: string) => {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('group_id', groupId)
    .order('date', { ascending: true });

  if (error) throw error;
  return data;
};

export const getUserJoinRequests = async (userId: string) => {
  const { data, error } = await supabase
    .from('group_join_requests')
    .select(`
      *,
      group:groups(name),
      profiles(username, email)
    `)
    .eq('user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getGroupJoinRequests = async (groupId: string) => {
  const { data, error } = await supabase
    .from('group_join_requests')
    .select(`
      *,
      profiles(username, email)
    `)
    .eq('group_id', groupId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}; 