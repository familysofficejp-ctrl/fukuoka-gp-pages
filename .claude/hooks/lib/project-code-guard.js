"use strict";
// projects/配下に実装コードファイルを作らせないための判定ロジック(純粋関数)。
// 三層モデル(docs/AI会社OS設計書.md「三層アーキテクチャ」参照)の
// 「案件記録層(projects/<案件名>/)にコードを置かない」を仕組みで担保する。
// I/O(git解決・stdin)は guard-project-code.js 側が担う。
//
// 対象拡張子はアプリケーション実装コードとみなすもののみ。データ(.json/.yml)は
// 対象外(調査データ等、正当な用途があるため)。
//
// 2026-09-02追記: .html/.cssは元々「マークアップ/スタイルであり参考スニペット等の
// 正当用途がある」として対象外にしていたが、単一HTMLファイル(CSS/JS埋め込みの
// 自己完結モックアップ)がそのまま「実装物」としてprojects/配下に置かれる事故が
// 2件連続で発生した(福岡愛苑_HP制作、CLAUDE.md「本社・支社」節参照)。参考スニペットが
// 必要な場合はMarkdownのコードフェンス内に置けば足りるため、除外をやめてブロック対象に
// 追加した。

const CODE_EXTENSIONS = new Set([
  "js", "jsx", "mjs", "cjs", "ts", "tsx",
  "py", "rb", "php", "java", "go", "rs", "cs",
  "swift", "kt", "kts", "c", "cpp", "cc", "cxx", "h", "hpp",
  "m", "mm", "scala", "ex", "exs", "clj", "lua", "pl", "sql",
  "sh", "ps1", "psm1",
  "html", "htm", "css",
]);

// 動画は「他社サイトの参考スクリーンショット」のような正当な参照用途がほぼ無く、
// 実質的に常に実装物(埋め込みアセット)としてのみ使われるため、拡張子ベースで
// 一律ブロックする。静止画(jpg/png等)は参照資料としての正当用途が多いため対象外のまま。
const MEDIA_EXTENSIONS = new Set(["mp4", "mov", "webm", "avi", "mkv", "m4v"]);

/**
 * リポジトリルート相対パス(スラッシュ区切り)が、projects/配下の
 * ブロック対象コード/実装アセットファイルかどうかを判定する。
 * @param {string} relPath
 * @returns {{blocked: boolean, ext: string|null}}
 */
function checkProjectCode(relPath) {
  const rel = String(relPath || "");
  if (!rel.startsWith("projects/")) return { blocked: false, ext: null };

  const base = rel.split("/").pop() || "";
  const dot = base.lastIndexOf(".");
  if (dot <= 0) return { blocked: false, ext: null }; // 拡張子なし、または隠しファイル

  const ext = base.slice(dot + 1).toLowerCase();
  return { blocked: CODE_EXTENSIONS.has(ext) || MEDIA_EXTENSIONS.has(ext), ext };
}

module.exports = { checkProjectCode, CODE_EXTENSIONS, MEDIA_EXTENSIONS };
