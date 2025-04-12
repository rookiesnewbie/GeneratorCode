-- EXPLAIN 
SELECT 
    yd.region_name,
    -- 仅计算当前年份的累计成本，例如2025年时只看2025年数据
    SUM(CASE WHEN yd.years = '2025' THEN yd.total_cost ELSE 0 END) AS cumulative_total_cost,
    
    -- 计算累计同比额（2025年与2024年同比）
    SUM(CASE WHEN yd.years = '2025' THEN yd.total_cost ELSE 0 END) - SUM(CASE WHEN yd.years = '2024' THEN yd.total_cost ELSE 0 END) AS cumulative_year_on_year,
    
    -- 计算累计同比率（同比额与2024年累计成本的比率）
    IFNULL(
        (SUM(CASE WHEN yd.years = '2025' THEN yd.total_cost ELSE 0 END) - SUM(CASE WHEN yd.years = '2024' THEN yd.total_cost ELSE 0 END)) / NULLIF(SUM(CASE WHEN yd.years = '2024' THEN yd.total_cost ELSE 0 END), 0), 
        0
    ) AS cumulative_year_on_year_rate,

    -- 针对每个 category 计算累计成本（仅计算当前年份）
    SUM(CASE WHEN yd.category = '减值' AND yd.years = '2025' THEN yd.total_cost ELSE 0 END) AS cumulative_depreciation,
    SUM(CASE WHEN yd.category = '报废' AND yd.years = '2025' THEN yd.total_cost ELSE 0 END) AS cumulative_scrap,
    SUM(CASE WHEN yd.category = '关税&清关税' AND yd.years = '2025' THEN yd.total_cost ELSE 0 END) AS cumulative_duty_clearance,
    SUM(CASE WHEN yd.category = '运输' AND yd.years = '2025' THEN yd.total_cost ELSE 0 END) AS cumulative_transportation,
    SUM(CASE WHEN yd.category = '备件成本' AND yd.years = '2025' THEN yd.total_cost ELSE 0 END) AS cumulative_spare_parts_cost,
    SUM(CASE WHEN yd.category = '存货成本' AND yd.years = '2025' THEN yd.total_cost ELSE 0 END) AS cumulative_inventory_cost,

    -- 针对每个 category 计算同比额（2025年与2024年之间的差异）
    SUM(CASE WHEN yd.category = '减值' AND yd.years = '2025' THEN yd.total_cost ELSE 0 END) - SUM(CASE WHEN yd.category = '减值' AND yd.years = '2024' THEN yd.total_cost ELSE 0 END) AS depreciation_year_on_year,
    SUM(CASE WHEN yd.category = '报废' AND yd.years = '2025' THEN yd.total_cost ELSE 0 END) - SUM(CASE WHEN yd.category = '报废' AND yd.years = '2024' THEN yd.total_cost ELSE 0 END) AS scrap_year_on_year,
    SUM(CASE WHEN yd.category = '关税&清关税' AND yd.years = '2025' THEN yd.total_cost ELSE 0 END) - SUM(CASE WHEN yd.category = '关税&清关税' AND yd.years = '2024' THEN yd.total_cost ELSE 0 END) AS duty_clearance_year_on_year,
    SUM(CASE WHEN yd.category = '运输' AND yd.years = '2025' THEN yd.total_cost ELSE 0 END) - SUM(CASE WHEN yd.category = '运输' AND yd.years = '2024' THEN yd.total_cost ELSE 0 END) AS transportation_year_on_year,
    SUM(CASE WHEN yd.category = '备件成本' AND yd.years = '2025' THEN yd.total_cost ELSE 0 END) - SUM(CASE WHEN yd.category = '备件成本' AND yd.years = '2024' THEN yd.total_cost ELSE 0 END) AS spare_parts_cost_year_on_year,
    SUM(CASE WHEN yd.category = '存货成本' AND yd.years = '2025' THEN yd.total_cost ELSE 0 END) - SUM(CASE WHEN yd.category = '存货成本' AND yd.years = '2024' THEN yd.total_cost ELSE 0 END) AS inventory_cost_year_on_year

FROM (
    SELECT 
        region_name,
        country_name,
        years,
        category,
        SUM(amount_rmb) AS total_cost
    FROM financial_reports
    WHERE category IN ('减值', '报废', '关税&清关税', '运输', '备件成本', '存货成本')
    AND report_name = '销售成本'  -- 只考虑 report_name 为 '销售成本' 的数据
    -- 筛选条件，确保可以动态传入
    -- AND region_name = :region_name
    -- AND country_name = :country_name
    GROUP BY region_name, country_name, years, months, category
) AS yd
GROUP BY yd.region_name

