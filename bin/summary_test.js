const data = [
    { "regin_name": "亚太地区部", "yoy": 32.62, "you_rate": "25.32%", "cost": 223.32 },
    { "regin_name": "中国地区部", "yoy": 90.62, "you_rate": "125.32%", "cost": 123.32 },
    { "regin_name": "B类多国地区部", "yoy": 16.62, "you_rate": "-20.32%", "cost": 33.32 },
    { "regin_name": "中东中亚地区部", "yoy": 30.62, "you_rate": "55.32%", "cost": 3.32 },
    { "regin_name": "拉美地区部", "yoy": -50.62, "you_rate": "35.32%", "cost": 53.32 },
    { "regin_name": "欧洲地区部", "yoy": 150.62, "you_rate": "-2.32%", "cost": 23.32 },
    { "regin_name": "非地区部", "yoy": 5.62, "you_rate": "-9.32%", "cost": -523.32 }
];
const a=  { yoy: 0, cost: 0, totalRate: 0, count: 0 }

const summary = data.reduce((acc, item, index, array) => {
    acc.yoy += item.yoy;
    acc.cost += item.cost;
  
    const rate = parseFloat(item.you_rate.replace('%', ''));
    acc.totalRate += rate;
  
    // 如果是最后一个元素，加上 % 并格式化
    if (index === array.length - 1) {
      acc.yoy = Number(acc.yoy.toFixed(2));
      acc.cost = Number(acc.cost.toFixed(2));
      acc.totalRate = acc.totalRate.toFixed(2) + '%';
    }
  
    return acc;
  }, a);
  
  summary.regime_name = '全球';
  console.log(summary);
