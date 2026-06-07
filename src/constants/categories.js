// 商户关键词 → 消费分类自动匹配规则
// 用于无障碍服务自动捕获交易时，根据商户名称猜测分类

export const CATEGORY_KEYWORDS = {
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

export function guessCategoryFromMerchant(merchant) {
  for (const [catId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => merchant.includes(kw))) {
      return catId;
    }
  }
  return 'other_expense';
}