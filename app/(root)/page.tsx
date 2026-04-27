import { headers } from "next/headers";
import TradingViewWidget from "@/components/TradingViewWidget";
import StockCard from "@/components/StockCard";
import HeatmapSelector from "@/components/HeatmapSelector";
import { auth } from "@/lib/better-auth/auth";
import { searchStocks, getStockQuote } from "@/lib/actions/finnhub.actions";
import { getPortfolioSymbolsByEmail } from "@/lib/actions/portfolio.actions";
import {
    MARKET_DATA_WIDGET_CONFIG,
    MARKET_OVERVIEW_WIDGET_CONFIG,
    TOP_STORIES_WIDGET_CONFIG
} from "@/lib/constants";

const Home = async () => {
    const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;

    const session = await auth.api.getSession({ headers: await headers() });

    const [stocks, portfolioSymbols] = await Promise.all([
        searchStocks(),
        session?.user ? getPortfolioSymbolsByEmail(session.user.email) : Promise.resolve([]),
    ]);

    const portfolioSet = new Set(portfolioSymbols);

    const stocksWithQuotes = await Promise.all(
        stocks.map(async (stock) => {
            const quote = await getStockQuote(stock.symbol);
            return {
                ...stock,
                price: quote?.c ?? null,
                change: quote?.dp ?? null,
                isInPortfolio: portfolioSet.has(stock.symbol),
            };
        })
    );

    return (
        <div className="flex min-h-screen home-wrapper">
            <section className="w-full">
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Popular Stocks</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {stocksWithQuotes.map((stock) => (
                        <StockCard
                            key={stock.symbol}
                            symbol={stock.symbol}
                            name={stock.name}
                            price={stock.price}
                            change={stock.change}
                            isInPortfolio={stock.isInPortfolio}
                        />
                    ))}
                </div>
            </section>

            <section className="grid w-full gap-8 home-section">
                <div className="md:col-span-1 xl:col-span-1">
                    <TradingViewWidget
                        title="Market Overview"
                        scriptUrl={`${scriptUrl}market-overview.js`}
                        config={MARKET_OVERVIEW_WIDGET_CONFIG}
                        className="custom-chart"
                        height={600}
                    />
                </div>
                <div className="md-col-span xl:col-span-2">
                    <HeatmapSelector />
                </div>
            </section>

            <section className="grid w-full gap-8 home-section">
                <div className="h-full md:col-span-1 xl:col-span-1">
                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}timeline.js`}
                        config={TOP_STORIES_WIDGET_CONFIG}
                        height={600}
                    />
                </div>
                <div className="h-full md:col-span-1 xl:col-span-2">
                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}market-quotes.js`}
                        config={MARKET_DATA_WIDGET_CONFIG}
                        height={600}
                    />
                </div>
            </section>
        </div>
    );
};

export default Home;
