# Split Order Tracking Feature

## Overview
जब user 3-4 products order करता है और वो order split हो जाता है (different franchises/categories से), तो अब user को हर split order को अलग-अलग track करने का option मिलेगा।

## Features Added

### 1. Enhanced `getMyOrders` API
**Endpoint:** `GET /api/orders/my-orders`

**Response Structure:**
```json
{
  "success": true,
  "message": "Orders fetched successfully",
  "data": [
    {
      "orderGroupId": "507f1f77bcf86cd799439011",
      "isSplitOrder": true,
      "totalOrders": 3,
      "grandTotal": 1500,
      "createdAt": "2026-04-30T10:30:00.000Z",
      "paymentMethod": "Wallet",
      "shippingAddress": "123 Main St, City",
      "allDelivered": false,
      "anyInProgress": true,
      "anyCancelled": false,
      "orders": [
        {
          "_id": "order1_id",
          "items": [...],
          "orderStatus": "Dispatched",
          "franchiseId": {...},
          "deliveryPartnerId": {...},
          "totalAmount": 500
        },
        {
          "_id": "order2_id",
          "items": [...],
          "orderStatus": "Packed",
          "franchiseId": {...},
          "totalAmount": 600
        },
        {
          "_id": "order3_id",
          "items": [...],
          "orderStatus": "Accepted",
          "franchiseId": {...},
          "totalAmount": 400
        }
      ]
    },
    {
      "_id": "standalone_order_id",
      "isSplitOrder": false,
      "items": [...],
      "orderStatus": "Delivered",
      "totalAmount": 800
    }
  ]
}
```

**Key Features:**
- Split orders को group करके दिखाता है
- हर group में सभी split orders की details
- Group summary (total orders, grand total, delivery status)
- Standalone orders को separately दिखाता है

### 2. New `getOrdersByGroupId` API
**Endpoint:** `GET /api/orders/group/:orderGroupId`

**Purpose:** एक specific split order group की सभी orders को fetch करना

**Response Structure:**
```json
{
  "success": true,
  "message": "Split orders fetched successfully",
  "data": {
    "orderGroupId": "507f1f77bcf86cd799439011",
    "totalOrders": 3,
    "grandTotal": 1500,
    "allDelivered": false,
    "anyInProgress": true,
    "anyCancelled": false,
    "orders": [
      {
        "_id": "order1_id",
        "items": [...],
        "orderStatus": "Dispatched",
        "franchiseId": {
          "storeName": "Store A",
          "franchiseName": "Franchise A",
          "mobile": "1234567890",
          "address": "Address A",
          "location": {...}
        },
        "deliveryPartnerId": {
          "fullName": "Delivery Person A",
          "mobile": "9876543210",
          "vehicleNumber": "DL01AB1234"
        },
        "totalAmount": 500,
        "items": [...]
      },
      // ... more orders
    ]
  }
}
```

**Security:**
- User को sirf apne orders access करने की permission hai
- Authorization check: User must own at least one order in the group

## Frontend Integration Guide

### 1. Display Split Orders in Order List

```javascript
// Fetch user orders
const response = await fetch('/api/orders/my-orders', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data: orders } = await response.json();

// Display orders
orders.forEach(order => {
  if (order.isSplitOrder) {
    // Display as grouped order
    console.log(`Split Order Group: ${order.orderGroupId}`);
    console.log(`Total Orders: ${order.totalOrders}`);
    console.log(`Grand Total: ₹${order.grandTotal}`);
    console.log(`Status: ${order.allDelivered ? 'All Delivered' : 'In Progress'}`);
    
    // Show individual orders in the group
    order.orders.forEach((subOrder, index) => {
      console.log(`  Order ${index + 1}:`);
      console.log(`    ID: ${subOrder._id}`);
      console.log(`    Status: ${subOrder.orderStatus}`);
      console.log(`    Amount: ₹${subOrder.totalAmount}`);
      console.log(`    Franchise: ${subOrder.franchiseId?.franchiseName}`);
    });
  } else {
    // Display as standalone order
    console.log(`Order ID: ${order._id}`);
    console.log(`Status: ${order.orderStatus}`);
    console.log(`Amount: ₹${order.totalAmount}`);
  }
});
```

### 2. Track Individual Split Orders

```javascript
// When user clicks on a split order group
const orderGroupId = "507f1f77bcf86cd799439011";

const response = await fetch(`/api/orders/group/${orderGroupId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data: groupDetails } = await response.json();

