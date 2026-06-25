import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GameDistributionRound4Intro = () => {
  const navigate = useNavigate();

  // --- Round 3 Data (from localStorage, saved at end of Round 3) ---
  const r3TotalSales = parseInt(localStorage.getItem("gameDistributionR3TotalSales") || "0", 10);
  const r3RetailerOutstanding = parseInt(localStorage.getItem("gameDistributionR3RetailerOutstanding") || "0", 10);
  const r3TradeSchemeSpend = parseInt(localStorage.getItem("gameDistributionR3TradeSchemeSpend") || "0", 10);
  const r3NetPaymentReceived = parseInt(localStorage.getItem("gameDistributionR3NetPaymentReceived") || "0", 10);

  // --- Round 4 Opening Inventory (Carried over from R3 closing) ---
  const [inventory] = useState(() => {
    const saved = localStorage.getItem("gameDistributionR4OpeningStock") || localStorage.getItem("gameDistributionRound4Inventory");
    if (saved) {
        return JSON.parse(saved);
    }
    return {
      milk: { qty: 0 }, dark: { qty: 0 }, wafer: { qty: 0 }, gift: { qty: 0 }
    };
  });
  
  const openingStock = inventory.milk.qty + inventory.dark.qty + inventory.wafer.qty + inventory.gift.qty;

  // Opening Cash Balance (Status after R3 purchases)
  const r3ClosingCash = parseInt(localStorage.getItem("gameDistributionCash") || "5000000", 10);
  
  // Cash in Hand = Opening Cash Balance + Payment Received (from R3) – Trade Scheme (from R3)
  // Payment Received = Net Cash Received = R3 Net Payment Received (Total Sales − Retailer Outstanding)
  const cashInHand = r3ClosingCash + r3NetPaymentReceived - r3TradeSchemeSpend;

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

    // Reset Round 4 input screens to defaults
    [
      "gameDistributionR4QuantityDiscount",
      "gameDistributionR4RetailDisplay",
      "gameDistributionR4CreditDays",
      "gameDistributionR4MaxCreditLimit",
      "gameDistributionR4EarlyPaymentDiscount",
      "gameDistributionR4EnforcementLevel",
      "gameDistributionR4RetailersToVisit",
      "gameDistributionR4NewRetailerEffort",
      "gameDistributionR4SchemePushIntensity",
      "gameDistributionR4OrderFulfilment",
      "gameDistributionR4DeliveryFrequency",
      "gameDistributionR4PriorityAllocation",
      "gameDistributionR4StockBuffer",
    ].forEach(key => localStorage.removeItem(key));

    navigate('/game-distribution/round4-inventory');
  };

  const handleBack = () => {
    navigate('/game-distribution/round3-result');
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl bg-yellow-100 rounded-3xl shadow-2xl overflow-hidden border-8 border-yellow-200">
        
        {/* Header Strip */}
        <div className="bg-emerald-700 text-emerald-50 px-6 py-3 flex justify-between items-center text-sm font-bold tracking-widest uppercase border-b-4 border-emerald-800">
          <span>Game Simulation</span>
        </div>

        {/* Title Section */}
        <div className="text-center pt-8 pb-4 border-b-4 border-yellow-200/50">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-red-600 tracking-wider uppercase drop-shadow-sm px-4">
            Round 4 – Manpower Attrition
          </h1>
        </div>

        {/* Content Area */}
        <div className="p-8 sm:p-12 space-y-8">

          {/* Carried Forward from Round 3 */}
          <div className="bg-white border-4 border-emerald-300 rounded-xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-emerald-200 pb-2 flex items-center">
              <span className="text-emerald-600 mr-2">📋</span> Carried Forward from Round 3
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { 
                  label: "Opening Stock (From Last Screen)", 
                  value: `Milk: ${inventory.milk.qty} | Dark: ${inventory.dark.qty} | Wafer: ${inventory.wafer.qty} | Gift: ${inventory.gift.qty}` 
                },
                { label: "Last Round Sale (R3)", value: formatCurrency(r3TotalSales) },
                { label: "Retailer Outstanding (R3)", value: formatCurrency(r3RetailerOutstanding) },
                { label: "Trade Scheme to be Reimbursed by the Company", value: formatCurrency(r3TradeSchemeSpend) },
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
          <div className="bg-white border-4 border-red-300 rounded-xl p-6 shadow-sm">
            <p className="text-gray-800 text-lg font-medium leading-relaxed">
              Your distribution operations have been impacted by a sudden <span className="text-red-600 font-bold underline">manpower shortage</span>.
            </p>
            <p className="text-gray-800 text-lg font-medium leading-relaxed mt-4">
              Out of your salesmen, <span className="font-bold text-red-600">2 have resigned</span>, leaving you with limited field capacity. There is no immediate time to hire replacements, and business must continue without disruption.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Key Situation */}
            <div className="bg-amber-50 rounded-xl border-2 border-amber-200 p-6 flex flex-col">
              <h2 className="text-xl font-bold text-amber-800 mb-4 border-b-2 border-amber-200 pb-2 flex items-center">
                <span className="mr-2">⚠️</span> Key Situation
              </h2>
              <ul className="space-y-3 text-gray-700 font-medium text-sm">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 mt-1">▶</span>
                  <span><strong>Salesmen Available:</strong> 2 have Left. Company has taken away the 1 DSR subsidy (₹20,000)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 mt-1">▶</span>
                  <span><strong>Sales Coverage Pressure:</strong> High</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 mt-1">▶</span>
                  <span><strong>Recruitment:</strong> Not Possible This Round</span>
                </li>
              </ul>
            </div>

            {/* Operational Challenge */}
            <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-6 flex flex-col">
              <h2 className="text-xl font-bold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2 flex items-center">
                <span className="mr-2">⚙️</span> Operational Challenge
              </h2>
              <p className="text-gray-700 font-medium mb-3 text-sm italic underline decoration-blue-200">The remaining salesmen now need to stretch their capacity:</p>
              <ul className="space-y-2 text-gray-700 font-medium text-sm">
                <li className="flex items-center">
                  <span className="text-blue-500 mr-2">✔</span>
                  <span>Each salesman must cover a minimum of 300 outlets</span>
                </li>
                <li className="flex items-center">
                  <span className="text-blue-500 mr-2">✔</span>
                  <span>Beat planning and time management become critical</span>
                </li>
              </ul>
            </div>

            {/* Supply Constraint */}
            <div className="bg-purple-50 rounded-xl border-2 border-purple-200 p-6 flex flex-col">
              <h2 className="text-xl font-bold text-purple-800 mb-4 border-b-2 border-purple-200 pb-2 flex items-center">
                <span className="mr-2">🚛</span> Supply Constraint
              </h2>
              <p className="text-gray-700 font-medium mb-3 text-sm italic">Since order generation may slow down or become uneven:</p>
              <ul className="space-y-2 text-gray-700 font-medium text-sm">
                <li className="flex items-start text-xs">
                  <span className="text-purple-500 mr-2">▶</span>
                  <span>Delivery frequency must be aligned with actual orders booked</span>
                </li>
                <li className="flex items-start text-xs">
                  <span className="text-purple-500 mr-2">▶</span>
                  <span>Over-delivery may lead to excess stock at retail</span>
                </li>
                <li className="flex items-start text-xs">
                  <span className="text-purple-500 mr-2">▶</span>
                  <span>Under-delivery may lead to missed sales opportunities</span>
                </li>
              </ul>
            </div>

            {/* Your Decision */}
            <div className="bg-emerald-50 rounded-xl border-2 border-emerald-200 p-6 flex flex-col">
              <h2 className="text-xl font-bold text-emerald-800 mb-4 border-b-2 border-emerald-200 pb-2 flex items-center">
                <span className="mr-2">💡</span> Your Decision
              </h2>
              <p className="text-gray-700 font-medium mb-3 text-sm">You must decide:</p>
              <ul className="space-y-2 text-gray-700 font-medium text-sm text-xs">
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-2">✔</span>
                  <span>How to deploy the reduced sales team effectively</span>
                </li>
                <li className="flex items-start text-xs">
                  <span className="text-emerald-500 mr-2">✔</span>
                  <span>Which outlets to prioritize (high value vs wide coverage)</span>
                </li>
              </ul>
            </div>

          </div>

          {/* What’s at Stake */}
          <div className="bg-orange-50 rounded-xl border-2 border-orange-200 p-6 flex flex-col">
            <h2 className="text-xl font-bold text-orange-800 mb-4 border-b-2 border-orange-200 pb-2 flex items-center">
              <span className="mr-2">🔥</span> What’s at Stake
            </h2>
            <p className="text-gray-700 font-medium mb-3 text-sm">Your decisions will impact:</p>
            <div className="flex flex-wrap gap-3">
              {["Market Coverage", "Retailer Satisfaction", "Sales Volume", "Operational Efficiency"].map(tag => (
                <span key={tag} className="bg-white px-3 py-1.5 rounded-full border border-orange-200 font-bold text-orange-700 shadow-sm text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-12 flex justify-between items-center max-w-2xl mx-auto px-4">
            <button 
              onClick={handleBack}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-10 rounded-xl shadow-[0_4px_0_rgb(75,85,99)] hover:shadow-[0_2px_0_rgb(75,85,99)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all text-xl"
            >
              [ Back ]
            </button>

            <button 
              onClick={handleNext}
              className="bg-green-500 hover:bg-green-600 text-white font-extrabold py-4 px-16 rounded-xl shadow-[0_6px_0_rgb(21,128,61)] hover:shadow-[0_3px_0_rgb(21,128,61)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all text-2xl transform scale-105"
            >
              [ Next ]
            </button>
          </div>

        </div>

        {/* Footer Info Strip */}
        <div className="bg-yellow-100 border-t-2 border-yellow-300 px-8 py-4 flex justify-between items-center text-lg font-bold text-gray-800">
          <div className="flex flex-col">
            <span>Round: 4 of 7</span>
          </div>
          <div className="flex flex-col text-right">
            <span>Market Condition: Manpower Shortage</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GameDistributionRound4Intro;
