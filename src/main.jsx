import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './presentation/routes/Router.jsx';
import './index.css';
import './presentation/styles/print.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>
);
