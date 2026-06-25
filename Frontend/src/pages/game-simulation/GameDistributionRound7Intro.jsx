import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GameDistributionRound7Intro = () => {
  const navigate = useNavigate();

  // --- Round 6 Data (from localStorage) ---
  const r6TotalSales = parseInt(localStorage.getItem("gameDistributionR6TotalSales") || "0", 10);
  const r6RetailerOutstanding = parseInt(localStorage.getItem("gameDistributionR6RetailerOutstanding") || "0", 10);
  const r6TradeSchemeSpend = parseInt(localStorage.getItem("gameDistributionR6TradeSchemeSpend") || "0", 10);
  const r6NetPaymentReceived = parseInt(localStorage.getItem("gameDistributionR6NetPaymentReceived") || "0", 10);

  // --- Round 7 Forced Opening Stock logic ---
  // "Opening stock of Round 7 = Opening stock x 120%"
  const [inventory, setInventory] = useState(() => {
    const r6Saved = localStorage.getItem("gameDistributionR7OpeningStock") || localStorage.getItem("gameDistributionRound7Inventory");
    let baseInventory = r6Saved ? JSON.parse(r6Saved) : { milk: { qty: 0 }, dark: { qty: 0 }, wafer: { qty: 0 }, gift: { qty: 0 } };
    
    // Apply the 120% push (20% increase in stock)
    const pushedInventory = {
      milk: { ...baseInventory.milk, qty: Math.round(baseInventory.milk.qty * 1.2) },
      dark: { ...baseInventory.dark, qty: Math.round(baseInventory.dark.qty * 1.2) },
      wafer: { ...baseInventory.wafer, qty: Math.round(baseInventory.wafer.qty * 1.2) },
      gift: { ...baseInventory.gift, qty: Math.round(baseInventory.gift.qty * 1.2) }
    };
    
    return pushedInventory;
  });
  
  const openingStockUnits = inventory.milk.qty + inventory.dark.qty + inventory.wafer.qty + inventory.gift.qty;

  const r6ClosingCash = parseInt(localStorage.getItem("gameDistributionCash") || "5000000", 10);
  const isInitialized = localStorage.getItem("gameDistributionR7CashInitialized");
  const cashInHand = isInitialized ? r6ClosingCash : r6ClosingCash + r6NetPaymentReceived - r6TradeSchemeSpend;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(amount);
  };

  const handleNext = () => {
    // Reset Round 7 input screens to defaults
    [
      "gameDistributionR7QuantityDiscount",
      "gameDistributionR7RetailDisplay",
      "gameDistributionR7CreditDays",
      "gameDistributionR7MaxCreditLimit",
      "gameDistributionR7CreditEnforcement",
      "gameDistributionR7EarlyPaymentDiscount",
      "gameDistributionR7RetailersToVisit",
      "gameDistributionR7NewRetailerEffort",
      "gameDistributionR7SchemePushIntensity",
      "gameDistributionR7OrderFulfilment",
      "gameDistributionR7DeliveryFrequency",
      "gameDistributionR7PriorityAllocation",
      "gameDistributionR7StockBuffer",
    ].forEach(key => localStorage.removeItem(key));

    navigate('/game-distribution/round7-inventory'); 
  };

  const handleBack = () => {
    navigate('/game-distribution/round6-result');
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4 font-sans text-gray-800">
      <div className="w-full max-w-4xl bg-yellow-100 rounded-3xl shadow-2xl overflow-hidden border-8 border-yellow-200 my-8">
        
        <div className="bg-emerald-700 text-emerald-50 px-6 py-3 flex justify-between items-center text-sm font-bold tracking-widest uppercase border-b-4 border-emerald-800">
          <span>Game Simulation</span>
        </div>

        <div className="text-center pt-8 pb-4 border-b-4 border-yellow-200/50">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-red-600 tracking-wider uppercase drop-shadow-sm px-4">
            Round 7 – Year-End Primary Pressure
          </h1>
        </div>

        <div className="p-8 sm:p-12 space-y-8">

          {/* Carried Forward Block */}
          <div className="bg-white border-4 border-emerald-300 rounded-xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-emerald-200 pb-2 flex items-center">
               Carried Forward & Forced Primary Push
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { 
                  label: "Opening Stock (R6 Base x 120%)", 
                  value: `Milk: ${inventory.milk.qty} | Dark: ${inventory.dark.qty} | Wafer: ${inventory.wafer.qty} | Gift: ${inventory.gift.qty}` 
                },
                { label: "Last Round Sale (R6)", value: formatCurrency(r6TotalSales) },
                { label: "Retailer Outstanding (R6)", value: formatCurrency(r6RetailerOutstanding) },
                { label: "Trade Scheme to be Reimbursed by the Company", value: formatCurrency(r6TradeSchemeSpend) },
                { label: "Opening Cash in Hand", value: formatCurrency(cashInHand) },
              ].map((item, idx) => (
                <div key={idx} className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 flex flex-col justify-center">
                  <span className="text-lg text-gray-500 font-bold tracking-wider mb-1">{item.label}</span>
                  <span className="text-xl font-bold text-emerald-800">{item.value}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-red-600 mt-2 font-semibold">
              * Note: Opening stock includes a forced 20% primary push to meet year-end targets.
            </p>
          </div>

          {/* Market Situation */}
          <div className="bg-white border-4 border-red-300 rounded-xl p-6 shadow-sm">
            <p className="text-gray-800 text-lg font-medium text-center">
              Tedbury is at 95% of its YTD target. Strong pressure to exceed targets before closing. 
              Company has pushed 20% additional primary stock into your warehouse.
            </p>
          </div>

          {/* Grid Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-amber-50 rounded-xl border-2 border-amber-200 p-6 flex flex-col">
              <h2 className="text-lg font-bold text-amber-800 mb-4 border-b-2 border-amber-200 pb-2 flex items-center uppercase">
                Key Situation
              </h2>
              <ul className="space-y-2 text-gray-700 font-medium text-sm">
                <li className="flex items-start">▶ 95% Achievement of Annual Target</li>
                <li className="flex items-start">▶ Required Push: 20% Addl. Primary</li>
                <li className="flex items-start">▶ Mandatory Buffer: Min 20% Inventory</li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-6 flex flex-col">
              <h2 className="text-lg font-bold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2 flex items-center uppercase">
                Market Reality
              </h2>
              <ul className="space-y-2 text-gray-700 font-medium text-sm">
                <li className="flex items-start">▶ Aggressive Primary Billing</li>
                <li className="flex items-start">▶ Secondary demand may not match push</li>
                <li className="flex items-start">▶ Inventory levels will spike</li>
              </ul>
            </div>

            <div className="bg-purple-50 rounded-xl border-2 border-purple-200 p-6 flex flex-col">
              <h2 className="text-lg font-bold text-purple-800 mb-4 border-b-2 border-purple-200 pb-2 flex items-center uppercase">
                Business Impact
              </h2>
              <ul className="space-y-2 text-gray-700 font-medium text-sm">
                <li className="flex items-start">▶ Additional Capital Investment Needed</li>
                <li className="flex items-start">▶ Higher holding stock risk</li>
                <li className="flex items-start">▶ Possible ROI compression</li>
              </ul>
            </div>

            <div className="bg-emerald-50 rounded-xl border-2 border-emerald-200 p-6 flex flex-col">
              <h2 className="text-lg font-bold text-emerald-800 mb-4 border-b-2 border-emerald-200 pb-2 flex items-center uppercase">
                Trade-Off
              </h2>
              <ul className="space-y-2 text-gray-700 font-medium text-sm">
                <li className="flex items-start">▶ Higher Primary: Meets targets & strengthens relationship</li>
                <li className="flex items-start">▶ Controlled Primary: Protects ROI but risks target miss</li>
              </ul>
            </div>

          </div>

          <div className="bg-orange-50 rounded-xl border-2 border-orange-200 p-6 flex flex-col shadow-sm">
            <h2 className="text-lg font-bold text-orange-800 mb-4 border-b-2 border-orange-200 pb-2 flex items-center uppercase">
              🎯 What's at Stake
            </h2>
            <div className="flex flex-wrap gap-2">
              {["Distributor ROI", "Cash Flow Health", "Inventory Levels", "Final Performance Score"].map(tag => (
                <span key={tag} className="bg-white px-3 py-1 rounded-full border border-orange-200 font-bold text-orange-700 shadow-sm text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-12 flex justify-between items-center max-w-2xl mx-auto px-4">
            <button onClick={handleBack} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-10 rounded-xl shadow-[0_4px_0_rgb(75,85,99)] hover:shadow-[0_2px_0_rgb(75,85,99)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all text-xl">[ Back ]</button>
            <button onClick={handleNext} className="bg-green-500 hover:bg-green-600 text-white font-extrabold py-4 px-16 rounded-xl shadow-[0_6px_0_rgb(21,128,61)] hover:shadow-[0_3px_0_rgb(21,128,61)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all text-2xl transform scale-110 tracking-widest">[ Next ]</button>
          </div>

        </div>

        <div className="bg-yellow-100 border-t-2 border-yellow-300 px-8 py-4 flex justify-between items-center text-lg font-bold text-gray-800 uppercase">
          <span>Round: 7 of 7</span>
          <span>Market Condition: Year-End Pressure</span>
        </div>

      </div>
    </div>
  );
};

export default GameDistributionRound7Intro;
