# Split Order Tracking - Frontend Implementation

## ✅ Changes Made

### 1. **OrdersScreen.jsx** - Enhanced Order List
**File:** `frontend/src/modules/user/pages/OrdersScreen.jsx`

**Changes:**
- ✅ Added support for split orders (grouped by `orderGroupId`)
- ✅ Shows split order indicator (🛒 icon)
- ✅ Displays number of deliveries for split orders
- ✅ Shows status of each sub-order
- ✅ "Track All" button for split orders
- ✅ Fixed error: `Cannot read properties of undefined (reading 'slice')`

**Features:**
```jsx
// Split Order Card
┌─────────────────────────────────────┐
│ 🛒 3 Products • 3 deliveries        │
│ #ABC12345                           │
│ ₹2,450                              │
│                                     │
│ • Order 1: Out for Delivery         │
│ • Order 2: Packed                   │
│ • Order 3: Accepted                 │
│                                     │
│ [Track All →]                       │
└─────────────────────────────────────┘
```

### 2. **SplitOrderTrackingScreen.jsx** - New Page
**File:** `frontend/src/modules/user/pages/SplitOrderTrackingScreen.jsx`

**Features:**
- ✅ Displays all orders in a split order group
- ✅ Shows order summary (total amount, number of deliveries)
- ✅ Individual tracking for each order
- ✅ Franchise details with contact info
- ✅ Delivery partner details
- ✅ Item-wise breakdown
- ✅ Status timeline for each order
- ✅ "View Full Details" button for each order

**UI Components:**
```jsx
// Order Card
┌─────────────────────────────────────┐
│ Order 1 of 3 • #ABC123              │
│ 🚚 Out for Delivery                 │
│ ₹350                                │
│                                     │
│ 🏪 Fulfilled By                     │
│    Green Valley Franchise           │
│    📞 9876543210                    │
│                                     │
│ 🛵 Delivery Partner                 │
│    Amit Singh                       │
│    📞 9123456789                    │
│    🚗 KA01AB1234                    │
│                                     │
│ 📦 Items                            │
│    • Tomato: 5 kg                   │
│    • Onion: 3 kg                    │
│                                     │
│ 📍 Tracking                         │
│    ✅ Placed                        │
│    ✅ Accepted                      │
│    ✅ Packed                        │
│    🚚 Out for Delivery              │
│                                     │
│ [View Full Details]                 │
└─────────────────────────────────────┘
```

### 3. **App.jsx** - Route Added
**File:** `frontend/src/App.jsx`

**Changes:**
- ✅ Imported `SplitOrderTrackingScreen`
- ✅ Added route: `/split-order/:orderGroupId`

```jsx
<Route path="/split-order/:orderGroupId" element={<SplitOrderTrackingScreen />} />
```

---

## 🔄 Data Flow

### 1. Order List Flow
```
User opens "My Orders"
         ↓
API: GET /api/orders/my-orders
         ↓
Backend returns grouped + standalone orders
         ↓
Frontend checks order.isSplitOrder
         ↓
If true: Show split order card
If false: Show regular order card
```

### 2. Split Order Tracking Flow
```
User clicks "Track All" on split order
         ↓
Navigate to /split-order/:orderGroupId
         ↓
API: GET /api/orders/group/:orderGroupId
         ↓
Backend returns all orders in group
         ↓
Frontend displays each order separately
```

---

## 🎨 UI Features

### Split Order Indicators
- **🛒 Icon** - Indicates split order
- **"X deliveries"** - Shows number of separate deliveries
- **Status dots** - Color-coded status for each sub-order
- **"Track All" button** - Opens detailed tracking page

### Status Colors
```javascript
✅ Delivered/Received    → Green
🚚 Out for Delivery      → Blue
📦 Packed/Ready          → Purple
⏳ Accepted/Placed       → Amber
❌ Cancelled             → Red
```

### Responsive Design
- Mobile-first approach
- Smooth animations with Framer Motion
- Touch-friendly buttons
- Optimized for small screens

---

## 🔧 Technical Details

### API Integration
```javascript
// Fetch split order details
const response = await api.get(`/orders/group/${orderGroupId}`)
const groupDetails = response.data.data

// Structure:
{
  orderGroupId: "663f1a2b3c4d5e6f7a8b9c0d",
  totalOrders: 3,
  grandTotal: 2450,
  allDelivered: false,
  anyInProgress: true,
  orders: [...]
}
```

