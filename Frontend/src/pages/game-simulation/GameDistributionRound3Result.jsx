import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GameDistributionRound3Result = () => {
  const navigate = useNavigate();

  // --- Round 3 Inventory (combined Opening Stock + new R3 purchases for financial calculations) ---
  const [inventory] = useState(() => {
    const savedPurchases = localStorage.getItem("gameDistributionRound3Inventory");
    const savedOpening = localStorage.getItem("gameDistributionR3OpeningStock");
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
    const saved = localStorage.getItem("gameDistributionR3OpeningStock");
    return saved ? JSON.parse(saved) : { milk: { qty: 0 }, dark: { qty: 0 }, wafer: { qty: 0 }, gift: { qty: 0 } };
  })();
  const purchasesOnly = (() => {
    const saved = localStorage.getItem("gameDistributionRound3Inventory");
    return saved ? JSON.parse(saved) : { milk: { qty: 0 }, dark: { qty: 0 }, wafer: { qty: 0 }, gift: { qty: 0 } };
  })();

  // --- Round 2 Data (from localStorage, saved at end of Round 2) ---
  const r2TotalSales = parseInt(localStorage.getItem("gameDistributionR2TotalSales") || "0", 10);
  const r2RetailerOutstanding = parseInt(localStorage.getItem("gameDistributionR2RetailerOutstanding") || "0", 10);
  const r2TradeSchemeSpend = parseInt(localStorage.getItem("gameDistributionR2TradeSchemeSpend") || "0", 10);
  const r2NetPaymentReceived = parseInt(localStorage.getItem("gameDistributionR2NetPaymentReceived") || "0", 10);

  // --- Trade Scheme (from Round 3 Trade Scheme screen) ---
  const quantityDiscount = parseFloat(localStorage.getItem("gameDistributionR3QuantityDiscount") || "0");
  const retailDisplay = parseFloat(localStorage.getItem("gameDistributionR3RetailDisplay") || "0");
  const totalSchemePercent = quantityDiscount + retailDisplay;

  // --- Credit Control (from Round 3 Credit Control screen) ---
  const creditDays = parseInt(localStorage.getItem("gameDistributionR3CreditDays") || "0", 10);
  const maxCreditLimit = parseInt(localStorage.getItem("gameDistributionR3MaxCreditLimit") || "0", 10);
  const earlyPaymentDiscount = parseFloat(localStorage.getItem("gameDistributionR3EarlyPaymentDiscount") || "0");
  const enforcementLevel = parseInt(localStorage.getItem("gameDistributionR3EnforcementLevel") || "0", 10);

  // --- Sales Team (from Round 3 Sales Team screen) ---
  const retailersToVisit = parseInt(localStorage.getItem("gameDistributionR3RetailersToVisit") || "0", 10);
  const newRetailerEffort = parseInt(localStorage.getItem("gameDistributionR3NewRetailerEffort") || "0", 10);
  const schemePushIntensity = parseInt(localStorage.getItem("gameDistributionR3SchemePushIntensity") || "0", 10);

  // --- Supply Discipline (from Round 3 Supply Discipline screen) ---
  const orderFulfilment = parseInt(localStorage.getItem("gameDistributionR3OrderFulfilment") || "0", 10);

  // --- Round 3 Market Data (expansion scenario) ---
  // Increase in demand due to 1000 new outlets × 20 units Milk Chocolate minimum
  const monthlySales = {
    milk: { sellingPrice: 54 },
    dark: { sellingPrice: 77 },
    wafer: { sellingPrice: 32.4 },
    gift: { sellingPrice: 216 }
  };

  const salesPercentages = {
    milk: 100,
    dark: 20,
    wafer: 40,
    gift: 35
  };

  const costPrices = { milk: 100, dark: 150, wafer: 80, gift: 500 };

  // Distributor Margin = 8% (standard)
  const distributorMarginPercent = 8;

  // Total Manpower (given by admin)
  const totalManpower = 6;
  const deliveryWarehouseCost = 100000;

  // --- Calculations ---
  const productRows = [
    { key: "milk", label: "Tedbury Milk Chocolate" },
    { key: "dark", label: "Tedbury Dark Chocolate" },
    { key: "wafer", label: "Tedbury Wafer Chocolate" },
    { key: "gift", label: "Tedbury Gift Packs" }
  ];

  // Monthly Sales Table
  const salesValues = productRows.map(p => {
    const sellingPrice = monthlySales[p.key].sellingPrice;
    const invQty = inventory[p.key].qty;

    const units = Math.round((salesPercentages[p.key] / 100) * invQty);
    const value = units * sellingPrice;

    return {
      ...p,
      units,
      sellingPrice,
      value: Math.round(value)
    };
  });

  const monthlySalesTableTotal = salesValues.reduce((sum, p) => sum + p.value, 0);

  // Total Sales (gross)
  const totalSales = monthlySalesTableTotal;

  // --- Monthly Data rows: Purchase (R3 buys) / Sale (% of OS+Purchase) / Closing ---
  const monthlyDataRows = productRows.map(p => {
    // Purchase: new R3 buys only (not opening stock)
    const purchaseQty = purchasesOnly[p.key]?.qty || 0;
    // Value = actual amount paid in R3 (from round-specific localStorage key)
    const purchaseValue = parseInt(
      localStorage.getItem(`gameDistributionPurchaseAmount_r3_${p.key}`) || '0', 10
    );
    // Unit Price = Value / Quantity (derived)
    // If no purchase this round, fall back to last round's (R2) unit price
    const r2UnitPrice = parseInt(localStorage.getItem(`gameDistributionR2UnitPrice_${p.key}`) || '0', 10);
    const purchaseUnitPrice = purchaseQty > 0
      ? Math.round(purchaseValue / purchaseQty)
      : r2UnitPrice;

    // Sale: salesPercent% × (Opening Stock + Purchase) — Image 2 formula
    const osQty = openingStock[p.key]?.qty || 0;
    const combinedQty = osQty + purchaseQty;
    const saleQty = Math.round((salesPercentages[p.key] / 100) * combinedQty);
    const saleUnitPrice = monthlySales[p.key].sellingPrice;
    const saleValue = Math.round(saleQty * saleUnitPrice);

    // Closing: Opening Stock (carried from R2) + Purchase - Sale
    const closingQty = osQty + purchaseQty - saleQty;
    // Closing Value = Closing Qty × Purchase Unit Price
    const closingValue = Math.round(closingQty * purchaseUnitPrice);

    return {
      ...p,
      purchaseQty, purchaseUnitPrice, purchaseValue,
      saleQty, saleUnitPrice, saleValue,
      closingQty, closingValue
    };
  });

  const totalPurchaseQty = monthlyDataRows.reduce((s, r) => s + r.purchaseQty, 0);
  const totalPurchaseValue = monthlyDataRows.reduce((s, r) => s + r.purchaseValue, 0);
  const totalSaleQty = monthlyDataRows.reduce((s, r) => s + r.saleQty, 0);
  const totalSaleValue = monthlyDataRows.reduce((s, r) => s + r.saleValue, 0);
  const totalClosingQty = monthlyDataRows.reduce((s, r) => s + r.closingQty, 0);
  const totalClosingValue = monthlyDataRows.reduce((s, r) => s + r.closingValue, 0);

  // Distributor Net Margin (same formula as previously called Rupee Gross Margin)
  const distributorNetMargin = distributorMarginPercent > 0
    ? totalSales - totalSales / (1 + distributorMarginPercent / 100)
    : 0;

  // Net Distributor Rupee Gross Margin = Distributor Gross Margin × (1 − Early Payment Discount)
  const netDistributorRupeeGrossMargin = distributorNetMargin * (1 - earlyPaymentDiscount / 100);

  // Retailer Outstanding = Credit Days × Sales / 30
  const retailerOutstanding = creditDays * totalSales / 30;

  // Net Payment Received = Sales - Retailer Outstanding
  const netPaymentReceived = totalSales - retailerOutstanding;

  // Opening Cash Balance = cash from after Round 3 inventory purchase
  const openingWorkingCapital = 5000000;
  const currentCash = parseInt(localStorage.getItem("gameDistributionCash") || `${openingWorkingCapital}`, 10);
  const inventoryInvestment = Math.max(0, openingWorkingCapital - currentCash);

  // Total Trade Scheme Spend = Total Sales × (Quantity Discount + Retail Display Incentive)
  const totalTradeSchemeSpend = totalSales * (totalSchemePercent / 100);

  // Cash in Hand = Opening Cash Balance + Payment Received – Trade Scheme
  const cashInHand = currentCash + netPaymentReceived - totalTradeSchemeSpend;

  // New Outlets Opened = Total Manpower × (Low=40, Medium=70, High=100)
  const newOutletsMultiplier = newRetailerEffort === 0 ? 40 : newRetailerEffort === 1 ? 70 : 100;
  const newOutletsOpened = totalManpower * newOutletsMultiplier;

  // Total Coverage = Total Manpower × Retailer Visit per Salesperson + New Outlets Opened
  const totalCoverage = totalManpower * retailersToVisit + newOutletsOpened;

  // Target Coverage = Round 2 Coverage + 10000
  const r2RetailersToVisit = parseInt(localStorage.getItem("gameDistributionRetailersToVisit") || "0", 10);
  const r2NewRetailerEffort = parseInt(localStorage.getItem("gameDistributionNewRetailerEffort") || "0", 10);
  const r2NewOutletsMultiplier = r2NewRetailerEffort === 0 ? 10 : r2NewRetailerEffort === 1 ? 20 : 30;
  const r2TotalCoverage = r2RetailersToVisit > 0 ? (totalManpower * r2RetailersToVisit) + (totalManpower * r2NewOutletsMultiplier) : 1020;
  const targetCoverage = r2TotalCoverage + 1000;

  // Target Achieved
  const targetAchieved = targetCoverage > 0 ? (totalCoverage / targetCoverage) : 0;

  // Manpower Cost = 20,000 × Total Manpower
  const manpowerCost = totalManpower * 20000;

  // Distributor ROI % = (Net Distributor Rupee Gross Margin - Manpower Cost - Delivery & Warehouse Cost - 20000)
  //                      / (20,00,000 + Closing Stock Value + Retailer Outstanding) × 100
  const roiDenominator = 2000000 + totalClosingValue + retailerOutstanding;
  const distributorROI = roiDenominator > 0
    ? ((netDistributorRupeeGrossMargin - manpowerCost - deliveryWarehouseCost - 20000) / roiDenominator) * 100
    : 0;

  // --- Retailer Satisfaction (weighted scoring per formula) ---
  // 1. Payment Enforcement: Low=3, Medium=2, High=1 | weight 20%
  const paymentEnforcementPoint = enforcementLevel === 0 ? 3 : enforcementLevel === 1 ? 2 : 1;
  const paymentEnforcementScore = paymentEnforcementPoint * 0.2;

  // 2. Scheme Push: Low=3, Medium=2, High=1 | weight 30%
  const schemePushPoint = schemePushIntensity === 0 ? 3 : schemePushIntensity === 1 ? 2 : 1;
  const schemePushScore = schemePushPoint * 0.3;

  // 3. Order Fulfillment Rate: <85%=1, 85-90%=2, >90%=3 | weight 30%
  const orderFulfilmentPoint = orderFulfilment > 90 ? 3 : orderFulfilment >= 85 ? 2 : 1;
  const orderFulfilmentScore = orderFulfilmentPoint * 0.3;

  // 4. Delivery Frequency to Retailers: <7=3, 7-10=2, >10=1 | weight 20%
  const deliveryFrequencyPoint = retailersToVisit < 7 ? 3 : retailersToVisit <= 10 ? 2 : 1;
  const deliveryFrequencyScore = deliveryFrequencyPoint * 0.2;

  const totalSatisfactionScore =
    paymentEnforcementScore + schemePushScore + orderFulfilmentScore + deliveryFrequencyScore;

  const getRetailerSatisfaction = () => {
    if (totalSatisfactionScore > 2.5) return "High";
    if (totalSatisfactionScore >= 1.5) return "Medium";
    return "Low";
  };

  // New Retailer Acquisition Effort = Total Manpower × (Low=10, Medium=20, High=30)
  const acquisitionMultiplier = newRetailerEffort === 0 ? 10 : newRetailerEffort === 1 ? 20 : 30;
  const newRetailerAcquisitionEffort = totalManpower * acquisitionMultiplier;

  // Cost to Serve Per Outlet = (Manpower Cost + Delivery & Warehouse Cost) / Total Coverage
  const costToServePerOutlet = totalCoverage > 0
    ? (manpowerCost + deliveryWarehouseCost) / totalCoverage
    : 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Save Round 3 results to localStorage so Round 4 can reference them
  useEffect(() => {
    localStorage.setItem("gameDistributionR3TotalSales", Math.round(monthlySalesTableTotal).toString());
    localStorage.setItem("gameDistributionR3RetailerOutstanding", Math.round(retailerOutstanding).toString());
    localStorage.setItem("gameDistributionR3TradeSchemeSpend", Math.round(totalTradeSchemeSpend).toString());
    localStorage.setItem("gameDistributionR3NetPaymentReceived", Math.round(netPaymentReceived).toString());
    localStorage.setItem("gameDistributionR3DistributorROI", distributorROI.toFixed(2));
    localStorage.setItem("gameDistributionR3RetailerSatisfaction", getRetailerSatisfaction());
    localStorage.setItem("gameDistributionR3CashInHand", Math.round(cashInHand).toString());
    // Save per-product effective unit prices so Round 4 can use as fallback
    monthlyDataRows.forEach(r => {
      if (r.purchaseUnitPrice > 0) {
        localStorage.setItem(`gameDistributionR3UnitPrice_${r.key}`, r.purchaseUnitPrice.toString());
      }
    });
  }, [monthlySalesTableTotal, retailerOutstanding, totalTradeSchemeSpend, netPaymentReceived, distributorROI, cashInHand]);

  const handleProceed = () => {
    // Calculate ending inventory after sales (Carry Forward: Opening Stock + Purchase - Sales)
    const getSoldUnits = (key) => salesValues.find(p => p.key === key).units;
    const carryForwardInventory = {
      milk: { ...inventory.milk, qty: inventory.milk.qty - getSoldUnits('milk') },
      dark: { ...inventory.dark, qty: inventory.dark.qty - getSoldUnits('dark') },
      wafer: { ...inventory.wafer, qty: inventory.wafer.qty - getSoldUnits('wafer') },
      gift: { ...inventory.gift, qty: inventory.gift.qty - getSoldUnits('gift') }
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
    localStorage.setItem("gameDistributionR4OpeningStock", JSON.stringify(carryForwardInventory));
    localStorage.setItem("gameDistributionRound4Inventory", JSON.stringify(emptyInventory));
    localStorage.setItem("gameDistributionCurrentRound", "4");
    navigate("/game-distribution/round4-intro");
  };

  const handleBack = () => {
    navigate("/game-distribution/round3-supply-discipline");
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4 font-sans">

      {/* Main Game Container */}
      <div className="w-full max-w-5xl bg-yellow-100 rounded-3xl shadow-2xl overflow-hidden border-8 border-yellow-200">

        <div className="bg-emerald-700 text-emerald-50 px-6 py-3 flex justify-between items-center text-sm font-bold tracking-widest uppercase border-b-4 border-emerald-800">
          <span>Game Simulation</span>
        </div>

        {/* Header */}
        <div className="text-center pt-8 pb-4 border-b-4 border-yellow-200/50">
          <h1 className="text-4xl font-extrabold text-red-600 tracking-wider uppercase drop-shadow-sm">
            Round 3 – Market Expansion Drive
          </h1>
        </div>

        {/* Content Area */}
        <div className="p-8 sm:p-10">



          {/* Market Conditions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10 max-w-3xl mx-auto">
            {[
              { label: "Consumer Demand", value: "High", color: "text-emerald-700" },
              { label: "Competitor Activity", value: "Aggressive", color: "text-red-600" },
              { label: "Season", value: "Expansion Period", color: "text-blue-600" },
              { label: "Retailer Sentiment", value: "Optimistic", color: "text-emerald-700" },
              { label: "Supply Situation", value: "Strained", color: "text-amber-600" },
              { label: "New Outlets Target", value: "1000", color: "text-blue-700" }
            ].map(item => (
              <div key={item.label} className="bg-yellow-50 p-3 rounded-xl border border-yellow-200 text-center">
                <p className="text-sm text-gray-500 font-medium">{item.label}</p>
                <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Monthly Data Table */}
          <div className="mb-8 overflow-x-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center underline decoration-yellow-400">
              Monthly Data
            </h2>
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
                      {/* Purchase: Qty | Unit Price (Value/Qty) | Value */}
                      <td className="px-3 py-2 text-blue-700 font-bold border-l-2 border-yellow-200">
                        {r.purchaseQty.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-2 text-blue-600">
                        {r.purchaseUnitPrice > 0 ? formatCurrency(r.purchaseUnitPrice) : '—'}
                      </td>
                      <td className="px-3 py-2 text-blue-700 font-bold">
                        {formatCurrency(r.purchaseValue)}
                      </td>
                      {/* Sale: % × (OS + Purchase) */}
                      <td className="px-3 py-2 text-emerald-700 font-bold border-l-2 border-yellow-200">
                        {r.saleQty.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-2 text-emerald-600">
                        {formatCurrency(r.saleUnitPrice)}
                      </td>
                      <td className="px-3 py-2 text-emerald-700 font-bold">
                        {formatCurrency(r.saleValue)}
                      </td>
                      {/* Closing: OS(R2) + Purchase - Sale; Value = Qty × Purchase Unit Price */}
                      <td className="px-3 py-2 text-red-700 font-bold border-l-2 border-yellow-200">
                        {r.closingQty.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-2 text-red-700 font-bold">
                        {formatCurrency(r.closingValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-yellow-200 border-t-2 border-yellow-400 font-extrabold text-gray-900">
                    <td className="px-3 py-2 text-left">Total</td>
                    <td className="px-3 py-2 text-blue-800 border-l-2 border-yellow-300">
                      {totalPurchaseQty.toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-2">—</td>
                    <td className="px-3 py-2 text-blue-800">{formatCurrency(totalPurchaseValue)}</td>
                    <td className="px-3 py-2 text-emerald-800 border-l-2 border-yellow-300">
                      {totalSaleQty.toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-2">—</td>
                    <td className="px-3 py-2 text-emerald-800">{formatCurrency(totalSaleValue)}</td>
                    <td className="px-3 py-2 text-red-800 border-l-2 border-yellow-300">
                      {totalClosingQty.toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-2 text-red-800">{formatCurrency(totalClosingValue)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center underline decoration-yellow-400">
              Financial Summary
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {[
                { label: "Distributor Margin", value: `${distributorMarginPercent}%` },
                { label: "Credit Days", value: `${creditDays} Days` },
                { label: "Distributor Rupee Gross Margin", value: formatCurrency(Math.round(distributorNetMargin)) },
                { label: "Net Distributor Rupee Gross Margin", value: formatCurrency(Math.round(netDistributorRupeeGrossMargin)) },
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
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center underline decoration-yellow-400">
              Operational Summary
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {[
                { label: "Total Coverage", value: `${totalCoverage} Retailers` },
                { label: "Target Coverage", value: `${targetCoverage} Retailers` },
                { label: "Target Achieved", value: `${(targetAchieved * 100).toFixed(2)}%` },
                { label: "New Outlets Opened", value: `${newOutletsOpened}` },
                { label: "Total Manpower", value: `${totalManpower}` },
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

          {/* Key Results */}
          {/* Key Results */}
          <div className="mb-8 max-w-3xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Distributor ROI */}
              <div className="bg-emerald-50 p-6 rounded-2xl border-2 border-emerald-300 text-center shadow-sm">
                <p className="text-gray-600 font-medium text-sm mb-1">Distributor ROI</p>
                <p className="text-5xl font-extrabold text-emerald-700">
                  {distributorROI.toFixed(2)}%
                </p>
              </div>

              {/* Retailer Satisfaction */}
              <div className="bg-amber-50 p-6 rounded-2xl border-2 border-amber-300 text-center shadow-sm">
                <p className="text-gray-600 font-medium text-sm mb-1">Retailer Satisfaction</p>
                <p className={`text-5xl font-extrabold ${getRetailerSatisfaction() === 'High' ? 'text-emerald-700' :
                  getRetailerSatisfaction() === 'Medium' ? 'text-amber-600' : 'text-red-600'
                  }`}>
                  {getRetailerSatisfaction()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="mt-10 flex justify-center items-center max-w-2xl mx-auto px-4">
            <button
              onClick={handleProceed}
              className="bg-green-500 hover:bg-green-600 text-white font-extrabold py-4 px-12 rounded-xl shadow-[0_6px_0_rgb(21,128,61)] hover:shadow-[0_3px_0_rgb(21,128,61)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all text-2xl transform scale-110 tracking-widest"
            >
              [ Proceed to Round 4 ]
            </button>
          </div>

        </div>

        {/* Footer Info Strip */}
        <div className="bg-yellow-100 border-t-4 border-yellow-300 px-8 py-5 flex justify-center items-center text-lg font-bold text-gray-800">
          <span>Round: <span className="text-emerald-700">3</span> of 7</span>
        </div>

      </div>
    </div>
  );
};

export default GameDistributionRound3Result;
