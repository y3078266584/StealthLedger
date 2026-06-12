## Summary

项目结构重构：清理未使用文件，提取常量，重组目录层级，新增 Agent 指南文档。

## Changes

### 新增
- `AGENTS.md` — Codex Agent 项目指南（架构、命令、数据流、编码规则）
- `src/constants/categories.js` — 商户名→消费分类关键词映射（从 App.jsx 提取）

### 重组
- `src/plugin/autoBilling.ts` → `src/services/autoBilling.ts`
- `src/utils/db.js` → `src/services/db.js`
- 新增 `src/services/` 服务层和 `src/constants/` 常量层

### 移除（未使用文件）
- `src/App.css` — 未被任何组件引用
- `src/assets/react.svg`、`vite.svg` — Vite 脚手架残留
- `src/assets/hero.png` — 未被引用

### 路径更新
- 全部 6 处跨文件导入路径已更新（`App.jsx`、`Settings.jsx`、`useData.js`、`parser.js`）
- `README.md` 项目结构树已同步

## Validation
- `npm run build` ✓ built in 768ms
- 产物 `dist/` 完整，功能无变化
