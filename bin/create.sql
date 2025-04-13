DELIMITER $$

CREATE PROCEDURE generate_data()
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE report_names VARCHAR(255) DEFAULT '销售成本,净销售成本,其它';
    DECLARE years_list VARCHAR(255) DEFAULT '2024,2025';
    DECLARE months_list VARCHAR(255) DEFAULT '1,2,3,4,5,6,7,8,9,10,11,12';
    DECLARE categories VARCHAR(255) DEFAULT '减值,报废,关税&清关税,运输,备件成本,存货成本,中国备件区成本';
    DECLARE region_names VARCHAR(255) DEFAULT '华北,华东,华南,西南,东北';
    DECLARE office_names VARCHAR(255) DEFAULT '北京,上海,广州,深圳,成都';
    DECLARE country_names VARCHAR(255) DEFAULT '中国,美国,德国,法国,日本';
    
    -- 临时变量
    DECLARE report_name VARCHAR(50);
    DECLARE region_name VARCHAR(50);
    DECLARE office_name VARCHAR(50);
    DECLARE country_name VARCHAR(50);
    DECLARE year VARCHAR(4);
    DECLARE month INT;
    DECLARE category VARCHAR(50);
    DECLARE amount_rmb DECIMAL(10,2);

    -- 循环插入数据
    WHILE i < 1000000 DO
        SET region_name = ELT(FLOOR(1 + (RAND() * 5)), '华北', '华东', '华南', '西南', '东北');
        SET office_name = ELT(FLOOR(1 + (RAND() * 5)), '北京', '上海', '广州', '深圳', '成都');
        SET country_name = ELT(FLOOR(1 + (RAND() * 4)), '中国', '美国', '德国', '法国', '日本');
        SET report_name = ELT(FLOOR(1 + (RAND() * 3)), '销售成本', '净销售成本', '其它');
        SET year = ELT(FLOOR(1 + (RAND() * 2)), '2024', '2025');
        SET month = ELT(FLOOR(1 + (RAND() * 12)), 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12);
        SET category = ELT(FLOOR(1 + (RAND() * 7)), '减值', '报废', '关税&清关税', '运输', '备件成本', '存货成本', '中国备件区成本');
        SET amount_rmb = (RAND() * 10000) * (IF(FLOOR(RAND() * 2) = 0, -1, 1));  -- 生成正负随机数

        -- 插入数据
        INSERT INTO your_table (region_name, office_name, country_name, report_name, amount_rmb, years, months, category)
        VALUES (region_name, office_name, country_name, report_name, amount_rmb, year, month, category);

        SET i = i + 1;
    END WHILE;
    
END $$

DELIMITER ;


-- 调用存储过程创建数据
CALL generate_data();



-- 查看MySQL的ONLY_FULL_GROUP_BY是否开启
SHOW GLOBAL VARIABLES LIKE 'sql_mode'; -- 查看全局配置

-- 禁用MySQL的ONLY_FULL_GROUP_BY
-- 在my.ini文件移除ONLY_FULL_GROUP_BY，配置如下
[mysqld]
-- 默认为
-- sql_mode=ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
sql_mode=STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
