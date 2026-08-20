--create table products
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