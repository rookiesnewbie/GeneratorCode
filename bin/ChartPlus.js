// 每个月都返回，没有的月份数据为0 months国际化
function transformDataWithLocale(data, isZ_CN = true) {
    // 预定义月份名称 - 硬编码以避免额外计算
    const monthNames = isZ_CN 
        ? ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // 服务类型查找表 - 使用对象比Map更快
    const serviceLookup = {
        '减值': 'decrease',
        '报废': 'scrap',
        '运输': 'transport',
        '仓储': 'storage',
        '好坏件价差': 'good_and_bad',
        '关税': 'tariff',
        '机关结算成本': 'agency_settlement',
        '机关存货成本': 'agency_settlement',
        '中国内部结算': 'agency_settlement'
    };
    
    // 预分配结果数组 - 假设月份是连续的01-12
    const result = new Array(12);
    
    // 一次性初始化所有月份
    for (let i = 0; i < 12; i++) {
        result[i] = {
            months: monthNames[i], // 直接使用预定义的月份名称
            decrease: 0,
            scrap: 0,
            transport: 0,
            storage: 0,
            good_and_bad: 0,
            tariff: 0,
            agency_settlement: 0,
            other: 0
        };
    }
    
    // 单次遍历处理所有数据
    const len = data.length;
    for (let i = 0; i < len; i++) {
        const item = data[i];
        const monthIndex = parseInt(item.month, 10) - 1;
        
        // 跳过无效月份
        if (monthIndex < 0 || monthIndex > 11) continue;
        
        const target = result[monthIndex];
        const field = serviceLookup[item.service_name];
        
        if (field) {
            target[field] += item.value;
        } else {
            target.other += item.value;
        }
    }
    
    // 在同一个循环中完成四舍五入
    for (let i = 0; i < 12; i++) {
        const item = result[i];
        item.decrease = Math.round(item.decrease);
        item.scrap = Math.round(item.scrap);
        item.transport = Math.round(item.transport);
        item.storage = Math.round(item.storage);
        item.good_and_bad = Math.round(item.good_and_bad);
        item.tariff = Math.round(item.tariff);
        item.agency_settlement = Math.round(item.agency_settlement);
        item.other = Math.round(item.other);
    }
    
    return result;
}

// 只返回有月份的数据，某个月没有数据则该月份的数据不返回 months国际化
function transformDataFlexibleWithLocale(data, isZ_CN = true) {
    // 预定义月份名称
    const monthNames = isZ_CN 
        ? ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const serviceLookup = {
        '减值': 'decrease',
        '报废': 'scrap',
        '运输': 'transport',
        '仓储': 'storage',
        '好坏件价差': 'good_and_bad',
        '关税': 'tariff',
        '机关结算成本': 'agency_settlement',
        '机关存货成本': 'agency_settlement',
        '中国内部结算': 'agency_settlement'
    };
    
    // 使用对象存储月份数据
    const monthMap = {};
    const allFields = ['decrease', 'scrap', 'transport', 'storage', 'good_and_bad', 'tariff', 'agency_settlement', 'other'];
    
    // 单次遍历同时完成分组和累加
    const len = data.length;
    for (let i = 0; i < len; i++) {
        const item = data[i];
        const month = item.month;
        
        // 如果月份不存在，初始化
        if (!monthMap[month]) {
            const monthIndex = parseInt(month, 10) - 1;
            monthMap[month] = { 
                months: monthNames[monthIndex], // 使用对应的月份名称
                monthIndex: monthIndex // 保存索引用于排序
            };
            
            // 初始化所有字段为0
            for (let j = 0; j < allFields.length; j++) {
                monthMap[month][allFields[j]] = 0;
            }
        }
        
        const field = serviceLookup[item.service_name] || 'other';
        monthMap[month][field] += item.value;
    }
    
    // 提取并排序月份 - 使用保存的索引排序
    const months = Object.keys(monthMap);
    months.sort((a, b) => monthMap[a].monthIndex - monthMap[b].monthIndex);
    
    // 构建结果数组并四舍五入
    const result = new Array(months.length);
    const monthsLen = months.length;
    
    for (let i = 0; i < monthsLen; i++) {
        const month = months[i];
        const item = monthMap[month];
        const roundedItem = { months: item.months };
        
        // 四舍五入所有字段
        for (let j = 0; j < allFields.length; j++) {
            const field = allFields[j];
            roundedItem[field] = Math.round(item[field]);
        }
        
        result[i] = roundedItem;
    }
    
    return result;
}

const data =[
	{
		"area": "亚太地区部",
		"month": "01",
		"service_name": "减值",
		"value": 5
	},
	{
		"area": "亚太地区部",
		"month": "02",
		"service_name": "减值",
		"value": 6
	},
	{
		"area": "亚太地区部",
		"month": "03",
		"service_name": "减值",
		"value": 7
	},
	{
		"area": "亚太地区部",
		"month": "04",
		"service_name": "减值",
		"value": 8
	},
	{
		"area": "亚太地区部",
		"month": "05",
		"service_name": "减值",
		"value": 9
	},
	{
		"area": "亚太地区部",
		"month": "01",
		"service_name": "减值",
		"value": 10
	},
	{
		"area": "亚太地区部",
		"month": "02",
		"service_name": "减值",
		"value": 51
	},
	{
		"area": "亚太地区部",
		"month": "03",
		"service_name": "减值",
		"value": -5
	},
	{
		"area": "亚太地区部",
		"month": "04",
		"service_name": "减值",
		"value": -15
	},
	{
		"area": "亚太地区部",
		"month": "05",
		"service_name": "减值",
		"value": 25
	},
	{
		"area": "亚太地区部",
		"month": "03",
		"service_name": "减值",
		"value": 25
	},
	{
		"area": "亚太地区部",
		"month": "01",
		"service_name": "减值",
		"value": 125
	}
	
]

// console.log(JSON.stringify(transformDataWithLocale(data),null,2))
console.log(JSON.stringify(transformDataFlexibleWithLocale(data),null,2))
