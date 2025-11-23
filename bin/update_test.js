/**
 * 按区域和服务处理数据，按月分解
 * @param {Array} data - 包含区域、月份、服务名称和值的原始数据数组
 * @param {string} batchId - 批次标识符，格式为 'YYYY-MM'
 * @returns {Array} - 处理和聚合后的数据
 */
function processData(data, batchId) {
    // 预定义月份映射
    const monthMap = {
        '01': '1月', '02': '2月', '03': '3月', '04': '4月', '05': '5月', '06': '6月',
        '07': '7月', '08': '8月', '09': '9月', '10': '10月', '11': '11月', '12': '12月'
    };

    const monthKeys = Object.values(monthMap);

    // 服务名称标准化映射
    const serviceNameMap = {
        '机关结算成本': '机关结算',
        '机关存货成本': '机关结算'
    };

    const validServices = new Set(['减值', '报废', '好坏件价差', '运输', '仓储', '机关结算']);

    // 解析 batchId 获取年份和月份
    const [, batchMonth] = batchId.split('-').map(Number);

    // 初始化用于分组的数据结构
    const groups = new Map();
    const areaTotals = new Map();

    // 单次遍历处理所有数据
    data.forEach(item => {
        // 标准化服务名称
        const serviceName = normalizeServiceName(item.service_name, serviceNameMap, validServices);
        
        // 获取月份键和值
        const monthKey = monthMap[item.month];
        const value = item.value;

        // 创建分组键
        const groupKey = `${item.area}|${serviceName}`;

        // 处理分组数据
        if (!groups.has(groupKey)) {
            groups.set(groupKey, createInitialGroup(item.area, serviceName, monthKeys));
        }

        const group = groups.get(groupKey);
        updateGroupValues(group, monthKey, value);

        // 处理区域总计
        if (!areaTotals.has(item.area)) {
            areaTotals.set(item.area, createInitialGroup(item.area, '合计', monthKeys));
        }

        const areaTotal = areaTotals.get(item.area);
        updateGroupValues(areaTotal, monthKey, value);
    });

    // 处理结果（四舍五入和零值处理）
    const result = [];
    
    // 处理分组
    groups.forEach((group) => {
      processGroupResult(group, monthKeys, batchMonth, monthMap);
      result.push(group);
    });

    // 处理区域总计
    areaTotals.forEach((total) => {
      processGroupResult(total, monthKeys, batchMonth, monthMap);
      result.push(total);
    });

    return result;
}

/**
 * 根据映射和验证规则标准化服务名称
 * @param {string} serviceName - 原始服务名称
 * @param {Object} serviceNameMap - 服务名称标准化映射
 * @param {Set} validServices - 有效服务名称集合
 * @returns {string} - 标准化后的服务名称
 */
function normalizeServiceName(serviceName, serviceNameMap, validServices) {
    const normalized = serviceNameMap[serviceName] || serviceName;
    return validServices.has(normalized) ? normalized : '其他';
}

/**
 * 创建初始分组对象，所有月份初始化为 0
 * @param {string} area - 区域名称
 * @param {string} serviceName - 服务名称
 * @param {Array} monthKeys - 月份键数组
 * @returns {Object} - 初始分组对象
 */
function createInitialGroup(area, serviceName, monthKeys) {
    const group = { area, service_name: serviceName, ytd: 0 };
    monthKeys.forEach(key => group[key] = 0);
    return group;
}

/**
 * 更新分组的月份和年度累计值
 * @param {Object} group - 要更新的分组对象
 * @param {string} monthKey - 月份键
 * @param {number} value - 要添加的值
 */
function updateGroupValues(group, monthKey, value) {
    group[monthKey] += value;
    group.ytd += value;
}

/**
 * 处理分组结果，包括四舍五入和零值处理
 * @param {Object} group - 要处理的分组对象
 * @param {Array} monthKeys - 月份键数组
 * @param {number} batchMonth - 批次月份数字
 * @param {Object} monthMap - 月份映射对象
 */
function processGroupResult(group, monthKeys, batchMonth, monthMap) {
    // 四舍五入数值
    monthKeys.forEach(month => {
        group[month] = Math.round(group[month]);
    });
    group.ytd = Math.round(group.ytd);

    // 根据批次月份处理零值
    const reverseMonthMap = {};
    Object.keys(monthMap).forEach(key => {
        reverseMonthMap[monthMap[key]] = key;
    });

    monthKeys.forEach(month => {
        if (group[month] === 0) {
            const monthNum = parseInt(reverseMonthMap[month]);
            group[month] = monthNum <= batchMonth ? 0 : '/';
        }
    });

    // 确保年度累计值为零时显示 0
    if (group.ytd === 0) {
        group.ytd = 0;
    }
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

const processedData = processDataOptimized(testDataWithDecimals, '2025-05');
console.log(JSON.stringify(processedData, null, 2));
