import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
    {
        name: 'Rajesh Kumar',
        role: 'Farmer, Punjab',
        quote: 'KrishiKart has completely changed how I sell my produce. I get better rates and timely payments directly in my bank account.'
    },
    {
        name: 'Amit Sharma',
        role: 'Franchise Owner, Delhi',
        quote: 'Being a franchise partner is rewarding. The platform is easy to use and helps us manage orders efficiently.'
    },
    {
        name: 'Priya Singh',
        role: 'Regular Buyer, Noida',
        quote: 'The freshness of vegetables is unmatched. It feels like getting produce directly from the farm every morning.'
    }
];

export default function TestimonialSection() {
    return (
        <section className="py-24 px-[5%] bg-landing-primary overflow-hidden">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4">What Our Community Says</h2>
                <div className="w-20 h-1.5 bg-landing-primary-light mx-auto rounded-full" />
            </div>

            <div className="flex flex-wrap justify-center gap-8">
                {testimonials.map((t, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-[40px] max-w-sm relative group hover:bg-white hover:text-landing-primary transition-all duration-500"
                    >
                        <Quote className="absolute top-6 right-8 text-white/20 group-hover:text-landing-primary/10" size={60} />
                        <p className="text-white group-hover:text-slate-700 italic mb-8 relative z-10 font-medium leading-relaxed">
                            "{t.quote}"
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-landing-primary-light rounded-full flex items-center justify-center font-bold text-white">
                                {t.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-white group-hover:text-landing-primary">{t.name}</h4>
                                <p className="text-white/60 group-hover:text-slate-500 text-sm font-semibold">{t.role}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
