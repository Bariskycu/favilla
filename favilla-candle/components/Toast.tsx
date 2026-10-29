import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useStore } from '../store';

export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useStore();

    return (
        // Changed bottom-6 to top-24 to position it below the navbar
        <div className="fixed top-24 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {toasts.map(toast => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 50, scale: 0.9 }}
                        className="pointer-events-auto min-w-[300px] bg-white border border-neutral-100 shadow-xl p-4 flex items-center gap-3 rounded-sm overflow-hidden relative"
                    >
                        {/* Status Bar */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                            toast.type === 'success' ? 'bg-green-500' : 
                            toast.type === 'error' ? 'bg-red-500' : 'bg-softBlack'
                        }`} />

                        <div className={`
                            ${toast.type === 'success' ? 'text-green-600' : 
                              toast.type === 'error' ? 'text-red-500' : 'text-softBlack'}
                        `}>
                            {toast.type === 'success' ? <CheckCircle size={20} /> : 
                             toast.type === 'error' ? <AlertCircle size={20} /> : <Info size={20} />}
                        </div>
                        
                        <p className="flex-1 text-sm font-medium text-softBlack pr-4">
                            {toast.message}
                        </p>

                        <button 
                            onClick={() => removeToast(toast.id)}
                            className="text-neutral-300 hover:text-softBlack transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};