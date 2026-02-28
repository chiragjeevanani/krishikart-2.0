import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function CTASection() {
    return (
        <section className="py-20 px-[5%] bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* For Vendors */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative overflow-hidden group rounded-[40px] bg-gradient-to-br from-landing-primary to-landing-primary-light p-10 text-white shadow-2xl"
                >
                    <div className="relative z-10">
                        <span className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 inline-block">For Sellers</span>
                        <h2 className="text-4xl font-black mb-4 leading-tight">Sell to thousands of customers</h2>
                        <p className="text-white/80 mb-8 text-lg">Partner with KrishiKart to supply your fresh produce to a wide network of buyers.</p>
                        <Link to="/vendor/signup" className="bg-white text-landing-primary px-8 py-3.5 rounded-full font-bold flex items-center gap-2 w-fit hover:bg-landing-bg transition-colors">
                            Register as a seller <ArrowUpRight size={20} />
                        </Link>
                    </div>
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                </motion.div>

                {/* For Customers */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative overflow-hidden group rounded-[40px] bg-gradient-to-br from-landing-secondary to-[#A67C00] p-10 text-white shadow-2xl"
                >
                    <div className="relative z-10">
                        <span className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 inline-block">For Buyers</span>
                        <h2 className="text-4xl font-black mb-4 leading-tight">Smarter sourcing, better harvest</h2>
                        <p className="text-white/80 mb-8 text-lg">Get the freshest produce at mandi rates delivered directly to your doorstep.</p>
                        <Link to="/login" className="bg-white text-landing-secondary px-8 py-3.5 rounded-full font-bold flex items-center gap-2 w-fit hover:bg-landing-bg transition-colors">
                            Signup now <ArrowUpRight size={20} />
                        </Link>
                    </div>
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                </motion.div>
            </div>
        </section>
    );
}
