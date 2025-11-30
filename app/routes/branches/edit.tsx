import type { Route } from "./+types/edit";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import { AGGREGATION_TYPE, AGGREGATION_INTERVAL, type AggregationType, type AggregationInterval } from "../../constants/branch";
import { NavLink, useLoaderData, useFetcher } from "react-router";
import { eq, and } from "drizzle-orm";
import { useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "店舗編集 | 決算データ管理" },
    { name: "description", content: "店舗の編集ページ" },
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

  const allCategories = await db.query.categories.findMany();

  return { branch, allCategories };
}

export async function action({ context, params, request }: Route.ActionArgs) {
  const db = drizzle(context.cloudflare.env.aggregation_manager_d1, { schema });
  const formData = await request.formData();
  const intent = formData.get("intent");

  const branchId = Number(params.id);

  switch (intent) {
    case "addCategory": {
      const categoryId = Number(formData.get("categoryId"));
      await db.insert(schema.branchCategories).values({
        branchId,
        categoryId,
      });
      return { success: true, message: "項目を追加しました" };
    }

    case "removeCategory": {
      const branchCategoryId = Number(formData.get("branchCategoryId"));
      await db.delete(schema.branchCategories)
        .where(eq(schema.branchCategories.id, branchCategoryId));
      return { success: true, message: "項目を削除しました" };
    }

    case "saveAggregation": {
      const branchCategoryId = Number(formData.get("branchCategoryId"));
      const year = Number(formData.get("year"));
      const month = Number(formData.get("month"));
      const amount = Number(formData.get("amount"));

      const existing = await db.query.aggregations.findFirst({
        where: and(
          eq(schema.aggregations.branchCategoryId, branchCategoryId),
          eq(schema.aggregations.year, year),
          eq(schema.aggregations.month, month)
        )
      });

      if (existing) {
        await db.update(schema.aggregations)
          .set({ amount })
          .where(eq(schema.aggregations.id, existing.id));
      } else {
        await db.insert(schema.aggregations).values({
          branchCategoryId,
          year,
          month,
          amount,
        });
      }
      return { success: true, message: "データを保存しました" };
    }

    case "deleteAggregation": {
      const aggregationId = Number(formData.get("aggregationId"));
      await db.delete(schema.aggregations)
        .where(eq(schema.aggregations.id, aggregationId));
      return { success: true, message: "データを削除しました" };
    }
  }

  return { success: false, message: "不明な操作です" };
}

