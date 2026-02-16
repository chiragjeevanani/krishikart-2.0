import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Settings,
    Bell,
    Shield,
    Moon,
    LogOut,
    ChevronRight,
    Camera,
    Globe,
    Store,
    Smartphone,
    CreditCard,
    FileCheck,
    Award,
    Activity,
    ShieldCheck,
    X,
    Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import DocumentUploadCard from '../components/DocumentUploadCard';
import api from '../../../lib/axios';

const SettingItem = ({ icon: Icon, label, value, color, onClick }) => (
    <button
        onClick={onClick}
        className="w-full bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl hover:shadow-slate-200/40 transition-all active:scale-[0.98]"
    >
        <div className="flex items-center gap-4">
            <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm",
                color === 'blue' ? "bg-blue-50 text-blue-600 shadow-blue-100" :
                    color === 'primary' ? "bg-emerald-50 text-emerald-600 shadow-emerald-100" :
                        color === 'amber' ? "bg-amber-50 text-amber-600 shadow-amber-100" :
                            color === 'purple' ? "bg-purple-50 text-purple-600 shadow-purple-100" :
                                "bg-slate-50 text-slate-500 shadow-slate-100"
            )}>
                <Icon size={20} />
            </div>
            <div className="text-left">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none mb-1.5">{label}</p>
                <p className="text-[13px] font-black text-slate-900 tracking-tight">{value}</p>
            </div>
        </div>
        <ChevronRight size={18} className="text-slate-200 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
    </button>
);

