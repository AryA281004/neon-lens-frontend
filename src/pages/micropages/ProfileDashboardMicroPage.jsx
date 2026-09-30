import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const MotionDiv = motion.div;

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getCount = (value) => {
  if (Array.isArray(value)) return value.length;
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof value === 'object' && typeof value.length === 'number') return value.length;
  return 0;
};

const formatCompact = (value) => {
  const num = toNumber(value);
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);
};

const formatDecimal = (value) => toNumber(value).toFixed(2);
const roundToTwo = (value) => Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;
const safeDivide = (numerator, denominator) => {
  const safeNumerator = toNumber(numerator);
  const safeDenominator = toNumber(denominator);
  return safeDenominator > 0 ? safeNumerator / safeDenominator : 0;
};

const getTopPostMetricValue = (post, metricKey) => {
  if (metricKey === "interactions") {
    const explicitInteractions = getCount(post?.interactions);
    if (explicitInteractions > 0) return explicitInteractions;

    return (
      getCount(post?.likes) +
      getCount(post?.comments) +
      getCount(post?.saves) +
      getCount(post?.shares)
    );
  }

  return getCount(post?.[metricKey]);
};

const COLORS = ["#7DD3FC", "#A78BFA", "#F472B6", "#34D399", "#F59E0B", "#F97316"];

const cardClassName =
  "group relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-transparent via-white/5 to-white/10 backdrop-blur-xl p-4 md:p-5 shadow-[0_20px_45px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_60px_rgba(8,18,40,0.55)] before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-[radial-gradient(circle_at_20%_0%,rgba(125,211,252,0.16),transparent_55%)] before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 after:pointer-events-none after:absolute after:inset-x-6 after:top-0 after:h-px after:bg-gradient-to-r after:from-cyan-400/30 after:via-white/20 after:to-transparent";

const bentoGridClassName =
  "grid w-full gap-4 auto-rows-[minmax(180px,auto)] grid-cols-1 lg:grid-cols-12 lg:gap-5 lg:auto-rows-[minmax(210px,auto)] lg:grid-flow-dense";

const tooltipStyle = {
  background: "rgba(9, 11, 20, 0.92)",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: "12px",
  color: "#fff",
  backdropFilter: "blur(8px)",
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const chartFocusResetStyles = `
  .dashboard-analytics svg:focus,
  .dashboard-analytics *:focus,
  .dashboard-analytics *:focus-visible {
    outline: none !important;
  }
`;

const formatDateLabel = (dateValue) => {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  }).format(date);
};

const CountUpValue = ({ value, formatter, duration = 850 }) => {
  const safeValue = toNumber(value);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const from = display;
    const change = safeValue - from;
    let frameId = null;

    const animate = (timestamp) => {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + change * eased);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeValue]);

  return <>{formatter(display)}</>;
};

