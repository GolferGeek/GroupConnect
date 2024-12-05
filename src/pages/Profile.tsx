import { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  useIonToast,
} from '@ionic/react';
import { createOutline } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import AppHeader from '../components/AppHeader';

interface UserType {
  id: number;
  type: string;
  description: string;
}

const Profile: React.FC = () => {
  const { profile } = useAuth();
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [selectedOtherTypes, setSelectedOtherTypes] = useState<number[]>([]);
  const [present] = useIonToast();

  useEffect(() => {
    console.log('Profile mounted, loading user types...');
    loadUserTypes();
  }, []);

  useEffect(() => {
    console.log('Profile changed:', profile);
    if (profile) {
      setSelectedType(profile.user_type_id);
      setSelectedOtherTypes(profile.other_types || []);
    }
  }, [profile]);

  const loadUserTypes = async () => {
    try {
      console.log('Fetching user types...');
      const { data, error } = await supabase
        .from('user_types')
        .select('*')
        .order('type');

      if (error) throw error;
      console.log('User types loaded:', data);
      setUserTypes(data || []);
    } catch (error: any) {
      console.error('Error loading user types:', error);
      present({
        message: error.message || 'Failed to load user types',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile || !selectedType) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          user_type_id: selectedType,
          other_types: selectedOtherTypes
        })
        .eq('id', profile.id);

      if (error) throw error;

      present({
        message: 'Profile updated successfully',
        duration: 2000,
        position: 'top',
        color: 'success'
      });

      setEditing(false);
    } catch (error: any) {
      present({
        message: error.message || 'Failed to update profile',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    }
  };

  if (loading) {
    return (
      <IonPage>
        <AppHeader title="Profile" showBackButton />
        <IonContent>
          <div className="ion-text-center ion-padding">
            <IonSpinner />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!profile) {
    return (
      <IonPage>
        <AppHeader title="Profile" showBackButton />
        <IonContent>
          <div className="ion-text-center ion-padding">
            <p>Failed to load profile</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const currentType = userTypes.find(t => t.id === profile.user_type_id);
  const otherTypeNames = (profile.other_types || [])
    .map(id => userTypes.find(t => t.id === id)?.type)
    .filter(Boolean)
    .join(', ');

  return (
    <IonPage>
      <AppHeader title="Profile" showBackButton />
      <IonContent>
        <IonList>
          <IonItem>
            <IonLabel>
              <h2>Username</h2>
              <p>{profile.username}</p>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <h2>Email</h2>
              <p>{profile.email}</p>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <h2>Role</h2>
              <p>{profile.role_id === 1 ? 'Admin' : 'Member'}</p>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <h2>Primary Type</h2>
              {editing ? (
                <IonSelect
                  value={selectedType}
                  onIonChange={e => setSelectedType(e.detail.value)}
                  placeholder="Select a type"
                >
                  {userTypes.map(type => (
                    <IonSelectOption key={type.id} value={type.id}>
                      {type.type}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              ) : (
                <p>{currentType ? currentType.type : 'Not set'}</p>
              )}
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <h2>Other Types</h2>
              {editing ? (
                <IonSelect
                  multiple={true}
                  value={selectedOtherTypes}
                  onIonChange={e => setSelectedOtherTypes(e.detail.value)}
                  placeholder="Select other types"
                >
                  {userTypes
                    .filter(type => type.id !== selectedType)
                    .map(type => (
                      <IonSelectOption key={type.id} value={type.id}>
                        {type.type}
                      </IonSelectOption>
                    ))}
                </IonSelect>
              ) : (
                <p>{otherTypeNames || 'None'}</p>
              )}
            </IonLabel>
          </IonItem>
        </IonList>

        {editing ? (
          <div className="ion-padding">
            <IonButton expand="block" onClick={handleSave}>
              Save Changes
            </IonButton>
            <IonButton expand="block" fill="clear" onClick={() => setEditing(false)}>
              Cancel
            </IonButton>
          </div>
        ) : (
          <div className="ion-padding">
            <IonButton expand="block" onClick={() => setEditing(true)}>
              <IonIcon slot="start" icon={createOutline} />
              Edit Profile
            </IonButton>
          </div>
        )}

        {profile?.role_id === 1 && (
          <div className="ion-padding">
            <IonButton expand="block" color="tertiary" routerLink="/type-manager">
              Manage User Types
            </IonButton>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Profile; 