import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, MapPin, Bell, ChevronRight, Wallet, LogOut, Info, ShieldCheck, Heart, HelpCircle, UserCheck, Package } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageTransition from '../components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useWallet } from '../contexts/WalletContext'
import { cn } from '@/lib/utils'

export default function ProfileScreen() {
  const navigate = useNavigate()
  const { balance } = useWallet()

  const menuGroups = [
    {
      title: "Account Settings",
      items: [
        { icon: User, label: "Edit Profile", path: "/edit-profile", color: "text-primary bg-primary/10" },
        { icon: Package, label: "My Orders", path: "/orders", color: "text-blue-500 bg-blue-50" },
        { icon: MapPin, label: "Saved Addresses", path: "/address-book", color: "text-orange-500 bg-orange-50" },
        { icon: Wallet, label: "KK Wallet", path: "/wallet", color: "text-emerald-500 bg-emerald-50", badge: `₹${balance.toLocaleString()}` },
        { icon: Bell, label: "Notifications", path: "/notifications", color: "text-indigo-500 bg-indigo-50" },
      ]
    },
    {
      title: "Preferences & Support",
      items: [
        { icon: Heart, label: "Your Favorites", path: "/favorites", color: "text-pink-500 bg-pink-50" },
        { icon: UserCheck, label: "Verification Status", path: "/verification", color: "text-indigo-500 bg-indigo-50", badge: "Verified" },
        { icon: HelpCircle, label: "Help & Support", path: "/help-support", color: "text-slate-500 bg-slate-50" },
        { icon: Info, label: "About KrishiKart", path: "/about", color: "text-slate-500 bg-slate-50" },
      ]
    }
  ]

  return (
    <PageTransition>
      <div className="bg-[#f8fafd] min-h-screen pb-32">
        {/* Profile Header */}
        <div className="bg-white px-6 pt-10 pb-8 rounded-b-[50px] shadow-sm">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-28 h-28 rounded-[40px] bg-primary/10 border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-lg">
                <ShieldCheck size={20} />
              </div>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-6">Rajesh Kumar</h1>
            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">+91 9876543210</p>
          </div>
        </div>

        {/* Menu Content */}
        <div className="p-6 space-y-10">
          {menuGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-4">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">{group.title}</h2>
              <div className="space-y-2">
                {group.items.map((item, iIdx) => (
                  <button
                    key={iIdx}
                    onClick={() => item.path !== "#" && navigate(item.path)}
                    className="w-full flex items-center justify-between p-5 rounded-[28px] bg-white border border-slate-100 shadow-sm active:scale-[0.98] transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", item.color)}>
                        <item.icon size={22} />
                      </div>
                      <span className="text-sm font-black text-slate-800">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.badge && (
                        <Badge variant="secondary" className="bg-slate-50 text-slate-900 border-none font-black text-[10px] px-3 py-1 uppercase tracking-widest rounded-lg">
                          {item.badge}
                        </Badge>
                      )}
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-primary transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Logout Section */}
          <div className="pt-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              className="w-full h-18 rounded-[32px] text-red-500 hover:text-red-600 hover:bg-red-50 font-black text-lg gap-3 transition-colors"
            >
              <LogOut size={22} />
              Logout from Account
            </Button>
            <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-8">Version 2.4.0 (Stable)</p>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