### Error Handling
- ✅ Loading states with skeleton screens
- ✅ Empty state handling
- ✅ Error toast notifications
- ✅ Fallback for missing data
- ✅ Safe navigation (null checks)

### Performance Optimizations
- Lazy loading of images
- Staggered animations (delay based on index)
- Memoized status calculations
- Efficient re-renders

---

## 🧪 Testing Checklist

### Visual Testing
- [ ] Split order card displays correctly
- [ ] Status indicators show proper colors
- [ ] Icons render properly
- [ ] Responsive on mobile devices
- [ ] Animations are smooth

### Functional Testing
- [ ] Click "Track All" navigates correctly
- [ ] API calls work properly
- [ ] Loading states display
- [ ] Error states handle gracefully
- [ ] Contact buttons work (tel: links)

### Edge Cases
- [ ] Single item in split order
- [ ] All orders delivered
- [ ] All orders cancelled
- [ ] Missing franchise details
- [ ] Missing delivery partner
- [ ] Empty items array

---

## 🐛 Bug Fixes

### Fixed: `Cannot read properties of undefined (reading 'slice')`
**Issue:** When backend returns split orders, `order._id` was undefined because split orders use `orderGroupId`.

**Solution:**
```javascript
// Before (Error)
order._id.slice(-8)

// After (Fixed)
const orderId = isSplitOrder ? order.orderGroupId : order._id;
orderId.toString().slice(-8)
```

---

## 📱 User Experience

### Before (Without Split Order Tracking)
```
User orders 3 products
         ↓
Sees 3 separate orders
         ↓
Confused about which order is which
         ↓
Has to track each separately
         ↓
Poor experience ❌
```

### After (With Split Order Tracking)
```
User orders 3 products
         ↓
Sees 1 grouped order with 3 deliveries
         ↓
Clicks "Track All"
         ↓
Sees all 3 orders with details
         ↓
Can track each individually
         ↓
Great experience ✅
```

---

## 🚀 Future Enhancements

### Phase 1 (Immediate)
- [ ] Real-time status updates via WebSocket
- [ ] Push notifications for status changes
- [ ] Delivery time estimation

### Phase 2 (Short-term)
- [ ] Live location tracking on map
- [ ] Chat with delivery partner
- [ ] Rate each delivery separately

### Phase 3 (Long-term)
- [ ] Consolidated invoice download
- [ ] Smart grouping by delivery date
- [ ] Predictive delivery time

---

## 📝 Code Examples

### Check if Order is Split
```javascript
const isSplitOrder = order.isSplitOrder === true;
```

### Get Order ID
```javascript
const orderId = isSplitOrder ? order.orderGroupId : order._id;
```

### Navigate to Tracking
```javascript
if (isSplitOrder) {
  navigate(`/split-order/${order.orderGroupId}`);
} else {
  navigate(`/order-detail/${order._id}`);
}
```

### Display Status
```javascript
const displayStatus = isSplitOrder ? 
  (order.allDelivered ? 'delivered' : 
   order.anyInProgress ? 'in_progress' : 'placed') :
  getDisplayStatus(order);
```

---

## 🎯 Key Takeaways

1. **Backward Compatible** - Works with existing orders
2. **User-Friendly** - Clear visual indicators
3. **Informative** - Shows all relevant details
4. **Responsive** - Works on all devices
5. **Performant** - Optimized rendering
6. **Error-Proof** - Handles edge cases

---

## 📞 Support

### Common Issues

**Issue:** Split orders not showing
**Solution:** Check if backend is returning `isSplitOrder: true`

**Issue:** Navigation not working
**Solution:** Verify route is added in App.jsx

**Issue:** API errors
**Solution:** Check if backend endpoint `/orders/group/:id` exists

---

## ✅ Deployment Checklist

- [x] Code implemented
- [x] Error fixed
- [x] Route added
- [x] Component created
- [ ] Tested on mobile
- [ ] Tested on desktop
- [ ] API integration verified
- [ ] Error handling tested
- [ ] Ready for production

---

**Last Updated:** April 30, 2026  
**Version:** 1.0.0  
**Status:** ✅ Ready for Testing
