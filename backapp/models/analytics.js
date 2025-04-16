import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
    date: { 
      type: Date, 
      default: Date.now,
      index: true 
    },
    dailyRevenue: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    dailyOrders: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    productCount: { type: Number, default: 0 },
    productSales: [{
        productName: String,
        revenue: Number,
        orders: Number
    }],
   
    hourlyStats: [{
      hour: Number,
      revenue: Number,
      orders: Number
    }],
    lastUpdated: { type: Date, default: Date.now }
});

// Helper method to get today's start date
analyticsSchema.statics.getTodayStart = function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

// Get revenue chart data
analyticsSchema.statics.getRevenueChartData = async function(startDate, endDate) {
    try {
        return await this.find({
            date: {
                $gte: startDate,
                $lte: endDate
            }
        })
        .select('date dailyRevenue')
        .sort({ date: 1 })
        .lean();
    } catch (error) {
        console.error('Error fetching revenue chart data:', error);
        throw error;
    }
};

// Get last N days of revenue
analyticsSchema.statics.getLastNDaysRevenue = async function(days = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.getRevenueChartData(startDate, endDate);
};

// Get today's and total stats
analyticsSchema.statics.getDashboardStats = async function() {
    try {
        const todayStart = this.getTodayStart();
        
        const [todayStats, totalStats] = await Promise.all([
            // Get today's stats
            this.findOne({ date: todayStart })
                .select('dailyOrders dailyRevenue productCount')
                .lean(),
            
            // Get total stats
            this.aggregate([
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: '$dailyOrders' },
                        totalRevenue: { $sum: '$dailyRevenue' }
                    }
                }
            ])
        ]);

        return {
            today: todayStats || { 
                dailyOrders: 0, 
                dailyRevenue: 0, 
                productCount: 0 
            },
            total: totalStats[0] || { 
                totalOrders: 0, 
                totalRevenue: 0 
            }
        };
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        throw error;
    }
};


const Analytics = mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema);

export default Analytics;