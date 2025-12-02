'use client';

import { useState } from 'react';

interface HeroDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  confirmText?: string;
  onConfirm?: () => void;
  children?: React.ReactNode;
}

export default function HeroDialog({
  isOpen,
  onClose,
  title,
  description,
  type = 'info',
  confirmText = 'OK',
  onConfirm,
  children
}: HeroDialogProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 150);
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    handleClose();
  };

  if (!isOpen && !isClosing) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500',
          icon: '🎉',
          iconBg: 'bg-green-100',
          iconBorder: 'border-green-200'
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          icon: '❌',
          iconBg: 'bg-red-100',
          iconBorder: 'border-red-200'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500',
          icon: '⚠️',
          iconBg: 'bg-yellow-100',
          iconBorder: 'border-yellow-200'
        };
      default:
        return {
          bg: 'bg-blue-500',
          icon: 'ℹ️',
          iconBg: 'bg-blue-100',
          iconBorder: 'border-blue-200'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backdropFilter: 'blur(4px)' }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={handleClose}
      />
      
      {/* Dialog */}
      <div className={`
        relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 
        transform transition-all duration-300 ease-out
        ${isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'}
      `}>
        {/* Header */}
        <div className={`${styles.bg} text-white px-6 py-4 rounded-t-2xl`}>
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${styles.iconBg} ${styles.iconBorder} border rounded-full flex items-center justify-center text-2xl`}>
              {styles.icon}
            </div>
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-gray-700 mb-4">{description}</p>
          {children}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6">
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 text-sm font-medium text-white ${styles.bg} hover:opacity-90 rounded-lg transition-opacity`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}