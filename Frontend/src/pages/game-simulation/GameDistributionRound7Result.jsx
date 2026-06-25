import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveFinalResult } from './dbUtils';

const GameDistributionRound7Result = () => {
  const navigate = useNavigate();

  // --- Round 7 Inventory (combined Opening Stock + new R7 purchases) ---
  const [inventory] = useState(() => {
    const savedPurchases = localStorage.getItem("gameDistributionRound7Inventory");
    const savedOpening = localStorage.getItem("gameDistributionR7OpeningStock");
    const purchases = savedPurchases ? JSON.parse(savedPurchases) : null;
    const opening = savedOpening ? JSON.parse(savedOpening) : null;
    return {
      milk: { name: "Tedbury Milk Chocolate", qty: (opening?.milk?.qty || 0) + (purchases?.milk?.qty || 0) },
      dark: { name: "Tedbury Dark Chocolate", qty: (opening?.dark?.qty || 0) + (purchases?.dark?.qty || 0) },
      wafer: { name: "Tedbury Wafer Chocolate", qty: (opening?.wafer?.qty || 0) + (purchases?.wafer?.qty || 0) },
      gift: { name: "Tedbury Gift Packs", qty: (opening?.gift?.qty || 0) + (purchases?.gift?.qty || 0) }
    };
  });

  // Separate reads for Monthly Data table
  const openingStock = (() => {
    const saved = localStorage.getItem("gameDistributionR7OpeningStock");
    return saved ? JSON.parse(saved) : { milk: {qty:0}, dark: {qty:0}, wafer: {qty:0}, gift: {qty:0} };
  })();
  const purchasesOnly = (() => {
    const saved = localStorage.getItem("gameDistributionRound7Inventory");
    return saved ? JSON.parse(saved) : { milk: {qty:0}, dark: {qty:0}, wafer: {qty:0}, gift: {qty:0} };
  })();

  // --- Round 6 Data ---
  const r6NetPaymentReceived = parseInt(localStorage.getItem("gameDistributionR6NetPaymentReceived") || "0", 10);
  const r6TradeSchemeSpend = parseInt(localStorage.getItem("gameDistributionR6TradeSchemeSpend") || "0", 10);
  const currentCash = parseInt(localStorage.getItem("gameDistributionCash") || "5000000", 10);

  // --- Round 7 User Decisions ---
  const retailersToVisit = parseInt(localStorage.getItem("gameDistributionR7RetailersToVisit") || "250", 10);
  const earlyPaymentDiscount = parseFloat(localStorage.getItem("gameDistributionR7EarlyPaymentDiscount") || "0");
  const creditDays = parseInt(localStorage.getItem("gameDistributionR7CreditDays") || "0", 10);
  const orderFulfilment = parseInt(localStorage.getItem("gameDistributionR7OrderFulfilment") || "0", 10);
  const deliveryFrequency = parseInt(localStorage.getItem("gameDistributionR7DeliveryFrequency") || "7", 10);
  const schemePushIntensity = parseInt(localStorage.getItem("gameDistributionR7SchemePushIntensity") || "0", 10);
  const maxCreditLimit = parseInt(localStorage.getItem("gameDistributionR7MaxCreditLimit") || "0", 10);

  // --- Calculations (R7 Sales % from Spreadsheet) ---
  // Milk 60%, Dark 40%, Wafer 50%, Gift Packs 60%
  const milkTotalStock = inventory.milk.qty;
  const darkTotalStock = inventory.dark.qty;
  const waferTotalStock = inventory.wafer.qty;
  const giftTotalStock = inventory.gift.qty;

  const salesUnits = {
    milk: Math.round(0.60 * milkTotalStock),
    dark: Math.round(0.40 * darkTotalStock),
    wafer: Math.round(0.50 * waferTotalStock),
    gift: Math.round(0.60 * giftTotalStock)
  };

  const sellingPrices = { milk: 54, dark: 77, wafer: 32.4, gift: 216 };
  const costPrices = { milk: 40, dark: 62, wafer: 23.3, gift: 167 };

  const productRows = [
    { key: "milk", label: "Tedbury Milk Chocolate" },
    { key: "dark", label: "Tedbury Dark Chocolate" },
    { key: "wafer", label: "Tedbury Wafer Chocolate" },
    { key: "gift", label: "Tedbury Gift Packs" }
  ];

  const salesValues = productRows.map(p => {
    const units = salesUnits[p.key];
    const sellingPrice = sellingPrices[p.key];
    const value = units * sellingPrice;
    return { ...p, units, sellingPrice, value: Math.round(value) };
  });

  const totalSales = salesValues.reduce((sum, p) => sum + p.value, 0);

  // --- Monthly Data rows: Purchase (R7 buys) / Sale (% of OS+Purchase) / Closing ---
  const salesPercentagesR7 = { milk: 60, dark: 40, wafer: 50, gift: 60 };
  const monthlyDataRows = productRows.map(p => {
    const purchaseQty = purchasesOnly[p.key]?.qty || 0;
    const purchaseValue = parseInt(
      localStorage.getItem(`gameDistributionPurchaseAmount_r7_${p.key}`) || '0', 10
    );
    // If no purchase this round, fall back to last round's (R6) unit price
    const r6UnitPrice = parseInt(localStorage.getItem(`gameDistributionR6UnitPrice_${p.key}`) || '0', 10);
    const purchaseUnitPrice = purchaseQty > 0
      ? Math.round(purchaseValue / purchaseQty)
      : r6UnitPrice;

    const osQty = openingStock[p.key]?.qty || 0;
    const combinedQty = osQty + purchaseQty;
    const saleQty = Math.round((salesPercentagesR7[p.key] / 100) * combinedQty);
    const saleUnitPrice = sellingPrices[p.key];
    const saleValue = Math.round(saleQty * saleUnitPrice);

    const closingQty = osQty + purchaseQty - saleQty;
    const closingValue = Math.round(closingQty * purchaseUnitPrice);

    return { ...p, purchaseQty, purchaseUnitPrice, purchaseValue, saleQty, saleUnitPrice, saleValue, closingQty, closingValue };
  });

  const totalPurchaseQty   = monthlyDataRows.reduce((s, r) => s + r.purchaseQty, 0);
  const totalPurchaseValue = monthlyDataRows.reduce((s, r) => s + r.purchaseValue, 0);
  const totalSaleQty       = monthlyDataRows.reduce((s, r) => s + r.saleQty, 0);
  const totalSaleValue     = monthlyDataRows.reduce((s, r) => s + r.saleValue, 0);
  const totalClosingQty    = monthlyDataRows.reduce((s, r) => s + r.closingQty, 0);
  const totalClosingValue  = monthlyDataRows.reduce((s, r) => s + r.closingValue, 0);

  const distributorMarginPercent = 8;
  const marginPercent = distributorMarginPercent - earlyPaymentDiscount; // For UI display
  const grossMargin = totalSales - (totalSales / (1 + distributorMarginPercent / 100));
  const netMargin = grossMargin * (1 - earlyPaymentDiscount / 100);

  const retailerOutstanding = totalSales * (creditDays / 30);
  const netPaymentReceived = totalSales - retailerOutstanding;
  const openingCashBalance = currentCash;

  const quantityDiscount = parseFloat(localStorage.getItem("gameDistributionR7QuantityDiscount") || "0");
  const retailDisplay = parseFloat(localStorage.getItem("gameDistributionR7RetailDisplay") || "0");
  const totalSchemePercent = quantityDiscount + retailDisplay;
  const totalTradeSchemeSpend = totalSales * (totalSchemePercent / 100);

  const cashInHand = openingCashBalance + netPaymentReceived - totalTradeSchemeSpend;

  const newRetailerEffort = parseInt(localStorage.getItem("gameDistributionR7NewRetailerEffort") || "1", 10);
  const totalManpower = 6;
  const acquisitionMultiplier = newRetailerEffort === 0 ? 10 : newRetailerEffort === 1 ? 20 : 30;
  const newRetailerAcquisitionEffort = totalManpower * acquisitionMultiplier;
  const totalCoverage = totalManpower * retailersToVisit + newRetailerAcquisitionEffort;
  
  const manpowerCost = totalManpower * 20000;
  const deliveryWarehouseCost = 100000;
  const costToServePerOutlet = totalCoverage > 0 ? (manpowerCost + deliveryWarehouseCost) / totalCoverage : 0;
  
  // ROI Formula: (Net Gross Margin - Manpower - Delivery & Warehouse) / (20,00,000 + Net Inventory + Retailer Outstanding) * 100
  const roiDenominator = 2000000 + totalClosingValue + retailerOutstanding;
  const distributorROI = roiDenominator > 0
    ? ((netMargin - manpowerCost - deliveryWarehouseCost) / roiDenominator) * 100
    : 0;

  // Satisfaction Score
  const schemePushPoints = schemePushIntensity === 2 ? 3 : schemePushIntensity === 1 ? 2 : 1;
  const fulfillmentPoints = orderFulfilment >= 90 ? 3 : orderFulfilment >= 80 ? 2 : 1;
  const creditDaysPoints = creditDays > 30 ? 3 : creditDays >= 20 ? 2 : 1;
  const creditLimitPoints = maxCreditLimit > 30000 ? 3 : maxCreditLimit >= 10000 ? 2 : 1;
  const supplyDaysPoints = deliveryFrequency < 7 ? 3 : deliveryFrequency <= 10 ? 2 : 1;

  const satisfactionScore = (schemePushPoints * 0.3) + (fulfillmentPoints * 0.2) + (creditDaysPoints * 0.2) + (creditLimitPoints * 0.1) + (supplyDaysPoints * 0.2);

  const getRetailerSatisfaction = () => {
    if (satisfactionScore > 2.5) return "High";
    if (satisfactionScore >= 1.5) return "Medium";
    return "Low";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(amount);
  };

  useEffect(() => {
    localStorage.setItem("gameDistributionR7TotalSales", Math.round(totalSales).toString());
    localStorage.setItem("gameDistributionR7RetailerOutstanding", Math.round(retailerOutstanding).toString());
    localStorage.setItem("gameDistributionR7NetPaymentReceived", Math.round(netPaymentReceived).toString());
    localStorage.setItem("gameDistributionR7DistributorROI", distributorROI.toFixed(2));
    localStorage.setItem("gameDistributionR7RetailerSatisfaction", getRetailerSatisfaction());
  }, [totalSales, retailerOutstanding, netPaymentReceived, distributorROI]);

  const handleFinish = async () => {
    // Ensure we use a stable ID (userEmail is used for the testgame45 bypass)
    const userId = localStorage.getItem("userId") || localStorage.getItem("userEmail") || "Guest_" + Date.now();
    const userName = localStorage.getItem("userName") || "Guest User";

    const finalResults = {
      user_name: userName,
      distributor_roi: parseFloat(distributorROI.toFixed(2)),
      retailer_satisfaction: getRetailerSatisfaction(),
      cash_in_hand: Math.round(cashInHand)
    };

    // Assuming we use supabase directly here to bypass old dbUtils logic that checked user_id
    try {
      // Need to import supabase if not already imported, let's check
      // Actually we will call a custom insert directly to be safe.
      const { supabase } = await import('./supabaseClient');
      
      const { error } = await supabase
        .from('user_game_results')
        .insert([finalResults]);

      if (error) {
        console.error("Supabase Save Error:", error);
        alert("Game completed! Note: There was an issue saving results to the cloud database. Please check Supabase RLS policies.");
      } else {
        alert("Congratulations! Your game results have been saved successfully.");
      }
    } catch (err) {
      console.error("Supabase Save Error:", err);
      alert("Game completed! Note: Could not connect to the database.");
    }

    navigate("/game-simulation");
  };

  const handleBack = () => {
    navigate("/game-distribution/round7-supply-discipline");
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4 font-sans text-gray-800">
      <div className="w-full max-w-5xl bg-yellow-100 rounded-3xl shadow-2xl overflow-hidden border-8 border-yellow-200">
        <div className="bg-emerald-700 text-emerald-50 px-6 py-3 flex justify-between items-center text-sm font-bold tracking-widest uppercase border-b-4 border-emerald-800">
          <span>Game Simulation</span>
        </div>
        <div className="text-center pt-8 pb-4 border-b-4 border-yellow-200/50">
          <h1 className="text-4xl font-extrabold text-red-600 tracking-wider uppercase drop-shadow-sm px-4 italic underline decoration-yellow-400">
            Round 7 – Final Results
          </h1>
        </div>
        <div className="p-8 sm:p-10">

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 max-w-4xl mx-auto">
            {[
              { label: "Distributor Margin", value: `${distributorMarginPercent}%`, color: "text-emerald-700" },
              { label: "Trade Scheme", value: `${totalSchemePercent}%`, color: "text-blue-700" },
              { label: "Tesle Scheme", value: "7% Trade", color: "text-red-600" },
              { label: "Retailer Push", value: getRetailerSatisfaction(), color: "text-amber-600" }
            ].map(item => (
              <div key={item.label} className="bg-yellow-50 p-3 rounded-xl border border-yellow-200 text-center">
                <p className="text-sm text-gray-500 font-medium">{item.label}</p>
                <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Monthly Data Table */}
          <div className="mb-8 overflow-x-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center underline decoration-yellow-400">Monthly Data</h2>
            <div className="bg-yellow-50 rounded-2xl border-2 border-yellow-200 overflow-hidden">
              <table className="w-full text-sm text-center">
                <thead>
                  <tr className="bg-yellow-200 border-b-2 border-yellow-300">
                    <th className="px-3 py-2 text-gray-700 font-bold text-left" rowSpan={2}>Product</th>
                    <th className="px-3 py-2 text-blue-800 font-bold border-l-2 border-yellow-300" colSpan={3}>Purchase</th>
                    <th className="px-3 py-2 text-emerald-800 font-bold border-l-2 border-yellow-300" colSpan={3}>Sale</th>
                    <th className="px-3 py-2 text-red-800 font-bold border-l-2 border-yellow-300" colSpan={2}>Closing</th>
                  </tr>
                  <tr className="bg-yellow-100 border-b-2 border-yellow-300 text-xs">
                    <th className="px-3 py-2 text-blue-700 font-semibold border-l-2 border-yellow-300">Quantity</th>
                    <th className="px-3 py-2 text-blue-700 font-semibold">Unit Price</th>
                    <th className="px-3 py-2 text-blue-700 font-semibold">Value</th>
                    <th className="px-3 py-2 text-emerald-700 font-semibold border-l-2 border-yellow-300">Quantity</th>
                    <th className="px-3 py-2 text-emerald-700 font-semibold">Unit Price</th>
                    <th className="px-3 py-2 text-emerald-700 font-semibold">Value</th>
                    <th className="px-3 py-2 text-red-700 font-semibold border-l-2 border-yellow-300">Quantity</th>
                    <th className="px-3 py-2 text-red-700 font-semibold">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyDataRows.map(r => (
                    <tr key={r.key} className="border-b border-yellow-100 hover:bg-yellow-100/50">
                      <td className="px-3 py-2 font-medium text-gray-800 text-left">{r.label}</td>
                      <td className="px-3 py-2 text-blue-700 font-bold border-l-2 border-yellow-200">{r.purchaseQty.toLocaleString('en-IN')}</td>
                      <td className="px-3 py-2 text-blue-600">{r.purchaseUnitPrice > 0 ? formatCurrency(r.purchaseUnitPrice) : '—'}</td>
                      <td className="px-3 py-2 text-blue-700 font-bold">{formatCurrency(r.purchaseValue)}</td>
                      <td className="px-3 py-2 text-emerald-700 font-bold border-l-2 border-yellow-200">{r.saleQty.toLocaleString('en-IN')}</td>
                      <td className="px-3 py-2 text-emerald-600">{formatCurrency(r.saleUnitPrice)}</td>
                      <td className="px-3 py-2 text-emerald-700 font-bold">{formatCurrency(r.saleValue)}</td>
                      <td className="px-3 py-2 text-red-700 font-bold border-l-2 border-yellow-200">{r.closingQty.toLocaleString('en-IN')}</td>
                      <td className="px-3 py-2 text-red-700 font-bold">{formatCurrency(r.closingValue)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-yellow-200 border-t-2 border-yellow-400 font-extrabold text-gray-900">
                    <td className="px-3 py-2 text-left">Total</td>
                    <td className="px-3 py-2 text-blue-800 border-l-2 border-yellow-300">{totalPurchaseQty.toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2">—</td>
                    <td className="px-3 py-2 text-blue-800">{formatCurrency(totalPurchaseValue)}</td>
                    <td className="px-3 py-2 text-emerald-800 border-l-2 border-yellow-300">{totalSaleQty.toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2">—</td>
                    <td className="px-3 py-2 text-emerald-800">{formatCurrency(totalSaleValue)}</td>
                    <td className="px-3 py-2 text-red-800 border-l-2 border-yellow-300">{totalClosingQty.toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2 text-red-800">{formatCurrency(totalClosingValue)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center underline decoration-yellow-400">Financial Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {[
                { label: "Distributor Margin", value: `${distributorMarginPercent}%` },
                { label: "Distributor Rupee Gross Margin", value: formatCurrency(Math.round(grossMargin)) },
                { label: "Distributor Net Margin", value: formatCurrency(Math.round(netMargin)) },
                { label: "Retailer Outstanding", value: formatCurrency(Math.round(retailerOutstanding)) },
                { label: "Net Payment Received", value: formatCurrency(Math.round(netPaymentReceived)) },
                { label: "Total Trade Scheme Spend", value: formatCurrency(Math.round(totalTradeSchemeSpend)) },
              ].map(item => (
                <div key={item.label} className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200 flex justify-between items-center">
                  <span className="text-gray-700 font-medium">{item.label}</span>
                  <span className="text-emerald-700 font-extrabold text-lg">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Summary */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center underline decoration-yellow-400">Operational Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {[
                { label: "Total Manpower", value: `${totalManpower}` },
                { label: "New Outlets Opened", value: `${newRetailerAcquisitionEffort}` },
                { label: "Total Coverage", value: `${totalCoverage} Retailers` },
                { label: "Manpower Cost", value: formatCurrency(manpowerCost) },
                { label: "Delivery & Warehouse Cost", value: formatCurrency(deliveryWarehouseCost) },
                { label: "Cost to Serve Per Outlet", value: formatCurrency(Math.round(costToServePerOutlet)) },
              ].map(item => (
                <div key={item.label} className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200 flex justify-between items-center">
                  <span className="text-gray-700 font-medium">{item.label}</span>
                  <span className="text-emerald-700 font-extrabold text-lg">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-10 max-w-5xl mx-auto px-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
              {/* ROI Box */}
              <div className="bg-emerald-50 p-6 rounded-[2rem] border-[6px] border-emerald-500 text-center shadow-lg transition-all hover:scale-105 active:scale-95 ring-2 ring-emerald-100 ring-offset-2 flex flex-col justify-center">
                <p className="text-emerald-600 font-black text-sm mb-2 uppercase tracking-[0.2em] underline decoration-yellow-400 decoration-4">Distributor ROI</p>
                <p className="text-4xl lg:text-5xl font-black text-emerald-900 italic tracking-tighter drop-shadow-md">{distributorROI.toFixed(2)}%</p>
              </div>

              {/* Push Rating Box */}
              <div className="bg-amber-50 p-6 rounded-[2rem] border-[6px] border-amber-500 text-center shadow-lg transition-all hover:scale-105 active:scale-95 ring-2 ring-amber-100 ring-offset-2 flex flex-col justify-center">
                <p className="text-amber-600 font-black text-sm mb-2 uppercase tracking-[0.2em] underline decoration-yellow-400 decoration-4">Retailer Satisfaction</p>
                <p className={`text-4xl lg:text-5xl font-black italic tracking-tighter drop-shadow-md ${getRetailerSatisfaction() === 'High' ? 'text-emerald-700' : getRetailerSatisfaction() === 'Medium' ? 'text-amber-600' : 'text-red-600'}`}>
                  {getRetailerSatisfaction()}
                </p>
              </div>

              {/* Cash in Hand Box */}
              <div className="bg-blue-50 p-6 rounded-[2rem] border-[6px] border-blue-500 text-center shadow-lg transition-all hover:scale-105 active:scale-95 ring-2 ring-blue-100 ring-offset-2 flex flex-col justify-center">
                <p className="text-blue-600 font-black text-sm mb-2 uppercase tracking-[0.2em] underline decoration-yellow-400 decoration-4">Cash in hand</p>
                <p className="text-3xl lg:text-4xl font-black text-blue-900 italic tracking-tighter drop-shadow-md">{formatCurrency(cashInHand)}</p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex justify-center items-center max-w-2xl mx-auto px-4">
            <button onClick={handleFinish} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 px-16 rounded-2xl shadow-[0_8px_0_rgb(5,150,105)] text-3xl tracking-widest uppercase transform scale-110 hover:scale-115 transition-transform">[ Exit Game ]</button>
          </div>
        </div>
        <div className="bg-yellow-100 border-t-4 border-yellow-300 px-8 py-5 flex justify-center items-center text-lg font-bold text-gray-800 uppercase italic">
          <span>Simulation Complete - Business Year Closed</span>
        </div>
      </div>
    </div>
  );
};

export default GameDistributionRound7Result;