const ProfileDashboardMicroPage = ({
  loadingDashboard,
  dashboardError,
  dashboardOverview,
  dashboardDerived,
  dashboardAccount,
  dashboardTrends,
  dashboardTopPosts,
  dashboardBestConnections,
  dashboardOpportunitySignals,
}) => {
  const overview = {
    postsCount: toNumber(dashboardOverview?.postsCount),
    followersCount: toNumber(dashboardOverview?.followersCount),
    followingCount: toNumber(dashboardOverview?.followingCount),
    totalLikes: toNumber(dashboardOverview?.totalLikes),
    totalComments: toNumber(dashboardOverview?.totalComments),
    totalShares: toNumber(dashboardOverview?.totalShares),
    totalViews: toNumber(dashboardOverview?.totalViews),
    totalBookmarks: toNumber(dashboardOverview?.totalBookmarks),
    nlScore: toNumber(dashboardOverview?.nlScore),
  };

  const derived = useMemo(
    () => ({
      interactions: toNumber(dashboardDerived?.interactions),
      avgLikesPerPost: toNumber(dashboardDerived?.avgLikesPerPost),
      avgCommentsPerPost: toNumber(dashboardDerived?.avgCommentsPerPost),
      avgViewsPerPost: toNumber(dashboardDerived?.avgViewsPerPost),
      engagementRate: toNumber(dashboardDerived?.engagementRate),
      performanceScore: toNumber(dashboardDerived?.performanceScore),
      scoreBreakdown: {
        engagement: toNumber(dashboardDerived?.scoreBreakdown?.engagement),
        views: toNumber(dashboardDerived?.scoreBreakdown?.views),
        followers: toNumber(dashboardDerived?.scoreBreakdown?.followers),
        posts: toNumber(dashboardDerived?.scoreBreakdown?.posts),
        total: toNumber(dashboardDerived?.scoreBreakdown?.total),
      },
    }),
    [dashboardDerived],
  );

  const followersGrowth = useMemo(
    () => (Array.isArray(dashboardTrends?.followersGrowth) ? dashboardTrends.followersGrowth : []),
    [dashboardTrends?.followersGrowth],
  );

  const engagementTrend = useMemo(
    () => (Array.isArray(dashboardTrends?.engagementTrend) ? dashboardTrends.engagementTrend : []),
    [dashboardTrends?.engagementTrend],
  );

  const [timeWindowDays, setTimeWindowDays] = useState(30);
  const [compareMode, setCompareMode] = useState(false);

  const takeLastN = (arr, n) => {
    if (!Array.isArray(arr) || arr.length === 0) return [];
    const sorted = arr.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    return sorted.slice(-n);
  };

  const takePreviousN = (arr, n) => {
    if (!Array.isArray(arr) || arr.length === 0) return [];
    const sorted = arr.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    const start = Math.max(0, sorted.length - n * 2);
    const prev = sorted.slice(start, start + n);
    return prev.length === n ? prev : [];
  };

  const topPosts = useMemo(
    () => (Array.isArray(dashboardTopPosts) ? dashboardTopPosts : []),
    [dashboardTopPosts],
  );

  const bestConnections = useMemo(
    () => (Array.isArray(dashboardBestConnections) ? dashboardBestConnections : []),
    [dashboardBestConnections],
  );

  const opportunity = useMemo(
    () => ({
      contentPotential: toNumber(dashboardOpportunitySignals?.contentPotential),
      saveRatio: toNumber(dashboardOpportunitySignals?.saveRatio),
      shareRatio: toNumber(dashboardOpportunitySignals?.shareRatio),
      attentionGap: toNumber(dashboardOpportunitySignals?.attentionGap),
      topRecommendation: String(dashboardOpportunitySignals?.topRecommendation || ''),
    }),
    [dashboardOpportunitySignals],
  );

  const hasOpportunityData = useMemo(
    () => overview.postsCount > 0,
    [overview.postsCount],
  );

  const opportunityRenderedRecommendation = useMemo(() => {
    const hasInsight =
      opportunity.contentPotential > 0 ||
      opportunity.saveRatio > 0 ||
      opportunity.shareRatio > 0 ||
      opportunity.attentionGap < 12;

    if (hasInsight) {
      return opportunity.topRecommendation || 'Keep refining your strongest formats for broader reach.';
    }

    if (overview.postsCount === 0) {
      return 'Publish your first post to activate opportunity insights.';
    }

    return 'Collect more likes, saves, and shares to power your radar.';
  }, [opportunity, overview.postsCount]);

  const categoryAdvantage = useMemo(() => {
    if (!Array.isArray(topPosts) || topPosts.length === 0) {
      return {
        name: 'No category data',
        count: 0,
        avgEngagement: 0,
        share: 0,
        insight: 'Publish more posts first to discover your strongest content niche.',
      };
    }

    const counts = topPosts.reduce((acc, post) => {
      const category = String(post.category || 'other');
      const engagement = toNumber(post.engagementRate);
      if (!acc[category]) {
        acc[category] = { count: 0, engagement: 0 };
      }
      acc[category].count += 1;
      acc[category].engagement += engagement;
      return acc;
    }, {});

    const topCategory = Object.entries(counts)
      .sort((a, b) => b[1].count - a[1].count)[0];

    const [name, data] = topCategory || ['other', { count: 0, engagement: 0 }];
    const avgEngagement = data.count > 0 ? roundToTwo(data.engagement / data.count) : 0;
    const share = roundToTwo((data.count / topPosts.length) * 100);

    return {
      name,
      count: data.count,
      avgEngagement,
      share,
      insight: share > 50
        ? `Your strongest format is ${name} content — lean into it to amplify growth.`
        : `${name} content leads your top posts; experiment to turn it into a dominant theme.`,
    };
  }, [topPosts]);

  const viewerEngagerRatio = useMemo(
    () => (overview.totalViews > 0 ? roundToTwo((derived.interactions / overview.totalViews) * 100) : 0),
    [overview.totalViews, derived.interactions],
  );

  const growthFocusMessage = useMemo(() => {
    if (categoryAdvantage.count === 0) {
      return 'Experiment with a couple of new content themes to discover what your audience values most.';
    }

    if (categoryAdvantage.share >= 55) {
      return `Lean into ${categoryAdvantage.name} posts — they already dominate your top-performing work.`;
    }

    if (categoryAdvantage.share >= 35) {
      return `Your ${categoryAdvantage.name} content is gaining traction; publish more of it to build a clear niche.`;
    }

    return `Your ${categoryAdvantage.name} posts show promise; test a repeatable format to raise consistency.`;
  }, [categoryAdvantage]);

  const accountName =
    `${dashboardAccount?.firstName || ""} ${dashboardAccount?.lastName || ""}`.trim() ||
    dashboardAccount?.username ||
    "Creator";

	const computedPerformanceScore = Math.round(
    clamp(
      derived.engagementRate * 2 +
        Math.log10(overview.postsCount + 1) * 14 +
        Math.log10(overview.totalViews + 1) * 12 +
        Math.log10(overview.followersCount + 1) * 12,
      0,
      100,
    ),
  );

  const performanceScore = useMemo(() => {
  return derived.scoreBreakdown.total > 0
    ? Math.round(derived.scoreBreakdown.total)
    : derived.performanceScore > 0
      ? Math.round(derived.performanceScore)
      : computedPerformanceScore;
}, [derived, computedPerformanceScore]);

  const scoreBand =
    performanceScore >= 80
      ? { label: "Elite", tone: "text-emerald-300" }
      : performanceScore >= 60
        ? { label: "Strong", tone: "text-cyan-300" }
        : performanceScore >= 40
          ? { label: "Growing", tone: "text-amber-300" }
          : { label: "Early Stage", tone: "text-rose-300" };

  const scoreData = [{ name: "score", value: performanceScore, fill: "#ffffff" }];

  const [activeMetric, setActiveMetric] = useState("likes");
  const [selectedPost, setSelectedPost] = useState(null);

  const metricMeta = useMemo(
    () => ({
      likes: { label: "Likes", color: "#7DD3FC", key: "likes" },
      comments: { label: "Comments", color: "#A78BFA", key: "comments" },
      views: { label: "Views", color: "#34D399", key: "views" },
      saves: { label: "Saves", color: "#F59E0B", key: "saves" },
      shares: { label: "Shares", color: "#F97316", key: "shares" },
      interactions: { label: "Interactions", color: "#F472B6", key: "interactions" },
    }),
    [],
  );

  const metricOptions = useMemo(
    () => ["likes", "comments", "views", "saves", "shares", "interactions"],
    [],
  );

  const activeMetricKey = metricMeta[activeMetric]?.key || "likes";

  const followersChartData = useMemo(() => {
    const current = takeLastN(followersGrowth, timeWindowDays);
    return current.map((item) => ({ ...item, label: formatDateLabel(item.date) }));
  }, [followersGrowth, timeWindowDays]);

  const previousFollowersChartData = useMemo(() => {
    const prev = takePreviousN(followersGrowth, timeWindowDays);
    return prev.map((item) => ({ ...item, label: formatDateLabel(item.date) }));
  }, [followersGrowth, timeWindowDays]);

  const engagementChartDataCurrent = useMemo(() => {
    const current = takeLastN(engagementTrend, timeWindowDays);
    return current.map((item) => ({ ...item, label: formatDateLabel(item.date) }));
  }, [engagementTrend, timeWindowDays]);

  const engagementChartDataPrevious = useMemo(() => {
    const prev = takePreviousN(engagementTrend, timeWindowDays);
    return prev.map((item) => ({ ...item, label: formatDateLabel(item.date) }));
  }, [engagementTrend, timeWindowDays]);

  const followerMomentum = useMemo(() => {
    if (followersChartData.length < 2) {
      return null;
    }

    const first = toNumber(followersChartData[0]?.count);
    const last = toNumber(followersChartData[followersChartData.length - 1]?.count);
    const change = last - first;
    const percent = first > 0 ? (change / first) * 100 : last > 0 ? 100 : 0;

    return { change, percent };
  }, [followersChartData]);

  const growthInsights = useMemo(() => {
    const insights = [];

    if (overview.postsCount < 8) {
      insights.push('Post more frequently to give the algorithm fresh content to amplify.');
    }

    if (derived.engagementRate < 5) {
      insights.push('Use stronger CTAs and caption prompts to convert more views into likes, saves and shares.');
    }

    if (viewerEngagerRatio < 8) {
      insights.push('Improve your first-line hook and descriptive captions to raise viewer-to-engager conversion.');
    }

    if (overview.totalBookmarks < overview.totalLikes * 0.25) {
      insights.push('Create more save-worthy content like quick tutorials, checklists, and behind-the-scenes posts.');
    }

    if (followerMomentum?.percent > 5) {
      insights.push('Your audience growth is accelerating — keep the cadence and reinforce your best theme.');
    }

    if (insights.length === 0) {
      insights.push('You have a strong foundation; keep testing the formats that already perform best.');
    }

    return insights.slice(0, 4);
  }, [overview.postsCount, derived.engagementRate, viewerEngagerRatio, overview.totalBookmarks, overview.totalLikes, followerMomentum]);

  const momentumLabel = useMemo(() => {
    if (!followerMomentum) return 'More history will make this signal stronger.';
    if (followerMomentum.change > 0) return 'Audience momentum is positive — keep pressing the advantage.';
    if (followerMomentum.change === 0) return 'Steady growth — now focus on engagement lift to unlock faster reach.';
    return 'Momentum is slightly soft; bring back your audience with a high-value post.';
  }, [followerMomentum]);

  const activeMetricTotal = useMemo(
    () => engagementChartDataCurrent.reduce((sum, item) => sum + toNumber(item?.[activeMetricKey]), 0),
    [engagementChartDataCurrent, activeMetricKey],
  );

  const activeMetricTotalPrevious = useMemo(
    () => engagementChartDataPrevious.reduce((sum, item) => sum + toNumber(item?.[activeMetricKey]), 0),
    [engagementChartDataPrevious, activeMetricKey],
  );

  const activeMetricAverage = useMemo(
    () => safeDivide(activeMetricTotal, Math.max(engagementChartDataCurrent.length, 1)),
    [activeMetricTotal, engagementChartDataCurrent.length],
  );

  const activeMetricPeak = useMemo(() => {
    if (engagementChartDataCurrent.length === 0) return null;

    return engagementChartDataCurrent.reduce(
      (best, item) => {
        const value = toNumber(item?.[activeMetricKey]);
        if (value > best.value) {
          return { value, label: item.label || "-" };
        }
        return best;
      },
      { value: -Infinity, label: "-" },
    );
  }, [engagementChartDataCurrent, activeMetricKey]);

  const activeMetricDelta = useMemo(() => {
    const currentValue = toNumber(activeMetricTotal);
    const previousValue = toNumber(activeMetricTotalPrevious);
    const change = currentValue - previousValue;
    const percent =
      previousValue > 0
        ? (change / previousValue) * 100
        : currentValue > 0
          ? 100
          : 0;

    return { change, percent };
  }, [activeMetricTotal, activeMetricTotalPrevious]);

  const activeMetricStrip = useMemo(() => {
    const slice = engagementChartDataCurrent.slice(-14);
    const maxValue = Math.max(1, ...slice.map((item) => toNumber(item?.[activeMetricKey])));

    return slice.map((item) => {
      const value = toNumber(item?.[activeMetricKey]);
      return { label: item.label, value, intensity: safeDivide(value, maxValue) };
    });
  }, [engagementChartDataCurrent, activeMetricKey]);

  const activeMetricStripLatest = useMemo(
    () => (activeMetricStrip.length > 0 ? activeMetricStrip[activeMetricStrip.length - 1] : null),
    [activeMetricStrip],
  );

  const activeMetricStripMax = useMemo(() => {
    if (activeMetricStrip.length === 0) return null;
    return activeMetricStrip.reduce((best, item) => (item.value > best.value ? item : best), activeMetricStrip[0]);
  }, [activeMetricStrip]);

  const followerMomentumText = followerMomentum
    ? `${followerMomentum.change >= 0 ? "+" : ""}${formatCompact(followerMomentum.change)} (${followerMomentum.percent >= 0 ? "+" : ""}${formatDecimal(followerMomentum.percent)}%)`
    : "Need more history";

  const sortedTopPosts = useMemo(() => {
    return [...topPosts].sort(
      (a, b) => getTopPostMetricValue(b, activeMetricKey) - getTopPostMetricValue(a, activeMetricKey),
    );
  }, [topPosts, activeMetricKey]);

  const topPostBars = useMemo(
    () => {
      return sortedTopPosts.slice(0, 6).map((post, index) => ({
        id: post.postId,
        name: `#${index + 1}`,
        value: getTopPostMetricValue(post, activeMetricKey),
        caption: post.caption || `Post ${index + 1}`,
      }));
    },
    [sortedTopPosts, activeMetricKey],
  );

  const summarizeEngagementRows = (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) {
      return {
        likes: 0,
        comments: 0,
        views: 0,
        saves: 0,
        shares: 0,
        interactions: 0,
        days: 0,
      };
    }

    return rows.reduce(
      (acc, row) => {
        const likes = toNumber(row?.likes);
        const comments = toNumber(row?.comments);
        const views = toNumber(row?.views);
        const saves = toNumber(row?.saves);
        const shares = toNumber(row?.shares);
        const interactions = toNumber(row?.interactions);

        acc.likes += likes;
        acc.comments += comments;
        acc.views += views;
        acc.saves += saves;
        acc.shares += shares;
        acc.interactions += interactions;
        return acc;
      },
      {
        likes: 0,
        comments: 0,
        views: 0,
        saves: 0,
        shares: 0,
        interactions: 0,
        days: rows.length,
      },
    );
  };

  const currentWindowSummary = useMemo(
    () => summarizeEngagementRows(engagementChartDataCurrent),
    [engagementChartDataCurrent],
  );

  const previousWindowSummary = useMemo(
    () => summarizeEngagementRows(engagementChartDataPrevious),
    [engagementChartDataPrevious],
  );

  const currentFollowerAdditions = useMemo(
    () =>
      followersChartData.reduce(
        (sum, item) => sum + toNumber(item?.newFollowers),
        0,
      ),
    [followersChartData],
  );

  const previousFollowerAdditions = useMemo(
    () =>
      previousFollowersChartData.reduce(
        (sum, item) => sum + toNumber(item?.newFollowers),
        0,
      ),
    [previousFollowersChartData],
  );

  const getDelta = (current, previous) => {
    const currentValue = toNumber(current);
    const previousValue = toNumber(previous);
    const change = currentValue - previousValue;
    const percent =
      previousValue > 0
        ? (change / previousValue) * 100
        : currentValue > 0
          ? 100
          : 0;
    return { change, percent };
  };

  const avgInteractionsPerDay = safeDivide(
    currentWindowSummary.interactions,
    Math.max(currentWindowSummary.days, 1),
  );

  const prevAvgInteractionsPerDay = safeDivide(
    previousWindowSummary.interactions,
    Math.max(previousWindowSummary.days, 1),
  );

  const interactionsPerThousandViews =
    safeDivide(currentWindowSummary.interactions, currentWindowSummary.views) * 1000;
  const prevInteractionsPerThousandViews =
    safeDivide(previousWindowSummary.interactions, previousWindowSummary.views) * 1000;

  const saveRateWindow = safeDivide(currentWindowSummary.saves, currentWindowSummary.views) * 100;
  const prevSaveRateWindow =
    safeDivide(previousWindowSummary.saves, previousWindowSummary.views) * 100;

  const executiveMetrics = [
    {
      label: "Interactions (window)",
      value: currentWindowSummary.interactions,
      previous: previousWindowSummary.interactions,
      format: (value) => formatCompact(value),
      hint: `${timeWindowDays}-day total`,
    },
    {
      label: "Followers gained",
      value: currentFollowerAdditions,
      previous: previousFollowerAdditions,
      format: (value) => formatCompact(value),
      hint: "Net additions in selected window",
    },
    {
      label: "Avg interactions/day",
      value: avgInteractionsPerDay,
      previous: prevAvgInteractionsPerDay,
      format: (value) => formatDecimal(value),
      hint: "Consistency + momentum",
    },
    {
      label: "Saves per 100 views",
      value: saveRateWindow,
      previous: prevSaveRateWindow,
      format: (value) => formatDecimal(value),
      suffix: "%",
      hint: "Save-worthy depth signal",
    },
    {
      label: "Interactions per 1K views",
      value: interactionsPerThousandViews,
      previous: prevInteractionsPerThousandViews,
      format: (value) => formatDecimal(value),
      hint: "Quality of attention",
    },
  ];

  const conversionMetrics = [
    {
      label: "Like Rate",
      value: safeDivide(overview.totalLikes, overview.totalViews) * 100,
      target: 4.5,
      hint: "likes per 100 views",
    },
    {
      label: "Comment Rate",
      value: safeDivide(overview.totalComments, overview.totalViews) * 100,
      target: 1.0,
      hint: "comments per 100 views",
    },
    {
      label: "Share Rate",
      value: safeDivide(overview.totalShares, overview.totalViews) * 100,
      target: 0.6,
      hint: "shares per 100 views",
    },
    {
      label: "Save Rate",
      value: safeDivide(overview.totalBookmarks, overview.totalViews) * 100,
      target: 0.8,
      hint: "bookmarks per 100 views",
    },
    {
      label: "Follower Conversion",
      value: safeDivide(overview.followersCount, overview.totalViews) * 100,
      target: 0.4,
      hint: "followers per 100 views",
    },
  ];

  const weekdayPerformance = useMemo(() => {
    const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const buckets = weekdayLabels.map((label, index) => ({
      label,
      index,
      days: 0,
      totalInteractions: 0,
      totalViews: 0,
    }));

    engagementChartDataCurrent.forEach((item) => {
      const date = new Date(item?.date);
      if (Number.isNaN(date.getTime())) return;

      const dayIndex = date.getDay();
      buckets[dayIndex].days += 1;
      buckets[dayIndex].totalInteractions += toNumber(item?.interactions);
      buckets[dayIndex].totalViews += toNumber(item?.views);
    });

    return buckets.map((bucket) => ({
      ...bucket,
      avgInteractions:
        bucket.days > 0
          ? roundToTwo(bucket.totalInteractions / bucket.days)
          : 0,
      interactionRate:
        bucket.totalViews > 0
          ? roundToTwo((bucket.totalInteractions / bucket.totalViews) * 100)
          : 0,
    }));
  }, [engagementChartDataCurrent]);

  const maxWeekdayAverage = Math.max(
    1,
    ...weekdayPerformance.map((day) => toNumber(day.avgInteractions)),
  );

  const populatedWeekdays = weekdayPerformance.filter((day) => day.days > 0);
  const bestWeekday =
    populatedWeekdays.length > 0
      ? [...populatedWeekdays].sort(
          (a, b) => toNumber(b.avgInteractions) - toNumber(a.avgInteractions),
        )[0]
      : null;

  const weakestWeekday =
    populatedWeekdays.length > 0
      ? [...populatedWeekdays].sort(
          (a, b) => toNumber(a.avgInteractions) - toNumber(b.avgInteractions),
        )[0]
      : null;

  const activeWeekdays = weekdayPerformance.filter(
    (day) => day.days > 0 && day.totalInteractions > 0,
  ).length;
  const consistencyScore = roundToTwo(
    safeDivide(activeWeekdays, weekdayPerformance.length) * 100,
  );

  const nextFollowerMilestone = useMemo(() => {
    const currentFollowers = toNumber(overview.followersCount);
    if (currentFollowers < 100) return 100;
    if (currentFollowers < 1000) return Math.ceil(currentFollowers / 100) * 100;
    return Math.ceil(currentFollowers / 500) * 500;
  }, [overview.followersCount]);

  const followersNeededForMilestone = Math.max(
    0,
    nextFollowerMilestone - overview.followersCount,
  );

  const followerMilestoneProgress = clamp(
    safeDivide(overview.followersCount, Math.max(nextFollowerMilestone, 1)) * 100,
    0,
    100,
  );

  const followerVelocityPerDay = safeDivide(
    currentFollowerAdditions,
    Math.max(followersChartData.length, 1),
  );

  const estimatedDaysToMilestone =
    followerVelocityPerDay > 0
      ? Math.ceil(followersNeededForMilestone / followerVelocityPerDay)
      : null;

  const postLeaderboard = useMemo(
    () =>
      sortedTopPosts.slice(0, 5).map((post, index) => {
        const likes = getCount(post?.likes);
        const comments = getCount(post?.comments);
        const views = getCount(post?.views);
        const saves = getCount(post?.saves);
        const shares = getCount(post?.shares);

        const weightedScore = roundToTwo(
          likes + comments * 2 + saves * 1.5 + shares * 2 + views * 0.05,
        );

        return {
          id: post.postId || `leader-${index + 1}`,
          postId: post.postId || '',
          rank: index + 1,
          caption: post.caption || `Post ${index + 1}`,
          weightedScore,
          engagementRate: toNumber(post?.engagementRate),
          likes,
          comments,
          views,
          saves,
          shares,
        };
      }),
    [sortedTopPosts],
  );

  const scoreBreakdown = [
    {
      label: "Engagement",
      value:
        derived.scoreBreakdown.engagement > 0
          ? derived.scoreBreakdown.engagement
          : roundToTwo(clamp(derived.engagementRate * 2, 0, 40)),
      cap: 40,
    },
    {
      label: "Views",
      value:
        derived.scoreBreakdown.views > 0
          ? derived.scoreBreakdown.views
          : roundToTwo(clamp(Math.log10(overview.totalViews + 1) * 12, 0, 30)),
      cap: 30,
    },
    {
      label: "Followers",
      value:
        derived.scoreBreakdown.followers > 0
          ? derived.scoreBreakdown.followers
          : roundToTwo(clamp(Math.log10(overview.followersCount + 1) * 12, 0, 20)),
      cap: 20,
    },
    {
      label: "Posts",
      value:
        derived.scoreBreakdown.posts > 0
          ? derived.scoreBreakdown.posts
          : roundToTwo(clamp(Math.log10(overview.postsCount + 1) * 14, 0, 15)),
      cap: 15,
    },
  ];

  const topCards = [
    { label: "Total Posts", value: overview.postsCount, hint: "Published" },
    { label: "Followers", value: overview.followersCount, hint: "Audience" },
    { label: "Following", value: overview.followingCount, hint: "Network" },
    { label: "NL Score", value: overview.nlScore, hint: "Account score" },
    { label: "Interactions", value: derived.interactions, hint: "Likes + comments + shares + saves" },
    { label: "Engagement", value: `${formatDecimal(derived.engagementRate)}%`, hint: "Interaction vs views" },
  ];

  const engagementMixData = [
    { name: "Likes", value: overview.totalLikes },
    { name: "Comments", value: overview.totalComments },
    { name: "Shares", value: overview.totalShares },
    { name: "Bookmarks", value: overview.totalBookmarks },
  ].filter((item) => item.value > 0);

  const perPostData = [
    { metric: "Likes/Post", value: derived.avgLikesPerPost },
    { metric: "Comments/Post", value: derived.avgCommentsPerPost },
    { metric: "Views/Post", value: derived.avgViewsPerPost },
  ];

  const audienceFunnel = [
    { stage: "Views", value: overview.totalViews },
    { stage: "Interactions", value: derived.interactions },
    { stage: "Followers", value: overview.followersCount },
    { stage: "Posts", value: overview.postsCount },
  ];

  const recommendations = [];

  if (overview.postsCount < 8) {
    recommendations.push("Increase posting frequency to improve algorithmic reach.");
  }

  if (derived.engagementRate < 5) {
    recommendations.push("Add stronger CTAs in captions to raise engagement rate.");
  }

  if (overview.totalBookmarks < overview.totalLikes * 0.25) {
    recommendations.push("Create more save-worthy content (tutorials, checklists, behind-the-scenes).");
  }

  if (overview.followersCount < overview.followingCount) {
    recommendations.push("Focus on audience retention and niche consistency to outgrow following count.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Great momentum — keep consistency and experiment with high-performing formats.");
  }

  const hasEngagementMix = engagementMixData.length > 0;

	const openPostModalById = (postId) => {
		const foundPost = sortedTopPosts.find((post) => post.postId === postId);
		if (foundPost) {
			setSelectedPost(foundPost);
		}
	};

	const selectedPostTrend = Array.isArray(selectedPost?.trend) ? selectedPost.trend : [];
	const hasSelectedPostTrend = selectedPostTrend.length > 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="dashboard-analytics relative flex flex-col items-center max-w-[85vw] ml-17 mx-auto space-y-6 pb-8"
    >
      <style>{chartFocusResetStyles}</style>

      

      <motion.div
        variants={itemVariants}
        className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(167,139,250,0.22),rgba(12,16,28,0.97)_50%)] p-5 md:p-7"
      >
        <div className="absolute -top-10 right-10 h-36 w-36 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-12 left-10 h-40 w-40 rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/80">Creator Intelligence Dashboard</p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{accountName}'s Performance Cockpit</h1>
            <p className="text-sm text-gray-300 max-w-2xl">
              Beautiful analytics meets real decisions — track momentum, decode your score, and drill into what content is truly moving your growth.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full lg:w-auto">
            <div className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-3 py-2">
              <p className="text-[11px] uppercase text-cyan-100/80 tracking-wide">Follower momentum</p>
              <p className="text-sm font-semibold text-cyan-100 mt-1">{followerMomentumText}</p>
            </div>
            <div className="rounded-xl border border-violet-300/25 bg-violet-300/10 px-3 py-2">
              <p className="text-[11px] uppercase text-violet-100/80 tracking-wide">{metricMeta[activeMetric].label} volume</p>
              <p className="text-sm font-semibold text-violet-100 mt-1">{formatCompact(activeMetricTotal)}</p>
            </div>
            <div className="rounded-xl border border-emerald-300/25 bg-emerald-300/10 px-3 py-2">
              <p className="text-[11px] uppercase text-emerald-100/80 tracking-wide">Current band</p>
              <p className="text-sm font-semibold text-emerald-100 mt-1">{scoreBand.label}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {dashboardError && (
        <motion.div variants={itemVariants} className="border border-red-500/40 bg-red-500/10 text-red-300 px-4 py-3 rounded-lg">
          ⚠️ {dashboardError}
        </motion.div>
      )}

      {loadingDashboard ? (
        <motion.div variants={itemVariants} className="text-white text-center py-16">
          Loading dashboard analytics...
        </motion.div>
      ) : (
        <>
          <div className={bentoGridClassName}>
            <motion.div variants={itemVariants} className={`${cardClassName} lg:col-span-7`}>
              <h2 className="text-sm text-gray-300 mb-4">Core Snapshot</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {topCards.map((card) => (
                  <div key={card.label} className="border border-white/20 rounded-xl p-3 bg-white/3 hover:bg-white/6 transition-all duration-200">
                    <p className="text-[11px] uppercase tracking-wider text-gray-400">{card.label}</p>
                    <p className="text-xl font-semibold mt-1">
                      {typeof card.value === "string" ? (
                        card.value
                      ) : (
                        <CountUpValue
                          value={card.value}
                          formatter={(value) => formatCompact(value)}
                        />
                      )}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">{card.hint}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className={`${cardClassName} lg:col-span-5 flex flex-col items-center justify-center`}>
              <h2 className="text-sm text-gray-300 mb-2">Performance Score</h2>
              <div className="h-64 w-full outline-none focus:outline-none focus-visible:outline-none">
                <ResponsiveContainer width="100%" height="100%" >
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="85%"
                    barSize={18}
                    data={scoreData}
                    startAngle={210}
                    endAngle={-30}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar background dataKey="value" cornerRadius={8} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-3xl font-bold -mt-24">
                <CountUpValue value={performanceScore} formatter={(value) => Math.round(value)} />
              </p>
              <p className={`text-sm font-medium ${scoreBand.tone}`}>{scoreBand.label}</p>
            </motion.div>
            <motion.div variants={itemVariants} className={`${cardClassName} lg:col-span-8`}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm text-gray-300">Followers Growth (Time Series)</h2>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setTimeWindowDays(7)}
                        className={`px-2 py-1 rounded ${timeWindowDays === 7 ? 'bg-white/6 font-semibold' : 'hover:bg-white/5'}`}
                      >
                        7d
                      </button>
                      <button
                        type="button"
                        onClick={() => setTimeWindowDays(14)}
                        className={`px-2 py-1 rounded ${timeWindowDays === 14 ? 'bg-white/6 font-semibold' : 'hover:bg-white/5'}`}
                      >
                        14d
                      </button>
                      <button
                        type="button"
                        onClick={() => setTimeWindowDays(30)}
                        className={`px-2 py-1 rounded ${timeWindowDays === 30 ? 'bg-white/6 font-semibold' : 'hover:bg-white/5'}`}
                      >
                        30d
                      </button>
                    </div>
                    <label className="flex items-center text-xs gap-2">
                      <input type="checkbox" checked={compareMode} onChange={(e) => setCompareMode(e.target.checked)} />
                      <span className="text-gray-300">Compare</span>
                    </label>
                  </div>
                </div>
              {followersChartData.length > 0 ? (
                <div className="h-65">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={followersChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="label" stroke="#bfbfbf" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#bfbfbf" tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value, name) => [formatCompact(value), name === "count" ? "Followers" : "New Followers"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="count"
                        stroke="#7DD3FC"
                        strokeWidth={2.4}
                        dot={{ r: 3, fill: "#7DD3FC" }}
                        activeDot={{ r: 5 }}
                      />
                      {compareMode && previousFollowersChartData.length > 0 && (
                        <Line
                          type="monotone"
                          dataKey="count"
                          name="previous"
                          data={previousFollowersChartData}
                          stroke="#94A3B8"
                          strokeWidth={2}
                          dot={false}
                          strokeDasharray="4 4"
                          opacity={0.6}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-65 flex items-center justify-center text-sm text-gray-500 border border-dashed border-white/20 rounded-xl">
                  No follower growth data available for this period.
                </div>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className={`${cardClassName} lg:col-span-4`}>
              <h2 className="text-sm text-gray-300 mb-4">Score Breakdown (No Magic)</h2>
              <div className="space-y-3">
                {scoreBreakdown.map((part) => {
                  const widthPercent = part.cap > 0 ? clamp((part.value / part.cap) * 100, 0, 100) : 0;
                  return (
                    <div key={part.label}>
                      <div className="flex items-center justify-between text-xs text-gray-300 mb-1">
                        <span>{part.label}</span>
                        <span>+{formatDecimal(part.value)} / {part.cap}</span>
                      </div>
                      <div className="w-full h-2 rounded bg-white/10 overflow-hidden">
                        <div className="h-full bg-white transition-all duration-500" style={{ width: `${widthPercent}%` }} />
                      </div>
                    </div>
                  );
                })}
                <div className="border border-white/15 rounded-xl p-3 mt-2 bg-white/2">
                  <p className="text-xs text-gray-400">Total Score</p>
                  <p className="text-lg font-semibold">{performanceScore}</p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className={`${cardClassName} lg:col-span-4`}>
              <h2 className="text-sm text-gray-300 mb-4">Best Connections</h2>
              {bestConnections.length > 0 ? (
                <div className="space-y-3">
                  {bestConnections.map((connection) => (
                    <div key={connection.userId} className="border border-white/10 rounded-xl p-3 bg-white/5">
                      <div className="flex items-center gap-3">
                        <img
                          src={connection.profilePic || 'https://via.placeholder.com/48'}
                          alt={connection.username || 'connection'}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {connection.firstName} {connection.lastName}
                          </p>
                          <p className="text-xs text-gray-400 truncate">@{connection.username}</p>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-gray-400">
                        <span>Affinity {formatCompact(connection.interactionScore)}</span>
                        <span>❤ {formatCompact(connection.likes)}</span>
                        <span>💬 {formatCompact(connection.comments)}</span>
                        <span>🔁 {formatCompact(connection.shares)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-sm text-gray-500 border border-dashed border-white/20 rounded-xl">
                  No strong engagement connections yet.
                </div>
              )}
            </motion.div>

          <motion.div variants={itemVariants} className={`${cardClassName} lg:col-span-8 lg:row-span-2`}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h2 className="text-sm text-gray-300">Engagement Trend (Click metric to filter)</h2>
              <div className="flex flex-wrap gap-2">
                {metricOptions.map((metric) => (
                  <button
                    key={metric}
                    type="button"
                    onClick={() => setActiveMetric(metric)}
                    style={
                      activeMetric === metric
                        ? {
                            borderColor: metricMeta[metric].color,
                            backgroundColor: `${metricMeta[metric].color}26`,
                            color: metricMeta[metric].color,
                          }
                        : undefined
                    }
                    className={`text-[11px] px-2.5 py-1 rounded border transition ${
                      activeMetric === metric
                        ? "font-semibold"
                        : "border-white/20 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    {metricMeta[metric].label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-400 mb-3">
              Selected total: <span style={{ color: metricMeta[activeMetric].color }} className="font-medium">{formatCompact(activeMetricTotal)}</span>
            </p>

            {engagementChartDataCurrent.length > 0 ? (
              <div className="h-100" onMouseDown={(event) => event.preventDefault()}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={engagementChartDataCurrent}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="label" stroke="#bfbfbf" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#bfbfbf" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value, name) => [formatCompact(value), String(name || metricMeta[activeMetric].label)]}
                    />
                    <Legend />
                    {metricOptions.map((metric) => (
                      <Line
                        key={metric}
                        type="monotone"
                        dataKey={metricMeta[metric].key}
                        name={metricMeta[metric].label}
                        stroke={metricMeta[metric].color}
                        strokeWidth={activeMetric === metric ? 3 : 1.5}
                        dot={false}
                        onClick={() => setActiveMetric(metric)}
                        opacity={activeMetric === metric ? 1 : 0.45}
                        activeDot={{ r: 4 }}
                      />
                    ))}

                    {compareMode && engagementChartDataPrevious.length > 0 &&
                      metricOptions.map((metric) => (
                        <Line
                          key={`${metric}-prev`}
                          type="monotone"
                          data={engagementChartDataPrevious}
                          dataKey={metricMeta[metric].key}
                          name={`${metricMeta[metric].label} (prev)`}
                          stroke={metricMeta[metric].color}
                          strokeWidth={1.5}
                          dot={false}
                          strokeDasharray="4 4"
                          opacity={0.45}
                        />
                      ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-sm text-gray-500 border border-dashed border-white/20 rounded-md">
                No daily engagement trend available.
              </div>
            )}

            <div className="mt-5 grid grid-cols-1 xl:grid-cols-[1.1fr,0.9fr] gap-4">
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 via-white/2 to-transparent p-4">
                <div className="absolute -top-10 right-6 h-24 w-24 rounded-full bg-cyan-400/15 blur-3xl" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: metricMeta[activeMetric].color }}
                    />
                    <h3 className="text-[11px] uppercase tracking-[0.25em] text-gray-400">Signal board</h3>
                  </div>
                  <span className="text-[11px] text-gray-500">{timeWindowDays}d window</span>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400">Peak day</p>
                    <p className="text-lg font-semibold text-white mt-1">{activeMetricPeak?.label || "-"}</p>
                    <p className="text-[11px] text-gray-500">
                      {activeMetricPeak
                        ? `${formatCompact(activeMetricPeak.value)} ${metricMeta[activeMetric].label.toLowerCase()}`
                        : "No data yet"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400">Avg / day</p>
                    <p className="text-lg font-semibold text-white mt-1">{formatDecimal(activeMetricAverage)}</p>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-cyan-300/80"
                        style={{
                          width: `${clamp(
                            safeDivide(activeMetricAverage, Math.max(activeMetricPeak?.value || 1, 1)) * 100,
                            8,
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400">Window delta</p>
                    <p className="text-lg font-semibold text-white mt-1">
                      {activeMetricDelta.change >= 0 ? "+" : ""}{formatCompact(activeMetricDelta.change)}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border ${
                        activeMetricDelta.change >= 0
                          ? "text-emerald-300 border-emerald-300/30 bg-emerald-300/10"
                          : "text-rose-300 border-rose-300/30 bg-rose-300/10"
                      }`}
                    >
                      {activeMetricDelta.percent >= 0 ? "+" : ""}{formatDecimal(activeMetricDelta.percent)}%
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
                  <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">
                    Active: {metricMeta[activeMetric].label}
                  </span>
                  <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">
                    Signals refreshed daily
                  </span>
                  <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">
                    Compare: {compareMode ? "previous window" : "baseline"}
                  </span>
                </div>
              </div>

              <div className="relative overflow-hidden h-80 rounded-xl border border-white/10  p-4">
                <div className="absolute -bottom-10 left-8 h-28 w-28 rounded-full bg-violet-400/15 blur-3xl" />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[11px] uppercase tracking-[0.25em] text-gray-400">Momentum strip</h3>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Each bar is a day; taller means more {metricMeta[activeMetric].label.toLowerCase()}.
                    </p>
                  </div>
                  <span className="text-[11px] text-gray-500">Last {activeMetricStrip.length} days</span>
                </div>
                <div className="mt-4 flex items-end gap-1 h-24">
                  {activeMetricStrip.length > 0 ? (
                    activeMetricStrip.map((point, index) => (
                      
                      <div key={`${point.label}-${index}`} className="flex-1 h-full flex flex-col-reverse items-center">
                        <div
                          className="w-full rounded-sm bg-[#34D399] transition-all duration-300"
                          style={{ height: `${Math.max(10, Math.round(point.intensity * 100))}%` }}
                        />
                        <p className="text-[10px] text-gray-400 mt-1">{point.label}</p>
                      </div>
                      
                    ))
                  ) : (
                    <div className="text-xs text-gray-500">No recent activity to visualize.</div>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500">
                  <span>Oldest</span>
                  <span>Latest</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
                  <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">
                    Latest: {activeMetricStripLatest ? formatCompact(activeMetricStripLatest.value) : "-"}
                  </span>
                  <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">
                    Peak: {activeMetricStripMax ? `${formatCompact(activeMetricStripMax.value)} on ${activeMetricStripMax.label || "-"}` : "-"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className={`${cardClassName} lg:col-span-4`}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h2 className="text-sm text-gray-300">Executive Window Intelligence</h2>
                <p className="text-[11px] text-gray-400">
                  Current {timeWindowDays}d vs previous {timeWindowDays}d
                </p>
              </div>

              <div className="grid grid-cols-2  gap-3">
                {executiveMetrics.map((metric) => {
                  const delta = getDelta(metric.value, metric.previous);
                  const deltaTone =
                    delta.change >= 0
                      ? "text-emerald-300 border-emerald-300/30 bg-emerald-300/10"
                      : "text-rose-300 border-rose-300/30 bg-rose-300/10";

                  return (
                    <div
                      key={metric.label}
                      className="border border-white/15 rounded-xl p-3 bg-white/2 "
                    >
                      <p className="text-[11px] uppercase tracking-wider text-gray-400">
                        {metric.label}
                      </p>
                      <p className="text-xl font-semibold text-white">
                        {metric.format(metric.value)}
                        {metric.suffix || ""}
                      </p>
                      <div
                        className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border ${deltaTone}`}
                      >
                        <span>{delta.change >= 0 ? "▲" : "▼"}</span>
                        <span>
                          {metric.format(Math.abs(delta.change))}
                          {metric.suffix || ""}
                        </span>
                        <span>({delta.percent >= 0 ? "+" : ""}{formatDecimal(delta.percent)}%)</span>
                      </div>
                      <p className="text-[11px] text-gray-500">{metric.hint}</p>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
                <div className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-2">
                  <p className="text-[11px] uppercase text-cyan-100/80 tracking-wide">Best day</p>
                  <p className="text-sm font-semibold text-cyan-100 mt-1">
                    {bestWeekday ? `${bestWeekday.label} • ${formatDecimal(bestWeekday.avgInteractions)} avg interactions` : "Not enough data"}
                  </p>
                </div>
                <div className="rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-2">
                  <p className="text-[11px] uppercase text-amber-100/80 tracking-wide">Weakest day</p>
                  <p className="text-sm font-semibold text-amber-100 mt-1">
                    {weakestWeekday ? `${weakestWeekday.label} • ${formatDecimal(weakestWeekday.avgInteractions)} avg interactions` : "Not enough data"}
                  </p>
                </div>
                <div className="rounded-lg border border-violet-300/30 bg-violet-300/10 px-3 py-2">
                  <p className="text-[11px] uppercase text-violet-100/80 tracking-wide">Consistency score</p>
                  <p className="text-sm font-semibold text-violet-100 mt-1">
                    {formatDecimal(consistencyScore)}%
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className={`${cardClassName} lg:col-span-4 lg:row-span-2`}>
              <h2 className="text-sm text-gray-300 mb-4">Conversion + Cadence Benchmarks</h2>

              <div className="space-y-3">
                {conversionMetrics.map((metric) => {
                  const progress = clamp(
                    safeDivide(metric.value, Math.max(metric.target, 0.001)) * 100,
                    0,
                    100,
                  );
                  const achieved = metric.value >= metric.target;

                  return (
                    <div key={metric.label}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-300">{metric.label}</span>
                        <span className={achieved ? "text-emerald-300" : "text-amber-300"}>
                          {formatDecimal(metric.value)}% / {formatDecimal(metric.target)}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded bg-white/10 overflow-hidden">
                        <div
                          className={achieved ? "h-full bg-emerald-400" : "h-full bg-amber-400"}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">{metric.hint}</p>
                    </div>
                  );
                })}
              </div>

              <div className="border border-white/15 rounded-xl p-3 mt-4 bg-white/2">
                <p className="text-[11px] uppercase tracking-wide text-gray-400">Next follower milestone</p>
                <div className="flex items-end justify-between gap-3 mt-1">
                  <p className="text-lg font-semibold text-white">
                    {formatCompact(overview.followersCount)} / {formatCompact(nextFollowerMilestone)}
                  </p>
                  <p className="text-xs text-gray-300">
                    Need {formatCompact(followersNeededForMilestone)} more
                  </p>
                </div>
                <div className="w-full h-2 rounded bg-white/10 overflow-hidden mt-2">
                  <div className="h-full bg-cyan-400" style={{ width: `${followerMilestoneProgress}%` }} />
                </div>
                <p className="text-[11px] text-gray-500 mt-2">
                  ETA: {estimatedDaysToMilestone != null ? `${estimatedDaysToMilestone} day(s) at current pace` : "Collecting more growth history"}
                </p>
              </div>

              <div className="mt-4">
                <h3 className="text-xs uppercase tracking-wide text-gray-400 mb-2">Best days to post (current window)</h3>
                <div className="space-y-2">
                  {weekdayPerformance.map((day) => (
                    <div key={day.label} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-300">{day.label}</span>
                        <span className="text-gray-400">
                          {formatDecimal(day.avgInteractions)} avg • {formatDecimal(day.interactionRate)}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-violet-400"
                          style={{
                            width: `${clamp(
                              safeDivide(day.avgInteractions, maxWeekdayAverage) * 100,
                              0,
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

          <motion.div variants={itemVariants} className={`${cardClassName} lg:col-span-4`}>
              <h2 className="text-sm text-gray-300 mb-4">Engagement Composition</h2>

              {hasEngagementMix ? (
                <div className="h-70">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={engagementMixData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={65}
                        outerRadius={98}
                        paddingAngle={3}
                      >
                        {engagementMixData.map((entry, index) => (
                          <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [formatCompact(value), "Count"]}
                        contentStyle={tooltipStyle}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-70 flex items-center justify-center text-sm text-gray-500 border border-dashed border-white/20 rounded-xl">
                  No engagement events yet.
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mt-3">
                {engagementMixData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between border border-white/10 px-3 py-2 rounded">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></span>
                      <span className="text-xs text-gray-300">{item.name}</span>
                    </div>
                    <span className="text-xs text-white">{formatCompact(item.value)}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className={`${cardClassName} lg:col-span-4`}>
              <h2 className="text-sm text-gray-300 mb-4">Per-Post Efficiency</h2>
              <div className="h-65">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={perPostData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="metric" stroke="#bfbfbf" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#bfbfbf" tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => [formatDecimal(value), "Average"]}
                      contentStyle={tooltipStyle}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#34D399"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#34D699" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div> 

            

            <motion.div variants={itemVariants} className={`${cardClassName} lg:col-span-8`}>
              <h2 className="text-sm text-gray-300 mb-4">Top Performing Posts by {metricMeta[activeMetric].label}</h2>
              <div className="h-82.5">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topPostBars}
                    barCategoryGap={150}
                    onClick={(chartState) => {
                      const postId = chartState?.activePayload?.[0]?.payload?.id;
                      if (postId) openPostModalById(postId);
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="name" stroke="#bfbfbf" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#bfbfbf" tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => [formatCompact(value), "Value"]}
                      contentStyle={tooltipStyle}
                      labelFormatter={(label, payload) => payload?.[0]?.payload?.caption || label}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} fill={metricMeta[activeMetric].color} cursor="pointer" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 space-y-2">
                <h3 className="text-xs uppercase tracking-wide text-gray-400">
                  Post leaderboard details
                </h3>

                {postLeaderboard.length > 0 ? (
                  postLeaderboard.map((post) => (
                    <button
                      key={post.id || `leader-${post.rank}`}
                      type="button"
                      onClick={() => openPostModalById(post.postId || '')}
                      className="w-full text-left border border-white/10 rounded-lg p-2.5 bg-white/2 hover:bg-white/8 transition"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs text-gray-300 truncate">
                          #{post.rank} • {post.caption || "Untitled"}
                        </p>
                        <span className="text-xs font-semibold text-cyan-300">
                          Score {formatDecimal(post.weightedScore)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 mt-2 text-[11px] text-gray-400">
                        <span>❤ {formatCompact(post.likes)}</span>
                        <span>💬 {formatCompact(post.comments)}</span>
                        <span>🔁 {formatCompact(post.shares)}</span>
                        <span>🔖 {formatCompact(post.saves)}</span>
                        <span>👁 {formatCompact(post.views)}</span>
                        <span className="text-emerald-300">ER {formatDecimal(post.engagementRate)}%</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">No leaderboard data yet.</p>
                )}
              </div>
            </motion.div>

          

            <motion.div variants={itemVariants} className={`${cardClassName} lg:col-span-4`}>
              <h2 className="text-sm text-gray-300">Opportunity Radar</h2>
              <div className="space-y-4">
                {!hasOpportunityData ? (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-center">
                    <p className="text-sm text-gray-300">Opportunity insights are warming up.</p>
                    <p className="text-xs text-gray-500 mt-3">
                      Publish a post, gather engagement, and come back to see your radar unlock real recommendations.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-3xl border border-white/10 bg-white/5 mt-4 p-4">
                      <p className="text-[11px] uppercase tracking-[0.22em]  text-gray-400 mb-2">Content Potential</p>
                      <div className="flex items-center gap-3">
                        <div className="text-3xl font-semibold text-white">{formatDecimal(opportunity.contentPotential)}%</div>
                        <div className="h-3 flex-1 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-cyan-400"
                            style={{ width: `${Math.min(100, Math.max(0, opportunity.contentPotential))}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <p className="text-[11px] text-gray-400">Save Ratio</p>
                        <p className="text-lg font-semibold text-white mt-2">{formatDecimal(opportunity.saveRatio)}%</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <p className="text-[11px] text-gray-400">Share Ratio</p>
                        <p className="text-lg font-semibold text-white mt-2">{formatDecimal(opportunity.shareRatio)}%</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-[11px] text-gray-400">Attention Gap</p>
                      <p className="text-lg font-semibold text-white mt-2">{formatDecimal(opportunity.attentionGap)}</p>
                      <p className="text-[11px] text-gray-500 mt-2">Lower is better — focus on saves and shares.</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-cyan-400/10 p-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/80">Next move</p>
                      <p className="mt-2 text-sm text-white">{opportunityRenderedRecommendation}</p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className={`${cardClassName} lg:col-span-4`}>
              <h2 className="text-sm text-gray-300">Category Advantage</h2>
              <div className="space-y-4">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-gray-400 mb-2">Top Category</p>
                  <p className="text-2xl font-semibold text-white">{categoryAdvantage.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{categoryAdvantage.count} of top posts • {formatDecimal(categoryAdvantage.share)}%</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] text-gray-400">Average ER</p>
                    <p className="text-lg font-semibold text-white mt-2">{formatDecimal(categoryAdvantage.avgEngagement)}%</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] text-gray-400">Share of top posts</p>
                    <p className="text-lg font-semibold text-white mt-2">{formatDecimal(categoryAdvantage.share)}%</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-cyan-400/10 p-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/80">Focus insight</p>
                  <p className="mt-2 text-sm text-white">{categoryAdvantage.insight}</p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className={`${cardClassName} lg:col-span-4 flex flex-col gap-3`}>
              <h2 className="text-sm text-gray-300">Audience Funnel</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={audienceFunnel} layout="vertical" margin={{ left: 10, right: 10, top: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis type="number" stroke="#bfbfbf" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="stage" stroke="#bfbfbf" tick={{ fontSize: 11 }} width={90} />
                    <Tooltip formatter={(value) => [formatCompact(value), "Count"]} contentStyle={tooltipStyle} />
                    <Bar dataKey="value" fill="#34D399" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

            
              <div className="border border-white/10 rounded-md p-3">
                <p className="text-xs text-gray-400">Average Views / Post</p>
                <p className="text-lg font-semibold">{formatDecimal(derived.avgViewsPerPost)}</p>
              </div>
              <div className="border border-white/10 rounded-md p-3">
                <p className="text-xs text-gray-400">Average Comments / Post</p>
                <p className="text-lg font-semibold">{formatDecimal(derived.avgCommentsPerPost)}</p>
              </div>
              <div className="border border-white/10 rounded-md p-3">
                <p className="text-xs text-gray-400">Total Bookmarks</p>
                <p className="text-lg font-semibold">{formatCompact(overview.totalBookmarks)}</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className={`${cardClassName} lg:col-span-12`}>
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-xs uppercase tracking-[0.22em] text-gray-400">Growth Pulse</h3>
                  <p className="mt-3 text-lg font-semibold text-white">{followerMomentum ? `${followerMomentum.change >= 0 ? '+' : ''}${formatCompact(followerMomentum.change)} followers` : 'Need more history'}</p>
                  <p className="text-xs text-gray-500 mt-2">{momentumLabel}</p>
                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-3">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-gray-400">Metric momentum</p>
                    <p className="text-sm text-white mt-2">{activeMetricDelta.percent >= 0 ? '+' : ''}{formatDecimal(activeMetricDelta.percent)}% {metricMeta[activeMetric].label} vs last period</p>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-xs uppercase tracking-[0.22em] text-gray-400">Conversion Index</h3>
                  <p className="mt-3 text-3xl font-semibold text-white">{formatDecimal(viewerEngagerRatio)}%</p>
                  <p className="text-xs text-gray-500 mt-2">Viewer-to-engager conversion</p>
                  <p className="text-xs text-gray-400 mt-4">A higher conversion means more of your audience is taking action on every view.</p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-xs uppercase tracking-[0.22em] text-gray-400">Content Focus</h3>
                  <p className="mt-3 text-lg font-semibold text-white">{categoryAdvantage.name}</p>
                  <p className="text-xs text-gray-500 mt-2">{categoryAdvantage.count} top posts</p>
                  <p className="text-xs text-gray-400 mt-4">{growthFocusMessage}</p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className={`${cardClassName} lg:col-span-12`}>
              <h2 className="text-sm text-gray-300 mb-4">Profile Growth Playbook</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {growthInsights.map((tip, index) => (
                  <div key={`playbook-${index}`} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Step {index + 1}</p>
                    <p className="mt-2 text-sm text-white">{tip}</p>
                  </div>
                ))}
              </div>
            </motion.div>

          <motion.div variants={itemVariants} className={`${cardClassName} lg:col-span-12`}>
            <h2 className="text-sm text-gray-300 mb-4">Post-Level Insights (Click any post)</h2>
            {sortedTopPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {sortedTopPosts.map((post) => (
                  <button
                    key={post.postId}
                    type="button"
                    onClick={() => setSelectedPost(post)}
                    className="text-left border border-white/10 rounded-xl overflow-hidden bg-white/2 hover:bg-white/10 transition"
                  >
                    <div className="aspect-video bg-black/40">
                      {post.image ? (
                        <img src={post.image} alt={post.caption || "post"} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No preview</div>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      <p className="text-xs text-gray-200 line-clamp-2">{post.caption || "No caption"}</p>
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-gray-400">
                        <span>❤ {formatCompact(getCount(post.likes))}</span>
                        <span>💬 {formatCompact(getCount(post.comments))}</span>
                        <span>👁 {formatCompact(getCount(post.views))}</span>
                        <span>🔖 {formatCompact(getCount(post.saves))}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 border border-dashed border-white/20 rounded-md p-6 text-center">
                No post-level analytics yet.
              </div>
            )}
          </motion.div>
          </div>
        </>
      )}

      {selectedPost && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 md:p-8 overflow-auto"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="max-w-5xl mx-auto border border-white/20 bg-linear-to-br from-[#0D111C] to-[#0A0D17] rounded-2xl p-4 md:p-6 space-y-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">Post Drill-down Analytics</h3>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{selectedPost.caption || "No caption"}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="text-xs px-3 py-1.5 border border-white/20 hover:bg-white/10 rounded"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[360px,1fr] gap-4">
              <div className="space-y-3">
                <div className="aspect-video bg-black/40 border border-white/10 rounded overflow-hidden">
                  {selectedPost.image ? (
                    <img src={selectedPost.image} alt={selectedPost.caption || "post"} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No preview</div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="border border-white/10 p-2 rounded">❤ Likes: <span className="text-white">{formatCompact(getCount(selectedPost.likes))}</span></div>
                  <div className="border border-white/10 p-2 rounded">💬 Comments: <span className="text-white">{formatCompact(getCount(selectedPost.comments))}</span></div>
                  <div className="border border-white/10 p-2 rounded">👁 Views: <span className="text-white">{formatCompact(getCount(selectedPost.views))}</span></div>
                  <div className="border border-white/10 p-2 rounded">🔖 Saves: <span className="text-white">{formatCompact(getCount(selectedPost.saves))}</span></div>
                </div>
                <div className="border border-white/10 p-2 rounded text-xs text-gray-300">
                  Engagement Rate: <span className="text-white font-medium">{formatDecimal(selectedPost.engagementRate)}%</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm text-gray-300">Likes / Comments / Views / Saves over recent days</h4>
                {hasSelectedPostTrend ? (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={selectedPostTrend.map((item) => ({ ...item, label: formatDateLabel(item.date) }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                        <XAxis dataKey="label" stroke="#bfbfbf" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#bfbfbf" tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatCompact(value), "Count"]} />
                        <Legend />
                        <Line type="monotone" dataKey="likes" stroke="#7DD3FC" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="comments" stroke="#A78BFA" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="views" stroke="#34D399" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="saves" stroke="#F59E0B" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-72 flex items-center justify-center text-sm text-gray-500 border border-dashed border-white/20 rounded-md">
                    No trend points available for this post.
                  </div>
                )}

                {selectedPost?.trendNote && (
                  <p className="text-[11px] text-gray-500">{selectedPost.trendNote}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>

  );
};

export default ProfileDashboardMicroPage;