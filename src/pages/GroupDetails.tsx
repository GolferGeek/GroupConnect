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
  useIonViewWillEnter,
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
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { getUserProfile, UserProfile } from '../services/database';
import AppHeader from '../components/AppHeader';
import MarkdownViewer from '../components/MarkdownViewer';
import MarkdownEditor from '../components/MarkdownEditor';

interface GroupMemberDetails extends UserProfile {
  role: 'admin' | 'member';
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

const GroupDetailsPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
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

  useIonViewWillEnter(() => {
    loadGroupData();
    if (activeTab === 'activities') {
      loadActivities();
    }
  });

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  useEffect(() => {
    if (activeTab === 'activities') {
      loadActivities();
    }
  }, [activeTab, groupId]);

  const loadGroupData = async () => {
    if (!groupId) return;
    try {
      // First get members to get accurate count
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('role, profiles:profiles(id, email, username, created_at)')
        .eq('group_id', groupId);

      if (membersError) throw membersError;
      
      const formattedMembers = (membersData as unknown as MemberData[]).map(member => ({
        ...member.profiles,
        role: member.role
      }));

      setMembers(formattedMembers);

      // Load group details and activity count
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*, activities(count)')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      // Set group details with correct member count
      setGroupDetails({
        ...groupData,
        member_count: formattedMembers.length,
        activity_count: groupData.activities?.[0]?.count || 0
      });

    } catch (error: any) {
      present({
        message: error.message || 'Failed to load group data',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    if (!groupId) return;
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

  const handleMemberOptions = (member: GroupMemberDetails) => {
    if (!isUserAdmin || member.id === user?.id) return;

    presentActionSheet({
      header: `Manage ${member.username}`,
      buttons: [
        {
          text: member.role === 'admin' ? 'Remove Admin Role' : 'Make Admin',
          handler: () => updateMemberRole(member.id, member.role === 'admin' ? 'member' : 'admin')
        },
        {
          text: 'Remove from Group',
          role: 'destructive',
          handler: () => removeMember(member.id)
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
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

  const handleSaveDescription = async (newDescription: string) => {
    if (!groupId || !groupDetails?.name) {
      present({
        message: 'Group information is missing',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('groups')
        .upsert({ 
          id: groupId,
          name: groupDetails.name,
          description: newDescription 
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setGroupDetails(prev => prev ? { ...prev, description: newDescription } : null);
      setIsEditing(false);
      
      present({
        message: 'Description updated successfully',
        duration: 2000,
        position: 'top',
        color: 'success'
      });
    } catch (error: any) {
      console.error('Error updating description:', error);
      present({
        message: error.message || 'Failed to update description',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    }
  };

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
  };

  const handleCloseActivity = () => {
    setSelectedActivity(null);
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId);

      if (error) throw error;
      
      // Update local state
      setActivities(activities.filter(a => a.id !== activityId));
      setSelectedActivity(null);
      
      present({
        message: 'Activity deleted successfully',
        duration: 2000,
        position: 'top',
        color: 'success'
      });
    } catch (error: any) {
      present({
        message: error.message || 'Failed to delete activity',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    }
  };

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
            {isEditing ? (
              <MarkdownEditor
                content={groupDetails?.description || ''}
                onSave={handleSaveDescription}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <MarkdownViewer
                content={groupDetails?.description || ''}
                onEdit={() => setIsEditing(true)}
                canEdit={isUserAdmin}
              />
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <>
            <IonList>
              {members.map(member => (
                <IonItemSliding key={member.id}>
                  <IonItem button onClick={() => handleMemberOptions(member)}>
                    <IonLabel>
                      <h2>{member.username}</h2>
                      <p>{member.email}</p>
                    </IonLabel>
                    <IonBadge color={member.role === 'admin' ? 'success' : 'medium'} slot="end">
                      {member.role}
                    </IonBadge>
                    {isUserAdmin && member.id !== user?.id && (
                      <IonIcon icon={ellipsisHorizontal} slot="end" />
                    )}
                  </IonItem>
                  {isUserAdmin && member.id !== user?.id && (
                    <IonItemOptions side="end">
                      <IonItemOption
                        color={member.role === 'admin' ? 'medium' : 'primary'}
                        onClick={() => updateMemberRole(member.id, member.role === 'admin' ? 'member' : 'admin')}
                      >
                        {member.role === 'admin' ? 'Make Member' : 'Make Admin'}
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
                <IonFabButton>
                  <IonIcon icon={personAddOutline} />
                </IonFabButton>
              </IonFab>
            )}
          </>
        )}

        {activeTab === 'activities' && (
          <div className="ion-padding">
            {selectedActivity ? (
              <>
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>{selectedActivity.title}</IonCardTitle>
                    <IonCardSubtitle>{formatDate(selectedActivity.date)}</IonCardSubtitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonItem lines="none">
                      <IonIcon icon={timeOutline} slot="start" />
                      <IonLabel>{formatDate(selectedActivity.date)}</IonLabel>
                    </IonItem>

                    {selectedActivity.location && (
                      <IonItem lines="none">
                        <IonIcon icon={locationOutline} slot="start" />
                        <IonLabel>{selectedActivity.location}</IonLabel>
                      </IonItem>
                    )}

                    {selectedActivity.url && (
                      <IonItem lines="none" href={selectedActivity.url} target="_blank">
                        <IonIcon icon={linkOutline} slot="start" />
                        <IonLabel>Meeting Link</IonLabel>
                      </IonItem>
                    )}
                  </IonCardContent>
                </IonCard>

                {selectedActivity.description && (
                  <div className="ion-margin-top">
                    <MarkdownViewer content={selectedActivity.description} />
                  </div>
                )}

                {selectedActivity.notes && (
                  <IonCard className="ion-margin-top">
                    <IonCardHeader>
                      <IonCardTitle>Notes</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <MarkdownViewer content={selectedActivity.notes} />
                    </IonCardContent>
                  </IonCard>
                )}

                <div className="ion-padding">
                  <IonButton expand="block" onClick={handleCloseActivity}>
                    Back to Activities
                  </IonButton>
                  {isUserAdmin && (
                    <>
                      <IonButton 
                        expand="block" 
                        color="primary"
                        onClick={() => history.push(`/tabs/activities/${selectedActivity.id}/edit`)}
                      >
                        <IonIcon slot="start" icon={createOutline} />
                        Edit Activity
                      </IonButton>
                      <IonButton 
                        expand="block" 
                        color="danger"
                        onClick={() => handleDeleteActivity(selectedActivity.id)}
                      >
                        <IonIcon slot="start" icon={trashOutline} />
                        Delete Activity
                      </IonButton>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
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
                        <IonItem button onClick={() => history.push(`/tabs/activities/${activity.id}`)}>
                          <IonLabel>
                            <h2>{activity.title}</h2>
                            <p>{formatDate(activity.date)}</p>
                            {activity.location && <p>{activity.location}</p>}
                          </IonLabel>
                        </IonItem>
                        <IonItemOptions side="end">
                          <IonItemOption 
                            color="primary" 
                            onClick={() => history.push(`/tabs/activities/${activity.id}`)}
                          >
                            <IonIcon slot="start" icon={createOutline} />
                            Details
                          </IonItemOption>
                          {isUserAdmin && (
                            <IonItemOption 
                              color="danger" 
                              onClick={() => handleDeleteActivity(activity.id)}
                            >
                              <IonIcon slot="start" icon={trashOutline} />
                              Delete
                            </IonItemOption>
                          )}
                        </IonItemOptions>
                      </IonItemSliding>
                    ))}
                  </IonList>
                )}
                
                {isUserAdmin && (
                  <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push(`/tabs/groups/${groupId}/activities/new`)}>
                      <IonIcon icon={addOutline} />
                    </IonFabButton>
                  </IonFab>
                )}
              </>
            )}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default GroupDetailsPage; 