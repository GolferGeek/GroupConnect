import { supabase } from '../config/supabase';
// User operations
export const createUserProfile = async (user) => {
    const { error } = await supabase
        .from('profiles')
        .insert([
        {
            id: user.id,
            email: user.email,
            username: user.email?.split('@')[0],
        },
    ]);
    if (error)
        throw error;
};
export const getUserProfile = async (userId) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    if (error)
        throw error;
    return data;
};
// Group operations
export const createGroup = async (name, userId) => {
    const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert([{ name }])
        .select()
        .single();
    if (groupError)
        throw groupError;
    const { error: memberError } = await supabase
        .from('group_members')
        .insert([
        {
            group_id: group.id,
            user_id: userId,
            role: 'admin',
        },
    ]);
    if (memberError)
        throw memberError;
    return group;
};
export const getUserGroups = async (userId) => {
    const { data, error } = await supabase
        .from('groups')
        .select(`
      *,
      group_members!inner(user_id)
    `)
        .eq('group_members.user_id', userId);
    if (error)
        throw error;
    return data;
};
// Activity operations
export const createActivity = async (activity) => {
    const { data, error } = await supabase
        .from('activities')
        .insert([activity])
        .select()
        .single();
    if (error)
        throw error;
    return data;
};
export const getGroupActivities = async (groupId) => {
    const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('group_id', groupId)
        .order('date', { ascending: true });
    if (error)
        throw error;
    return data;
};
