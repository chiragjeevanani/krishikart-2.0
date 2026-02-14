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
            id: "FR-4829",
            name: "KrishiKart Franchise - Delhi South",
            owner: "Rajesh Kumar",
            mobile: mobile,
            email: "rajesh@krishikart.com",
            city: "New Delhi",
            role: "franchise_owner",
            isVerified: true,
            createdAt: "2023-10-15",
            profilePicture: null
        };
        setFranchise(mockFranchise);
        localStorage.setItem('kk_franchise', JSON.stringify(mockFranchise));
        return true;
    };

    const updateProfile = async (data) => {
        // Mock API call
        const updatedFranchise = { ...franchise, ...data };
        setFranchise(updatedFranchise);
        localStorage.setItem('kk_franchise', JSON.stringify(updatedFranchise));
        return { success: true };
    };

    const updatePassword = async (oldPassword, newPassword) => {
        // Mock API call
        console.log('Password updated successfully');
        return { success: true };
    };

    const logout = () => {
        setFranchise(null);
        localStorage.removeItem('kk_franchise');
    };

    return (
        <FranchiseAuthContext.Provider value={{
            franchise,
            login,
            logout,
            updateProfile,
            updatePassword,
            isAuthenticated: !!franchise
        }}>
            {children}
        </FranchiseAuthContext.Provider>
    );
}

export function useFranchiseAuth() {
    const context = useContext(FranchiseAuthContext);
    return context;
}
