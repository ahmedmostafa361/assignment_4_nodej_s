CREATE SALES TABLE(
       ID INT PRIMARY KEY,
       product_id INT references products(id),
        quantity_sold integer NOT NULL,
       sale_date DATE NOT NULL default CURRENT_DATE
);