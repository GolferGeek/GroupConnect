import React from 'react';
import ReactMarkdown from 'react-markdown';
import { IonCard, IonCardContent, IonButton, IonIcon } from '@ionic/react';
import { createOutline } from 'ionicons/icons';

interface MarkdownViewerProps {
  content: string;
  onEdit?: () => void;
  canEdit?: boolean;
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content, onEdit, canEdit }) => {
  return (
    <IonCard>
      <IonCardContent>
        {canEdit && (
          <div className="ion-text-end ion-margin-bottom">
            <IonButton fill="clear" onClick={onEdit}>
              <IonIcon slot="icon-only" icon={createOutline} />
            </IonButton>
          </div>
        )}
        <ReactMarkdown>{content || 'No description available.'}</ReactMarkdown>
      </IonCardContent>
    </IonCard>
  );
};

export default MarkdownViewer; 