import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';

const WalletContext = createContext();

export function WalletProvider({ children }) {
    const [balance, setBalance] = useState(0);
    const [loyaltyPoints, setLoyaltyPoints] = useState(0);
    const [creditLimit, setCreditLimit] = useState(0);
    const [creditUsed, setCreditUsed] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loyaltyConfig, setLoyaltyConfig] = useState({
        awardRate: 5, // 5% of order value
        redemptionRate: 10, // 10 points = ₹1
        minRedeemPoints: 100
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        const token = localStorage.getItem('userToken');
        const path = window.location.pathname;

        // Skip if on auth pages or in other modules
        if (!token ||
            ['/', '/login', '/verification'].includes(path) ||
            path.includes('/masteradmin') ||
            path.includes('/franchise') ||
            path.includes('/vendor') ||
            path.includes('/delivery')
        ) {
            return;
        }

        setIsLoading(true);
        try {
            try {
                const settingsRes = await api.get('/masteradmin/public-settings');
                const settings = settingsRes.data?.results || settingsRes.data?.result || [];
                const loyaltySetting = Array.isArray(settings)
                    ? settings.find((s) => s.key === 'loyalty_config')
                    : null;
                if (loyaltySetting?.value && typeof loyaltySetting.value === 'object') {
                    setLoyaltyConfig((prev) => ({
                        ...prev,
                        ...loyaltySetting.value,
                    }));
                }
            } catch (settingsError) {
                console.error('Failed to fetch loyalty config:', settingsError);
            }

            const response = await api.get('/user/me');
            if (response.data && response.data.result) {
                const user = response.data.result;
                setBalance(user.walletBalance || 0);
                setCreditLimit(user.creditLimit || 0);
                setCreditUsed(user.usedCredit || 0);
                setLoyaltyPoints(user.loyaltyPoints || 0);
                const txns = (user.walletTransactions || []).map((txn, idx) => ({
                    id: txn.txnId || `TXN-${idx}`,
                    type: txn.type || 'Added',
                    amount: Number(txn.amount || 0),
                    date: txn.createdAt
                        ? new Date(txn.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'N/A',
                    status: txn.status || 'Success'
                }));
                setTransactions(txns);
            }
        } catch (error) {
            console.error('Failed to fetch wallet data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateLoyaltyConfig = (newConfig) => {
        setLoyaltyConfig(prev => ({ ...prev, ...newConfig }));
    };

    const addLoyaltyPoints = (points) => {
        setLoyaltyPoints(prev => prev + points);
        const newTxn = {
            id: `LYT-${Math.floor(1000 + Math.random() * 9000)}`,
            type: 'Loyalty Bonus',
            amount: points,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: 'Success'
        };
        setTransactions(prev => [newTxn, ...prev]);
    };

    const redeemLoyaltyPoints = async (points) => {
        try {
            const response = await api.post('/user/wallet/redeem-loyalty', { points });
            if (response.data?.success) {
                syncWalletFromUser(response.data.result || {});
                return true;
            }
            return false;
        } catch (error) {
            console.error('Redeem loyalty points failed:', error);
            return false;
        }
    };

    const syncWalletFromUser = (user) => {
        setBalance(user.walletBalance || 0);
        setCreditLimit(user.creditLimit || 0);
        setCreditUsed(user.usedCredit || 0);
        setLoyaltyPoints(user.loyaltyPoints || 0);
        const txns = (user.walletTransactions || []).map((txn, idx) => ({
            id: txn.txnId || `TXN-${idx}`,
            type: txn.type || 'Added',
            amount: Number(txn.amount || 0),
            date: txn.createdAt
                ? new Date(txn.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'N/A',
            status: txn.status || 'Success'
        }));
        setTransactions(txns);
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const addMoney = async (amount) => {
        try {
            const value = Number(amount || 0);
            if (!Number.isFinite(value) || value <= 0) return { success: false, message: 'Invalid amount' };

            const sdkLoaded = await loadRazorpay();
            if (!sdkLoaded) {
                console.error('Razorpay SDK failed to load');
                return { success: false, message: 'Razorpay SDK failed to load' };
            }

            const createRes = await api.post('/user/wallet/recharge/create-order', { amount: value });
            if (!createRes.data?.success || !createRes.data?.result?.id) {
                return { success: false, message: createRes.data?.message || 'Failed to create recharge order' };
            }
            const order = createRes.data.result;

            let prefill = {};
            try {
                const meRes = await api.get('/user/me');
                const me = meRes.data?.result || {};
                prefill = {
                    name: me.fullName || '',
                    email: me.email || '',
                    contact: me.mobile || ''
                };
            } catch (err) {
                console.error('Failed to load user prefill details for Razorpay', err);
            }

            return await new Promise((resolve) => {
                const paymentObject = new window.Razorpay({
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                    amount: order.amount,
                    currency: order.currency || 'INR',
                    name: 'KrishiKart',
                    description: 'Wallet Recharge',
                    order_id: order.id,
                    prefill,
                    theme: { color: '#00b894' },
                    handler: async (response) => {
                        try {
                            const verifyRes = await api.post('/user/wallet/recharge/verify', response);
                            if (verifyRes.data?.success) {
                                syncWalletFromUser(verifyRes.data.result || {});
                                resolve({ success: true, message: verifyRes.data?.message || 'Wallet recharged successfully' });
                                return;
                            }
                            resolve({ success: false, message: verifyRes.data?.message || 'Payment verification failed' });
                        } catch (verifyError) {
                            console.error('Wallet recharge verify failed:', verifyError);
                            resolve({ success: false, message: verifyError?.response?.data?.message || 'Payment verification failed' });
                        }
                    },
                    modal: {
                        ondismiss: () => resolve({ success: false, message: 'Payment cancelled' })
                    }
                });
                paymentObject.open();
            });
        } catch (error) {
            console.error('Wallet recharge failed:', error);
            return { success: false, message: error?.response?.data?.message || 'Wallet recharge failed' };
        }
    };

    const payWithWallet = (amount) => {
        if (balance >= amount) {
            const newTxn = {
                id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
                type: 'Paid',
                amount: amount,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                status: 'Success'
            };
            setBalance(prev => prev - amount);
            setTransactions(prev => [newTxn, ...prev]);
            return true;
        }
        return false;
    };

    const availableCredit = Math.max(0, creditLimit - creditUsed);

    return (
        <WalletContext.Provider value={{
            balance,
            transactions,
            addMoney,
            payWithWallet,
            creditLimit,
            creditUsed,
            availableCredit,
            loyaltyPoints,
            addLoyaltyPoints,
            redeemLoyaltyPoints,
            loyaltyConfig,
            updateLoyaltyConfig,
            fetchWalletData,
            isLoading
        }}>
            {children}
        </WalletContext.Provider >
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
}
