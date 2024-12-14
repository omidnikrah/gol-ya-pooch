import { AnimatePresence } from 'framer-motion';
import { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidV4 } from 'uuid';

import { Toast } from '.';

interface ToastContextType {
  showToast: (
    message: string,
    duration?: number,
    keepAlive?: boolean,
    toastName?: string,
  ) => string;
  dismissToast: (id: string) => void;
  dismissToastByName: (toastName: string) => void;
  setToastId: (key: string, id: string) => void;
  getToastId: (key: string) => string;
}

interface ToastData {
  id: string;
  message: string;
  duration?: number;
  keepAlive?: boolean;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [toastIds, setToastIds] = useState<Record<string, string>>({});

  const showToast = (
    message: string,
    duration = 3000,
    keepAlive = false,
    toastName: string | undefined,
  ) => {
    const id = uuidV4();

    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        duration,
        keepAlive,
      },
    ]);

    if (!keepAlive) {
      setTimeout(() => dismissToast(id), duration);
    }

    if (toastName) {
      setToastId(toastName, id);
    }

    return id;
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const dismissToastByName = (toastName: string) => {
    const toastId = getToastId(toastName);

    setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
  };

  const setToastId = (key: string, id: string) => {
    setToastIds((prev) => ({
      ...prev,
      [key]: id,
    }));
  };

  const getToastId = (key: string) => {
    const { [key]: toastId, ...rest } = toastIds;
    setToastIds(rest);
    return toastId;
  };

  return (
    <ToastContext.Provider
      value={{
        showToast,
        dismissToast,
        dismissToastByName,
        setToastId,
        getToastId,
      }}
    >
      {children}
      <div className="fixed bottom-10 translate-x-1/2 right-1/2">
        <AnimatePresence>
          {toasts.map(({ id, message }) => (
            <Toast key={id} message={message} />
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
