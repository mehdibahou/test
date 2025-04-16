// app/options/dashboard/layout.js
"use client";
import { DashboardProvider } from "@/app/context/DashboardContext";

export default function DashboardLayout({ children }) {
  return <DashboardProvider>{children}</DashboardProvider>;
}
