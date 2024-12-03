import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { IonCard, IonCardContent, IonButton, IonIcon } from '@ionic/react';
import { createOutline } from 'ionicons/icons';
const MarkdownViewer = ({ content, onEdit, canEdit }) => {
    return (_jsx(IonCard, { children: _jsxs(IonCardContent, { children: [canEdit && (_jsx("div", { className: "ion-text-end ion-margin-bottom", children: _jsx(IonButton, { fill: "clear", onClick: onEdit, children: _jsx(IonIcon, { slot: "icon-only", icon: createOutline }) }) })), _jsx(ReactMarkdown, { children: content || 'No description available.' })] }) }));
};
export default MarkdownViewer;
