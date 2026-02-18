import { NextRequest, NextResponse } from "next/server";
import { getHistory } from "@/lib/market/yahoo";

const VALID_RANGES = ["1d", "5d", "1mo", "3mo", "1y", "5y"];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  const range = searchParams.get("range") ?? "1mo";

  if (!symbol) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  if (!VALID_RANGES.includes(range)) {
    return NextResponse.json(
      { error: `range must be one of: ${VALID_RANGES.join(", ")}` },
      { status: 400 }
    );
  }

  const history = await getHistory(symbol, range);

  return NextResponse.json({ history });
}
