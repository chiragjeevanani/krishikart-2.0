# Product Seeder Script

This script allows you to bulk import products and categories from JSON files into your MongoDB database.

## What it does

1. **Seeds Categories**: Reads categories from `frontend/src/modules/user/data/categories.json` and creates them in MongoDB
2. **Seeds Products**: Reads products from `frontend/src/modules/user/data/products.json` and creates them with proper category references
3. **Handles Relationships**: Automatically maps category string IDs from JSON to MongoDB ObjectIds

## How to use

### Step 1: Make sure your MongoDB is running

Ensure your `.env` file has the correct `MONGO_URI` configuration:

```env
MONGO_URI=mongodb://localhost:27017/krishikart
```

### Step 2: Run the seeder

From the backend directory, run:

```bash
npm run seed
```

### What happens when you run it:

```
🚀 Starting seeder...
==================================================

📂 Found 12 categories in JSON file
  ✅ Created category: Fruits
  ✅ Created category: Vegetables
  ... (and so on)

✅ Categories processed successfully!

📦 Found 39 products in JSON file
🗑️  Cleared 0 existing products

  ✅ Inserted 39/39 products

🎉 Product seeding completed successfully!
📊 Total products in database: 39
==================================================

🔌 Closing database connection...
✅ Seeder completed successfully!
```

## Important Notes

⚠️ **The script will DELETE all existing products** before importing new ones. If you want to keep existing products, comment out this line in `seedProducts.js`:

```javascript
// await Product.deleteMany({});
```

✅ Categories are **not deleted** - the script will reuse existing categories if they already exist (matched by name)

## Modifying the data

### To add more products:
1. Edit `frontend/src/modules/user/data/products.json`
2. Run `npm run seed` again

### To add more categories:
1. Edit `frontend/src/modules/user/data/categories.json`
2. Run `npm run seed` again

## Troubleshooting

**Error: Cannot find module**
- Make sure you're running the command from the `backend` directory
- Check that `frontend` is at the same level as `backend`

**MongoDB connection error**
- Verify MongoDB is running
- Check your `.env` file has the correct `MONGO_URI`

**Products created but with null categories**
- Check that category IDs in products.json match the category IDs in categories.json
- The script will skip products with invalid category references