export default function BranchEdit() {
  const { branch, allCategories } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => 2020 + i);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [amountInput, setAmountInput] = useState("");

  if (!branch) {
    return <div className="p-8">店舗が見つかりません</div>;
  }

  const isHalfYearly = branch.aggregationInterval === "half-yearly";
  const isCumulative = branch.aggregationType === "cumulative";
  const availableMonths = isHalfYearly ? [6, 12] : [3, 6, 9, 12];

  const salesCategories = branch.branchCategories.filter(
    bc => bc.category.categoryType === "sales"
  );
  const expenseCategories = branch.branchCategories.filter(
    bc => bc.category.categoryType === "expenses"
  );

  const assignedCategoryIds = branch.branchCategories.map(bc => bc.categoryId);
  const availableSalesCategories = allCategories.filter(
    c => c.categoryType === "sales" && !assignedCategoryIds.includes(c.id)
  );
  const availableExpenseCategories = allCategories.filter(
    c => c.categoryType === "expenses" && !assignedCategoryIds.includes(c.id)
  );

  const handleSaveAggregation = (branchCategoryId: number) => {
    if (selectedMonth === null || !amountInput) return;

    fetcher.submit(
      {
        intent: "saveAggregation",
        branchCategoryId: String(branchCategoryId),
        year: String(selectedYear),
        month: String(selectedMonth),
        amount: amountInput,
      },
      { method: "post" }
    );
    setEditingCategory(null);
    setAmountInput("");
  };

  const getAggregation = (branchCategoryId: number, year: number, month: number) => {
    const bc = branch.branchCategories.find(bc => bc.id === branchCategoryId);
    return bc?.aggregations.find(a => a.year === year && a.month === month);
  };

  const isSubmitting = fetcher.state !== "idle";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4">
        <NavLink
          to={`/branches/${branch.id}`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← 店舗詳細へ戻る
        </NavLink>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {branch.name} の編集
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {AGGREGATION_TYPE[branch.aggregationType as AggregationType]} / {AGGREGATION_INTERVAL[branch.aggregationInterval as AggregationInterval]}
        </p>
      </div>

      {fetcher.data?.message && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${
          fetcher.data.success
            ? "bg-green-50 text-green-800 border border-green-200"
            : "bg-red-50 text-red-800 border border-red-200"
        }`}>
          {fetcher.data.message}
        </div>
      )}

      <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-sm font-medium text-gray-900 mb-2">データ登録期間</h2>
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-blue-800 font-medium mb-1">登録ルール</p>
          <p className="text-xs text-blue-700">
            各月は「{isHalfYearly ? "半期" : "四半期"}の{isCumulative ? "累計" : "期間"}データ」を登録します。
          </p>
          <ul className="text-xs text-blue-700 mt-1 ml-4 list-disc space-y-0.5">
            {isCumulative ? (
              isHalfYearly ? (
                <>
                  <li>6月 → 1〜6月の累計データ</li>
                  <li>12月 → 1〜12月の累計データ</li>
                </>
              ) : (
                <>
                  <li>3月 → 1〜3月の累計データ</li>
                  <li>6月 → 1〜6月の累計データ</li>
                  <li>9月 → 1〜9月の累計データ</li>
                  <li>12月 → 1〜12月の累計データ</li>
                </>
              )
            ) : (
              isHalfYearly ? (
                <>
                  <li>6月 → 1〜6月の期間データ</li>
                  <li>12月 → 7〜12月の期間データ</li>
                </>
              ) : (
                <>
                  <li>3月 → 1〜3月の期間データ</li>
                  <li>6月 → 4〜6月の期間データ</li>
                  <li>9月 → 7〜9月の期間データ</li>
                  <li>12月 → 10〜12月の期間データ</li>
                </>
              )
            )}
          </ul>
        </div>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">年度</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}年</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              月 {isHalfYearly && <span className="text-orange-600">(半期: 6月・12月のみ)</span>}
            </label>
            <div className="flex gap-2">
              {[3, 6, 9, 12].map(month => {
                const isAvailable = availableMonths.includes(month);
                const isSelected = selectedMonth === month;
                return (
                  <button
                    key={month}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => setSelectedMonth(isSelected ? null : month)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      !isAvailable
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {month}月
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-sm font-medium text-gray-900">売上項目</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {salesCategories.map(bc => {
              const currentAgg = selectedMonth ? getAggregation(bc.id, selectedYear, selectedMonth) : null;
              const isEditing = editingCategory === bc.id;

              return (
                <div key={bc.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{bc.category.name}</span>
                    <div className="flex items-center gap-3">
                      {selectedMonth && (
                        isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={amountInput}
                              onChange={(e) => setAmountInput(e.target.value)}
                              placeholder="金額"
                              className="w-32 px-3 py-1 border border-gray-300 rounded-md text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveAggregation(bc.id)}
                              disabled={isSubmitting || !amountInput}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                              保存
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategory(null);
                                setAmountInput("");
                              }}
                              className="px-3 py-1 text-gray-600 text-sm hover:text-gray-800"
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              {selectedYear}年{selectedMonth}月:
                            </span>
                            <span className="text-sm font-medium text-gray-900 min-w-[80px] text-right">
                              {currentAgg ? currentAgg.amount.toLocaleString("ja-JP") : "-"}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategory(bc.id);
                                setAmountInput(currentAgg?.amount.toString() || "");
                              }}
                              className="px-3 py-1 text-blue-600 text-sm hover:text-blue-800"
                            >
                              {currentAgg ? "編集" : "登録"}
                            </button>
                          </div>
                        )
                      )}
                      <fetcher.Form method="post">
                        <input type="hidden" name="intent" value="removeCategory" />
                        <input type="hidden" name="branchCategoryId" value={bc.id} />
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                          onClick={(e) => {
                            if (!confirm("「" + bc.category.name + "」を削除しますか？\n関連する集計データも削除されます。")) {
                              e.preventDefault();
                            }
                          }}
                        >
                          削除
                        </button>
                      </fetcher.Form>
                    </div>
                  </div>
                </div>
              );
            })}

            {salesCategories.length === 0 && (
              <div className="px-6 py-4 text-sm text-gray-500">項目がありません</div>
            )}
          </div>

          {availableSalesCategories.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <fetcher.Form method="post" className="flex items-center gap-3">
                <input type="hidden" name="intent" value="addCategory" />
                <select
                  name="categoryId"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableSalesCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  追加
                </button>
              </fetcher.Form>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-sm font-medium text-gray-900">経費項目</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {expenseCategories.map(bc => {
              const currentAgg = selectedMonth ? getAggregation(bc.id, selectedYear, selectedMonth) : null;
              const isEditing = editingCategory === bc.id;

              return (
                <div key={bc.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{bc.category.name}</span>
                    <div className="flex items-center gap-3">
                      {selectedMonth && (
                        isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={amountInput}
                              onChange={(e) => setAmountInput(e.target.value)}
                              placeholder="金額"
                              className="w-32 px-3 py-1 border border-gray-300 rounded-md text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveAggregation(bc.id)}
                              disabled={isSubmitting || !amountInput}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                              保存
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategory(null);
                                setAmountInput("");
                              }}
                              className="px-3 py-1 text-gray-600 text-sm hover:text-gray-800"
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              {selectedYear}年{selectedMonth}月:
                            </span>
                            <span className="text-sm font-medium text-gray-900 min-w-20 text-right">
                              {currentAgg ? currentAgg.amount.toLocaleString("ja-JP") : "-"}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategory(bc.id);
                                setAmountInput(currentAgg?.amount.toString() || "");
                              }}
                              className="px-3 py-1 text-blue-600 text-sm hover:text-blue-800"
                            >
                              {currentAgg ? "編集" : "登録"}
                            </button>
                          </div>
                        )
                      )}
                      <fetcher.Form method="post">
                        <input type="hidden" name="intent" value="removeCategory" />
                        <input type="hidden" name="branchCategoryId" value={bc.id} />
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                          onClick={(e) => {
                            if (!confirm("「" + bc.category.name + "」を削除しますか？\n関連する集計データも削除されます。")) {
                              e.preventDefault();
                            }
                          }}
                        >
                          削除
                        </button>
                      </fetcher.Form>
                    </div>
                  </div>
                </div>
              );
            })}

            {expenseCategories.length === 0 && (
              <div className="px-6 py-4 text-sm text-gray-500">項目がありません</div>
            )}
          </div>

          {availableExpenseCategories.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <fetcher.Form method="post" className="flex items-center gap-3">
                <input type="hidden" name="intent" value="addCategory" />
                <select
                  name="categoryId"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableExpenseCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  追加
                </button>
              </fetcher.Form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
