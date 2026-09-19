"use strict";
// 「社内限定」等の内部限定マーカー検知ロジック(純粋関数)。
// .githooks/pre-commit と .githooks/pre-push の両方から使う共通モジュール
// (2026-09-19新設、単一の出所にしないと2箇所で定義がズレるため)。
//
// 実際に起きた事故(2026-08-25、line-auto商品化):
//   `価格根拠.md`は冒頭に「社内限定」「コミット可否は社長判断」と自己申告していたが、
//   無関係な種別BのPRをsquash mergeした際に作業ツリーの業務記録が巻き込まれ、
//   原価・粗利率まで origin/main へpush済み(取り消し不可、ChatGPT読み取り専用連携先でもある)
//   になっていた。警告文はアクセス制御ではないと判明したため、機械チェックを追加する。

const INTERNAL_ONLY_MARKERS = [/社内限定/, /コミット可否は社長判断/, /持ち出し禁止/];

// このモジュール・呼び出し元フックの定義文にはマーカーの語そのものを書く必要があるため、
// 自己参照による誤検知を避けて .githooks/ 配下自身の差分は判定対象から除く。
function stripOwnHookDiff(addedContentUnified0) {
  return addedContentUnified0
    .split(/(?=^diff --git )/m)
    .filter((chunk) => !chunk.startsWith("diff --git") || !chunk.includes(".githooks/"))
    .join("");
}

/**
 * `git diff --unified=0` 相当のテキストから、追加行(+始まり)に
 * 内部限定マーカーが含まれるかを判定する。
 * @param {string} addedContentUnified0
 * @returns {boolean}
 */
function hasNewInternalOnlyMarker(addedContentUnified0) {
  const target = stripOwnHookDiff(String(addedContentUnified0 || ""));
  return INTERNAL_ONLY_MARKERS.some((re) => new RegExp(`^\\+.*${re.source}`, "m").test(target));
}

module.exports = { INTERNAL_ONLY_MARKERS, stripOwnHookDiff, hasNewInternalOnlyMarker };
