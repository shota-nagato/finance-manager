import type { Route } from "./+types/route";
import { drizzle } from "drizzle-orm/d1";
import { branches } from "../../../db/schema";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ダッシュボード | 決算データ管理" },
    { name: "description", content: "決算データ集計管理システム" },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const db = drizzle(context.cloudflare.env.aggregation_manager_d1);
  const branchList = await db.select().from(branches);
  return { branches: branchList };
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { branches } = loaderData;

  return (
    <div>
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

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold">年度</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">店舗</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">半期</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">売上合計</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">経費合計</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">利益</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-6 py-4 text-sm">2025</td>
                  <td className="px-6 py-4 text-sm">東京</td>
                  <td className="px-6 py-4 text-sm text-center">上半期</td>
                  <td className="px-6 py-4 text-sm text-right">1000</td>
                  <td className="px-6 py-4 text-sm text-right">1000</td>
                  <td className="px-6 py-4 text-sm text-right">100</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
