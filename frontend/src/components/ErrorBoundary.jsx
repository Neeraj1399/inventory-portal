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
 <div className="min-h-screen flex items-center justify-center bg-bg-primary p-6">
 <div className="text-center space-y-4 max-w-md">
 <AlertOctagon className="w-16 h-16 text-status-danger mx-auto" />
 <h1 className="text-2xl font-bold text-text-primary">
 Something went wrong
 </h1>
 <p className="text-text-primary0">
 The application encountered an unexpected error. Don't worry, your
 data is safe.
 </p>
 <button
 onClick={() => window.location.reload()}
 className="flex items-center gap-2 mx-auto bg-accent-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-accent-secondary transition-all"
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
