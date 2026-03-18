import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Bell, ArrowRight, Package } from 'lucide-react';
import { useFranchiseOrders } from '../../contexts/FranchiseOrdersContext';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';

const NewOrderAlert = () => {
    const {
        isAlertOpen,
        setIsAlertOpen,
        newOrderData,
        acceptOrder,
        updateOrderStatus,
        refreshOrders,
    } = useFranchiseOrders();
    const navigate = useNavigate();

    if (!isAlertOpen || !newOrderData) return null;

    const orderId = useMemo(() => {
        return newOrderData.orderId || newOrderData._id || newOrderData.id || null;
    }, [newOrderData]);

    const [orderDetail, setOrderDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        if (!isAlertOpen || !orderId) return;
        let cancelled = false;
        setDetailLoading(true);
        api
            .get(`/orders/franchise/${orderId}`)
            .then((res) => {
                if (cancelled) return;
                if (res.data?.success) setOrderDetail(res.data.result);
                else setOrderDetail(null);
            })
            .catch(() => {
                if (cancelled) return;
                setOrderDetail(null);
            })
            .finally(() => {
                if (cancelled) return;
                setDetailLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [isAlertOpen, orderId]);

    const statusNormalized = (orderDetail?.orderStatus || newOrderData?.orderStatus || '').toString().toLowerCase();
    const canAccept = ['assigned', 'placed', 'pending', 'new'].includes(statusNormalized);
    const canReject = statusNormalized !== 'cancelled';

    const hotelName =
        orderDetail?.userId?.legalEntityName ||
        orderDetail?.userId?.fullName ||
        orderDetail?.user?.legalEntityName ||
        orderDetail?.user?.fullName ||
        newOrderData?.hotelName ||
        'Guest User';

    const totalAmount = orderDetail?.totalAmount ?? orderDetail?.total ?? newOrderData?.totalAmount ?? 0;
    const items = orderDetail?.items || newOrderData?.items || [];

    const onAccept = async () => {
        if (!orderId) return;
        const ok = await acceptOrder(orderId);
        if (!ok) return;
        setIsAlertOpen(false);
        refreshOrders?.();
    };

    const onReject = async () => {
        if (!orderId) return;
        // Cancel is the supported "reject" workflow for orders in this portal.
        const ok = await updateOrderStatus(orderId, 'Cancelled');
        if (!ok) return;
        setIsAlertOpen(false);
        refreshOrders?.();
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsAlertOpen(false)}
                    className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 40 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 40 }}
                    className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20"
                >
                    {/* Top Accent Bar */}
                    <div className="h-3 bg-emerald-500 w-full animate-pulse" />

                    <div className="p-10">
                        {/* Header Area */}
                        <div className="flex justify-between items-start mb-8">
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20" />
                                <div className="relative bg-emerald-50 p-6 rounded-2xl">
                                    <Bell className="text-emerald-600 w-10 h-10 animate-bounce" />
                                </div>
                            </div>
                            <button
                                onClick={() => setIsAlertOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Title & Description */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                                New Order Assigned!
                            </h2>
                            <p className="text-slate-500 font-bold text-lg leading-relaxed">
                                A new order has been auto-assigned to your franchise. Please accept it immediately to start processing.
                            </p>
                        </div>

                        {/* Order Details Card */}
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-white p-3 rounded-xl shadow-sm">
                                    <ShoppingBag className="text-slate-900 w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Reference</p>
                                    <p className="text-xl font-black text-slate-900">
                                        #{orderId ? orderId.toString().slice(-6).toUpperCase() : '---'}
                                    </p>
                                </div>
                            </div>

                            <div className="h-px bg-slate-200 w-full my-4" />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Store / Hotel</span>
                                    <span className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">{hotelName}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</span>
                                    <span className="text-sm font-bold text-slate-900 mt-1">₹{Number(totalAmount || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Items</span>
                                    <span className="text-sm font-bold text-slate-900 mt-1">{Array.isArray(items) ? items.length : 0}</span>
                                </div>
                            </div>

                            {Array.isArray(items) && items.length > 0 && (
                                <div className="mt-4">
                                    <div className="h-px bg-slate-200 w-full mb-3" />
                                    <div className="space-y-2">
                                        {items.slice(0, 3).map((it, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                                                <span className="line-clamp-1">{it.name || it.productName || 'Item'}</span>
                                                <span className="text-slate-900">{it.quantity ?? it.qty ?? 0}</span>
                                            </div>
                                        ))}
                                        {items.length > 3 && (
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                +{items.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                                        Status: {statusNormalized ? statusNormalized : 'auto-assigned'}
                                    </span>
                                </div>
                                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">Priority</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setIsAlertOpen(false)}
                                className="h-16 px-6 rounded-2xl border-2 border-slate-100 text-slate-500 font-black uppercase text-xs tracking-widest hover:bg-slate-50 hover:border-slate-200 transition-all"
                            >
                                Not Now
                            </button>
                            <button
                                onClick={onAccept}
                                disabled={!canAccept || detailLoading}
                                className="h-16 px-6 rounded-2xl bg-slate-900 text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:hover:scale-[1]"
                            >
                                {detailLoading ? 'Loading...' : canAccept ? 'Accept' : 'Already Accepted'}
                            </button>
                            <button
                                onClick={onReject}
                                disabled={!canReject || detailLoading}
                                className="h-16 px-6 rounded-2xl bg-rose-600 text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-rose-200 hover:bg-rose-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:hover:scale-[1]"
                            >
                                {detailLoading ? 'Loading...' : canReject ? 'Reject' : 'Already Cancelled'}
                            </button>
                            <button
                                onClick={() => {
                                    setIsAlertOpen(false);
                                    navigate(`/franchise/orders`);
                                }}
                                className="h-16 px-6 rounded-2xl border-2 border-slate-100 text-slate-700 font-black uppercase text-xs tracking-[0.2em] hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center gap-3"
                            >
                                View Order
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="bg-slate-900 py-4 px-8 flex items-center justify-center gap-2">
                        <Package size={14} className="text-emerald-400" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-[0.3em]">Kisaankart Logistic Engine</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default NewOrderAlert;
