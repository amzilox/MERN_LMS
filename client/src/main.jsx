import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router-dom";
import React from "react";
import { AppProvider } from "./context/AppContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CourseProvider } from "./context/CourseContext.jsx";
import { EnrollmentProvider } from "./context/EnrollmentContext.jsx";

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <AppProvider>
          <AuthProvider>
            <CourseProvider>
              <EnrollmentProvider>
                <App />
              </EnrollmentProvider>
            </CourseProvider>
          </AuthProvider>
        </AppProvider>
      </ClerkProvider>
    </BrowserRouter>
  </React.StrictMode>
);
