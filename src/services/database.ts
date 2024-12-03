import { supabase } from '../config/supabase';
import { User } from '@supabase/supabase-js';

export interface Group {
  id: string;
  name: string;
  photo_url?: string;
  created_at: string;
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

// User operations
export const createUserProfile = async (user: User) => {
  const { error } = await supabase
    .from('profiles')
    .insert([
      {
        id: user.id,
        email: user.email,
        username: user.email?.split('@')[0],
      },
    ]);
  if (error) throw error;
};

// Group operations
export const createGroup = async (name: string, userId: string) => {
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert([{ name }])
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