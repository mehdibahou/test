import { NextResponse } from 'next/server';
import connectDb from '@/middlewares/ConnectDB';
import Category from '@/models/category';
import FoodProduct from '@/models/product';

// Sample data
const categories = [
  { name: "Burgers", description: "Juicy handcrafted burgers", image: "/category/burgers.jpeg" },
  { name: "Desserts", description: "Sweet treats and desserts", image: "/category/desserts.jpeg" }
];

export async function POST(req) {
  try {
    await connectDb();

    // Clear existing data
    await Category.deleteMany({});
    await FoodProduct.deleteMany({});

    // Insert categories and retrieve their IDs
    const createdCategories = await Category.insertMany(categories);
    const burgersCategoryId = createdCategories.find(cat => cat.name === "Burgers")._id;
    const dessertsCategoryId = createdCategories.find(cat => cat.name === "Desserts")._id;

    // Products with ObjectId references to categories
    const products = [
      // Burgers
      {
        name: "Classic Burger",
        description: "Juicy beef patty with lettuce, tomato, onions, and special sauce",
        image: "/uploads/burger.jpg",
        price: 8.99,
        off: 0,
        category: burgersCategoryId,
        variants: [
          { variantName: "Regular", price: 8.99 },
          { variantName: "With Cheese", price: 9.99 },
          { variantName: "Double Patty", price: 12.99 }
        ]
      },
      {
        name: "Spicy Chicken Burger",
        description: "Crispy spicy chicken fillet with coleslaw and pickles",
        image: "/uploads/chicken.jpeg",
        price: 9.99,
        off: 10,
        category: burgersCategoryId,
        variants: [
          { variantName: "Regular", price: 9.99 },
          { variantName: "Extra Spicy", price: 10.99 },
          { variantName: "With Cheese", price: 11.49 }
        ]
      },
      {
        name: "Mushroom Swiss Burger",
        description: "Beef patty topped with sautéed mushrooms and Swiss cheese",
        image: "/uploads/mushroom.jpeg",
        price: 10.99,
        off: 0,
        category: burgersCategoryId,
        variants: [
          { variantName: "Regular", price: 10.99 },
          { variantName: "Double Cheese", price: 12.49 },
          { variantName: "Extra Mushrooms", price: 11.99 }
        ]
      },
      // Desserts
      {
        name: "Chocolate Brownie",
        description: "Warm chocolate brownie served with vanilla ice cream",
        image: "/uploads/cake.jpg",
        price: 6.99,
        off: 0,
        category: dessertsCategoryId,
        variants: [
          { variantName: "Single", price: 6.99 },
          { variantName: "Double", price: 12.99 },
          { variantName: "Extra Ice Cream", price: 8.49 }
        ]
      },
      {
        name: "Tiramisu",
        description: "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone cream",
        image: "/uploads/tiramisu.jpeg",
        price: 7.99,
        off: 15,
        category: dessertsCategoryId,
        variants: [
          { variantName: "Regular", price: 7.99 },
          { variantName: "Large", price: 14.99 },
          { variantName: "Extra Coffee Shot", price: 8.99 }
        ]
      },
      {
        name: "Apple Pie",
        description: "Freshly baked apple pie with cinnamon and vanilla sauce",
        image: "/uploads/applepie.jpeg",
        price: 5.99,
        off: 0,
        category: dessertsCategoryId,
        variants: [
          { variantName: "Slice", price: 5.99 },
          { variantName: "Whole Pie", price: 24.99 },
          { variantName: "With Ice Cream", price: 7.49 }
        ]
      }
    ];

    // Insert products with ObjectId references
    const createdProducts = await FoodProduct.insertMany(products);
    console.log('Database seeded successfully');

    return NextResponse.json({
      message: 'Database seeded successfully',
      categories: createdCategories.length,
      products: createdProducts.length
    }, { status: 200 });

  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({
      error: 'Failed to seed database',
      details: error.message
    }, { status: 500 });
  }
}
