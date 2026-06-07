import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';

const ICON_OPTIONS = [
  { id: 'UtensilsCrossed', emoji: '🍽️', label: '餐饮' },
  { id: 'Car', emoji: '🚗', label: '交通' },
  { id: 'ShoppingBag', emoji: '🛍️', label: '购物' },
  { id: 'Gamepad2', emoji: '🎮', label: '娱乐' },
  { id: 'Home', emoji: '🏠', label: '住房' },
  { id: 'Zap', emoji: '⚡', label: '水电' },
  { id: 'HeartPulse', emoji: '💊', label: '医疗' },
  { id: 'BookOpen', emoji: '📚', label: '教育' },
  { id: 'Phone', emoji: '📱', label: '通讯' },
  { id: 'MoreHorizontal', emoji: '📌', label: '其他' },
  { id: 'Briefcase', emoji: '💼', label: '工资' },
  { id: 'TrendingUp', emoji: '📈', label: '投资' },
  { id: 'PlusCircle', emoji: '➕', label: '收入' },
];

const COLOR_OPTIONS = [
  '#f97316', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6',
  '#eab308', '#ef4444', '#6366f1', '#22c55e', '#64748b',
  '#06b6d4', '#f43f5e', '#84cc16', '#a855f7',
];

export default function CategoryManager({ categories, transactions, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [icon, setIcon] = useState('MoreHorizontal');
  const [color, setColor] = useState('#64748b');

  // Count transactions per category
  const txCounts = {};
  if (transactions) {
    transactions.forEach(t => {
      txCounts[t.category] = (txCounts[t.category] || 0) + 1;
    });
  }

  const expenseCats = categories.filter((c) => c.type === 'expense');
  const incomeCats = categories.filter((c) => c.type === 'income');

  const resetForm = () => {
    setName('');
    setType('expense');
    setIcon('MoreHorizontal');
    setColor('#64748b');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    const cat = {
      id: editingId || `${type}_${Date.now()}`,
      name: name.trim(),
      type,
      icon,
      color,
    };
    if (editingId) {
      onUpdate(cat);
    } else {
      onAdd(cat);
    }
    resetForm();
  };

  const startEdit = (cat) => {
    setName(cat.name);
    setType(cat.type);
    setIcon(cat.icon);
    setColor(cat.color);
    setEditingId(cat.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-slate-700">管理分类</h3>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 text-white text-xs font-medium rounded-lg hover:bg-indigo-600"
        >
          <Plus className="w-3.5 h-3.5" /> 添加分类
        </button>
      </div>

      {/* 添加/编辑表单 */}
      {showForm && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="分类名称"
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              autoFocus
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            >
              <option value="expense">支出</option>
              <option value="income">收入</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">图标</label>
            <div className="flex flex-wrap gap-1.5">
              {ICON_OPTIONS.filter((i) => {
                if (type === 'expense') return !['Briefcase', 'TrendingUp', 'PlusCircle'].includes(i.id);
                return !['UtensilsCrossed', 'Car', 'ShoppingBag', 'Gamepad2', 'Home', 'Zap', 'HeartPulse', 'BookOpen', 'Phone'].includes(i.id);
              }).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setIcon(opt.id)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center
                    ${icon === opt.id ? 'bg-indigo-100 ring-1 ring-indigo-300' : 'bg-slate-50 hover:bg-slate-100'}`}
                  title={opt.label}
                >
                  {opt.emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">颜色</label>
            <div className="flex flex-wrap gap-1.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all
                    ${color === c ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSubmit}
              className="flex-1 py-2 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 flex items-center justify-center gap-1"
            >
              <Check className="w-4 h-4" /> {editingId ? '保存' : '添加'}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 支出分类 */}
      <div className="bg-white rounded-2xl p-4">
        <h4 className="text-xs font-medium text-slate-400 mb-3">支出分类</h4>
        <div className="space-y-2">
          {expenseCats.map((cat) => (
            <CategoryRow key={cat.id} cat={cat} count={txCounts[cat.id] || 0} onEdit={startEdit} onDelete={onDelete} />
          ))}
        </div>
      </div>

      {/* 收入分类 */}
      <div className="bg-white rounded-2xl p-4">
        <h4 className="text-xs font-medium text-slate-400 mb-3">收入分类</h4>
        <div className="space-y-2">
          {incomeCats.map((cat) => (
            <CategoryRow key={cat.id} cat={cat} count={txCounts[cat.id] || 0} onEdit={startEdit} onDelete={onDelete} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryRow({ cat, count, onEdit, onDelete }) {
  const EMOJI_MAP = {
    UtensilsCrossed: '🍽️', Car: '🚗', ShoppingBag: '🛍️', Gamepad2: '🎮',
    Home: '🏠', Zap: '⚡', HeartPulse: '💊', BookOpen: '📚',
    Phone: '📱', MoreHorizontal: '📌', Briefcase: '💼', TrendingUp: '📈',
    PlusCircle: '➕', HelpCircle: '❓',
  };

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: cat.color + '18' }}>
        {EMOJI_MAP[cat.icon] || '📌'}
      </div>
      <span className="flex-1 text-sm text-slate-700 font-medium">{cat.name}
      {count > 0 && <span className="ml-2 text-xs text-slate-400">({count} 笔)</span>}
      </span>
      <button onClick={() => onEdit(cat)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-500">
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button onClick={() => onDelete(cat.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
