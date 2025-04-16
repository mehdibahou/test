import { NextResponse } from 'next/server';
import analytics from '@/models/analytics';
import connectDb from '@/middlewares/ConnectDB';

// Define products with realistic data
const products = [
    { name: 'Burger', basePrice: 1200 },
    { name: 'Pizza', basePrice: 800 },
    { name: 'Tajine', basePrice: 600 },
    { name: 'Sushi', basePrice: 400 },
    { name: 'Soup', basePrice: 200 },
    { name: 'Chicken', basePrice: 500 },
];

// Utility function to generate a random number within a range
const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

// Function to generate hourly statistics
const generateHourlyStats = (dailyRevenue, dailyOrders) => {
    const hours = 24;
    const hourlyStats = [];
    let remainingRevenue = dailyRevenue;
    let remainingOrders = dailyOrders;

    for (let i = 0; i < hours; i++) {
        const isLastHour = i === hours - 1;
        const hourlyRevenue = isLastHour 
            ? remainingRevenue 
            : Math.floor(remainingRevenue * random(3, 7) / 100);
        const hourlyOrders = isLastHour 
            ? remainingOrders 
            : Math.floor(remainingOrders * random(3, 7) / 100);

        remainingRevenue -= hourlyRevenue;
        remainingOrders -= hourlyOrders;

        hourlyStats.push({
            hour: i,
            revenue: hourlyRevenue,
            orders: hourlyOrders,
        });
    }

    return hourlyStats;
};

// Function to generate product sales for a day
const generateProductSales = (dailyRevenue) => {
    let remainingRevenue = dailyRevenue;
    const productSales = [];

    products.forEach((product, index) => {
        if (index === products.length - 1) {
            // Last product gets remaining revenue
            productSales.push({
                productName: product.name,
                revenue: remainingRevenue,
                orders: Math.ceil(remainingRevenue / product.basePrice),
            });
        } else {
            const percentage = random(10, 30);
            const revenue = Math.floor((remainingRevenue * percentage) / 100);
            remainingRevenue -= revenue;

            productSales.push({
                productName: product.name,
                revenue,
                orders: Math.ceil(revenue / product.basePrice),
            });
        }
    });

    return productSales;
};

// Seed handler
export async function POST(request) {
    try {
        await connectDb();

        // Clear existing analytics data
        await analytics.deleteMany({});

        const analyticsData = [];
        const days = 90; // Seed data for 90 days
        const baseDate = new Date();
        baseDate.setHours(0, 0, 0, 0);

        // Generate analytics data for each day
        for (let i = days; i >= 0; i--) {
            const date = new Date(baseDate);
            date.setDate(date.getDate() - i);

            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const dayMultiplier = isWeekend ? random(12, 15) / 10 : 1;

            const dailyOrders = Math.round(random(80, 120) * dayMultiplier);
            const dailyRevenue = dailyOrders * random(25, 40);

            analyticsData.push({
                date,
                dailyOrders,
                dailyRevenue,
                totalOrders: 0, // Placeholder; will update later
                totalRevenue: 0, // Placeholder; will update later
                productCount: products.length,
                productSales: generateProductSales(dailyRevenue),
                hourlyStats: generateHourlyStats(dailyRevenue, dailyOrders),
                lastUpdated: new Date(),
            });
        }

        // Insert all analytics documents into the database
        await analytics.insertMany(analyticsData);

        // Update running totals
        let runningTotalOrders = 0;
        let runningTotalRevenue = 0;

        for (const analytic of analyticsData) {
            runningTotalOrders += analytic.dailyOrders;
            runningTotalRevenue += analytic.dailyRevenue;

            await analytics.findOneAndUpdate(
                { date: analytic.date },
                {
                    totalOrders: runningTotalOrders,
                    totalRevenue: runningTotalRevenue,
                }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Seeded ${analyticsData.length} days of analytics data successfully.`,
        });
    } catch (error) {
        console.error('Seeding error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to seed analytics data',
                details: error.message,
            },
            { status: 500 }
        );
    }
}
