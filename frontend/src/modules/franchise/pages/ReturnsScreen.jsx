import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Undo2, CheckCircle2, XCircle, Truck } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';
import { useFranchiseOrders } from '../contexts/FranchiseOrdersContext';

const statusStyles = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    pickup_assigned: 'bg-blue-50 text-blue-700 border-blue-200',
    picked_up: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    completed: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function ReturnsScreen() {
    const { deliveryPartners, refreshPartners } = useFranchiseOrders();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [reviewReasons, setReviewReasons] = useState({});
    const [processingKey, setProcessingKey] = useState('');

    const fetchReturns = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const response = await api.get('/orders/franchise/returns/all');
            if (response.data.success) {
                setOrders(response.data.results || response.data.result || []);
            }
        } catch (error) {
            console.error('Fetch franchise returns error:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch return requests');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchReturns();
        if (!deliveryPartners?.length) refreshPartners?.();
    }, []);

    const returnRows = useMemo(() => {
        const rows = [];
        for (const order of orders) {
            (order.returnRequests || []).forEach((rr, requestIndex) => {
                rows.push({
                    orderId: order._id,
                    requestIndex,
                    customerName: order.userId?.fullName || 'Customer',
                    customerMobile: order.userId?.mobile || '',
                    shippingAddress: order.shippingAddress || '',
                    requestedAt: rr.requestedAt,
                    reason: rr.reason || '',
                    items: rr.items || [],
                    status: rr.status || 'pending',
                    franchiseReviewReason: rr.franchiseReviewReason || '',
                    pickupDeliveryPartnerId: rr.pickupDeliveryPartnerId?._id || rr.pickupDeliveryPartnerId || '',
                    pickupPartnerName: rr.pickupDeliveryPartnerId?.fullName || '',
                });
            });
        }
        return rows.sort((a, b) => new Date(b.requestedAt || 0) - new Date(a.requestedAt || 0));
    }, [orders]);

    const handleReview = async (row, action) => {
        const key = `${row.orderId}-${row.requestIndex}`;
        const reason = (reviewReasons[key] || '').trim();
        if (action === 'reject' && reason.length < 5) {
            toast.error('Please enter a valid reason (minimum 5 characters)');
            return;
        }

        setProcessingKey(key);
        try {
            const response = await api.put(
                `/orders/franchise/${row.orderId}/returns/${row.requestIndex}/review`,
                { action, reason },
            );
            if (response.data.success) {
                toast.success(`Return request ${action}d`);
                await fetchReturns(true);
            }
        } catch (error) {
            console.error('Review return request error:', error);
            toast.error(error.response?.data?.message || 'Failed to review return request');
        } finally {
            setProcessingKey('');
        }
    };

    const handleAssignPickup = async (row, deliveryPartnerId) => {
        if (!deliveryPartnerId) return;
        const key = `${row.orderId}-${row.requestIndex}`;
        setProcessingKey(key);
        try {
            const response = await api.put(
                `/orders/franchise/${row.orderId}/returns/${row.requestIndex}/assign-pickup`,
                { deliveryPartnerId },
            );
            if (response.data.success) {
                toast.success('Pickup partner assigned');
                await fetchReturns(true);
            }
        } catch (error) {
            console.error('Assign pickup error:', error);
            toast.error(error.response?.data?.message || 'Failed to assign pickup');
        } finally {
            setProcessingKey('');
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen p-4 lg:p-6 space-y-4">
            <div className="bg-white border border-slate-200 rounded-sm p-4 flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                        <Undo2 size={16} />
                        Return Requests
                    </h1>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                        {returnRows.length} total requests
                    </p>
                </div>
                <button
                    onClick={() => fetchReturns(true)}
                    className="h-9 px-3 border border-slate-200 rounded-sm text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                    <RefreshCw size={12} className={cn(refreshing && 'animate-spin')} />
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-36 bg-white border border-slate-200 rounded-sm animate-pulse" />
                    ))}
                </div>
            ) : returnRows.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-sm p-10 text-center">
                    <p className="text-sm font-black text-slate-700 uppercase tracking-wider">No return requests yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {returnRows.map((row) => {
                        const key = `${row.orderId}-${row.requestIndex}`;
                        const isBusy = processingKey === key;
                        const canReview = row.status === 'pending';
                        const canAssign = ['approved', 'pickup_assigned'].includes(row.status);
                        return (
                            <div key={key} className="bg-white border border-slate-200 rounded-sm p-4 space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[12px] font-black text-slate-900 uppercase tracking-wider">
                                            Order #{row.orderId?.slice(-6)} | Request #{row.requestIndex + 1}
                                        </p>
                                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mt-1">
                                            {row.customerName} {row.customerMobile ? `| ${row.customerMobile}` : ''}
                                        </p>
                                        <p className="text-[11px] font-bold text-slate-400 mt-1">{row.shippingAddress}</p>
                                    </div>
                                    <span className={cn(
                                        'text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-sm border',
                                        statusStyles[row.status] || statusStyles.completed,
                                    )}>
                                        {row.status.replace(/_/g, ' ')}
                                    </span>
                                </div>

                                <div className="bg-slate-50 border border-slate-100 rounded-sm p-3">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Reason</p>
                                    <p className="text-[12px] font-bold text-slate-700">{row.reason}</p>
                                </div>

                                <div className="space-y-1">
                                    {row.items.map((item, idx) => (
                                        <div key={idx} className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex justify-between">
                                            <span>{item.name}</span>
                                            <span>{item.quantity} {item.unit}</span>
                                        </div>
                                    ))}
                                </div>

                                {canReview && (
                                    <div className="space-y-2 pt-1">
                                        <textarea
                                            value={reviewReasons[key] || ''}
                                            onChange={(e) => setReviewReasons((prev) => ({ ...prev, [key]: e.target.value }))}
                                            placeholder="Reason (optional for approve, required for reject)"
                                            className="w-full min-h-20 border border-slate-200 rounded-sm p-2 text-[12px] font-bold text-slate-700 focus:outline-none focus:border-slate-400"
                                        />
                                        <div className="flex flex-wrap gap-2 justify-end">
                                            <button
                                                disabled={isBusy}
                                                onClick={() => handleReview(row, 'approve')}
                                                className="h-8 px-4 bg-emerald-600 text-white rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle2 size={12} />
                                                Approve
                                            </button>
                                            <button
                                                disabled={isBusy}
                                                onClick={() => handleReview(row, 'reject')}
                                                className="h-8 px-4 bg-rose-600 text-white rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                <XCircle size={12} />
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {canAssign && (
                                    <div className="pt-1 space-y-2">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Assign pickup partner</p>
                                        <select
                                            className="w-full h-9 border border-slate-200 rounded-sm px-2 text-[12px] font-bold text-slate-700"
                                            defaultValue=""
                                            onChange={(e) => handleAssignPickup(row, e.target.value)}
                                            disabled={isBusy}
                                        >
                                            <option value="" disabled>
                                                {row.pickupDeliveryPartnerId ? 'Change pickup partner' : 'Select partner'}
                                            </option>
                                            {deliveryPartners.map((partner) => (
                                                <option key={partner._id} value={partner._id}>
                                                    {partner.fullName} - {partner.vehicleNumber}
                                                </option>
                                            ))}
                                        </select>
                                        {row.pickupDeliveryPartnerId && (
                                            <p className="text-[10px] font-black text-blue-700 uppercase tracking-wide flex items-center gap-1">
                                                <Truck size={12} />
                                                Assigned: {row.pickupPartnerName || 'Delivery partner'}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {row.franchiseReviewReason && (
                                    <div className="bg-slate-50 border border-slate-100 rounded-sm p-2">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Franchise note</p>
                                        <p className="text-[11px] font-bold text-slate-700 mt-1">{row.franchiseReviewReason}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
