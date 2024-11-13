import { AnimatePresence } from 'framer-motion';
import { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidV4 } from 'uuid';

import { Toast } from '.';

interface ToastContextType {
  showToast: (message: string) => void;
}

interface ToastData {
  id: string;
  message: string;
  duration: number;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = (message: string, duration = 3000) => {
    const id = uuidV4();
    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        duration,
      },
    ]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-10 translate-x-1/2 right-1/2">
        <AnimatePresence>
          {toasts.map(({ id, message, duration }) => (
            <Toast
              key={id}
              message={message}
              duration={duration}
              onDismiss={() => dismissToast(id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
