import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public props: ErrorBoundaryProps;
  public state: ErrorBoundaryState;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetStorage = () => {
    if (window.confirm('Deseja limpar o armazenamento local para restaurar o sistema? Seus dados voltarão ao estado padrão.')) {
      try {
        localStorage.clear();
      } catch (e) {
        console.error('Error clearing localStorage', e);
      }
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-6">
            <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-10 h-10 animate-bounce" />
            </div>

            <div>
              <h2 className="text-xl font-black text-white">Oops! Ocorreu um imprevisto</h2>
              <p className="text-sm text-slate-400 mt-2">
                O aplicativo encontrou um erro e foi pausado para proteger seus dados.
              </p>
              {this.state.error && (
                <div className="mt-3 p-3 bg-slate-950 rounded-xl text-left font-mono text-[11px] text-red-400 max-h-28 overflow-y-auto border border-red-500/20">
                  {this.state.error.message || String(this.state.error)}
                </div>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-950/50 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recarregar Aplicativo</span>
              </button>

              <button
                onClick={this.handleResetStorage}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Restaurar Dados Padrão (Limpar Cache)</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
