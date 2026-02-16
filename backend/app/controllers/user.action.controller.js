import Cart from "../models/cart.js"
import Wishlist from "../models/wishlist.js"
import Product from "../models/product.js"
import handleResponse from "../utils/helper.js"

// --- CART OPERATIONS ---

export const getCart = async (req, res) => {
    try {
        const userId = req.user.id
        let cart = await Cart.findOne({ userId }).populate('items.productId')

        if (!cart) {
            cart = await Cart.create({ userId, items: [] })
        }

        return handleResponse(res, 200, "Cart fetched successfully", cart)
    } catch (error) {
        console.error("Get cart error:", error)
        return handleResponse(res, 500, "Internal server error")
    }
}

export const addToCart = async (req, res) => {
    try {
        const userId = req.user.id
        const { productId, quantity = 1 } = req.body

        if (!productId) {
            return handleResponse(res, 400, "Product ID is required")
        }

        let cart = await Cart.findOne({ userId })
        if (!cart) {
            cart = new Cart({ userId, items: [] })
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId)

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity
        } else {
            cart.items.push({ productId, quantity })
        }

        await cart.save()
        await cart.populate('items.productId')

        return handleResponse(res, 200, "Product added to cart", cart)
    } catch (error) {
        console.error("Add to cart error:", error)
        return handleResponse(res, 500, "Internal server error")
    }
}

export const updateCartQuantity = async (req, res) => {
    try {
        const userId = req.user.id
        const { productId, quantity } = req.body

        if (!productId || quantity === undefined) {
            return handleResponse(res, 400, "Product ID and quantity are required")
        }

        const cart = await Cart.findOne({ userId })
        if (!cart) {
            return handleResponse(res, 404, "Cart not found")
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId)
        if (itemIndex === -1) {
            return handleResponse(res, 404, "Product not in cart")
        }

        if (quantity <= 0) {
            cart.items.splice(itemIndex, 1)
        } else {
            cart.items[itemIndex].quantity = quantity
        }

        await cart.save()
        await cart.populate('items.productId')

        return handleResponse(res, 200, "Cart updated", cart)
    } catch (error) {
        console.error("Update cart error:", error)
        return handleResponse(res, 500, "Internal server error")
    }
}

export const removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id
        const { productId } = req.params

        const cart = await Cart.findOne({ userId })
        if (!cart) {
            return handleResponse(res, 404, "Cart not found")
        }

        cart.items = cart.items.filter(item => item.productId.toString() !== productId)

        await cart.save()
        await cart.populate('items.productId')

        return handleResponse(res, 200, "Product removed from cart", cart)
    } catch (error) {
        console.error("Remove from cart error:", error)
        return handleResponse(res, 500, "Internal server error")
    }
}

// --- WISHLIST OPERATIONS ---

export const getWishlist = async (req, res) => {
    try {
        const userId = req.user.id
        let wishlist = await Wishlist.findOne({ userId }).populate({
            path: 'products',
            populate: [
                { path: 'category' },
                { path: 'subcategory' }
            ]
        })

        if (!wishlist) {
            wishlist = await Wishlist.create({ userId, products: [] })
        }

        return handleResponse(res, 200, "Wishlist fetched successfully", wishlist)
    } catch (error) {
        console.error("Get wishlist error:", error)
        return handleResponse(res, 500, "Internal server error")
    }
}

export const toggleWishlist = async (req, res) => {
    try {
        const userId = req.user.id
        const { productId } = req.body

        if (!productId) {
            return handleResponse(res, 400, "Product ID is required")
        }

        let wishlist = await Wishlist.findOne({ userId })
        if (!wishlist) {
            wishlist = new Wishlist({ userId, products: [] })
        }

        const isExist = wishlist.products.some(id => id.toString() === productId)

        if (isExist) {
            wishlist.products = wishlist.products.filter(id => id.toString() !== productId)
        } else {
            wishlist.products.push(productId)
        }

        await wishlist.save()
        await wishlist.populate({
            path: 'products',
            populate: [
                { path: 'category' },
                { path: 'subcategory' }
            ]
        })

        return handleResponse(res, 200, isExist ? "Removed from wishlist" : "Added to wishlist", wishlist)
    } catch (error) {
        console.error("Toggle wishlist error:", error)
        return handleResponse(res, 500, "Internal server error")
    }
}

export const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user.id
        const { productId } = req.params

        const wishlist = await Wishlist.findOne({ userId })
        if (!wishlist) {
            return handleResponse(res, 404, "Wishlist not found")
        }

        wishlist.products = wishlist.products.filter(id => id.toString() !== productId)

        await wishlist.save()
        await wishlist.populate({
            path: 'products',
            populate: [
                { path: 'category' },
                { path: 'subcategory' }
            ]
        })

        return handleResponse(res, 200, "Removed from wishlist", wishlist)
    } catch (error) {
        console.error("Remove from wishlist error:", error)
        return handleResponse(res, 500, "Internal server error")
    }
}
