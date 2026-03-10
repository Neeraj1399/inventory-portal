import React from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="text-center space-y-4 max-w-md">
            <AlertOctagon className="w-16 h-16 text-red-500 mx-auto" />
            <h1 className="text-2xl font-bold text-slate-900">
              Something went wrong
            </h1>
            <p className="text-slate-500">
              The application encountered an unexpected error. Don't worry, your
              data is safe.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 mx-auto bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all"
            >
              <RefreshCw size={18} /> Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
