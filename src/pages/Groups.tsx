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
} from '@ionic/react';
import { addOutline, peopleOutline } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import { createGroup, getUserGroups, Group } from '../services/database';
import { useHistory } from 'react-router-dom';
import AppHeader from '../components/AppHeader';

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
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
      const group = await createGroup(newGroupName.trim(), user.id);
      setGroups([...groups, group]);
      setIsModalOpen(false);
      setNewGroupName('');
      history.push(`/tabs/groups/${group.id}`);
    } catch (error) {
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
              <IonItem
                key={group.id}
                button
                onClick={() => history.push(`/tabs/groups/${group.id}`)}
              >
                <IonLabel>
                  <h2>{group.name}</h2>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setIsModalOpen(true)}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        <IonModal 
          isOpen={isModalOpen} 
          onDidDismiss={closeModal}
          presentingElement={document.querySelector('ion-page') as HTMLElement | undefined}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Create New Group</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={closeModal}>Cancel</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateGroup();
            }}>
              <IonItem>
                <IonLabel position="stacked">Group Name</IonLabel>
                <IonInput
                  value={newGroupName}
                  onIonChange={e => setNewGroupName(e.detail.value!)}
                  placeholder="Enter group name"
                  disabled={creating}
                  required
                  autofocus={true}
                  aria-label="Group name"
                />
              </IonItem>
              <IonButton
                expand="block"
                type="submit"
                className="ion-margin-top"
                disabled={!newGroupName.trim() || creating}
              >
                {creating ? <IonSpinner name="crescent" /> : 'Create Group'}
              </IonButton>
            </form>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Groups; 