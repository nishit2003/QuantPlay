import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import HomePage from "@/app/page";

const matchMediaMock = vi.fn();

beforeAll(() => {
  vi.stubGlobal("matchMedia", matchMediaMock);
  matchMediaMock.mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  // IntersectionObserver is referenced by AnimatedCounter and useInView
  class IntersectionObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);

  // ResizeObserver is touched by some framer-motion paths
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
});

// Mock framer-motion just enough to keep useScroll/useTransform inert
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    useReducedMotion: () => matchMediaMock().matches,
    useScroll: () => ({
      scrollYProgress: { get: () => 0, on: vi.fn(), set: vi.fn() },
    }),
    useTransform: () => 0,
  };
});

describe("Homepage — Apple-style scroll narrative", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Hero", () => {
    it("renders the headline, eyebrow, and primary CTAs", () => {
      render(<HomePage />);
      expect(screen.getByText(/Master the markets/i)).toBeInTheDocument();
      expect(screen.getByText(/Risk-free/i)).toBeInTheDocument();
      // Both header and hero render a "Start free" CTA, so grab all
      expect(screen.getAllByRole("link", { name: /start free/i }).length).toBeGreaterThan(0);
    });
  });

  describe("Two-journey section", () => {
    it("frames both audience tracks", () => {
      render(<HomePage />);
      expect(screen.getByText(/I'm new to trading/i)).toBeInTheDocument();
      expect(screen.getByText(/I'm a serious trader/i)).toBeInTheDocument();
      expect(screen.getByText(/Pressure-test your edge/i)).toBeInTheDocument();
    });
  });

  describe("Feature showcase", () => {
    it("lists every platform capability", () => {
      render(<HomePage />);
      expect(
        screen.getByText(/Real-time trading\. Real-time conviction\./i),
      ).toBeInTheDocument();
      expect(screen.getByText(/Set it\. And actually forget it\./i)).toBeInTheDocument();
      expect(screen.getByText(/Find the next move in seconds\./i)).toBeInTheDocument();
      expect(screen.getByText(/The market never sleeps\. You can\./i)).toBeInTheDocument();
    });
  });

  describe("Journal, Pulse, Compete", () => {
    it("renders narrative sections in order", () => {
      render(<HomePage />);
      expect(screen.getByText(/Know yourself\. Know your edge\./i)).toBeInTheDocument();
      expect(screen.getByText(/The whole market in one view\./i)).toBeInTheDocument();
      expect(screen.getByText(/Climb the global leaderboard\./i)).toBeInTheDocument();
    });
  });

  describe("Achievements & Academy", () => {
    it("shows gamification + learning sections", () => {
      render(<HomePage />);
      expect(screen.getByText(/Every milestone, marked\./i)).toBeInTheDocument();
      expect(screen.getByText(/From candlesticks to algorithms\./i)).toBeInTheDocument();
      // A specific module
      expect(screen.getByText(/Reading Stock Charts/i)).toBeInTheDocument();
      // A specific badge
      expect(screen.getByText(/Sharpshooter/i)).toBeInTheDocument();
    });
  });

  describe("Stats grid", () => {
    it("renders the proof-of-scale stats with stable boundaries", () => {
      render(<HomePage />);
      expect(screen.getByTestId("stats-grid")).toBeInTheDocument();
      expect(screen.getByText(/Tradable assets/i)).toBeInTheDocument();
      expect(screen.getByText(/Achievements to earn/i)).toBeInTheDocument();
      expect(screen.getByText(/Academy modules/i)).toBeInTheDocument();
    });
  });

  describe("Final CTA + footer", () => {
    it("closes the page with a CTA and a footer", () => {
      render(<HomePage />);
      expect(screen.getByText(/Your edge starts here\./i)).toBeInTheDocument();
      expect(screen.getByText(/Claim your \$1,000/i)).toBeInTheDocument();
      expect(screen.getByText(/All trades are simulated/i)).toBeInTheDocument();
    });
  });
});
