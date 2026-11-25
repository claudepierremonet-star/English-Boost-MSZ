import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './theme/ThemeContext';
import { ReadingModeProvider } from './context/ReadingModeContext';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error?.message || 'Erreur inattendue' };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Application render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0c1322] text-[#dce2f8] flex flex-col items-center justify-center p-6 text-center gap-4">
          <span className="material-symbols-outlined text-5xl text-[#f2ca50]">error_outline</span>
          <h1 className="font-serif text-2xl font-bold text-[#f2ca50]">
            Une interruption est survenue
          </h1>
          <p className="text-sm text-[#d0c5af] max-w-md">
            L’application a rencontré une erreur d’affichage. Vos progrès locaux sont préservés.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-[#f2ca50] text-[#3c2f00] font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-[#ffe088] transition-colors"
          >
            Recharger l’application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <ThemeProvider>
      <ReadingModeProvider>
        <App />
      </ReadingModeProvider>
    </ThemeProvider>
  </AppErrorBoundary>
);
