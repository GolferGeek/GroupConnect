import React, { useState, useEffect } from 'react';
import {
  IonTextarea,
  IonButton,
  IonIcon,
  IonText,
} from '@ionic/react';
import { saveOutline, closeOutline } from 'ionicons/icons';

interface MarkdownEditorProps {
  content: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ content, onSave, onCancel }) => {
  const [value, setValue] = useState(content || '');

  useEffect(() => {
    console.log('MarkdownEditor content prop changed:', content);
    setValue(content || '');
  }, [content]);

  const handleSave = () => {
    console.log('MarkdownEditor saving value:', value);
    onSave(value || '');
  };

  return (
    <div>
      <IonTextarea
        value={value}
        onIonChange={e => {
          const newValue = e.detail.value || '';
          console.log('MarkdownEditor text changed:', newValue);
          setValue(newValue);
        }}
        placeholder="Enter description (supports Markdown)"
        rows={10}
        className="ion-margin-bottom"
      />
      <div className="ion-text-end">
        <IonButton fill="clear" onClick={onCancel}>
          <IonIcon slot="start" icon={closeOutline} />
          Cancel
        </IonButton>
        <IonButton onClick={handleSave}>
          <IonIcon slot="start" icon={saveOutline} />
          Save
        </IonButton>
      </div>
    </div>
  );
};

export default MarkdownEditor; 