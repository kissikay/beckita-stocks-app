import Order from "../models/order.js";
import Product from "../models/product.js";

export const createOrder = async (req, res) => {
    const { items } = req.body; // items: [{ productId, quantity }]
    const soldBy = req.user.id; // Automatically from JWT
    try {
        let totalPrice = 0;
        let totalProfit = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) return res.status(404).json({ error: `Product ${item.productId} not found` });
            if (product.quantity < item.quantity) {
                return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
            }

            const unitPrice = product.price;
            const unitCost = product.costPrice;
            const itemTotal = unitPrice * item.quantity;
            const itemProfit = (unitPrice - unitCost) * item.quantity;

            totalPrice += itemTotal;
            totalProfit += itemProfit;

            orderItems.push({
                productId: product._id,
                quantity: item.quantity,
                unitPrice,
                unitCost
            });

            // Decrement stock
            product.quantity -= item.quantity;
            await product.save();
        }

        const newOrder = new Order({
            id: `ORD-${Date.now()}`,
            date: new Date(),
            items: orderItems,
            totalPrice,
            totalProfit,
            soldBy
        });

        await newOrder.save();
        res.status(201).json({ message: "Sale completed", order: newOrder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getInsights = async (req, res) => {
    try {
        const { period } = req.query; // daily, weekly, monthly
        let startDate = new Date();

        if (period === 'daily') {
            startDate.setHours(0, 0, 0, 0);
        } else if (period === 'weekly') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (period === 'monthly') {
            startDate.setMonth(startDate.getMonth() - 1);
        }

        const orders = await Order.find({ createdAt: { $gte: startDate } }).sort({ createdAt: -1 }).populate('items.productId');

        // All-time totals using aggregation for safety/performance
        const overallResults = await Order.aggregate([
            { $group: {
                _id: null,
                overallSales: { $sum: "$totalPrice" },
                overallProfit: { $sum: "$totalProfit" },
                count: { $sum: 1 }
            }}
        ]);

        const stats = overallResults[0] || { overallSales: 0, overallProfit: 0, count: 0 };
        console.log(`[Insights DB Check] Found ${stats.count} total orders via aggregation.`);
        
        const overallSales = stats.overallSales;
        const overallProfit = stats.overallProfit;

        const totalSales = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
        const totalProfit = orders.reduce((sum, order) => sum + (order.totalProfit || 0), 0);

        // Aggregate Profit Trend (revenue + profit per day)
        const trendMap = {};
        orders.forEach(order => {
            if (!order.createdAt) return;
            const date = order.createdAt.toISOString().split('T')[0];
            if (!trendMap[date]) trendMap[date] = { profit: 0, revenue: 0 };
            trendMap[date].profit += order.totalProfit;
            trendMap[date].revenue += order.totalPrice;
        });
        const formattedTrend = Object.keys(trendMap).sort().map(date => ({
            label: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            profit: trendMap[date].profit,
            revenue: trendMap[date].revenue
        }));

        // Aggregate Top Products
        const productStats = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                const pId = item.productId?._id;
                if (!pId) return;
                if (!productStats[pId]) {
                    productStats[pId] = {
                        name: item.productId.name,
                        category: item.productId.category,
                        unitsSold: 0,
                        revenue: 0,
                        profit: 0
                    };
                }
                productStats[pId].unitsSold += item.quantity;
                productStats[pId].revenue += (item.unitPrice * item.quantity);
                productStats[pId].profit += (item.unitPrice - item.unitCost) * item.quantity;
            });
        });

        const topProducts = Object.values(productStats)
            .sort((a, b) => b.unitsSold - a.unitsSold)
            .slice(0, 5);

        res.status(200).json({
            period,
            totalSales,
            totalProfit,
            overallSales,
            overallProfit,
            orderCount: stats.count,
            periodOrderCount: orders.length,
            profitTrend: formattedTrend,
            topProducts,
            orders: orders.slice(0, 10).map(o => ({
                id: o.id,
                totalPrice: o.totalPrice,
                createdAt: o.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
