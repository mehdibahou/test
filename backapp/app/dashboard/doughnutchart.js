import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = () => {
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    fetchProductRevenue();
  }, []);

  const fetchProductRevenue = async () => {
    try {
      const response = await fetch('/api/analytics/product-revenue');
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        // Sort data by revenue in descending order
        const sortedData = [...data].sort((a, b) => b.value - a.value);
        
        // Calculate totals
        const revTotal = sortedData.reduce((sum, item) => sum + item.value, 0);
        const ordersTotal = sortedData.reduce((sum, item) => sum + item.orders, 0);
        
        setTotalRevenue(revTotal);
        setTotalOrders(ordersTotal);
        setProductData(sortedData);
      } else {
        setProductData([]);
      }
    } catch (error) {
      console.error('Error fetching product revenue:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const colors = [
    { bg: 'rgba(59, 130, 246, 0.5)', border: 'rgb(59, 130, 246)' },   // Blue
    { bg: 'rgba(16, 185, 129, 0.5)', border: 'rgb(16, 185, 129)' },   // Green
    { bg: 'rgba(249, 115, 22, 0.5)', border: 'rgb(249, 115, 22)' },   // Orange
    { bg: 'rgba(236, 72, 153, 0.5)', border: 'rgb(236, 72, 153)' },   // Pink
    { bg: 'rgba(139, 92, 246, 0.5)', border: 'rgb(139, 92, 246)' },   // Purple
    { bg: 'rgba(245, 158, 11, 0.5)', border: 'rgb(245, 158, 11)' },   // Yellow
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const chartData = {
    labels: productData.map(item => item.name),
    datasets: [
      {
        data: productData.map(item => item.value),
        backgroundColor: colors.map(color => color.bg),
        borderColor: colors.map(color => color.border),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        align: 'start',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11
          },
          generateLabels: (chart) => {
            const datasets = chart.data.datasets[0];
            return chart.data.labels.map((label, i) => ({
              text: `${label} - ${formatCurrency(productData[i].value)} (${productData[i].percentage}%)`,
              fillStyle: datasets.backgroundColor[i],
              strokeStyle: datasets.borderColor[i],
              lineWidth: 2,
              hidden: false,
              index: i
            }));
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const item = productData[context.dataIndex];
            return [
              `Revenue: ${formatCurrency(item.value)}`,
              `Orders: ${item.orders}`,
              `Share: ${item.percentage}%`
            ];
          }
        }
      }
    },
    cutout: '70%',
  };

  if (loading) {
    return (
      <Card className="w-full h-[400px]">
        <CardContent className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full h-[400px]">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-red-500">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!productData.length) {
    return (
      <Card className="w-full h-[400px]">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No product revenue data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base font-medium">Revenue by Product</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] relative">
          <Doughnut data={chartData} options={options} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatCurrency(totalRevenue)}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Revenue
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center p-3 bg-background rounded-lg border">
            <div className="text-2xl font-bold">
              {totalOrders}
            </div>
            <div className="text-sm text-muted-foreground">
              Total Orders
            </div>
          </div>
          <div className="text-center p-3 bg-background rounded-lg border">
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue / totalOrders)}
            </div>
            <div className="text-sm text-muted-foreground">
              Avg. Order Value
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoughnutChart;