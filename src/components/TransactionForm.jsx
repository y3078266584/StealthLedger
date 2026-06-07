import { useState } from 'react';
import { X, Plus, Calendar } from 'lucide-react';
import { generateId } from '../utils/parser.js';

export default function TransactionForm({ categories, onSubmit, onClose, editingTx }) {
  const [amount, setAmount] = useState(editingTx?.amount?.toString() || '');
  const [category, setCategory] = useState(editingTx?.category || 'food');
  const [type, setType] = useState(editingTx?.type || 'expense');
  const [date, setDate] = useState(editingTx?.date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(editingTx?.time || new Date().toTimeString().slice(0, 5));
  const [merchant, setMerchant] = useState(editingTx?.merchant || '');
  const [note, setNote] = useState(editingTx?.note || '');
  const [platform, setPlatform] = useState(editingTx?.platform || 'manual');

  const expenseCats = categories.filter((c) => c.type === 'expense');
  const incomeCats = categories.filter((c) => c.type === 'income');
  const currentCats = type === 'expense' ? expenseCats : incomeCats;

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    onSubmit({
      id: editingTx?.id || generateId(),
      amount: numAmount,
      category,
      type,
      date,
      time,
      merchant: merchant.trim() || (currentCats.find(c => c.id === category)?.name || '手动记账'),
      note: note.trim(),
      platform,
      source: platform === 'manual' ? 'manual' : 'auto',
    });

    if (!editingTx) {
      setAmount('');
      setMerchant('');
      setNote('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center backdrop-blur-sm">
      <div className="bg-white w-full md:w-96 md:rounded-2xl rounded-t-2xl p-5 animate-slideUp max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-slate-800">
            {editingTx ? '编辑交易' : '记一笔'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 收支类型切换 */}
          <div className="flex bg-slate-100 rounded-xl p-1">
            {['expense', 'income'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setType(t); setCategory(t === 'expense' ? 'food' : 'salary'); }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                  ${type === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t === 'expense' ? '💰 支出' : '💵 收入'}
              </button>
            ))}
          </div>

          {/* 金额 */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">金额</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400">¥</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-semibold
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                autoFocus
                required
              />
            </div>
          </div>

          {/* 分类 */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">分类</label>
            <div className="grid grid-cols-4 gap-2">
              {currentCats.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-xs transition-all duration-200
                    ${category === cat.id
                      ? 'bg-indigo-50 ring-1 ring-indigo-300 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                >
                  <span className="text-lg">{getIcon(cat.icon)}</span>
                  <span className="text-slate-600">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 商户 */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">商户/备注</label>
            <input
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="例如：星巴克"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
            />
          </div>

          {/* 日期和时间 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">日期</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">时间</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              />
            </div>
          </div>

          {/* 付款平台 - NEW */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">付款平台</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'manual', label: '手动', emoji: '✏️', color: 'bg-slate-100 border-slate-200' },
                { id: 'alipay', label: '支付宝', emoji: '🔵', color: 'bg-blue-50 border-blue-300' },
                { id: 'wechat', label: '微信', emoji: '🟢', color: 'bg-green-50 border-green-300' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPlatform(opt.id)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium border transition-all duration-200
                    ${platform === opt.id
                      ? opt.color + ' shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                >
                  <span className="text-base">{opt.emoji}</span>
                  <span className="text-slate-600">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 备注 */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">备注（可选）</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="添加备注..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
            />
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-medium rounded-xl
              transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-indigo-200"
          >
            <Plus className="w-4 h-4" />
            {editingTx ? '保存修改' : '添加记录'}
          </button>
        </form>
      </div>
    </div>
  );
}

const ICON_MAP = {
  UtensilsCrossed: '🍽️', Car: '🚗', ShoppingBag: '🛍️', Gamepad2: '🎮',
  Home: '🏠', Zap: '⚡', HeartPulse: '💊', BookOpen: '📚',
  Phone: '📱', MoreHorizontal: '📌', Briefcase: '💼', TrendingUp: '📈',
  PlusCircle: '➕', HelpCircle: '❓',
};

function getIcon(iconName) {
  return ICON_MAP[iconName] || '📌';
}
