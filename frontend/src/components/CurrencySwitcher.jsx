// components/CurrencySwitcher.js
import React from "react";
import { useCurrency } from "../contexts/CurrencyContext";

const CurrencySwitcher = () => {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex gap-2 p-2 bg-slate-100 rounded-lg">
      <button
        onClick={() => setCurrency("USD")}
        className={`px-3 py-1 rounded-md text-xs font-bold ${currency === "USD" ? "bg-blue-600 text-white" : "text-slate-600"}`}
      >
        USD ($)
      </button>
      <button
        onClick={() => setCurrency("INR")}
        className={`px-3 py-1 rounded-md text-xs font-bold ${currency === "INR" ? "bg-blue-600 text-white" : "text-slate-600"}`}
      >
        INR (₹)
      </button>
    </div>
  );
};
