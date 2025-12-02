import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';

const OnboardingTour = ({ isOpen, onClose, steps = [] }) => {
  const [currentStep, setCurrentStep] = React.useState(0);

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Tour Step */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="max-w-2xl w-full">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="card p-8 relative"
              >
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={24} className="text-slate-600" />
                </button>

                {/* Step Number */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white text-sm font-bold">
                      {currentStep + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      Étape {currentStep + 1} sur {steps.length}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="mb-6">
                  {currentStepData?.icon && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-primary-100 to-accent-100"
                    >
                      <span className="text-3xl">{currentStepData.icon}</span>
                    </motion.div>
                  )}

                  <h2 className="text-2xl font-bold text-slate-900 mb-3">
                    {currentStepData?.title}
                  </h2>
                  <p className="text-slate-600 mb-4">
                    {currentStepData?.description}
                  </p>

                  {currentStepData?.tips && (
                    <div className="bg-blue-50 border-l-4 border-primary-500 p-4 rounded-r-lg">
                      <p className="text-sm font-semibold text-primary-700 mb-2">💡 Conseil:</p>
                      <p className="text-sm text-slate-600">{currentStepData.tips}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="btn btn-outline flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={18} />
                    Précédent
                  </button>

                  <div className="flex items-center gap-1">
                    {steps.map((_, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => setCurrentStep(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === currentStep
                            ? 'w-8 bg-primary-600'
                            : idx < currentStep
                            ? 'bg-primary-400'
                            : 'bg-slate-300'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNext}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    {currentStep === steps.length - 1 ? (
                      <>
                        <Check size={18} />
                        Commencer
                      </>
                    ) : (
                      <>
                        Suivant
                        <ChevronRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OnboardingTour;
