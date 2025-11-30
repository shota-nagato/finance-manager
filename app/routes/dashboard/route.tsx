import type { Route } from "./+types/route";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import { calculateSummary } from "../../utils/aggregation-calculator";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ダッシュボード | 決算データ管理" },
    { name: "description", content: "決算データ集計管理システム" },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const db = drizzle(context.cloudflare.env.aggregation_manager_d1, { schema });

  const aggregationData = await db.query.aggregations.findMany({
    with: {
      branchCategory: {
        with: {
          branch: true,
          category: true,
        }
      }
    }
  });

  return { aggregationData };
}

function formatNumber(num: number): string {
  return num.toLocaleString('ja-JP');
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { aggregationData } = loaderData;

  const summaries = calculateSummary(aggregationData);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ページヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          半期サマリ
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          全店舗の売上・経費・利益を一覧で確認できます
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">年度</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">店舗</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">半期</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">売上合計</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">経費合計</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">利益</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {summaries.map((summary, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-gray-900">{summary.year}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-700">{summary.branchName}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm text-gray-700">{summary.halfPeriod}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm text-gray-900 font-medium">{formatNumber(summary.sales)}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm text-gray-900">{formatNumber(summary.expenses)}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`text-sm font-semibold ${summary.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatNumber(summary.profit)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
