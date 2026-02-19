import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { geocodeAddress, getDistance } from './app/utils/geo.js';
import Franchise from './app/models/franchise.js';

dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const shippingAddress = "Pipliyahana, Indore, Madhya Pradesh";
        const userCoords = await geocodeAddress(shippingAddress);
        console.log('User Coords:', userCoords);

        if (userCoords) {
            const activeFranchises = await Franchise.find({
                status: 'active',
                'location.lat': { $ne: null },
                'location.lng': { $ne: null }
            });
            console.log(`Found ${activeFranchises.length} active franchises with locations`);

            let minDistance = Infinity;
            let assignedFranchise = null;

            for (const franchise of activeFranchises) {
                const dist = getDistance(
                    userCoords.lat, userCoords.lng,
                    franchise.location.lat, franchise.location.lng
                );
                console.log(`- ${franchise.shopName || franchise.franchiseName}: ${dist.toFixed(2)}km`);

                if (dist < minDistance) {
                    minDistance = dist;
                    assignedFranchise = franchise;
                }
            }

            if (assignedFranchise) {
                console.log(`\n✅ WINNER: ${assignedFranchise.shopName || assignedFranchise.franchiseName} (${minDistance.toFixed(2)}km)`);
            } else {
                console.log('\n❌ No franchise assigned');
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

test();
