import React, { useState, useEffect } from 'react';
import {
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
  IonContent,
  useIonToast,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
} from '@ionic/react';
import { addOutline, createOutline, trashOutline } from 'ionicons/icons';
import { supabase } from '../config/supabase';

interface SubType {
  id?: number;
  name: string;
  description: string;
}

interface BaseType {
  id: number;
}

interface UserType extends BaseType {
  type: string;
}

interface GroupType extends BaseType {
  group_type: string;
  sub_types: SubType[];
}

interface ActivityType extends BaseType {
  name: string;
  description: string;
  group_id?: string;
}

type Type = UserType | GroupType | ActivityType;

interface TypeListProps {
  tableName: 'user_types' | 'group_types' | 'activity_types';
  title: string;
}

const TypeList: React.FC<TypeListProps> = ({ tableName, title }) => {
  const [types, setTypes] = useState<Type[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSubTypeModal, setShowSubTypeModal] = useState(false);
  const [editingType, setEditingType] = useState<Type | null>(null);
  const [typeValue, setTypeValue] = useState('');
  const [description, setDescription] = useState('');
  const [subTypes, setSubTypes] = useState<SubType[]>([]);
  const [editingSubType, setEditingSubType] = useState<SubType | null>(null);
  const [subTypeIndex, setSubTypeIndex] = useState<number | null>(null);
  const [newSubTypeName, setNewSubTypeName] = useState('');
  const [newSubTypeDescription, setNewSubTypeDescription] = useState('');
  const [present] = useIonToast();
  const [pendingSave, setPendingSave] = useState<SubType[] | null>(null);

  // Get the appropriate column name based on the table
  const getTypeColumn = () => {
    switch (tableName) {
      case 'group_types':
        return 'group_type';
      case 'activity_types':
        return 'name';
      default:
        return 'type';
    }
  };

  // Get the type value from a Type object
  const getTypeValue = (type: Type): string => {
    if (tableName === 'activity_types') {
      return (type as ActivityType).name;
    } else if (tableName === 'group_types') {
      return (type as GroupType).group_type;
    } else {
      return (type as UserType).type;
    }
  };

  const getSubTypes = (type: Type): string => {
    if (tableName === 'group_types') {
      const groupType = type as GroupType;
      return (groupType.sub_types || [])
        .map(st => st.name)
        .join(', ');
    }
    return '';
  };

  const parseSubTypes = (input: string): SubType[] => {
    return input.split(',')
      .map(name => name.trim())
      .filter(Boolean)
      .map(name => ({ 
        name,
        description: ''
      }));
  };

  useEffect(() => {
    console.log('Loading types for table:', tableName);
    loadTypes();
  }, [tableName]);

  const loadTypes = async () => {
    setLoading(true);
    try {
      console.log('Loading types for table:', tableName);
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order(getTypeColumn());

      if (error) {
        console.error('Error loading types:', error);
        throw error;
      }

      console.log('Loaded data:', data);
      
      // Ensure sub_types is parsed as JSON for group_types
      if (tableName === 'group_types' && data) {
        data.forEach((type: any) => {
          if (typeof type.sub_types === 'string') {
            try {
              type.sub_types = JSON.parse(type.sub_types);
            } catch (e) {
              console.error('Error parsing sub_types:', e);
              type.sub_types = [];
            }
          }
        });
      }

      setTypes(data || []);
    } catch (error: any) {
      console.error('Failed to load types:', error);
      present({
        message: error.message || 'Failed to load types',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubType = () => {
    setEditingSubType(null);
    setNewSubTypeName('');
    setNewSubTypeDescription('');
    setShowSubTypeModal(true);
  };

  const handleEditSubType = (subType: SubType, index: number) => {
    setEditingSubType(subType);
    setSubTypeIndex(index);
    setNewSubTypeName(subType.name);
    setNewSubTypeDescription(subType.description);
    setShowSubTypeModal(true);
  };

  const handleSaveSubType = () => {
    console.log('Form values:', {
      name: newSubTypeName,
      description: newSubTypeDescription,
      trimmedName: newSubTypeName.trim(),
      trimmedDescription: newSubTypeDescription.trim()
    });
    
    if (!newSubTypeName.trim()) {
      present({
        message: 'Sub-type name is required',
        duration: 2000,
        position: 'top',
        color: 'warning'
      });
      return;
    }

    if (!newSubTypeDescription.trim()) {
      present({
        message: 'Sub-type description is required',
        duration: 2000,
        position: 'top',
        color: 'warning'
      });
      return;
    }

    const newSubType: SubType = {
      name: newSubTypeName.trim(),
      description: newSubTypeDescription.trim()
    };

    console.log('Created new sub-type:', newSubType);

    let updatedSubTypes: SubType[];
    if (editingSubType !== null && subTypeIndex !== null) {
      // Preserve the id when editing
      newSubType.id = editingSubType.id;
      updatedSubTypes = [...subTypes];
      updatedSubTypes[subTypeIndex] = newSubType;
    } else {
      // Add new sub-type
      updatedSubTypes = [...subTypes, newSubType];
    }

    console.log('Updated sub-types:', updatedSubTypes);
    
    // Update both states before closing the modal
    setSubTypes(updatedSubTypes);
    setPendingSave(updatedSubTypes);

    // Close modal and reset form after states are updated
    setShowSubTypeModal(false);
    setEditingSubType(null);
    setSubTypeIndex(null);
    setNewSubTypeName('');
    setNewSubTypeDescription('');
  };

  const handleDeleteSubType = (index: number) => {
    const updatedSubTypes = subTypes.filter((_, i) => i !== index);
    setSubTypes(updatedSubTypes);
  };

  const handleSave = async () => {
    if (!typeValue.trim()) {
      present({
        message: 'Type is required',
        duration: 2000,
        position: 'top',
        color: 'warning'
      });
      return;
    }

    try {
      const column = getTypeColumn();
      console.log('Saving with column:', column);
      
      const updateData: any = {
        [column]: typeValue.trim()
      };

      // Add sub_types for group_types
      if (tableName === 'group_types') {
        console.log('Current sub-types before save:', subTypes);
        updateData.sub_types = subTypes.map(st => ({
          id: st.id,
          name: st.name,
          description: st.description
        }));
        console.log('Formatted sub-types for save:', updateData.sub_types);
      }

      console.log('Final update data:', updateData);

      if (editingType) {
        console.log('Updating existing type:', editingType.id);
        const { data, error } = await supabase
          .from(tableName)
          .update(updateData)
          .eq('id', editingType.id)
          .select();

        console.log('Update response:', { data, error });
        if (error) throw error;
      } else {
        console.log('Creating new type');
        const { data, error } = await supabase
          .from(tableName)
          .insert([updateData])
          .select();

        console.log('Insert response:', { data, error });
        if (error) throw error;
      }

      present({
        message: `${title} type ${editingType ? 'updated' : 'created'} successfully`,
        duration: 2000,
        position: 'top',
        color: 'success'
      });

      setShowModal(false);
      setEditingType(null);
      setTypeValue('');
      setDescription('');
      setSubTypes([]);
      loadTypes();
    } catch (error: any) {
      console.error('Failed to save:', error);
      present({
        message: error.message || 'Failed to save type',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    }
  };

  const handleDelete = async (type: Type) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', type.id);

      if (error) throw error;

      present({
        message: 'Type deleted successfully',
        duration: 2000,
        position: 'top',
        color: 'success'
      });

      loadTypes();
    } catch (error: any) {
      console.error('Failed to delete:', error);
      present({
        message: error.message || 'Failed to delete type',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    }
  };

  const handleEdit = (type: Type) => {
    setEditingType(type);
    setTypeValue(getTypeValue(type));
    if (tableName === 'group_types') {
      setSubTypes((type as GroupType).sub_types || []);
    }
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingType(null);
    setTypeValue('');
    setDescription('');
    setSubTypes([]);
    setShowModal(true);
  };

  // Effect to handle saving after sub-types state is updated
  useEffect(() => {
    if (pendingSave && tableName === 'group_types' && editingType) {
      console.log('Saving pending sub-types:', pendingSave);
      
      const updateData = {
        [getTypeColumn()]: getTypeValue(editingType),
        sub_types: pendingSave.map(st => ({
          id: st.id,
          name: st.name,
          description: st.description
        }))
      };

      console.log('Saving group type with updated sub-types:', updateData);

      supabase
        .from(tableName)
        .update(updateData)
        .eq('id', editingType.id)
        .select()
        .then(({ data, error }) => {
          if (error) {
            console.error('Failed to save sub-types:', error);
            present({
              message: error.message || 'Failed to save sub-types',
              duration: 3000,
              position: 'top',
              color: 'danger'
            });
          } else {
            console.log('Saved sub-types successfully:', data);
            present({
              message: 'Sub-type saved successfully',
              duration: 2000,
              position: 'top',
              color: 'success'
            });
            loadTypes();
          }
          setPendingSave(null);
        });
    }
  }, [pendingSave]);

  if (loading) {
    return (
      <div className="ion-text-center ion-padding">
        <IonSpinner />
      </div>
    );
  }

  return (
    <>
      <IonList>
        {types.map(type => (
          <IonItem key={type.id}>
            <IonLabel>
              <h2>{getTypeValue(type)}</h2>
              {tableName === 'group_types' && (
                <div className="ion-padding-vertical">
                  <p><strong>Sub-types:</strong></p>
                  {(type as GroupType).sub_types?.length > 0 ? (
                    <IonList>
                      {(type as GroupType).sub_types.map((st, index) => (
                        <IonItem key={st.id || index} lines="none" className="ion-no-padding">
                          <IonLabel>
                            <h3>{st.name}</h3>
                            <p>{st.description}</p>
                          </IonLabel>
                        </IonItem>
                      ))}
                    </IonList>
                  ) : (
                    <p><em>No sub-types defined</em></p>
                  )}
                </div>
              )}
            </IonLabel>
            <IonButton
              fill="clear"
              onClick={() => handleEdit(type)}
            >
              <IonIcon slot="icon-only" icon={createOutline} />
            </IonButton>
            <IonButton
              fill="clear"
              color="danger"
              onClick={() => handleDelete(type)}
            >
              <IonIcon slot="icon-only" icon={trashOutline} />
            </IonButton>
          </IonItem>
        ))}
      </IonList>

      <div className="ion-padding">
        <IonButton
          expand="block"
          onClick={handleAdd}
        >
          <IonIcon slot="start" icon={addOutline} />
          Add {title} Type
        </IonButton>
      </div>

      <IonModal isOpen={showSubTypeModal} onDidDismiss={() => setShowSubTypeModal(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{editingSubType ? 'Edit' : 'Add'} Sub-type</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowSubTypeModal(false)}>Cancel</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            <IonItem>
              <IonLabel position="stacked">Name *</IonLabel>
              <IonInput
                value={newSubTypeName}
                onIonChange={e => {
                  console.log('Name changed:', e.detail.value);
                  setNewSubTypeName(e.detail.value!)
                }}
                placeholder="Enter sub-type name"
                required
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Description *</IonLabel>
              <IonTextarea
                value={newSubTypeDescription}
                onIonInput={e => {
                  const target = e.target as HTMLIonTextareaElement;
                  console.log('Description input:', target.value);
                  setNewSubTypeDescription(target.value || '');
                }}
                placeholder="Enter sub-type description"
                rows={4}
                required
              />
            </IonItem>
          </IonList>
          <div className="ion-padding">
            <IonButton expand="block" onClick={handleSaveSubType}>
              Save Sub-type
            </IonButton>
          </div>
        </IonContent>
      </IonModal>

      <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{editingType ? 'Edit' : 'Add'} {title} Type</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowModal(false)}>Cancel</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            <IonItem>
              <IonLabel position="stacked">Type</IonLabel>
              <IonInput
                value={typeValue}
                onIonChange={e => setTypeValue(e.detail.value!)}
                placeholder="Enter type"
                required
              />
            </IonItem>
            {tableName !== 'group_types' && (
              <IonItem>
                <IonLabel position="stacked">Description</IonLabel>
                <IonTextarea
                  value={description}
                  onIonChange={e => setDescription(e.detail.value!)}
                  placeholder="Enter type description"
                  rows={4}
                  required
                />
              </IonItem>
            )}

            {tableName === 'group_types' && (
              <>
                <IonItem>
                  <IonLabel>Sub-types</IonLabel>
                </IonItem>
                <IonList>
                  {subTypes.map((subType, index) => (
                    <IonCard key={subType.id || index} className="ion-margin">
                      <IonCardHeader>
                        <IonCardTitle>{subType.name}</IonCardTitle>
                      </IonCardHeader>
                      <IonCardContent>
                        <p>{subType.description}</p>
                        <IonButton
                          fill="clear"
                          onClick={() => handleEditSubType(subType, index)}
                        >
                          <IonIcon slot="icon-only" icon={createOutline} />
                        </IonButton>
                        <IonButton
                          fill="clear"
                          color="danger"
                          onClick={() => handleDeleteSubType(index)}
                        >
                          <IonIcon slot="icon-only" icon={trashOutline} />
                        </IonButton>
                      </IonCardContent>
                    </IonCard>
                  ))}
                  <div className="ion-padding">
                    <IonButton
                      expand="block"
                      onClick={handleAddSubType}
                    >
                      <IonIcon slot="start" icon={addOutline} />
                      Add Sub-type
                    </IonButton>
                  </div>
                </IonList>
              </>
            )}
          </IonList>
          <div className="ion-padding">
            <IonButton expand="block" onClick={() => handleSave()}>
              Save
            </IonButton>
          </div>
        </IonContent>
      </IonModal>
    </>
  );
};

export default TypeList; 