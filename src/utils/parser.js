// 自动捕获服务 - 多渠道自动记账
// 支持: 剪贴板监听 / 支付宝微信CSV解析 / 通知文本解析

import { add } from './db.js';

// 生成唯一ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// 支付平台关键词匹配
const PAYMENT_PATTERNS = {
  alipay: {
    amountRegex: /[¥￥]\s*(\d+\.?\d{0,2})|付款金额[：:]\s*(\d+\.?\d{0,2})|支付[：:]\s*(\d+\.?\d{0,2})|扣款[：:]\s*(\d+\.?\d{0,2})|(\d+\.?\d{0,2})\s*元/,
    merchantRegex: /收款方[：:]\s*(.+?)(?:\n|$)|商户[：:]\s*(.+?)(?:\n|$)|商品说明[：:]\s*(.+?)(?:\n|$)/,
    timeRegex: /付款时间[：:]\s*(.+?)(?:\n|$)|交易时间[：:]\s*(.+?)(?:\n|$)|(\d{4}[-/]\d{2}[-/]\d{2}\s+\d{2}:\d{2})/,
  },
  wechat: {
    amountRegex: /[¥￥]\s*(\d+\.?\d{0,2})|支付金额[：:]\s*(\d+\.?\d{0,2})|消费[：:]\s*(\d+\.?\d{0,2})|(\d+\.?\d{0,2})\s*元/,
    merchantRegex: /商户[：:]\s*(.+?)(?:\n|$)|商品[：:]\s*(.+?)(?:\n|$)|收款方[：:]\s*(.+?)(?:\n|$)/,
    timeRegex: /交易时间[：:]\s*(.+?)(?:\n|$)|支付时间[：:]\s*(.+?)(?:\n|$)|(\d{4}[-/]\d{2}[-/]\d{2}\s+\d{2}:\d{2})/,
  },
};

