import Link from "next/link";
import Image from "next/image";
import NavItems from "@/components/NavItems";
import UserDropdown from "@/components/UserDropdown";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import { getPortfolioSymbolsByEmail } from "@/lib/actions/portfolio.actions";

const Header = async ({ user }: { user: User }) => {
    const [initialStocks, portfolioSymbols] = await Promise.all([
        searchStocks(),
        getPortfolioSymbolsByEmail(user.email),
    ]);

    const symbolSet = new Set(portfolioSymbols);
    const enrichedStocks = initialStocks.map((s) => ({
        ...s,
        isInWatchlist: symbolSet.has(s.symbol),
    }));

    return (
        <header className="sticky top-0 header">
            <div className="container header-wrapper">
                <Link href="/">
                    {/* Money logo */}
                    <Image src="/assets/icons/money.svg" alt="Moneylogo" width={140} height={32} className="h-8 w-auto cursor-pointer" />
                </Link>
                <nav className="hidden sm:block">
                    <NavItems initialStocks={enrichedStocks} />
                </nav>

                <UserDropdown user={user} initialStocks={enrichedStocks} />
            </div>
        </header>
    )
}
export default Header
