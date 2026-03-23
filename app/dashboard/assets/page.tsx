"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartPie,
  faChartLine,
  faWallet,
  faArrowTrendUp,
  faArrowTrendDown,
  faPlus,
  faPencil,
  faTrash,
  faRotate,
  faInfoCircle,
  faTriangleExclamation,
  faCoins,
  faBitcoinSign,
  faBuilding,
  faLandmark,
  faSackDollar,
  faBoxArchive,
  faLayerGroup,
  faChevronDown,
  faChevronUp,
  faBroadcastTower,
  faClockRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

import { KpiStrip } from "@/components/dashboard/kpi-strip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  formatCurrency,
  currentValue,
  assetTypeLabel,
  supportsMarket,
  ASSET_TYPE_OPTIONS,
  POPULAR_SYMBOLS,
  selectPerformanceMetrics,
  type AssetHolding,
  type AssetValuation,
  type AssetType,
  type ValuationMethod,
} from "@/lib/client-data";
import { useFinancialStore } from "@/store/financialStore";

// ─── Constants ─────────────────────────────────────────────────────────────────

const NAVY = "#151339";
const ALLOCATION_COLORS = [
  "#151339",
  "#2d5282",
  "#3b6cb5",
  "#7eb8e8",
  "#a8d4f5",
  "#c3e2fa",
];

// Cache duration: 2 hours in ms
const PRICE_CACHE_TTL_MS = 2 * 60 * 60 * 1000;
const PRICE_CACHE_KEY = "asset_live_prices_v1";

const ASSET_TYPE_ICONS: Record<AssetType, any> = {
  stock: faChartLine,
  etf: faLayerGroup,
  mutual_fund: faBuilding,
  bond: faLandmark,
  crypto: faBitcoinSign,
  cash: faWallet,
  alternative: faBoxArchive,
  other: faCoins,
};

const COINGECKO_ID_MAP: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
  AVAX: "avalanche-2",
  DOT: "polkadot",
  MATIC: "matic-network",
};

// ─── Types ─────────────────────────────────────────────────────────────────────

type LivePrices = Record<string, number | null>;

interface PriceCacheEntry {
  prices: LivePrices;
  fetchedAt: number; // epoch ms
}

interface HoldingDraft {
  name: string;
  asset_type: AssetType;
  valuation_method: ValuationMethod;
  symbol: string;
  quantity: string;
  average_cost: string;
  manual_value: string;
  note: string;
}

const defaultDraft: HoldingDraft = {
  name: "",
  asset_type: "stock",
  valuation_method: "market",
  symbol: "",
  quantity: "",
  average_cost: "",
  manual_value: "",
  note: "",
};

// ─── Cache helpers ─────────────────────────────────────────────────────────────

function readPriceCache(): PriceCacheEntry | null {
  try {
    const raw = localStorage.getItem(PRICE_CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as PriceCacheEntry;
    if (Date.now() - entry.fetchedAt > PRICE_CACHE_TTL_MS) return null;
    return entry;
  } catch {
    return null;
  }
}

function writePriceCache(prices: LivePrices) {
  try {
    const entry: PriceCacheEntry = { prices, fetchedAt: Date.now() };
    localStorage.setItem(PRICE_CACHE_KEY, JSON.stringify(entry));
  } catch {
    /* noop */
  }
}

// ─── Live Price Hook ───────────────────────────────────────────────────────────

function useLivePrices(holdings: AssetHolding[]) {
  const [prices, setPrices] = React.useState<LivePrices>({});
  const [loading, setLoading] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);
  const [fromCache, setFromCache] = React.useState(false);

  const fetchPrices = React.useCallback(
    async (forceRefresh = false) => {
      // Check cache first unless forcing refresh
      if (!forceRefresh) {
        const cached = readPriceCache();
        if (cached) {
          setPrices(cached.prices);
          setLastUpdated(new Date(cached.fetchedAt));
          setFromCache(true);
          return;
        }
      }

      setLoading(true);
      setFromCache(false);
      const newPrices: LivePrices = {};

      // Only fetch crypto — CoinGecko free tier, no API key needed
      const cryptoHoldings = holdings.filter(
        (h) =>
          h.is_active &&
          h.asset_type === "crypto" &&
          h.symbol &&
          COINGECKO_ID_MAP[h.symbol],
      );

      if (cryptoHoldings.length > 0) {
        const ids = [
          ...new Set(
            cryptoHoldings
              .map((h) => COINGECKO_ID_MAP[h.symbol!])
              .filter(Boolean),
          ),
        ].join(",");

        try {
          const res = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
            { signal: AbortSignal.timeout(8000) },
          );
          if (res.ok) {
            const data = await res.json();
            cryptoHoldings.forEach((h) => {
              const geckoId = COINGECKO_ID_MAP[h.symbol!];
              if (geckoId && data[geckoId]?.usd) {
                newPrices[h.holding_id] = data[geckoId].usd;
              }
            });
          }
        } catch {
          // Silently fall back to stored valuations — don't crash on API error
        }
      }

      writePriceCache(newPrices);
      setPrices(newPrices);
      setLastUpdated(new Date());
      setLoading(false);
    },
    [holdings],
  );

  // On mount: load from cache or fetch once
  React.useEffect(() => {
    fetchPrices(false);
  }, [fetchPrices]);

  return {
    prices,
    loading,
    lastUpdated,
    fromCache,
    refresh: () => fetchPrices(true),
  };
}

