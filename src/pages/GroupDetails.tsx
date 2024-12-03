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
} from '@ionic/react';
import {
  peopleOutline,
  calendarOutline,
  settingsOutline,
  addOutline,
  personAddOutline,
  timeOutline,
  ellipsisHorizontal,
} from 'ionicons/icons';
import { useParams } from 'react-router-dom';
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

const GroupDetailsPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [members, setMembers] = useState<GroupMemberDetails[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'members' | 'activities'>('details');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [present] = useIonToast();
  const [presentActionSheet] = useIonActionSheet();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

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
          <div className="ion-padding ion-text-center">
            <IonText color="medium">
              <p>Activities feature coming soon!</p>
            </IonText>
            <IonFab vertical="bottom" horizontal="end" slot="fixed">
              <IonFabButton>
                <IonIcon icon={addOutline} />
              </IonFabButton>
            </IonFab>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default GroupDetailsPage; 