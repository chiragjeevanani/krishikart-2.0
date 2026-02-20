import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Download,
    Eye,
    Search,
    Calendar,
    Filter,
    User,
    Building,
    IndianRupee,
    Scale,
    ExternalLink,
    Loader2,
    Package
} from 'lucide-react';
import api from '@/lib/axios';
import DocumentViewer from '../../vendor/components/documents/DocumentViewer';

export default function VendorReportsScreen() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReport, setSelectedReport] = useState(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [shouldAutoDownload, setShouldAutoDownload] = useState(false);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await api.get('/procurement/admin/reports');
                if (response.data.success) {
                    setReports(response.data.results);
                }
            } catch (error) {
                console.error("Failed to fetch vendor reports", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const filteredReports = reports.filter(report =>
        report.invoice?.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.franchiseId?.shopName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Vendor Dispatch Reports</h1>
                    <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest text-[10px]">Invoices & Logistics Audit</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={16} />
                        Export All
                    </button>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Invoices</p>
                        <p className="text-2xl font-black text-slate-900">{reports.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <Scale size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross Weight</p>
                        <p className="text-2xl font-black text-slate-900">{reports.reduce((acc, r) => acc + (r.actualWeight || 0), 0).toFixed(2)} KG</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                        <IndianRupee size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Value</p>
                        <p className="text-2xl font-black text-slate-900">₹{reports.reduce((acc, r) => acc + (r.totalQuotedAmount || 0), 0).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Invoice # or Franchise Name"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-100 px-4 py-3 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-200 transition-all uppercase tracking-widest">
                        <Calendar size={14} />
                        Date
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-100 px-4 py-3 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-200 transition-all uppercase tracking-widest">
                        <Filter size={14} />
                        Filter
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Invoice Details</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Franchise</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Procurement Items</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Calibration Data</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Value</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredReports.map((report) => (
                            <tr key={report._id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-5">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">{report.invoice?.invoiceNumber}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                            {new Date(report.invoice?.invoiceDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                                            <User size={14} />
                                        </div>
                                        <div className="flex flex-col leading-tight">
                                            <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{report.franchiseId?.ownerName || 'N/A'}</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{report.franchiseId?.shopName}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col gap-1 max-w-[180px]">
                                        {report.items.slice(0, 3).map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-[10px] font-bold text-slate-900 border-b border-dashed border-slate-100 pb-0.5 last:border-0 last:pb-0">
                                                <span className="truncate mr-2">{item.name}</span>
                                                <span className="text-slate-400 shrink-0 whitespace-nowrap">{item.quantity} {item.unit}</span>
                                            </div>
                                        ))}
                                        {report.items.length > 3 && (
                                            <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                                                +{report.items.length - 3} More Items
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                                        <Scale size={14} />
                                        <span className="text-xs font-black tabular-nums">{report.actualWeight || 0} KG</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-sm font-black text-slate-900 tabular-nums">₹{report.totalQuotedAmount?.toLocaleString()}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedReport(report);
                                                setShouldAutoDownload(false);
                                                setIsViewerOpen(true);
                                            }}
                                            className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary/30 rounded-lg transition-all shadow-sm"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedReport(report);
                                                setShouldAutoDownload(true);
                                                setIsViewerOpen(true);
                                            }}
                                            className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all"
                                        >
                                            <Download size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredReports.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText size={32} />
                        </div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">No reports found for this query</p>
                    </div>
                )}
            </div>

            {selectedReport && (
                <DocumentViewer
                    isOpen={isViewerOpen}
                    onClose={() => {
                        setIsViewerOpen(false);
                        setShouldAutoDownload(false);
                    }}
                    autoDownload={shouldAutoDownload}
                    type="INVOICE"
                    data={{
                        invoiceNumber: selectedReport.invoice?.invoiceNumber,
                        invoiceDate: selectedReport.invoice?.invoiceDate,
                        items: selectedReport.items?.map(i => ({
                            name: i.name,
                            quantity: i.quantity || 0,
                            unit: i.unit || 'KG',
                            quotedPrice: i.quotedPrice || 0,
                            price: i.price || 0
                        })),
                        totalWeight: selectedReport.actualWeight,
                        franchise: selectedReport.franchiseId?.shopName,
                        destNode: selectedReport.franchiseId?.cityArea,
                        vendor: selectedReport.assignedVendorId?.shopName || 'KrishiKart Partner',
                        handlingFee: 40
                    }}
                />
            )}
        </div>
    );
}
