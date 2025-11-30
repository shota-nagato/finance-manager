DELETE FROM aggregations;
DELETE FROM branch_categories;
DELETE FROM categories;
DELETE FROM branches;

INSERT INTO branches (id, name, aggregation_type, aggregation_interval, created_at, updated_at) VALUES
  (1, '東京店舗', 'cumulative', 'quarterly', unixepoch(), unixepoch()),
  (2, '大阪店舗', 'periodic', 'half-yearly', unixepoch(), unixepoch()),
  (3, '名古屋店舗', 'cumulative', 'half-yearly', unixepoch(), unixepoch());

INSERT INTO categories (id, name, category_type, created_at, updated_at) VALUES
  (1, '生鮮食品', 'sales', unixepoch(), unixepoch()),
  (2, '加工食品', 'sales', unixepoch(), unixepoch()),
  (3, '菓子', 'sales', unixepoch(), unixepoch()),
  (4, '飲料', 'sales', unixepoch(), unixepoch()),
  (5, '惣菜', 'sales', unixepoch(), unixepoch()),
  (6, 'おもちゃ', 'sales', unixepoch(), unixepoch()),
  (7, '日用品', 'sales', unixepoch(), unixepoch()),
  (8, '人件費', 'expenses', unixepoch(), unixepoch()),
  (9, '水道光熱費', 'expenses', unixepoch(), unixepoch()),
  (10, '広告宣伝費', 'expenses', unixepoch(), unixepoch()),
  (11, '物流費', 'expenses', unixepoch(), unixepoch()),
  (12, 'その他経費', 'expenses', unixepoch(), unixepoch()),
  (13, '雑費', 'expenses', unixepoch(), unixepoch()),
  (14, '販管費', 'expenses', unixepoch(), unixepoch());

INSERT INTO branch_categories (id, branch_id, category_id, created_at, updated_at) VALUES
  -- 東京店舗 売上 (生鮮食品/加工食品/菓子/飲料/惣菜)
  (1, 1, 1, unixepoch(), unixepoch()),
  (2, 1, 2, unixepoch(), unixepoch()),
  (3, 1, 3, unixepoch(), unixepoch()),
  (4, 1, 4, unixepoch(), unixepoch()),
  (5, 1, 5, unixepoch(), unixepoch()),
  -- 東京店舗 費用 (人件費/水道光熱費/広告宣伝費/物流費/その他経費)
  (6, 1, 8, unixepoch(), unixepoch()),
  (7, 1, 9, unixepoch(), unixepoch()),
  (8, 1, 10, unixepoch(), unixepoch()),
  (9, 1, 11, unixepoch(), unixepoch()),
  (10, 1, 12, unixepoch(), unixepoch()),
  -- 大阪店舗 売上 (菓子/飲料/おもちゃ/日用品)
  (11, 2, 3, unixepoch(), unixepoch()),
  (12, 2, 4, unixepoch(), unixepoch()),
  (13, 2, 6, unixepoch(), unixepoch()),
  (14, 2, 7, unixepoch(), unixepoch()),
  -- 大阪店舗 経費 (人件費/広告宣伝費/物流費/その他経費, 販管費)
  (15, 2, 8, unixepoch(), unixepoch()),
  (16, 2, 10, unixepoch(), unixepoch()),
  (17, 2, 11, unixepoch(), unixepoch()),
  (18, 2, 12, unixepoch(), unixepoch()),
  (19, 2, 14, unixepoch(), unixepoch()),
  -- 名古屋店舗 売上 (生鮮食品/菓子/飲料/惣菜/日用品)
  (20, 3, 1, unixepoch(), unixepoch()),
  (21, 3, 3, unixepoch(), unixepoch()),
  (22, 3, 4, unixepoch(), unixepoch()),
  (23, 3, 5, unixepoch(), unixepoch()),
  (24, 3, 7, unixepoch(), unixepoch()),
  -- 名古屋店舗 経費 (人件費/広告宣伝費/物流費/その他経費/雑費)
  (25, 3, 8, unixepoch(), unixepoch()),
  (26, 3, 10, unixepoch(), unixepoch()),
  (27, 3, 11, unixepoch(), unixepoch()),
  (28, 3, 12, unixepoch(), unixepoch()),
  (29, 3, 13, unixepoch(), unixepoch());
