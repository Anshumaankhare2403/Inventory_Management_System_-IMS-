const http = require('http');

async function request(path, method = 'GET', body = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = data;
                try { parsed = JSON.parse(data); } catch(e){}
                resolve({ status: res.statusCode, data: parsed });
            });
        });

        req.on('error', reject);

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function runTests() {
    console.log("=== STARTING API TESTS ===");
    let token = '';

    // 1. Auth Test
    console.log("\\n1. AUTHENTICATION");
    let res = await request('/api/auth/login', 'POST', { email: 'admin@example.com', password: 'password123' });
    console.log(`Login (Valid): ${res.status === 200 ? '✅' : '❌'} - Status: ${res.status}`);
    if(res.status === 200 && res.data.token) {
        token = res.data.token;
    } else {
        console.log("Failed to get token", res.data);
        return;
    }

    res = await request('/api/auth/login', 'POST', { email: 'admin@example.com', password: 'wrong' });
    console.log(`Login (Invalid): ${res.status === 401 || res.status === 400 ? '✅' : '❌'} - Status: ${res.status}`);

    // 2. Categories
    console.log("\\n2. CATEGORIES");
    res = await request('/api/categories', 'GET', null, token);
    console.log(`Get Categories: ${res.status === 200 ? '✅' : '❌'} - Count: ${res.data.length}`);
    
    res = await request('/api/categories', 'POST', { name: '', description: 'Empty' }, token);
    console.log(`Create Category (Empty Name): ${res.status !== 200 && res.status !== 201 ? '✅' : '❌'} - Status: ${res.status}`);

    // 3. Products
    console.log("\\n3. PRODUCTS");
    res = await request('/api/products', 'GET', null, token);
    console.log(`Get Products: ${res.status === 200 ? '✅' : '❌'} - Count: ${res.data?.length}`);

    // Post Product missing required field price
    res = await request('/api/products', 'POST', { name: 'Test', sku: 'TST1' }, token);
    console.log(`Create Product (Missing fields): ${res.status !== 200 && res.status !== 201 ? '✅' : '❌'} - Status: ${res.status}`);

    // 4. Orders
    console.log("\\n4. ORDERS (Integration flow)");
    let orderBody = {
        type: 'Sales',
        items: [
            { product_id: 1, quantity: 5, unit_price: 1200 }
        ]
    };
    res = await request('/api/orders', 'POST', orderBody, token);
    console.log(`Create Order (Sales): ${res.status === 201 ? '✅' : '❌'} - Status: ${res.status}`);
    if (res.status === 201) {
        console.log(`Order Total: ${res.data.total_amount}`);
    }

    // 5. Dashboard
    console.log("\\n5. DASHBOARD");
    res = await request('/api/dashboard/summary', 'GET', null, token);
    console.log(`Dashboard Summary: ${res.status === 200 ? '✅' : '❌'} - Status: ${res.status}`);

    console.log("\\n=== API TESTS COMPLETE ===");
}

runTests();
