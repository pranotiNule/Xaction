import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GameDistributionRound2Intro = () => {
  const navigate = useNavigate();

  // --- Round 1 Data (from localStorage, saved at end of Round 1) ---
  const r1TotalSales = parseInt(localStorage.getItem("gameDistributionR1TotalSales") || "0", 10);
  const r1RetailerOutstanding = parseInt(localStorage.getItem("gameDistributionR1RetailerOutstanding") || "0", 10);
  const r1TradeSchemeSpend = parseInt(localStorage.getItem("gameDistributionR1TradeSchemeSpend") || "0", 10);
  const r1NetPaymentReceived = parseInt(localStorage.getItem("gameDistributionR1NetPaymentReceived") || "0", 10);

  // --- Round 2 Opening Inventory ---
  const [inventory] = useState(() => {
    const saved = localStorage.getItem("gameDistributionR2OpeningStock") || localStorage.getItem("gameDistributionRound2Inventory");
    if (saved) return JSON.parse(saved);
    return {
      milk: { qty: 0 }, dark: { qty: 0 }, wafer: { qty: 0 }, gift: { qty: 0 }
    };
  });

  const openingStock = inventory.milk.qty + inventory.dark.qty + inventory.wafer.qty + inventory.gift.qty;

  // Opening Cash Balance
  const r1ClosingCash = parseInt(localStorage.getItem("gameDistributionCash") || "5000000", 10);

  // Cash in Hand = Opening Cash Balance + Payment Received (from R1) – Trade Scheme (from R1)
  const cashInHand = r1ClosingCash + r1NetPaymentReceived - r1TradeSchemeSpend;

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

    // Reset Round 2 input screens to defaults
    [
      "gameDistributionQuantityDiscount",
      "gameDistributionRetailDisplay",
      "gameDistributionCreditDays",
      "gameDistributionMaxCreditLimit",
      "gameDistributionEarlyPaymentDiscount",
      "gameDistributionEnforcementLevel",
      "gameDistributionRetailersToVisit",
      "gameDistributionNewRetailerEffort",
      "gameDistributionSchemePushIntensity",
      "gameDistributionOrderFulfilment",
      "gameDistributionDeliveryFrequency",
      "gameDistributionPriorityAllocation",
      "gameDistributionStockBuffer",
    ].forEach(key => localStorage.removeItem(key));

    navigate('/game-distribution/round2-inventory');
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
            Round 2 – Market Disruption: Rainfall Impact
          </h1>
        </div>

        {/* Content Area */}
        <div className="p-8 sm:p-12 space-y-8">

          {/* Carried Forward from Round 1 */}
          <div className="bg-white border-4 border-emerald-300 rounded-xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-emerald-200 pb-2 flex items-center">
              <span className="text-emerald-600 mr-2">📋</span> Carried Forward from Round 1
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  label: "Opening Stock (R2 Inventory)",
                  value: `Milk: ${inventory.milk.qty} | Dark: ${inventory.dark.qty} | Wafer: ${inventory.wafer.qty} | Gift: ${inventory.gift.qty}`
                },
                { label: "Last Round Sale (R1)", value: formatCurrency(r1TotalSales) },
                { label: "Retailer Outstanding (R1)", value: formatCurrency(r1RetailerOutstanding) },
                { label: "Trade Scheme to be Reimbursed by the Company", value: formatCurrency(r1TradeSchemeSpend) },
                { label: "Cash in Hand", value: formatCurrency(cashInHand) },
              ].map((item, idx) => (
                <div key={idx} className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 flex flex-col justify-center">
                  <span className="text-lg text-gray-500 font-bold tracking-wider mb-1">{item.label}</span>
                  <span className="text-xl font-black text-emerald-800">{item.value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4 italic font-medium">
              * Cash in Hand = Opening Cash Balance + Payment Received (from R1) – Trade Scheme (from R1)
            </p>
          </div>

          {/* Main Context */}
          <div className="bg-white border-4 border-blue-300 rounded-xl p-6 shadow-sm">
            <p className="text-gray-800 text-lg font-medium leading-relaxed">
              Heavy rainfall across the city has slowed down consumer movement, leading to lower sales at retail outlets. As a result, top retailers in your territory are facing cash flow pressure.
            </p>
            <p className="text-gray-800 text-lg font-medium leading-relaxed mt-4">
              To manage their situation, these retailers have increased their payment cycle, and average credit days have now extended to <span className="font-bold text-red-600">30 days</span>.
            </p>
            <p className="text-gray-800 text-lg font-medium leading-relaxed mt-4">
              However, retailers are willing to release payments earlier if you provide a <span className="font-bold text-emerald-700">cash discount incentive</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Key Situation */}
            <div className="bg-amber-50 rounded-xl border-2 border-amber-200 p-6 flex flex-col">
              <h2 className="text-xl font-bold text-amber-800 mb-4 border-b-2 border-amber-200 pb-2">Key Situation</h2>
              <ul className="space-y-3 text-gray-700 font-medium">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 mt-1">▶</span>
                  <span><strong>Retailer Credit Days:</strong> 30 Days</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 mt-1">▶</span>
                  <span><strong>Retail Sales:</strong> Declining due to heavy rainfall</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 mt-1">▶</span>
                  <span><strong>Retailer Liquidity:</strong> Tight</span>
                </li>
              </ul>
            </div>

            {/* Opportunity */}
            <div className="bg-emerald-50 rounded-xl border-2 border-emerald-200 p-6 flex flex-col">
              <h2 className="text-xl font-bold text-emerald-800 mb-4 border-b-2 border-emerald-200 pb-2">Opportunity</h2>
              <p className="text-gray-700 font-medium mb-3">Retailers are open to early payment if incentivized:</p>
              <div className="bg-white p-3 rounded-lg border border-emerald-100 flex items-center justify-center">
                <p className="text-center font-bold text-gray-800">
                  Total 1% Cash Discount offered,<br />
                  <span className="text-emerald-700">→ Credit Days reduce by 5 days</span>
                </p>
              </div>
            </div>

            {/* Trade-Off */}
            <div className="bg-red-50 rounded-xl border-2 border-red-200 p-6 flex flex-col">
              <h2 className="text-xl font-bold text-red-800 mb-4 border-b-2 border-red-200 pb-2">Trade-Off</h2>
              <p className="text-gray-700 font-medium mb-3">While offering a cash discount can improve your cash flow, it will:</p>
              <ul className="space-y-2 text-gray-700 font-medium">
                <li className="flex items-center">
                  <span className="text-red-500 mr-2">−</span>
                  <span>Reduce your distributor margin</span>
                </li>
                <li className="flex items-center">
                  <span className="text-red-500 mr-2">−</span>
                  <span>Impact your overall profitability</span>
                </li>
              </ul>
            </div>

            {/* Your Decision */}
            <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-6 flex flex-col">
              <h2 className="text-xl font-bold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2">Your Decision</h2>
              <p className="text-gray-700 font-medium mb-3">You must decide:</p>
              <ul className="space-y-2 text-gray-700 font-medium">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-1">✔</span>
                  <span>How much cash discount to offer</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-1">✔</span>
                  <span>Whether to prioritize cash flow or protect margins</span>
                </li>
              </ul>
            </div>

          </div>

          {/* What's at Stake */}
          <div className="bg-purple-50 rounded-xl border-2 border-purple-200 p-6 flex flex-col mt-6">
            <h2 className="text-xl font-bold text-purple-800 mb-4 border-b-2 border-purple-200 pb-2">What's at Stake</h2>
            <p className="text-gray-700 font-medium mb-3">Your decision will directly impact:</p>
            <div className="flex flex-wrap gap-4">
              <span className="bg-white px-4 py-2 rounded-full border border-purple-200 font-bold text-purple-700 shadow-sm">💰 Cash Flow Health</span>
              <span className="bg-white px-4 py-2 rounded-full border border-purple-200 font-bold text-purple-700 shadow-sm">📈 Distributor Profitability</span>
              <span className="bg-white px-4 py-2 rounded-full border border-purple-200 font-bold text-purple-700 shadow-sm">🤝 Retailer Relationship Strength</span>
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
            <span>Round: 2 of 7</span>
          </div>
          <div className="flex flex-col text-right">
            <span>Market Temperature: Disrupted</span>
            <span>Market Condition: Slow/Rainfall</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GameDistributionRound2Intro;