// Display tracking for each order
groupDetails.orders.forEach((order, index) => {
  console.log(`\n--- Order ${index + 1} of ${groupDetails.totalOrders} ---`);
  console.log(`Order ID: ${order._id.slice(-6)}`);
  console.log(`Status: ${order.orderStatus}`);
  console.log(`Amount: ₹${order.totalAmount}`);
  
  // Franchise details
  if (order.franchiseId) {
    console.log(`\nFulfilled by: ${order.franchiseId.franchiseName}`);
    console.log(`Store: ${order.franchiseId.storeName}`);
    console.log(`Contact: ${order.franchiseId.mobile}`);
  }
  
  // Delivery partner details
  if (order.deliveryPartnerId) {
    console.log(`\nDelivery Partner: ${order.deliveryPartnerId.fullName}`);
    console.log(`Contact: ${order.deliveryPartnerId.mobile}`);
    console.log(`Vehicle: ${order.deliveryPartnerId.vehicleNumber}`);
  }
  
  // Items in this order
  console.log(`\nItems:`);
  order.items.forEach(item => {
    console.log(`  - ${item.name}: ${item.quantity} ${item.unit}`);
  });
});
```

### 3. UI Components Suggestions

#### Order List Card (Split Order)
```
┌─────────────────────────────────────────┐
│ 🛒 Split Order #ABC123                  │
│ 📦 3 separate deliveries                │
│ 💰 Total: ₹1,500                        │
│                                         │
│ ✅ Order 1: Delivered                   │
│ 🚚 Order 2: Out for Delivery           │
│ 📦 Order 3: Packed                      │
│                                         │
│ [Track All Orders →]                    │
└─────────────────────────────────────────┘
```

#### Individual Order Tracking
```
┌─────────────────────────────────────────┐
│ Order 1 of 3 - #XYZ789                  │
│                                         │
│ Status: Out for Delivery 🚚             │
│ Amount: ₹500                            │
│                                         │
│ Fulfilled by: Franchise A               │
│ 📍 Store A, Address                     │
│ 📞 1234567890                           │
│                                         │
│ Delivery Partner: John Doe              │
│ 📞 9876543210                           │
│ 🚗 DL01AB1234                           │
│                                         │
│ Items:                                  │
│ • Product A: 2 kg                       │
│ • Product B: 1 piece                    │
│                                         │
│ [View Details] [Contact Support]        │
└─────────────────────────────────────────┘
```

## Database Schema

### Order Model (Existing Fields Used)
```javascript
{
  orderGroupId: String,           // Same for all split orders
  fulfillmentCategoryId: ObjectId, // Category this order belongs to
  franchiseId: ObjectId,          // Franchise fulfilling this order
  deliveryPartnerId: ObjectId,    // Delivery partner assigned
  items: [...],                   // Products in this specific order
  totalAmount: Number,            // Amount for this split order
  orderStatus: String,            // Status of this specific order
  // ... other fields
}
```

## Benefits

1. **Better User Experience:**
   - User ko clear visibility milti hai ki unka order kitne parts mein split hua
   - Har part ko separately track kar sakte hain
   - Different franchises aur delivery partners ki details

2. **Transparency:**
   - User ko pata chalega ki kaunsa product kahan se aa raha hai
   - Har order ki alag delivery timeline

3. **Easy Tracking:**
   - Ek hi screen se saare split orders track kar sakte hain
   - Individual order details bhi available

4. **Support:**
   - Agar kisi specific order mein issue hai, toh user us specific franchise/delivery partner se contact kar sakta hai

## Testing

### Test Case 1: Create Split Order
```bash
# Place an order with products from different categories
POST /api/orders/place
{
  "shippingAddress": "123 Main St, City",
  "shippingLocation": { "coordinates": [77.1234, 28.5678] },
  "paymentMethod": "Wallet",
  "deliveryShift": "Morning"
}

# Response will include orderGroupId if order is split
```

### Test Case 2: Fetch My Orders
```bash
GET /api/orders/my-orders
Authorization: Bearer <token>

# Response will show grouped split orders
```

### Test Case 3: Track Split Order Group
```bash
GET /api/orders/group/507f1f77bcf86cd799439011
Authorization: Bearer <token>

# Response will show all orders in the group with full details
```

## Error Handling

1. **Invalid orderGroupId:**
   - Status: 404
   - Message: "No orders found for this group"

2. **Unauthorized Access:**
   - Status: 403
   - Message: "Unauthorized access to this order group"

3. **Server Error:**
   - Status: 500
   - Message: "Server error"

## Future Enhancements

1. **Real-time Updates:**
   - Socket.io integration for live order status updates
   - Notifications when any split order status changes

2. **Delivery Tracking:**
   - Live location tracking for each delivery partner
   - Estimated delivery time for each split order

3. **Consolidated Invoice:**
   - Single invoice for all split orders in a group
   - Option to download individual invoices

4. **Smart Grouping:**
   - Group orders by delivery date
   - Show which orders will arrive together

## API Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/orders/my-orders` | GET | User | Get all orders (grouped by orderGroupId) |
| `/api/orders/group/:orderGroupId` | GET | User | Get all orders in a split order group |
| `/api/orders/:id` | GET | User | Get single order details |

## Notes

- `orderGroupId` is automatically generated during checkout when order is split
- All orders in a group share the same `orderGroupId`
- Each order in the group has its own `_id`, `franchiseId`, `deliveryPartnerId`, and `orderStatus`
- User can track each order independently
- Group summary shows overall status of all orders
