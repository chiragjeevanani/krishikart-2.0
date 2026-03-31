import { createContext, useContext, useState, useEffect } from 'react';

const FilterContext = createContext();

export function FilterProvider({ children }) {
    const [vegMode, setVegMode] = useState(() => {
        try {
            const saved = localStorage.getItem('kk_veg_mode');
            if (saved === null) return false;
            return JSON.parse(saved);
        } catch (error) {
            console.error('Failed to parse vegMode from localStorage:', error);
            return false;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('kk_veg_mode', JSON.stringify(vegMode));
        } catch (error) {
            console.error('Failed to save vegMode to localStorage:', error);
        }
    }, [vegMode]);

    // Cross-tab synchronization
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'kk_veg_mode' && e.newValue) {
                try {
                    const nextValue = JSON.parse(e.newValue);
                    if (nextValue !== vegMode) setVegMode(nextValue);
                } catch (error) {
                    console.error('Failed to sync storage change:', error);
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [vegMode]);

    const toggleVegMode = () => setVegMode(prev => !prev);

    return (
        <FilterContext.Provider value={{ vegMode, setVegMode, toggleVegMode }}>
            {children}
        </FilterContext.Provider>
    );
}

export function useFilter() {
    const context = useContext(FilterContext);
    if (!context) throw new Error('useFilter must be used within FilterProvider');
    return context;
}
