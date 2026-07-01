import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GameDistributionRoundResult = () => {
  const navigate = useNavigate();

  // --- Data from previous screens (localStorage) ---

  // Inventory (from Inventory/Acquisition screens)
  const [inventory] = useState(() => {
    const saved = localStorage.getItem("gameDistributionInventory");
    if (saved) return JSON.parse(saved);
    return {
      milk: { name: "Tedbury Milk Chocolate", qty: 0 },
      dark: { name: "Tedbury Dark Chocolate", qty: 0 },
      wafer: { name: "Tedbury Wafer Chocolate", qty: 0 },
      gift: { name: "Tedbury Gift Packs", qty: 0 }
    };
  });

  // Trade Scheme
  const quantityDiscount = parseFloat(localStorage.getItem("gameDistributionQuantityDiscount") || "0");
  const retailDisplay = parseFloat(localStorage.getItem("gameDistributionRetailDisplay") || "0");
  const totalSchemePercent = quantityDiscount + retailDisplay;

  // Credit Control
  const creditDays = parseInt(localStorage.getItem("gameDistributionCreditDays") || "0", 10);
  const maxCreditLimit = parseInt(localStorage.getItem("gameDistributionMaxCreditLimit") || "0", 10);
  const earlyPaymentDiscount = parseFloat(localStorage.getItem("gameDistributionEarlyPaymentDiscount") || "0");
  const enforcementLevel = parseInt(localStorage.getItem("gameDistributionEnforcementLevel") || "0", 10);

  // Sales Team
  const retailersToVisit = parseInt(localStorage.getItem("gameDistributionRetailersToVisit") || "0", 10);
  const newRetailerEffort = parseInt(localStorage.getItem("gameDistributionNewRetailerEffort") || "0", 10);
  const schemePushIntensity = parseInt(localStorage.getItem("gameDistributionSchemePushIntensity") || "0", 10);

  // Supply Discipline
  const orderFulfilment = parseInt(localStorage.getItem("gameDistributionOrderFulfilment") || "0", 10);
  const deliveryFrequency = parseInt(localStorage.getItem("gameDistributionDeliveryFrequency") || "0", 10);

  // --- Round 1 Inputs (admin/config) ---

  const monthlySales = {
    milk: { units: 10000, sellingPrice: 54, totalSales: 540000 },
    dark: { units: 7000, sellingPrice: 77, totalSales: 540000 },
    wafer: { units: 10000, sellingPrice: 32.4, totalSales: 324000 },
    gift: { units: 1000, sellingPrice: 216, totalSales: 216000 }
  };

  // Cost prices per unit (purchase price from Acquisition screen)
  const costPrices = { milk: 100, dark: 150, wafer: 80, gift: 500 };

  // Distributor Margin % (given by admin)
  const distributorMarginPercent = 8;

  // Total Manpower (given by admin)
  const totalManpower = 6;

  // Delivery & Warehouse Cost (given by admin)
  const deliveryWarehouseCost = 100000;

  // --- Calculations ---

  const productRows = [
    { key: "milk", label: "Tedbury Milk Chocolate" },
    { key: "dark", label: "Tedbury Dark Chocolate" },
    { key: "wafer", label: "Tedbury Wafer Chocolate" },
    { key: "gift", label: "Tedbury Gift Packs" }
  ];

  // Monthly Sales Table: Units = Sales - Inventory, Value = Sales/(1+Margin%) - Inventory Value
  const salesValues = productRows.map(p => {
    // Use fixed Round 1 admin sales data (not user's purchased qty)
    const units = monthlySales[p.key].units;
    const sellingPrice = monthlySales[p.key].sellingPrice;
    const value = units * sellingPrice;

    return {
      ...p,
      units,
      sellingPrice,
      value: Math.round(value)
    };
  });

  // Table total — use admin's pre-defined totalSales to match Excel exactly
  const monthlySalesTableTotal = productRows.reduce((sum, p) => sum + monthlySales[p.key].totalSales, 0);

  // Total Sales (gross) — used in financial formulas
  const totalSales = monthlySalesTableTotal;

  // Monthly Data rows: Purchase (player) / Sale (admin) / Closing (Purchase - Sale)
  const monthlyDataRows = productRows.map(p => {
    const purchaseQty = inventory[p.key].qty;

    // Purchase Value = actual amount paid by the player (from Acquisition screen tiered pricing)
    const purchaseValue = parseInt(
      localStorage.getItem(`gameDistributionPurchaseAmount_${p.key}`) || '0', 10
    );

    // Purchase Unit Price = Value / Quantity (derived — e.g. ₹8,50,000 ÷ 20,000 = ₹42.5/unit)
    // If no purchase this round, use 0 for R1 (base round — no previous round to fall back to)
    const purchaseUnitPrice = purchaseQty > 0
      ? Math.round(purchaseValue / purchaseQty)
      : 0;

    const saleQty = monthlySales[p.key].units;
    const saleUnitPrice = monthlySales[p.key].sellingPrice;
    // Use admin's exact totalSales value (matches Excel sheet)
    const saleValue = monthlySales[p.key].totalSales;

    // Closing = Opening(0 in R1) + Purchase - Sale
    const closingQty = purchaseQty - saleQty;
    // Closing Value = Closing Qty × Purchase Unit Price
    const closingValue = Math.round(closingQty * purchaseUnitPrice);

    return {
      ...p,
      purchaseQty, purchaseUnitPrice, purchaseValue,
      saleQty, saleUnitPrice, saleValue,
      closingQty, closingValue
    };
  });

  const totalPurchaseQty   = monthlyDataRows.reduce((s, r) => s + r.purchaseQty, 0);
  const totalPurchaseValue = monthlyDataRows.reduce((s, r) => s + r.purchaseValue, 0);
  const totalSaleQty       = monthlyDataRows.reduce((s, r) => s + r.saleQty, 0);
  const totalSaleValue     = monthlyDataRows.reduce((s, r) => s + r.saleValue, 0);
  const totalClosingQty    = monthlyDataRows.reduce((s, r) => s + r.closingQty, 0);
  const totalClosingValue  = monthlyDataRows.reduce((s, r) => s + r.closingValue, 0);

  // Distributor Rupee Gross Margin = Total Sales - (Total Sales / (1 + Distributor Margin%))
  const distributorRupeeGrossMargin = totalSales - totalSales / (1 + distributorMarginPercent / 100);

  // Net Distributor Rupee Gross Margin = Distributor Gross Margin × (1 - Early Payment Discount%)
  // Formula from Excel: Distributor Gross Margin x (1-Early Payment Discount)
  const netDistributorRupeeGrossMargin =
    distributorRupeeGrossMargin * (1 - earlyPaymentDiscount / 100);

  // Retailer Outstanding = Total Sales × (Credit Days / 30)
  const retailerOutstanding = (creditDays / 30) * totalSales;

  // Net Payment Received (Net Cash Received) = Total Sales - Retailer Outstanding
  const netPaymentReceived = totalSales - retailerOutstanding;

  // Total Inventory (units purchased by user)
  const totalInventoryUnits =
    inventory.milk.qty + inventory.dark.qty + inventory.wafer.qty + inventory.gift.qty;

  // Working capital / cash tracking
  const openingWorkingCapital = 5000000;
  const currentCash = parseInt(localStorage.getItem("gameDistributionCash") || `${openingWorkingCapital}`, 10);

  // Total Trade Scheme Spend = Total Sales × (Quantity Discount% + Retail Display Incentive%)
  // Uses the trade scheme values chosen on the Trade Scheme screen
  const totalTradeSchemeSpend = totalSales * (totalSchemePercent / 100);

  // Cash in Hand = Opening Cash Balance + Payment Received – Trade Scheme
  const cashInHand = currentCash + netPaymentReceived - totalTradeSchemeSpend;

  // New Outlets Opened = Total Manpower × (Low=10, Medium=20, High=30)
  const newOutletsMultiplier = newRetailerEffort === 0 ? 10 : newRetailerEffort === 1 ? 20 : 30;
  const newOutletsOpened = totalManpower * newOutletsMultiplier;

  // Total Coverage = Total Manpower × Retailer Visit per Salesperson + New Outlets Opened
  const totalCoverage = totalManpower * retailersToVisit + newOutletsOpened;

  // Manpower Cost = 20,000 × Total Manpower
  const manpowerCost = totalManpower * 20000;

  // Distributor ROI = [Distributor Net Margin - Manpower Cost - Delivery & Warehouse Cost]
  //                   / (20,00,000 + Closing Stock Value + Retailer Outstanding) × 100
  // Excel formula: [Distributor Net Margin - Manpower Cost - Delivery & Warehouse Cost]
  //                /(20,00,000 + Closing Stock Value + Retailer Outstanding) × 100
  const roiDenominator = 2000000 + totalClosingValue + retailerOutstanding;
  const distributorROI = roiDenominator > 0
    ? ((netDistributorRupeeGrossMargin - manpowerCost - deliveryWarehouseCost) / roiDenominator) * 100
    : 0;

  // --- Retailer Satisfaction (weighted scoring) ---
  // Excel formula sheet criteria (weights sum = 1.0, max score = 3.0):
  // Payment Enforcement: 20% weight, L=3 M=2 H=1
  // Scheme Push: 30% weight, L=3 M=2 H=1
  // Order Fulfilment Rate: 30% weight, <85%=1, 85-90%=2, >90%=3
  // Delivery Frequency to Retailers: 20% weight, <=10=1, >10 & <=20=2, >20=3

  // 1. Payment Enforcement (0=Low, 1=Medium, 2=High) -> L=3, M=2, H=1
  // Low enforcement = better for retailer (score 3)
  const paymentEnforcementPoint = enforcementLevel === 0 ? 3 : enforcementLevel === 1 ? 2 : 1;
  const paymentEnforcementScore = paymentEnforcementPoint * 0.2;

  // 2. Scheme Push: Low=3, Medium=2, High=1 → weight 0.3
  //    schemePushIntensity: 0=Low, 1=Medium, 2=High
  const schemePushPoint = schemePushIntensity === 0 ? 3 : schemePushIntensity === 1 ? 2 : 1;
  const schemePushScore = schemePushPoint * 0.3;

  // 3. Order Fulfilment Rate: <85%=1, 85–90%=2, >90%=3 → weight 0.3
  const orderFulfilmentPoint = orderFulfilment > 90 ? 3 : orderFulfilment >= 85 ? 2 : 1;
  const orderFulfilmentScore = orderFulfilmentPoint * 0.3;

  // 4. Delivery Frequency to Retailers
  //    <7=3, 7-10=2, >10=1 → weight 0.2
  const deliveryFrequencyPoint = deliveryFrequency < 7 ? 3 : deliveryFrequency <= 10 ? 2 : 1;
  const deliveryFrequencyScore = deliveryFrequencyPoint * 0.2;

  const totalSatisfactionScore = Number(
    (paymentEnforcementScore + schemePushScore + orderFulfilmentScore + deliveryFrequencyScore).toFixed(2)
  );

  const getRetailerSatisfaction = () => {
    if (totalSatisfactionScore > 2.5) return "High";
    if (totalSatisfactionScore >= 1.5) return "Medium";
    return "Low";
  };

  // New Retailer Acquisition Effort = Total Manpower × (Low=10, Medium=20, High=30)
  // Based on user's selection on Sales Team screen (newRetailerEffort: 0=Low, 1=Medium, 2=High)
  const acquisitionMultiplier = newRetailerEffort === 0 ? 10 : newRetailerEffort === 1 ? 20 : 30;
  const newRetailerAcquisitionEffort = totalManpower * acquisitionMultiplier;

  // Cost to Serve Per Outlet = (Manpower Cost + Delivery & Warehouse Cost) / Total Coverage
  const costToServePerOutlet = totalCoverage > 0
    ? (manpowerCost + deliveryWarehouseCost) / totalCoverage
    : 0;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Save Round 1 results to localStorage so Round 2 can reference them
  useEffect(() => {
    localStorage.setItem("gameDistributionR1TotalSales", Math.round(monthlySalesTableTotal).toString());
    localStorage.setItem("gameDistributionR1RetailerOutstanding", Math.round(retailerOutstanding).toString());
    localStorage.setItem("gameDistributionR1TradeSchemeSpend", Math.round(totalTradeSchemeSpend).toString());
    localStorage.setItem("gameDistributionR1NetPaymentReceived", Math.round(netPaymentReceived).toString());
    localStorage.setItem("gameDistributionR1DistributorROI", distributorROI.toFixed(2));
    localStorage.setItem("gameDistributionR1RetailerSatisfaction", getRetailerSatisfaction());
    localStorage.setItem("gameDistributionR1CashInHand", Math.round(cashInHand).toString());
    
    // Save per-product unit prices so next rounds can use as fallback when no purchase is made
    monthlyDataRows.forEach(r => {
      if (r.purchaseUnitPrice > 0) {
        localStorage.setItem(`gameDistributionR1UnitPrice_${r.key}`, r.purchaseUnitPrice.toString());
      }
    });
  }, [monthlySalesTableTotal, retailerOutstanding, totalTradeSchemeSpend, netPaymentReceived, distributorROI, cashInHand]);

  const handleExit = () => {
    // Calculate ending inventory after sales (Carry Forward: Opening Stock + Purchase - Sales)
    // Round 1 Opening Stock is 0
    const carryForwardInventory = {
      milk: { ...inventory.milk, qty: 0 + inventory.milk.qty - monthlySales.milk.units },
      dark: { ...inventory.dark, qty: 0 + inventory.dark.qty - monthlySales.dark.units },
      wafer: { ...inventory.wafer, qty: 0 + inventory.wafer.qty - monthlySales.wafer.units },
      gift: { ...inventory.gift, qty: 0 + inventory.gift.qty - monthlySales.gift.units }
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
    localStorage.setItem("gameDistributionR2OpeningStock", JSON.stringify(carryForwardInventory));
    localStorage.setItem("gameDistributionRound2Inventory", JSON.stringify(emptyInventory));
    localStorage.setItem("gameDistributionCurrentRound", "2");
    navigate("/game-distribution/round2-intro");
  };

  const handleBack = () => {
    navigate("/game-distribution/supply-discipline");
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
            Round 1 – Stable Market
          </h1>
        </div>

        {/* Content Area */}
        <div className="p-8 sm:p-10">

          {/* Market Conditions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10 max-w-3xl mx-auto">
            {[
              { label: "Consumer Demand", value: "Moderate", color: "text-blue-700" },
              { label: "Competitor Activity", value: "Normal", color: "text-blue-700" },
              { label: "Season", value: "Regular Business Period", color: "text-amber-600" },
              { label: "Retailer Sentiment", value: "Neutral", color: "text-gray-600" },
              { label: "Supply Situation", value: "Stable", color: "text-emerald-700" }
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
                  {/* Section header row */}
                  <tr className="bg-yellow-200 border-b-2 border-yellow-300">
                    <th className="px-3 py-2 text-gray-700 font-bold text-left" rowSpan={2}>Product</th>
                    <th className="px-3 py-2 text-blue-800 font-bold border-l-2 border-yellow-300" colSpan={3}>Purchase</th>
                    <th className="px-3 py-2 text-emerald-800 font-bold border-l-2 border-yellow-300" colSpan={3}>Sale</th>
                    <th className="px-3 py-2 text-red-800 font-bold border-l-2 border-yellow-300" colSpan={2}>Closing</th>
                  </tr>
                  {/* Sub-header row */}
                  <tr className="bg-yellow-100 border-b-2 border-yellow-300 text-xs">
                    {/* Purchase: Qty → Value → Unit Price (Unit Price = Value / Qty) */}
                    <th className="px-3 py-2 text-blue-700 font-semibold border-l-2 border-yellow-300">Quantity</th>
                    <th className="px-3 py-2 text-blue-700 font-semibold">Value</th>
                    <th className="px-3 py-2 text-blue-700 font-semibold">Unit Price</th>
                    {/* Sale: fixed from Excel */}
                    <th className="px-3 py-2 text-emerald-700 font-semibold border-l-2 border-yellow-300">Quantity</th>
                    <th className="px-3 py-2 text-emerald-700 font-semibold">Unit Price</th>
                    <th className="px-3 py-2 text-emerald-700 font-semibold">Value</th>
                    {/* Closing: Qty = OS+P-S, Value = Closing Qty × Purchase Unit Price */}
                    <th className="px-3 py-2 text-red-700 font-semibold border-l-2 border-yellow-300">Quantity</th>
                    <th className="px-3 py-2 text-red-700 font-semibold">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyDataRows.map(r => (
                    <tr key={r.key} className="border-b border-yellow-100 hover:bg-yellow-100/50">
                      <td className="px-3 py-2 font-medium text-gray-800 text-left">{r.label}</td>
                      {/* Purchase: Quantity | Value | Unit Price (Unit Price = Value ÷ Qty) */}
                      <td className="px-3 py-2 text-blue-700 font-bold border-l-2 border-yellow-200">
                        {r.purchaseQty.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-2 text-blue-700 font-bold">
                        {formatCurrency(r.purchaseValue)}
                      </td>
                      <td className="px-3 py-2 text-blue-600">
                        {r.purchaseUnitPrice > 0 ? formatCurrency(r.purchaseUnitPrice) : '—'}
                      </td>
                      {/* Sale */}
                      <td className="px-3 py-2 text-emerald-700 font-bold border-l-2 border-yellow-200">
                        {r.saleQty.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-2 text-emerald-600">
                        {formatCurrency(r.saleUnitPrice)}
                      </td>
                      <td className="px-3 py-2 text-emerald-700 font-bold">
                        {formatCurrency(r.saleValue)}
                      </td>
                      {/* Closing */}
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
                    {/* Purchase totals: Qty | Value | Unit Price (—) */}
                    <td className="px-3 py-2 text-blue-800 border-l-2 border-yellow-300">
                      {totalPurchaseQty.toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-2 text-blue-800">
                      {formatCurrency(totalPurchaseValue)}
                    </td>
                    <td className="px-3 py-2">—</td>
                    {/* Sale totals */}
                    <td className="px-3 py-2 text-emerald-800 border-l-2 border-yellow-300">
                      {totalSaleQty.toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-2">—</td>
                    <td className="px-3 py-2 text-emerald-800">
                      {formatCurrency(totalSaleValue)}
                    </td>
                    {/* Closing totals */}
                    <td className="px-3 py-2 text-red-800 border-l-2 border-yellow-300">
                      {totalClosingQty.toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-2 text-red-800">
                      {formatCurrency(totalClosingValue)}
                    </td>
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
                { label: "Distributor Rupee Gross Margin", value: formatCurrency(Math.round(distributorRupeeGrossMargin)) },
                { label: "Distributor Net Margin", value: formatCurrency(Math.round(netDistributorRupeeGrossMargin)) },
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
                { label: "Total Manpower", value: `${totalManpower}` },
                { label: "New Outlets Opened", value: `${newOutletsOpened}` },
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
              onClick={handleExit}
              className="bg-green-500 hover:bg-green-600 text-white font-extrabold py-4 px-12 rounded-xl shadow-[0_6px_0_rgb(21,128,61)] hover:shadow-[0_3px_0_rgb(21,128,61)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all text-2xl transform scale-110 tracking-widest"
            >
              [ Proceed to Round 2 ]
            </button>
          </div>

        </div>

        {/* Footer Info Strip */}
        <div className="bg-yellow-100 border-t-4 border-yellow-300 px-8 py-5 flex justify-center items-center text-lg font-bold text-gray-800">
          <span>Round: <span className="text-emerald-700">1</span> of 7</span>
        </div>

      </div>
    </div>
  );
};

export default GameDistributionRoundResult;
