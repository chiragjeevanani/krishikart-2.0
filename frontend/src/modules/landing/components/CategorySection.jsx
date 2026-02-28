import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '@/lib/axios';

export default function CategorySection() {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/catalog/categories');
                if (response.data.success) {
                    setCategories(response.data.results);
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
                // Fallback categories
                setCategories([
                    { name: 'Vegetables', image: 'https://images.unsplash.com/photo-1566385101042-1a000c1268c4?w=400' },
                    { name: 'Fruits', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400' },
                    { name: 'Dairy', image: 'https://images.unsplash.com/photo-1550583724-1255818c053b?w=400' },
                    { name: 'Grains', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' }
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCategories();
    }, []);

    return (
        <section id="categories" className="py-20 px-[5%] bg-landing-bg">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-black text-landing-primary mb-4 uppercase tracking-tighter">Our Categories</h2>
                <p className="text-slate-600 max-w-2xl mx-auto">Explore our wide range of farm-fresh produce and agricultural supplies.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories.map((category, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Link
                            to="/login"
                            className="group relative block aspect-[4/5] rounded-[32px] overflow-hidden bg-white shadow-lg shadow-slate-200/50"
                        >
                            <img
                                src={category.image}
                                alt={category.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                                <h3 className="text-white text-2xl font-black mb-1 group-hover:translate-x-2 transition-transform">{category.name}</h3>
                                <p className="text-white/60 text-sm font-semibold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Browse Now</p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
