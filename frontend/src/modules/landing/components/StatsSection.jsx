import { motion } from 'framer-motion';

const stats = [
    { label: 'Products', value: '50+' },
    { label: 'Franchises', value: '10+' },
    { label: 'Deliveries', value: '500+' },
    { label: 'Vendors', value: '100+' }
];

export default function StatsSection() {
    return (
        <section className="stats-section">
            {stats.map((stat, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="stat-item"
                >
                    <h3>{stat.value}</h3>
                    <p>{stat.label}</p>
                </motion.div>
            ))}
        </section>
    );
}
