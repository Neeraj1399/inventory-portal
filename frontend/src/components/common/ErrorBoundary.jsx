import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("❌ CRITICAL UI CRASH CAUGHT BY BOUNDARY:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-8 relative overflow-hidden select-none">
          {/* Background Ambience */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-status-danger/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-primary/10 rounded-full blur-[120px] animate-pulse delay-700" />

          <div className="max-w-md w-full bg-bg-secondary/40 backdrop-blur-2xl border border-border rounded-[3rem] p-12 text-center shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative mx-auto w-24 h-24 mb-10">
              <div className="absolute inset-0 bg-status-danger/20 rounded-full blur-[40px] animate-pulse" />
              <div className="relative bg-bg-elevated border border-border w-full h-full rounded-3xl flex items-center justify-center text-status-danger shadow-inner">
                <AlertTriangle size={40} />
              </div>
            </div>
            
            <h1 className="text-3xl font-black text-text-primary mb-3 tracking-tight">
              System Trace Error
            </h1>
            <p className="text-text-muted text-[10px] uppercase font-black tracking-[0.2em] mb-10 opacity-60">
              Critical UI Sequence Interrupted
            </p>
            
            <p className="text-text-secondary text-sm font-medium leading-relaxed mb-12 opacity-80 px-4">
              The application encountered an unexpected interrupt in the rendering loop. Your data persistence remains unaffected.
            </p>

            <div className="flex flex-col gap-4">
              <button
                onClick={this.handleReload}
                className="w-full h-14 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-glow active:scale-[0.97] flex items-center justify-center gap-3 group"
              >
                <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-700" />
                Initialize Reload
              </button>
              
              <button
                onClick={this.handleReset}
                className="w-full h-14 bg-bg-elevated hover:bg-bg-tertiary text-text-muted rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border border-border active:scale-[0.97] flex items-center justify-center gap-3 group"
              >
                <Home size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                Dashboard Vector
              </button>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mt-12 pt-8 border-t border-border text-left">
                <p className="text-[10px] font-black text-text-disabled uppercase tracking-widest mb-4 opacity-40">Debug Trace Segment</p>
                <div className="text-[11px] font-mono text-status-danger/80 break-all bg-bg-elevated/80 p-6 rounded-2xl border border-status-danger/10 max-h-40 overflow-y-auto custom-scrollbar leading-relaxed">
                  {this.state.error.toString()}
                </div>
              </div>
            )}
          </div>

          <p className="mt-12 text-text-disabled text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
            &copy; {new Date().getFullYear()} Athiva Systems • Neural Mesh Error Handler
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
