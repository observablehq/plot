export declare function formatMonth(
  locale?: string,
  format?: "numeric" | "2-digit" | "long" | "short" | "narrow" | undefined
): (i: Date | number | null | undefined) => string | undefined;

export declare function formatWeekday(
  locale?: string,
  format?: "long" | "short" | "narrow" | undefined
): (i: Date | number | null | undefined) => string | undefined;

export declare function formatIsoDate(date: Date): string;
