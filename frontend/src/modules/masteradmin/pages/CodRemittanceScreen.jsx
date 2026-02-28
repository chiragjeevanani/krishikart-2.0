import { useCallback, useEffect, useMemo, useState } from 'react';
import { Home, ChevronRight, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import FilterBar from '../components/tables/FilterBar';
import DataGrid from '../components/tables/DataGrid';

const formatMoney = (v) => `Rs ${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export default function CodRemittanceScreen() {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('submitted');
    const [search, setSearch] = useState('');
    const [rows, setRows] = useState([]);

    const fetchRemittances = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/masteradmin/cod/remittances', { params: { status } });
            if (response.data.success) {
                setRows(response.data.results || []);
            }
        } catch (error) {
            console.error('Fetch COD remittances error:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch remittances');
        } finally {
            setLoading(false);
        }
    }, [status]);

    useEffect(() => {
        fetchRemittances();
    }, [fetchRemittances]);

    const filteredRows = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter((r) =>
            r.deliveryPartnerId?.fullName?.toLowerCase().includes(q) ||
            r.deliveryPartnerId?.mobile?.toLowerCase().includes(q) ||
            r.referenceNo?.toLowerCase().includes(q)
        );
    }, [rows, search]);

    const reviewRemittance = async (remittanceId, action) => {
        try {
            const response = await api.put(`/masteradmin/cod/remittances/${remittanceId}/review`, {
                action
            });
            if (response.data.success) {
                toast.success(`Remittance ${action}d`);
                fetchRemittances();
            }
        } catch (error) {
            console.error('Review remittance error:', error);
            toast.error(error.response?.data?.message || 'Failed to review remittance');
        }
    };

    const columns = [
        {
            header: 'Delivery Partner',
            key: 'deliveryPartnerId',
            render: (partner) => (
                <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-900">{partner?.fullName || 'Unknown'}</span>
                    <span className="text-[10px] text-slate-500">{partner?.mobile || ''}</span>
                </div>
            )
        },
        {
            header: 'Orders',
            key: 'orderIds',
            render: (orderIds) => <span className="text-[11px] font-bold text-slate-700">{orderIds?.length || 0}</span>
        },
        {
            header: 'Amount',
            key: 'amount',
            align: 'right',
            render: (amount) => <span className="text-[11px] font-black text-emerald-600">{formatMoney(amount)}</span>
        },
        {
            header: 'Mode',
            key: 'paymentMethod',
            render: (mode) => <span className="text-[10px] font-bold uppercase text-slate-600">{mode?.replace('_', ' ')}</span>
        },
        {
            header: 'Reference',
            key: 'referenceNo',
            render: (ref) => <span className="text-[10px] font-medium text-slate-500">{ref || 'N/A'}</span>
        },
        {
            header: 'Status',
            key: 'status',
            render: (st) => (
                <span className={`px-2 py-1 text-[9px] font-bold uppercase rounded border ${st === 'verified'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : st === 'submitted'
                            ? 'bg-blue-50 text-blue-600 border-blue-100'
                            : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                    {st}
                </span>
            )
        },
        {
            header: 'Actions',
            key: '_id',
            render: (_id, row) => (
                row.status === 'submitted' ? (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                reviewRemittance(_id, 'verify');
                            }}
                            className="px-2 py-1 rounded bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1"
                        >
                            <CheckCircle2 size={12} />
                            Verify
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                reviewRemittance(_id, 'reject');
                            }}
                            className="px-2 py-1 rounded bg-rose-600 text-white text-[10px] font-bold flex items-center gap-1"
                        >
                            <XCircle size={12} />
                            Reject
                        </button>
                    </div>
                ) : <span className="text-[10px] text-slate-400">Reviewed</span>
            )
        }
    ];

    if (loading) {
        return (
            <div className="p-4 space-y-4 animate-pulse">
                <div className="h-4 w-48 bg-slate-100 rounded" />
                <div className="h-16 bg-slate-50 border border-slate-200" />
                <div className="h-[500px] bg-slate-50 border border-slate-200" />
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-r border-slate-200 pr-4">
                            <Home size={12} />
                            <ChevronRight size={10} />
                            <span>Finance</span>
                            <ChevronRight size={10} />
                            <span className="text-slate-900 uppercase tracking-widest">COD Remittance</span>
                        </div>
                        <h1 className="text-sm font-bold text-slate-900">COD Settlement Review</h1>
                    </div>

                    <button
                        onClick={fetchRemittances}
                        className="px-3 py-1.5 bg-slate-900 text-white rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                    >
                        <RefreshCw size={12} />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-0 p-px">
                <FilterBar
                    onSearch={setSearch}
                    onRefresh={fetchRemittances}
                    activeFilter={status}
                    onFilterChange={setStatus}
                    filters={['submitted', 'verified', 'rejected', 'all']}
                />
                <div className="bg-white border-t border-slate-200">
                    <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Records: {filteredRows.length}</span>
                    </div>
                    <DataGrid
                        title="Delivery COD Remittance Queue"
                        columns={columns}
                        data={filteredRows}
                        density="compact"
                    />
                </div>
            </div>
        </div>
    );
}
