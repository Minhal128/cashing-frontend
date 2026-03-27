"use client";

import ActivityTabs from "../Activity/ActivityTabs";
import ActivityTrendChart from "../Activity/ActivityTrendChart";
import RecenteActivities from "../Activity/RecentActivities";

export default function ActivityPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-DMSans text-white">Activity</h1>
        <p className="text-sm font-DMSans text-[#7A869C]">
          Transfer funds to other Cha $Ching users
        </p>
      </div>

      <ActivityTabs />

      <div className="">
        <ActivityTrendChart />
      </div>

      <RecenteActivities />
    </div>
  );
}
