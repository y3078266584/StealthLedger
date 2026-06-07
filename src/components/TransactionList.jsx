import { useState, useMemo } from "react";
import { Search, Pencil, Trash2, CheckSquare, Square, X, Trash2 as TrashIcon } from "lucide-react";

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
    try {
      await onBatchDelete([...selected]);
      exitSelectMode();
    } catch (e) {
      alert("删除失败，请重试");
    }
    setDeleting(false);
  };

  const handleChangeCategory = (txId, newCatId) => {
    setChangingCat(null);
    if (onChangeCategory) onChangeCategory(txId, newCatId);
  };

  const handleChangeType = (txId, newType) => {
    setChangingType(null);
    if (onChangeType) onChangeType(txId, newType);
  };

  const sameTypeCats = (type) => categories.filter(c => c.type === type);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 space-y-3 shadow-sm border border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索商户、备注..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow" />
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="all">全部类型</option>
            <option value="expense">支出</option>
            <option value="income">收入</option>
          </select>
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">全部月份</option>
            {months.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          {filterCategory && (
            <button onClick={() => setFilterCategory("")}
              className="px-2.5 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-lg flex items-center gap-1 hover:bg-indigo-100 transition-colors">
              {getCategoryById(filterCategory).name} <X className="w-3 h-3" />
            </button>
          )}
          <div className="flex-1" />
          <button onClick={() => setSelectMode(!selectMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${selectMode ? "bg-indigo-50 text-indigo-600 border-indigo-200" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"}`}>
            <CheckSquare className="w-3.5 h-3.5 inline mr-1" />批量选择
          </button>
        </div>
        {selectMode && (
          <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
            <button onClick={toggleAll} className="text-xs text-indigo-500 font-medium hover:text-indigo-600 transition-colors">
              {selected.size === filtered.length ? "取消全选" : "全选 (" + filtered.length + ")"}
            </button>
            <span className="text-xs text-slate-400">已选 {selected.size} 笔</span>
          </div>
        )}
      </div>

      <div className="flex gap-3 text-xs text-slate-500 px-1">
        <span>共 {filtered.length} 笔</span>
        {totalExpense > 0 && <span className="text-red-500">支出 ¥{totalExpense.toFixed(2)}</span>}
        {totalIncome > 0 && <span className="text-green-500">收入 ¥{totalIncome.toFixed(2)}</span>}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16"><div className="text-4xl mb-3">📭</div><p className="text-slate-400 text-sm">暂无交易记录</p><p className="text-slate-300 text-xs mt-1">点击右下角 + 开始记账</p></div>
      ) : (
        <>
          {Object.entries(grouped).map(([dateLabel, txs]) => (
            <div key={dateLabel}>
              <div className="text-xs font-medium text-slate-400 px-1 mb-2 mt-4 first:mt-0 sticky top-0 bg-slate-100/80 backdrop-blur-sm py-1 z-10">{dateLabel}</div>
              <div className="space-y-1.5">
                {txs.map((tx) => {
                  const cat = getCategoryById(tx.category);
                  const showPicker = changingCat === tx.id;
                  return (
                    <div key={tx.id} onClick={() => selectMode && toggleSelect(tx.id)}
                      className={`bg-white rounded-2xl p-3 flex items-center gap-3 transition-all duration-200 border shadow-sm
                        ${selectMode && selected.has(tx.id) ? "border-indigo-300 bg-indigo-50/50 shadow-md" : "border-slate-100 hover:border-slate-200 hover:shadow-md"} ${selectMode ? "cursor-pointer" : ""}`}>
                      {selectMode && (
                        <div className="shrink-0">{selected.has(tx.id) ? <CheckSquare className="w-5 h-5 text-indigo-500" /> : <Square className="w-5 h-5 text-slate-300" />}</div>
                      )}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: cat.color + "18" }}>
                        {ICON_MAP[cat.icon] || "📌"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-800 truncate">{tx.merchant}</span>
                          {tx.source === "auto" && <span className="text-[10px] text-amber-500 shrink-0" title="自动捕获">⚡</span>}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5 flex-nowrap min-w-0">
                          {showPicker ? (
                            <select value={tx.category} onChange={(e) => handleChangeCategory(tx.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()} onBlur={() => setChangingCat(null)}
                              className="text-xs font-medium bg-indigo-50 border border-indigo-200 rounded-md px-1.5 py-0.5 text-indigo-600 focus:outline-none shrink-0" autoFocus>
                              {sameTypeCats(tx.type).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          ) : (
                            <>
                              <button onClick={(e) => { e.stopPropagation(); setFilterCategory(filterCategory === tx.category ? "" : tx.category); }}
                                className="hover:text-indigo-600 transition-colors shrink-0 truncate max-w-[80px]" title={filterCategory === tx.category ? "点击取消筛选" : "点击筛选此分类"}>
                                <span className={filterCategory === tx.category ? "text-indigo-600 font-medium" : ""}>{cat.name}{filterCategory === tx.category ? " ×" : ""}</span>
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setChangingCat(tx.id); }}
                                className="shrink-0 p-0.5 rounded hover:bg-slate-100 text-slate-300 hover:text-indigo-500 transition-colors" title="修改分类">
                                <Pencil className="w-2.5 h-2.5" />
                              </button>
                            </>
                          )}
                          {!showPicker && <PlatformBadge platform={tx.platform} />}
                          {!showPicker && <span className="shrink-0">{tx.time}</span>}
                          {!showPicker && (
                            <div className="relative">
                              <button onClick={(e) => { e.stopPropagation(); setChangingType(tx.id); }}
                                className="shrink-0 p-0.5 rounded hover:bg-slate-100 text-slate-300 hover:text-indigo-500 transition-colors" title="修改类型">
                                <Pencil className="w-2.5 h-2.5" />
                              </button>
                              {changingType === tx.id && (
                                <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-24" onClick={(e) => e.stopPropagation()}>
                                  <button onClick={() => handleChangeType(tx.id, "expense")}
                                    className={`w-full text-left px-3 py-1.5 text-xs ${tx.type === "expense" ? "text-red-600 font-semibold bg-red-50" : "text-slate-600 hover:bg-slate-50"}`}>支出</button>
                                  <button onClick={() => handleChangeType(tx.id, "income")}
                                    className={`w-full text-left px-3 py-1.5 text-xs ${tx.type === "income" ? "text-green-600 font-semibold bg-green-50" : "text-slate-600 hover:bg-slate-50"}`}>收入</button>
                                  <button onClick={() => setChangingType(null)}
                                    className="w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-50">取消</button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {!selectMode && !showPicker && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-sm font-semibold whitespace-nowrap ${tx.type === "expense" ? "text-slate-800" : "text-green-600"}`}>
                            {tx.type === "expense" ? "-" : "+"}¥{tx.amount.toFixed(2)}
                          </span>
                          <div className="flex gap-0.5">
                            <button onClick={(e) => { e.stopPropagation(); onEdit(tx); }}
                              className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-500 transition-colors" title="编辑">
                              <Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(tx.id); }}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="删除">
                              <Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      )}
                      {(selectMode || showPicker) && (
                        <span className={`text-sm font-semibold whitespace-nowrap shrink-0 ${tx.type === "expense" ? "text-slate-800" : "text-green-600"}`}>
                          {tx.type === "expense" ? "-" : "+"}¥{tx.amount.toFixed(2)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}

      {selectMode && selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl flex items-center justify-between animate-slide-up md:left-64">
          <span className="text-sm font-medium text-slate-700">已选择 {selected.size} 笔</span>
          <div className="flex gap-2">
            <button onClick={exitSelectMode} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-1.5">
              <X className="w-4 h-4" /> 取消
            </button>
            <button onClick={handleBatchDelete} disabled={deleting}
              className="px-4 py-2 text-sm text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-xl hover:from-red-600 hover:to-rose-600 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md shadow-red-200">
              <TrashIcon className="w-4 h-4" />
              {deleting ? "删除中..." : "删除 " + selected.size + " 笔"}
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
  if (dateStr === today) return "今天";
  if (dateStr === yesterday) return "昨天";
  const d = new Date(dateStr);
  const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return (d.getMonth() + 1) + "月" + d.getDate() + "日 " + weekDays[d.getDay()];
}
