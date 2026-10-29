import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { useStore } from '../store';

export const PaymentResultPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { clearCart } = useStore();
    const status = searchParams.get('status');
    const message = searchParams.get('message');
    const paymentId = searchParams.get('paymentId');
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (status === 'success') {
            clearCart();
        }

        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        const timeout = setTimeout(() => {
            if (status === 'success') {
                navigate('/profile');
            } else {
                navigate('/');
            }
        }, 5000);

        return () => {
            clearInterval(timer);
            clearTimeout(timeout);
        };
    }, [status, navigate, clearCart]);

    return (
        <div className="min-h-screen bg-offWhite flex items-center justify-center pt-24 pb-12 px-6">
            <div className="max-w-md w-full bg-white p-8 shadow-2xl text-center rounded-sm">

                {status === 'success' ? (
                    <>
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                            <CheckCircle size={40} />
                        </div>
                        <h1 className="font-serif text-3xl text-softBlack mb-4">Payment Successful</h1>
                        <p className="text-softBlack/70 mb-6">
                            Thank you for your order! Your payment has been processed successfully.
                            <br />
                            <span className="text-xs text-neutral-400 mt-2 block">Payment ID: {paymentId}</span>
                        </p>
                    </>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
                            <XCircle size={40} />
                        </div>
                        <h1 className="font-serif text-3xl text-softBlack mb-4">Payment Failed</h1>
                        <p className="text-softBlack/70 mb-6">
                            {message || 'An error occurred during payment processing.'}
                        </p>
                    </>
                )}

                <div className="w-full bg-neutral-100 h-1 mt-6 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-softBlack transition-all duration-1000 ease-linear"
                        style={{ width: `${(countdown / 5) * 100}%` }}
                    />
                </div>
                <p className="text-xs text-softBlack/40 mt-4 uppercase tracking-widest">
                    Redirecting in {countdown}s...
                </p>
            </div>
        </div>
    );
};

export default PaymentResultPage;
