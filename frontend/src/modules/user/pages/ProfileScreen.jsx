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
        { icon: User, label: "Edit Profile", path: "/edit-profile", color: "text-primary bg-primary/5" },
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
        <div className="bg-white px-6 pt-12 pb-10 border-b border-slate-100 shadow-sm md:rounded-b-none md:border-b md:pt-16">
          <div className="max-w-4xl mx-auto flex flex-col items-center md:flex-row md:items-center md:gap-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-[40px] md:rounded-xl bg-primary/10 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 md:w-7 md:h-7 bg-primary rounded-xl md:rounded-lg border-2 border-white flex items-center justify-center text-white shadow-lg">
                <ShieldCheck size={16} />
              </div>
            </div>
            <div className="text-center md:text-left mt-6 md:mt-0">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight md:text-3xl">Rajesh Kumar</h1>
              <p className="text-sm font-medium text-slate-400 mt-1 md:text-slate-500">rajesh.kumar@vivantatowels.com</p>
              <div className="flex items-center gap-2 mt-4 justify-center md:justify-start">
                <Badge variant="outline" className="text-[10px] border-primary/20 bg-primary/5 text-primary font-bold px-2 py-0.5 rounded-md">BUSINESS PRO</Badge>
                <Badge variant="outline" className="text-[10px] border-slate-200 bg-slate-50 text-slate-500 font-bold px-2 py-0.5 rounded-md">ID: KK-9821</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Content */}
        <div className="max-w-4xl mx-auto p-6 md:py-12 space-y-12">
          {menuGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-4">
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 md:text-slate-900 md:text-xs md:normal-case md:tracking-normal md:mb-6">{group.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {group.items.map((item, iIdx) => (
                  <button
                    key={iIdx}
                    onClick={() => item.path !== "#" && navigate(item.path)}
                    className="w-full flex items-center justify-between p-4 rounded-[28px] md:rounded-xl bg-white border border-slate-100 shadow-sm active:scale-[0.98] transition-all group hover:border-primary/20 hover:shadow-md md:p-5"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("w-10 h-10 md:w-11 md:h-11 rounded-2xl md:rounded-lg flex items-center justify-center transition-transform group-hover:scale-110", item.color)}>
                        <item.icon size={20} />
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-bold text-slate-800 md:text-slate-900 group-hover:text-primary transition-colors">{item.label}</span>
                        {item.badge && <p className="text-[10px] font-bold text-primary mt-0.5">{item.badge}</p>}
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Logout Section */}
          <div className="pt-8 flex flex-col items-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              className="w-full h-14 md:w-auto md:px-12 rounded-[32px] md:rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 font-bold text-base gap-3 transition-colors border border-transparent md:border-red-100"
            >
              <LogOut size={20} />
              Logout from Account
            </Button>
            <p className="text-center text-[10px] font-medium text-slate-300 uppercase tracking-widest mt-12">Build 2.4.0-STABLE · © 2024 KrishiKart</p>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
