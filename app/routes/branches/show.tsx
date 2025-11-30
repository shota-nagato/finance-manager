import type { Route } from "./+types/show";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import { AGGREGATION_TYPE, AGGREGATION_INTERVAL, type AggregationType, type AggregationInterval } from "../../constants/branch";
import { NavLink, useLoaderData } from "react-router";
import { eq } from "drizzle-orm";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "店舗詳細 | 決算データ管理" },
    { name: "description", content: "決算データ集計管理システムの店舗詳細ページ" },
  ];
}

export async function loader({ context, params }: Route.LoaderArgs) {
  const db = drizzle(context.cloudflare.env.aggregation_manager_d1, { schema });

  const branch = await db.query.branches.findFirst({
    where: eq(schema.branches.id, Number(params.id)),
    with: {
      branchCategories: {
        with: {
          category: true,
          aggregations: true,
        }
      }
    }
  });
  return { branch };
}

export default function BrancheDetail() {
  const { branch } = useLoaderData<typeof loader>();

  if (!branch) {
    return <div>店舗が見つかりません</div>;
  }

  const salesCategories = branch.branchCategories.filter(
    bc => bc.category.categoryType === "sales"
  );
  const expenseCategories = branch.branchCategories.filter(
    bc => bc.category.categoryType === "expenses"
  );

  const allPeriods = new Set<string>();
  branch.branchCategories.forEach(bc => {
    bc.aggregations.forEach(agg => {
      allPeriods.add(`${agg.year}-${agg.month}`);
    });
  });
  const sortedPeriods = Array.from(allPeriods).sort((a, b) => {
    const [yearA, monthA] = a.split("-").map(Number);
    const [yearB, monthB] = b.split("-").map(Number);
    if (yearA !== yearB) return yearA - yearB;
    return monthA - monthB;
  });

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("ja-JP");
  };

  const getAmount = (
    bc: typeof branch.branchCategories[0],
    year: number,
    month: number
  ) => {
    const agg = bc.aggregations.find(a => a.year === year && a.month === month);
    return agg ? formatAmount(agg.amount) : "-";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4">
        <NavLink
          to="/branches"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← 店舗一覧へ戻る
        </NavLink>
      </div>

      {/* ページヘッダー */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {branch.name}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {AGGREGATION_TYPE[branch.aggregationType as AggregationType]} / {AGGREGATION_INTERVAL[branch.aggregationInterval as AggregationInterval]}
          </p>
        </div>
        <NavLink
          to={`/branches/${branch.id}/edit`}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
        >
          編集
        </NavLink>
      </div>

      <div className="space-y-8">
        {/* 売上項目 */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-medium text-gray-900">売上項目</h2>
          </div>
          {salesCategories.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      項目名
                    </th>
                    {sortedPeriods.map(period => {
                      const [year, month] = period.split("-");
                      return (
                        <th key={period} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {year}年{month}月
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {salesCategories.map(bc => (
                    <tr key={bc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <span className="text-sm font-medium text-gray-900">{bc.category.name}</span>
                      </td>
                      {sortedPeriods.map(period => {
                        const [year, month] = period.split("-");
                        return (
                          <td key={period} className="px-6 py-3 text-right">
                            <span className="text-sm text-gray-700">
                              {getAmount(bc, Number(year), Number(month))}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-6 py-3 text-sm text-gray-500">項目がありません</p>
          )}
        </div>

        {/* 経費項目 */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-medium text-gray-900">経費項目</h2>
          </div>
          {expenseCategories.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      項目名
                    </th>
                    {sortedPeriods.map(period => {
                      const [year, month] = period.split("-");
                      return (
                        <th key={period} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {year}年{month}月
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {expenseCategories.map(bc => (
                    <tr key={bc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <span className="text-sm font-medium text-gray-900">{bc.category.name}</span>
                      </td>
                      {sortedPeriods.map(period => {
                        const [year, month] = period.split("-");
                        return (
                          <td key={period} className="px-6 py-3 text-right">
                            <span className="text-sm text-gray-700">
                              {getAmount(bc, Number(year), Number(month))}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-6 py-3 text-sm text-gray-500">項目がありません</p>
          )}
        </div>
      </div>
    </div>
  )
}
