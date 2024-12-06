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
  const [formData, setFormData] = useState<ActivityFormData>(() => {
    const defaultDate = new Date().toISOString();
    const initialFormData = {
      title: '',
      description: '',
      date: defaultDate,
      location: '',
      url: '',
      notes: '',
      group_id: groupId || '',
    };

    if (initialData?.date) {
      console.log('Initial date from props:', initialData.date);
      // Ensure we have a valid date string
      const dateObj = new Date(initialData.date);
      const formattedDate = dateObj.toISOString();
      console.log('Formatted initial date:', formattedDate);
      return {
        ...initialFormData,
        ...initialData,
        date: formattedDate
      };
    }

    return initialFormData;
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
    console.log('ActivityForm: Starting form submission with data:', formData);
    setLoading(true);
    try {
      console.log('ActivityForm: Calling onSubmit handler...');
      await onSubmit(formData);
      console.log('ActivityForm: Form submission completed successfully');
    } catch (error) {
      console.error('ActivityForm: Error during form submission:', error);
      throw error;
    } finally {
      console.log('ActivityForm: Setting loading to false');
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ActivityFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Debug log for date value
  useEffect(() => {
    console.log('Current form date value:', formData.date);
  }, [formData.date]);

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
            onIonChange={e => {
              const value = e.detail.value;
              console.log('DateTime picker onChange value:', value);
              if (value) {
                const dateValue = typeof value === 'string' ? value : value[0];
                // Ensure we store the date in UTC
                const date = new Date(dateValue);
                const utcDate = new Date(
                  Date.UTC(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate(),
                    date.getHours(),
                    date.getMinutes()
                  )
                ).toISOString();
                console.log('Storing UTC date:', utcDate);
                handleChange('date', utcDate);
              }
            }}
            min={new Date().toISOString()}
            presentation="date-time"
            preferWheel={true}
            showDefaultButtons={true}
            doneText="Set"
            cancelText="Cancel"
            hourCycle="h12"
            firstDayOfWeek={0}
            className="ion-padding-vertical"
            style={{
              width: '100%',
              '--background': 'var(--ion-color-light)',
              '--border-radius': '8px',
              '--padding-start': '16px',
              '--padding-end': '16px',
            }}
            locale="en-US"
          >
            <span slot="title">Select Date and Time</span>
          </IonDatetime>
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