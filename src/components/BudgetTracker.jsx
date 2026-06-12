import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const ICON_MAP = {
  UtensilsCrossed: '🍽️', Car: '🚗', ShoppingBag: '🛍️', Gamepad2: '🎮',
  Home: '🏠', Zap: '⚡', HeartPulse: '💊', BookOpen: '📚',
  Phone: '📱', MoreHorizontal: '📌', Briefcase: '💼', TrendingUp: '📈', PlusCircle: '➕',
};

export default function BudgetTracker({ budgets, categories, onSetBudget, onDeleteBudget }) {
  const [showForm, setShowForm] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('monthly');

  const expenseCats = categories.filter((c) => c.type === 'expense');

  const handleSubmit = () => {
    if (!categoryId || !amount) return;
    const budgetAmount = parseFloat(amount);
    if (isNaN(budgetAmount) || budgetAmount <= 0) return;

    const existing = budgets.find((b) => b.categoryId === categoryId && b.period === period);
    onSetBudget({
      id: existing?.id || `budget_${categoryId}_${period}`,
      categoryId,
      amount: budgetAmount,
      period,
    });
    setShowForm(false);
    setCategoryId('');
    setAmount('');
  };

  const getCatInfo = (catId) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? { name: cat.name, icon: ICON_MAP[cat.icon] || '📌', color: cat.color } : { name: catId, icon: '📌', color: '#94a3b8' };
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-slate-700">预算设置</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 text-white text-xs font-medium rounded-lg hover:bg-indigo-600"
        >
          <Plus className="w-3.5 h-3.5" /> 添加预算
        </button>
      </div>

      {showForm && (
        <div className="glass-card rounded-2xl p-4 space-y-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">分类</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            >
              <option value="">选择分类</option>
              {expenseCats.map((cat) => (
                <option key={cat.id} value={cat.id}>{ICON_MAP[cat.icon] || '📌'} {cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">预算金额</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">¥</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="flex-1 py-2 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600"
            >
              保存预算
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="glass-card rounded-2xl p-4">
        {budgets.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            <span className="text-3xl block mb-2">💰</span>
            还没有设置任何预算
          </div>
        ) : (
          <div className="space-y-3">
            {budgets.map((b) => {
              const info = getCatInfo(b.categoryId);
              return (
                <div key={b.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: info.color + '18' }}>
                    {info.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-700">{info.name}</div>
                    <div className="text-xs text-slate-400">{b.period === 'monthly' ? '每月' : '每年'}预算 ¥{b.amount}</div>
                  </div>
                  <button
                    onClick={() => onDeleteBudget(b.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
