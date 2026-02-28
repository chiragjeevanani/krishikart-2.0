import { motion } from 'framer-motion';
import { Search, ShoppingBag, Package, Truck } from 'lucide-react';

const steps = [
    {
        icon: <Search size={32} />,
        title: 'Browse',
        description: 'Find the freshest produce and best deals from local vendors.'
    },
    {
        icon: <ShoppingBag size={32} />,
        title: 'Order',
        description: 'Securely place your order using COD or online payments.'
    },
    {
        icon: <Package size={32} />,
        title: 'Pack',
        description: 'Our nearest franchise partner packs your order with care.'
    },
    {
        icon: <Truck size={32} />,
        title: 'Delivery',
        description: 'Get your farm-fresh produce delivered within 24 hours.'
    }
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 px-[5%] bg-white overflow-hidden">
            <div className="text-center mb-20">
                <h1 className="text-4xl md:text-5xl font-black text-landing-primary tracking-tighter mb-4">How it Works</h1>
                <p className="text-slate-500 font-medium">Simple 4-step process from farm to your kitchen</p>
            </div>

            <div className="relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-landing-bg -translate-y-1/2 z-0" />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15 }}
                            className="flex flex-col items-center text-center"
                        >
                            <div className="w-24 h-24 bg-landing-primary text-white rounded-[32px] flex items-center justify-center mb-8 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-300">
                                {step.icon}
                                <div className="absolute -top-3 -right-3 w-10 h-10 bg-landing-secondary rounded-full flex items-center justify-center font-black text-sm shadow-lg">
                                    {index + 1}
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-landing-primary mb-3">{step.title}</h3>
                            <p className="text-slate-600 font-medium leading-relaxed px-4">{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
