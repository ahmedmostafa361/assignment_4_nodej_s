
CREATE TABLE sales (
                       ID serial PRIMARY KEY,
                       product_id INT references products(id),
                       quantity_sold integer NOT NULL,
                       sale_date DATE NOT NULL default CURRENT_DATE
);

CREATE TABLE suppliers (
                           id SERIAL PRIMARY KEY,
                           supplier_name text NOT NULL,
                           contact_number text NOT NULL
);
CREATE TABLE products
(
    id serial PRIMARY KEY,
    name text NOT NULL,
    price numeric(10,2) NOT NULL check ( price > 0 ),
    description text,
    stock_quantity integer NOT NULL check ( stock_quantity > 0 ),
    image_url varchar(255),
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    supplier_id integer REFERENCES suppliers(id)
);
INSERT INTO suppliers (supplier_name, contact_number)
VALUES ('ABC Supplier', '01012345678');
INSERT INTO suppliers (supplier_name, contact_number)
VALUES ('mango Supplier', '01001953213');
insert into products
(name, price, stock_quantity, supplier_id)
values
    ('apple', 100, 100, 1);

insert into products
(name, price, stock_quantity, supplier_id)
values
    ('mango', 312, 50, 2);
insert into sales (product_id, quantity_sold, sale_date)
values (3, 10, '2021-01-01');
insert into sales (product_id, quantity_sold, sale_date)
values (5, 20, '2021-01-02');


select * from products;
select * from sales;
select * from suppliers;

SELECT setval(
               pg_get_serial_sequence('suppliers', 'id'),
               COALESCE((SELECT MAX(id) FROM suppliers), 1),
               true
       );
INSERT INTO suppliers (supplier_name, contact_number)
VALUES ('FreshFoods', '01001234567');

INSERT INTO products (name, price, stock_quantity, supplier_id)
VALUES
    ('Milk', 15.00, 50, 1),
    ('Bread', 10.00, 30, 1),
    ('Eggs', 20.00, 40, 1);

INSERT INTO sales (product_id, quantity_sold, sale_date)
VALUES (1, 2, '2025-05-20');

CREATE USER store_manager WITH PASSWORD '123456';

GRANT SELECT, INSERT, UPDATE
      ON ALL TABLES IN SCHEMA public
          TO store_manager;

REVOKE UPDATE
    ON ALL TABLES IN SCHEMA public
    FROM store_manager;

GRANT DELETE
    ON sales
    TO store_manager;