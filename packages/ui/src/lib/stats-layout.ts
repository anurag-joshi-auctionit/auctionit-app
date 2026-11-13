/**
 * Shared layout for filterable / summary stat card strips.
 *
 * Flex + horizontal scroll; card min-widths show ~2 / 3 / 5 cards
 * (gap-4 = 1rem subtracted per breakpoint).
 */
export const STATS_STRIP_CLASS = "flex gap-4 overflow-x-auto pb-1";

export const STATS_CARD_CLASS =
  "shrink-0 min-w-[calc((100%-1rem)/2)] sm:min-w-[calc((100%-2rem)/3)] md:min-w-[calc((100%-4rem)/5)]";

/** Denser variant for strips with many cards: shows ~3 / 5 / 7 cards. */
export const STATS_CARD_COMPACT_CLASS =
  "shrink-0 min-w-[calc((100%-2rem)/3)] sm:min-w-[calc((100%-4rem)/5)] md:min-w-[calc((100%-6rem)/7)]";
