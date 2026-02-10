import React, { createContext, useContext, useState, useEffect } from 'react';
import mockPurchaseOrders from '../data/mockPurchaseOrders.json';
import { useInventory } from './InventoryContext';
import { calculateVendorPayment } from '../../masteradmin/utils/PaymentCalculator';

const GRNContext = createContext();

export const GRNProvider = ({ children }) => {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [completedGRNs, setCompletedGRNs] = useState([]);
    const [ledgerEntries, setLedgerEntries] = useState([]);
    const { addStock } = useInventory();

    useEffect(() => {
        const savedPOs = localStorage.getItem('franchise_pos');
        const savedGRNs = localStorage.getItem('franchise_grns');
        const savedLedger = localStorage.getItem('company_ledger_sync');

        if (savedPOs) setPurchaseOrders(JSON.parse(savedPOs));
        else setPurchaseOrders(mockPurchaseOrders);

        if (savedGRNs) setCompletedGRNs(JSON.parse(savedGRNs));
        if (savedLedger) setLedgerEntries(JSON.parse(savedLedger));
    }, []);

    useEffect(() => {
        localStorage.setItem('franchise_pos', JSON.stringify(purchaseOrders));
        localStorage.setItem('franchise_grns', JSON.stringify(completedGRNs));
        localStorage.setItem('company_ledger_sync', JSON.stringify(ledgerEntries));
    }, [purchaseOrders, completedGRNs, ledgerEntries]);

    const submitGRN = (poNumber, receivedItems) => {
        // Find PO for details (check both poNumber and standard id)
        const po = purchaseOrders.find(p => p.poNumber === poNumber) ||
            purchaseOrders.find(p => p.id === poNumber);

        const vendorName = po ? po.vendor : 'KrishiKart Indore';

        // 1. Calculate Payment based on reception
        // Handle items mapping for both mock POs and live orders
        const poItems = po ? po.items.map(item => ({
            id: item.productId,
            name: item.productName || item.name,
            expectedQty: item.orderedQty || item.expectedQty,
            totalAmount: item.totalAmount || ((item.orderedQty || item.expectedQty) * 100)
        })) : receivedItems.map(item => ({
            id: item.productId,
            name: item.name,
            expectedQty: item.expectedQty,
            totalAmount: item.expectedQty * 100
        }));

        const grnItems = receivedItems.map(item => ({
            id: item.productId,
            receivedQty: item.receivedQty,
            damageQty: item.damageQty || 0,
            damageReason: item.damageReason
        }));

        const paymentUpdate = calculateVendorPayment(poItems, grnItems);

        // 2. Mark PO as completed or update status
        setPurchaseOrders(prev => prev.filter(p => (p.poNumber || p.id) !== poNumber));

        // 3. Add to completed GRNs
        const newGRN = {
            id: `GRN-${Date.now()}`,
            poNumber,
            vendor: vendorName,
            receivedDate: new Date().toISOString(),
            items: receivedItems,
            paymentSummary: paymentUpdate
        };
        setCompletedGRNs(prev => [newGRN, ...prev]);

        // 4. Update Inventory
        const inventoryUpdates = receivedItems.map(item => ({
            productId: item.productId,
            qty: item.acceptedQty || (item.receivedQty - (item.damageQty || 0))
        }));
        addStock(inventoryUpdates);

        // 5. Simulate Company Settlement Entry
        const ledgerUpdate = {
            id: `TXN-${Date.now()}`,
            date: new Date().toISOString(),
            type: 'vendor_payable',
            vendor: vendorName,
            amount: paymentUpdate.totalPayableAmount,
            originalPOAmount: paymentUpdate.totalOriginalAmount,
            deductions: paymentUpdate.totalDeductions,
            status: 'Pending Settlement'
        };
        setLedgerEntries(prev => [ledgerUpdate, ...prev]);
    };

    return (
        <GRNContext.Provider value={{
            purchaseOrders,
            completedGRNs,
            ledgerEntries,
            submitGRN
        }}>
            {children}
        </GRNContext.Provider>
    );
};

export const useGRN = () => {
    const context = useContext(GRNContext);
    if (!context) throw new Error('useGRN must be used within GRNProvider');
    return context;
};
