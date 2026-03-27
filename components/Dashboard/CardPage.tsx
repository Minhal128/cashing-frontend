"use client";

import AddNewCardForm from "../Card/AddNewCardForm";
import CardAnalytics from "../Card/CardAnalytics";
import CardSettings from "../Card/CardSettings";
import CardSection from "../Card/CardsSections";


export default function CardPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-DMSans text-white">Cards</h1>
        <p className="text-sm font-DMSans text-[#7A869C]">
          Transfer funds to other Cha $Ching users
        </p>
      </div>

      <CardSection />

      <CardAnalytics />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AddNewCardForm />
        <CardSettings />
      </div>
    </div>
  );
}
