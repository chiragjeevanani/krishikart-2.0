import React from 'react';
import { motion } from 'framer-motion';
import { Bell, ArrowLeft, ToggleLeft as Toggle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationSettingsScreen() {
    const navigate = useNavigate();

    const settings = [
        { label: 'Push Notifications', desc: 'Get updates on new delivery requests' },
        { label: 'Sms Notifications', desc: 'Receive order details via SMS' },
        { label: 'Order Updates', desc: 'Notifications for status changes' },
        { label: 'Promotional', desc: 'Special offers and incentives' },
    ];

    return (
        <div className="flex flex-col min-h-full bg-slate-50 pb-20">
            <div className="px-6 pt-8 pb-4 flex items-center gap-4 sticky top-0 bg-white z-10 border-b border-border/50 shadow-sm">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold text-foreground">Notification Settings</h1>
            </div>

            <div className="p-6 space-y-4">
                {settings.map((item, i) => (
                    <div key={i} className="bg-white p-5 rounded-3xl border border-border shadow-sm flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-black text-foreground">{item.label}</h3>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <div className="w-12 h-6 bg-primary rounded-full p-1 relative">
                            <div className="w-4 h-4 bg-white rounded-full shadow-sm absolute left-7" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
