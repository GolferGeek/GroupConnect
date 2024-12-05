import { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonInput,
  IonTextarea,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  useIonToast,
  IonSpinner,
} from '@ionic/react';
import { addOutline, createOutline, trashOutline } from 'ionicons/icons';
import { supabase } from '../config/supabase';
import AppHeader from '../components/AppHeader';

interface UserRole {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

const RoleManager: React.FC = () => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [present] = useIonToast();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('name');

      if (error) throw error;
      setRoles(data || []);
    } catch (error: any) {
      present({
        message: error.message || 'Failed to load user roles',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      present({
        message: 'Name is required',
        duration: 2000,
        position: 'top',
        color: 'warning'
      });
      return;
    }

    try {
      if (editingRole) {
        const { error } = await supabase
          .from('user_roles')
          .update({ name: name.trim(), description: description.trim() })
          .eq('id', editingRole.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .insert([{ name: name.trim(), description: description.trim() }]);

        if (error) throw error;
      }

      present({
        message: `User role ${editingRole ? 'updated' : 'created'} successfully`,
        duration: 2000,
        position: 'top',
        color: 'success'
      });

      setShowModal(false);
      setEditingRole(null);
      setName('');
      setDescription('');
      loadRoles();
    } catch (error: any) {
      present({
        message: error.message || 'Failed to save user role',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    }
  };

  const handleDelete = async (role: UserRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', role.id);

      if (error) throw error;

      present({
        message: 'User role deleted successfully',
        duration: 2000,
        position: 'top',
        color: 'success'
      });

      loadRoles();
    } catch (error: any) {
      present({
        message: error.message || 'Failed to delete user role',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    }
  };

  const handleEdit = (role: UserRole) => {
    setEditingRole(role);
    setName(role.name);
    setDescription(role.description);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingRole(null);
    setName('');
    setDescription('');
    setShowModal(true);
  };

  return (
    <IonPage>
      <AppHeader title="User Role Manager" />
      <IonContent>
        {loading ? (
          <div className="ion-text-center ion-padding">
            <IonSpinner />
          </div>
        ) : (
          <IonList>
            {roles.map(role => (
              <IonItem key={role.id}>
                <IonLabel>
                  <h2>{role.name}</h2>
                  <p>{role.description}</p>
                </IonLabel>
                <IonButton
                  fill="clear"
                  onClick={() => handleEdit(role)}
                >
                  <IonIcon slot="icon-only" icon={createOutline} />
                </IonButton>
                <IonButton
                  fill="clear"
                  color="danger"
                  onClick={() => handleDelete(role)}
                >
                  <IonIcon slot="icon-only" icon={trashOutline} />
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        )}

        <IonButton
          className="ion-margin"
          expand="block"
          onClick={handleAdd}
        >
          <IonIcon slot="start" icon={addOutline} />
          Add User Role
        </IonButton>

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{editingRole ? 'Edit' : 'Add'} User Role</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>Cancel</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              <IonItem>
                <IonLabel position="stacked">Name</IonLabel>
                <IonInput
                  value={name}
                  onIonChange={e => setName(e.detail.value!)}
                  placeholder="Enter role name"
                  required
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Description</IonLabel>
                <IonTextarea
                  value={description}
                  onIonChange={e => setDescription(e.detail.value!)}
                  placeholder="Enter role description"
                  rows={4}
                />
              </IonItem>
            </IonList>
            <div className="ion-padding">
              <IonButton expand="block" onClick={handleSave}>
                Save
              </IonButton>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default RoleManager; 