// 尝试从文本中提取支付信息
export function parsePaymentText(text) {
  if (!text || typeof text !== 'string') return null;

  let result = null;

  for (const [platform, patterns] of Object.entries(PAYMENT_PATTERNS)) {
    // 提取金额
    const amountMatch = text.match(patterns.amountRegex);
    if (!amountMatch) continue;

    const amount = parseFloat(
      amountMatch[1] || amountMatch[2] || amountMatch[3] || amountMatch[4] || amountMatch[5] || '0'
    );
    if (amount <= 0) continue;

    // 提取商户
    const merchantMatch = text.match(patterns.merchantRegex);
    const merchant = merchantMatch
      ? (merchantMatch[1] || merchantMatch[2] || merchantMatch[3] || '未知商户').trim()
      : '未知商户';

    // 提取时间
    const timeMatch = text.match(patterns.timeRegex);
    let date = new Date().toISOString().split('T')[0];
    if (timeMatch) {
      const timeStr = timeMatch[1] || timeMatch[2] || timeMatch[3];
      if (timeStr) {
        const parsed = new Date(timeStr.replace(/\//g, '-'));
        if (!isNaN(parsed.getTime())) {
          date = parsed.toISOString().split('T')[0];
        }
      }
    }

    // 智能分类
    const category = guessCategory(merchant);

    result = {
      id: generateId(),
      amount,
      merchant,
      platform,
      category,
      date,
      time: new Date().toTimeString().slice(0, 5),
      type: 'expense',
      note: '',
      source: 'auto',
    };
    break;
  }

  return result;
}

// 智能分类推断
const CATEGORY_KEYWORDS = {
  food: ['餐厅', '饭店', '外卖', '美团', '饿了么', '肯德基', '麦当劳', '星巴克', '奶茶', '咖啡', '小吃', '火锅', '烧烤', '食堂', '买菜', '超市', '水果'],
  transport: ['滴滴', '地铁', '公交', '高铁', '火车', '机票', '加油', '停车', '高速', 'ETC', '哈啰', '摩拜', '单车'],
  shopping: ['淘宝', '京东', '拼多多', '天猫', '唯品会', '闲鱼', '百货', '商场', '服饰', '鞋', '数码'],
  entertainment: ['电影', 'KTV', '游戏', '充值', '会员', '视频', '音乐', '景点', '门票', '旅游', '酒店'],
  housing: ['房租', '房贷', '物业', '房产', '链家', '贝壳'],
  utilities: ['电费', '水费', '燃气', '暖气', '宽带', '话费'],
  health: ['医院', '药', '诊所', '体检', '挂号'],
  education: ['学费', '培训', '课程', '书', '考试'],
  communication: ['话费', '流量'],
};

function guessCategory(merchant) {
  for (const [catId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => merchant.includes(kw))) {
      return catId;
    }
  }
  return 'other_expense';
}

// 解析支付宝CSV
export function parseAlipayCSV(csvText) {
  const results = [];
  const lines = csvText.split('\n').filter((l) => l.trim());

  // 找到表头行确定列索引
  let headerIdx = -1;
  const headerPatterns = [
    /交易时间.*交易对方.*商品.*金额/,
    /交易时间.*交易对方.*金额/,
    /时间.*对方.*金额/,
  ];

  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    if (headerPatterns.some((p) => p.test(lines[i]))) {
      headerIdx = i;
      break;
    }
  }

  if (headerIdx === -1) return results;

  const headers = parseCSVLine(lines[headerIdx]);
  const colMap = {};
  headers.forEach((h, i) => {
    const clean = h.replace(/[「」""\s]/g, '');
    if (/交易时间|时间/.test(clean)) colMap.time = i;
    if (/交易对方|对方|商户/.test(clean)) colMap.merchant = i;
    if (/商品|说明/.test(clean)) colMap.product = i;
    if (/金额|收入|支出/.test(clean)) colMap.amount = i;
    if (/收\/支|类型/.test(clean)) colMap.type = i;
  });

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 2) continue;

    const amountStr = colMap.amount !== undefined ? cols[colMap.amount]?.replace(/[¥￥,\s]/g, '') : '';
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) continue;

    let typeStr = colMap.type !== undefined ? cols[colMap.type] : '支出';
    const type = typeStr.includes('收入') ? 'income' : 'expense';

    const merchant = (cols[colMap.merchant] || cols[colMap.product] || '未知').trim();
    const timeStr = colMap.time !== undefined ? cols[colMap.time] : '';
    let date = new Date().toISOString().split('T')[0];
    if (timeStr) {
      const parsed = new Date(timeStr.replace(/\//g, '-'));
      if (!isNaN(parsed.getTime())) date = parsed.toISOString().split('T')[0];
    }

    results.push({
      id: generateId(),
      amount,
      merchant: merchant || '未知商户',
      platform: 'alipay',
      category: type === 'expense' ? guessCategory(merchant) : 'other_income',
      date,
      time: '00:00',
      type,
      note: '',
      source: 'csv_import',
    });
  }

  return results;
}

// 解析微信CSV
export function parseWechatCSV(csvText) {
  // 微信账单格式与支付宝类似，共用解析逻辑
  return parseAlipayCSV(csvText);
}

// CSV行解析（处理引号内逗号）
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// 剪贴板监听服务
let clipboardTimer = null;
let lastClipboardText = '';

export function startClipboardMonitor(onCapture) {
  if (clipboardTimer) return;

  clipboardTimer = setInterval(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text !== lastClipboardText) {
        lastClipboardText = text;
        const parsed = parsePaymentText(text);
        if (parsed && parsed.amount > 0) {
          await add('transactions', parsed);
          onCapture?.(parsed);
        }
      }
    } catch {
      // 剪贴板读取失败（权限问题），静默处理
    }
  }, 2000);
}

export function stopClipboardMonitor() {
  if (clipboardTimer) {
    clearInterval(clipboardTimer);
    clipboardTimer = null;
  }
}
