import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import api from "@/lib/api";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function CardAnalytics() {
  const [activeCard, setActiveCard] = useState<string>("");
  const [cards, setCards] = useState<any[]>([]);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const res = await api.get("/wallet/payment-methods");
      const cardData = res.data.filter((m: any) => m.type === 'card');
      setCards(cardData);
      if (cardData.length > 0) setActiveCard(cardData[0]._id);
    } catch (e) {
      console.error(e);
    }
  };

  const chartSeries = [40, 30, 20, 10];

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "donut",
    },
    labels: ["Blue", "Green", "Yellow", "Pink"],
    colors: ["#4F7CFE", "#1EDAC5", "#FFC542", "#FF7AA2"],
    plotOptions: {
      pie: {
        donut: {
          size: "58%",
        },
      },
    },
    stroke: {
      width: 0,
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    tooltip: {
      enabled: false,
    },
  };

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-[20%_80%] md:pr-4 gap-4 items-stretch">
        <div className="rounded-xl bg-[#202736] flex flex-col justify-center items-center h-full py-6">
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="donut"
            width={230}
          />

          <div className="grid grid-cols-2 gap-x-12 gap-y-3 mt-6">
            {cards.length === 0 && <p className="text-xs text-gray-500">No cards found</p>}
            {cards.map((card, i) => (
              <div key={card._id} className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full bg-blue-500`}></span>
                <p className="text-sm text-gray-300 font-DMSans capitalize">{card.provider}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl h-full">
          <div className="flex flex-col gap-3 h-full">
            {cards.map((card) => (
              <div
                key={card._id}
                onClick={() => setActiveCard(card._id)}
                className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition w-full ${activeCard === card._id ? 'bg-[#2B3343] border-[#82F764]' : 'bg-[#202736] border-[#202736]'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 hidden md:flex p-2 rounded-md bg-[#2B3343] items-center justify-center overflow-hidden">
                    <span className="text-xs text-white">Card</span>
                  </div>

                  <div className="flex md:gap-30 gap-5 flex-wrap">
                    <div>
                      <p className="text-xs text-white font-DMSans">
                        Provider
                      </p>
                      <p className="text-sm text-[#718EBF] font-DMSans capitalize">
                        {card.provider}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-white font-DMSans">
                        Details
                      </p>
                      <p className="text-sm text-[#718EBF] font-DMSans">
                        {card.details}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
