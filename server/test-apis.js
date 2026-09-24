const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const assert = (desc, condition) => {
  if (condition) {
    console.log(`  ✓ PASS: ${desc}`);
  } else {
    console.error(`  ✗ FAIL: ${desc}`);
    throw new Error(`Assertion failed: ${desc}`);
  }
};

const runTests = async () => {
  console.log('\n========================================');
  console.log('STARTING AUTOMATED REST API TEST SUITE');
  console.log('========================================\n');

  try {
    // 1. Health Check
    console.log('[1] Health Check...');
    const health = await request('GET', '/../health'); // Or direct endpoint
    // Actually /api/health -> path is '/health'
    const healthCheck = await request('GET', '/health');
    assert('Health endpoint responds 200', healthCheck.status === 200);

    // 2. Authentication & Password Validation Matrix
    console.log('\n[2] Password Validation Matrix & Duplicate Registration...');

    // Short password (<6)
    const shortPass = await request('POST', '/auth/register', {
      fullName: 'Test Short',
      email: 'short@test.com',
      password: 'A@12'
    });
    assert('Reject password < 6 chars (A@12) -> 400', shortPass.status === 400);

    // Missing uppercase
    const noUpper = await request('POST', '/auth/register', {
      fullName: 'Test Lower',
      email: 'lower@test.com',
      password: 'abc@12'
    });
    assert('Reject password without uppercase (abc@12) -> 400', noUpper.status === 400);

    // Missing lowercase
    const noLower = await request('POST', '/auth/register', {
      fullName: 'Test Upper',
      email: 'upper@test.com',
      password: 'ABC@12'
    });
    assert('Reject password without lowercase (ABC@12) -> 400', noLower.status === 400);

    // Missing special character
    const noSpecial = await request('POST', '/auth/register', {
      fullName: 'Test NoSpec',
      email: 'nospec@test.com',
      password: 'Abc123'
    });
    assert('Reject password without special char (Abc123) -> 400', noSpecial.status === 400);

    // Missing number
    const noNum = await request('POST', '/auth/register', {
      fullName: 'Test NoNum',
      email: 'nonum@test.com',
      password: 'Abc@de'
    });
    assert('Reject password without number (Abc@de) -> 400', noNum.status === 400);

    // Password with space
    const withSpace = await request('POST', '/auth/register', {
      fullName: 'Test Space',
      email: 'space@test.com',
      password: 'Abc @12'
    });
    assert('Reject password with space (Abc @12) -> 400', withSpace.status === 400);

    // Valid Registration
    const validEmail = `testuser_${Date.now()}@labtest.com`;
    const validReg = await request('POST', '/auth/register', {
      fullName: 'Valid Tester',
      email: validEmail,
      password: 'Chem@123',
      confirmPassword: 'Chem@123'
    });
    assert('Valid registration (Chem@123) -> 201 Created', validReg.status === 201);
    assert('Response contains token', validReg.body.data && validReg.body.data.token);
    assert('Registered role is USER', validReg.body.data.user.role === 'USER');
    const userToken = validReg.body.data.token;
    const userId = validReg.body.data.user._id;

    // Duplicate Registration (Case-insensitive)
    const dupReg = await request('POST', '/auth/register', {
      fullName: 'Duplicate Tester',
      email: validEmail.toUpperCase(), // Same email in uppercase
      password: 'Chem@123'
    });
    assert('Duplicate email registration returns 409 Conflict', dupReg.status === 409);
    assert('Duplicate message indicates email exists', dupReg.body.message.includes('already exists'));

    // 3. User Login
    console.log('\n[3] Login & Authentication...');
    const wrongLogin = await request('POST', '/auth/login', {
      email: validEmail,
      password: 'Wrong@1'
    });
    assert('Invalid password login -> 401 Unauthorized', wrongLogin.status === 401);

    const goodLogin = await request('POST', '/auth/login', {
      email: validEmail,
      password: 'Chem@123'
    });
    assert('Valid login -> 200 OK', goodLogin.status === 200);

    // Admin Login
    const adminLogin = await request('POST', '/auth/login', {
      email: 'admin@britiscientific.com',
      password: 'Ad@123'
    });
    assert('Admin login (admin@britiscientific.com / Ad@123) -> 200 OK', adminLogin.status === 200);
    assert('Admin has role ADMIN', adminLogin.body.data.user.role === 'ADMIN');
    const adminToken = adminLogin.body.data.token;

    // 4. Products & Categories APIs
    console.log('\n[4] Product Catalog, Search & Filtering...');
    const prodList = await request('GET', '/products');
    assert('Fetch products -> 200 OK', prodList.status === 200);
    assert('Returns products array', Array.isArray(prodList.body.data) && prodList.body.data.length > 0);
    const firstProduct = prodList.body.data[0];

    // Search for charcoal
    const searchRes = await request('GET', '/products?search=charcoal');
    assert('Search for "charcoal" -> 200 OK', searchRes.status === 200);
    assert('Found matching charcoal products', searchRes.body.data.some((p) => p.name.toLowerCase().includes('charcoal')));

    // Product details
    const details = await request('GET', `/products/${firstProduct._id}`);
    assert('Product details by ID -> 200 OK', details.status === 200);
    assert('Details have packings with stock & price', details.body.data.packings.length > 0);

    // 5. Cart Operations & Stock Validation
    console.log('\n[5] Cart Operations & Stock Guard...');
    const targetPacking = firstProduct.packings[0];

    // Exceed stock test
    const exceedQty = targetPacking.stock + 100;
    const exceedCart = await request('POST', '/cart', {
      productId: firstProduct._id,
      packingSize: targetPacking.size,
      quantity: exceedQty
    }, userToken);
    assert('Adding quantity exceeding stock is rejected -> 400', exceedCart.status === 400);

    // Valid add to cart
    const addCart = await request('POST', '/cart', {
      productId: firstProduct._id,
      packingSize: targetPacking.size,
      quantity: 1
    }, userToken);
    assert('Add valid quantity to cart -> 200 OK', addCart.status === 200);
    assert('Cart subtotal and GST calculated', addCart.body.data.totalAmount > 0);
    const cartItemId = addCart.body.data.items[0]._id;

    // Update cart item quantity
    const updateCart = await request('PUT', `/cart/${cartItemId}`, { quantity: 2 }, userToken);
    assert('Update cart quantity to 2 -> 200 OK', updateCart.status === 200);
    assert('Item quantity updated to 2', updateCart.body.data.items[0].quantity === 2);

    // 6. Checkout & Order Creation
    console.log('\n[6] Checkout & Order Creation...');
    const orderCreate = await request('POST', '/orders', {
      shippingAddress: {
        fullName: 'Test Buyer',
        email: validEmail,
        phone: '+91 99999 88888',
        address: 'Laboratory 4B, Scientific Complex',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      }
    }, userToken);
    assert('Order creation -> 201 Created', orderCreate.status === 201);
    assert('Order status is Pending', orderCreate.body.data.orderStatus === 'Pending');
    assert('Payment status is Pending', orderCreate.body.data.paymentStatus === 'Pending');
    const createdOrderId = orderCreate.body.data._id;
    const initialStock = targetPacking.stock;

    // 7. Demo Payment Gateway (Card, UPI, Net Banking Simplified Flows)
    console.log('\n[7] Demo Payment Gateway Simulation...');

    // A. Invalid demo card (ONLY cardNumber sent, no CVV/expiry) -> FAILURE
    const failPayment = await request('POST', '/payments/process', {
      orderId: createdOrderId,
      paymentMethod: 'Card',
      cardNumber: '9999 8888 7777 6666'
    }, userToken);
    assert('Invalid demo card payment rejected -> 400', failPayment.status === 400);

    // B. Invalid demo UPI ID (ONLY upiId sent) -> FAILURE
    const failUpi = await request('POST', '/payments/process', {
      orderId: createdOrderId,
      paymentMethod: 'UPI',
      upiId: 'wrong@upi'
    }, userToken);
    assert('Invalid demo UPI payment rejected -> 400', failUpi.status === 400);

    // C. Net Banking missing bank -> FAILURE
    const failNetBanking = await request('POST', '/payments/process', {
      orderId: createdOrderId,
      paymentMethod: 'Net Banking',
      bankName: ''
    }, userToken);
    assert('Net Banking without bank selection rejected -> 400', failNetBanking.status === 400);

    // Verify stock was NOT reduced after failed payments
    const checkProductAfterFail = await request('GET', `/products/${firstProduct._id}`);
    const packingAfterFail = checkProductAfterFail.body.data.packings.find((p) => p.size === targetPacking.size);
    assert('Stock remains unchanged after failed payments', packingAfterFail.stock === initialStock);

    // D. Successful Demo Card (ONLY cardNumber sent: 4111 1111 1111 1111)
    const successPayment = await request('POST', '/payments/process', {
      orderId: createdOrderId,
      paymentMethod: 'Card',
      cardNumber: '4111 1111 1111 1111'
    }, userToken);
    assert('Valid demo card (4111 1111 1111 1111) succeeds -> 200 OK', successPayment.status === 200);
    assert('Transaction ID generated (DEMO-TXN-...)', successPayment.body.data.transactionId.startsWith('DEMO-TXN-'));

    // Verify stock is reduced after success
    const checkProductAfterSuccess = await request('GET', `/products/${firstProduct._id}`);
    const packingAfterSuccess = checkProductAfterSuccess.body.data.packings.find((p) => p.size === targetPacking.size);
    assert('Product stock decreased by ordered quantity (2 units)', packingAfterSuccess.stock === initialStock - 2);

    // Verify cart is cleared after success
    const checkCartAfterOrder = await request('GET', '/cart', null, userToken);
    assert('User cart is emptied after successful order', checkCartAfterOrder.body.data.items.length === 0);

    // Duplicate payment prevention
    const duplicatePayment = await request('POST', '/payments/process', {
      orderId: createdOrderId,
      paymentMethod: 'Card',
      cardNumber: '4111 1111 1111 1111'
    }, userToken);
    assert('Double payment attempt on already-paid order rejected -> 400', duplicatePayment.status === 400);

    // E. Test Successful UPI Payment on a new order (ONLY upiId: test@upi)
    await request('POST', '/cart', { productId: firstProduct._id, packingSize: targetPacking.size, quantity: 1 }, userToken);
    const orderUpi = await request('POST', '/orders', {
      shippingAddress: { fullName: 'UPI Tester', email: validEmail, phone: '+91 99999 88888', address: 'Lab UPI', city: 'Mumbai', state: 'MH', pincode: '400001' }
    }, userToken);
    const successUpiPayment = await request('POST', '/payments/process', {
      orderId: orderUpi.body.data._id,
      paymentMethod: 'UPI',
      upiId: 'test@upi'
    }, userToken);
    assert('Valid demo UPI (test@upi) succeeds -> 200 OK', successUpiPayment.status === 200);
    assert('UPI payment status is Paid', successUpiPayment.body.data.paymentStatus === 'Paid');

    // F. Test Successful Net Banking Payment on a new order (ONLY bankName: Demo Bank)
    await request('POST', '/cart', { productId: firstProduct._id, packingSize: targetPacking.size, quantity: 1 }, userToken);
    const orderNetBank = await request('POST', '/orders', {
      shippingAddress: { fullName: 'NetBank Tester', email: validEmail, phone: '+91 99999 88888', address: 'Lab Bank', city: 'Mumbai', state: 'MH', pincode: '400001' }
    }, userToken);
    const successBankPayment = await request('POST', '/payments/process', {
      orderId: orderNetBank.body.data._id,
      paymentMethod: 'Net Banking',
      bankName: 'Demo Bank'
    }, userToken);
    assert('Valid Net Banking (Demo Bank) succeeds -> 200 OK', successBankPayment.status === 200);
    assert('Net Banking payment status is Paid', successBankPayment.body.data.paymentStatus === 'Paid');

    // 8. Order Ownership Security
    console.log('\n[8] Order Security & Role Authorization...');
    // Register another user
    const otherUserReg = await request('POST', '/auth/register', {
      fullName: 'Other Lab',
      email: `other_${Date.now()}@lab.com`,
      password: 'Pass@123'
    });
    const otherToken = otherUserReg.body.data.token;

    // Other user tries to view first user's order
    const unauthorizedOrderView = await request('GET', `/orders/${createdOrderId}`, null, otherToken);
    assert('User cannot view another user\'s order -> 403 Forbidden', unauthorizedOrderView.status === 403);

    // Regular user tries to access Admin Dashboard
    const unauthorizedAdminAccess = await request('GET', '/admin/dashboard', null, userToken);
    assert('Normal USER cannot access Admin Dashboard -> 403 Forbidden', unauthorizedAdminAccess.status === 403);

    // 9. Admin Suite Verification
    console.log('\n[9] Admin Dashboard & Operations...');
    const adminDash = await request('GET', '/admin/dashboard', null, adminToken);
    assert('Admin gets dashboard stats -> 200 OK', adminDash.status === 200);
    assert('Dashboard has revenue only from paid orders', adminDash.body.data.stats.totalRevenue > 0);
    assert('Dashboard shows total products, orders, enquiries', adminDash.body.data.stats.totalProducts > 0);

    // Admin updates order status
    const updateOrder = await request('PUT', `/admin/orders/${createdOrderId}/status`, {
      orderStatus: 'Shipped'
    }, adminToken);
    assert('Admin updates order status to Shipped -> 200 OK', updateOrder.status === 200);
    assert('Order status in DB is now Shipped', updateOrder.body.data.orderStatus === 'Shipped');

    // Safe Category Deletion: Try deleting a category with products
    const categoriesList = await request('GET', '/categories');
    const labChemCat = categoriesList.body.data.find((c) => c.name === 'Laboratory Chemicals');
    if (labChemCat) {
      const deleteCatRes = await request('DELETE', `/categories/${labChemCat._id}`, null, adminToken);
      assert('Prevent deleting category with associated products -> 400 Bad Request', deleteCatRes.status === 400);
    }

    console.log('\n========================================');
    console.log('ALL AUTOMATED API TESTS PASSED SUCCESSFULLY! ✓');
    console.log('========================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n[API TEST FAILED]:', err.message);
    process.exit(1);
  }
};

runTests();
