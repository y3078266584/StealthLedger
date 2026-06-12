import { useState, useMemo } from "react";
import { Search, Pencil, Trash2, CheckSquare, Square, X, Trash2 as TrashIcon, Filter } from "lucide-react";

const ICON_MAP = {
  UtensilsCrossed: "🍽️", Car: "🚗", ShoppingBag: "🛍️", Gamepad2: "🎮",
  Home: "🏠", Zap: "⚡", HeartPulse: "💊", BookOpen: "📚",
  Phone: "📱", MoreHorizontal: "📌", Briefcase: "💼", TrendingUp: "📈",
  PlusCircle: "➕", HelpCircle: "❓",
};

function PlatformBadge({ platform }) {
  if (platform === "alipay") {
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium text-white shadow-sm whitespace-nowrap shrink-0"
        style={{background: "linear-gradient(135deg, #1677FF, #4096FF)"}}>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="10"/></svg>
        支付宝
      </span>
    );
  }
  if (platform === "wechat") {
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium text-white shadow-sm whitespace-nowrap shrink-0"
        style={{background: "linear-gradient(135deg, #07C160, #06AD56)"}}>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="10"/></svg>
        微信
      </span>
    );
  }
  return null;
}

export default function TransactionList({ transactions, categories, getCategoryById, onEdit, onDelete, onBatchDelete, onChangeCategory, onChangeType }) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterMonth, setFilterMonth] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterCategory, setFilterCategory] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const [changingCat, setChangingCat] = useState(null);
  const [changingType, setChangingType] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const months = useMemo(() => {
    const set = new Set(transactions.map((t) => t.date.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [transactions]);

  const filtered = useMemo(() => {
    let result = [...transactions];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) => t.merchant?.toLowerCase().includes(q) || t.note?.toLowerCase().includes(q) || t.platform?.toLowerCase().includes(q));
    }
    if (filterType !== "all") result = result.filter((t) => t.type === filterType);
    if (filterMonth) result = result.filter((t) => t.date.startsWith(filterMonth));
    if (filterCategory) result = result.filter((t) => t.category === filterCategory);
    result.sort((a, b) => {
      const da = a.date + (a.time || "00:00");
      const db = b.date + (b.time || "00:00");
      return sortOrder === "desc" ? db.localeCompare(da) : da.localeCompare(db);
    });
    return result;
  }, [transactions, search, filterType, filterMonth, sortOrder, filterCategory]);

  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach((t) => {
      const dateLabel = formatDateLabel(t.date);
      if (!groups[dateLabel]) groups[dateLabel] = [];
      groups[dateLabel].push(t);
    });
    return groups;
  }, [filtered]);

  const totalExpense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalIncome = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);

  const toggleSelect = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((t) => t.id)));
  };
  const exitSelectMode = () => { setSelectMode(false); setSelected(new Set()); };

  const handleBatchDelete = async () => {
    if (selected.size === 0 || !onBatchDelete) return;
    setDeleting(true);
    try { await onBatchDelete([...selected]); exitSelectMode(); }
    catch (e) { alert("删除失败，请重试"); }
    setDeleting(false);
  };

  const handleChangeCategory = (txId, newCatId) => { setChangingCat(null); if (onChangeCategory) onChangeCategory(txId, newCatId); };
  const handleChangeType = (txId, newType) => { setChangingType(null); if (onChangeType) onChangeType(txId, newType); };
  const sameTypeCats = (type) => categories.filter(c => c.type === type);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Filter bar */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索商户、备注..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 placeholder:text-slate-400
                transition-all"
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-xl border transition-all ${
              showFilters ? "bg-indigo-50 border-indigo-200 text-indigo-500" : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}
            className="px-2.5 py-2 text-xs bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-600">
            <option value="desc">最新</option>
            <option value="asc">最早</option>
          </select>
          <button onClick={() => setSelectMode(!selectMode)}
            className={`px-3 py-2 text-xs rounded-xl font-medium border transition-all ${
              selectMode ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}>
            {selectMode ? "取消" : "多选"}
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 animate-slideUp-sm">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 min-w-[80px] px-2.5 py-2 text-xs bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-600">
              <option value="all">全部类型</option>
              <option value="expense">支出</option>
              <option value="income">收入</option>
            </select>
            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}
              className="flex-1 min-w-[100px] px-2.5 py-2 text-xs bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-600">
              <option value="">全部月份</option>
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
              className="flex-1 min-w-[80px] px-2.5 py-2 text-xs bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-600">
              <option value="">全部分类</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}

        {/* Summary */}
        <div className="flex items-center gap-3 text-xs text-slate-400 pt-1 border-t border-slate-100/80">
          <span>{filtered.length} 笔交易</span>
          <span className="text-danger font-medium">支出 ¥{totalExpense.toFixed(2)}</span>
          <span className="text-success font-medium">收入 ¥{totalIncome.toFixed(2)}</span>
        </div>
      </div>

      {/* Transaction list */}
      {Object.keys(grouped).length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="text-3xl mb-2">📭</div>
          <p className="text-sm text-slate-400">暂无交易记录</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([dateLabel, txs]) => (
            <div key={dateLabel} className="glass-card rounded-2xl overflow-hidden">
              {/* Date header */}
              <div className="px-4 py-2.5 border-b border-slate-100/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectMode && (
                    <button onClick={toggleAll} className="text-slate-400 hover:text-indigo-500 transition-colors">
                      {selected.size === filtered.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>
                  )}
                  <span className="text-xs font-semibold text-slate-600">{dateLabel}</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {txs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0).toFixed(2)} 支出
                </span>
              </div>

              {/* Transaction rows */}
              <div className="divide-y divide-slate-50">
                {txs.map((tx) => {
                  const cat = getCategoryById(tx.category);
                  const icon = ICON_MAP[cat?.icon] || "📌";
                  return (
                    <div
                      key={tx.id}
                      className={`flex items-center gap-3 px-4 py-3 transition-all duration-150 ${
                        selectMode ? "hover:bg-slate-50 cursor-pointer" : "hover:bg-slate-50/50"
                      } ${selected.has(tx.id) ? "bg-indigo-50/40" : ""}`}
                      onClick={() => selectMode && toggleSelect(tx.id)}
                    >
                      {selectMode && (
                        <button onClick={(e) => { e.stopPropagation(); toggleSelect(tx.id); }}
                          className="text-slate-400 hover:text-indigo-500 transition-colors shrink-0">
                          {selected.has(tx.id) ? <CheckSquare className="w-4 h-4 text-indigo-500" /> : <Square className="w-4 h-4" />}
                        </button>
                      )}

                      {/* Category icon */}
                      <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-sm shrink-0">
                        {icon}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-700 truncate">{tx.merchant}</span>
                          <PlatformBadge platform={tx.platform} />
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-mono">{tx.time || tx.date?.slice(5)}</span>
                          <span className="text-[10px] text-slate-300">·</span>
                          <span className="text-[10px] text-slate-400">{cat?.name || "未分类"}</span>
                          {tx.note && (
                            <>
                              <span className="text-[10px] text-slate-300">·</span>
                              <span className="text-[10px] text-slate-400 truncate">{tx.note}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Amount + actions */}
                      {!selectMode && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="text-right">
                            <span className={`text-sm font-semibold stat-number ${tx.type === "expense" ? "text-slate-800" : "text-success"}`}>
                              {tx.type === "expense" ? "−" : "+"}{tx.amount.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex gap-0.5 ml-1">
                            <button onClick={(e) => { e.stopPropagation(); setChangingCat(tx.id); }}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-300 hover:text-indigo-500 transition-colors" title="修改分类">
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onEdit(tx); }}
                              className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-500 transition-colors" title="编辑">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(tx.id); }}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="删除">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                      {selectMode && (
                        <span className={`text-sm font-semibold stat-number shrink-0 ${tx.type === "expense" ? "text-slate-800" : "text-success"}`}>
                          {tx.type === "expense" ? "−" : "+"}{tx.amount.toFixed(2)}
                        </span>
                      )}

                      {/* Category change popup */}
                      {changingCat === tx.id && (
                        <div className="absolute right-4 mt-28 z-20 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-32 animate-scaleIn"
                          onClick={(e) => e.stopPropagation()}>
                          {sameTypeCats(tx.type).map((c) => (
                            <button key={c.id} onClick={() => handleChangeCategory(tx.id, c.id)}
                              className={`w-full text-left px-3 py-1.5 text-xs ${tx.category === c.id ? "text-indigo-600 font-semibold bg-indigo-50" : "text-slate-600 hover:bg-slate-50"}`}>
                              {ICON_MAP[c.icon] || "📌"} {c.name}
                            </button>
                          ))}
                          <button onClick={() => setChangingCat(null)}
                            className="w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-50">取消</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Batch delete bar */}
      {selectMode && selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl flex items-center justify-between animate-slideUp md:left-60">
          <span className="text-sm font-medium text-slate-700">已选择 {selected.size} 笔</span>
          <div className="flex gap-2">
            <button onClick={exitSelectMode}
              className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-1.5">
              <X className="w-4 h-4" /> 取消
            </button>
            <button onClick={handleBatchDelete} disabled={deleting}
              className="px-4 py-2 text-sm text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-xl hover:from-red-600 hover:to-rose-600 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md shadow-red-200">
              <TrashIcon className="w-4 h-4" />
              {deleting ? "删除中..." : `删除 ${selected.size} 笔`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDateLabel(dateStr) {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  if (dateStr === today) return "今天 Today";
  if (dateStr === yesterday) return "昨天 Yesterday";
  const d = new Date(dateStr);
  const weekDays = ["周日 Sun", "周一 Mon", "周二 Tue", "周三 Wed", "周四 Thu", "周五 Fri", "周六 Sat"];
  return (d.getMonth() + 1) + "/" + d.getDate() + " " + weekDays[d.getDay()];
}