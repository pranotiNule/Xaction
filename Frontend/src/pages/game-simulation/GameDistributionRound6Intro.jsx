import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GameDistributionRound6Intro = () => {
  const navigate = useNavigate();

  // --- Round 5 Data (from localStorage) ---
  const r5TotalSales = parseInt(localStorage.getItem("gameDistributionR5TotalSales") || "0", 10);
  const r5RetailerOutstanding = parseInt(localStorage.getItem("gameDistributionR5RetailerOutstanding") || "0", 10);
  const r5TradeSchemeSpend = parseInt(localStorage.getItem("gameDistributionR5TradeSchemeSpend") || "0", 10);
  const r5NetPaymentReceived = parseInt(localStorage.getItem("gameDistributionR5NetPaymentReceived") || "0", 10);

  // --- Round 6 Opening Inventory ---
  const [inventory] = useState(() => {
    const saved = localStorage.getItem("gameDistributionR6OpeningStock") || localStorage.getItem("gameDistributionRound6Inventory");
    if (saved) return JSON.parse(saved);
    return { milk: { qty: 0 }, dark: { qty: 0 }, wafer: { qty: 0 }, gift: { qty: 0 } };
  });
  
  const openingStock = inventory.milk.qty + inventory.dark.qty + inventory.wafer.qty + inventory.gift.qty;

  const r5ClosingCash = parseInt(localStorage.getItem("gameDistributionCash") || "5000000", 10);
  const isInitialized = localStorage.getItem("gameDistributionR6CashInitialized");
  const cashInHand = isInitialized ? r5ClosingCash : r5ClosingCash + r5NetPaymentReceived - r5TradeSchemeSpend;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(amount);
  };

  const handleNext = () => {
    // Reset Round 6 input screens to defaults
    [
      "gameDistributionR6QuantityDiscount",
      "gameDistributionR6RetailDisplay",
      "gameDistributionR6CreditDays",
      "gameDistributionR6MaxCreditLimit",
      "gameDistributionR6CreditEnforcement",
      "gameDistributionR6EarlyPaymentDiscount",
      "gameDistributionR6RetailersToVisit",
      "gameDistributionR6NewRetailerEffort",
      "gameDistributionR6SchemePushIntensity",
      "gameDistributionR6OrderFulfilment",
      "gameDistributionR6DeliveryFrequency",
      "gameDistributionR6PriorityAllocation",
      "gameDistributionR6StockBuffer",
    ].forEach(key => localStorage.removeItem(key));

    navigate('/game-distribution/round6-inventory'); 
  };

  const handleBack = () => {
    navigate('/game-distribution/round5-result');
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl bg-yellow-100 rounded-3xl shadow-2xl overflow-hidden border-8 border-yellow-200 my-8">
        
        <div className="bg-emerald-700 text-emerald-50 px-6 py-3 flex justify-between items-center text-sm font-bold tracking-widest uppercase border-b-4 border-emerald-800">
          <span>Game Simulation</span>
        </div>

        <div className="text-center pt-8 pb-4 border-b-4 border-yellow-200/50">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-red-600 tracking-wider uppercase drop-shadow-sm px-4">
            Round 6 – Competition Heavy Scheme
          </h1>
        </div>

        <div className="p-8 sm:p-12 space-y-8">

          {/* Carried Forward Block */}
          <div className="bg-white border-4 border-emerald-300 rounded-xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-emerald-200 pb-2 flex items-center">
               Carried Forward from Round 5
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { 
                  label: "Opening Stock (From Last Screen)", 
                  value: `Milk: ${inventory.milk.qty} | Dark: ${inventory.dark.qty} | Wafer: ${inventory.wafer.qty} | Gift: ${inventory.gift.qty}` 
                },
                { label: "Last Round Sale (R5)", value: formatCurrency(r5TotalSales) },
                { label: "Retailer Outstanding (R5)", value: formatCurrency(r5RetailerOutstanding) },
                { label: "Trade Scheme to be Reimbursed by the Company", value: formatCurrency(r5TradeSchemeSpend) },
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

          {/* Market Situation */}
          <div className="bg-white border-4 border-red-300 rounded-xl p-6 shadow-sm">
            <p className="text-gray-800 text-lg font-medium text-center">
              The competitive landscape has intensified. Tesle has returned strongly and is <span className="text-red-600 font-bold underline italic">aggressively pushing sales</span> through heavy trade schemes.
            </p>
            <p className="text-gray-800 text-lg font-medium text-center mt-2">
              Tedbury management has decided to <span className="font-bold text-red-600">hold current scheme levels at 5%</span>. No additional support is offered.
            </p>
          </div>

          {/* Grid Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-amber-50 rounded-xl border-2 border-amber-200 p-6 flex flex-col">
              <h2 className="text-lg font-bold text-amber-800 mb-4 border-b-2 border-amber-200 pb-2 flex items-center">
                <span className="mr-2">⚠️</span> Key Situation
              </h2>
              <ul className="space-y-2 text-gray-700 font-medium text-sm">
                <li className="flex items-start"><span className="text-red-500 mr-2 mt-1">▶</span> Tesle offering: 7% Trade + 3% Visibility</li>
                <li className="flex items-start"><span className="text-red-500 mr-2 mt-1">▶</span> Retailers getting higher margins from Tesle</li>
                <li className="flex items-start"><span className="text-red-500 mr-2 mt-1">▶</span> Tedbury secondary sales being impacted</li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-6 flex flex-col">
              <h2 className="text-lg font-bold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2 flex items-center">
                <span className="mr-2">🌍</span> Market Reality
              </h2>
              <ul className="space-y-2 text-gray-700 font-medium text-sm">
                <li className="flex items-start"><span className="text-blue-500 mr-2 mt-1">▶</span> Retailers are highly scheme-driven short term</li>
                <li className="flex items-start"><span className="text-blue-500 mr-2 mt-1">▶</span> Shelf space may shift toward Tesle</li>
                <li className="flex items-start"><span className="text-blue-500 mr-2 mt-1">▶</span> Risk of losing visibility without action</li>
              </ul>
            </div>

            <div className="bg-purple-50 rounded-xl border-2 border-purple-200 p-6 flex flex-col">
              <h2 className="text-lg font-bold text-purple-800 mb-4 border-b-2 border-purple-200 pb-2 flex items-center">
                <span className="mr-2">🤔</span> Your Dilemma
              </h2>
              <p className="text-gray-700 font-medium text-xs mb-2">As Area Manager, you can:</p>
              <ul className="space-y-2 text-gray-700 font-medium text-xs">
                <li className="flex items-start"><span className="text-purple-500 mr-2 mt-1">▶</span> Maintain current schemes and protect margins</li>
                <li className="flex items-start font-bold"><span className="text-purple-500 mr-2 mt-1">▶</span> OR increase schemes from your own margin</li>
              </ul>
            </div>

            <div className="bg-emerald-50 rounded-xl border-2 border-emerald-200 p-6 flex flex-col">
              <h2 className="text-lg font-bold text-emerald-800 mb-4 border-b-2 border-emerald-200 pb-2 flex items-center">
                <span className="mr-2">⚖️</span> Trade-Off
              </h2>
              <ul className="space-y-2 text-gray-700 font-medium text-[10px]">
                <li className="flex items-start"><span className="text-emerald-500 mr-2 mt-1">▶</span> <strong>Higher Scheme:</strong> Improves push, protects share, but reduces profitability</li>
                <li className="flex items-start"><span className="text-emerald-500 mr-2 mt-1">▶</span> <strong>Lower Scheme:</strong> Protects margin, but risks loss of sales</li>
              </ul>
            </div>

            <div className="bg-amber-50 rounded-xl border-2 border-amber-200 p-6 flex flex-col md:col-span-2">
              <h2 className="text-lg font-bold text-amber-800 mb-4 border-b-2 border-amber-200 pb-2 flex items-center">
                <span className="mr-2">💡</span> Your Decision
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 font-medium text-sm">
                <li className="flex items-start"><span className="text-red-500 mr-2 mt-1">▶</span> Whether to match or counter Tesle’s scheme</li>
                <li className="flex items-start font-bold"><span className="text-red-500 mr-2 mt-1">▶</span> How much additional scheme to fund from margin</li>
                <li className="flex items-start"><span className="text-red-500 mr-2 mt-1">▶</span> Which products/retailers to prioritize</li>
              </ul>
            </div>

          </div>

          <div className="bg-orange-50 rounded-xl border-2 border-orange-200 p-6 flex flex-col shadow-sm">
            <h2 className="text-lg font-bold text-orange-800 mb-4 border-b-2 border-orange-200 pb-2 flex items-center">
              <span className="mr-2">🎯</span> What’s at Stake
            </h2>
            <div className="flex flex-wrap gap-3">
              {["Market Share Retention", "Retailer Loyalty", "Profitability", "Brand Visibility"].map(tag => (
                <span key={tag} className="bg-white px-3 py-1 rounded-full border border-orange-200 font-bold text-orange-700 shadow-sm text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-12 flex justify-between items-center max-w-2xl mx-auto px-4">
            <button onClick={handleBack} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-10 rounded-xl shadow-[0_4px_0_rgb(75,85,99)] hover:shadow-[0_2px_0_rgb(75,85,99)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all text-xl">[ Back ]</button>
            <button onClick={handleNext} className="bg-green-500 hover:bg-green-600 text-white font-extrabold py-4 px-16 rounded-xl shadow-[0_6px_0_rgb(21,128,61)] hover:shadow-[0_3px_0_rgb(21,128,61)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all text-2xl transform scale-105">[ Next ]</button>
          </div>

        </div>

        <div className="bg-yellow-100 border-t-2 border-yellow-300 px-8 py-4 flex justify-between items-center text-lg font-bold text-gray-800">
          <span>Round: 6 of 7</span>
          <span>Market Condition: Competition Heavy Scheme</span>
        </div>

      </div>
    </div>
  );
};

export default GameDistributionRound6Intro;
