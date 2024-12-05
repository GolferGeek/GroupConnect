import { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonText,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonBadge,
  IonFab,
  IonFabButton,
  useIonToast,
  useIonActionSheet,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonModal,
  IonSearchbar,
  IonNote,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
} from '@ionic/react';
import {
  peopleOutline,
  calendarOutline,
  settingsOutline,
  addOutline,
  personAddOutline,
  timeOutline,
  ellipsisHorizontal,
  locationOutline,
  linkOutline,
  createOutline,
  trashOutline,
  closeOutline,
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { getUserProfile, UserProfile } from '../services/database';
import AppHeader from '../components/AppHeader';
import MarkdownViewer from '../components/MarkdownViewer';
import MarkdownEditor from '../components/MarkdownEditor';
import CreateGroup from './CreateGroup';

interface GroupMemberDetails extends UserProfile {
  role: 'admin' | 'member';
  role_id: number;
  user_type_id: number;
}

interface GroupDetails {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  member_count: number;
  activity_count: number;
}

interface MemberData {
  role: 'admin' | 'member';
  profiles: {
    id: string;
    email: string;
    username: string;
    created_at: string;
    role_id: number;
    user_type_id: number;
  };
}

interface Activity {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  url?: string;
  notes?: string;
}

const GroupDetails: React.FC = () => {
  const { id: groupId } = useParams<{ id: string }>();
  const history = useHistory();
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [members, setMembers] = useState<GroupMemberDetails[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'members' | 'activities'>('details');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [present] = useIonToast();
  const [presentActionSheet] = useIonActionSheet();
  const [isEditing, setIsEditing] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (groupId === 'new') {
      setLoading(false);
      return;
    }
    loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
    if (!groupId || groupId === 'new') return;

    try {
      // First get members to get accurate count
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select(`
          role,
          profiles:profiles(
            id,
            email,
            username,
            created_at,
            role_id,
            user_type_id
          )
        `)
        .eq('group_id', groupId);

      if (membersError) throw membersError;
      
      const formattedMembers = (membersData as unknown as MemberData[]).map(member => ({
        ...member.profiles,
        role: member.role,
        role_id: member.profiles.role_id,
        user_type_id: member.profiles.user_type_id
      }));

      setMembers(formattedMembers);

      // Load group details and activity count
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('id, name, description, created_at, activities(count)')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;
      
      setGroupDetails({
        ...groupData,
        description: groupData.description || '',
        member_count: formattedMembers.length,
        activity_count: groupData.activities?.[0]?.count || 0
      });

    } catch (error: any) {
      console.error('Error loading group data:', error);
      present({
        message: error.message || 'Failed to load group data',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
      history.push('/groups');
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    if (!groupId || groupId === 'new') return;
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('group_id', groupId)
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true });

      if (error) throw error;
      setActivities(data || []);
    } catch (error: any) {
      present({
        message: error.message || 'Failed to load activities',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    }
  };

  useEffect(() => {
    if (activeTab === 'activities') {
      loadActivities();
    }
  }, [activeTab, groupId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUserAdmin = members.find(m => m.id === user?.id)?.role === 'admin';

  const handleSaveDescription = async (newDescription: string) => {
    if (!groupId || !groupDetails) {
      present({
        message: 'Group information is missing',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('groups')
        .update({ description: newDescription })
        .eq('id', groupId)
        .select()
        .single();

      if (error) throw error;
      
      setGroupDetails(prev => prev ? { ...prev, description: newDescription } : null);
      setIsEditing(false);
      
      present({
        message: 'Description updated successfully',
        duration: 2000,
        position: 'top',
        color: 'success'
      });
    } catch (error: any) {
      present({
        message: error.message || 'Failed to update description',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupId) return;

    try {
      // First delete all group members
      const { error: membersError } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId);

      if (membersError) throw membersError;

      // Then delete all activities
      const { error: activitiesError } = await supabase
        .from('activities')
        .delete()
        .eq('group_id', groupId);

      if (activitiesError) throw activitiesError;

      // Finally delete the group
      const { error: groupError } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (groupError) throw groupError;

      present({
        message: 'Group deleted successfully',
        duration: 2000,
        position: 'top',
        color: 'success'
      });

      history.replace('/groups');
    } catch (error: any) {
      present({
        message: error.message || 'Failed to delete group',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    }
  };

  const updateMemberRole = async (memberId: string, newRole: 'admin' | 'member') => {
    try {
      const { error } = await supabase
        .from('group_members')
        .update({ role: newRole })
        .eq('group_id', groupId)
        .eq('user_id', memberId);

      if (error) throw error;
      setMembers(members.map(m => 
        m.id === memberId ? { ...m, role: newRole } : m
      ));
      
      present({
        message: 'Role updated successfully',
        duration: 2000,
        position: 'top',
        color: 'success'
      });
    } catch (error: any) {
      present({
        message: error.message || 'Failed to update role',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', memberId);

      if (error) throw error;
      setMembers(members.filter(m => m.id !== memberId));
      
      present({
        message: 'Member removed successfully',
        duration: 2000,
        position: 'top',
        color: 'success'
      });
    } catch (error: any) {
      present({
        message: error.message || 'Failed to remove member',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    }
  };

  const searchUsers = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
        .not('id', 'eq', user?.id)
        .not('id', 'in', `(${members.map(m => m.id).join(',')})`)
        .limit(5);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error: any) {
      present({
        message: error.message || 'Failed to search users',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    }
  };

  const addMember = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .insert([{
          group_id: groupId,
          user_id: userId,
          role: 'member'
        }]);

      if (error) throw error;

      loadGroupData();
      handleCloseModal();

      present({
        message: 'Member added successfully',
        duration: 2000,
        position: 'top',
        color: 'success'
      });
    } catch (error: any) {
      present({
        message: error.message || 'Failed to add member',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    }
  };

  const handleCloseModal = () => {
    setShowAddMemberModal(false);
    setSearchTerm('');
    setSearchResults([]);
  };

  if (groupId === 'new') {
    return <CreateGroup />;
  }

  if (loading) {
    return (
      <IonPage>
        <AppHeader title="Group" showBackButton />
        <IonContent>
          <div className="ion-text-center ion-padding">
            <IonSpinner />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <AppHeader title={groupDetails?.name || 'Group'} showBackButton />
      <IonContent>
        {/* Rest of the component */}
      </IonContent>
    </IonPage>
  );
};

export default GroupDetails; 