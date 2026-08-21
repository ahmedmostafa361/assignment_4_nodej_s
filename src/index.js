const express = require('express');
const dotenv = require('dotenv').config();
const app = express();
app.use(express.json());
app.listen(3000, () => console.log('Server started on port 3000'));
const { Pool } = require('pg');
// const	{	createConnection,	createPool	}	=	require('mysql2');
// //	a	single	connection
// const	connection	=	createConnection({
//     host: process.env.DB_HOST,
//     user:	process.env.DB_USER,
//     password:  process.env.DB_PASSWORD,
//     database:process.env.DB_NAME,
// });
// //	a	reusable	pool	of	connections	—	prefer	this	for	a	real	app
// const	pool	=	createPool({
//     host: process.env.DB_HOST,
//     user:	process.env.DB_USER,
//     password:  process.env.DB_PASSWORD,
//     database:process.env.DB_NAME,
// });

const pool = new Pool(
    {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    }
);

app.get('/health', async (req, res) =>{
   const {rows} = await pool.query('SELECT 1+1 as result')
    res.send(rows[0]);
}
);
/*      ******************************************      create a product      *******************************************
 */
app.post('/product', async (req, res) => {
    const {name, price, description, stock_quantity, image_url, supplier_id} = req.body;
    const {rows} = await pool.query('' +
        'INSERT INTO products (name, price, description, stock_quantity, image_url, supplier_id) ' +
        'VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [name, price, description, stock_quantity, image_url, supplier_id]);
    if (rows.length === 0) {
        return res.status(400).json({message: 'Failed to create product'});
    }
    res.json(rows[0]);
});
/* retrieve all products
 */
app.get('/product', async (req, res) => {
    const {rows} = await pool.query('SELECT * FROM products ORDER BY id');
    if (rows.length === 0) {
        return res.status(404).json({message: 'No products found'});
    }
    res.json(rows);
});

/* update product
 */
app.put('/product/:id', async (req, res) => {
    const {id} = req.params;
    const {name, price, description, stock_quantity, image_url, supplier_id} = req.body;

    const {rows} = await pool.query(
        'SELECT * FROM products WHERE id = $1',
        [id]
    );

    if(rows.length === 0){
        return res.status(404).json({message:'Product not found'});
    }

    const {rows:updateRows} = await pool.query(
        `UPDATE products
         SET name = COALESCE($1, name),   --- we use COALESCE to avoid updating the column to NULL if the value is NULL
             price = COALESCE($2, price),
             description = COALESCE($3, description),
             stock_quantity = COALESCE($4, stock_quantity),
             image_url = COALESCE($5, image_url),
             supplier_id = COALESCE($6, supplier_id)
         WHERE id = $7
         RETURNING *`,
        [name, price, description, stock_quantity, image_url, supplier_id, id]
    );

    res.json(updateRows[0]);
});/* delete product
 */
app.delete('/product/:id', async (req, res) => {
    const {id} = req.params;
    const {rows} = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    if (rows.length === 0) {
        return res.status(404).json({message: 'Product not found'});
    }
    res.json(
        {message: 'Product deleted successfully',
        deletedProduct: rows[0],});
});
app.put('/product/update-bread-price', async (req, res) => {
    const { rows } = await pool.query(
        `UPDATE products
         SET price = 25.00
         WHERE name = 'Bread'
         RETURNING *`
    );

    if (rows.length === 0) {
        return res.status(404).json({ message: 'Bread not found' });
    }

    res.json(rows[0]);
});
app.delete('/product/delete-eggs', async (req, res) => {
    const { rows } = await pool.query(
        `DELETE FROM products
         WHERE name = 'Eggs'
         RETURNING *`
    );

    if (rows.length === 0) {
        return res.status(404).json({ message: 'Eggs not found' });
    }

    res.json({
        message: 'Eggs deleted successfully',
        deletedProduct: rows[0]
    });
});
/* retrieve product by id
 */
app.get('/product/:id', async (req, res) => {
    const {id} = req.params;
    const {rows} = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (rows.length === 0) {
        return res.status(404).json({message: 'Product not found'});
    }
    res.json(rows[0]);
});
// /        ***************      supplier        ***********
app.post('/supplier', async (req, res) => {
    const { supplier_name, contact_number } = req.body;

    const { rows } = await pool.query(
        `INSERT INTO suppliers (supplier_name, contact_number)
         VALUES ($1, $2) RETURNING *`,
        [supplier_name, contact_number]
    );

    if (rows.length === 0) {
        return res.status(400).json({
            message: 'Failed to create supplier'
        });
    }

    res.status(201).json(rows[0]);
});
app.get('/supplier', async (req, res) => {
    const {rows} = await pool.query('SELECT * FROM suppliers ORDER BY id');
    if (rows.length === 0) {
        return res.status(404).json({message: 'No suppliers found'});
    }
    res.json(rows);
});
/* change suppliers.contact_number to VARCHAR(15) */
app.put('/supplier/change_contact_number', async (req, res) => {
    try {
        await pool.query('ALTER TABLE suppliers ALTER COLUMN contact_number TYPE VARCHAR(15)',);
        res.status(200).json({message: 'Contact number changed successfully'});
    } catch (err) {
        res.status(500).json({message: 'Failed to change contact number',error: err.message});
    }
});
app.put('/supplier/:id', async (req, res) => {
    const {id} = req.params;
    const {supplier_name,contact_number} = req.body;
    const {rows } = await pool.query('SELECT * FROM suppliers WHERE id = $1',[id]);
    if(rows.length === 0){
        return res.status(404).json({message:'Supplier not found'})
    }
    const {rows:updateRows}  =await pool.query('UPDATE suppliers SET supplier_name = $1, contact_number = $2 WHERE id = $3 RETURNING *',[supplier_name,contact_number,id]);
    res.json(
        {message:'Supplier updated successfully',
        updatedSupplier:updateRows[0]});
});

app.delete('/supplier/:id', async (req, res) => {
    const {id} = req.params;
    const {rows} =await pool.query('DELETE FROM suppliers WHERE id = $1 RETURNING * ',[id]);
    if(rows.length === 0){
        return res.status(404).json({message:'Supplier not found'});
    }
    res.json({message:'Supplier deleted successfully',deletedSupplier:rows[0]});
});

////            **************      sales        ***********
//record sale
app.post('/sale', async (req, res) => {
    const {product_id, quantity_sold, sale_date} = req.body;

    const {rows} = await pool.query(
        'SELECT * FROM products WHERE id = $1', [product_id]
    );

    if(rows.length === 0){
        return res.status(404).json({message:'Product not found'});
    }

    let saleRows;

    if(sale_date){
        const {rows:updateRows} = await pool.query(
            'INSERT INTO sales (product_id, quantity_sold, sale_date) VALUES ($1, $2, $3) RETURNING *',
            [product_id, quantity_sold, sale_date]
        );
        saleRows = updateRows;
    }else{
        const {rows:updateRows} = await pool.query(
            'INSERT INTO sales (product_id, quantity_sold) ' +
            'VALUES ($1, $2) RETURNING *',
            [product_id, quantity_sold]
        );
        saleRows = updateRows;
    }

    res.json(saleRows[0]);
});


app.get('/sale', async (req, res) => {
   const {rows} = await pool.query('SELECT * FROM sales ORDER BY id',);
   if(rows.length === 0){
       return res.status(404).json({message:'No sales found'})
   }
   res.json(rows);
})
app.get('/sale/product/:product_id', async (req, res) => {
    const { product_id } = req.params;

    const { rows } = await pool.query(
        'SELECT * FROM sales WHERE product_id = $1',
        [product_id]
    );

    if (rows.length === 0) {
        return res.status(404).json({ message: 'No sales found for this product' });
    }

    res.json(rows);
});
///         **************************************************************
/// Add a Category column to the Products table.
app.post('/product/add_category', async (req, res) => {
     try {
         await pool.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100)',);
         res.status(200).json({message: 'Category added successfully'});
     } catch (err) {
         res.status(500).json({message: 'Failed to add category',error: err.message});
     }
});
/* remove category column from products */
app.delete('/product/remove-category', async (req, res) => {
    try {
        await pool.query('ALTER TABLE products DROP COLUMN IF EXISTS category');
        res.json({message: 'Category column removed successfully'});
    } catch (err) {
        res.status(500).json({message: 'Failed to remove category column', error: err.message});
    }
});


