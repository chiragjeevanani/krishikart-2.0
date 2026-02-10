export const deliveryPartner = {
    id: "DP-8829",
    name: "Rajesh Kumar",
    phone: "+91 98765 43210",
    rating: 4.8,
    totalDeliveries: 1240,
    vehicleInfo: {
        type: "Electric Scooter",
        number: "DL 3S ET 4521",
    },
    status: "online",
};

export const dashboardMetrics = {
    activeDeliveries: 1,
    completedToday: 12,
    totalEarningsToday: 850,
    performanceRating: 4.9,
};

export const deliveryRequests = [
    {
        id: "ORD-5521",
        franchise: "KrishiKart Franchise - Sector 62",
        franchiseAddress: "B-23, Hosiery Complex, Phase-II, Noida",
        customerName: "Amit Sharma",
        customerAddress: "Flat 402, Green View Apartments, Sector 45",
        distance: "3.2 km",
        itemsCount: 8,
        timeWindow: "15-20 mins",
        priority: "high",
        amount: 65,
    },
    {
        id: "ORD-5522",
        franchise: "KrishiKart Franchise - Sector 18",
        franchiseAddress: "Shop 12, Atta Market, Sector 18, Noida",
        customerName: "Priya Varma",
        customerAddress: "H-15, Golf Course Road, Sector 37",
        distance: "1.8 km",
        itemsCount: 4,
        timeWindow: "25-30 mins",
        priority: "medium",
        amount: 45,
    },
    {
        id: "ORD-5523",
        franchise: "KrishiKart Franchise - Sector 62",
        franchiseAddress: "B-23, Hosiery Complex, Phase-II, Noida",
        customerName: "Sanjay Gupta",
        customerAddress: "D-44, Indirapuram, Ghaziabad",
        distance: "5.5 km",
        itemsCount: 12,
        timeWindow: "40-45 mins",
        priority: "low",
        amount: 95,
    }
];

export const activeDelivery = {
    id: "ORD-5520",
    status: "on_the_way",
    pickup: {
        name: "KrishiKart Franchise - Sector 62",
        address: "B-23, Hosiery Complex, Phase-II, Noida",
        lat: 28.6273,
        lng: 77.3725,
        contact: "+91 11 4567 8901",
    },
    drop: {
        name: "Sunil Mehra",
        address: "C-112, Vasundhara, Enclave, Delhi",
        lat: 28.5986,
        lng: 77.3198,
        contact: "+91 91234 56789",
    },
    items: [
        { name: "Fresh Tomatoes", qty: "2 kg" },
        { name: "Organic Spinach", qty: "500 g" },
        { name: "Desi Bananas", qty: "1 dozen" },
        { name: "Alphonso Mangoes", qty: "1 kg" },
        { name: "Red Onions", qty: "5 kg" },
    ],
    totalBill: 450,
    eta: "8 mins",
    distance: "1.2 km left",
};

export const deliveryHistory = [
    {
        id: "ORD-5510",
        date: "20 Jan, 2026",
        customer: "Rohan Das",
        amount: 55,
        status: "delivered",
        time: "14:20",
    },
    {
        id: "ORD-5508",
        date: "20 Jan, 2026",
        customer: "Meera Nair",
        amount: 45,
        status: "delivered",
        time: "12:45",
    },
    {
        id: "ORD-5505",
        date: "20 Jan, 2026",
        customer: "Karan Johar",
        amount: 75,
        status: "delivered",
        time: "11:15",
    },
    {
        id: "ORD-5499",
        date: "19 Jan, 2026",
        customer: "Suresh Raina",
        amount: 60,
        status: "delivered",
        time: "18:30",
    }
];

// Predefined route coordinates for simulation (Noida area)
export const routeCoordinates = [
    [28.6273, 77.3725], // Startup point
    [28.6250, 77.3700],
    [28.6220, 77.3650],
    [28.6180, 77.3600],
    [28.6150, 77.3550],
    [28.6120, 77.3500],
    [28.6080, 77.3450],
    [28.6050, 77.3400],
    [28.6020, 77.3300],
    [28.6000, 77.3250],
    [28.5986, 77.3198], // End point
];
