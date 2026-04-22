/**
 * DEBUG SCRIPT: Franchise 99999 ko order kyun nahi aa raha
 * Run: node --experimental-vm-modules debug_franchise_order_issue.js
 * OR:  node debug_franchise_order_issue.js (if package.json has "type":"module")
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import Franchise from './app/models/franchise.js';
import Order from './app/models/order.js';
import User from './app/models/user.js';
import Category from './app/models/category.js';
import Inventory from './app/models/inventory.js';
import Product from './app/models/product.js';

const FRANCHISE_MOBILE = '9999999999'; // 99999 wala number — adjust if needed

async function run() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB\n');

  // ─────────────────────────────────────────────
  // 1. FRANCHISE DATA
  // ─────────────────────────────────────────────
  console.log('═══════════════════════════════════════');
  console.log('1️⃣  FRANCHISE DATA');
  console.log('═══════════════════════════════════════');

  // Try multiple possible mobile formats
  const franchise = await Franchise.findOne({
    mobile: { $regex: /9+/, $options: 'i' }
  }).sort({ createdAt: -1 });

  // Also try exact match
  const franchiseExact = await Franchise.findOne({ mobile: FRANCHISE_MOBILE });
  const f = franchiseExact || franchise;

  if (!f) {
    console.log('❌ Franchise with mobile containing 99999 NOT FOUND in DB!');
    console.log('   All franchises in DB:');
    const all = await Franchise.find({}).select('mobile franchiseName status isVerified').lean();
    console.log(JSON.stringify(all, null, 2));
    await mongoose.disconnect();
    return;
  }

  console.log(`✅ Franchise Found: ${f.franchiseName} (${f.mobile})`);
  console.log(`   _id            : ${f._id}`);
  console.log(`   status         : ${f.status}         ${f.status !== 'active' ? '❌ MUST BE "active"' : '✅'}`);
  console.log(`   isVerified     : ${f.isVerified}     ${!f.isVerified ? '❌ MUST BE true (admin must verify)' : '✅'}`);
  console.log(`   isActive       : ${f.isActive}       ${!f.isActive ? '❌ MUST BE true' : '✅'}`);
  console.log(`   isOnline       : ${f.isOnline}       ${!f.isOnline ? '❌ MUST BE true' : '✅'}`);
  console.log(`   capacityAvail  : ${f.capacityAvailable} ${!f.capacityAvailable ? '❌ MUST BE true' : '✅'}`);
  console.log(`   city           : "${f.city}"`);
  console.log(`   location coords: ${JSON.stringify(f.location?.coordinates)}  ${
    !f.location?.coordinates || (f.location.coordinates[0] === 0 && f.location.coordinates[1] === 0)
      ? '❌ COORDINATES ARE [0,0] — franchise cannot be found by geo query!'
      : '✅'
  }`);
  console.log(`   serviceHexagons: [${f.serviceHexagons?.length || 0} entries] ${
    !f.serviceHexagons?.length ? '⚠️  EMPTY — H3 hex match will always fail, relies on $near fallback' : '✅'
  }`);
  console.log(`   servedCategories: [${f.servedCategories?.length || 0} entries]`);
  console.log(`   workingHours   : ${JSON.stringify(f.workingHours)}`);
  console.log(`   fcmTokens      : [${f.fcmTokens?.length || 0}] ${!f.fcmTokens?.length ? '⚠️  No FCM tokens — push notifications wont work' : '✅'}`);
  console.log(`   mobile_fcm     : [${f.mobile_fcm?.length || 0}]`);

  // ─────────────────────────────────────────────
  // 2. SERVED CATEGORIES
  // ─────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════');
  console.log('2️⃣  FRANCHISE SERVED CATEGORIES');
  console.log('═══════════════════════════════════════');

  if (f.servedCategories?.length > 0) {
    const cats = await Category.find({ _id: { $in: f.servedCategories } }).lean();
    cats.forEach(c => console.log(`   ✅ ${c.name} (${c._id})`));
  } else {
    console.log('   ⚠️  servedCategories is EMPTY — franchise is treated as serving ALL categories (legacy mode)');
  }

  // ─────────────────────────────────────────────
  // 3. RECENT ORDERS — ALL UNASSIGNED
  // ─────────────────────────────────────════════
  console.log('\n═══════════════════════════════════════');
  console.log('3️⃣  RECENT UNASSIGNED ORDERS (franchiseId = null)');
  console.log('═══════════════════════════════════════');

  const unassignedOrders = await Order.find({ franchiseId: null })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('items.productId', 'name category')
    .populate('fulfillmentCategoryId', 'name')
    .lean();

  if (!unassignedOrders.length) {
    console.log('   ℹ️  No unassigned orders found');
  } else {
    unassignedOrders.forEach(o => {
      console.log(`\n   Order: ${o._id}`);
      console.log(`   Status       : ${o.orderStatus}`);
      console.log(`   Created      : ${o.createdAt}`);
      console.log(`   ShippingAddr : ${o.shippingAddress}`);
      console.log(`   Coords       : ${JSON.stringify(o.shippingLocation?.coordinates)}`);
      console.log(`   FulfillCat   : ${o.fulfillmentCategoryId?.name || o.fulfillmentCategoryId || 'null'}`);
      console.log(`   Assignment Attempts: ${JSON.stringify(o.assignmentAttempts)}`);
      o.items?.forEach(item => {
        console.log(`   Item: ${item.productId?.name || item.name} | category: ${item.productId?.category}`);
      });
    });
  }

  // ─────────────────────────────────────────────
  // 4. ORDERS ASSIGNED TO THIS FRANCHISE
  // ─────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════');
  console.log('4️⃣  ORDERS ASSIGNED TO THIS FRANCHISE');
  console.log('═══════════════════════════════════════');

  const assignedOrders = await Order.find({ franchiseId: f._id })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  if (!assignedOrders.length) {
    console.log('   ❌ ZERO orders assigned to this franchise!');
  } else {
    assignedOrders.forEach(o => {
      console.log(`   Order ${o._id} | status: ${o.orderStatus} | created: ${o.createdAt}`);
    });
  }

  // ─────────────────────────────────────────────
  // 5. SIMULATE ASSIGNMENT QUERY
  // ─────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════');
  console.log('5️⃣  SIMULATING ASSIGNMENT QUERY');
  console.log('   (Would this franchise be found for an order?)');
  console.log('═══════════════════════════════════════');

  const baseQuery = {
    isActive: true,
    isOnline: true,
    capacityAvailable: true,
    status: 'active',
  };

  const matchesBase = await Franchise.findOne({ _id: f._id, ...baseQuery }).lean();
  if (!matchesBase) {
    console.log('   ❌ FRANCHISE FAILS BASE QUERY!');
    console.log('   Reason breakdown:');
    if (!f.isActive)         console.log('      → isActive is FALSE');
    if (!f.isOnline)         console.log('      → isOnline is FALSE');
    if (!f.capacityAvailable) console.log('      → capacityAvailable is FALSE');
    if (f.status !== 'active') console.log(`      → status is "${f.status}" not "active"`);
  } else {
    console.log('   ✅ Franchise passes base query (isActive, isOnline, capacityAvailable, status=active)');
  }

  // City filter check
  if (f.city) {
    console.log(`\n   City filter: franchise.city = "${f.city}"`);
    console.log('   ⚠️  If order shippingAddress city does not match this, assignment will fail');
  }

  // Geo check
  const coords = f.location?.coordinates;
  if (!coords || (coords[0] === 0 && coords[1] === 0)) {
    console.log('\n   ❌ GEO QUERY WILL FAIL: coordinates are [0,0]');
    console.log('   → $near query requires valid lat/lng');
    console.log('   → serviceHexagons also empty → BOTH geo methods fail');
    console.log('   → Franchise will NEVER be found by assignment logic');
  } else {
    console.log(`\n   ✅ Geo coords valid: [${coords[0]}, ${coords[1]}]`);
    // Try $near query
    try {
      const geoResult = await Franchise.findOne({
        _id: f._id,
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: coords },
            $maxDistance: 25000,
          },
        },
      }).lean();
      console.log(`   $near self-query: ${geoResult ? '✅ Found' : '❌ Not found'}`);
    } catch (e) {
      console.log(`   $near query error: ${e.message}`);
    }
  }

  // ─────────────────────────────────────────────
  // 6. MOST RECENT ORDER BY ANY USER — CHECK CATEGORY MATCH
  // ─────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════');
  console.log('6️⃣  LATEST ORDER IN SYSTEM — CATEGORY vs FRANCHISE CHECK');
  console.log('═══════════════════════════════════════');

  const latestOrder = await Order.findOne({})
    .sort({ createdAt: -1 })
    .populate('items.productId', 'name category')
    .populate('fulfillmentCategoryId', 'name')
    .lean();

  if (latestOrder) {
    console.log(`   Latest Order: ${latestOrder._id}`);
    console.log(`   Status      : ${latestOrder.orderStatus}`);
    console.log(`   franchiseId : ${latestOrder.franchiseId || 'null (unassigned)'}`);
    console.log(`   Created     : ${latestOrder.createdAt}`);
    console.log(`   FulfillCat  : ${latestOrder.fulfillmentCategoryId?.name || latestOrder.fulfillmentCategoryId}`);
    console.log(`   ShippingAddr: ${latestOrder.shippingAddress}`);
    console.log(`   Coords      : ${JSON.stringify(latestOrder.shippingLocation?.coordinates)}`);

    const orderCategoryIds = [...new Set(
      (latestOrder.items || [])
        .map(i => i.productId?.category?.toString())
        .filter(Boolean)
    )];
    console.log(`   Order Category IDs: ${JSON.stringify(orderCategoryIds)}`);

    const franchiseCatIds = (f.servedCategories || []).map(c => c.toString());
    if (franchiseCatIds.length === 0) {
      console.log('   Franchise servedCategories: EMPTY (serves all) ✅');
    } else {
      const allMatch = orderCategoryIds.every(id => franchiseCatIds.includes(id));
      console.log(`   Franchise servedCategories: ${JSON.stringify(franchiseCatIds)}`);
      console.log(`   Category match: ${allMatch ? '✅ All match' : '❌ MISMATCH — franchise wont be assigned this order'}`);
    }

    // City match check
    if (latestOrder.shippingAddress && f.city) {
      const parts = latestOrder.shippingAddress.split(',');
      const extractedCity = parts.length >= 2 ? parts[parts.length - 2].trim() : '';
      const cityMatch = f.city.toLowerCase().includes(extractedCity.toLowerCase()) ||
                        extractedCity.toLowerCase().includes(f.city.toLowerCase());
      console.log(`   City from order address: "${extractedCity}"`);
      console.log(`   Franchise city         : "${f.city}"`);
      console.log(`   City match             : ${cityMatch ? '✅' : '❌ MISMATCH — assignment will fail'}`);
    }
  }

  // ─────────────────────────────────────────────
  // 7. INVENTORY CHECK
  // ─────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════');
  console.log('7️⃣  FRANCHISE INVENTORY');
  console.log('═══════════════════════════════════════');

  const inv = await Inventory.findOne({ franchiseId: f._id }).lean();
  if (!inv) {
    console.log('   ❌ NO INVENTORY RECORD found for this franchise!');
    console.log('   → storefrontAvailability will return empty map');
    console.log('   → Checkout will fail with "Not available at your location"');
  } else {
    const inStockCount = (inv.items || []).filter(i => i.currentStock > 0).length;
    console.log(`   ✅ Inventory found: ${inv.items?.length || 0} products, ${inStockCount} in stock`);
    if (inStockCount === 0) {
      console.log('   ❌ ALL ITEMS HAVE 0 STOCK — storefront will show nothing available');
    }
  }

  console.log('\n═══════════════════════════════════════');
  console.log('🏁 DIAGNOSIS COMPLETE');
  console.log('═══════════════════════════════════════\n');

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
});