/* add NOT NULL constraint to products.name */
app.put('/product/add_not_null_name', async (req, res) => {
    try {
        await pool.query('ALTER TABLE products ALTER COLUMN name SET NOT NULL',);
        res.status(200).json({message: 'Name added successfully'});
    } catch (err) {
        res.status(500).json({message: 'Failed to add NOT NULL constraint',error: err.message});
    }
});

///9. Create a reporting endpoint to retrieve the total quantity sold for each product using SQL aggregate functions.

app.get('/sale/report_quantity_sold', async (req, res) => {
    const {rows} = await pool.query(
        `SELECT product_id, SUM(quantity_sold) AS total_quantity_sold
         FROM sales
         GROUP BY product_id`
    );

    res.json(rows);
});
/// 10. Create a reporting endpoint to retrieve the product with the highest stock quantity. (0.5 Grade)
app.get('/product/report_highest_stock_quantity', async (req, res) => {
    const {rows} = await pool.query(
        `SELECT id,name, stock_quantity
         FROM products
         ORDER BY stock_quantity DESC
         LIMIT 1`
    );
    if(rows.length === 0){
        return res.status(404).json({message:'No products found'});
    }
    res.json(rows[0]);
});
/// 11. Create a reporting endpoint to retrieve suppliers whose names start with 'F'. (0.5 Grade)
app.get('/supplier/report_supplier_name_starts_with_f', async (req, res) => {
    const {rows} = await pool.query(
        `SELECT *
         FROM suppliers
         WHERE supplier_name LIKE 'F%'`  // LIKE operator to match strings that start with 'F' but if add '%F' at the start it will match all strings that end with 'F'
    );
    if(rows.length === 0){
        return res.status(404).json({message:'No suppliers found'});
    }
    res.json(rows);
});
// 12. Create a reporting endpoint to retrieve all products that have never been sold. (0.5 Grade)
app.get('/product/report_products_never_sold', async (req, res) => {
    const {rows} = await pool.query(
        `SELECT *
         FROM products
         WHERE NOT EXISTS (
             SELECT 1
             FROM sales
             WHERE sales.product_id = products.id
         );    
        `
    );
    if(rows.length === 0){
        return res.status(404).json({message:'No products found'});
    }
    res.json(rows);
});

//13. Create a reporting endpoint to retrieve all sales including: (0.5 Grade)● Product name
// ● Quantity sold
// ● Sale date using SQL JOIN operations.
app.get('/sale/report_all_sales', async (req, res) => {
    const {rows} = await pool.query(
        `SELECT sales.id, products.name AS product_name, sales.quantity_sold, sales.sale_date
         FROM sales
         INNER JOIN products ON sales.product_id = products.id`
    );
    if(rows.length === 0){
        return res.status(404).json({message:'No sales found'});
    }
    res.json(rows);
});
/// 14 , 15 , 16 (you will find all all sql data in migration/console.sql that have all sqlk changes i did)
///CREATE USER store_manager WITH PASSWORD '123456';
//
// GRANT SELECT, INSERT, UPDATE
//     ON ALL TABLES IN SCHEMA public
//     TO store_manager;
//
// REVOKE UPDATE
//     ON ALL TABLES IN SCHEMA public
//     FROM store_manager;
//
// GRANT DELETE
//     ON sales
//     TO store_manager;