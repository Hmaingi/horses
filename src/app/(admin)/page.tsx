import type { Metadata } from "next";
import { HorseMetrics } from "@/components/horse/HorseMetrics";
import React from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";

export const metadata: Metadata = {
  title: "Horse Management Dashboard | Admin Panel",
  description: "Manage your horses, track health metrics, and monitor performance",
};

export default function AdminDashboard() {
  return (
    <div className="container mx-auto px-4 py-6">
          <HorseMetrics />
   
    </div>
  );
}