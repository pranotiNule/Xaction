import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GameDistributionRound3Intro = () => {
  const navigate = useNavigate();

  // --- Round 2 Data (from localStorage, saved at end of Round 2) ---
  const r2TotalSales = parseInt(localStorage.getItem("gameDistributionR2TotalSales") || "0", 10);
  const r2RetailerOutstanding = parseInt(localStorage.getItem("gameDistributionR2RetailerOutstanding") || "0", 10);
  const r2TradeSchemeSpend = parseInt(localStorage.getItem("gameDistributionR2TradeSchemeSpend") || "0", 10);
  const r2NetPaymentReceived = parseInt(localStorage.getItem("gameDistributionR2NetPaymentReceived") || "0", 10);

  // --- Round 3 Opening Inventory (Carried over from R2 closing) ---
  const [inventory] = useState(() => {
    const saved = localStorage.getItem("gameDistributionR3OpeningStock") || localStorage.getItem("gameDistributionRound3Inventory");
    if (saved) {
        return JSON.parse(saved);
    }
    return {
      milk: { qty: 0 }, dark: { qty: 0 }, wafer: { qty: 0 }, gift: { qty: 0 }
    };
  });
  
  const openingStock = inventory.milk.qty + inventory.dark.qty + inventory.wafer.qty + inventory.gift.qty;

  // Opening Cash Balance
  const r2ClosingCash = parseInt(localStorage.getItem("gameDistributionCash") || "5000000", 10);
  
  // Cash in Hand = Opening Cash Balance + Payment Received (from R2) – Trade Scheme (from R2)
  const cashInHand = r2ClosingCash + r2NetPaymentReceived - r2TradeSchemeSpend;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleNext = () => {
    // Save cashInHand synchronously so the Inventory page reads the correct value on mount
    localStorage.setItem("gameDistributionCash", Math.round(cashInHand).toString());

    // Reset Round 3 input screens to defaults
    [
      "gameDistributionR3QuantityDiscount",
      "gameDistributionR3RetailDisplay",
      "gameDistributionR3CreditDays",
      "gameDistributionR3MaxCreditLimit",
      "gameDistributionR3EarlyPaymentDiscount",
      "gameDistributionR3EnforcementLevel",
      "gameDistributionR3RetailersToVisit",
      "gameDistributionR3NewRetailerEffort",
      "gameDistributionR3SchemePushIntensity",
      "gameDistributionR3OrderFulfilment",
      "gameDistributionR3DeliveryFrequency",
      "gameDistributionR3PriorityAllocation",
      "gameDistributionR3StockBuffer",
    ].forEach(key => localStorage.removeItem(key));

    navigate('/game-distribution/round3-inventory');
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl bg-yellow-100 rounded-3xl shadow-2xl overflow-hidden border-8 border-yellow-200">
        
        {/* Header Strip */}
        <div className="bg-emerald-700 text-emerald-50 px-6 py-3 flex justify-between items-center text-sm font-bold tracking-widest uppercase border-b-4 border-emerald-800">
          <span>Game Simulation</span>
        </div>

        {/* Title Section */}
        <div className="text-center pt-8 pb-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-red-600 tracking-wider uppercase drop-shadow-sm px-4">
            Round 3 – Market Expansion Drive
          </h1>
        </div>

        {/* Content Area */}
        <div className="p-8 sm:p-12 space-y-8">

          {/* Carried Forward from Round 2 */}
          <div className="bg-white border-4 border-emerald-300 rounded-xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-emerald-200 pb-2 flex items-center">
              <span className="text-emerald-600 mr-2">📋</span> Carried Forward from Round 2
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[

                { 
                  label: "Opening Stock (From Last Screen)", 
                  value: `Milk: ${inventory.milk.qty} | Dark: ${inventory.dark.qty} | Wafer: ${inventory.wafer.qty} | Gift: ${inventory.gift.qty}` 
                },
                { label: "Last Round Sale (R2)", value: formatCurrency(r2TotalSales) },
                { label: "Retailer Outstanding (R2)", value: formatCurrency(r2RetailerOutstanding) },
                { label: "Trade Scheme to be Reimbursed by the Company", value: formatCurrency(r2TradeSchemeSpend) },
                { label: "Cash in Hand", value: formatCurrency(cashInHand) },
              ].map((item, idx) => (
                <div key={idx} className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 flex flex-col justify-center">
                  <span className="text-lg text-gray-500 font-bold tracking-wider mb-1">{item.label}</span>
                  <span className="text-xl font-black text-emerald-800">{item.value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4 italic font-medium">
              * Cash in Hand = Opening Cash Balance + Payment Received (from last screen) – Trade Scheme
            </p>
          </div>

          {/* Main Context */}
          <div className="bg-white border-4 border-blue-300 rounded-xl p-6 shadow-sm">
            <p className="text-gray-800 text-lg font-medium leading-relaxed">
              The company has identified a strong opportunity to expand distribution in your territory and is pushing for aggressive outlet addition.
            </p>
            <p className="text-gray-800 text-lg font-medium leading-relaxed mt-4">
              You are now expected to <span className="font-bold text-red-600">increase market reach</span> and <span className="font-bold text-emerald-700">drive penetration</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Key Situation */}
            <div className="bg-amber-50 rounded-xl border-2 border-amber-200 p-6 flex flex-col">
              <h2 className="text-xl font-bold text-amber-800 mb-4 border-b-2 border-amber-200 pb-2">Key Situation</h2>
              <ul className="space-y-3 text-gray-700 font-medium">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 mt-1">▶</span>
                  <span><strong>New Outlets to be Opened:</strong> 1000</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 mt-1">▶</span>
                  <span><strong>Entry Product:</strong> Tedbury Milk Chocolate</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 mt-1">▶</span>
                  <span><strong>Minimum Placement:</strong> 20 units per outlet</span>
                </li>
              </ul>
              <p className="mt-4 text-sm text-gray-600 italic">This means a significant increase in primary and secondary demand for Milk Chocolate.</p>
            </div>

            {/* Company Support */}
            <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-6 flex flex-col">
              <h2 className="text-xl font-bold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2">Company Support</h2>
              <p className="text-gray-700 font-medium mb-3">To support this expansion:</p>
              <ul className="space-y-2 text-gray-700 font-medium">
                <li className="flex items-center">
                  <span className="text-blue-500 mr-2">✔</span>
                  <span>Company will reimburse salary of 1 DSR (₹20,000)</span>
                </li>
              </ul>
              <p className="mt-4 text-sm text-gray-600 italic">This resource can be used to drive outlet onboarding and coverage.</p>
            </div>

            {/* Opportunity */}
            <div className="bg-emerald-50 rounded-xl border-2 border-emerald-200 p-6 flex flex-col">
              <h2 className="text-xl font-bold text-emerald-800 mb-4 border-b-2 border-emerald-200 pb-2">Opportunity</h2>
              <ul className="space-y-3 text-gray-700 font-medium">
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-2 mt-1">★</span>
                  <span>Rapid increase in market reach and visibility</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-2 mt-1">★</span>
                  <span>Potential boost in market share</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-2 mt-1">★</span>
                  <span>Strong pipeline for future repeat sales</span>
                </li>
              </ul>
            </div>

            {/* Challenges */}
            <div className="bg-red-50 rounded-xl border-2 border-red-200 p-6 flex flex-col">
              <h2 className="text-xl font-bold text-red-800 mb-4 border-b-2 border-red-200 pb-2">Challenges</h2>
              <ul className="space-y-2 text-gray-700 font-medium">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 mt-1">−</span>
                  <span>Higher inventory requirement for Milk Chocolate</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 mt-1">−</span>
                  <span>Need for efficient sales team deployment</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 mt-1">−</span>
                  <span>Managing supply consistency across new outlets</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Your Decision */}
            <div className="bg-purple-50 rounded-xl border-2 border-purple-200 p-6 flex flex-col">
              <h2 className="text-xl font-bold text-purple-800 mb-4 border-b-2 border-purple-200 pb-2">Your Decision</h2>
              <p className="text-gray-700 font-medium mb-3">You must decide:</p>
              <ul className="space-y-2 text-gray-700 font-medium">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2 mt-1">✔</span>
                  <span>How aggressively to expand into new outlets</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2 mt-1">✔</span>
                  <span>How much inventory to allocate for expansion</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2 mt-1">✔</span>
                  <span>How to deploy your sales team (including the additional DSR)</span>
                </li>
              </ul>
            </div>

            {/* What's at Stake */}
            <div className="bg-orange-50 rounded-xl border-2 border-orange-200 p-6 flex flex-col">
              <h2 className="text-xl font-bold text-orange-800 mb-4 border-b-2 border-orange-200 pb-2">What's at Stake</h2>
              <p className="text-gray-700 font-medium mb-3">Your decisions will impact:</p>
              <div className="flex flex-wrap gap-3">
                <span className="bg-white px-3 py-1.5 rounded-full border border-orange-200 font-bold text-orange-700 shadow-sm text-sm">Market Share Growth</span>
                <span className="bg-white px-3 py-1.5 rounded-full border border-orange-200 font-bold text-orange-700 shadow-sm text-sm">Retailer Coverage</span>
                <span className="bg-white px-3 py-1.5 rounded-full border border-orange-200 font-bold text-orange-700 shadow-sm text-sm">Inventory Utilization</span>
                <span className="bg-white px-3 py-1.5 rounded-full border border-orange-200 font-bold text-orange-700 shadow-sm text-sm">Cash Flow Position</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-12 flex justify-center items-center">
            <button 
              onClick={handleNext}
              className="bg-green-500 hover:bg-green-600 text-white font-extrabold py-4 px-16 rounded-xl shadow-[0_6px_0_rgb(21,128,61)] hover:shadow-[0_3px_0_rgb(21,128,61)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all text-2xl transform hover:scale-105"
            >
              Next
            </button>
          </div>

        </div>

        {/* Footer Info Strip */}
        <div className="bg-yellow-100 border-t-2 border-yellow-300 px-8 py-4 flex justify-between items-center text-lg font-bold text-gray-800">
          <div className="flex flex-col">
            <span>Round: 3 of 7</span>
          </div>
          <div className="flex flex-col text-right">
            <span>Market Temperature: Expanding</span>
            <span>Market Condition: High Demand</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GameDistributionRound3Intro;
