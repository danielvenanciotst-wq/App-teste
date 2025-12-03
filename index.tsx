import React, { Component, ReactNode, ErrorInfo } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;
  public readonly props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("React Error Boundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center', marginTop: '50px' }}>
          <h1 style={{ color: '#e11d48' }}>Algo deu errado.</h1>
          <p style={{ color: '#4b5563' }}>Tente recarregar a página.</p>
          <details style={{ marginTop: '20px', color: '#6b7280', textAlign: 'left', display: 'inline-block', maxWidth: '600px' }}>
            <summary>Detalhes do erro</summary>
            <pre style={{ fontSize: '12px', marginTop: '10px', overflow: 'auto', background: '#f3f4f6', padding: '10px', borderRadius: '4px' }}>
              {this.state.error?.toString()}
            </pre>
          </details>
          <br />
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer', backgroundColor: '#e11d48', color: 'white', border: 'none', borderRadius: '5px' }}
          >
            Limpar Cache e Recarregar
          </button>
        </div>
      );
    }

    return this.props.children || null;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Failed to find the root element");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);