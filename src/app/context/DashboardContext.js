// contexts/DashboardContext.js
import React, { createContext, useContext, useReducer } from "react";

const DashboardContext = createContext();

// Action Types
const ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_DASHBOARD_DATA: "SET_DASHBOARD_DATA",
  SET_TIME_RANGE: "SET_TIME_RANGE",
};

// Initial State
const initialState = {
  loading: true,
  error: null,
  timeRange: "30", // default to 30 days
  stats: {
    totalHorses: 0,
    maladies: 0,
    retablissement: 0,
    sains: 0,
    testsCount: 0,
    traitementsEnCours: 0,
    tauxGuerison: 0,
  },
  chartData: {
    horses: [],
    robes: [],
    disciplines: [],
    pathologies: [],
    rawData: [], // Raw horse data array for complex filtering
  },
};

// Reducer
function dashboardReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ACTIONS.SET_DASHBOARD_DATA:
      return {
        ...state,
        ...action.payload,
        loading: false,
        error: null,
      };
    case ACTIONS.SET_TIME_RANGE:
      return { ...state, timeRange: action.payload };
    default:
      return state;
  }
}

// Provider Component
export function DashboardProvider({ children }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      const BASE_URL = "http://localhost:3001/api";

      // Fetch dashboard data
      const dashboardResponse = await fetch(`${BASE_URL}/dashboard`);
      const dashboardData = await dashboardResponse.json();

      if (!dashboardData.success) {
        throw new Error(dashboardData.error);
      }

      // Fetch ALL horses data for advanced filtering and cross-analysis
      let horsesData = { success: false, data: [] };
      try {
        const horsesResponse = await fetch(`${BASE_URL}/horse`);
        horsesData = await horsesResponse.json();
      } catch (err) {
        console.warn(
          "Could not fetch detailed horse data for advanced charts:",
          err.message
        );
      }

      dispatch({
        type: ACTIONS.SET_DASHBOARD_DATA,
        payload: {
          stats: {
            totalHorses: dashboardData?.data.totalHorses,
            maladies: dashboardData?.data.healthStats.maladies,
            retablissement: dashboardData?.data.healthStats.retablissement,
            sains: dashboardData?.data.healthStats.sains,
            testsCount: dashboardData?.data.pathologies.length,
            traitementsEnCours:
              dashboardData?.data.healthStats.traitementsEnCours,
            tauxGuerison: dashboardData?.data.healthStats.tauxGuerison,
          },
          chartData: {
            horses: dashboardData?.data.raceDistribution,
            robes: dashboardData?.data.robeDistribution,
            disciplines: dashboardData?.data.disciplineDistribution,
            pathologies: dashboardData?.data.pathologies,
            // Add raw horse data for advanced filtering and cross-analysis
            rawData: horsesData?.success ? horsesData.data : [],
          },
        },
      });
    } catch (error) {
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: error.message,
      });
    }
  };

  // Change time range
  const setTimeRange = (range) => {
    dispatch({ type: ACTIONS.SET_TIME_RANGE, payload: range });
    fetchDashboardData(range);
  };

  const value = {
    state,
    fetchDashboardData,
    setTimeRange,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

// Custom hook to use the dashboard context
export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
