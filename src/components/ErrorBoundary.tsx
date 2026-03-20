import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'Something went wrong.';
      try {
        const parsedError = JSON.parse(this.state.error?.message || '{}');
        if (parsedError.error) {
          errorMessage = `Firestore Error: ${parsedError.error} (Operation: ${parsedError.operationType})`;
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-4xl font-bold mb-4 text-red-500">Application Error</h1>
          <p className="text-white/60 mb-8 max-w-md">{errorMessage}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold hover:bg-white/20 transition-all"
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
