import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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
    const lastMonth = m === 1 ? (y - 1) + '-12' : y + '-' + String(m - 1).padStart(2, '0');
    const lastMonthExpense = transactions
      .filter((t) => t.date.startsWith(lastMonth) && t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    const monthChange = lastMonthExpense > 0 ? ((monthExpense - lastMonthExpense) / lastMonthExpense * 100) : 0;
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
          ...b, spent: Math.round(spent * 100) / 100,
          percentage: b.amount > 0 ? Math.min(Math.round((spent / b.amount) * 100), 100) : 0,
          catName: cat.name, catIcon: ICON_MAP[cat.icon] || '📌', catColor: cat.color,
        };
      })
      .sort((a, b) => b.percentage - a.percentage);
  }, [budgets, transactions, getCategoryById]);

  const COLORS = ['#6366f1', '#f97316', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6', '#eab308', '#ef4444', '#22c55e', '#64748b'];

  const formatAmount = (n) => '¥' + n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Wallet className="w-4 h-4" />}
          label="今日支出"
          value={formatAmount(stats.todayExpense)}
          color="text-indigo-600"
          bg="bg-indigo-50"
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="今日收入"
          value={formatAmount(stats.todayIncome)}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <StatCard
          icon={<Calendar className="w-4 h-4" />}
          label="本月支出"
          value={formatAmount(stats.monthExpense)}
          color="text-indigo-600"
          bg="bg-indigo-50"
          trend={stats.monthChange}
        />
        <StatCard
          icon={<TrendingDown className="w-4 h-4" />}
          label="年度支出"
          value={formatAmount(stats.yearExpense)}
          color="text-amber-600"
          bg="bg-amber-50"
        />
      </div>

      {/* Daily trend chart */}
      <div className="glass-card rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          本月每日支出
          <span className="text-[10px] font-normal text-slate-400 ml-2">{currentMonth}</span>
        </h3>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyTrend} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} interval="preserveStartEnd" axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-lg text-xs">
                      <span className="text-slate-500">{label}</span>
                      <span className="text-slate-800 font-semibold ml-2">{formatAmount(payload[0].value)}</span>
                    </div>
                  ) : null
                }
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <Bar dataKey="amount" fill="url(#barGradient)" radius={[6, 6, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie chart + Budget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">消费分类</h3>
          {categoryPie.length > 0 ? (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPie}
                      cx="50%" cy="50%"
                      innerRadius={44} outerRadius={68}
                      paddingAngle={3} dataKey="value"
                    >
                      {categoryPie.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color || COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatAmount(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {categoryPie.slice(0, 5).map((cat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <span>{cat.icon}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-slate-600">{cat.name}</span>
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: cat.color || COLORS[idx % COLORS.length] }}
                      />
                    </div>
                    <span className="text-slate-400 font-medium">{formatAmount(cat.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm">本月暂无消费数据</div>
          )}
        </div>

        <div className="glass-card rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">预算进度</h3>
          {budgetUsage.length > 0 ? (
            <div className="space-y-4">
              {budgetUsage.map((b) => (
                <div key={b.id}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span>{b.catIcon}</span>
                      <span className="text-slate-600 font-medium">{b.catName}</span>
                    </span>
                    <span className={'font-semibold tabular-nums ' + (
                      b.percentage >= 90 ? 'text-danger' : b.percentage >= 70 ? 'text-warning' : 'text-slate-500'
                    )}>
                      {formatAmount(b.spent)} / {formatAmount(b.amount)}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={'h-full rounded-full transition-all duration-700 ease-out ' + (
                        b.percentage >= 90 ? 'bg-gradient-to-r from-danger to-rose-500'
                        : b.percentage >= 70 ? 'bg-gradient-to-r from-warning to-orange-400'
                        : 'bg-gradient-to-r from-indigo-500 to-violet-500'
                      )}
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
    <div className="glass-card glass-card-hover rounded-2xl p-4 animate-slideUp-sm">
      <div className={'w-9 h-9 rounded-xl ' + bg + ' flex items-center justify-center mb-2.5'}>
        <span className={color}>{icon}</span>
      </div>
      <p className="text-[11px] text-slate-400 font-medium tracking-wide uppercase">{label}</p>
      <p className={'text-lg font-bold mt-0.5 stat-number ' + color}>{value}</p>
      {trend !== undefined && trend !== 0 && (
        <div className={'flex items-center gap-0.5 text-xs mt-1.5 ' + (trend > 0 ? 'text-danger' : 'text-success')}>
          {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          <span className="font-medium">{Math.abs(trend).toFixed(1)}%</span>
          <span className="text-slate-400 text-[10px] ml-0.5">vs 上月</span>
        </div>
      )}
    </div>
  );
}