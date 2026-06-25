import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GameDistributionRound5Intro = () => {
  const navigate = useNavigate();

  // --- Round 4 Data (from localStorage) ---
  const r4TotalSales = parseInt(localStorage.getItem("gameDistributionR4TotalSales") || "0", 10);
  const r4RetailerOutstanding = parseInt(localStorage.getItem("gameDistributionR4RetailerOutstanding") || "0", 10);
  const r4TradeSchemeSpend = parseInt(localStorage.getItem("gameDistributionR4TradeSchemeSpend") || "0", 10);
  const r4NetPaymentReceived = parseInt(localStorage.getItem("gameDistributionR4NetPaymentReceived") || "0", 10);

  // --- Round 5 Opening Inventory ---
  const [inventory] = useState(() => {
    const saved = localStorage.getItem("gameDistributionR5OpeningStock") || localStorage.getItem("gameDistributionRound5Inventory");
    if (saved) return JSON.parse(saved);
    return { milk: { qty: 0 }, dark: { qty: 0 }, wafer: { qty: 0 }, gift: { qty: 0 } };
  });
  
  const openingStock = inventory.milk.qty + inventory.dark.qty + inventory.wafer.qty + inventory.gift.qty;

  const r4ClosingCash = parseInt(localStorage.getItem("gameDistributionCash") || "5000000", 10);
  const isInitialized = localStorage.getItem("gameDistributionR5CashInitialized");
  const cashInHand = isInitialized ? r4ClosingCash : r4ClosingCash + r4NetPaymentReceived - r4TradeSchemeSpend;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(amount);
  };

  const handleNext = () => {
    // Reset Round 5 input screens to defaults
    [
      "gameDistributionR5QuantityDiscount",
      "gameDistributionR5RetailDisplay",
      "gameDistributionR5CreditDays",
      "gameDistributionR5MaxCreditLimit",
      "gameDistributionR5CreditEnforcement",
      "gameDistributionR5EarlyPaymentDiscount",
      "gameDistributionR5RetailersToVisit",
      "gameDistributionR5NewRetailerEffort",
      "gameDistributionR5SchemePushIntensity",
      "gameDistributionR5OrderFulfilment",
      "gameDistributionR5DeliveryFrequency",
      "gameDistributionR5PriorityAllocation",
      "gameDistributionR5StockBuffer",
    ].forEach(key => localStorage.removeItem(key));

    navigate('/game-distribution/round5-inventory'); 
  };

  const handleBack = () => {
    navigate('/game-distribution/round4-result');
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl bg-yellow-100 rounded-3xl shadow-2xl overflow-hidden border-8 border-yellow-200 my-8">
        
        {/* Header Strip */}
        <div className="bg-emerald-700 text-emerald-50 px-6 py-3 flex justify-between items-center text-sm font-bold tracking-widest uppercase border-b-4 border-emerald-800">
          <span>Game Simulation</span>
        </div>

        {/* Title Section */}
        <div className="text-center pt-8 pb-4 border-b-4 border-yellow-200/50">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-red-600 tracking-wider uppercase drop-shadow-sm px-4">
            Round 5 – Competition Stock Out
          </h1>
        </div>

        {/* Content Area */}
        <div className="p-8 sm:p-12 space-y-8">

          {/* Carried Forward Block (Top) */}
          <div className="bg-white border-4 border-emerald-300 rounded-xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-emerald-200 pb-2 flex items-center uppercase tracking-tighter">
               Carried Forward from Round 4
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { 
                  label: "Opening Stock (From Last Screen)", 
                  value: `Milk: ${inventory.milk.qty} | Dark: ${inventory.dark.qty} | Wafer: ${inventory.wafer.qty} | Gift: ${inventory.gift.qty}` 
                },
                { label: "Last Round Sale (R4)", value: formatCurrency(r4TotalSales) },
                { label: "Retailer Outstanding (R4)", value: formatCurrency(r4RetailerOutstanding) },
                { label: "Trade Scheme to be Reimbursed by the Company", value: formatCurrency(r4TradeSchemeSpend) },
                { label: "Cash in Hand", value: formatCurrency(cashInHand) },
              ].map((item, idx) => (
                <div key={idx} className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 flex flex-col justify-center">
                  <span className="text-lg text-gray-500 font-bold tracking-wider mb-1">{item.label}</span>
                  <span className="text-xl font-black text-emerald-800">{item.value}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-2 italic">* Cash in Hand = Opening Cash Balance + Payment Received (from last screen) - Trade Scheme</p>
          </div>

          {/* Market Situation (White box with red border like screenshot) */}
          <div className="bg-white border-4 border-red-300 rounded-xl p-6 shadow-sm">
            <p className="text-gray-800 text-lg font-medium text-center">
              The market dynamics have shifted dramatically in your favor. Tesle factories are impacted due to a <span className="text-red-600 font-bold underline italic">labour union issue</span>.
            </p>
            <p className="text-gray-800 text-lg font-medium text-center mt-2">
              There is <span className="font-bold text-red-600">no supply of Tesle products</span> in the market this round, leaving a large number of retailers unserved.
            </p>
          </div>

          {/* Grid Area (2-column layout for the 8 sections) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Key Situation (Amber) */}
            <div className="bg-amber-50 rounded-xl border-2 border-amber-200 p-6 flex flex-col">
              <h2 className="text-lg font-bold text-amber-800 mb-4 border-b-2 border-amber-200 pb-2 flex items-center">
                <span className="mr-2">⚠️</span> Key Situation
              </h2>
              <ul className="space-y-2 text-gray-700 font-medium text-sm">
                <li className="flex items-start"><span className="text-red-500 mr-2 mt-1">▶</span> Tesle factories impacted due to labour union issue</li>
                <li className="flex items-start"><span className="text-red-500 mr-2 mt-1">▶</span> No supply of Tesle products in the market this round</li>
                <li className="flex items-start"><span className="text-red-500 mr-2 mt-1">▶</span> Large number of retailers unserved</li>
              </ul>
            </div>

            {/* Market Reality (Blue) */}
            <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-6 flex flex-col">
              <h2 className="text-lg font-bold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2 flex items-center">
                <span className="mr-2">🌍</span> Market Reality
              </h2>
              <ul className="space-y-2 text-gray-700 font-medium text-sm">
                <li className="flex items-start"><span className="text-blue-500 mr-2 mt-1">▶</span> Retailers urgently looking for replacement brands</li>
                <li className="flex items-start"><span className="text-blue-500 mr-2 mt-1">▶</span> Consumers willing to switch to available products</li>
                <li className="flex items-start"><span className="text-blue-500 mr-2 mt-1">▶</span> Shelf space temporarily open for capture</li>
              </ul>
            </div>

            {/* Opportunity (Purple) */}
            <div className="bg-purple-50 rounded-xl border-2 border-purple-200 p-6 flex flex-col">
              <h2 className="text-lg font-bold text-purple-800 mb-4 border-b-2 border-purple-200 pb-2 flex items-center">
                <span className="mr-2">📈</span> Opportunity
              </h2>
              <ul className="space-y-2 text-gray-700 font-medium text-sm text-xs">
                <li className="flex items-start"><span className="text-purple-500 mr-2 mt-1">▶</span> Gain significant market share</li>
                <li className="flex items-start"><span className="text-purple-500 mr-2 mt-1">▶</span> Increase secondary sales volume</li>
                <li className="flex items-start"><span className="text-purple-500 mr-2 mt-1">▶</span> Strengthen retailer relationships</li>
                <li className="flex items-start"><span className="text-purple-500 mr-2 mt-1">▶</span> Improve ROI through higher throughput</li>
              </ul>
            </div>

            {/* Credit Advantage Opportunity (Emerald) */}
            <div className="bg-emerald-50 rounded-xl border-2 border-emerald-200 p-6 flex flex-col">
              <h2 className="text-lg font-bold text-emerald-800 mb-4 border-b-2 border-emerald-200 pb-2 flex items-center text-xs">
                <span className="mr-2">💎</span> Credit Advantage Opportunity
              </h2>
              <ul className="space-y-2 text-gray-700 font-medium text-xs">
                <li className="flex items-start"><span className="text-emerald-500 mr-2 mt-1">▶</span> Reduce credit days due to strong demand</li>
                <li className="flex items-start"><span className="text-emerald-500 mr-2 mt-1">▶</span> Retailers accept stricter terms to secure supply</li>
              </ul>
            </div>

            {/* Credit Lever (Amber) */}
            <div className="bg-amber-50 rounded-xl border-2 border-amber-200 p-6 flex flex-col">
              <h2 className="text-lg font-bold text-amber-800 mb-4 border-b-2 border-amber-200 pb-2 flex items-center">
                <span className="mr-2">⚙️</span> Credit Lever
              </h2>
              <ul className="space-y-2 text-gray-700 font-medium text-sm text-xs">
                <li className="flex items-start"><span className="text-red-500 mr-2 mt-1">▶</span> Reduce credit days: Improve cash flow</li>
                <li className="flex items-start"><span className="text-red-500 mr-2 mt-1">▶</span> Maintain credit: Drive onboarding and volume</li>
              </ul>
            </div>

            {/* Trade-Off (Blue) */}
            <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-6 flex flex-col">
              <h2 className="text-lg font-bold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2 flex items-center">
                <span className="mr-2">⚖️</span> Trade-Off
              </h2>
              <p className="text-gray-700 font-medium text-xs italic">You must balance:</p>
              <ul className="space-y-1 text-gray-700 font-bold text-xs mt-1">
                <li>Aggressive market capture</li>
                <li className="text-center text-[10px] text-gray-400">vs</li>
                <li>Cash flow optimization</li>
              </ul>
            </div>

            {/* Challenges (Purple) */}
            <div className="bg-purple-50 rounded-xl border-2 border-purple-200 p-6 flex flex-col">
              <h2 className="text-lg font-bold text-purple-800 mb-4 border-b-2 border-purple-200 pb-2 flex items-center">
                <span className="mr-2">🔥</span> Challenges
              </h2>
              <ul className="space-y-2 text-gray-700 font-medium text-xs">
                <li className="flex items-start"><span className="text-purple-500 mr-2 mt-1">▶</span> Sudden demand spike may lead to stockouts</li>
                <li className="flex items-start"><span className="text-purple-500 mr-2 mt-1">▶</span> Need for fast execution and consistency</li>
                <li className="flex items-start"><span className="text-purple-500 mr-2 mt-1">▶</span> Balancing credit with growth ambition</li>
              </ul>
            </div>

            {/* Your Decision (Emerald) */}
            <div className="bg-emerald-50 rounded-xl border-2 border-emerald-200 p-6 flex flex-col">
              <h2 className="text-lg font-bold text-emerald-800 mb-4 border-b-2 border-emerald-200 pb-2 flex items-center">
                <span className="mr-2">💡</span> Your Decision
              </h2>
              <ul className="space-y-2 text-gray-700 font-medium text-xs">
                <li className="flex items-start"><span className="text-emerald-500 mr-2 mt-1">▶</span> How much inventory to push into the market</li>
                <li className="flex items-start"><span className="text-emerald-500 mr-2 mt-1">▶</span> How aggressively to convert retailers</li>
                <li className="flex items-start"><span className="text-emerald-500 mr-2 mt-1">▶</span> Whether to tighten or relax credit terms</li>
              </ul>
            </div>

          </div>

          {/* What’s at Stake (Orange - Full Width) */}
          <div className="bg-orange-50 rounded-xl border-2 border-orange-200 p-6 flex flex-col shadow-sm">
            <h2 className="text-lg font-bold text-orange-800 mb-4 border-b-2 border-orange-200 pb-2 flex items-center">
              <span className="mr-2">🎯</span> What’s at Stake
            </h2>
            <p className="text-gray-700 font-medium mb-3 text-sm">Your actions will impact:</p>
            <div className="flex flex-wrap gap-3">
              {["Market Share Gain", "Sales Volume Growth", "Cash Flow Health", "Distributor Profitability"].map(tag => (
                <span key={tag} className="bg-white px-3 py-1 rounded-full border border-orange-200 font-bold text-orange-700 shadow-sm text-xs">
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
          <span>Round: 5 of 7</span>
          <span>Market Condition: Competition Stock Out</span>
        </div>

      </div>
    </div>
  );
};

export default GameDistributionRound5Intro;
