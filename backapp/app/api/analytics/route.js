


// app/api/analytics/revenue/route.js
import analytics from '@/models/analytics';
import { NextResponse } from 'next/server';
import connectDb from '@/middlewares/ConnectDB';


export async function GET(request) {
    try {
        await connectDb();
        const { searchParams } = new URL(request.url);
        const days = searchParams.get('days') || '30';
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        let data;
        if (startDate && endDate) {
            data = await analytics.getRevenueChartData(
                new Date(startDate),
                new Date(endDate)
            );
        } else {
            data = await analytics.getLastNDaysRevenue(Number(days));
            console.log('Data:', data);
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Revenue data error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch revenue data' },
            { status: 500 }
        );
    }
}


