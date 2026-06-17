import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GameDistributionRound4Result = () => {
  const navigate = useNavigate();

  // --- Round 4 Inventory (combined Opening Stock + new R4 purchases for financial calculations) ---
  const [inventory] = useState(() => {
    const savedPurchases = localStorage.getItem("gameDistributionRound4Inventory");
    const savedOpening = localStorage.getItem("gameDistributionR4OpeningStock");
    const purchases = savedPurchases ? JSON.parse(savedPurchases) : null;
    const opening = savedOpening ? JSON.parse(savedOpening) : null;
    return {
      milk: { name: "Tedbury Milk Chocolate", qty: (opening?.milk?.qty || 0) + (purchases?.milk?.qty || 0), purchasedQty: (purchases?.milk?.qty || 0) },
      dark: { name: "Tedbury Dark Chocolate", qty: (opening?.dark?.qty || 0) + (purchases?.dark?.qty || 0), purchasedQty: (purchases?.dark?.qty || 0) },
      wafer: { name: "Tedbury Wafer Chocolate", qty: (opening?.wafer?.qty || 0) + (purchases?.wafer?.qty || 0), purchasedQty: (purchases?.wafer?.qty || 0) },
      gift: { name: "Tedbury Gift Packs", qty: (opening?.gift?.qty || 0) + (purchases?.gift?.qty || 0), purchasedQty: (purchases?.gift?.qty || 0) }
    };
  });

  // Separate reads for Monthly Data table
  const openingStock = (() => {
    const saved = localStorage.getItem("gameDistributionR4OpeningStock");
    return saved ? JSON.parse(saved) : { milk: {qty:0}, dark: {qty:0}, wafer: {qty:0}, gift: {qty:0} };
  })();
  const purchasesOnly = (() => {
    const saved = localStorage.getItem("gameDistributionRound4Inventory");
    return saved ? JSON.parse(saved) : { milk: {qty:0}, dark: {qty:0}, wafer: {qty:0}, gift: {qty:0} };
  })();

  // --- Round 3 Data (for Cash flow) ---
  const r3NetPaymentReceived = parseInt(localStorage.getItem("gameDistributionR3NetPaymentReceived") || "0", 10);
  const r3TradeSchemeSpend = parseInt(localStorage.getItem("gameDistributionR3TradeSchemeSpend") || "0", 10);
  const currentCash = parseInt(localStorage.getItem("gameDistributionCash") || "5000000", 10);

  // --- Sales Team ---
  const retailersToVisit = parseInt(localStorage.getItem("gameDistributionR4RetailersToVisit") || "300", 10);
  const newRetailerEffort = parseInt(localStorage.getItem("gameDistributionR4NewRetailerEffort") || "0", 10);
  const schemePushIntensity = parseInt(localStorage.getItem("gameDistributionR4SchemePushIntensity") || "0", 10);

  // --- Supply Discipline ---
  const orderFulfilment = parseInt(localStorage.getItem("gameDistributionR4OrderFulfilment") || "0", 10);
  const deliveryFrequency = parseInt(localStorage.getItem("gameDistributionR4DeliveryFrequency") || "68", 10);
  const enforcementLevel = parseInt(localStorage.getItem("gameDistributionR4EnforcementLevel") || "0", 10);

  // --- Round 4 Calculations (from user screenshots) ---
  const milkTotalStock = inventory.milk.qty;
  const darkTotalStock = inventory.dark.qty;
  const waferTotalStock = inventory.wafer.qty;
  const giftTotalStock = inventory.gift.qty;

  // Sales Quantity formula (per sheet): % × (Opening Stock + Purchase)
  // Milk: 40%, Dark: 40%, Wafer: 60%, Gift Packs: 65%
  const salesUnits = {
    milk: Math.round(0.40 * milkTotalStock),
    dark: Math.round(0.40 * darkTotalStock),
    wafer: Math.round(0.60 * waferTotalStock),
    gift: Math.round(0.65 * giftTotalStock)
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

  // --- Monthly Data rows: Purchase (R4 buys) / Sale (% of OS+Purchase) / Closing ---
  const salesPercentagesR4 = { milk: 40, dark: 40, wafer: 60, gift: 65 };
  const monthlyDataRows = productRows.map(p => {
    // Purchase: new R4 buys only
    const purchaseQty = purchasesOnly[p.key]?.qty || 0;
    // Value = actual amount paid in R4
    const purchaseValue = parseInt(
      localStorage.getItem(`gameDistributionPurchaseAmount_r4_${p.key}`) || '0', 10
    );
    // Unit Price = Value / Quantity (derived)
    const purchaseUnitPrice = purchaseQty > 0 ? Math.round(purchaseValue / purchaseQty) : 0;

    // Sale: % × (Opening Stock + Purchase)
    const osQty = openingStock[p.key]?.qty || 0;
    const combinedQty = osQty + purchaseQty;
    const saleQty = Math.round((salesPercentagesR4[p.key] / 100) * combinedQty);
    const saleUnitPrice = sellingPrices[p.key];
    const saleValue = Math.round(saleQty * saleUnitPrice);

    // Closing: Opening Stock (carried from R3) + Purchase - Sale
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

  const totalPurchaseQty   = monthlyDataRows.reduce((s, r) => s + r.purchaseQty, 0);
  const totalPurchaseValue = monthlyDataRows.reduce((s, r) => s + r.purchaseValue, 0);
  const totalSaleQty       = monthlyDataRows.reduce((s, r) => s + r.saleQty, 0);
  const totalSaleValue     = monthlyDataRows.reduce((s, r) => s + r.saleValue, 0);
  const totalClosingQty    = monthlyDataRows.reduce((s, r) => s + r.closingQty, 0);
  const totalClosingValue  = monthlyDataRows.reduce((s, r) => s + r.closingValue, 0);


  const earlyPaymentDiscount = parseFloat(localStorage.getItem("gameDistributionR4EarlyPaymentDiscount") || "0");

  // --- Financial Summary (per image formula) ---
  // Distributor Gross Margin = Total Sales - (Total Sales / (1 + Distributor Margin%))
  const distributorMarginPercent = 8;
  const grossMargin = totalSales - (totalSales / (1 + distributorMarginPercent / 100));

  // Distributor Net Margin = Distributor Gross Margin × (1 - Early Payment Discount)
  const netMargin = grossMargin * (1 - earlyPaymentDiscount / 100);

  // Retailer Outstanding = Total Sales × (Credit Days / 30)
  const creditDays = parseInt(localStorage.getItem("gameDistributionR4CreditDays") || "0", 10);
  const retailerOutstanding = totalSales * (creditDays / 30);

  // Net Cash Received = Total Sales - Retailer Outstanding
  const netPaymentReceived = totalSales - retailerOutstanding;

  // Cash in Hand (Opening)
  const cashInHand = currentCash + r3NetPaymentReceived - r3TradeSchemeSpend;

  // Trade Scheme = Total Sales × (Quantity Discount + Retail Display Incentive)
  const quantityDiscount = parseFloat(localStorage.getItem("gameDistributionR4QuantityDiscount") || "0");
  const retailDisplay = parseFloat(localStorage.getItem("gameDistributionR4RetailDisplay") || "0");
  const totalSchemePercent = quantityDiscount + retailDisplay;
  const totalTradeSchemeSpend = totalSales * (totalSchemePercent / 100);

  // --- Operational Summary (per image formula) ---
  // Total Manpower = 6 (given by Admin)
  const totalManpower = 6;

  // New Retailer Acquisition Effort = Total Manpower × (Low=10, Medium=20, High=30)
  const acquisitionMultiplier = newRetailerEffort === 0 ? 10 : newRetailerEffort === 1 ? 20 : 30;
  const newRetailerAcquisitionEffort = totalManpower * acquisitionMultiplier;

  // New Outlets Opened (same scale as acquisition effort)
  const newOutletsOpened = newRetailerEffort === 0 ? 2 : newRetailerEffort === 1 ? 5 : 10;

  // Total Coverage = Total Manpower × Retailer Visit + New Outlets Opened
  const totalCoverage = totalManpower * retailersToVisit + newOutletsOpened;

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
  // Payment Enforcement: L=3, M=2, H=1 | weight 20%
  // Uses enforcementLevel from Credit Control screen (0=Low, 1=Medium, 2=High)
  const paymentEnforcementPoint = enforcementLevel === 0 ? 3 : enforcementLevel === 1 ? 2 : 1;
  const paymentEnforcementScore = paymentEnforcementPoint * 0.2;

  // Scheme Push: L=3, M=2, H=1 | weight 30%
  // schemePushIntensity: 0=Low, 1=Medium, 2=High
  const schemePushPoint = schemePushIntensity === 0 ? 3 : schemePushIntensity === 1 ? 2 : 1;
  const schemePushScore = schemePushPoint * 0.3;

  // Order Fulfillment Rate: <85%=1, 85-90%=2, >90%=3 | weight 30%
  const orderFulfilmentPoint = orderFulfilment > 90 ? 3 : orderFulfilment >= 85 ? 2 : 1;
  const orderFulfilmentScore = orderFulfilmentPoint * 0.3;

  // Delivery Frequency to Retailers: <7=3, 7-10=2, >10=1 | weight 20%
  const deliveryFrequencyPoint = deliveryFrequency < 7 ? 3 : deliveryFrequency <= 10 ? 2 : 1;
  const deliveryFrequencyScore = deliveryFrequencyPoint * 0.2;

  // Total score (max = 3.0)
  const satisfactionScore = paymentEnforcementScore + schemePushScore + orderFulfilmentScore + deliveryFrequencyScore;

  // Classification: Low <1.5 | Medium 1.5–2.5 | High >2.5
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
    localStorage.setItem("gameDistributionR4TotalSales", Math.round(totalSales).toString());
    localStorage.setItem("gameDistributionR4RetailerOutstanding", Math.round(retailerOutstanding).toString());
    localStorage.setItem("gameDistributionR4TradeSchemeSpend", Math.round(totalTradeSchemeSpend).toString());
    localStorage.setItem("gameDistributionR4NetPaymentReceived", Math.round(netPaymentReceived).toString());
    localStorage.setItem("gameDistributionR4DistributorROI", distributorROI.toFixed(2));
    localStorage.setItem("gameDistributionR4RetailerSatisfaction", getRetailerSatisfaction());
  }, [totalSales, retailerOutstanding, totalTradeSchemeSpend, netPaymentReceived, distributorROI]);

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
    localStorage.setItem("gameDistributionR5OpeningStock", JSON.stringify(carryForwardInventory));
    localStorage.setItem("gameDistributionRound5Inventory", JSON.stringify(emptyInventory));
    localStorage.setItem("gameDistributionCurrentRound", "5");
    navigate("/game-distribution/round5-intro");
  };

  const handleBack = () => {
    navigate("/game-distribution/round4-supply-discipline");
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-5xl bg-yellow-100 rounded-3xl shadow-2xl overflow-hidden border-8 border-yellow-200">
        <div className="bg-emerald-700 text-emerald-50 px-6 py-3 flex justify-between items-center text-sm font-bold tracking-widest uppercase border-b-4 border-emerald-800">
          <span>Game Simulation</span>
        </div>
        <div className="text-center pt-8 pb-4 border-b-4 border-yellow-200/50">
          <h1 className="text-4xl font-extrabold text-red-600 tracking-wider uppercase drop-shadow-sm px-4">
            Round 4 – Manpower Shortage Results
          </h1>
        </div>
        <div className="p-8 sm:p-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10 max-w-3xl mx-auto">
            {[
              { label: "Consumer Demand", value: "High", color: "text-emerald-700" },
              { label: "Manpower Situation", value: "Shortage", color: "text-red-600" },
              { label: "Operational State", value: "Stretched", color: "text-amber-600" },
              { label: "Order Generation", value: "Uneven", color: "text-amber-600" },
              { label: "Retailer Trust", value: "Fragile", color: "text-red-500" },
              { label: "Delivery Efficiency", value: "Reduced", color: "text-red-600" }
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
                      <td className="px-3 py-2 text-blue-600">{r.purchaseQty > 0 ? formatCurrency(r.purchaseUnitPrice) : '—'}</td>
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

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center underline decoration-yellow-400">Financial Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {[
                { label: "Cash in Hand (Opening)", value: formatCurrency(Math.round(cashInHand)) },
                { label: "Net Payment Received", value: formatCurrency(Math.round(netPaymentReceived)) },
                { label: "Distributor Rupee Gross Margin", value: formatCurrency(Math.round(grossMargin)) },
                { label: "Distributor Net Margin", value: formatCurrency(Math.round(netMargin)) },
                { label: "Retailer Outstanding", value: formatCurrency(Math.round(retailerOutstanding)) },
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
                { label: "Total Coverage", value: `${totalCoverage} Retailers` },
                { label: "New Outlets Opened", value: `${newOutletsOpened}` },
                { label: "Total Manpower", value: `${totalManpower}` },
                { label: "Manpower Cost", value: formatCurrency(manpowerCost) },
                { label: "Delivery & Warehouse Cost", value: formatCurrency(deliveryWarehouseCost) },
                { label: "New Retailer Acquisition Effort", value: `${newRetailerAcquisitionEffort}` },
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
                <p className="text-gray-500 text-xs mt-2 italic">Score: {satisfactionScore.toFixed(1)}</p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-between items-center max-w-2xl mx-auto px-4">
            <button onClick={handleBack} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-10 rounded-xl shadow-[0_4px_0_rgb(75,85,99)] hover:shadow-[0_2px_0_rgb(75,85,99)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all text-xl">[ Back ]</button>
            <button onClick={handleProceed} className="bg-green-500 hover:bg-green-600 text-white font-extrabold py-4 px-12 rounded-xl shadow-[0_6px_0_rgb(21,128,61)] hover:shadow-[0_3px_0_rgb(21,128,61)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all text-2xl transform scale-110 tracking-widest">[ Proceed to Round 5 ]</button>
          </div>
        </div>
        <div className="bg-yellow-100 border-t-4 border-yellow-300 px-8 py-5 flex justify-center items-center text-lg font-bold text-gray-800">
          <span>Round: <span className="text-emerald-700">4</span> of 7</span>
        </div>
      </div>
    </div>
  );
};

export default GameDistributionRound4Result;
