import React from 'react';
import { useForm } from '@/contexts/FormContext';
import FormStep1Identifiers from './FormStep1Identifiers';
import FormStep2Documents from './FormStep2Documents';
import FormStep3Pricing from './FormStep3Pricing';
import FormStep4Review from './FormStep4Review';

interface ServiceCheckSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ServiceCheckSheet({ isOpen, onClose }: ServiceCheckSheetProps) {
  const { state, setStep, resetForm } = useForm();
  const { step } = state;

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/30 z-40"
      />

      {/* Sheet */}
      <div className="fixed right-0 top-0 bottom-0 w-full md:w-[400px] bg-white shadow-lg z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-primary">
              Step {step} of 4
            </h2>
            <button
              onClick={handleClose}
              className="text-2xl text-text-secondary hover:text-primary"
            >
              ✕
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && <FormStep1Identifiers />}
          {step === 2 && <FormStep2Documents />}
          {step === 3 && <FormStep3Pricing />}
          {step === 4 && <FormStep4Review />}
        </div>
      </div>
    </>
  );
}
