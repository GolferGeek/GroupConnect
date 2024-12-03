import React, { useState } from 'react';
import {
  IonCard,
  IonCardContent,
  IonTextarea,
  IonButton,
  IonButtons,
  IonIcon,
  IonCardHeader,
  IonCardTitle,
  IonToolbar,
} from '@ionic/react';
import { checkmarkOutline, closeOutline } from 'ionicons/icons';

interface MarkdownEditorProps {
  content: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  content,
  onSave,
  onCancel,
}) => {
  const [value, setValue] = useState(content);

  return (
    <IonCard>
      <IonCardHeader>
        <IonToolbar>
          <IonCardTitle>Edit Description</IonCardTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => onSave(value)} color="success">
              <IonIcon slot="start" icon={checkmarkOutline} />
              Save
            </IonButton>
            <IonButton onClick={onCancel} color="medium">
              <IonIcon slot="start" icon={closeOutline} />
              Cancel
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonCardHeader>
      <IonCardContent>
        <IonTextarea
          value={value}
          onIonChange={e => setValue(e.detail.value!)}
          rows={10}
          placeholder="Enter markdown content..."
          className="ion-margin-bottom"
        />
        <div className="ion-padding-top ion-text-end">
          <IonButton fill="clear" size="small" color="medium">
            Markdown supported
          </IonButton>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default MarkdownEditor; 