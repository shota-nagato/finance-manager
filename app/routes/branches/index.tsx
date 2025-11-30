import type { Route } from "./+types/index";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import { AGGREGATION_TYPE, AGGREGATION_INTERVAL, type AggregationType, type AggregationInterval } from "../../constants/branch";
import { NavLink } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "店舗一覧 | 決算データ管理" },
    { name: "description", content: "決算データ集計管理システムの店舗一覧ページ" },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const db = drizzle(context.cloudflare.env.aggregation_manager_d1, { schema });

  const branchList = await db.query.branches.findMany({
    with: {
      branchCategories: {
        with: {
          category: true
        }
      }
    }
  });
  return { branches: branchList };
}

export default function Branches({ loaderData }: Route.ComponentProps) {
  const { branches } = loaderData;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ページヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          店舗一覧
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          全店舗を一覧で確認できます
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">店舗名</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">集計タイプ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">集計間隔</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">売上項目数</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">経費項目数</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {branches.map((branch) => {
              const salesCount = branch.branchCategories.filter(bc => bc.category.categoryType === "sales").length;
              const expensesCount = branch.branchCategories.filter(bc => bc.category.categoryType === "expenses").length;

              return (
                <tr key={branch.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <NavLink
                        to={`/branches/${branch.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      {branch.name}
                    </NavLink>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">
                      {AGGREGATION_TYPE[branch.aggregationType as AggregationType]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">
                      {AGGREGATION_INTERVAL[branch.aggregationInterval as AggregationInterval]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-gray-700">{salesCount}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-gray-700">{expensesCount}</span>
                  </td>
                  <td className="px-3 py-4 text-center">
                    <NavLink
                      to={`/branches/${branch.id}/edit`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      編集
                    </NavLink>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
