import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PackageCheck,
    ChevronLeft,
    ChevronRight,
    Search,
    Truck,
    AlertTriangle,
    CheckCircle2,
    Plus,
    Minus,
    ClipboardCheck,
    X,
    FileText,
    Home,
    Download,
    RefreshCw,
    ShieldCheck,
    Settings2,
    Filter,
    ArrowRight,
    Package
} from 'lucide-react';
import { useGRN } from '../contexts/GRNContext';
import { useInventory } from '../contexts/InventoryContext';
import { cn } from '@/lib/utils';
import { useFranchiseOrders } from '../contexts/FranchiseOrdersContext';
import DocumentViewer from '../../vendor/components/documents/DocumentViewer';

// Enterprise Components
import MetricRow from '../components/cards/MetricRow';
import DataGrid from '../components/tables/DataGrid';
import FilterBar from '../components/tables/FilterBar';

export default function ReceivingScreen() {
    const { purchaseOrders, submitGRN } = useGRN();
    const { inventory, addStock } = useInventory();
    const { orders: contextOrders, updateOrderStatus } = useFranchiseOrders();
    const [selectedPO, setSelectedPO] = useState(null);
    const [receivingData, setReceivingData] = useState({});
    const [isDocOpen, setIsDocOpen] = useState(false);
    const [docType, setDocType] = useState('GRN');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 600);
        return () => clearTimeout(timer);
    }, []);

    const filteredPOs = [
        ...purchaseOrders,
        ...contextOrders
            .filter(o => o.status === 'completed' && !o.grn)
            .map(o => ({
                poNumber: o.id,
                vendor: 'KrishiKart Indore',
                date: new Date().toLocaleDateString(),
                status: 'dispatched',
                items: o.items.map(i => ({
                    id: i.id || Math.random().toString(36).substr(2, 9),
                    productId: i.id,
                    productName: i.name,
                    expectedQty: i.quantity || i.qty,
                    unit: i.unit || 'units'
                }))
            }))
    ].filter(po =>
        po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.vendor.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectPO = (po) => {
        setSelectedPO(po);
        const initialData = {};
        po.items.forEach(item => {
            const itemId = item.productId || item.id;
            initialData[itemId] = {
                received: item.expectedQty,
                damage: 0,
                reason: ''
            };
        });
        setReceivingData(initialData);
    };

    const updateItem = (itemId, field, value) => {
        setReceivingData(prev => ({
            ...prev,
            [itemId]: { ...prev[itemId], [field]: value }
        }));
    };

    const handleSubmit = () => {
        const processedItems = selectedPO.items.map(item => {
            const itemId = item.productId || item.id;
            const data = receivingData[itemId];
            return {
                ...item,
                receivedQty: data.received,
                damageQty: data.damage,
                damageReason: data.reason,
                status: data.received >= item.expectedQty ? 'received' : 'partially_received'
            };
        });

        const grn = {
            id: `GRN-${selectedPO.poNumber.split('-')[1] || Math.floor(10000 + Math.random() * 90000)}`,
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            sourceNode: selectedPO.vendor,
            destNode: 'Franchise Main Center',
            items: processedItems.map(i => ({
                name: i.name,
                quantity: i.expectedQty,
                receivedQty: i.receivedQty,
                damageQty: i.damageQty,
                unit: i.unit
            }))
        };

        const orderId = selectedPO.poNumber;
        const liveOrderId = orderId.startsWith('ORD-') ? orderId : `ORD-${orderId.split('-')[1] || '9921'}`;

        const stockItemsToAdd = processedItems.map(i => ({
            productId: i.productId || i.id,
            qty: i.receivedQty
        }));
        addStock(stockItemsToAdd);

        updateOrderStatus(liveOrderId, 'received', { grn });
        submitGRN(orderId, processedItems);
        setSelectedPO(null);
    };

    const poColumns = [
        {
            header: 'PO Identifier',
            key: 'poNumber',
            render: (val, row) => (
                <div className="flex flex-col">
                    <span className="font-black text-slate-900 text-[11px] tracking-tight leading-none mb-1">{val}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{row.vendor}</span>
                </div>
            )
        },
        {
            header: 'Hub Status',
            key: 'status',
            render: (val) => (
                <div className={cn(
                    "px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest border w-fit",
                    val === 'dispatched' ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                )}>
                    {val}
                </div>
            )
        },
        {
            header: 'Item Load',
            key: 'items',
            render: (val) => <span className="text-[10px] font-bold text-slate-600 tabular-nums">{val.length} SKU(s)</span>
        },
        {
            header: 'Operations',
            key: 'actions',
            align: 'right',
            render: (_, row) => (
                <button
                    onClick={() => handleSelectPO(row)}
                    className="p-1 px-3 text-[9px] font-black uppercase text-slate-900 border border-slate-900 rounded-sm hover:bg-slate-900 hover:text-white transition-all underline decoration-slate-300 underline-offset-4"
                >
                    Run Reception
                </button>
            )
        }
    ];

    if (isLoading) {
        return (
            <div className="p-4 space-y-4 animate-pulse bg-slate-50 min-h-screen">
                <div className="h-4 w-48 bg-slate-200 rounded" />
                <div className="h-16 bg-white border border-slate-200" />
                <div className="h-[500px] bg-white border border-slate-200" />
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
                            <span>Inbound Logistics</span>
                            <ChevronRight size={10} />
                            <span className="text-slate-900 uppercase tracking-widest">Vendor Receiving</span>
                        </div>
                        <h1 className="text-sm font-bold text-slate-900">
                            {selectedPO ? `Audit PO: ${selectedPO.poNumber}` : 'Inbound GRN Registry'}
                        </h1>
                    </div>
                </div>
            </div>

            <div className="p-px bg-slate-200 overflow-hidden">
                {!selectedPO ? (
                    <>
                        <FilterBar
                            actions={
                                <div className="flex items-center gap-2">
                                    <div className="relative group w-full max-w-xs">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={14} />
                                        <input
                                            type="text"
                                            placeholder="Search PO Profile..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="bg-white border border-slate-200 rounded-sm py-1.5 pl-9 pr-4 outline-none text-[11px] font-black text-slate-900 placeholder:text-slate-400 focus:border-slate-400 transition-all font-sans min-w-[240px]"
                                        />
                                    </div>
                                    <button className="p-1.5 border border-slate-200 rounded-sm hover:bg-slate-100 transition-colors text-slate-400 bg-white">
                                        <RefreshCw size={14} />
                                    </button>
                                </div>
                            }
                        />
                        <div className="bg-white border-t border-slate-200">
                            <DataGrid
                                columns={poColumns}
                                data={filteredPOs}
                                density="compact"
                                showSearch={false}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] bg-white">
                        {/* Audit Details */}
                        <div className="flex-1 overflow-y-auto no-scrollbar border-r border-slate-200">
                            <div className="bg-slate-900 p-6 text-white border-b border-slate-800 flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-1.5">Verification Session Active</p>
                                    <h2 className="text-2xl font-black tracking-tighter leading-none">{selectedPO.poNumber}</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{selectedPO.vendor}</p>
                                </div>
                                <Truck size={32} className="text-slate-700" />
                            </div>

                            <div className="p-4 space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Itemized Audit Matrix</h3>
                                    <span className="text-[10px] font-bold text-slate-300 uppercase underline underline-offset-4 decoration-dotted">SKU Validation Required</span>
                                </div>

                                <div className="space-y-px bg-slate-200 border border-slate-200 rounded-sm overflow-hidden">
                                    {selectedPO.items.map((item) => {
                                        const itemId = item.productId || item.id;
                                        const data = receivingData[itemId] || {};
                                        return (
                                            <div key={itemId} className="bg-white p-4 grid grid-cols-12 gap-4 items-center">
                                                <div className="col-span-5 flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-sm bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 shrink-0">
                                                        <Package size={14} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="text-[11px] font-black text-slate-900 uppercase truncate leading-none mb-1">{item.productName || item.name}</h4>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tabular-nums">Manifest: {item.expectedQty} {item.unit}</p>
                                                    </div>
                                                </div>

                                                <div className="col-span-3">
                                                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-sm p-0.5">
                                                        <button onClick={() => updateItem(itemId, 'received', Math.max(0, data.received - 1))} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-900">
                                                            <Minus size={10} />
                                                        </button>
                                                        <input
                                                            type="number"
                                                            value={data.received}
                                                            onChange={(e) => updateItem(itemId, 'received', parseInt(e.target.value) || 0)}
                                                            className="bg-transparent w-full text-center font-black text-[10px] outline-none tabular-nums"
                                                        />
                                                        <button onClick={() => updateItem(itemId, 'received', data.received + 1)} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-900">
                                                            <Plus size={10} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="col-span-2">
                                                    <div className="flex items-center bg-rose-50 border border-rose-100 rounded-sm p-0.5">
                                                        <input
                                                            type="number"
                                                            value={data.damage}
                                                            placeholder="DMG"
                                                            onChange={(e) => updateItem(itemId, 'damage', parseInt(e.target.value) || 0)}
                                                            className="bg-transparent w-full text-center font-black text-[10px] text-rose-600 outline-none tabular-nums placeholder:text-rose-300"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-span-2 text-right">
                                                    <button className="p-1 text-slate-300 hover:text-slate-900">
                                                        <Settings2 size={14} />
                                                    </button>
                                                </div>

                                                {data.damage > 0 && (
                                                    <div className="col-span-12 mt-2">
                                                        <select
                                                            value={data.reason}
                                                            onChange={(e) => updateItem(itemId, 'reason', e.target.value)}
                                                            className="w-full h-8 bg-slate-50 border border-slate-200 rounded-sm px-3 text-[9px] font-black text-slate-600 uppercase tracking-widest outline-none focus:border-slate-900"
                                                        >
                                                            <option value="">Select Audit Reason</option>
                                                            <option value="Physical Damage">Physical Damage</option>
                                                            <option value="Poor Quality">Poor Quality</option>
                                                            <option value="Short Supply">Short Supply</option>
                                                            <option value="Expired/Old">Expired/Old</option>
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Audit Summary Panel */}
                        <div className="w-full lg:w-[360px] bg-slate-50 p-8 flex flex-col justify-between">
                            <div className="space-y-8">
                                <div className="flex items-center gap-3">
                                    <ClipboardCheck className="text-slate-900" size={18} />
                                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Audit Confirmation</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-white border border-slate-200 p-4 rounded-sm">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Resource Destination</p>
                                        <p className="text-[11px] font-black text-slate-900 uppercase">Franchise Internal Cold-Store</p>
                                    </div>

                                    <div className="bg-white border border-slate-200 p-4 rounded-sm">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Calibration Status</p>
                                        <p className="text-[11px] font-black text-emerald-600 uppercase flex items-center gap-2">
                                            <ShieldCheck size={12} /> Digital Signature Ready
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleSubmit}
                                    className="w-full h-14 bg-slate-900 text-white rounded-sm font-black uppercase text-[10px] tracking-[0.3em] shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
                                >
                                    Commit GRN Registry <ArrowRight size={16} />
                                </button>
                                <button
                                    onClick={() => setSelectedPO(null)}
                                    className="w-full py-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                                >
                                    Withdraw Audit Session
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <DocumentViewer
                isOpen={isDocOpen}
                onClose={() => setIsDocOpen(false)}
                type={docType}
                data={docType === 'DC' ? selectedPO?.deliveryChallan : contextOrders.find(o => o.id.includes(selectedPO?.id))?.grn}
            />
        </div>
    );
}