const EditProfileModal = ({ isOpen, onClose, vendorData, onUpdate }) => {
    const [formData, setFormData] = useState({
        fullName: vendorData?.fullName || '',
        mobile: vendorData?.mobile || '',
        farmLocation: vendorData?.farmLocation || '',
        fssaiLicense: vendorData?.fssaiLicense || '',
        bankAccountHolderName: vendorData?.bankDetails?.accountHolderName || '',
        bankAccountNumber: vendorData?.bankDetails?.accountNumber || '',
        bankIfscCode: vendorData?.bankDetails?.ifscCode || '',
        bankName: vendorData?.bankDetails?.bankName || '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const updateData = new FormData();
            updateData.append('fullName', formData.fullName);
            updateData.append('mobile', formData.mobile);
            updateData.append('farmLocation', formData.farmLocation);
            updateData.append('fssaiLicense', formData.fssaiLicense);

            const bankDetails = {
                accountHolderName: formData.bankAccountHolderName,
                accountNumber: formData.bankAccountNumber,
                ifscCode: formData.bankIfscCode,
                bankName: formData.bankName
            };
            updateData.append('bankDetails', JSON.stringify(bankDetails));

            await onUpdate(updateData);
            onClose();
        } catch (error) {
            console.error(error);
            alert('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white w-full max-w-lg rounded-[32px] p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-slate-900">Edit Profile</h2>
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                        <input name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-slate-50 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile</label>
                        <input name="mobile" value={formData.mobile} onChange={handleChange} className="w-full bg-slate-50 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                        <input name="farmLocation" value={formData.farmLocation} onChange={handleChange} className="w-full bg-slate-50 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">FSSAI License</label>
                        <input name="fssaiLicense" value={formData.fssaiLicense} onChange={handleChange} className="w-full bg-slate-50 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <h3 className="text-sm font-black text-slate-900 mb-3">Bank Details</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bank Name</label>
                                <input name="bankName" value={formData.bankName} onChange={handleChange} className="w-full bg-slate-50 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Name</label>
                                <input name="bankAccountHolderName" value={formData.bankAccountHolderName} onChange={handleChange} className="w-full bg-slate-50 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Account No.</label>
                                <input name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} className="w-full bg-slate-50 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">IFSC</label>
                                <input name="bankIfscCode" value={formData.bankIfscCode} onChange={handleChange} className="w-full bg-slate-50 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20" />
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black mt-4 hover:bg-primary transition-colors disabled:opacity-50">
                        {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Save Changes'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

const ChangePasswordModal = ({ isOpen, onClose }) => {
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/vendor/change-password', passwords);
            alert('Password changed successfully');
            onClose();
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to change password');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white w-full max-w-md rounded-[32px] p-6 shadow-2xl"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-slate-900">Change Password</h2>
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="password" name="currentPassword" placeholder="Current Password" value={passwords.currentPassword} onChange={handleChange} className="w-full bg-slate-50 rounded-xl p-4 font-bold outline-none" required />
                    <input type="password" name="newPassword" placeholder="New Password" value={passwords.newPassword} onChange={handleChange} className="w-full bg-slate-50 rounded-xl p-4 font-bold outline-none" required />
                    <input type="password" name="confirmPassword" placeholder="Confirm Password" value={passwords.confirmPassword} onChange={handleChange} className="w-full bg-slate-50 rounded-xl p-4 font-bold outline-none" required />
                    <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black mt-2 hover:bg-primary transition-colors disabled:opacity-50">
                        {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Update Password'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default function ProfileScreen() {
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchVendorProfile();
    }, []);

    const fetchVendorProfile = async () => {
        try {
            const { data } = await api.get('/vendor/me');
            setVendor(data.result);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('vendorToken');
                localStorage.removeItem('vendorData');
                navigate('/vendor/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (formData) => {
        try {
            // Debug: Check FormData content
            if (formData instanceof FormData) {
                for (let pair of formData.entries()) {
                    console.log('FormData Entry:', pair[0], pair[1]);
                }
            }

            const { data } = await api.put('/vendor/update', formData, {
                headers: { 'Content-Type': null }
            });
            setVendor(data.result);
            localStorage.setItem('vendorData', JSON.stringify(data.result));
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Update failed:', error);
            alert(error.response?.data?.message || 'Failed to update profile picture');
            throw error;
        }
    };

    const handleProfilePictureUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profilePicture', file);

        try {
            await handleProfileUpdate(formData);
        } catch (error) {
            alert('Failed to update profile picture');
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;
    }

    if (!vendor) return null;

    return (
        <div className="space-y-8 pb-32">
            <header className="flex items-end justify-between">
                <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Sovereign Identity</p>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Identity Suite</h1>
                </div>
                <div className="px-3 py-1 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldCheck size={10} className="text-emerald-400" />
                    Verified Node
                </div>
            </header>

            {/* Premium Profile Card */}
            <div className="bg-slate-900 rounded-[44px] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-200 group">
                {/* Background Textures */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -z-0 group-hover:bg-primary/30 transition-colors" />
                <div className="absolute bottom-[-50px] left-[-50px] w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full -z-0" />

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="relative mb-6 group/avatar cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="w-28 h-28 rounded-[36px] bg-white p-1.5 overflow-hidden shadow-2xl shadow-black/20"
                        >
                            <img
                                src={vendor.profilePicture || "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&auto=format&fit=crop&q=60"}
                                className="w-full h-full object-cover rounded-[32px]"
                                alt="Profile"
                            />
                        </motion.div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity bg-black/20 rounded-[36px]">
                            <Camera size={24} className="text-white drop-shadow-lg" />
                        </div>
                        <button className="absolute -bottom-1 -right-1 w-10 h-10 bg-white text-slate-900 rounded-2xl flex items-center justify-center border-4 border-slate-900 shadow-xl hover:scale-110 transition-transform pointer-events-none">
                            <Camera size={18} />
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleProfilePictureUpload} className="hidden" accept="image/*" />
                    </div>

                    <h2 className="text-2xl font-black tracking-tight mb-1">{vendor.fullName}</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{vendor.email}</span>
                        {/* <Award size={12} className="text-amber-400" /> */}
                    </div>
                    <p className="text-slate-400 text-xs font-bold mt-1">{vendor.mobile}</p>

                    <div className="w-full mt-10 flex justify-center">
                        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/10 text-center w-1/2">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Location</p>
                            <p className="text-sm font-black text-white tracking-widest truncate">{vendor.farmLocation || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Sections */}
            <div className="space-y-10">
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Identity Documents</h3>
                        {/* <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-100">
                            <ShieldCheck size={10} /> Fully Attested
                        </div> */}
                    </div>
                    {/* Display uploaded documents status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DocumentUploadCard title="Aadhar Card" icon={User} status={vendor.aadharCard ? "verified" : "pending"} url={vendor.aadharCard} />
                        <DocumentUploadCard title="PAN Card" icon={CreditCard} status={vendor.panCard ? "verified" : "pending"} url={vendor.panCard} />
                        <DocumentUploadCard title="Shop Proof" icon={Store} status={vendor.shopEstablishmentProof ? "verified" : "pending"} url={vendor.shopEstablishmentProof} />
                        <DocumentUploadCard title="FSSAI License" icon={FileCheck} status={vendor.fssaiLicense ? "verified" : "pending"} url={vendor.fssaiLicense} />
                    </div>
                </section>

                <section className="space-y-3">
                    <div className="flex items-center gap-2 mb-4 ml-2">
                        <Activity size={14} className="text-slate-400" />
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Account Management</h3>
                    </div>
                    <SettingItem icon={User} label="Profile Details" value="Edit Personal Info" color="blue" onClick={() => setIsEditModalOpen(true)} />
                    <SettingItem icon={Shield} label="Security" value="Change Password" color="slate" onClick={() => setIsPasswordModalOpen(true)} />
                    {/* <SettingItem icon={Globe} label="Marketplace Engine" value="Global Store Visibility" color="primary" onClick={() => navigate('/vendor/preview')} /> */}
                </section>

                <section className="space-y-3">
                    <div className="flex items-center gap-2 mb-4 ml-2">
                        <Settings size={14} className="text-slate-400" />
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">System Framework</h3>
                    </div>

                    {/* Dark Mode Toggle */}
                    <div className="w-full bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl hover:shadow-slate-200/40 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200 transition-transform group-hover:scale-110">
                                <Moon size={20} />
                            </div>
                            <div className="text-left">
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none mb-1.5">User Interface</p>
                                <p className="text-[13px] font-black text-slate-900 tracking-tight">Dark Mode Engine</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className={cn(
                                "w-14 h-7 rounded-full transition-all duration-500 relative p-1 outline-none",
                                isDarkMode ? "bg-slate-900 ring-4 ring-slate-100" : "bg-slate-100"
                            )}
                        >
                            <motion.div
                                animate={{ x: isDarkMode ? 28 : 0 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className={cn(
                                    "w-5 h-5 rounded-full shadow-md",
                                    isDarkMode ? "bg-white" : "bg-slate-400"
                                )}
                            />
                        </button>
                    </div>

                </section>

                <div className="pt-8 space-y-4">
                    <button
                        onClick={() => {
                            localStorage.removeItem('vendorToken');
                            localStorage.removeItem('vendorData');
                            navigate('/vendor/login');
                        }}
                        className="w-full bg-white text-red-500 py-6 rounded-[36px] font-black text-sm flex items-center justify-center gap-3 border border-red-50 hover:bg-red-50 transition-all active:scale-[0.98] shadow-sm hover:shadow-red-100/50"
                    >
                        Terminate Session
                        <LogOut size={18} />
                    </button>

                    <div className="text-center">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] leading-none">Powered by KrishiKart Ledger v1.0</p>
                        <p className="text-[9px] font-bold text-slate-200 mt-2">DEPLOYMENT_NODE: PROD-MUM-882</p>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isEditModalOpen && (
                    <EditProfileModal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        vendorData={vendor}
                        onUpdate={handleProfileUpdate}
                    />
                )}
                {isPasswordModalOpen && (
                    <ChangePasswordModal
                        isOpen={isPasswordModalOpen}
                        onClose={() => setIsPasswordModalOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
