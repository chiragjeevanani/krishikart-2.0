import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    Download,
    Plus,
    ChevronDown,
    X,
    Users,
    Star,
    MapPin,
    ArrowRight,
    ShoppingBag,
    Home,
    ChevronRight,
    ShoppingBasket,
    Activity,
    Clock,
    CheckCircle2,
    Briefcase,
    FileText,
    Settings2,
    AlertCircle
} from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import OrdersTable from '../components/tables/OrdersTable';
import mockVendors from '../data/mockVendors.json';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

import OrderDetailModal from '../components/modals/OrderDetailModal';
import { exportToCSV } from '@/lib/exportToCSV';

export default function OrdersScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [allOrders, setAllOrders] = useState([]);
    const [selectedOrderForProcurement, setSelectedOrderForProcurement] = useState(null);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Real Vendors Data
    const [vendors, setVendors] = useState([]);
    const [isVendorsLoading, setIsVendorsLoading] = useState(false);
    const [compatibleVendors, setCompatibleVendors] = useState([]);

    const handleExport = () => {
        const columns = [
            { header: 'Order ID', key: '_id' },
            { header: 'Customer', key: 'customerName' },
            { header: 'Status', key: 'orderStatus' },
            { header: 'Total Amount', key: 'totalAmount' },
            { header: 'Date', key: 'createdAt' }
        ];

        const data = filteredOrders.map(order => ({
            ...order,
            customerName: order.userId?.fullName || 'Unknown',
            totalAmount: order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0
        }));

        exportToCSV('Orders_Report', columns, data);
    };

    const fetchAllOrders = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/orders/admin/all');
            if (response.data.success) {
                setAllOrders(response.data.results || []);
            }
        } catch (error) {
            console.error('Fetch all orders error:', error);
            toast.error('Failed to load orders');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllOrders();
    }, []);

    const handleOrderAction = async (orderId, newStatus, additionalData = {}) => {
        try {
            const response = await api.put(`/orders/admin/${orderId}/status`, {
                status: newStatus
            });
            if (response.data.success) {
                toast.success(`Order status updated to ${newStatus}`);
                setAllOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
            }
        } catch (error) {
            console.error('Update status error:', error);
            toast.error('Failed to update status');
        }
    };

    const fetchCompatibleVendors = async (order) => {
        setIsVendorsLoading(true);
        try {
            const shortageProductIds = order.items
                .filter(item => item.isShortage)
                .map(item => item.productId?._id || item.productId);

            const response = await api.get('/masteradmin/vendors', {
                params: { status: 'active' }
            });

            if (response.data.success) {
                const allActiveVendors = response.data.results || response.data.result || [];
                setVendors(allActiveVendors);

                // Filter vendors who have at least one of the shortage products
                const compatible = allActiveVendors.filter(vendor =>
                    vendor.products?.some(p => {
                        const vendorProdId = p._id || p;
                        return shortageProductIds.includes(vendorProdId.toString());
                    })
                );

                setCompatibleVendors(compatible.length > 0 ? compatible : allActiveVendors);
            }
        } catch (error) {
            console.error('Fetch vendors error:', error);
            toast.error('Failed to load vendors');
        } finally {
            setIsVendorsLoading(false);
        }
    };

    const handleProcure = (order) => {
        setSelectedOrderForProcurement({
            ...order,
            id: order._id,
            customer: order.userId?.fullName || 'Guest',
            total: order.totalAmount
        });
        fetchCompatibleVendors(order);
    };

    const handleFinalizeProcurement = async (vendor) => {
        if (!selectedOrderForProcurement) return;

        try {
            // Using the new bridging API
            const response = await api.post(`/procurement/admin/from-order/${selectedOrderForProcurement._id}`, {
                vendorId: vendor.id || vendor._id
            });

            if (response.data.success) {
                toast.success(`Procurement request initiated with ${vendor.name}`);
                setSelectedOrderForProcurement(null);
                fetchAllOrders();
            }
        } catch (error) {
            console.error('Procurement error:', error);
            toast.error('Failed to initiate procurement');
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 700);
        return () => clearTimeout(timer);
    }, []);

    const filteredOrders = allOrders.filter(order => {
        const customerName = order.userId?.fullName || 'Unknown';
        const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order._id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'all' || order.orderStatus.toLowerCase() === activeFilter.toLowerCase();
        return matchesSearch && matchesFilter;
    });

    // Reset to page 1 on search/filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeFilter]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

    if (isLoading) {
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
            {/* Enterprise Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-r border-slate-200 pr-4">
                            <Home size={12} />
                            <ChevronRight size={10} />
                            <span>Admin</span>
                            <ChevronRight size={10} />
                            <span className="text-slate-900">Orders</span>
                        </div>
                        <h1 className="text-sm font-bold text-slate-900">Orders Management</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-sm text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            <FileText size={13} className="text-slate-400" />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </div>
            </div>


            {/* Operational Ledger */}
            <div className="flex flex-col gap-0 p-px">

                <div className="bg-white border-t border-slate-200">
                    <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
                        <div className="relative group w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors" size={14} />
                            <input
                                type="text"
                                placeholder="Search by Order ID, Customer Name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-sm py-1.5 pl-9 pr-4 outline-none text-[11px] font-medium placeholder:text-slate-400 focus:border-slate-400 transition-all font-sans"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest tabular-nums">Showing {filteredOrders.length} records</span>
                        </div>
                    </div>

                    <OrdersTable
                        orders={paginatedOrders}
                        onAction={handleOrderAction}
                        onOrderClick={(id) => {
                            setSelectedOrderId(id);
                            setIsDetailModalOpen(true);
                        }}
                        onProcure={handleProcure}
                    />

                    {/* Pagination Footer */}
                    {filteredOrders.length > 0 && (
                        <div className="px-4 py-4 bg-white border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Page {currentPage} of {totalPages || 1}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 border border-slate-200 rounded-sm text-[10px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wider"
                                >
                                    Previous
                                </button>
                                <div className="flex items-center gap-1">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={cn(
                                                "w-8 h-8 flex items-center justify-center rounded-sm text-[10px] font-bold border transition-all",
                                                currentPage === i + 1
                                                    ? "bg-slate-900 border-slate-900 text-white"
                                                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
                                            )}
                                        >
                                            {i + 1}
                                        </button>
                                    )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="px-3 py-1.5 border border-slate-200 rounded-sm text-[10px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wider"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {filteredOrders.length === 0 && (
                        <div className="py-20 flex flex-col items-center text-center bg-white border-t border-slate-100">
                            <div className="w-12 h-12 bg-slate-50 rounded-sm flex items-center justify-center text-slate-300 mb-4 border border-slate-100">
                                <ShoppingBasket size={24} />
                            </div>
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">No orders found</h3>
                            <p className="text-[10px] text-slate-400 mt-1 font-medium uppercase tracking-widest">Try changing your search or filters</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Assign Vendor Drawer */}
            <AnimatePresence>
                {selectedOrderForProcurement && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedOrderForProcurement(null)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-[60]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "tween", duration: 0.3, ease: "circOut" }}
                            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-[0_0_50px_rgba(0,0,0,0.1)] z-[70] overflow-hidden flex flex-col border-l border-slate-200"
                        >
                            {/* Drawer Header */}
                            <div className="p-6 border-b border-slate-200 bg-slate-50/50">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-sm bg-slate-900 flex items-center justify-center text-white">
                                            <Briefcase size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Assignment</span>
                                            <span className="text-xs font-bold text-slate-900 mt-1 uppercase tracking-tight">Assign Vendor</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedOrderForProcurement(null)}
                                        className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-sm text-slate-400 transition-all"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums">#{selectedOrderForProcurement.id?.slice(-8)}</h2>
                                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1">{selectedOrderForProcurement.customer}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Order Total</span>
                                        <span className="text-xl font-black text-slate-900 tabular-nums">₹{selectedOrderForProcurement.total?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Shortage Items Summary */}
                            <div className="px-6 py-3 bg-rose-50/50 border-b border-rose-100 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-rose-600">
                                    <AlertCircle size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Items to Procure</span>
                                </div>
                                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest bg-white px-2 py-0.5 rounded-sm border border-rose-100 animate-pulse">
                                    {selectedOrderForProcurement.items?.filter(i => i.isShortage).length} Items Short
                                </span>
                            </div>
                            <div className="px-6 py-3 bg-white flex flex-col gap-2 max-h-40 overflow-y-auto border-b border-slate-100 custom-scrollbar">
                                {selectedOrderForProcurement.items?.filter(i => i.isShortage).map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center group">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{item.name}</span>
                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Ordered: {item.quantity} {item.unit}</span>
                                        </div>
                                        <div className="px-3 py-1 bg-rose-50 rounded-sm border border-rose-100">
                                            <span className="text-[10px] font-black text-rose-600 tabular-nums">{item.shortageQty} {item.unit} Short</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Vendor Selection List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Compatible Vendors</h3>
                                    {isVendorsLoading && <div className="w-3 h-3 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />}
                                </div>

                                {isVendorsLoading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-32 bg-white border border-slate-200 rounded-sm animate-pulse" />
                                        ))}
                                    </div>
                                ) : compatibleVendors.length === 0 ? (
                                    <div className="py-10 text-center bg-white border border-dashed border-slate-200 rounded-sm">
                                        <Users className="mx-auto text-slate-200 mb-2" size={24} />
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No matching vendors found</p>
                                    </div>
                                ) : (
                                    compatibleVendors.map((vendor) => (
                                        <div
                                            key={vendor._id}
                                            className="bg-white p-4 border border-slate-200 rounded-sm hover:border-slate-400 transition-all group relative overflow-hidden"
                                        >
                                            <div className="flex items-start justify-between relative z-10">
                                                <div className="flex gap-4">
                                                    <div className="w-10 h-10 rounded-sm bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                                        <Users size={18} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-slate-900 tracking-tight">{vendor.fullName || vendor.name}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="flex items-center gap-1 text-slate-500 font-bold text-[10px]">
                                                                <Star size={10} className="text-amber-500 fill-amber-500" />
                                                                <span className="tabular-nums">{vendor.rating || '4.5'}</span>
                                                            </div>
                                                            <span className="text-[10px] text-slate-200">•</span>
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                                {vendor.products?.length || 0} Products
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1 tracking-widest">Available</span>
                                                    <span className="text-xs font-bold text-slate-900 tabular-nums">{vendor.capacity || '100'}%</span>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <MapPin size={12} />
                                                    <span className="text-[10px] font-bold uppercase tracking-wide truncate max-w-[150px]">
                                                        {vendor.farmLocation || vendor.city || 'Vendor Location'}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleFinalizeProcurement(vendor)}
                                                    className="bg-white border border-slate-900 text-slate-900 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-sm hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2"
                                                >
                                                    Assign Vendor
                                                    <ArrowRight size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Drawer Footer */}
                            <div className="p-4 bg-white border-t border-slate-200">
                                <div className="bg-slate-900 rounded-sm p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Activity size={16} className="text-emerald-400" />
                                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Status: Online</span>
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pr-2">KrishiKart System</span>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Order Detail Modal */}
            <OrderDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedOrderId(null);
                }}
                orderId={selectedOrderId}
                onProcure={handleProcure}
            />
        </div>
    );
}
