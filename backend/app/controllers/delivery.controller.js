import Delivery from "../models/delivery.js";
import { handleResponse } from "../utils/helper.js";

/**
 * @desc Get All Active Delivery Partners
 * @route GET /delivery/partners
 * @access Private (Franchise/Admin)
 */
export const getAllDeliveryPartners = async (req, res) => {
    try {
        const partners = await Delivery.find({ status: 'active', isVerified: true })
            .select('fullName mobile vehicleNumber vehicleType');

        return handleResponse(res, 200, "Delivery partners fetched successfully", partners);
    } catch (err) {
        console.error("Get Delivery Partners Error:", err);
        return handleResponse(res, 500, "Internal server error");
    }
};
