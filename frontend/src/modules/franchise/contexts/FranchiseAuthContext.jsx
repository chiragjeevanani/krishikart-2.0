import { createContext, useContext, useState, useEffect } from 'react';

const FranchiseAuthContext = createContext();

export function FranchiseAuthProvider({ children }) {
    const [franchise, setFranchise] = useState(() => {
        const saved = localStorage.getItem('kk_franchise');
        return saved ? JSON.parse(saved) : null;
    });

    const login = (mobile, otp) => {
        // Mock login - in a real app, this would be an API call
        const mockFranchise = {
            id: mobile, // Using mobile as ID for now
            name: "KrishiKart Franchise - Delhi South",
            location: "Malviya Nagar, New Delhi",
            owner: "Rajesh Kumar",
            role: "franchise_owner"
        };
        setFranchise(mockFranchise);
        localStorage.setItem('kk_franchise', JSON.stringify(mockFranchise));
        return true;
    };

    const logout = () => {
        setFranchise(null);
        localStorage.removeItem('kk_franchise');
    };

    return (
        <FranchiseAuthContext.Provider value={{ franchise, login, logout, isAuthenticated: !!franchise }}>
            {children}
        </FranchiseAuthContext.Provider>
    );
}

export function useFranchiseAuth() {
    const context = useContext(FranchiseAuthContext);
    return context;
}
