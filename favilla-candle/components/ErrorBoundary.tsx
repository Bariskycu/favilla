import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import i18n from '../i18n';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  readonly props: Props;

  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    // Basic i18n support in Class Component using the i18n instance
    const t = (key: string) => i18n.t(key) || key;

    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-offWhite flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-neutral-200 p-8 md:p-12 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <AlertTriangle size={32} />
            </div>
            <h2 className="font-serif text-3xl mb-4 text-softBlack">{t('common.errorTitle')}</h2>
            <p className="text-neutral-500 mb-8 leading-relaxed text-sm">
              {t('common.errorDesc')}
            </p>
            <div className="bg-neutral-50 p-4 mb-8 text-left overflow-hidden">
              <p className="text-xs font-mono text-red-800 break-words">
                {this.state.error?.toString()}
              </p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 bg-softBlack text-offWhite py-4 text-xs font-bold tracking-widest uppercase hover:bg-neutral-800 transition-colors"
            >
              <RefreshCcw size={16} />
              {t('common.reload')}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}