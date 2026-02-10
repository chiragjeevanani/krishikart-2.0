/**
 * Utility to determine order routing strategy based on franchise stock availability.
 */

export const checkFranchiseStockLevels = (orderItems, franchiseInventory) => {
    return orderItems.map(item => {
        const stockItem = franchiseInventory.find(inv => inv.productId === item.id || inv.id === item.id);
        const availableQty = stockItem ? stockItem.currentStock : 0;
        const requiredQty = item.quantity || item.qty;

        return {
            ...item,
            availableInFranchise: availableQty >= requiredQty,
            availableQty,
            missingQty: Math.max(0, requiredQty - availableQty)
        };
    });
};

export const getFulfillmentStrategy = (orderItems, franchiseInventory) => {
    const status = checkFranchiseStockLevels(orderItems, franchiseInventory);
    const fullyAvailable = status.every(item => item.availableInFranchise);
    const partialAvailable = status.some(item => item.availableInFranchise);

    if (fullyAvailable) {
        return {
            type: 'franchise_stock',
            label: 'Direct Dispatch',
            status,
            requiresProcurement: false
        };
    }

    return {
        type: 'requires_procurement',
        label: partialAvailable ? 'Partial Procurement' : 'Full Procurement',
        status,
        requiresProcurement: true,
        procurementList: status.filter(item => item.missingQty > 0)
    };
};
