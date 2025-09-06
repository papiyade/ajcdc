import React, { useEffect } from 'react';
import { clsx } from 'clsx';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { ToastMessage } from '../../types';
import { useToast } from '../../contexts/AppContext';

interface ToastProps {
  toast: ToastMessage;
}

function Toast({ toast }: ToastProps) {
  const { removeToast } = useToast();

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, removeToast]);

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-400',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-400',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-400',
      titleColor: 'text-yellow-800',
      messageColor: 'text-yellow-700'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-400',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-700'
    }
  };

  const config = typeConfig[toast.type];
  const Icon = config.icon;

  return (
    <div
      className={clsx(
        'max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden',
        'animate-slide-down',
        config.bgColor,
        config.borderColor,
        'border'
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={clsx('h-6 w-6', config.iconColor)} />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className={clsx('text-sm font-medium', config.titleColor)}>
              {toast.title}
            </p>
            {toast.message && (
              <p className={clsx('mt-1 text-sm', config.messageColor)}>
                {toast.message}
              </p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={clsx(
                'rounded-md inline-flex text-gray-400 hover:text-gray-500',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
              )}
              onClick={() => removeToast(toast.id)}
            >
              <span className="sr-only">Fermer</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </div>
    </div>
  );
}

