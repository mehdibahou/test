"use client";
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import { BanknotesIcon, ShoppingBagIcon, CubeIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Datacards() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch current stats
        const response = await fetch('/api/order');
        const data = await response.json();

        // For this example, we'll use today's stats vs total stats to show growth
        // In a real application, you might want to fetch previous day's data
        const dailyStats = data.today;
        const totalStats = data.total;

        // Calculate percentage changes (using a simplified calculation for demo)
        const revenueChange = ((dailyStats.dailyRevenue / totalStats.totalRevenue) * 100).toFixed(1);
        const ordersChange = ((dailyStats.dailyOrders / totalStats.totalOrders) * 100).toFixed(1);

        setStats([
          {
            id: 1,
            name: 'Total Revenue',
            stat: totalStats.totalRevenue.toLocaleString('en-US', { 
              style: 'currency', 
              currency: 'USD' 
            }),
            icon: BanknotesIcon,
            change: `${revenueChange}%`,
            changeType: revenueChange >= 0 ? 'increase' : 'decrease',
            description: "today's contribution"
          },
          {
            id: 2,
            name: 'Total Orders',
            stat: totalStats.totalOrders,
            icon: ShoppingBagIcon,
            change: `${ordersChange}%`,
            changeType: ordersChange >= 0 ? 'increase' : 'decrease',
            description: "today's orders"
          },
          {
            id: 3,
            name: "Today's Revenue",
            stat: dailyStats.dailyRevenue.toLocaleString('en-US', { 
              style: 'currency', 
              currency: 'USD' 
            }),
            icon: CubeIcon,
            change: dailyStats.dailyOrders,
            changeType: 'increase',
            description: 'orders today'
          },
        ]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 300000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading statistics...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h3 className="text-base font-semibold leading-6 text-gray-900">Dashboard</h3>

      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.id}
            className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
          >
            <dt>
              <div className="absolute rounded-md bg-indigo-500 p-3">
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
              <p
                className={classNames(
                  item.changeType === 'increase' ? 'text-green-600' : 'text-red-600',
                  'ml-2 flex items-baseline text-sm font-semibold'
                )}
              >
                {item.changeType === 'increase' ? (
                  <ArrowUpIcon className="h-5 w-5 flex-shrink-0 self-center text-green-500" aria-hidden="true" />
                ) : (
                  <ArrowDownIcon className="h-5 w-5 flex-shrink-0 self-center text-red-500" aria-hidden="true" />
                )}
                <span className="sr-only"> {item.changeType === 'increase' ? 'Increased by' : 'Decreased by'} </span>
                {item.change}
              </p>
              <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm text-gray-500">
                  {item.description}
                </div>
              </div>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}