function processDataOptimized(data) {
  // 预定义月份映射
  const monthMap = {
    '01': '1月', '02': '2月', '03': '3月', '04': '4月', '05': '5月', '06': '6月',
    '07': '7月', '08': '8月', '09': '9月', '10': '10月', '11': '11月', '12': '12月'
  };
  
  const monthKeys = Object.values(monthMap);
  
  // 预定义标准化的 service_name 映射
  const serviceNameMap = {
    '机关结算成本': '机关结算',
    '机关存货成本': '机关结算'
  };
  
  const validServices = new Set(['减值', '报废', '好坏件价差', '运输', '仓储', '机关结算']);
  
  // 使用 Map 提高分组性能
  const groups = new Map();
  const areaTotals = new Map();
  
  // 单次遍历处理所有数据
  data.forEach(item => {
    // 标准化 service_name
    let serviceName = serviceNameMap[item.service_name] || item.service_name;
    if (!validServices.has(serviceName)) {
      serviceName = '其他';
    }
    
    // 获取月份键
    const monthKey = monthMap[item.month];
    const value = item.value;
    
    // 分组键
    const groupKey = `${item.area}|${serviceName}`;
    
    // 处理分组数据
    if (!groups.has(groupKey)) {
      // 初始化分组对象，所有月份初始化为0
      const group = { area: item.area, service_name: serviceName, ytd: 0 };
      monthKeys.forEach(key => group[key] = 0);
      groups.set(groupKey, group);
    }
    
    const group = groups.get(groupKey);
    group[monthKey] += value;
    group.ytd += value;
    
    // 同时处理区域合计
    if (!areaTotals.has(item.area)) {
      const total = { area: item.area, service_name: '合计', ytd: 0 };
      monthKeys.forEach(key => total[key] = 0);
      areaTotals.set(item.area, total);
    }
    
    const areaTotal = areaTotals.get(item.area);
    areaTotal[monthKey] += value;
    areaTotal.ytd += value;
  });
  
  // 合并结果并处理四舍五入和0值
  const result = [];
  
  // 处理分组数据
  for (const group of groups.values()) {
    // 四舍五入并处理0值为空
    monthKeys.forEach(month => {
      group[month] = Math.round(group[month]);
      if (group[month] === 0) group[month] = '';
    });
    
    group.ytd = Math.round(group.ytd);
    if (group.ytd === 0) group.ytd = '';
    
    result.push(group);
  }
  
  // 处理合计数据
  for (const total of areaTotals.values()) {
    // 四舍五入并处理0值为空
    monthKeys.forEach(month => {
      total[month] = Math.round(total[month]);
      if (total[month] === 0) total[month] = '';
    });
    
    total.ytd = Math.round(total.ytd);
    if (total.ytd === 0) total.ytd = '';
    
    result.push(total);
  }
  
  return result;
}

// 测试包含小数的数据
const testDataWithDecimals = [
  { area: "亚太地区部", month: "01", service_name: "减值", value: 5.3 },
  { area: "亚太地区部", month: "02", service_name: "减值", value: 6.7 },
  { area: "亚太地区部", month: "03", service_name: "减值", value: 7.1 },
  { area: "亚太地区部", month: "04", service_name: "减值", value: 8.9 },
  { area: "亚太地区部", month: "05", service_name: "减值", value: 9.4 },
  { area: "亚太地区部", month: "06", service_name: "减值", value: 10.6 },
  { area: "亚太地区部", month: "07", service_name: "减值", value: 51.2 },
  { area: "亚太地区部", month: "08", service_name: "减值", value: -5.8 },
  { area: "亚太地区部", month: "09", service_name: "减值", value: -15.3 },
  { area: "亚太地区部", month: "10", service_name: "减值", value: 25.7 },
  { area: "亚太地区部", month: "11", service_name: "减值", value: 25.1 },
  { area: "亚太地区部", month: "12", service_name: "减值", value: 125.9 },
  { area: "亚太地区部", month: "01", service_name: "报废", value: 10.5 },
  { area: "亚太地区部", month: "02", service_name: "运输", value: 0.4 }, // 四舍五入后会变成0
  { area: "欧洲地区部", month: "01", service_name: "减值", value: 15.6 },
    { area: "欧洲地区部", month: "01", service_name: "机关结算成本", value: 15.3 },
  { area: "欧洲地区部", month: "01", service_name: "机关存货成本", value: 15.1 },
];

const processedData = processDataOptimized(testDataWithDecimals);
console.log(JSON.stringify(processedData, null, 2));
