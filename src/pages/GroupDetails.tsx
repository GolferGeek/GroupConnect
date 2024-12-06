import React, { useState, useEffect } from 'react';
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
  IonChip,
  IonSelect,
  IonSelectOption,
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
  globeOutline,
  lockClosedOutline,
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
  description: string;
  member_count: number;
  activity_count: number;
  visibility: 'public' | 'private';
  join_method: 'direct' | 'invitation';
  group_type_id?: string;
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

interface GroupType {
  id: string;
  group_type: string;
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
  const [groupType, setGroupType] = useState<GroupType | null>(null);
  const [groupTypes, setGroupTypes] = useState<GroupType[]>([]);
  const [editingSettings, setEditingSettings] = useState(false);

  useEffect(() => {
    if (groupId === 'new') {
      setLoading(false);
      return;
    }
    loadGroupData();
  }, [groupId]);

  useEffect(() => {
    loadGroupTypes();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'activities' || tab === 'members' || tab === 'details') {
      setActiveTab(tab);
    }
  }, []);

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

      // Load group details, activity count, and group type
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select(`
          id, 
          name, 
          description, 
          created_at, 
          activities(count),
          visibility,
          join_method,
          group_type_id,
          group_type:group_types(*)
        `)
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;
      
      setGroupDetails({
        ...groupData,
        description: groupData.description || '',
        member_count: formattedMembers.length,
        activity_count: groupData.activities?.[0]?.count || 0,
        visibility: groupData.visibility || 'private',
        join_method: groupData.join_method || 'direct',
        group_type_id: groupData.group_type_id
      });

      // Handle group type data
      if (groupData.group_type && Array.isArray(groupData.group_type) && groupData.group_type.length > 0) {
        const [typeData] = groupData.group_type;  // Destructure the first item from the array
        console.log('Group type data:', typeData);
        setGroupType({
          id: typeData?.id || '',
          group_type: typeData?.group_type || ''
        });
      } else {
        console.log('No group type data found:', groupData.group_type);
      }

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
    console.log('Loading activities for group:', groupId);
    console.log('Current date:', new Date().toISOString());
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('group_id', groupId)
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true });

      console.log('Activities query result:', { 
        data, 
        error,
        queryDetails: {
          groupId,
          filterDate: new Date().toISOString(),
          resultCount: data?.length || 0
        }
      });
      
      if (error) throw error;
      setActivities(data || []);
      console.log('Activities state updated:', data?.length || 0, 'activities');
    } catch (error: any) {
      console.error('Error loading activities:', error);
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
    try {
      // Parse the ISO date string and adjust for local timezone
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Invalid date string:', dateString);
        return 'Invalid date';
      }

      // Create UTC date to match the stored value
      const utcDate = new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes()
      );

      return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'  // Use UTC to match stored value
      }).format(utcDate);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const isUserAdmin = members.find(m => m.id === user?.id)?.role === 'admin';

  const handleSaveDescription = async (newDescription: string) => {
    if (!groupId || !groupDetails) return;

    try {
      const { data, error } = await supabase
        .from('groups')
        .update({ description: newDescription })
        .eq('id', groupId)
        .select()
        .single();

      if (error) throw error;

      setGroupDetails(prev => {
        if (!prev) return null;
        return {
          ...prev,
          description: newDescription
        };
      });
      setIsEditing(false);
      
      present({
        message: 'Description updated successfully',
        duration: 2000,
        position: 'top',
        color: 'success'
      });
    } catch (error: any) {
      console.error('Failed to update description:', error);
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

      // Update local state
      setMembers(members.map(member => 
        member.id === memberId ? { ...member, role: newRole } : member
      ));

      present({
        message: `Member role updated to ${newRole}`,
        duration: 2000,
        position: 'top',
        color: 'success'
      });
    } catch (error: any) {
      present({
        message: error.message || 'Failed to update member role',
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

  const loadGroupTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('group_types')
        .select('id, group_type')
        .order('group_type');

      if (error) throw error;
      setGroupTypes(data || []);
    } catch (error: any) {
      console.error('Error loading group types:', error);
    }
  };

  const updateGroupSettings = async (settings: Partial<GroupDetails>) => {
    if (!groupId || !groupDetails) return;

    try {
      console.log('Updating settings:', settings);
      const { error } = await supabase
        .from('groups')
        .update(settings)
        .eq('id', groupId);

      if (error) throw error;

      // Update local state
      setGroupDetails(prev => {
        if (!prev) return null;
        return { ...prev, ...settings };
      });

      present({
        message: 'Group settings updated successfully',
        duration: 2000,
        position: 'top',
        color: 'success'
      });
    } catch (error: any) {
      console.error('Failed to update settings:', error);
      present({
        message: error.message || 'Failed to update group settings',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    }
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
      <AppHeader title="Group" showBackButton />
      <IonContent>
        {loading ? (
          <div className="ion-text-center ion-padding">
            <IonSpinner />
          </div>
        ) : groupDetails ? (
          <>
            <div className="ion-padding-horizontal ion-padding-top">
              <h1 style={{ margin: '0 0 8px 0' }}>{groupDetails.name}</h1>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <IonChip color="primary" outline>
                  <IonLabel>{groupType?.group_type || 'General'}</IonLabel>
                </IonChip>
                <IonChip color={groupDetails?.visibility === 'public' ? 'success' : 'medium'} outline>
                  <IonIcon icon={groupDetails?.visibility === 'public' ? globeOutline : lockClosedOutline} />
                  <IonLabel>{groupDetails?.visibility === 'public' ? 'Public' : 'Private'}</IonLabel>
                </IonChip>
              </div>
            </div>

            <IonSegment 
              value={activeTab} 
              onIonChange={e => setActiveTab(e.detail.value as 'details' | 'members' | 'activities')}
            >
              <IonSegmentButton value="details">
                <IonIcon icon={settingsOutline} />
                <IonLabel>Details</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="members">
                <IonIcon icon={peopleOutline} />
                <IonLabel>
                  Members
                  <IonBadge color="primary" className="ion-margin-start">
                    {groupDetails?.member_count || 0}
                  </IonBadge>
                </IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="activities">
                <IonIcon icon={calendarOutline} />
                <IonLabel>
                  Activities
                  <IonBadge color="primary" className="ion-margin-start">
                    {groupDetails?.activity_count || 0}
                  </IonBadge>
                </IonLabel>
              </IonSegmentButton>
            </IonSegment>

            {activeTab === 'details' && (
              <div className="ion-padding">
                {isUserAdmin && (
                  <IonCard>
                    <IonCardHeader>
                      <IonCardTitle>Group Settings</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonList>
                        <IonItem>
                          <IonLabel position="stacked">Group Type</IonLabel>
                          <IonSelect
                            value={groupDetails?.group_type_id}
                            onIonChange={e => updateGroupSettings({ group_type_id: e.detail.value })}
                            interface="action-sheet"
                          >
                            {groupTypes.map(type => (
                              <IonSelectOption key={type.id} value={type.id}>
                                {type.group_type}
                              </IonSelectOption>
                            ))}
                          </IonSelect>
                        </IonItem>

                        <IonItem>
                          <IonLabel position="stacked">Visibility</IonLabel>
                          <IonSelect
                            value={groupDetails?.visibility}
                            onIonChange={e => updateGroupSettings({ visibility: e.detail.value })}
                            interface="action-sheet"
                          >
                            <IonSelectOption value="public">Public</IonSelectOption>
                            <IonSelectOption value="private">Private</IonSelectOption>
                          </IonSelect>
                        </IonItem>

                        <IonItem>
                          <IonLabel position="stacked">Join Method</IonLabel>
                          <IonSelect
                            value={groupDetails?.join_method}
                            onIonChange={e => {
                              console.log('Selected join method:', e.detail.value);
                              updateGroupSettings({ join_method: e.detail.value });
                            }}
                            interface="action-sheet"
                          >
                            <IonSelectOption value="direct">Direct (anyone can join)</IonSelectOption>
                            <IonSelectOption value="invitation">Invitation Only</IonSelectOption>
                          </IonSelect>
                        </IonItem>
                      </IonList>
                    </IonCardContent>
                  </IonCard>
                )}

                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Description</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    {isEditing ? (
                      <MarkdownEditor
                        content={groupDetails?.description || ''}
                        onSave={handleSaveDescription}
                        onCancel={() => setIsEditing(false)}
                      />
                    ) : (
                      <>
                        {groupDetails?.description ? (
                          <div onClick={() => isUserAdmin && setIsEditing(true)}>
                            <MarkdownViewer content={groupDetails.description} />
                          </div>
                        ) : isUserAdmin ? (
                          <IonButton
                            fill="clear"
                            onClick={() => setIsEditing(true)}
                          >
                            Add Description
                          </IonButton>
                        ) : (
                          <IonText color="medium">
                            <p>No description available</p>
                          </IonText>
                        )}
                      </>
                    )}
                  </IonCardContent>
                </IonCard>

                {isUserAdmin && (
                  <IonButton
                    expand="block"
                    color="danger"
                    className="ion-margin-top"
                    onClick={() => {
                      presentActionSheet({
                        header: 'Delete Group',
                        subHeader: 'This action cannot be undone',
                        buttons: [
                          {
                            text: 'Delete',
                            role: 'destructive',
                            handler: handleDeleteGroup
                          },
                          {
                            text: 'Cancel',
                            role: 'cancel'
                          }
                        ]
                      });
                    }}
                  >
                    <IonIcon slot="start" icon={trashOutline} />
                    Delete Group
                  </IonButton>
                )}
              </div>
            )}

            {activeTab === 'members' && (
              <div className="ion-padding">
                <IonList>
                  {members.map(member => (
                    <IonItemSliding key={member.id}>
                      <IonItem>
                        <IonLabel>
                          <h2>{member.username}</h2>
                          <p>{member.email}</p>
                        </IonLabel>
                        <IonBadge color={member.role === 'admin' ? 'success' : 'medium'} slot="end">
                          {member.role}
                        </IonBadge>
                      </IonItem>
                      {isUserAdmin && member.id !== user?.id && (
                        <IonItemOptions side="end">
                          <IonItemOption
                            color={member.role === 'admin' ? 'medium' : 'success'}
                            onClick={() => updateMemberRole(member.id, member.role === 'admin' ? 'member' : 'admin')}
                          >
                            {member.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                          </IonItemOption>
                          <IonItemOption color="danger" onClick={() => removeMember(member.id)}>
                            Remove
                          </IonItemOption>
                        </IonItemOptions>
                      )}
                    </IonItemSliding>
                  ))}
                </IonList>

                {isUserAdmin && (
                  <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => setShowAddMemberModal(true)}>
                      <IonIcon icon={personAddOutline} />
                    </IonFabButton>
                  </IonFab>
                )}
              </div>
            )}

            {activeTab === 'activities' && (
              <div className="ion-padding">
                {activities.length === 0 ? (
                  <div className="ion-text-center">
                    <IonIcon
                      icon={calendarOutline}
                      style={{ fontSize: '64px', color: 'var(--ion-color-medium)' }}
                    />
                    <IonText color="medium">
                      <p>No upcoming activities</p>
                      <p>Create one to get started!</p>
                    </IonText>
                  </div>
                ) : (
                  <IonList>
                    {activities.map(activity => (
                      <IonItemSliding key={activity.id}>
                        <IonItem button onClick={() => history.push(`/groups/${groupId}/activities/${activity.id}`)}>
                          <IonLabel>
                            <h2>{activity.title}</h2>
                            <p>{formatDate(activity.date)}</p>
                            {activity.location && <p>{activity.location}</p>}
                          </IonLabel>
                        </IonItem>
                        {isUserAdmin && (
                          <IonItemOptions side="end">
                            <IonItemOption 
                              color="primary" 
                              onClick={() => history.push(`/groups/${groupId}/activities/${activity.id}/edit`)}
                            >
                              <IonIcon slot="icon-only" icon={createOutline} />
                            </IonItemOption>
                          </IonItemOptions>
                        )}
                      </IonItemSliding>
                    ))}
                  </IonList>
                )}
                
                {isUserAdmin && (
                  <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push(`/groups/${groupId}/activities/new`)}>
                      <IonIcon icon={addOutline} />
                    </IonFabButton>
                  </IonFab>
                )}
              </div>
            )}

            <IonModal 
              isOpen={showAddMemberModal} 
              onDidDismiss={handleCloseModal}
              presentingElement={document.querySelector('ion-page') as HTMLElement | undefined}
            >
              <IonHeader>
                <IonToolbar>
                  <IonTitle>Add Member</IonTitle>
                  <IonButtons slot="end">
                    <IonButton onClick={handleCloseModal}>Close</IonButton>
                  </IonButtons>
                </IonToolbar>
              </IonHeader>

              <IonContent className="ion-padding">
                <IonSearchbar
                  value={searchTerm}
                  onIonInput={e => {
                    const value = e.detail.value!;
                    setSearchTerm(value);
                    searchUsers(value);
                  }}
                  placeholder="Search by username or email"
                  debounce={300}
                />

                {searchTerm.length > 0 && searchTerm.length < 3 && (
                  <IonNote className="ion-padding">
                    Type at least 3 characters to search
                  </IonNote>
                )}

                <IonList>
                  {searchResults.map(user => (
                    <IonItem key={user.id} button onClick={() => addMember(user.id)}>
                      <IonLabel>
                        <h2>{user.username}</h2>
                        <p>{user.email}</p>
                      </IonLabel>
                    </IonItem>
                  ))}
                  {searchTerm.length >= 3 && searchResults.length === 0 && (
                    <IonItem>
                      <IonLabel>No users found</IonLabel>
                    </IonItem>
                  )}
                </IonList>
              </IonContent>
            </IonModal>
          </>
        ) : null}
      </IonContent>
    </IonPage>
  );
};

export default GroupDetails; 