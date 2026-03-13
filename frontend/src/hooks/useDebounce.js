import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value.
 * @param {any} value - The value to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {any} - The debounced value.
 */
export function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Custom hook to throttle a function.
 * @param {function} func - The function to throttle.
 * @param {number} limit - The limit in milliseconds.
 * @returns {function} - The throttled function.
 */
export function useThrottle(func, limit) {
    const [lastRun, setLastRun] = useState(Date.now());

    return (...args) => {
        if (Date.now() - lastRun >= limit) {
            func(...args);
            setLastRun(Date.now());
        }
    };
}
