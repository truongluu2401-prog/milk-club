
UPDATE products
SET
    name = CASE id
        WHEN 1 THEN 'Balo thời trang cao cấp'
        WHEN 2 THEN 'Túi đeo chéo nam nữ'
        WHEN 3 THEN 'Balo laptop chống sốc'
        WHEN 4 THEN 'Ví mini thời trang'
    END,
    description = CASE id
        WHEN 1 THEN 'Balo thiết kế hiện đại, phù hợp đi học và đi làm.'
        WHEN 2 THEN 'Túi nhỏ gọn, tiện lợi.'
        WHEN 3 THEN 'Balo laptop nhiều ngăn.'
        WHEN 4 THEN 'Ví nhỏ gọn, tiện lợi.'
    END,
    category = CASE id
        WHEN 1 THEN 'Balo'
        WHEN 2 THEN 'Túi xách'
        WHEN 3 THEN 'Balo'
        WHEN 4 THEN 'Phụ kiện'
    END
WHERE id IN (1, 2, 3, 4);
