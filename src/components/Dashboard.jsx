import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingDown, TrendingUp, Wallet, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const ICON_MAP = {
  UtensilsCrossed: '🍽️', Car: '🚗', ShoppingBag: '🛍️', Gamepad2: '🎮',
  Home: '🏠', Zap: '⚡', HeartPulse: '💊', BookOpen: '📚',
  Phone: '📱', MoreHorizontal: '📌', Briefcase: '💼', TrendingUp: '📈',
  PlusCircle: '➕', HelpCircle: '❓',
};

export default function Dashboard({ transactions, categories, getCategoryById, budgets }) {
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = today.slice(0, 7);
  const currentYear = today.slice(0, 4);

  const stats = useMemo(() => {
    const todayTxs = transactions.filter((t) => t.date === today);
    const monthTxs = transactions.filter((t) => t.date.startsWith(currentMonth));
    const yearTxs = transactions.filter((t) => t.date.startsWith(currentYear));

    const todayExpense = todayTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const todayIncome = todayTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const monthExpense = monthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const monthIncome = monthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const yearExpense = yearTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const [y, m] = currentMonth.split('-').map(Number);
    const lastMonth = m === 1
      ? (y - 1) + '-12'
      : y + '-' + String(m - 1).padStart(2, '0');
    const lastMonthExpense = transactions
      .filter((t) => t.date.startsWith(lastMonth) && t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    const monthChange = lastMonthExpense > 0
      ? ((monthExpense - lastMonthExpense) / lastMonthExpense * 100)
      : 0;

    return { todayExpense, todayIncome, monthExpense, monthIncome, yearExpense, monthChange };
  }, [transactions, today, currentMonth, currentYear]);

  const dailyTrend = useMemo(() => {
    const days = [];
    const [y, m] = currentMonth.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      const date = currentMonth + '-' + String(d).padStart(2, '0');
      const total = transactions
        .filter((t) => t.date === date && t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0);
      days.push({ date: d + '日', amount: Math.round(total * 100) / 100 });
    }
    return days;
  }, [transactions, currentMonth]);

  const categoryPie = useMemo(() => {
    const map = {};
    transactions
      .filter((t) => t.date.startsWith(currentMonth) && t.type === 'expense')
      .forEach((t) => {
        const cat = getCategoryById(t.category);
        const key = cat.name;
        if (!map[key]) map[key] = { name: key, value: 0, color: cat.color, icon: ICON_MAP[cat.icon] || '📌' };
        map[key].value += t.amount;
      });
    return Object.values(map)
      .map((v) => ({ ...v, value: Math.round(v.value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, currentMonth, getCategoryById]);

  const budgetUsage = useMemo(() => {
    if (!budgets || budgets.length === 0) return [];

    const now = new Date();
    const curYm = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');

    return budgets
      .filter((b) => b.period === 'monthly')
      .map((b) => {
        const spent = transactions
          .filter((t) => t.date.startsWith(curYm) && t.type === 'expense' && t.category === b.categoryId)
          .reduce((s, t) => s + t.amount, 0);
        const cat = getCategoryById(b.categoryId);
        return {
          ...b,
          spent: Math.round(spent * 100) / 100,
          percentage: b.amount > 0 ? Math.min(Math.round((spent / b.amount) * 100), 100) : 0,
          catName: cat.name,
          catIcon: ICON_MAP[cat.icon] || '📌',
          catColor: cat.color,
        };
      })
      .sort((a, b) => b.percentage - a.percentage);
  }, [budgets, transactions, getCategoryById]);

  const COLORS = ['#6366f1', '#f97316', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6', '#eab308', '#ef4444', '#22c55e', '#64748b'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-lg text-xs">
          <span className="text-slate-500">{label}</span>
          <span className="text-slate-800 font-semibold ml-2">¥{payload[0].value.toFixed(2)}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<TrendingDown className="w-4 h-4" />}
          label="今日支出"
          value={'¥' + stats.todayExpense.toFixed(2)}
          color="text-red-500"
          bg="bg-red-50"
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="今日收入"
          value={'¥' + stats.todayIncome.toFixed(2)}
          color="text-green-500"
          bg="bg-green-50"
        />
        <StatCard
          icon={<Calendar className="w-4 h-4" />}
          label="本月支出"
          value={'¥' + stats.monthExpense.toFixed(2)}
          color="text-indigo-500"
          bg="bg-indigo-50"
          trend={stats.monthChange}
        />
        <StatCard
          icon={<Wallet className="w-4 h-4" />}
          label="本年支出"
          value={'¥' + stats.yearExpense.toFixed(2)}
          color="text-slate-600"
          bg="bg-slate-50"
        />
      </div>

      {/* 月度趋势图 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">📊 本月每日支出趋势</h3>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" fill="url(#barGradient)" radius={[6, 6, 0, 0]} maxBarSize={24} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 分类饼图 + 预算 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">🍩 本月消费分类</h3>
          {categoryPie.length > 0 ? (
            <>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPie}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryPie.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color || COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => '¥' + value.toFixed(2)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 mt-2">
                {categoryPie.slice(0, 5).map((cat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <span>{cat.icon}</span>
                    <span className="text-slate-600 flex-1">{cat.name}</span>
                    <span className="text-slate-400">¥{cat.value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm">本月暂无消费数据</div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">📋 预算使用情况</h3>
          {budgetUsage.length > 0 ? (
            <div className="space-y-4">
              {budgetUsage.map((b) => (
                <div key={b.id}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span>{b.catIcon}</span>
                      <span className="text-slate-600 font-medium">{b.catName}</span>
                    </span>
                    <span className={'font-semibold ' + (b.percentage >= 90 ? 'text-red-500' : b.percentage >= 70 ? 'text-amber-500' : 'text-slate-500')}>
                      ¥{b.spent.toFixed(0)} / ¥{b.amount}
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={'h-full rounded-full transition-all duration-500 ' +
                        (b.percentage >= 90 ? 'bg-gradient-to-r from-red-500 to-rose-500' : b.percentage >= 70 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500')
                      }
                      style={{ width: b.percentage + '%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm">暂无预算设置</div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, bg, trend }) {
  return (
    <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
      <div className={'w-8 h-8 rounded-lg ' + bg + ' flex items-center justify-center mb-2'}>
        <span className={color}>{icon}</span>
      </div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className={'text-base font-bold mt-0.5 ' + color}>{value}</p>
      {trend !== undefined && (
        <div className={'flex items-center gap-0.5 text-xs mt-1 ' + (trend >= 0 ? 'text-red-500' : 'text-green-500')}>
          {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          <span>{Math.abs(trend).toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
}
