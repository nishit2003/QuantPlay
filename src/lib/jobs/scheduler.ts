import cron from "node-cron";
import { checkPendingOrders } from "./check-pending-orders";
import { executeRecurringOrders } from "./execute-recurring-orders";
import { finalizeWeeklyContest } from "./contest";

let initialized = false;

export function startScheduler() {
  if (initialized) return;
  initialized = true;

  // Check pending limit/stop-loss orders every minute (Mon-Fri)
  cron.schedule("* * * * 1-5", async () => {
    try {
      await checkPendingOrders();
    } catch (error) {
      console.error("[scheduler] Error checking pending orders:", error);
    }
  });

  // Execute recurring/auto-invest orders every hour
  cron.schedule("0 * * * *", async () => {
    try {
      await executeRecurringOrders();
    } catch (error) {
      console.error("[scheduler] Error executing recurring orders:", error);
    }
  });

  // Friday 4:00 PM ET — finalize weekly contest
  cron.schedule("0 16 * * 5", async () => {
    try {
      console.log("[scheduler] Finalizing weekly contest...");
      await finalizeWeeklyContest();
      console.log("[scheduler] Weekly contest finalized");
    } catch (error) {
      console.error("[scheduler] Error finalizing contest:", error);
    }
  }, { timezone: "America/New_York" });

  console.log("[scheduler] Cron jobs started");
}