UNION ALL

-- 汇总行
SELECT 
    '总计' AS region_name,
    -- 汇总当前年份的累计成本（2025年）
    SUM(CASE WHEN yd.years = '2025' THEN yd.total_cost ELSE 0 END) AS cumulative_total_cost,
    
    -- 汇总累计同比额（2025年与2024年同比）
    SUM(CASE WHEN yd.years = '2025' THEN yd.total_cost ELSE 0 END) - SUM(CASE WHEN yd.years = '2024' THEN yd.total_cost ELSE 0 END) AS cumulative_year_on_year,
    
    -- 汇总累计同比率（同比额与2024年累计成本的比率）
    IFNULL(
        (SUM(CASE WHEN yd.years = '2025' THEN yd.total_cost ELSE 0 END) - SUM(CASE WHEN yd.years = '2024' THEN yd.total_cost ELSE 0 END)) / NULLIF(SUM(CASE WHEN yd.years = '2024' THEN yd.total_cost ELSE 0 END), 0), 
        0
    ) AS cumulative_year_on_year_rate,

    -- 汇总每个 category 的累计成本
    SUM(CASE WHEN yd.category = '减值' AND yd.years = '2025' THEN yd.total_cost ELSE 0 END) AS cumulative_depreciation,
    SUM(CASE WHEN yd.category = '报废' AND yd.years = '2025' THEN yd.total_cost ELSE 0 END) AS cumulative_scrap,
    SUM(CASE WHEN yd.category = '关税&清关税' AND yd.years = '2025' THEN yd.total_cost ELSE 0 END) AS cumulative_duty_clearance,
    SUM(CASE WHEN yd.category = '运输' AND yd.years = '2025' THEN yd.total_cost ELSE 0 END) AS cumulative_transportation,
    SUM(CASE WHEN yd.category = '备件成本' AND yd.years = '2025' THEN yd.total_cost ELSE 0 END) AS cumulative_spare_parts_cost,
    SUM(CASE WHEN yd.category = '存货成本' AND yd.years = '2025' THEN yd.total_cost ELSE 0 END) AS cumulative_inventory_cost,

    -- 汇总每个 category 的同比额
    SUM(CASE WHEN yd.category = '减值' AND yd.years = '2025' THEN yd.total_cost ELSE 0 END) - SUM(CASE WHEN yd.category = '减值' AND yd.years = '2024' THEN yd.total_cost ELSE 0 END) AS depreciation_year_on_year,
    SUM(CASE WHEN yd.category = '报废' AND yd.years = '2025' THEN yd.total_cost ELSE 0 END) - SUM(CASE WHEN yd.category = '报废' AND yd.years = '2024' THEN yd.total_cost ELSE 0 END) AS scrap_year_on_year,
    SUM(CASE WHEN yd.category = '关税&清关税' AND yd.years = '2025' THEN yd.total_cost ELSE 0 END) - SUM(CASE WHEN yd.category = '关税&清关税' AND yd.years = '2024' THEN yd.total_cost ELSE 0 END) AS duty_clearance_year_on_year,
    SUM(CASE WHEN yd.category = '运输' AND yd.years = '2025' THEN yd.total_cost ELSE 0 END) - SUM(CASE WHEN yd.category = '运输' AND yd.years = '2024' THEN yd.total_cost ELSE 0 END) AS transportation_year_on_year,
    SUM(CASE WHEN yd.category = '备件成本' AND yd.years = '2025' THEN yd.total_cost ELSE 0 END) - SUM(CASE WHEN yd.category = '备件成本' AND yd.years = '2024' THEN yd.total_cost ELSE 0 END) AS spare_parts_cost_year_on_year,
    SUM(CASE WHEN yd.category = '存货成本' AND yd.years = '2025' THEN yd.total_cost ELSE 0 END) - SUM(CASE WHEN yd.category = '存货成本' AND yd.years = '2024' THEN yd.total_cost ELSE 0 END) AS inventory_cost_year_on_year

FROM (
    SELECT 
        region_name,
        country_name,
        years,
        category,
        SUM(amount_rmb) AS total_cost
    FROM financial_reports
    WHERE category IN ('减值', '报废', '关税&清关税', '运输', '备件成本', '存货成本')
    AND report_name = '销售成本'
    GROUP BY region_name, country_name, years, category
) AS yd;
