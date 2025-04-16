// app/api/dashboard/controller.js
import { Horse } from "../models/horse";
import { Test } from "../models/test";
import { NextResponse } from "next/server";

export async function getDashboardStatsHandler(req) {
  if (req.method !== "GET") {
    return NextResponse.json(
      { success: false, error: "Method not allowed" },
      { status: 405 }
    );
  }

  try {
    // Get total horses count
    const totalHorses = await Horse.countDocuments();
    console.log("totalHorses", totalHorses);

    // Get health statistics
    const healthStats = await Horse.aggregate([
      {
        $group: {
          _id: null,
          maladies: {
            $sum: {
              $cond: [
                { $eq: ["$etat", "malade"] },
                1,
                0
              ]
            }
          },
          retablissement: {
            $sum: {
              $cond: [
                { $eq: ["$etat", "en rétablissement"] },
                1,
                0
              ]
            }
          },
          sains: {
            $sum: {
              $cond: [
                { $eq: ["$etat", "sain"] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);
    console.log("healthStats", healthStats);
    // Get race distribution
    const raceDistribution = await Horse.aggregate([
      {
        $group: {
          _id: "$race",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);
    console.log("raceDistribution", raceDistribution);
    // Get robe distribution
    const robeDistribution = await Horse.aggregate([
      {
        $group: {
          _id: "$robe",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);
    console.log("robeDistribution", robeDistribution);
    // Get discipline distribution
    const disciplineDistribution = await Horse.aggregate([
      {
        $group: {
          _id: "$discipline",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);
    console.log("disciplineDistribution", disciplineDistribution);
    // Get common pathologies
    const pathologies = await Test.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    console.log("pathologies", pathologies);
    const healthStatsData = healthStats[0] || {
      maladies: 0,
      retablissement: 0,
      sains: 0,
    };
    return NextResponse.json(
      {
        success: true,
        data: {
          totalHorses,
          healthStats: healthStatsData,
          raceDistribution,
          robeDistribution,
          disciplineDistribution,
          pathologies,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
