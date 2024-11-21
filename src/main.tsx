import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Ensure we only initialize once
const rootElement = document.getElementById('react-sales-wizard');
if (!rootElement?.hasAttribute('data-react-initialized')) {
	rootElement?.setAttribute('data-react-initialized', 'true');
	const root = createRoot(rootElement!);
	root.render(
		<React.StrictMode>
			<App />
		</React.StrictMode>
	);
}
