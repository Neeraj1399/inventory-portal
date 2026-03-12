// contexts/CurrencyContext.js
import React, { createContext, useContext, useState } from "react";

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState("USD"); // Default

  const formatPrice = (amount) => {
    // Example: If base price is USD, convert to INR (static rate for demo)
    const rate = currency === "INR" ? 83 : 1;
    const value = amount * rate;

    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency: currency,
    }).format(value);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
