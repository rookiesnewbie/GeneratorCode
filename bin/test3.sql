SELECT 
    yd.region_name,
    
    -- 计算当前年份当前月份的累计总成本
    SUM(CASE WHEN yd.years = '2025' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) AS cumulative_total_cost,

    -- 计算同比额：2025年4月与2024年4月对比
    SUM(CASE WHEN yd.years = '2025' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) 
    - SUM(CASE WHEN yd.years = '2024' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) AS year_on_year_amount,

    -- 计算同比率：同比额与2024年4月的比率
    IFNULL(
        (SUM(CASE WHEN yd.years = '2025' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) 
        - SUM(CASE WHEN yd.years = '2024' AND yd.months = '04' THEN yd.total_cost ELSE 0 END)) 
        / NULLIF(SUM(CASE WHEN yd.years = '2024' AND yd.months = '04' THEN yd.total_cost ELSE 0 END), 0), 
        0
    ) AS year_on_year_rate,

    -- 针对每个 category 计算当前月的累计成本（例如2025年4月）
    SUM(CASE WHEN yd.category = '减值' AND yd.years = '2025' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) AS depreciation_cost,
    SUM(CASE WHEN yd.category = '报废' AND yd.years = '2025' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) AS scrap_cost,
    SUM(CASE WHEN yd.category = '关税&清关税' AND yd.years = '2025' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) AS duty_clearance_cost,
    SUM(CASE WHEN yd.category = '运输' AND yd.years = '2025' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) AS transportation_cost,
    
    -- 这里针对 '西南' 区域替换 '备件成本' 为 '中国备件区成本'
    SUM(CASE WHEN (yd.region_name = '西南' AND yd.category = '中国备件区成本') OR (yd.region_name != '西南' AND yd.category = '备件成本') AND yd.years = '2025' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) AS spare_parts_cost,
    SUM(CASE WHEN yd.category = '存货成本' AND yd.years = '2025' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) AS inventory_cost,

    -- 同比额：对比2025年4月与2024年4月的数据
    SUM(CASE WHEN (yd.region_name = '西南' AND yd.category = '中国备件区成本') OR (yd.region_name != '西南' AND yd.category = '备件成本') AND yd.years = '2025' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) 
    - SUM(CASE WHEN (yd.region_name = '西南' AND yd.category = '中国备件区成本') OR (yd.region_name != '西南' AND yd.category = '备件成本') AND yd.years = '2024' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) AS spare_parts_cost_year_on_year,

    SUM(CASE WHEN yd.category = '减值' AND yd.years = '2025' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) 
    - SUM(CASE WHEN yd.category = '减值' AND yd.years = '2024' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) AS depreciation_cost_year_on_year,

    SUM(CASE WHEN yd.category = '报废' AND yd.years = '2025' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) 
    - SUM(CASE WHEN yd.category = '报废' AND yd.years = '2024' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) AS scrap_cost_year_on_year,

    SUM(CASE WHEN yd.category = '关税&清关税' AND yd.years = '2025' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) 
    - SUM(CASE WHEN yd.category = '关税&清关税' AND yd.years = '2024' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) AS duty_clearance_cost_year_on_year,

    SUM(CASE WHEN yd.category = '运输' AND yd.years = '2025' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) 
    - SUM(CASE WHEN yd.category = '运输' AND yd.years = '2024' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) AS transportation_cost_year_on_year,

    SUM(CASE WHEN yd.category = '存货成本' AND yd.years = '2025' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) 
    - SUM(CASE WHEN yd.category = '存货成本' AND yd.years = '2024' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) AS inventory_cost_year_on_year

FROM (
    SELECT 
        region_name,
        country_name,
        years,
        months,
        category,
        SUM(amount_rmb) AS total_cost
    FROM your_table
    WHERE 
        (category IN (
            '减值', 
            '报废', 
            '关税&清关税', 
            '运输', 
            '备件成本', 
            '存货成本'
        ) 
        OR (region_name = '西南' AND category = '中国备件区成本'))  -- 加入替换条件
        AND report_name = '销售成本'
        AND (years = '2025' AND months = '04')  -- 筛选出2025年4月的数据
    GROUP BY region_name, country_name, years, months, category

    UNION ALL

    SELECT 
        region_name,
        country_name,
        years,
        months,
        category,
        SUM(amount_rmb) AS total_cost
    FROM your_table
    WHERE 
        (category IN (
            '减值', 
            '报废', 
            '关税&清关税', 
            '运输', 
            '备件成本', 
            '存货成本'
        ) 
        OR (region_name = '西南' AND category = '中国备件区成本'))  -- 加入替换条件
        AND report_name = '销售成本'
        AND (years = '2024' AND months = '04')  -- 筛选出2024年4月的数据
    GROUP BY region_name, country_name, years, months, category
) AS yd

