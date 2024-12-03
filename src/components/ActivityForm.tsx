import { useState, useEffect } from 'react';
import {
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonButton,
  IonDatetime,
  IonSpinner,
  IonSelect,
  IonSelectOption,
  useIonToast,
} from '@ionic/react';
import { supabase } from '../config/supabase';

interface Group {
  id: string;
  name: string;
}

interface ActivityFormData {
  title: string;
  description?: string;
  date: string;
  location?: string;
  url?: string;
  notes?: string;
  group_id: string;
}

interface ActivityFormProps {
  initialData?: Partial<ActivityFormData>;
  groupId?: string;
  onSubmit: (data: ActivityFormData) => Promise<void>;
  onCancel: () => void;
}

const ActivityForm: React.FC<ActivityFormProps> = ({
  initialData,
  groupId,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<ActivityFormData>({
    title: '',
    description: '',
    date: new Date().toISOString(),
    location: '',
    url: '',
    notes: '',
    group_id: groupId || '',
    ...initialData,
  });
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(!groupId);
  const [present] = useIonToast();

  useEffect(() => {
    if (!groupId) {
      loadGroups();
    }
  }, [groupId]);

  const loadGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setGroups(data || []);
    } catch (error: any) {
      present({
        message: 'Failed to load groups',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ActivityFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loadingGroups) {
    return (
      <div className="ion-text-center ion-padding">
        <IonSpinner />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <IonList>
        <IonItem>
          <IonLabel position="stacked">Title *</IonLabel>
          <IonInput
            value={formData.title}
            onIonChange={e => handleChange('title', e.detail.value!)}
            required
            placeholder="Enter activity title"
          />
        </IonItem>

        {!groupId && (
          <IonItem>
            <IonLabel position="stacked">Group *</IonLabel>
            <IonSelect
              value={formData.group_id}
              onIonChange={e => handleChange('group_id', e.detail.value)}
              placeholder="Select group"
              required
            >
              {groups.map(group => (
                <IonSelectOption key={group.id} value={group.id}>
                  {group.name}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        )}

        <IonItem>
          <IonLabel position="stacked">Date and Time *</IonLabel>
          <IonDatetime
            value={formData.date}
            onIonChange={e => handleChange('date', e.detail.value!)}
            min={new Date().toISOString()}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Location</IonLabel>
          <IonInput
            value={formData.location}
            onIonChange={e => handleChange('location', e.detail.value!)}
            placeholder="Enter location"
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">URL</IonLabel>
          <IonInput
            value={formData.url}
            onIonChange={e => handleChange('url', e.detail.value!)}
            type="url"
            placeholder="Enter meeting link"
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Description</IonLabel>
          <IonTextarea
            value={formData.description}
            onIonChange={e => handleChange('description', e.detail.value!)}
            rows={4}
            placeholder="Enter description (markdown supported)"
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Notes</IonLabel>
          <IonTextarea
            value={formData.notes}
            onIonChange={e => handleChange('notes', e.detail.value!)}
            rows={4}
            placeholder="Enter additional notes (markdown supported)"
          />
        </IonItem>
      </IonList>

      <div className="ion-padding">
        <IonButton expand="block" type="submit" disabled={loading}>
          {loading ? <IonSpinner name="crescent" /> : 'Save Activity'}
        </IonButton>
        <IonButton
          expand="block"
          color="medium"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </IonButton>
      </div>
    </form>
  );
};

export default ActivityForm; 