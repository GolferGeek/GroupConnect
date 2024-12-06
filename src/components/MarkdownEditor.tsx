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
  const [text, setText] = useState(content || '# Group Description');

  useEffect(() => {
    setText(content || '# Group Description');
  }, [content]);

  const handleChange = (event: CustomEvent) => {
    const newValue = event.detail.value || '';
    console.log('Text changed:', { old: text, new: newValue });
    setText(newValue);
  };

  const handleSave = () => {
    const trimmedValue = text.trim();
    console.log('Saving text:', { original: text, trimmed: trimmedValue });
    onSave(trimmedValue || '# Group Description');
  };

  return (
    <div>
      <IonTextarea
        value={text}
        onIonInput={handleChange}
        placeholder="Enter description (supports Markdown)"
        rows={10}
        className="ion-margin-bottom"
        autoGrow={true}
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