GROUP BY yd.region_name

UNION ALL

-- 汇总行
SELECT 
    '总计' AS region_name,
    
    -- 汇总当前年份当前月份的累计总成本（2025年4月）
    SUM(CASE WHEN yd.years = '2025' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) AS cumulative_total_cost,

    -- 汇总同比额：2025年4月与2024年4月对比
    SUM(CASE WHEN yd.years = '2025' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) 
    - SUM(CASE WHEN yd.years = '2024' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) AS year_on_year_amount,

    -- 汇总同比率：同比额与2024年4月的比率
    IFNULL(
        (SUM(CASE WHEN yd.years = '2025' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) 
        - SUM(CASE WHEN yd.years = '2024' AND yd.months = '04' THEN yd.total_cost ELSE 0 END)) 
        / NULLIF(SUM(CASE WHEN yd.years = '2024' AND yd.months = '04' THEN yd.total_cost ELSE 0 END), 0), 
        0
    ) AS year_on_year_rate,

    -- 汇总每个 category 的当前月累计成本
    SUM(CASE WHEN yd.category = '减值' AND yd.years = '2025' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) AS depreciation_cost,
    SUM(CASE WHEN yd.category = '报废' AND yd.years = '2025' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) AS scrap_cost,
    SUM(CASE WHEN yd.category = '关税&清关税' AND yd.years = '2025' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) AS duty_clearance_cost,
    SUM(CASE WHEN yd.category = '运输' AND yd.years = '2025' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) AS transportation_cost,
    
    -- 汇总 '备件成本' 和 '存货成本'
    SUM(CASE WHEN (yd.region_name = '西南' AND yd.category = '中国备件区成本') OR (yd.region_name != '西南' AND yd.category = '备件成本') AND yd.years = '2025' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) AS spare_parts_cost,
    SUM(CASE WHEN yd.category = '存货成本' AND yd.years = '2025' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) AS inventory_cost,

    -- 汇总同比额
    SUM(CASE WHEN (yd.region_name = '西南' AND yd.category = '中国备件区成本') OR (yd.region_name != '西南' AND yd.category = '备件成本') AND yd.years = '2025' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) 
    - SUM(CASE WHEN (yd.region_name = '西南' AND yd.category = '中国备件区成本') OR (yd.region_name != '西南' AND yd.category = '备件成本') AND yd.years = '2024' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) AS spare_parts_cost_year_on_year,

    SUM(CASE WHEN yd.category = '减值' AND yd.years = '2025' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) 
    - SUM(CASE WHEN yd.category = '减值' AND yd.years = '2024' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) AS depreciation_cost_year_on_year,

    SUM(CASE WHEN yd.category = '报废' AND yd.years = '2025' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) 
    - SUM(CASE WHEN yd.category = '报废' AND yd.years = '2024' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) AS scrap_cost_year_on_year,

    SUM(CASE WHEN yd.category = '关税&清关税' AND yd.years = '2025' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) 
    - SUM(CASE WHEN yd.category = '关税&清关税' AND yd.years = '2024' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) AS duty_clearance_cost_year_on_year,

    SUM(CASE WHEN yd.category = '运输' AND yd.years = '2025' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) 
    - SUM(CASE WHEN yd.category = '运输' AND yd.years = '2024' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) AS transportation_cost_year_on_year,

    SUM(CASE WHEN yd.category = '存货成本' AND yd.years = '2025' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) 
    - SUM(CASE WHEN yd.category = '存货成本' AND yd.years = '2024' AND yd.months = '04' THEN yd.total_cost ELSE 0 END) AS inventory_cost_year_on_year

FROM (
    -- 数据来源查询，合并2025年4月和2024年4月的数据
    -- 与上面相同的子查询部分
) AS yd;
