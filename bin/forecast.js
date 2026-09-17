/**
 * 解析 batch_id "2025-03" => {year:2025, month:number}
 * @param {string} batchId
 * @returns {{year:number,month:number}}
 */
function parseBatchId(batchId) {
  const arr = batchId.split('-');
  const y = Number(arr[0]);
  const m = Number(arr[1]);
  return { year: y, month: m };
}

/**
 * 生成 batch_id
 * @param {number} y
 * @param {number} m
 * @returns string
 */
function toBatchId(y, m) {
  const mm = m < 10 ? '0' + m : String(m);
  return y + '-' + mm;
}

/**
 * 获取前一个年月（自动跨年）
 * @param {number} y
 * @param {number} m
 * @returns {{year:number,month:number}}
 */
function prevYm(y, m) {
  if (m > 1) {
    return { year: y, month: m - 1 };
  } else {
    return { year: y - 1, month: 12 };
  }
}

/**
 * 从目标年月向前遍历，收集3个有效value，返回 {sum,count}
 * @param {number} targetY
 * @param {number} targetM
 * @param {Map<string, number>} ymValueMap
 * @returns {{sum:number,count:number}}
 */
function getSum3(targetY, targetM, ymValueMap) {
  let cy = targetY;
  let cm = targetM;
  let sum = 0;
  let count = 0;
  const maxLoop = 36;
  let loop = 0;

  while (count < 3 && loop < maxLoop) {
    loop++;
    const prev = prevYm(cy, cm);
    cy = prev.year;
    cm = prev.month;
    const key = toBatchId(cy, cm);
    const v = ymValueMap.get(key);
    if (v != null && !isNaN(v)) {
      sum += v;
      count++;
    }
  }
  return { sum, count };
}

/**
 * 批量预测全年12个月，纯for循环，禁止for...of
 * rawData中的region、office、country不在gspcList中的，直接跳过不返回
 * @param {Array} rawData 原始月度数据
 * @param {Array} gspcList gspc维度列表
 * @param {number} forecastYear 预测年份，例：2026
 * @returns Array 预测结果数组
 */
function forecastYearAll(rawData, gspcList, forecastYear) {
  const groupMap = new Map();

  // 1. 遍历gspcList，传统for，只创建gspcList内存在的维度组合
  const gspcLen = gspcList.length;
  for (let i = 0; i < gspcLen; i++) {
    const gspcItem = gspcList[i];
    const gspc = gspcItem.gspc;
    const region = gspcItem.region;
    const office = gspcItem.office;
    const country = gspcItem.country;

    // 收集所有bg
    const bgSet = new Set();
    const rawLen1 = rawData.length;
    for (let j = 0; j < rawLen1; j++) {
      bgSet.add(rawData[j].bg);
    }

    // Set转数组再for循环
    const bgArr = Array.from(bgSet);
    const bgArrLen = bgArr.length;
    for (let k = 0; k < bgArrLen; k++) {
      const bg = bgArr[k];
      const groupKey = bg + '|' + gspc + '|' + region + '|' + office + '|' + country;
      groupMap.set(groupKey, {
        bg: bg,
        gspc: gspc,
        region: region,
        office: office,
        country: country,
        ymValueMap: new Map(),
        scanCache: new Map()
      });
    }
  }

  // 2. 填充每个分组内年月value，不在gspcList维度的rawData行直接丢弃
  const rawLen2 = rawData.length;
  for (let i = 0; i < rawLen2; i++) {
    const row = rawData[i];
    const batch_id = row.batch_id;
    const bg = row.bg;
    const value = row.value;
    const region = row.region;
    const office = row.office;
    const country = row.country;

    // 查找匹配gspc
    let matchedGspc = null;
    const gspcLen2 = gspcList.length;
    for (let j = 0; j < gspcLen2; j++) {
      const g = gspcList[j];
      if (g.region === region && g.office === office && g.country === country) {
        matchedGspc = g;
        break;
      }
    }
    // 重点：找不到匹配gspc，则跳过这条数据，不会参与计算，自然不会输出
    if (matchedGspc === null) {
      continue;
    }
    const groupKey = bg + '|' + matchedGspc.gspc + '|' + region + '|' + office + '|' + country;
    const group = groupMap.get(groupKey);
    if (!group) {
      continue;
    }
    group.ymValueMap.set(batch_id, value);
  }

  // 3. 遍历groupMap的值，Map.values转数组后for循环
  const groupArr = Array.from(groupMap.values());
  const groupArrLen = groupArr.length;
  const result = [];

  for (let gIdx = 0; gIdx < groupArrLen; gIdx++) {
    const group = groupArr[gIdx];
    const bg = group.bg;
    const gspc = group.gspc;
    const region = group.region;
    const office = group.office;
    const country = group.country;
    const ymValueMap = group.ymValueMap;
    const scanCache = group.scanCache;

    // 封装带缓存的getSum3
    const getSum3Cache = function (targetY, targetM) {
      const cacheKey = targetY + '-' + targetM;
      if (scanCache.has(cacheKey)) {
        return scanCache.get(cacheKey);
      }
      const res = getSum3(targetY, targetM, ymValueMap);
      scanCache.set(cacheKey, res);
      return res;
    };

    // 预测1~12月
    for (let m = 1; m <= 12; m++) {
      const curr = getSum3Cache(forecastYear, m);
      const lastY = forecastYear - 1;
      const last = getSum3Cache(lastY, m);
      const lastMonthKey = toBatchId(lastY, m);
      const lastMonthVal = ymValueMap.get(lastMonthKey);
      let predictVal = null;

      if (curr.count >= 3 && last.count >= 3 && last.sum !== 0 && lastMonthVal != null) {
        predictVal = (curr.sum / last.sum) * lastMonthVal;
      }

      result.push({
        batch_id: toBatchId(forecastYear, m),
        bg: bg,
        gspc: gspc,
        region: region,
        office: office,
        country: country,
        predict: predictVal
      });
    }
  }

  return result;
}

