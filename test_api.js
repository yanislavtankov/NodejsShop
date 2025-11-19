const http = require('http');

const url = 'http://localhost:3000/api/products?min_price=500&max_price=1000';

http.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const products = JSON.parse(data);
            console.log(`Got ${products.length} products with min_price=500, max_price=1000`);
            products.forEach(p => {
                const price = parseFloat(p.price);
                const valid = price >= 500 && price <= 1000;
                console.log(`Product: ${p.title}, Price: ${price}, Valid: ${valid}`);
            });
        } catch (e) {
            console.log('Invalid JSON:', data.substring(0, 100));
        }
    });
}).on('error', (err) => {
    console.error('Error:', err);
});
