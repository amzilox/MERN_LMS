/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY || "$";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const cloudinaryName = import.meta.env.VITE_CLOUDINARY_NAME;
  const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const value = {
    currency,
    backendUrl,
    cloudinaryName,
    cloudinaryUploadPreset,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppConfig = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppConfig must be used within AppProvider");
  }
  return context;
};
