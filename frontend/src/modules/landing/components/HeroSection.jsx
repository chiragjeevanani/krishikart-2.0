import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
    return (
        <section className="hero-section">
            <div className="hero-content">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="hero-tag">Direct from Farm</span>
                    <h1 className="hero-title">
                        Farm Fresh, <span className="text-landing-primary-light">Direct</span> to Your Doorstep
                    </h1>
                    <p className="hero-description">
                        Quality agricultural produce from local farmers, delivered through our efficient franchise network. Smarter sourcing for a better harvest.
                    </p>
                    <div className="hero-ctas">
                        <Link to="/login" className="landing-cta-button flex items-center gap-2">
                            Start Shopping <ArrowRight size={18} />
                        </Link>
                        <Link to="/vendor/signup" className="border-2 border-landing-primary text-landing-primary px-6 py-2.5 rounded-full font-semibold hover:bg-landing-primary hover:text-white transition-all">
                            Become a Vendor
                        </Link>
                    </div>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="hero-image-container"
            >
                <div className="relative w-full h-full">
                    <img
                        src="/assets/landing_hero.png"
                        alt="Fresh Produce"
                        className="w-full h-full object-cover rounded-l-[100px] shadow-2xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent to-landing-bg/20 rounded-l-[100px]" />
                </div>
            </motion.div>
        </section>
    );
}
