/**
 * Utility to calculate vendor payments and deductions based on GRN data.
 */

export const calculateVendorPayment = (poItems, grnItems) => {
    let totalOriginalAmount = 0;
    let totalPayableAmount = 0;
    let totalDeductions = 0;

    const itemBreakdown = poItems.map(poItem => {
        const grnItem = grnItems.find(g => g.id === poItem.id || g.productId === poItem.productId);
        const acceptedQty = grnItem ? grnItem.receivedQty - (grnItem.damageQty || 0) : 0;
        const orderedQty = poItem.orderedQty || poItem.expectedQty;
        const unitPrice = poItem.price || (poItem.totalAmount / orderedQty);

        const originalAmount = orderedQty * unitPrice;
        const payableAmount = acceptedQty * unitPrice;
        const deduction = originalAmount - payableAmount;

        totalOriginalAmount += originalAmount;
        totalPayableAmount += payableAmount;
        totalDeductions += deduction;

        return {
            name: poItem.name || poItem.productName,
            orderedQty,
            acceptedQty,
            unitPrice,
            originalAmount,
            payableAmount,
            deduction,
            remarks: grnItem?.damageReason || (acceptedQty < orderedQty ? 'Shortage' : 'OK')
        };
    });

    return {
        totalOriginalAmount,
        totalPayableAmount,
        totalDeductions,
        itemBreakdown,
        settlementStatus: totalDeductions > 0 ? 'Adjusted' : 'Full'
    };
};
