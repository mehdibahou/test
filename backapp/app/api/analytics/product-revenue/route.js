// app/api/analytics/product-revenue/route.js
import { NextResponse } from 'next/server';
import Analytics from '@/models/analytics';
import connectDb from '@/middlewares/ConnectDB';

export async function GET() {
    try {
        await connectDb();
        
        // Get the latest day's product sales
        const latestAnalytics = await Analytics
            .findOne()
            .sort({ date: -1 })
            .select('productSales dailyRevenue')
            .lean();

        if (!latestAnalytics || !latestAnalytics.productSales) {
            return NextResponse.json([]);
        }

        // Aggregate sales by product name
        const aggregatedSales = latestAnalytics.productSales.reduce((acc, curr) => {
            const existing = acc.find(item => item.name === curr.productName);
            if (existing) {
                existing.value += curr.revenue;
                existing.orders += curr.orders;
            } else {
                acc.push({
                    name: curr.productName,
                    value: curr.revenue,
                    orders: curr.orders
                });
            }
            return acc;
        }, []);

        // Calculate percentages
        const totalRevenue = latestAnalytics.dailyRevenue;
        const productData = aggregatedSales.map(product => ({
            ...product,
            percentage: ((product.value / totalRevenue) * 100).toFixed(1)
        }));

        return NextResponse.json(productData);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { 
                error: 'Failed to fetch product revenue data',
                details: error.message 
            },
            { status: 500 }
        );
    }
}