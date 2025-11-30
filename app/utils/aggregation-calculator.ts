import type { AggregationWithRelations } from "../../db/schema";
import type { AggregationType, AggregationInterval } from "../constants/branch";
import type { HalfPeriod } from "../constants/summary";

type CategoryType = "sales" | "expenses";

type AggregationRecord = AggregationWithRelations;

type SalesExpenses = {
  sales: number;
  expenses: number;
};

type SummaryRow = {
  year: number;
  branchName: string;
  halfPeriod: HalfPeriod;
  sales: number;
  expenses: number;
  profit: number;
};

/** 配列からユニークな値を取得 */
function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/** 特定の月のレコードを抽出 */
function filterByMonth(records: AggregationRecord[], month: number): AggregationRecord[] {
  return records.filter((r) => r.month === month);
}

/** 複数の月のレコードを抽出 */
function filterByMonths(records: AggregationRecord[], months: number[]): AggregationRecord[] {
  return records.filter((r) => months.includes(r.month));
}

/** カテゴリタイプ別に金額を合計 */
function sumByCategory(records: AggregationRecord[], categoryType: CategoryType): number {
  return records
    .filter((r) => r.branchCategory.category.categoryType === categoryType)
    .reduce((sum, r) => sum + r.amount, 0);
}

/** レコード配列から売上・経費を集計 */
function toSalesExpenses(records: AggregationRecord[]): SalesExpenses {
  return {
    sales: sumByCategory(records, "sales"),
    expenses: sumByCategory(records, "expenses"),
  };
}

/** 2つのSalesExpensesの差分を計算 */
function subtractSalesExpenses(a: SalesExpenses, b: SalesExpenses): SalesExpenses {
  return {
    sales: a.sales - b.sales,
    expenses: a.expenses - b.expenses,
  };
}

type CalculationRule = (records: AggregationRecord[]) => SalesExpenses;

const CALCULATION_RULES: Record<
  HalfPeriod,
  Record<AggregationType, Record<AggregationInterval, CalculationRule>>
> = {
  // 上期 (1~6月)
  firstHalf: {
    // 累積
    cumulative: {
      // 半期 -> 6月の値
      "half-yearly": (r) => toSalesExpenses(filterByMonth(r, 6)),
      // 四半期 -> 6月の値
      quarterly: (r) => toSalesExpenses(filterByMonth(r, 6)),
    },
    // 期間
    periodic: {
      // 半期 -> 6月の値
      "half-yearly": (r) => toSalesExpenses(filterByMonth(r, 6)),
      // 四半期 -> 3月 + 6月の値
      quarterly: (r) => toSalesExpenses(filterByMonths(r, [3, 6])),
    },
  },
  // 下期 (7~12月)
  secondHalf: {
    // 累積
    cumulative: {
      // 半期 -> 12月の値 - 6月の値
      "half-yearly": (r) =>
        subtractSalesExpenses(
          toSalesExpenses(filterByMonth(r, 12)),
          toSalesExpenses(filterByMonth(r, 6))
        ),
      // 四半期 -> 12月の値 - 6月の値
      quarterly: (r) =>
        subtractSalesExpenses(
          toSalesExpenses(filterByMonth(r, 12)),
          toSalesExpenses(filterByMonth(r, 6))
        ),
    },
    // 期間
    periodic: {
      // 半期 -> 12月の値
      "half-yearly": (r) => toSalesExpenses(filterByMonth(r, 12)),
      // 四半期 -> 9月 + 12月の値
      quarterly: (r) => toSalesExpenses(filterByMonths(r, [9, 12])),
    },
  },
};

const HALF_PERIODS: HalfPeriod[] = ["firstHalf", "secondHalf"];

export function calculateSummary(data: AggregationRecord[]): SummaryRow[] {
  const years = unique(data.map((r) => r.year)).sort();
  const branchIds = unique(data.map((r) => r.branchCategory.branch.id)).sort();

  return years.flatMap((year) =>
    branchIds.flatMap((branchId) => {
      const branchYearData = data.filter(
        (r) => r.year === year && r.branchCategory.branch.id === branchId
      );
      if (branchYearData.length === 0) return [];

      const branch = branchYearData[0].branchCategory.branch;
      const { aggregationType, aggregationInterval } = branch;

      return HALF_PERIODS.map((halfPeriod) => {
        const calculate = CALCULATION_RULES[halfPeriod][aggregationType as AggregationType][aggregationInterval as AggregationInterval];
        const { sales, expenses } = calculate(branchYearData);

        return {
          year,
          branchName: branch.name,
          halfPeriod,
          sales,
          expenses,
          profit: sales - expenses,
        };
      });
    })
  );
}
