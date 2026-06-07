import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import * as XLSX from 'xlsx';
import Layout from './components/Layout.jsx';
import Dashboard from './components/Dashboard.jsx';
import TransactionList from './components/TransactionList.jsx';
import TransactionForm from './components/TransactionForm.jsx';
import CategoryManager from './components/CategoryManager.jsx';
import BudgetTracker from './components/BudgetTracker.jsx';
import ImportModal from './components/ImportModal.jsx';
import Settings from './components/Settings.jsx';
import { useTransactions, useCategories, useBudgets } from './hooks/useData.js';
import { initDefaultData, getAll, remove, add } from './utils/db.js';
import AutoBilling from './plugin/autoBilling.ts';

function App() {
  const [page, setPage] = useState('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [autoCaptureEnabled, setAutoCaptureEnabled] = useState(false);

  const syncAutoCapturedTransactions = async () => {
    try {
      const result = await AutoBilling.getPendingTransactions();
      if (result.transactions && result.transactions.length > 0) {
        for (const tx of result.transactions) {
          const category = guessCategoryFromMerchant(tx.merchant);
          await add('transactions', {
            ...tx,
            category,
            source: 'auto',
            type: tx.type || 'expense',
            note: tx.note || '',
          });
        }
        await AutoBilling.clearPendingTransactions();
        await reload();
        await reloadCats();
      }
    } catch (e) {}
  };

  useEffect(() => {
    const interval = setInterval(syncAutoCapturedTransactions, 5000);
    syncAutoCapturedTransactions();
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await AutoBilling.isAccessibilityEnabled();
        setAutoCaptureEnabled(status.enabled);
      } catch {}
    };
    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const CATEGORY_KEYWORDS = {
    food: ['餐厅', '饭店', '外卖', '美团', '饿了么', '肯德基', '麦当劳', '星巴克', '奶茶', '咖啡', '小吃', '火锅', '烧烤', '食堂', '买菜', '超市', '水果', '便利店'],
    transport: ['滴滴', '地铁', '公交', '高铁', '火车', '机票', '加油', '停车', '高速', 'ETC', '哈啰', '摩拜', '单车', '打车', '出租车'],
    shopping: ['淘宝', '京东', '拼多多', '天猫', '唯品会', '闲鱼', '百货', '商场', '服饰'],
    entertainment: ['电影', 'KTV', '游戏', '充值', '会员', '视频', '音乐', '景点', '门票', '旅游', '酒店'],
    housing: ['房租', '房贷', '物业', '房产'],
    utilities: ['电费', '水费', '燃气', '暖气', '宽带'],
    health: ['医院', '药', '诊所', '体检', '挂号', '药店'],
    education: ['学费', '培训', '课程', '书'],
    communication: ['话费', '流量'],
  };

  const guessCategoryFromMerchant = (merchant) => {
    for (const [catId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some((kw) => merchant.includes(kw))) {
        return catId;
      }
    }
    return 'other_expense';
  };

  const {
    transactions, loading, reload,
    addTransaction, updateTransaction, deleteTransaction, deleteTransactions,
  } = useTransactions();
  const { categories, reload: reloadCats, addCategory, updateCategory, deleteCategory, getCategoryById } = useCategories();
  const { budgets, setBudget, deleteBudget } = useBudgets();

  useEffect(() => {
    initDefaultData().then(() => {
      reload();
      reloadCats();
      setInitialized(true);
    });
  }, []);

  useEffect(() => {
    if (page === 'import') {
      setShowImport(true);
    }
  }, [page]);

  const handleSubmit = async (tx) => {
    if (editingTx) {
      await updateTransaction(tx);
    } else {
      await addTransaction(tx);
    }
    setShowForm(false);
    setEditingTx(null);
  };

  const handleEdit = (tx) => {
    setEditingTx(tx);
    setShowForm(true);
  };

  const handleChangeCategory = async (txId, newCatId) => {
    const tx = transactions.find(t => t.id === txId);
    if (tx) {
      await updateTransaction({ ...tx, category: newCatId });
    }
  };

  const handleChangeType = async (txId, newType) => {
    const tx = transactions.find(t => t.id === txId);
    if (tx && tx.type !== newType) {
      await updateTransaction({ ...tx, type: newType });
    }
  };

  const handleDelete = async (id) => {
    if (confirm('确定要删除这笔交易记录吗？')) {
      await deleteTransaction(id);
    }
  };

  const handleImport = async (txs) => {
    for (const tx of txs) {
      await addTransaction(tx);
    }
    setShowImport(false);
    setPage('transactions');
  };

  const handleExport = async () => {
    let txs = [];
    try {
      txs = await getAll('transactions');
      if (txs.length === 0) {
        alert('没有可导出的交易数据');
        return;
      }
    } catch (e) {
      alert('导出失败：无法读取数据');
      return;
    }

    const sorted = [...txs].sort((a, b) => b.date.localeCompare(a.date));
    const rows = sorted.map((t) => {
      const cat = getCategoryById(t.category);
      return {
        '日期': t.date,
        '时间': t.time || '',
        '类型': t.type === 'expense' ? '支出' : '收入',
        '分类': cat.name,
        '商户': t.merchant,
        '金额': t.amount,
        '备注': t.note || '',
        '来源': t.source === 'auto' ? '自动捕获' : t.platform === 'alipay' ? '支付宝' : t.platform === 'wechat' ? '微信' : '手动录入',
      };
    });

    const filename = '影记_账单_' + new Date().toISOString().split('T')[0] + '.xlsx';

    try {
      const ws = XLSX.utils.json_to_sheet(rows);
      ws['!cols'] = [
        { wch: 12 }, { wch: 8 }, { wch: 6 }, { wch: 8 },
        { wch: 18 }, { wch: 10 }, { wch: 20 }, { wch: 10 },
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '账单记录');
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);

      let exported = false;
      try {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        exported = true;
      } catch {}

      if (!exported) {
        try {
          window.open(url, '_blank');
          exported = true;
        } catch {}
      }

      if (!exported) {
        try {
          const csvFallback = sorted.map((t) => {
            const cat = getCategoryById(t.category);
            return t.date + ',' + (t.time || '') + ',' + (t.type === 'expense' ? '支出' : '收入') + ',' + cat.name + ',' + t.merchant + ',' + t.amount + ',' + (t.note || '') + ',' + t.source;
          }).join('\n');
          await navigator.clipboard.writeText('\uFEFF' + '日期,时间,类型,分类,商户,金额,备注,来源\n' + csvFallback);
          alert('Excel 导出不支持当前环境，数据已复制到剪贴板');
        } catch {}
      }

      setTimeout(() => { try { URL.revokeObjectURL(url); } catch {} }, 60000);
    } catch (e) {
      console.error('Export error:', e);
      alert('导出失败，请重试');
    }
  };

  const handleClearAll = async () => {
    const txs = await getAll('transactions');
    for (const tx of txs) {
      await remove('transactions', tx.id);
    }
    await reload();
  };

  if (!initialized) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">正在初始化...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout activePage={page} onNavigate={setPage}>
      {page === 'dashboard' && (
        <Dashboard
          transactions={transactions}
          categories={categories}
          getCategoryById={getCategoryById}
          budgets={budgets}
        />
      )}

      {page === 'transactions' && (
        <TransactionList
          transactions={transactions}
          categories={categories}
          getCategoryById={getCategoryById}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBatchDelete={deleteTransactions}
          onChangeCategory={handleChangeCategory}
          onChangeType={handleChangeType}
        />
      )}

      {page === 'categories' && (
        <CategoryManager
          categories={categories}
          transactions={transactions}
          onAdd={addCategory}
          onUpdate={updateCategory}
          onDelete={deleteCategory}
        />
      )}

      {page === 'budget' && (
        <BudgetTracker
          budgets={budgets}
          categories={categories}
          onSetBudget={setBudget}
          onDeleteBudget={deleteBudget}
        />
      )}

      {page === 'settings' && (
        <Settings onExport={handleExport} onClearAll={handleClearAll} autoCaptureEnabled={autoCaptureEnabled} />
      )}

      {showImport && (
        <ImportModal
          onImport={handleImport}
          onClose={() => { setShowImport(false); setPage('dashboard'); }}
        />
      )}

      {page !== 'categories' && page !== 'budget' && page !== 'settings' && (
        <button
          onClick={() => { setEditingTx(null); setShowForm(true); }}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white
            rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center
            transition-all hover:scale-105 active:scale-95 z-40"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {showForm && (
        <TransactionForm
          categories={categories}
          onSubmit={handleSubmit}
          onClose={() => { setShowForm(false); setEditingTx(null); }}
          editingTx={editingTx}
        />
      )}
    </Layout>
  );
}

export default App;
