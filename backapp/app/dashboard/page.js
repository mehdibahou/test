
"use client";
import Datacards from "./with_brand_icon";
import LineChart from "./lineshart";
import DoughnutChart from "./doughnutchart";
import MyBarChart from "./histogram";
import Table from "./simple_in_card";
import { useState } from "react";
export default function Dashboard() {
 
 
  const [data, setData] = useState([]);

  const handleTimeRangeChange = async (range) => {
    // Fetch new data based on selected time range
    const response = await fetch(`/api/analytics?days=${range}`);
    const newData = await response.json();
    setData(newData);
  };
 
  return (
   
    <>
         <Datacards/>
    <div className="flex flex-col justify-between    mt-10 ">
    
    <div className=" sm:w-[100%] h-72  flex justify-center items-center md:h-auto  md:p-4 shadow-md rounded-md"><LineChart
      title="Revenue Over Time"
      data={data}
      xKey="date"
      yKey="dailyRevenue"
      color="#2563eb"
      fillColor="rgba(37, 99, 235, 0.1)"
      onTimeRangeChange={handleTimeRangeChange}
    /></div>
    <div className=" sm:w-[100%] h-auto p-9  shadow-md rounded-md md:p-4"> <DoughnutChart/></div>
    </div>
    <div className="   shadow-md rounded-md md:p-32 mt-4"><MyBarChart/></div>
    <Table/>
      </>
  );
}
