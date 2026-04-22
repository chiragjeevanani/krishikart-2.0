/**
 * Debug: Test the new city extraction logic + simulate assignment query
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import Franchise from './app/models/franchise.js';
import { latLngToCell } from 'h3-js';

// Simulate the new city extraction logic
function extractCity(shippingAddress) {
  const parts = shippingAddress.split(",").map((p) => p.trim()).filter(Boolean);
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    if (/\d{4,6}/.test(part)) continue;
    return part;
  }
  return null;
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('✅ Connected\n');

  const testAddresses = [
    "Flat: 11, Floor: 2 Rajshree Palace, Pipliyahana Rd, Landmark: Rajshri Palace Colony, Vandana Nagar, Indore",
    "Flat: b 10/6 vasant vihar Ujjain, Floor: 1, ujjain, Landmark: Near nanakheda, Ujjain, Madhya Pradesh, 456010",
    "Flat: Hotel Samsara, Floor: 12, Near The Hub, Landmark: Brilliant convention, Indore, Madhya Pradesh",
    "Flat: 123, Floor: PV6X+9XPa, 214, Landmark: Rajshri Palace Colony, Pipliyahana, Indore",
  ];

  console.log('═══ City Extraction Test ═══');
  for (const addr of testAddresses) {
    const city = extractCity(addr);
    console.log(`Address: ...${addr.slice(-40)}`);
    console.log(`Extracted city: "${city}"\n`);
  }

  // Now test the actual DB query for the first order
  const orderAddress = "Flat: 11, Floor: 2 Rajshree Palace, Pipliyahana Rd, Landmark: Rajshri Palace Colony, Vandana Nagar, Indore";
  const city = extractCity(orderAddress);
  const lat = 22.70888;
  const lng = 75.8937547;
  const orderHex = latLngToCell(lat, lng, 8);

  console.log('═══ Assignment Query Simulation ═══');
  console.log(`Order coords: [${lng}, ${lat}]`);
  console.log(`Order H3 hex: ${orderHex}`);
  console.log(`Extracted city: "${city}"`);

  const escapedCity = city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const cityRegex = new RegExp(escapedCity, "i");
  console.log(`City regex: ${cityRegex}`);

  // Test franchise city match
  const franchise = await Franchise.findOne({ mobile: '9999999999' }).lean();
  if (franchise) {
    console.log(`\nFranchise city: "${franchise.city}"`);
    console.log(`Regex matches franchise city: ${cityRegex.test(franchise.city)}`);
    console.log(`Franchise H3 hexagons (first 3): ${franchise.serviceHexagons?.slice(0,3)}`);
    console.log(`Order H3 in franchise hexagons: ${franchise.serviceHexagons?.includes(orderHex)}`);
  }

  // Run the actual query
  console.log('\n═══ Running Actual DB Query ═══');
  const baseQuery = {
    isActive: true,
    isOnline: true,
    capacityAvailable: true,
    status: 'active',
    city: { $regex: cityRegex },
  };

  // H3 match
  const h3Result = await Franchise.find({ ...baseQuery, serviceHexagons: orderHex }).lean();
  console.log(`H3 match results: ${h3Result.length}`);

  // $near fallback
  try {
    const nearResult = await Franchise.find({
      ...baseQuery,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: 25000,
        },
      },
    }).lean();
    console.log(`$near results: ${nearResult.length}`);
    nearResult.forEach(f => console.log(`  → ${f.franchiseName} (${f.city})`));
  } catch (e) {
    console.log(`$near error: ${e.message}`);
  }

  // Without city filter
  console.log('\n═══ Without City Filter ═══');
  const noCityQuery = { isActive: true, isOnline: true, capacityAvailable: true, status: 'active' };
  const noCityNear = await Franchise.find({
    ...noCityQuery,
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: 25000,
      },
    },
  }).lean();
  console.log(`$near without city filter: ${noCityNear.length}`);
  noCityNear.forEach(f => console.log(`  → ${f.franchiseName} (${f.city}) dist check`));

  await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
