import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { IonCard, IonCardContent, IonTextarea, IonButton, IonButtons, IonIcon, IonCardHeader, IonCardTitle, IonToolbar, } from '@ionic/react';
import { checkmarkOutline, closeOutline } from 'ionicons/icons';
const MarkdownEditor = ({ content, onSave, onCancel, }) => {
    const [value, setValue] = useState(content);
    return (_jsxs(IonCard, { children: [_jsx(IonCardHeader, { children: _jsxs(IonToolbar, { children: [_jsx(IonCardTitle, { children: "Edit Description" }), _jsxs(IonButtons, { slot: "end", children: [_jsxs(IonButton, { onClick: () => onSave(value), color: "success", children: [_jsx(IonIcon, { slot: "start", icon: checkmarkOutline }), "Save"] }), _jsxs(IonButton, { onClick: onCancel, color: "medium", children: [_jsx(IonIcon, { slot: "start", icon: closeOutline }), "Cancel"] })] })] }) }), _jsxs(IonCardContent, { children: [_jsx(IonTextarea, { value: value, onIonChange: e => setValue(e.detail.value), rows: 10, placeholder: "Enter markdown content...", className: "ion-margin-bottom" }), _jsx("div", { className: "ion-padding-top ion-text-end", children: _jsx(IonButton, { fill: "clear", size: "small", color: "medium", children: "Markdown supported" }) })] })] }));
};
export default MarkdownEditor;
