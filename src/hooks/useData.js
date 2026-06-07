import { useState, useEffect, useCallback } from 'react';
import { getAll, add, put, remove, getByIndex } from '../utils/db.js';

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAll('transactions');
      data.sort((a, b) => {
        const da = a.date + (a.time || '00:00');
        const db = b.date + (b.time || '00:00');
        return db.localeCompare(da);
      });
      setTransactions(data);
    } catch (e) {
      console.error('加载交易失败:', e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addTransaction = async (tx) => {
    await add('transactions', tx);
    await load();
    return tx;
  };

  const updateTransaction = async (tx) => {
    await put('transactions', tx);
    await load();
  };

  const deleteTransaction = async (id) => {
    await remove('transactions', id);
    await load();
  };

  const deleteTransactions = async (ids) => {
    for (const id of ids) {
      await remove('transactions', id);
    }
    await load();
    return ids.length;
  };

  const getByMonth = useCallback(async (year, month) => {
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    return transactions.filter((t) => t.date.startsWith(prefix));
  }, [transactions]);

  return {
    transactions, loading, reload: load,
    addTransaction, updateTransaction, deleteTransaction, deleteTransactions, getByMonth,
  };
}

export function useCategories() {
  const [categories, setCategories] = useState([]);

  const load = useCallback(async () => {
    const data = await getAll('categories');
    setCategories(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addCategory = async (cat) => {
    await add('categories', cat);
    await load();
  };

  const updateCategory = async (cat) => {
    await put('categories', cat);
    await load();
  };

  const deleteCategory = async (id) => {
    await remove('categories', id);
    await load();
  };

  const getCategoryById = (id) => categories.find((c) => c.id === id) || { name: '未知', icon: 'HelpCircle', color: '#94a3b8' };

  return { categories, reload: load, addCategory, updateCategory, deleteCategory, getCategoryById };
}

export function useBudgets() {
  const [budgets, setBudgets] = useState([]);

  const load = useCallback(async () => {
    const data = await getAll('budgets');
    setBudgets(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const setBudget = async (budget) => {
    const existing = budgets.find((b) => b.id === budget.id);
    if (existing) {
      await put('budgets', budget);
    } else {
      await add('budgets', budget);
    }
    await load();
  };

  const deleteBudget = async (id) => {
    await remove('budgets', id);
    await load();
  };

  return { budgets, reload: load, setBudget, deleteBudget };
}
