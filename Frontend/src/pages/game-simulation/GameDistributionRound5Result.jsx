import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GameDistributionRound5Result = () => {
  const navigate = useNavigate();

  // --- Round 5 Inventory (combined Opening Stock + new R5 purchases) ---
  const [inventory] = useState(() => {
    const savedPurchases = localStorage.getItem("gameDistributionRound5Inventory");
    const savedOpening = localStorage.getItem("gameDistributionR5OpeningStock");
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
    const saved = localStorage.getItem("gameDistributionR5OpeningStock");
    return saved ? JSON.parse(saved) : { milk: {qty:0}, dark: {qty:0}, wafer: {qty:0}, gift: {qty:0} };
  })();
  const purchasesOnly = (() => {
    const saved = localStorage.getItem("gameDistributionRound5Inventory");
    return saved ? JSON.parse(saved) : { milk: {qty:0}, dark: {qty:0}, wafer: {qty:0}, gift: {qty:0} };
  })();

  // --- Round 4 Data (for Cash flow) ---
  const r4NetPaymentReceived = parseInt(localStorage.getItem("gameDistributionR4NetPaymentReceived") || "0", 10);
  const r4TradeSchemeSpend = parseInt(localStorage.getItem("gameDistributionR4TradeSchemeSpend") || "0", 10);
  const currentCash = parseInt(localStorage.getItem("gameDistributionCash") || "5000000", 10);

  // --- Round 5 User Decisions ---
  const retailersToVisit = parseInt(localStorage.getItem("gameDistributionR5RetailersToVisit") || "250", 10);
  const earlyPaymentDiscount = parseFloat(localStorage.getItem("gameDistributionR5EarlyPaymentDiscount") || "0");
  const creditDays = parseInt(localStorage.getItem("gameDistributionR5CreditDays") || "0", 10);
  const orderFulfilment = parseInt(localStorage.getItem("gameDistributionR5OrderFulfilment") || "0", 10);
  const deliveryFrequency = parseInt(localStorage.getItem("gameDistributionR5DeliveryFrequency") || "7", 10);
  const schemePushIntensity = parseInt(localStorage.getItem("gameDistributionR5SchemePushIntensity") || "0", 10);
  const maxCreditLimit = parseInt(localStorage.getItem("gameDistributionR5MaxCreditLimit") || "0", 10);
  const newRetailerEffort = parseInt(localStorage.getItem("gameDistributionR5NewRetailerEffort") || "2", 10);
  const creditEnforcement = parseInt(localStorage.getItem("gameDistributionR5CreditEnforcement") || "1", 10);

  // --- Calculations (High demand in R5) ---
  const milkTotalStock = inventory.milk.qty;
  const darkTotalStock = inventory.dark.qty;
  const waferTotalStock = inventory.wafer.qty;
  const giftTotalStock = inventory.gift.qty;

  // Sales Quantity formula (per Round 5 sheet): % × (Opening Stock + Purchase)
  // Milk: 100%, Dark: 90%, Wafer: 90%, Gift Packs: 80%
  const salesUnits = {
    milk: Math.round(1.00 * milkTotalStock),
    dark: Math.round(0.90 * darkTotalStock),
    wafer: Math.round(0.90 * waferTotalStock),
    gift: Math.round(0.80 * giftTotalStock)
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

  // --- Monthly Data rows: Purchase (R5 buys) / Sale (% of OS+Purchase) / Closing ---
  const salesPercentagesR5 = { milk: 100, dark: 90, wafer: 90, gift: 80 };
  const monthlyDataRows = productRows.map(p => {
    const purchaseQty = purchasesOnly[p.key]?.qty || 0;
    const purchaseValue = parseInt(
      localStorage.getItem(`gameDistributionPurchaseAmount_r5_${p.key}`) || '0', 10
    );
    // If no purchase this round, fall back to last round's (R4) unit price
    const r4UnitPrice = parseInt(localStorage.getItem(`gameDistributionR4UnitPrice_${p.key}`) || '0', 10);
    const purchaseUnitPrice = purchaseQty > 0
      ? Math.round(purchaseValue / purchaseQty)
      : r4UnitPrice;

    const osQty = openingStock[p.key]?.qty || 0;
    const combinedQty = osQty + purchaseQty;
    const saleQty = Math.round((salesPercentagesR5[p.key] / 100) * combinedQty);
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

  const quantityDiscount = parseFloat(localStorage.getItem("gameDistributionR5QuantityDiscount") || "0");
  const retailDisplay = parseFloat(localStorage.getItem("gameDistributionR5RetailDisplay") || "0");
  const totalSchemePercent = quantityDiscount + retailDisplay;
  const totalTradeSchemeSpend = totalSales * (totalSchemePercent / 100);

  // --- Financial Summary (per image formula) ---
  // Distributor Gross Margin = Total Sales - (Total Sales / (1 + Distributor Margin%))
  const distributorMarginPercent = 8;
  const grossMargin = totalSales - (totalSales / (1 + distributorMarginPercent / 100));

  // Distributor Net Margin = Distributor Gross Margin × (1 - Early Payment Discount)
  const netMargin = grossMargin * (1 - earlyPaymentDiscount / 100);

  // Retailer Outstanding = Total Sales × (Credit Days / 30)
  const retailerOutstanding = totalSales * (creditDays / 30);

  // Net Cash Received = Total Sales - Retailer Outstanding
  const netPaymentReceived = totalSales - retailerOutstanding;

  // Cash in Hand = Opening Cash Balance + Payment Received – Trade Scheme
  const cashInHand = currentCash + netPaymentReceived - totalTradeSchemeSpend;

  // --- Operational Summary (per image formula) ---
  // Total Manpower = 6 (given by Admin)
  const totalManpower = 6;

  // New Retailer Acquisition Effort = Total Manpower × (Low=10, Medium=20, High=30)
  const acquisitionMultiplier = newRetailerEffort === 0 ? 10 : newRetailerEffort === 1 ? 20 : 30;
  const newRetailerAcquisitionEffort = totalManpower * acquisitionMultiplier;

  // New Outlets Opened (same scale as acquisition effort)
  const newOutletsOpened = newRetailerEffort === 0 ? 2 : newRetailerEffort === 1 ? 5 : 10;

  // Total Coverage = Total Manpower × Retailer Visit + New Outlets Opened
  const totalCoverage = totalManpower * retailersToVisit + newRetailerAcquisitionEffort;

  // Manpower Cost = 20,000 × Total Manpower
  const manpowerCost = totalManpower * 20000;

  // Delivery & Warehouse Cost = 100,000 (given by Admin)
  const deliveryWarehouseCost = 100000;

  // Cost to Serve Per Outlet = (Manpower Cost + Delivery & Warehouse Cost) / Total Coverage
  const costToServePerOutlet = totalCoverage > 0
    ? (manpowerCost + deliveryWarehouseCost) / totalCoverage
    : 0;

  // Distributor ROI = (Net Margin - Manpower Cost - D&W Cost) / (20,00,000 + Closing Stock + Outstanding) × 100
  const roiDenominator = 2000000 + totalClosingValue + retailerOutstanding;
  const distributorROI = roiDenominator > 0
    ? ((netMargin - manpowerCost - deliveryWarehouseCost) / roiDenominator) * 100
    : 0;

  // --- Retailer Satisfaction (weighted scoring per image formula) ---
  const paymentEnforcementPoint = creditEnforcement === 0 ? 3 : creditEnforcement === 1 ? 2 : 1;
  const paymentEnforcementScore = paymentEnforcementPoint * 0.2;

  const schemePushPoint = schemePushIntensity === 0 ? 3 : schemePushIntensity === 1 ? 2 : 1;
  const schemePushScore = schemePushPoint * 0.3;

  const orderFulfilmentPoint = orderFulfilment > 90 ? 3 : orderFulfilment >= 85 ? 2 : 1;
  const orderFulfilmentScore = orderFulfilmentPoint * 0.3;

  const deliveryFrequencyPoint = deliveryFrequency < 7 ? 3 : deliveryFrequency <= 10 ? 2 : 1;
  const deliveryFrequencyScore = deliveryFrequencyPoint * 0.2;

  const satisfactionScore = paymentEnforcementScore + schemePushScore + orderFulfilmentScore + deliveryFrequencyScore;

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

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  useEffect(() => {
    localStorage.setItem("gameDistributionR5TotalSales", Math.round(totalSales).toString());
    localStorage.setItem("gameDistributionR5RetailerOutstanding", Math.round(retailerOutstanding).toString());
    localStorage.setItem("gameDistributionR5TradeSchemeSpend", Math.round(totalTradeSchemeSpend).toString());
    localStorage.setItem("gameDistributionR5NetPaymentReceived", Math.round(netPaymentReceived).toString());
    localStorage.setItem("gameDistributionR5DistributorROI", distributorROI.toFixed(2));
    localStorage.setItem("gameDistributionR5RetailerSatisfaction", getRetailerSatisfaction());
    localStorage.setItem("gameDistributionR5CashInHand", Math.round(cashInHand).toString());
    
    // Save per-product effective unit prices so Round 6 can use as fallback
    monthlyDataRows.forEach(r => {
      if (r.purchaseUnitPrice > 0) {
        localStorage.setItem(`gameDistributionR5UnitPrice_${r.key}`, r.purchaseUnitPrice.toString());
      }
    });
  }, [totalSales, retailerOutstanding, totalTradeSchemeSpend, netPaymentReceived, distributorROI, cashInHand]);

  const handleProceed = () => {
    // Calculate ending inventory after sales (Carry Forward: Opening Stock + Purchase - Sales)
    const carryForwardInventory = {
      milk: { ...inventory.milk, qty: milkTotalStock - salesUnits.milk },
      dark: { ...inventory.dark, qty: darkTotalStock - salesUnits.dark },
      wafer: { ...inventory.wafer, qty: waferTotalStock - salesUnits.wafer },
      gift: { ...inventory.gift, qty: giftTotalStock - salesUnits.gift }
    };
    const emptyInventory = {
      milk: { ...inventory.milk, qty: 0 },
      dark: { ...inventory.dark, qty: 0 },
      wafer: { ...inventory.wafer, qty: 0 },
      gift: { ...inventory.gift, qty: 0 }
    };

    // Calculate closing cash: Purchase Remainder ONLY (as requested)
    const closingCash = currentCash;

    localStorage.setItem("gameDistributionCash", Math.round(closingCash).toString());
    localStorage.setItem("gameDistributionR6OpeningStock", JSON.stringify(carryForwardInventory));
    localStorage.setItem("gameDistributionRound6Inventory", JSON.stringify(emptyInventory));
    localStorage.setItem("gameDistributionCurrentRound", "6");
    navigate("/game-distribution/round6-intro");
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-5xl bg-yellow-100 rounded-3xl shadow-2xl overflow-hidden border-8 border-yellow-200">
        <div className="bg-emerald-700 text-emerald-50 px-6 py-3 flex justify-between items-center text-sm font-bold tracking-widest uppercase border-b-4 border-emerald-800">
          <span>Game Simulation</span>
        </div>
        <div className="text-center pt-8 pb-4 border-b-4 border-yellow-200/50">
          <h1 className="text-4xl font-extrabold text-red-600 tracking-wider uppercase drop-shadow-sm px-4">
            Round 5 – Competition Stock Out Results
          </h1>
        </div>
        <div className="p-8 sm:p-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10 max-w-3xl mx-auto">
            {[
              { label: "Tedbury Share", value: "Significant Gain", color: "text-emerald-700" },
              { label: "Tesle Situation", value: "No Supply", color: "text-red-600" },
              { label: "Retailer Demand", value: "Maximum", color: "text-blue-700" },
              { label: "Negotiation Power", value: "High", color: "text-amber-600" },
              { label: "Shelf Space", value: "Captured", color: "text-emerald-600" },
              { label: "Market State", value: "Dominant", color: "text-emerald-700" }
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
                      <td className="px-3 py-2 text-emerald-600">{formatPrice(r.saleUnitPrice)}</td>
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

          <div className="mb-8 max-w-3xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-emerald-50 p-6 rounded-2xl border-2 border-emerald-300 text-center shadow-sm">
                <p className="text-gray-600 font-medium text-sm mb-1">Distributor ROI</p>
                <p className="text-5xl font-extrabold text-emerald-700">{distributorROI.toFixed(2)}%</p>
              </div>
              <div className="bg-amber-50 p-6 rounded-2xl border-2 border-amber-300 text-center shadow-sm">
                <p className="text-gray-600 font-medium text-sm mb-1">Retailer Satisfaction</p>
                <p className={`text-5xl font-extrabold ${getRetailerSatisfaction() === 'High' ? 'text-emerald-700' : getRetailerSatisfaction() === 'Medium' ? 'text-amber-600' : 'text-red-600'}`}>
                  {getRetailerSatisfaction()}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-center items-center max-w-2xl mx-auto px-4">
            <button onClick={handleProceed} className="bg-green-500 hover:bg-green-600 text-white font-extrabold py-4 px-12 rounded-xl shadow-[0_6px_0_rgb(21,128,61)] hover:shadow-[0_3px_0_rgb(21,128,61)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all text-2xl transform scale-110 tracking-widest">[ Proceed to Round 6 ]</button>
          </div>
        </div>
        <div className="bg-yellow-100 border-t-4 border-yellow-300 px-8 py-5 flex justify-center items-center text-lg font-bold text-gray-800">
          <span>Round: <span className="text-emerald-700">5</span> of 7</span>
        </div>
      </div>
    </div>
  );
};

export default GameDistributionRound5Result;
