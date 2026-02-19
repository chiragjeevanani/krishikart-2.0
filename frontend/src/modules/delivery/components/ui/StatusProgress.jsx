import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const StatusProgress = ({ currentStatus }) => {
    const steps = [
        { id: 'Dispatched', label: 'Accepted' },
        { id: 'Delivered', label: 'Delivered' },
    ];

    const currentIndex = steps.findIndex(s => s.id === currentStatus);

    return (
        <div className="flex justify-between items-center w-full px-4 py-6">
            {steps.map((step, index) => {
                const isCompleted = index < currentIndex;
                const isActive = index === currentIndex;

                return (
                    <div key={step.id} className="flex flex-col items-center relative flex-1">
                        {/* Line Connectors */}
                        {index < steps.length - 1 && (
                            <div className="absolute left-[50%] right-[-50%] top-4 h-[2px] bg-muted z-0">
                                <motion.div
                                    initial={{ width: '0%' }}
                                    animate={{ width: isCompleted ? '100%' : '0%' }}
                                    className="h-full bg-primary"
                                />
                            </div>
                        )}

                        {/* Step Circle */}
                        <motion.div
                            initial={false}
                            animate={{
                                backgroundColor: isCompleted || isActive ? 'var(--color-primary)' : 'var(--color-muted)',
                                scale: isActive ? 1.2 : 1,
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-4 ${isActive ? 'border-primary/20 shadow-lg shadow-primary/30' : 'border-white'}`}
                        >
                            <AnimatePresence mode="wait">
                                {isCompleted ? (
                                    <motion.div
                                        key="checked"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                    >
                                        <Check className="w-4 h-4 text-white font-bold" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="number"
                                        className={`text-xs font-bold ${isActive ? 'text-white' : 'text-muted-foreground'}`}
                                    >
                                        {index + 1}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        <span className={`text-[10px] font-bold mt-2 uppercase tracking-tight ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default StatusProgress;
