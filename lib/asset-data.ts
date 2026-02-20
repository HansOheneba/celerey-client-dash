// ============================================================================
// ASSET HOLDINGS & VALUATIONS
// ============================================================================

export type ValuationMethod = "manual" | "market";

export type AssetType =
  | "stock"
  | "bond"
  | "etf"
  | "mutual_fund"
  | "crypto"
  | "cash"
  | "alternative"
  | "other";

export const ASSET_TYPE_OPTIONS: { value: AssetType; label: string }[] = [
  { value: "stock", label: "Stock" },
  { value: "bond", label: "Bond" },
  { value: "etf", label: "ETF" },
  { value: "mutual_fund", label: "Mutual Fund" },
  { value: "crypto", label: "Crypto" },
  { value: "cash", label: "Cash & Equivalents" },
  { value: "alternative", label: "Alternative" },
  { value: "other", label: "Other" },
];

export type AssetHolding = {
  holding_id: string;
  user_id: string;
  asset_type: AssetType;
  valuation_method: ValuationMethod;
  initial_value: number;
  initial_value_date: string;
  symbol?: string;
  name: string;
  quantity?: number;
  average_cost?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AssetValuation = {
  valuation_id: string;
  holding_id: string;
  value: number;
  as_of: string;
  source: "manual" | "market";
  created_at: string;
};

// ── Helpers ─────────────────────────────────────────────────────
export function latestValuation(
  holdingId: string,
  valuations: AssetValuation[],
): AssetValuation | undefined {
  return valuations
    .filter((v) => v.holding_id === holdingId)
    .sort(
      (a, b) => new Date(b.as_of).getTime() - new Date(a.as_of).getTime(),
    )[0];
}

export function currentValue(
  holding: AssetHolding,
  valuations: AssetValuation[],
): number {
  const latest = latestValuation(holding.holding_id, valuations);
  return latest ? latest.value : holding.initial_value;
}

export function gainLoss(
  holding: AssetHolding,
  valuations: AssetValuation[],
): { amount: number; pct: number } {
  const current = currentValue(holding, valuations);
  const amount = current - holding.initial_value;
  const pct =
    holding.initial_value > 0 ? (amount / holding.initial_value) * 100 : 0;
  return { amount, pct };
}

export function assetTypeLabel(type: AssetType): string {
  return ASSET_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

// ── Whether asset type supports market pricing ──────────────────
export function supportsMarket(type: AssetType): boolean {
  return ["stock", "etf", "crypto", "mutual_fund"].includes(type);
}

// ── Popular symbol catalog ──────────────────────────────────────
export type SymbolInfo = {
  symbol: string;
  name: string;
  assetType: AssetType;
};

export const POPULAR_SYMBOLS: SymbolInfo[] = [
  // Stocks
  { symbol: "AAPL", name: "Apple Inc.", assetType: "stock" },
  { symbol: "MSFT", name: "Microsoft Corp.", assetType: "stock" },
  { symbol: "GOOGL", name: "Alphabet Inc.", assetType: "stock" },
  { symbol: "AMZN", name: "Amazon.com Inc.", assetType: "stock" },
  { symbol: "NVDA", name: "NVIDIA Corp.", assetType: "stock" },
  { symbol: "META", name: "Meta Platforms Inc.", assetType: "stock" },
  { symbol: "TSLA", name: "Tesla Inc.", assetType: "stock" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", assetType: "stock" },
  { symbol: "V", name: "Visa Inc.", assetType: "stock" },
  { symbol: "JNJ", name: "Johnson & Johnson", assetType: "stock" },
  { symbol: "WMT", name: "Walmart Inc.", assetType: "stock" },
  { symbol: "PG", name: "Procter & Gamble", assetType: "stock" },
  { symbol: "MA", name: "Mastercard Inc.", assetType: "stock" },
  { symbol: "UNH", name: "UnitedHealth Group", assetType: "stock" },
  { symbol: "KO", name: "Coca-Cola Co.", assetType: "stock" },
  { symbol: "DIS", name: "Walt Disney Co.", assetType: "stock" },
  { symbol: "NFLX", name: "Netflix Inc.", assetType: "stock" },
  { symbol: "AMD", name: "Advanced Micro Devices", assetType: "stock" },
  { symbol: "PYPL", name: "PayPal Holdings", assetType: "stock" },
  { symbol: "INTC", name: "Intel Corp.", assetType: "stock" },

  // ETFs
  { symbol: "VOO", name: "Vanguard S&P 500 ETF", assetType: "etf" },
  { symbol: "VTI", name: "Vanguard Total Stock Market ETF", assetType: "etf" },
  { symbol: "QQQ", name: "Invesco QQQ Trust", assetType: "etf" },
  { symbol: "SPY", name: "SPDR S&P 500 ETF Trust", assetType: "etf" },
  { symbol: "IWM", name: "iShares Russell 2000 ETF", assetType: "etf" },
  {
    symbol: "VEA",
    name: "Vanguard FTSE Developed Markets ETF",
    assetType: "etf",
  },
  {
    symbol: "VWO",
    name: "Vanguard FTSE Emerging Markets ETF",
    assetType: "etf",
  },
  { symbol: "BND", name: "Vanguard Total Bond Market ETF", assetType: "etf" },
  { symbol: "ARKK", name: "ARK Innovation ETF", assetType: "etf" },
  { symbol: "GLD", name: "SPDR Gold Shares", assetType: "etf" },
  { symbol: "VNQ", name: "Vanguard Real Estate ETF", assetType: "etf" },
  { symbol: "SCHD", name: "Schwab U.S. Dividend Equity ETF", assetType: "etf" },

  // Mutual Funds
  {
    symbol: "VFIAX",
    name: "Vanguard 500 Index Fund",
    assetType: "mutual_fund",
  },
  {
    symbol: "FXAIX",
    name: "Fidelity 500 Index Fund",
    assetType: "mutual_fund",
  },
  {
    symbol: "VTSAX",
    name: "Vanguard Total Stock Market Index",
    assetType: "mutual_fund",
  },
  {
    symbol: "VBTLX",
    name: "Vanguard Total Bond Market Index",
    assetType: "mutual_fund",
  },
  {
    symbol: "VWELX",
    name: "Vanguard Wellington Fund",
    assetType: "mutual_fund",
  },
  {
    symbol: "SWPPX",
    name: "Schwab S&P 500 Index Fund",
    assetType: "mutual_fund",
  },

  // Crypto
  { symbol: "BTC", name: "Bitcoin", assetType: "crypto" },
  { symbol: "ETH", name: "Ethereum", assetType: "crypto" },
  { symbol: "SOL", name: "Solana", assetType: "crypto" },
  { symbol: "BNB", name: "BNB", assetType: "crypto" },
  { symbol: "XRP", name: "XRP", assetType: "crypto" },
  { symbol: "ADA", name: "Cardano", assetType: "crypto" },
  { symbol: "DOGE", name: "Dogecoin", assetType: "crypto" },
  { symbol: "AVAX", name: "Avalanche", assetType: "crypto" },
  { symbol: "DOT", name: "Polkadot", assetType: "crypto" },
  { symbol: "MATIC", name: "Polygon", assetType: "crypto" },
];

/** Symbols filtered by asset type */
export function symbolsForType(type: AssetType): SymbolInfo[] {
  return POPULAR_SYMBOLS.filter((s) => s.assetType === type);
}

/** Check if a symbol is already held */
export function isSymbolHeld(
  symbol: string,
  holdings: AssetHolding[],
  excludeHoldingId?: string,
): boolean {
  return holdings.some(
    (h) =>
      h.is_active &&
      h.symbol?.toUpperCase() === symbol.toUpperCase() &&
      h.holding_id !== excludeHoldingId,
  );
}

/** Find holding by id */
export function findHolding(
  id: string,
  holdings: AssetHolding[],
): AssetHolding | undefined {
  return holdings.find((h) => h.holding_id === id);
}

// ── Mock data ───────────────────────────────────────────────────
const now = new Date().toISOString();

export const mockHoldings: AssetHolding[] = [
  {
    holding_id: "h-1",
    user_id: "u-1",
    asset_type: "stock",
    valuation_method: "market",
    initial_value: 100000,
    initial_value_date: "2024-01-15",
    symbol: "AAPL",
    name: "Apple Inc.",
    quantity: 200,
    average_cost: 150,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    holding_id: "h-2",
    user_id: "u-1",
    asset_type: "etf",
    valuation_method: "market",
    initial_value: 250000,
    initial_value_date: "2023-06-01",
    symbol: "VOO",
    name: "Vanguard S&P 500 ETF",
    quantity: 500,
    average_cost: 400,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    holding_id: "h-3",
    user_id: "u-1",
    asset_type: "bond",
    valuation_method: "manual",
    initial_value: 312500,
    initial_value_date: "2022-11-01",
    name: "Government Bond Portfolio",
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    holding_id: "h-4",
    user_id: "u-1",
    asset_type: "cash",
    valuation_method: "manual",
    initial_value: 125000,
    initial_value_date: "2025-01-01",
    name: "High-Yield Savings",
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    holding_id: "h-5",
    user_id: "u-1",
    asset_type: "alternative",
    valuation_method: "manual",
    initial_value: 50000,
    initial_value_date: "2024-03-10",
    name: "Private Equity Fund",
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    holding_id: "h-6",
    user_id: "u-1",
    asset_type: "crypto",
    valuation_method: "market",
    initial_value: 30000,
    initial_value_date: "2024-08-01",
    symbol: "BTC",
    name: "Bitcoin",
    quantity: 0.45,
    average_cost: 66667,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
];

export const mockValuations: AssetValuation[] = [
  {
    valuation_id: "v-1",
    holding_id: "h-1",
    value: 180000,
    as_of: "2026-02-01",
    source: "market",
    created_at: now,
  },
  {
    valuation_id: "v-2",
    holding_id: "h-2",
    value: 310000,
    as_of: "2026-02-01",
    source: "market",
    created_at: now,
  },
  {
    valuation_id: "v-3",
    holding_id: "h-3",
    value: 320000,
    as_of: "2026-01-15",
    source: "manual",
    created_at: now,
  },
  {
    valuation_id: "v-4",
    holding_id: "h-4",
    value: 128000,
    as_of: "2026-02-01",
    source: "manual",
    created_at: now,
  },
  {
    valuation_id: "v-5",
    holding_id: "h-5",
    value: 62500,
    as_of: "2026-01-01",
    source: "manual",
    created_at: now,
  },
  {
    valuation_id: "v-6",
    holding_id: "h-6",
    value: 45000,
    as_of: "2026-02-01",
    source: "market",
    created_at: now,
  },
];
