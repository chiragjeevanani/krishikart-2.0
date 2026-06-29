import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Shield, Info } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '@/lib/axios'

export default function PrivacyPolicyScreen() {
  const navigate = useNavigate()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      try {
        const { data } = await api.get('/masteradmin/public/legal-pages')
        if (data?.success && data?.result?.privacy?.content) {
          setContent(data.result.privacy.content)
        }
      } catch (err) {
        console.error('Failed to fetch privacy policy:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPrivacyPolicy()
  }, [])

  const defaultSections = [
    {
      title: '1. Information We Collect',
      content: 'We collect personal information such as name, phone number, email, and delivery address to process your orders and provide our services.'
    },
    {
      title: '2. How We Use Your Information',
      content: 'Your information is used for order processing, delivery, communication, and improving our services. We do not sell your personal data to third parties.'
    },
    {
      title: '3. Data Security',
      content: 'We use industry-standard security measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction.'
    }
  ]

  const renderContent = () => {
    if (content) {
      return content.split('\n').map((paragraph, idx) => (
        <p key={idx} className="text-sm text-slate-500 font-medium leading-relaxed">
          {paragraph}
        </p>
      ))
    }
    return defaultSections.map((section, idx) => (
      <motion.div 
        key={idx}
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="space-y-2"
      >
        <h3 className="text-sm font-bold text-slate-900">{section.title}</h3>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">
          {section.content}
        </p>
      </motion.div>
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen font-sans pb-20">
      {/* Header */}
      <div className="bg-primary text-white p-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/10 rounded-full">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold">Privacy Policy</h1>
        </div>
      </div>

      <div className="p-6 space-y-10 max-w-2xl mx-auto">
        <div className="space-y-4">
          <div className="w-16 h-1 bg-primary rounded-full" />
          <h2 className="text-3xl font-black text-slate-900 leading-tight">Your Privacy Matters</h2>
          <p className="text-slate-500 font-medium text-sm leading-relaxed">
            This Privacy Policy explains how Kisaankart collects, uses, and protects your personal information.
          </p>
        </div>

        <div className="space-y-8">
          {renderContent()}
        </div>

        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4">
          <Info size={20} className="text-primary shrink-0" />
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
            Last Modified: April 2026. Kisaankart reserves the right to update this policy at any time without prior notice.
          </p>
        </div>
      </div>
    </div>
  )
}
