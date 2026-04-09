import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/common/ErrorBoundary";
import "./index.css";

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

root.render(
 <React.StrictMode>
 <ErrorBoundary>
 <App />
 </ErrorBoundary>
 </React.StrictMode>,
);