// ============ 使用示例 ============
const rawData = [
  { batch_id: '2024-10', bg: 'EBG', value: 100, region: '亚太地区部', office: '马来西亚代表处' , country: '马来西亚'},
  { batch_id: '2024-11', bg: 'EBG', value: 120, region: '亚太地区部', office: '马来西亚代表处' , country: '马来西亚' },
  { batch_id: '2024-12', bg: 'EBG', value: 130, region: '亚太地区部', office: '马来西亚代表处' , country: '马来西亚' },
  { batch_id: '2025-01', bg: 'EBG', value: 140, region: '亚太地区部', office: '马来西亚代表处' , country: '马来西亚' },
  { batch_id: '2025-02', bg: 'EBG', value: 150, region: '亚太地区部', office: '马来西亚代表处' , country: '马来西亚' },
  { batch_id: '2025-03', bg: 'EBG', value: 160, region: '亚太地区部', office: '马来西亚代表处' , country: '马来西亚' },
  { batch_id: '2025-04', bg: 'EBG', value: 165, region: '亚太地区部', office: '马来西亚代表处' , country: '马来西亚' },
  { batch_id: '2025-05', bg: 'EBG', value: 170, region: '亚太地区部', office: '马来西亚代表处' , country: '马来西亚' },
  { batch_id: '2025-06', bg: 'EBG', value: 175, region: '亚太地区部', office: '马来西亚代表处' , country: '马来西亚' },
  { batch_id: '2025-07', bg: 'EBG', value: 180, region: '亚太地区部', office: '马来西亚代表处' , country: '马来西亚' },
  { batch_id: '2025-08', bg: 'EBG', value: 185, region: '亚太地区部', office: '马来西亚代表处' , country: '马来西亚' },
  { batch_id: '2025-09', bg: 'EBG', value: 190, region: '亚太地区部', office: '马来西亚代表处' , country: '马来西亚' },
  { batch_id: '2024-10', bg: 'CNBG', value: 100, region: '亚太地区部', office: '马来西亚代表处' , country: '马来西亚'},
  { batch_id: '2024-11', bg: 'CNBG', value: 120, region: '亚太地区部', office: '马来西亚代表处' , country: '马来西亚' },
  { batch_id: '2024-12', bg: 'CNBG', value: 130, region: '亚太地区部', office: '马来西亚代表处' , country: '马来西亚' },
  { batch_id: '2025-01', bg: 'CNBG', value: 140, region: '亚太地区部', office: '马来西亚代表处' , country: '马来西亚' },
  { batch_id: '2025-02', bg: 'CNBG', value: 150, region: '亚太地区部', office: '马来西亚代表处' , country: '马来西亚' },
  { batch_id: '2025-03', bg: 'CNBG', value: 160, region: '亚太地区部', office: '马来西亚代表处' , country: '马来西亚' },
  { batch_id: '2025-04', bg: 'CNBG', value: 165, region: '亚太地区部', office: '马来西亚代表处' , country: '马来西亚' },
  { batch_id: '2025-05', bg: 'CNBG', value: 170, region: '亚太地区部', office: '马来西亚代表处' , country: '马来西亚' },
  { batch_id: '2025-06', bg: 'CNBG', value: 175, region: '亚太地区部', office: '马来西亚代表处' , country: '马来西亚' },
  { batch_id: '2025-07', bg: 'CNBG', value: 180, region: '亚太地区部', office: '马来西亚代表处' , country: '马来西亚' },
  { batch_id: '2025-08', bg: 'CNBG', value: 185, region: '亚太地区部', office: '马来西亚代表处' , country: '马来西亚' },
  { batch_id: '2025-09', bg: 'CNBG', value: 190, region: '亚太地区部', office: '马来西亚代表处' , country: '马来西亚' },
  // 这条维度不在gspcList，会被直接跳过，不会输出任何预测结果
  { batch_id: '2025-09', bg: 'CNBG', value: 999, region: '某某地区部', office: '某某代表处' , country: '某某国' },
];

const gspcList = [
  { gspc: '马来西亚GSPC', region: '亚太地区部', office: '马来西亚代表处' , country: '马来西亚'},
  { gspc: '罗马尼亚西亚GSPC', region: 'B类区域地区部', office: '印度代表处' , country: '印度'},
  { gspc: '埃及GSPC', region: '欧洲地区部', office: '意大利代表处' , country: '意大利'},
  { gspc: '中国区GSPC', region: '中国地区部', office: '安徽代表处' , country: '中国'},
  { gspc: '中国区GSPC', region: '中国地区部', office: '贵州代表处' , country: '中国'},
];

// 预测2026全年
const predictResult = forecastYearAll(rawData, gspcList, 2026);
console.log(JSON.stringify(predictResult, null, 2));
