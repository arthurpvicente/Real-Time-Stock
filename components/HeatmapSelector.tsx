"use client";

import TradingViewWidget from "@/components/TradingViewWidget";

const CONFIG = {
  dataSource: "SPX500",
  blockSize: "market_cap_basic",
  blockColor: "change",
  grouping: "sector",
  isTransparent: true,
  locale: "en",
  symbolUrl: "",
  colorTheme: "dark",
  exchanges: [],
  hasTopBar: true,
  isDataSetEnabled: true,
  isZoomEnabled: true,
  hasSymbolTooltip: true,
  isMonoSize: false,
  width: "100%",
  height: "600",
};

const SCRIPT_URL = "https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js";

export default function HeatmapSelector() {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold text-2xl text-gray-100">Stock Heatmap</h3>
      <TradingViewWidget
        scriptUrl={SCRIPT_URL}
        config={CONFIG}
        height={600}
      />
    </div>
  );
}