// ─── Value helpers ─────────────────────────────────────────────────────────────

function getLiveValue(
  holding: AssetHolding,
  valuations: AssetValuation[],
  livePrices: LivePrices,
): number {
  const livePrice = livePrices[holding.holding_id];
  if (livePrice != null && holding.quantity)
    return livePrice * holding.quantity;
  return currentValue(holding, valuations);
}

function getLiveGainLoss(
  holding: AssetHolding,
  valuations: AssetValuation[],
  livePrices: LivePrices,
): { amount: number; pct: number } {
  const cv = getLiveValue(holding, valuations, livePrices);
  const cost =
    holding.average_cost && holding.quantity
      ? holding.average_cost * holding.quantity
      : holding.initial_value;
  const amount = cv - cost;
  const pct = cost > 0 ? (amount / cost) * 100 : 0;
  return { amount, pct };
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function InfoTip({ content }: { content: string }) {
  return (
    <UITooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help inline-flex">
          <FontAwesomeIcon
            icon={faInfoCircle}
            className="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors"
          />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-55 text-xs">{content}</TooltipContent>
    </UITooltip>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
      {children}
    </p>
  );
}

// ─── Add / Edit Dialog ─────────────────────────────────────────────────────────

function AddHoldingDialog({
  open,
  onClose,
  onSave,
  editHolding,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (h: AssetHolding, val?: AssetValuation) => void;
  editHolding?: AssetHolding | null;
}) {
  const [draft, setDraft] = React.useState<HoldingDraft>(defaultDraft);

  React.useEffect(() => {
    if (!open) return;
    if (editHolding) {
      setDraft({
        name: editHolding.name,
        asset_type: editHolding.asset_type,
        valuation_method: editHolding.valuation_method,
        symbol: editHolding.symbol ?? "",
        quantity: editHolding.quantity ? String(editHolding.quantity) : "",
        average_cost: editHolding.average_cost
          ? String(editHolding.average_cost)
          : "",
        manual_value: String(editHolding.initial_value),
        note: "",
      });
    } else {
      setDraft(defaultDraft);
    }
  }, [open, editHolding]);

  const isMarket =
    supportsMarket(draft.asset_type) && draft.valuation_method === "market";

  function handleSymbolChange(sym: string) {
    const upper = sym.toUpperCase();
    const known = POPULAR_SYMBOLS.find((s) => s.symbol === upper);
    setDraft((d) => ({
      ...d,
      symbol: upper,
      name: known ? known.name : d.name,
      asset_type: known ? known.assetType : d.asset_type,
    }));
  }

  function handleSave() {
    const now = new Date().toISOString();
    const id = editHolding?.holding_id ?? `h-${Date.now()}`;

    const holding: AssetHolding = {
      holding_id: id,
      user_id: "u-1",
      asset_type: draft.asset_type,
      valuation_method: isMarket ? "market" : "manual",
      initial_value: isMarket
        ? Number(draft.quantity) * Number(draft.average_cost) || 0
        : Number(draft.manual_value),
      initial_value_date: now.slice(0, 10),
      symbol: draft.symbol || undefined,
      name: draft.name || draft.symbol || "Unnamed",
      quantity: draft.quantity ? Number(draft.quantity) : undefined,
      average_cost: draft.average_cost ? Number(draft.average_cost) : undefined,
      is_active: true,
      created_at: editHolding?.created_at ?? now,
      updated_at: now,
    };

    let valuation: AssetValuation | undefined;
    if (!isMarket && draft.manual_value) {
      valuation = {
        valuation_id: `val-${Date.now()}`,
        holding_id: id,
        value: Number(draft.manual_value),
        as_of: now.slice(0, 10),
        source: "manual",
        created_at: now,
      };
    }

    onSave(holding, valuation);
    onClose();
  }

  const popularForType = POPULAR_SYMBOLS.filter(
    (s) => s.assetType === draft.asset_type,
  ).slice(0, 6);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <FontAwesomeIcon
              icon={faPlus}
              className="h-4 w-4"
              style={{ color: "#151339" }}
            />
            {editHolding ? "Edit holding" : "Add holding"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Asset type picker */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Asset type</Label>
            <div className="grid grid-cols-4 gap-2">
              {ASSET_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      asset_type: opt.value,
                      valuation_method: supportsMarket(opt.value)
                        ? "market"
                        : "manual",
                      symbol: "",
                    }))
                  }
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                    draft.asset_type === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted bg-background text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={ASSET_TYPE_ICONS[opt.value]}
                    className="h-3.5 w-3.5"
                  />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Valuation method toggle (only for market-capable types) */}
          {supportsMarket(draft.asset_type) && (
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Valuation method</Label>
              <div className="flex items-center gap-1 text-xs">
                {(["market", "manual"] as ValuationMethod[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() =>
                      setDraft((d) => ({ ...d, valuation_method: m }))
                    }
                    className={`px-3 py-1 rounded-md transition-colors ${
                      draft.valuation_method === m
                        ? "text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                    style={
                      draft.valuation_method === m
                        ? { backgroundColor: "#151339" }
                        : {}
                    }
                  >
                    {m === "market" ? "Live price" : "Manual"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Symbol (market assets with live pricing) */}
          {isMarket && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Ticker / Symbol</Label>
              <Input
                placeholder="e.g. AAPL, BTC, VOO"
                value={draft.symbol}
                onChange={(e) => handleSymbolChange(e.target.value)}
                className="uppercase font-mono"
              />
              {popularForType.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {popularForType.map((s) => (
                    <button
                      key={s.symbol}
                      type="button"
                      onClick={() => handleSymbolChange(s.symbol)}
                      className="text-xs px-2 py-0.5 rounded-full border border-muted hover:border-primary hover:text-primary transition-colors font-mono"
                    >
                      {s.symbol}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <FontAwesomeIcon
                  icon={faBroadcastTower}
                  className="h-2.5 w-2.5"
                />
                Crypto prices update live from 3rd party sources. Stocks
                require manual update for now.
              </p>
            </div>
          )}

          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Name / Description</Label>
            <Input
              placeholder={
                draft.asset_type === "bond"
                  ? "e.g. US Treasury 10yr"
                  : draft.asset_type === "cash"
                    ? "e.g. High-Yield Savings"
                    : draft.asset_type === "alternative"
                      ? "e.g. Private Equity Fund"
                      : "e.g. Apple Inc."
              }
              value={draft.name}
              onChange={(e) =>
                setDraft((d) => ({ ...d, name: e.target.value }))
              }
            />
          </div>

          {/* Quantity + avg cost (market) OR manual value */}
          {isMarket ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Quantity / Units
                </Label>
                <Input
                  type="number"
                  placeholder="e.g. 200"
                  value={draft.quantity}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, quantity: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  We multiply this by the live price
                </p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  Avg. cost per unit
                  <InfoTip content="Your average purchase price per share/coin. Used to calculate your gain or loss vs current market price." />
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="pl-6"
                    value={draft.average_cost}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, average_cost: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1">
                Current value
                <InfoTip
                  content={
                    draft.asset_type === "bond"
                      ? "Enter the current face or market value of this bond position from your latest statement."
                      : draft.asset_type === "cash"
                        ? "Enter the current account balance."
                        : draft.asset_type === "alternative"
                          ? "Enter the last known value from your fund statement or capital account."
                          : "Enter the current estimated value of this asset."
                  }
                />
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  placeholder="0"
                  className="pl-6"
                  value={draft.manual_value}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, manual_value: e.target.value }))
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <FontAwesomeIcon icon={faInfoCircle} className="h-2.5 w-2.5" />
                {draft.asset_type === "bond"
                  ? "Update when you receive your bond statement."
                  : draft.asset_type === "alternative"
                    ? "Update from your quarterly capital account statement."
                    : "You can update this value at any time."}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!draft.name && !draft.symbol}>
            {editHolding ? "Save changes" : "Add holding"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Chart tooltip ─────────────────────────────────────────────────────────────

function ChartTooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background px-3 py-2.5 text-xs space-y-1 min-w-40">
      <p className="font-semibold text-foreground">{label}</p>
      {payload.map((p: any) => (
        <div
          key={p.dataKey}
          className="flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-muted-foreground">{p.name}</span>
          </div>
          <span className="font-medium">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Allocation donut ──────────────────────────────────────────────────────────

function AllocationDonut({
  data,
}: {
  data: { label: string; value: number; percentage: number }[];
}) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <div className="relative shrink-0">
        <PieChart width={180} height={180}>
          <Pie
            data={data}
            cx={90}
            cy={90}
            innerRadius={55}
            outerRadius={80}
            dataKey="value"
            onMouseEnter={(_, i) => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={ALLOCATION_COLORS[i % ALLOCATION_COLORS.length]}
                opacity={activeIndex === null || activeIndex === i ? 1 : 0.35}
                stroke="none"
              />
            ))}
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-sm font-bold">{formatCurrency(total)}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-2 w-full">
        {data.map((slice, i) => (
          <div
            key={slice.label}
            className={`flex items-center gap-3 cursor-default transition-opacity ${
              activeIndex !== null && activeIndex !== i ? "opacity-40" : ""
            }`}
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
              style={{
                backgroundColor:
                  ALLOCATION_COLORS[i % ALLOCATION_COLORS.length],
              }}
            />
            <span className="text-xs text-muted-foreground flex-1">
              {slice.label}
            </span>
            <span className="text-xs font-medium tabular-nums">
              {formatCurrency(slice.value)}
            </span>
            <span className="text-xs text-muted-foreground w-10 text-right">
              {slice.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Holding row ───────────────────────────────────────────────────────────────

function HoldingRow({
  holding,
  valuations,
  livePrices,
  totalPortfolio,
  onEdit,
  onDelete,
}: {
  holding: AssetHolding;
  valuations: AssetValuation[];
  livePrices: LivePrices;
  totalPortfolio: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const value = getLiveValue(holding, valuations, livePrices);
  const gl = getLiveGainLoss(holding, valuations, livePrices);
  const pct = totalPortfolio > 0 ? (value / totalPortfolio) * 100 : 0;
  const hasLivePrice = livePrices[holding.holding_id] != null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="border rounded-lg overflow-hidden"
    >
      {/* Main row */}
      <div
        className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Icon */}
        <div
          className="p-2 rounded-lg shrink-0"
          style={{ backgroundColor: "#15133914" }}
        >
          <FontAwesomeIcon
            icon={ASSET_TYPE_ICONS[holding.asset_type]}
            className="h-3.5 w-3.5"
            style={{ color: "#151339" }}
          />
        </div>

        {/* Name + badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold truncate">{holding.name}</p>
            {holding.symbol && (
              <Badge
                variant="outline"
                className="text-xs font-mono px-1.5 py-0 shrink-0"
              >
                {holding.symbol}
              </Badge>
            )}
            {hasLivePrice && (
              <Badge
                variant="outline"
                className="text-xs gap-1 py-0 shrink-0"
                style={{
                  color: "#10b981",
                  borderColor: "#a7f3d0",
                  backgroundColor: "#f0fdf4",
                }}
              >
                <FontAwesomeIcon icon={faBroadcastTower} className="h-2 w-2" />{" "}
                Live
              </Badge>
            )}
            {holding.valuation_method === "manual" && (
              <Badge
                variant="outline"
                className="text-xs gap-1 py-0 shrink-0"
                style={{
                  color: "#d97706",
                  borderColor: "#fde68a",
                  backgroundColor: "#fffbeb",
                }}
              >
                Manual
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground capitalize">
            {assetTypeLabel(holding.asset_type)}
          </p>
        </div>

        {/* Portfolio % bar */}
        <div className="hidden md:flex flex-col gap-1 w-24 shrink-0">
          <Progress value={pct} className="h-1.5" />
          <p className="text-xs text-muted-foreground text-right">
            {pct.toFixed(1)}%
          </p>
        </div>

        {/* Gain / loss */}
        <div className="hidden sm:flex flex-col items-end shrink-0 w-24">
          <span
            className="text-xs font-medium"
            style={{ color: gl.amount >= 0 ? "#10b981" : "#ef4444" }}
          >
            {gl.amount >= 0 ? "+" : ""}
            {formatCurrency(gl.amount)}
          </span>
          <span
            className="text-xs"
            style={{ color: gl.pct >= 0 ? "#10b981" : "#ef4444" }}
          >
            {gl.pct >= 0 ? "+" : ""}
            {gl.pct.toFixed(2)}%
          </span>
        </div>

        {/* Current value */}
        <div className="text-right shrink-0 w-28">
          <p className="text-sm font-bold tabular-nums">
            {formatCurrency(value)}
          </p>
        </div>

        <FontAwesomeIcon
          icon={expanded ? faChevronUp : faChevronDown}
          className="h-3 w-3 text-muted-foreground shrink-0"
        />
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-3 border-t bg-muted/20 space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {holding.quantity != null && (
                  <div>
                    <p className="text-xs text-muted-foreground">Quantity</p>
                    <p className="text-sm font-semibold">
                      {holding.quantity.toLocaleString()}
                    </p>
                  </div>
                )}
                {holding.average_cost != null && (
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      Avg. cost{" "}
                      <InfoTip content="Your average purchase price per unit, used to calculate gain/loss." />
                    </p>
                    <p className="text-sm font-semibold">
                      {formatCurrency(holding.average_cost)}
                    </p>
                  </div>
                )}
                {holding.quantity != null && holding.average_cost != null && (
                  <div>
                    <p className="text-xs text-muted-foreground">Cost basis</p>
                    <p className="text-sm font-semibold">
                      {formatCurrency(holding.quantity * holding.average_cost)}
                    </p>
                  </div>
                )}
                {hasLivePrice && holding.quantity != null && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Live price / unit
                    </p>
                    <p className="text-sm font-semibold">
                      {formatCurrency(livePrices[holding.holding_id]!)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Held since</p>
                  <p className="text-sm font-semibold">
                    {new Date(holding.initial_value_date).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Valuation</p>
                  <p className="text-sm font-semibold capitalize">
                    {holding.valuation_method}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs gap-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <FontAwesomeIcon icon={faPencil} className="h-3 w-3" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} className="h-3 w-3" /> Remove
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyHoldings({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center space-y-4"
    >
      <div className="p-4 rounded-full bg-muted">
        <FontAwesomeIcon
          icon={faChartPie}
          className="h-8 w-8 text-muted-foreground"
        />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold">No assets added yet</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Add your investments, savings, or other assets to track your
          portfolio.
        </p>
      </div>
      <Button size="sm" className="gap-1.5" onClick={onAdd}>
        <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
        Add asset
      </Button>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AssetsPage() {
  const [holdings, setHoldings] = React.useState<AssetHolding[]>(() =>
    useFinancialStore.getState().holdings.filter((h) => h.is_active),
  );
  const [valuations, setValuations] = React.useState<AssetValuation[]>([]);

  const storePortfolioPerformance = useFinancialStore(
    (s) => s.portfolioPerformance,
  );
  const storeAccounts = useFinancialStore((s) => s.accounts);
  const [addOpen, setAddOpen] = React.useState(false);
  const [editHolding, setEditHolding] = React.useState<AssetHolding | null>(
    null,
  );
  const [filterType, setFilterType] = React.useState<AssetType | "all">("all");
  const [sortBy, setSortBy] = React.useState<"value" | "gain">("value");

  const {
    prices: livePrices,
    loading: pricesLoading,
    lastUpdated,
    fromCache,
    refresh,
  } = useLivePrices(holdings);

  // ── Derived values ────────────────────────────────────────────────────────

  const totalPortfolioValue = React.useMemo(
    () =>
      holdings.reduce((s, h) => s + getLiveValue(h, valuations, livePrices), 0),
    [holdings, valuations, livePrices],
  );

  const totalCostBasis = React.useMemo(
    () =>
      holdings.reduce((s, h) => {
        const cost =
          h.average_cost && h.quantity
            ? h.average_cost * h.quantity
            : h.initial_value;
        return s + cost;
      }, 0),
    [holdings],
  );

  const totalGainLoss = totalPortfolioValue - totalCostBasis;
  const totalGainPct =
    totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;

  const perfMetrics = React.useMemo(
    () => selectPerformanceMetrics(storePortfolioPerformance),
    [storePortfolioPerformance],
  );

  // Allocation breakdown by asset type — derived from holdings + live prices
  const allocationByType = React.useMemo(() => {
    const map = new Map<string, number>();
    holdings.forEach((h) => {
      const v = getLiveValue(h, valuations, livePrices);
      const label = assetTypeLabel(h.asset_type);
      map.set(label, (map.get(label) ?? 0) + v);
    });
    return [...map.entries()]
      .map(([label, value]) => ({
        label,
        value,
        percentage:
          totalPortfolioValue > 0 ? (value / totalPortfolioValue) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [holdings, valuations, livePrices, totalPortfolioValue]);

  // Performance chart — from store portfolioPerformance
  const perfChartData = React.useMemo(
    () =>
      [...storePortfolioPerformance]
        .sort((a, b) => a.month.localeCompare(b.month))
        .map((p) => ({
          label: new Date(p.month + "-01").toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          }),
          value: p.value,
          contributions: p.contributions,
        })),
    [storePortfolioPerformance],
  );

  // Filtered + sorted holdings
  const filteredHoldings = React.useMemo(() => {
    let list = holdings;
    if (filterType !== "all")
      list = list.filter((h) => h.asset_type === filterType);
    return [...list].sort((a, b) =>
      sortBy === "value"
        ? getLiveValue(b, valuations, livePrices) -
          getLiveValue(a, valuations, livePrices)
        : getLiveGainLoss(b, valuations, livePrices).pct -
          getLiveGainLoss(a, valuations, livePrices).pct,
    );
  }, [holdings, valuations, livePrices, filterType, sortBy]);

  // Unique asset types present in holdings (for filter buttons)
  const presentTypes = React.useMemo(
    () => [...new Set(holdings.map((h) => h.asset_type))],
    [holdings],
  );

  // Account totals by type — derived from store accounts
  const accountsByType = React.useMemo(() => {
    const map = new Map<string, typeof storeAccounts>();
    storeAccounts.forEach((acc) => {
      const list = map.get(acc.type) ?? [];
      list.push(acc);
      map.set(acc.type, list);
    });
    return [...map.entries()];
  }, [storeAccounts]);

  const totalAccountsValue = React.useMemo(
    () => storeAccounts.reduce((s, a) => s + a.balance, 0),
    [storeAccounts],
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleSaveHolding(h: AssetHolding, val?: AssetValuation) {
    const exists = holdings.find((x) => x.holding_id === h.holding_id);
    const updatedHoldings = exists
      ? holdings.map((x) => (x.holding_id === h.holding_id ? h : x))
      : [...holdings, h];
    setHoldings(updatedHoldings);
    useFinancialStore.getState().setHoldings(updatedHoldings);
    if (val) {
      setValuations((prev) => [
        ...prev.filter((v) => v.holding_id !== val.holding_id),
        val,
      ]);
    }
    setEditHolding(null);
  }

  function handleDelete(holdingId: string) {
    const updatedHoldings = holdings.filter((h) => h.holding_id !== holdingId);
    setHoldings(updatedHoldings);
    useFinancialStore.getState().setHoldings(updatedHoldings);
  }

  // ── KPI strip ─────────────────────────────────────────────────────────────

  const kpiItems = [
    {
      label: "Portfolio Value",
      value: formatCurrency(totalPortfolioValue),
      subline: `${holdings.length} holding${holdings.length !== 1 ? "s" : ""}`,
      tone: "neutral" as const,
    },
    {
      label: "Total Gain / Loss",
      value: `${totalGainLoss >= 0 ? "+" : ""}${formatCurrency(totalGainLoss)}`,
      subline: `${totalGainPct >= 0 ? "+" : ""}${totalGainPct.toFixed(2)}% on cost basis`,
      tone: totalGainLoss >= 0 ? ("good" as const) : ("danger" as const),
    },
    {
      label: "YTD Return",
      value:
        perfMetrics.ytdReturnPct != null
          ? `${perfMetrics.ytdReturnPct >= 0 ? "+" : ""}${perfMetrics.ytdReturnPct.toFixed(2)}%`
          : "—",
      subline: "Year to date",
      tone:
        (perfMetrics.ytdReturnPct ?? 0) >= 0
          ? ("good" as const)
          : ("danger" as const),
    },
    {
      label: "Total Contributed",
      value: formatCurrency(perfMetrics.totalContributions),
      subline: `${formatCurrency(perfMetrics.totalGrowth)} growth`,
      tone: "neutral" as const,
    },
  ];

  // ── Animation variants ────────────────────────────────────────────────────

  const mc = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.07, delayChildren: 0.04 },
    },
  };
  const mi = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.32 } },
  };

  return (
    <TooltipProvider>
      <motion.div
        initial="hidden"
        animate="show"
        variants={mc}
        className="w-full"
      >
        <div className="mx-auto px-6 py-8 space-y-8">
          {/* ── Header ── */}
          <motion.div
            variants={mi}
            className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Assets
                </h1>
                <p className="text-sm text-muted-foreground">
                  Your investment portfolio and holdings
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {lastUpdated && (
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <FontAwesomeIcon
                    icon={faClockRotateLeft}
                    className="h-3 w-3"
                  />
                  {fromCache ? "Cached · " : "Live · "}
                  {lastUpdated.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={refresh}
                disabled={pricesLoading}
              >
                <FontAwesomeIcon
                  icon={faRotate}
                  className={`h-3 w-3 ${pricesLoading ? "animate-spin" : ""}`}
                />
                {pricesLoading ? "Refreshing…" : "Refresh prices"}
              </Button>
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  setEditHolding(null);
                  setAddOpen(true);
                }}
              >
                <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                Add holding
              </Button>
            </div>
          </motion.div>

          {/* ── KPI Strip ── */}
          <motion.div variants={mi}>
            <KpiStrip cols={4} items={kpiItems} />
          </motion.div>

          {/* ── Allocation + Performance (only when holdings exist) ── */}
          {holdings.length > 0 && (
            <motion.div
              variants={mi}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Allocation donut */}
              <div>
                <SectionLabel>Allocation</SectionLabel>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faChartPie}
                        className="h-4 w-4 text-primary"
                      />
                      Portfolio breakdown
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      By asset type · live values
                    </p>
                  </CardHeader>
                  <CardContent>
                    <AllocationDonut data={allocationByType} />
                  </CardContent>
                </Card>
              </div>

              {/* Performance chart */}
              <div>
                <SectionLabel>Performance</SectionLabel>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faChartLine}
                        className="h-4 w-4 text-primary"
                      />
                      Portfolio value over time
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {storePortfolioPerformance.length} months of history
                    </p>
                  </CardHeader>
                  <CardContent className="px-2 sm:px-6">
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart
                        data={perfChartData}
                        margin={{ left: 8, right: 8, top: 4, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="perfGrad"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#151339"
                              stopOpacity={0.25}
                            />
                            <stop
                              offset="95%"
                              stopColor="#151339"
                              stopOpacity={0.02}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          vertical={false}
                          strokeDasharray="3 3"
                          stroke="currentColor"
                          strokeOpacity={0.1}
                        />
                        <XAxis
                          dataKey="label"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          tick={{ fontSize: 10 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          tick={{ fontSize: 10 }}
                          tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                          width={52}
                        />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Area
                          dataKey="value"
                          name="Portfolio value"
                          stroke="#151339"
                          strokeWidth={2}
                          fill="url(#perfGrad)"
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* ── Holdings list ── */}
          <motion.div variants={mi}>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
              <SectionLabel>Holdings</SectionLabel>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Type filter pills */}
                <div className="flex items-center gap-1 text-xs flex-wrap">
                  <button
                    onClick={() => setFilterType("all")}
                    className={`px-2.5 py-1 rounded-full border transition-all ${
                      filterType === "all"
                        ? "text-white border-transparent"
                        : "border-muted text-muted-foreground hover:border-foreground/30"
                    }`}
                    style={
                      filterType === "all" ? { backgroundColor: "#151339" } : {}
                    }
                  >
                    All ({holdings.length})
                  </button>
                  {presentTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`px-2.5 py-1 rounded-full border transition-all ${
                        filterType === t
                          ? "text-white border-transparent"
                          : "border-muted text-muted-foreground hover:border-foreground/30"
                      }`}
                      style={
                        filterType === t ? { backgroundColor: "#151339" } : {}
                      }
                    >
                      {assetTypeLabel(t)}
                    </button>
                  ))}
                </div>

                {/* Sort */}
                <Select
                  value={sortBy}
                  onValueChange={(v) => setSortBy(v as "value" | "gain")}
                >
                  <SelectTrigger className="h-7 text-xs w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="value">Sort: Value</SelectItem>
                    <SelectItem value="gain">Sort: Gain %</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredHoldings.length === 0 ? (
              <EmptyHoldings onAdd={() => setAddOpen(true)} />
            ) : (
              <div className="space-y-2">
                {/* Column header */}
                <div
                  className="hidden md:grid gap-3 px-4 py-2 text-xs text-muted-foreground font-medium"
                  style={{
                    gridTemplateColumns: "1fr 120px 96px 96px 112px 16px",
                  }}
                >
                  <span>Asset</span>
                  <span className="text-right">Portfolio %</span>
                  <span className="text-right">Gain / Loss</span>
                  <span className="text-right">Return</span>
                  <span className="text-right">Value</span>
                  <span />
                </div>
                {filteredHoldings.map((h) => (
                  <HoldingRow
                    key={h.holding_id}
                    holding={h}
                    valuations={valuations}
                    livePrices={livePrices}
                    totalPortfolio={totalPortfolioValue}
                    onEdit={() => {
                      setEditHolding(h);
                      setAddOpen(true);
                    }}
                    onDelete={() => handleDelete(h.holding_id)}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Accounts ── */}
          <motion.div variants={mi}>
            <div className="flex items-center justify-between mb-3">
              <SectionLabel>Accounts</SectionLabel>
              <span className="text-xs text-muted-foreground">
                Total: {formatCurrency(totalAccountsValue)}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {storeAccounts.map((acc, i) => (
                <motion.div
                  key={acc.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i }}
                >
                  <Card className="">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="p-2 rounded-lg shrink-0"
                            style={{ backgroundColor: "#15133914" }}
                          >
                            <FontAwesomeIcon
                              icon={faWallet}
                              className="h-3.5 w-3.5"
                              style={{ color: "#151339" }}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{acc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {acc.institution}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold tabular-nums">
                            {formatCurrency(acc.balance, acc.currency)}
                          </p>
                          <Badge
                            variant="outline"
                            className="text-xs capitalize py-0"
                          >
                            {acc.type.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── Manual valuation notice ── */}
          {holdings.some((h) => h.valuation_method === "manual") && (
            <motion.div variants={mi}>
              <Card
                className="border-dashed"
                style={{ borderColor: "#fde68a", backgroundColor: "#fffbeb55" }}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <FontAwesomeIcon
                      icon={faTriangleExclamation}
                      className="h-4 w-4 mt-0.5 shrink-0"
                      style={{ color: "#d97706" }}
                    />
                    <div>
                      <p
                        className="text-xs font-semibold"
                        style={{ color: "#d97706" }}
                      >
                        Manual valuations need periodic updates
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Holdings like bonds, private equity, and savings
                        accounts don't have a live price feed — they show the
                        last value you entered. Update them when you receive
                        your statements to keep your portfolio value accurate.
                        Holdings marked{" "}
                        <span className="font-medium">Manual</span> are
                        affected.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* ── Add / Edit Dialog ── */}
        <AddHoldingDialog
          open={addOpen}
          onClose={() => {
            setAddOpen(false);
            setEditHolding(null);
          }}
          onSave={handleSaveHolding}
          editHolding={editHolding}
        />
      </motion.div>
    </TooltipProvider>
  );
}
