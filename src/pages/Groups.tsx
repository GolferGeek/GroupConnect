import { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonModal,
  IonInput,
  IonButtons,
  useIonToast,
  IonSpinner,
  IonText,
  IonToolbar,
  IonTitle,
  IonHeader,
  IonSelect,
  IonSelectOption,
  IonBadge,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
} from '@ionic/react';
import { addOutline, peopleOutline, lockClosedOutline, globeOutline, settingsOutline } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import { createGroup, getUserGroups, Group, updateGroupSettings } from '../services/database';
import { useHistory } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import AppTabBar from '../components/AppTabBar';

interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  onUpdate: () => void;
}

const GroupSettingsModal: React.FC<GroupSettingsModalProps> = ({
  isOpen,
  onClose,
  group,
  onUpdate,
}) => {
  const [name, setName] = useState(group.name);
  const [visibility, setVisibility] = useState<'public' | 'private'>(group.visibility || 'private');
  const [joinMethod, setJoinMethod] = useState<'direct' | 'invitation'>(group.join_method || 'invitation');
  const [updating, setUpdating] = useState(false);
  const [present] = useIonToast();

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const updates: {
        name?: string;
        visibility?: 'public' | 'private';
        join_method?: 'direct' | 'invitation';
      } = {};

      if (name !== group.name) {
        updates.name = name;
      }

      if (visibility !== group.visibility) {
        updates.visibility = visibility;
        if (visibility === 'private') {
          updates.join_method = 'invitation';
          setJoinMethod('invitation');
        }
      }

      if (joinMethod !== group.join_method && visibility === 'public') {
        updates.join_method = joinMethod;
      }

      if (Object.keys(updates).length > 0) {
        await updateGroupSettings(group.id, updates);
      }

      onUpdate();
      onClose();
      present({
        message: 'Group settings updated successfully',
        duration: 2000,
        position: 'top',
        color: 'success'
      });
    } catch (error: any) {
      present({
        message: error.message || 'Failed to update group settings',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Group Settings</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>Cancel</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem>
            <IonLabel position="stacked">Group Name</IonLabel>
            <IonInput
              value={name}
              onIonChange={e => setName(e.detail.value!)}
              placeholder="Enter group name"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Visibility</IonLabel>
            <IonSelect
              value={visibility}
              onIonChange={e => {
                setVisibility(e.detail.value);
                if (e.detail.value === 'private') {
                  setJoinMethod('invitation');
                }
              }}
            >
              <IonSelectOption value="private">
                Private - Only visible to members
              </IonSelectOption>
              <IonSelectOption value="public">
                Public - Anyone can find this group
              </IonSelectOption>
            </IonSelect>
          </IonItem>

          {visibility === 'public' && (
            <IonItem>
              <IonLabel position="stacked">Join Method</IonLabel>
              <IonSelect
                value={joinMethod}
                onIonChange={e => setJoinMethod(e.detail.value)}
              >
                <IonSelectOption value="direct">
                  Direct - Anyone can join instantly
                </IonSelectOption>
                <IonSelectOption value="invitation">
                  By Invitation - Requires admin approval
                </IonSelectOption>
              </IonSelect>
            </IonItem>
          )}
        </IonList>

        <div className="ion-padding">
          <IonText color="medium">
            <p>
              {visibility === 'private' 
                ? 'Private groups are only visible to members'
                : joinMethod === 'direct'
                  ? 'Anyone can find and instantly join this group'
                  : 'Anyone can find this group but must request to join'}
            </p>
          </IonText>
        </div>

        <div className="ion-padding">
          <IonButton
            expand="block"
            onClick={handleUpdate}
            disabled={updating}
          >
            {updating ? <IonSpinner name="crescent" /> : 'Update Settings'}
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
};

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupVisibility, setNewGroupVisibility] = useState<'public' | 'private'>('private');
  const [newGroupJoinMethod, setNewGroupJoinMethod] = useState<'direct' | 'invitation'>('invitation');
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();
  const history = useHistory();
  const [present] = useIonToast();

  useEffect(() => {
    loadGroups();
  }, [user]);

  const loadGroups = async () => {
    if (!user) return;
    try {
      const userGroups = await getUserGroups(user.id);
      setGroups(userGroups);
    } catch (error) {
      present({
        message: 'Failed to load groups',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!user || !newGroupName.trim()) return;
    setCreating(true);
    try {
      console.log('Creating new group...');
      const group = await createGroup(
        newGroupName.trim(), 
        user.id, 
        newGroupVisibility,
        newGroupJoinMethod
      );
      console.log('Created group:', group);
      setGroups([...groups, group]);
      setIsModalOpen(false);
      setNewGroupName('');
      setNewGroupVisibility('private');
      setNewGroupJoinMethod('invitation');
      console.log('Navigating to group details:', `/groups/${group.id}`);
      history.push(`/groups/${group.id}`);
    } catch (error) {
      console.error('Error creating group:', error);
      present({
        message: 'Failed to create group',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    } finally {
      setCreating(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewGroupName('');
    setNewGroupVisibility('private');
    setNewGroupJoinMethod('invitation');
  };

  const handleGroupSettings = (group: Group) => {
    setSelectedGroup(group);
  };

  return (
    <IonPage>
      <AppHeader title="My Groups" />
      <IonContent>
        {loading ? (
          <div className="ion-text-center ion-padding">
            <IonSpinner />
          </div>
        ) : groups.length === 0 ? (
          <div className="ion-text-center ion-padding">
            <IonIcon
              icon={peopleOutline}
              style={{ fontSize: '64px', color: 'var(--ion-color-medium)' }}
            />
            <IonText>
              <p>You haven't joined any groups yet.</p>
              <p>Create one to get started!</p>
            </IonText>
          </div>
        ) : (
          <IonList>
            {groups.map(group => (
              <IonItemSliding key={group.id}>
                <IonItem>
                  <IonLabel onClick={() => history.push(`/groups/${group.id}`)}>
                    <h2>{group.name}</h2>
                  </IonLabel>
                  <IonBadge 
                    color={(group.visibility || 'private') === 'private' ? 'medium' : 'success'} 
                    slot="end"
                  >
                    <IonIcon 
                      icon={(group.visibility || 'private') === 'private' ? lockClosedOutline : globeOutline} 
                    />
                    &nbsp;
                    {group.visibility || 'private'}
                  </IonBadge>
                </IonItem>
                <IonItemOptions side="end">
                  <IonItemOption color="primary" onClick={() => handleGroupSettings(group)}>
                    <IonIcon slot="start" icon={settingsOutline} />
                    Settings
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            ))}
          </IonList>
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setIsModalOpen(true)}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        <IonModal isOpen={isModalOpen} onDidDismiss={closeModal}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Create New Group</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={closeModal}>Cancel</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonItem>
              <IonLabel position="stacked">Group Name</IonLabel>
              <IonInput
                value={newGroupName}
                onIonChange={e => setNewGroupName(e.detail.value!)}
                placeholder="Enter group name"
                disabled={creating}
              />
            </IonItem>

            <IonItem className="ion-margin-top">
              <IonLabel position="stacked">Visibility</IonLabel>
              <IonSelect
                value={newGroupVisibility}
                onIonChange={e => {
                  setNewGroupVisibility(e.detail.value);
                  if (e.detail.value === 'private') {
                    setNewGroupJoinMethod('invitation');
                  }
                }}
                disabled={creating}
              >
                <IonSelectOption value="private">
                  <IonIcon icon={lockClosedOutline} /> Private - Only visible to members
                </IonSelectOption>
                <IonSelectOption value="public">
                  <IonIcon icon={globeOutline} /> Public - Anyone can find this group
                </IonSelectOption>
              </IonSelect>
            </IonItem>

            {newGroupVisibility === 'public' && (
              <IonItem className="ion-margin-top">
                <IonLabel position="stacked">Join Method</IonLabel>
                <IonSelect
                  value={newGroupJoinMethod}
                  onIonChange={e => setNewGroupJoinMethod(e.detail.value)}
                  disabled={creating}
                >
                  <IonSelectOption value="direct">
                    Direct - Anyone can join instantly
                  </IonSelectOption>
                  <IonSelectOption value="invitation">
                    By Invitation - Requires admin approval
                  </IonSelectOption>
                </IonSelect>
              </IonItem>
            )}

            <div className="ion-margin-top">
              <IonText color="medium">
                <p>
                  {newGroupVisibility === 'private' 
                    ? 'Private groups are only visible to members'
                    : newGroupJoinMethod === 'direct'
                      ? 'Anyone can find and instantly join this group'
                      : 'Anyone can find this group but must request to join'}
                </p>
              </IonText>
            </div>

            <IonButton
              expand="block"
              onClick={handleCreateGroup}
              className="ion-margin-top"
              disabled={!newGroupName.trim() || creating}
            >
              {creating ? <IonSpinner name="crescent" /> : 'Create Group'}
            </IonButton>
          </IonContent>
        </IonModal>

        {selectedGroup && (
          <GroupSettingsModal
            isOpen={!!selectedGroup}
            onClose={() => setSelectedGroup(null)}
            group={selectedGroup}
            onUpdate={() => {
              loadGroups();
              setSelectedGroup(null);
            }}
          />
        )}
      </IonContent>
      <AppTabBar />
    </IonPage>
  );
};

export default Groups; 