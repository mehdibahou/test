// hooks/useDashboardData.js
import { useState, useEffect } from "react";

export function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalHorses: 0,
      maladies: 0,
      retablissement: 0,
      sains: 0,
    },
    chartData: {
      horses: [],
      robes: [],
      disciplines: [],
      pathologies: [],
    },
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard");
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      const {
        totalHorses,
        healthStats,
        raceDistribution,
        robeDistribution,
        disciplineDistribution,
        pathologies,
      } = result.data;

      setDashboardData({
        stats: {
          totalHorses,
          maladies: healthStats.maladies,
          retablissement: healthStats.retablissement,
          sains: healthStats.sains,
        },
        chartData: {
          horses: raceDistribution.map((item) => ({
            race: item._id,
            count: item.count,
          })),
          robes: robeDistribution.map((item) => ({
            name: item._id,
            value: item.count,
          })),
          disciplines: disciplineDistribution.map((item) => ({
            name: item._id,
            value: item.count,
          })),
          pathologies: pathologies.map((item) => ({
            name: item._id,
            value: item.count,
          })),
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    loading,
    error,
    dashboardData,
    refetch: fetchDashboardData,
  };
}
