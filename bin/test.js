function processData(data) {
  // 1. 首先标准化service_name
  const standardizedData = data.map(item => {
    let serviceName = item.service_name;
    
    // 如果是指定的两种机关成本，统一为"机关结算"
    if (serviceName === '机关结算成本' || serviceName === '机关存货成本') {
      serviceName = '机关结算';
    }
    // 如果不是指定的类型，统一为"其他"
    else if (!['减值', '报废', '好坏件价差', '运输', '仓储', '机关结算'].includes(serviceName)) {
      serviceName = '其他';
    }
    
    return {
      ...item,
      service_name: serviceName
    };
  });

  // 2. 按area和service_name分组并合并数据
  const groups = {};
  
  standardizedData.forEach(item => {
    const key = `${item.area}|${item.service_name}`;
    
    if (!groups[key]) {
      // 初始化分组对象
      groups[key] = {
        area: item.area,
        service_name: item.service_name,
        '1月': 0, '2月': 0, '3月': 0, '4月': 0, '5月': 0, '6月': 0,
        '7月': 0, '8月': 0, '9月': 0, '10月': 0, '11月': 0, '12月': 0,
        ytd: 0
      };
    }
    
    // 将月份数字转换为中文月份键名
    const monthKey = `${parseInt(item.month)}月`;
    groups[key][monthKey] += item.value;
    groups[key].ytd += item.value;
  });

  // 3. 将分组对象转换为数组
  let result = Object.values(groups);

  // 4. 计算每个area的合计
  const areaTotals = {};
  
  result.forEach(item => {
    const area = item.area;
    if (!areaTotals[area]) {
      areaTotals[area] = {
        area: area,
        service_name: '合计',
        '1月': 0, '2月': 0, '3月': 0, '4月': 0, '5月': 0, '6月': 0,
        '7月': 0, '8月': 0, '9月': 0, '10月': 0, '11月': 0, '12月': 0,
        ytd: 0
      };
    }
    
    // 累加各个月份和ytd
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', 
                   '7月', '8月', '9月', '10月', '11月', '12月'];
    
    months.forEach(month => {
      areaTotals[area][month] += item[month];
    });
    areaTotals[area].ytd += item.ytd;
  });

  // 5. 将合计数据添加到结果中
  Object.values(areaTotals).forEach(total => {
    result.push(total);
  });

  // 6. 将值为0的月份字段置为空
  result.forEach(item => {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', 
                   '7月', '8月', '9月', '10月', '11月', '12月'];
    
    months.forEach(month => {
      if (item[month] === 0) {
        item[month] = ''; // 将0值置为空
      }
    });
    
    // 如果YTD为0，也置为空
    if (item.ytd === 0) {
      item.ytd = '';
    }
  });

  return result;
}

// 测试数据
const testData = [
  { area: "亚太地区部", month: "01", service_name: "减值", value: 5 },
  { area: "亚太地区部", month: "02", service_name: "减值", value: 6 },
  { area: "亚太地区部", month: "03", service_name: "减值", value: 7 },
  { area: "亚太地区部", month: "04", service_name: "减值", value: 8 },
  { area: "亚太地区部", month: "05", service_name: "减值", value: 9 },
  { area: "亚太地区部", month: "06", service_name: "减值", value: 10 },
  { area: "亚太地区部", month: "07", service_name: "减值", value: 51 },
  { area: "亚太地区部", month: "08", service_name: "减值", value: -5 },
  { area: "亚太地区部", month: "09", service_name: "减值", value: -15 },
  { area: "亚太地区部", month: "10", service_name: "减值", value: 25 },
  { area: "亚太地区部", month: "11", service_name: "减值", value: 25 },
  { area: "亚太地区部", month: "12", service_name: "减值", value: 125 },
  // 测试其他service_name的数据
  { area: "亚太地区部", month: "01", service_name: "报废", value: 10 },
  { area: "亚太地区部", month: "02", service_name: "运输", value: 20 },
  { area: "欧洲地区部", month: "01", service_name: "减值", value: 15 },
  { area: "欧洲地区部", month: "01", service_name: "机关结算成本", value: 15 },
  { area: "欧洲地区部", month: "02", service_name: "机关存货成本", value: 15 },
];

// 运行处理
const processedData = processData(testData);
console.log(JSON.stringify(processedData, null, 2));
