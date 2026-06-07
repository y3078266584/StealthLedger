import { useState, useRef } from 'react';
import { Upload, FileText, X, Check, AlertCircle, Zap } from 'lucide-react';
import { parseAlipayCSV, parseWechatCSV } from '../utils/parser.js';

export default function ImportModal({ onImport, onClose }) {
  const [platform, setPlatform] = useState('alipay');
  const [csvText, setCsvText] = useState('');
  const [preview, setPreview] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | parsing | preview | done | error
  const [message, setMessage] = useState('');
  const [importedCount, setImportedCount] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      setCsvText(text);
      parseAndPreview(text, platform);
    };
    reader.onerror = () => {
      setStatus('error');
      setMessage('文件读取失败，请重试');
    };
    reader.readAsText(file, 'UTF-8');
  };

  const parseAndPreview = (text, plat) => {
    setStatus('parsing');
    try {
      const parser = plat === 'alipay' ? parseAlipayCSV : parseWechatCSV;
      const results = parser(text);

      if (results.length === 0) {
        setStatus('error');
        setMessage('未能解析到交易记录，请确认文件格式正确（支付宝/微信账单CSV）');
        return;
      }

      setPreview(results);
      setStatus('preview');
      setMessage(`解析到 ${results.length} 条交易记录`);
    } catch (err) {
      setStatus('error');
      setMessage('解析出错：' + err.message);
    }
  };

  const handleImport = async () => {
    if (preview.length === 0) return;

    try {
      await onImport(preview);
      setImportedCount(preview.length);
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setMessage('导入失败：' + err.message);
    }
  };

  const totalAmount = preview
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center">
      <div className="bg-white w-full md:w-[500px] md:rounded-2xl rounded-t-2xl p-5 animate-slideUp max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-slate-800">导入账单</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* 平台选择 */}
        <div className="flex gap-2 mb-4">
          {[
            { id: 'alipay', label: '支付宝', color: 'bg-blue-500', icon: '💙' },
            { id: 'wechat', label: '微信支付', color: 'bg-green-500', icon: '💚' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => { setPlatform(p.id); if (csvText) parseAndPreview(csvText, p.id); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2
                ${platform === p.id
                  ? `${p.color} text-white`
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              <span>{p.icon}</span> {p.label}
            </button>
          ))}
        </div>

        {/* 上传区域 */}
        {status !== 'preview' && status !== 'done' && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors"
          >
            <Upload className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 font-medium">点击上传CSV文件</p>
            <p className="text-xs text-slate-400 mt-1">
              支持支付宝和微信支付导出的账单文件
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* 状态消息 */}
        {status === 'parsing' && (
          <div className="flex items-center justify-center gap-2 py-6 text-slate-500 text-sm">
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            正在解析...
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl text-sm text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {message}
          </div>
        )}

        {status === 'done' && (
          <div className="text-center py-8">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="w-7 h-7 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-slate-800">导入完成！</p>
            <p className="text-sm text-slate-500 mt-1">成功导入 {importedCount} 条交易记录</p>
          </div>
        )}

        {/* 预览列表 */}
        {status === 'preview' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500">{message}</span>
              {totalAmount > 0 && (
                <span className="text-sm font-medium text-red-500">
                  支出合计 ¥{totalAmount.toFixed(2)}
                </span>
              )}
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1.5 mb-4">
              {preview.slice(0, 20).map((tx, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg text-xs">
                  <span className="text-slate-400 w-20 shrink-0">{tx.date}</span>
                  <span className="flex-1 text-slate-700 truncate">{tx.merchant}</span>
                  <span className={`font-medium ${tx.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                    {tx.type === 'expense' ? '-' : '+'}¥{tx.amount.toFixed(2)}
                  </span>
                </div>
              ))}
              {preview.length > 20 && (
                <div className="text-center text-xs text-slate-400 py-2">
                  ...还有 {preview.length - 20} 条记录
                </div>
              )}
            </div>
            <button
              onClick={handleImport}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors"
            >
              确认导入 {preview.length} 条记录
            </button>
          </>
        )}

        {/* 自动记账提示 */}
        <div className="mt-5 p-3 bg-amber-50 rounded-xl border border-amber-100">
          <div className="flex items-center gap-2 mb-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-amber-700">自动记账提示</span>
          </div>
          <p className="text-xs text-amber-600 leading-relaxed">
            在 Android 手机上安装本 App 并开启「无障碍服务」后，付款时可自动识别支付宝/微信的支付成功页面，无需手动操作即可完成记账。
          </p>
        </div>
      </div>
    </div>
  );
}
