import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
test('renders without crashing', () => {
    const { baseElement } = render(_jsx(App, {}));
    expect(baseElement).toBeDefined();
});
