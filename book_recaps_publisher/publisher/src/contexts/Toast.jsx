import { createContext, useContext, useRef } from "react";
import { Toast } from "primereact/toast";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const toast = useRef(null);

  const showToast = ({ severity, summary, detail }) => {
    toast.current.show({ severity, summary, detail, life: 3000 });
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      <Toast ref={toast} position="top-right"/>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
