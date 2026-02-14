import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Camera,
    User,
    Store,
    MapPin,
    Phone,
    Mail,
    Bell,
    Moon,
    Sun,
    ChevronRight,
    LogOut,
    ShieldCheck,
    CreditCard,
    Home,
    Settings2,
    Lock,
    X,
    Loader2
} from 'lucide-react';
import { useFranchiseAuth } from '../contexts/FranchiseAuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function ProfileScreen() {
    const { franchise, logout, updateProfile, loading: contextLoading } = useFranchiseAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (!contextLoading) {
            const timer = setTimeout(() => setIsLoading(false), 500);
            return () => clearTimeout(timer);
        }
    }, [contextLoading]);

    const sections = [
        {
            group: 'Account Information',
            items: [
                { id: 'details', label: 'Personal Details', icon: User, sub: 'View and edit your profile', onClick: () => setIsEditModalOpen(true) }
            ]
        },
        {
            group: 'Settings',
            items: [
                { id: 'notifications', label: 'Notifications', icon: Bell, sub: 'Manage order alerts', toggle: true }
            ]
        }
    ];

    const handleLogout = () => {
        logout();
        navigate('/franchise/login');
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        // Mock upload logic
        setTimeout(() => {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateProfile({ profilePicture: reader.result });
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        }, 1500);
    };

    if (isLoading) {
        return (
            <div className="p-4 space-y-4 animate-pulse bg-slate-50 min-h-screen">
                <div className="h-4 w-48 bg-slate-200 rounded" />
                <div className="h-[200px] bg-white border border-slate-200 rounded-sm" />
                <div className="h-[400px] bg-white border border-slate-200 rounded-sm" />
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-r border-slate-200 pr-4">
                            <Home size={12} />
                            <ChevronRight size={10} />
                            <span>Franchise</span>
                            <ChevronRight size={10} />
                            <span className="text-slate-900 uppercase tracking-widest">Profile</span>
                        </div>
                        <h1 className="text-sm font-bold text-slate-900">Profile Settings</h1>
                    </div>
                </div>
            </div>

            {/* Profile Identity Card */}
            <div className="bg-slate-900 px-8 py-12 flex flex-col md:flex-row items-center gap-8 border-b border-slate-800 relative overflow-hidden">
                <div className="relative group">
                    <input
                        type="file"
                        id="profile-pic"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                    <label
                        htmlFor="profile-pic"
                        className="relative z-10 w-24 h-24 bg-white rounded-[32px] flex items-center justify-center text-slate-900 border-4 border-slate-800 shadow-2xl overflow-hidden group cursor-pointer"
                    >
                        {isUploading ? (
                            <Loader2 size={24} className="animate-spin text-slate-400" />
                        ) : franchise?.profilePicture ? (
                            <img src={franchise.profilePicture} className="w-full h-full object-cover" alt="Profile" />
                        ) : (
                            <User size={40} strokeWidth={1.5} />
                        )}
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                            <Camera size={20} className="text-white" />
                        </div>
                    </label>
                </div>

                <div className="relative z-10 text-center md:text-left">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <h2 className="text-2xl font-black text-white tracking-tighter uppercase">{franchise?.franchiseName || 'Franchise Node'}</h2>
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-widest rounded-sm">
                                {franchise?.isVerified ? 'Verified' : 'Pending'}
                            </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] flex items-center justify-center md:justify-start gap-2">
                            Franchise ID: {franchise?._id?.slice(-6).toUpperCase() || 'FR-0000'}
                        </p>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-8 border-t border-slate-800 pt-6">
                        <div className="text-center md:text-left">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Operational Since</p>
                            <p className="text-xs font-black text-white uppercase tabular-nums">Oct 2023</p>
                        </div>
                        <div className="text-center md:text-left border-l border-slate-800 pl-8">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Location</p>
                            <p className="text-xs font-black text-white uppercase">{franchise?.city || 'Indore'}</p>
                        </div>
                    </div>
                </div>

                {/* Grid Pattern Background */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }} />
            </div>

            <div className="p-8 max-w-4xl mx-auto space-y-12">
                {sections.map((group) => (
                    <div key={group.group} className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">{group.group}</h3>
                        <div className="bg-white border-y border-slate-200 md:border-x md:rounded-sm overflow-hidden">
                            {group.items.map((item, idx) => (
                                <button
                                    key={item.id}
                                    className={cn(
                                        "w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group",
                                        idx !== group.items.length - 1 && "border-b border-slate-100"
                                    )}
                                    onClick={item.onClick}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                                            <item.icon size={18} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight mb-1">{item.label}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.sub}</p>
                                        </div>
                                    </div>
                                    {item.toggle ? (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (item.id === 'notifications') setNotificationsEnabled(!notificationsEnabled);
                                            }}
                                            className={cn(
                                                "w-10 h-5 border border-slate-200 rounded-full relative p-0.5 transition-colors duration-300",
                                                (item.id === 'notifications' ? notificationsEnabled : false) ? "bg-slate-900 border-slate-900" : "bg-slate-100"
                                            )}
                                        >
                                            <motion.div
                                                animate={{ x: (item.id === 'notifications' ? notificationsEnabled : false) ? 20 : 0 }}
                                                className="w-3.5 h-3.5 bg-white rounded-full shadow-sm"
                                            />
                                        </button>
                                    ) : (
                                        <ChevronRight size={16} className="text-slate-200 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="pt-8 border-t border-slate-200 space-y-4">
                    <button
                        onClick={handleLogout}
                        className="w-full h-14 bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-xl flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-[0.2em] transition-all"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                    <div className="text-center">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Version 2.4.0</p>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <EditProfileModal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        franchiseData={franchise}
                        onUpdate={updateProfile}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

const EditProfileModal = ({ isOpen, onClose, franchiseData, onUpdate }) => {
    const [formData, setFormData] = useState({
        franchiseName: franchiseData?.franchiseName || '',
        ownerName: franchiseData?.ownerName || '',
        email: franchiseData?.email || '',
        mobile: franchiseData?.mobile || '',
        city: franchiseData?.city || '',
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            await onUpdate(formData);
            alert("Profile updated successfully!");
            onClose();
        } catch (error) {
            console.error('Update failed', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white w-full max-w-lg rounded-[32px] p-8 shadow-2xl"
            >
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Edit Profile</h2>
                    <button onClick={onClose} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Shop Name</label>
                        <input
                            value={formData.franchiseName}
                            onChange={(e) => setFormData({ ...formData, franchiseName: e.target.value })}
                            className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:border-slate-900 transition-all text-xs"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Owner Name</label>
                        <input
                            value={formData.ownerName}
                            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                            className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:border-slate-900 transition-all text-xs"
                        />
                    </div>



                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                        <input
                            value={formData.mobile}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                            className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:border-slate-900 transition-all text-xs"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City / Area</label>
                        <input
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:border-slate-900 transition-all text-xs"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="w-full h-14 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] mt-8 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 disabled:bg-slate-200"
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Update Profile'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};


