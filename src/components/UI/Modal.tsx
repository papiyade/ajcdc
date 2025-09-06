import React, { useEffect } from 'react';
import { clsx } from 'clsx';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true
}: ModalProps) {
  // Gestion de l'échappement
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Gestion du scroll du body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0"
        onClick={handleOverlayClick}
      >
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
        />

        {/* Modal */}
        <div
          className={clsx(
            'relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all',
            'w-full',
            sizeClasses[size],
            'animate-slide-up'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                icon={<X />}
                aria-label="Fermer"
              />
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger',
  loading = false
}: ConfirmModalProps) {
  const variantConfig = {
    danger: {
      icon: '⚠️',
      confirmVariant: 'danger' as const,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600'
    },
    warning: {
      icon: '⚠️',
      confirmVariant: 'warning' as const,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    info: {
      icon: 'ℹ️',
      confirmVariant: 'info' as const,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    }
  };

  const config = variantConfig[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      showCloseButton={false}
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
    >
      <div className="flex items-start space-x-4">
        <div className={clsx(
          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
          config.iconBg
        )}>
          <span className={clsx('text-lg', config.iconColor)}>
            {config.icon}
          </span>
        </div>
        
        <div className="flex-1">
          <p className="text-sm text-gray-700 mb-6">
            {message}
          </p>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              {cancelText}
            </Button>
            <Button
              variant={config.confirmVariant}
              onClick={onConfirm}
              loading={loading}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: (event: React.FormEvent) => void;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  submitDisabled?: boolean;
}

export function FormModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = 'Enregistrer',
  cancelText = 'Annuler',
  loading = false,
  size = 'md',
  submitDisabled = false
}: FormModalProps) {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (onSubmit && !loading && !submitDisabled) {
      onSubmit(event);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {children}
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          {onSubmit && (
            <Button
              type="submit"
              loading={loading}
              disabled={submitDisabled}
            >
              {submitText}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}

