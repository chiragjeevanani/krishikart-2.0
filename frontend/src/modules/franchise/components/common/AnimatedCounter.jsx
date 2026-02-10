import { useState, useEffect } from 'react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';

export default function AnimatedCounter({ value, prefix = '', suffix = '' }) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const controls = animate(0, value, {
            duration: 1.5,
            ease: "easeOut",
            onUpdate: (latest) => setDisplayValue(Math.floor(latest))
        });
        return controls.stop;
    }, [value]);

    return (
        <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>
    );
}
