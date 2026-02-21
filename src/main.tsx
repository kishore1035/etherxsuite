
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Import export system tests (available in console)
// Temporarily disabled - uncomment after fixing TypeScript errors
// import './tests/exportSystemTest';

createRoot(document.getElementById("root")!).render(<App />);