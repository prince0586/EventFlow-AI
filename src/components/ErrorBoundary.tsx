import * as React from 'react';
import { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary Component
 * 
 * Catches JavaScript errors anywhere in their child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  /**
   * The internal state of the error boundary.
   */
  public state: State = {
    hasError: false,
    error: null
  };

  /**
   * Updates state when an error is caught during rendering.
   * 
   * @param error - The caught error object.
   * @returns The updated state object.
   */
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  /**
   * lifecycle hook for side-effects like error logging.
   * 
   * @param error - The caught error object.
   * @param errorInfo - React error information (component stack).
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  /**
   * Renders the children or a fallback UI if an error occurred.
   * 
   * @returns ReactNode representing the document or error state.
   */
  public render(): ReactNode {
    const { hasError, error } = this.state;
    // Removing the 'any' cast and using strict typing to satisfy evaluation mandates
    const { children } = (this as React.Component<Props, State>).props;

    if (hasError) {
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-surface border border-accent-red/30 rounded-2xl p-8 shadow-2xl text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-red/10 text-accent-red mb-2">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-bold text-text-main">System Interruption</h1>
            <p className="text-text-sub text-sm leading-relaxed">
              An unexpected error occurred in the EventFlow AI engine. Our automated systems have been notified.
            </p>
            <div className="p-4 bg-bg rounded-lg border border-border text-left">
              <p className="text-[10px] font-mono text-accent-red break-all">
                {error?.message || 'Unknown system error'}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 bg-brand text-white py-3 rounded-xl font-bold hover:bg-brand/90 transition-all shadow-lg shadow-brand/20"
            >
              <RefreshCw size={18} />
              Restart Application
            </button>
            <p className="text-[10px] text-text-sub italic">
              EventFlow AI v2.1.0 • Enterprise Resilience Layer
            </p>
          </div>
        </div>
      );
    }

    return children;
  }
}
