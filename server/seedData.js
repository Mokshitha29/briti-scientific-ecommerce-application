const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Payment = require('./models/Payment');
const Enquiry = require('./models/Enquiry');
const ContactMessage = require('./models/ContactMessage');
const Cart = require('./models/Cart');

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seed Data] Connected to MongoDB. Preparing to populate sample data...');

    // Clear existing collections except admin user
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Payment.deleteMany({});
    await Enquiry.deleteMany({});
    await ContactMessage.deleteMany({});
    await Cart.deleteMany({});
    // Remove only non-admin users
    await User.deleteMany({ role: { $ne: 'ADMIN' } });

    // 1. Seed Categories (12 Categories)
    const categoryData = [
      { name: 'Laboratory Chemicals', description: 'General analytical grade and pure reagents for scientific laboratory synthesis and testing.' },
      { name: 'Reference Standards', description: 'High purity analytical reference materials with certificate of analysis.' },
      { name: 'GC Reference Standards', description: 'Gas chromatography standards with verified retention times and purity.' },
      { name: 'HPLC Solvents', description: 'Spectrophotometric and HPLC gradient grade ultra-pure solvents.' },
      { name: 'GC Solvents', description: 'Residue analysis and headspace gas chromatography grade solvents.' },
      { name: 'NIST Traceable Standards', description: 'Calibration standards directly traceable to NIST primary reference materials.' },
      { name: 'AAS/ICP Standards', description: 'Trace metal standards for atomic absorption and ICP spectroscopy.' },
      { name: 'LC-MS Solvents', description: 'Ultra-pure solvents formulated specifically for liquid chromatography-mass spectrometry.' },
      { name: 'Pharmaceutical Impurities', description: 'Pharmacopeial standard reference impurities for drug development and QC.' },
      { name: 'Pesticide Standards', description: 'Analytical standards for agricultural residue and environmental pollutant testing.' },
      { name: 'Research Chemicals', description: 'Specialty organic and inorganic compounds for academic and industrial research.' },
      { name: 'Certified Reference Materials', description: 'ISO 17034 accredited certified reference materials for precision calibration.' }
    ];

    const createdCategories = await Category.insertMany(categoryData);
    console.log(`[Seed Data] Created ${createdCategories.length} categories.`);

    const catMap = {};
    createdCategories.forEach((c) => {
      catMap[c.name] = c._id;
    });

    // 2. Seed Chemical Products (22 Products)
    const productData = [
      {
        productCode: 'BS10001',
        name: 'Activated Charcoal',
        casNumber: '7440-44-0',
        category: catMap['Laboratory Chemicals'],
        description: 'Decolorizing powder with high adsorptive capacity, suitable for chemical synthesis and analytical purification.',
        purity: 'AR',
        hsnCode: '38029019',
        gst: 18,
        image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=60',
        packings: [
          { size: '500 gm', price: 726, stock: 20 },
          { size: '1 kg', price: 1400, stock: 15 },
          { size: '5 kg', price: 6126, stock: 5 }
        ],
        isActive: true
      },
      {
        productCode: 'BS10002',
        name: 'Acetone HPLC Grade',
        casNumber: '67-64-1',
        category: catMap['HPLC Solvents'],
        description: 'Ultra-low UV absorption solvent for HPLC mobile phases and spectrophotometric applications.',
        purity: 'HPLC Grade ≥ 99.8%',
        hsnCode: '29141100',
        gst: 18,
        image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&auto=format&fit=crop&q=60',
        packings: [
          { size: '1 L', price: 650, stock: 25 },
          { size: '2.5 L', price: 1450, stock: 12 },
          { size: '25 L', price: 11200, stock: 4 }
        ],
        isActive: true
      },
      {
        productCode: 'BS10003',
        name: 'Methanol LC-MS Grade',
        casNumber: '67-56-1',
        category: catMap['LC-MS Solvents'],
        description: 'Specifically purified to minimize background noise and adduct formation in electrospray ionization LC-MS.',
        purity: 'LC-MS Grade ≥ 99.9%',
        hsnCode: '29051100',
        gst: 18,
        image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=600&auto=format&fit=crop&q=60',
        packings: [
          { size: '1 L', price: 850, stock: 30 },
          { size: '2.5 L', price: 1950, stock: 15 },
          { size: '4 L', price: 2900, stock: 8 }
        ],
        isActive: true
      },
      {
        productCode: 'BS10004',
        name: 'Acetonitrile HPLC Gradient',
        casNumber: '75-05-8',
        category: catMap['HPLC Solvents'],
        description: 'Optimized for gradient HPLC separation with minimum baseline drift at 210 nm and 254 nm.',
        purity: 'HPLC Gradient ≥ 99.9%',
        hsnCode: '29269000',
        gst: 18,
        image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=60',
        packings: [
          { size: '1 L', price: 1250, stock: 18 },
          { size: '2.5 L', price: 2800, stock: 10 },
          { size: '4 L', price: 4200, stock: 5 }
        ],
        isActive: true
      },
      {
        productCode: 'BS10005',
        name: 'Toluene AR Grade',
        casNumber: '108-88-3',
        category: catMap['Laboratory Chemicals'],
        description: 'High purity analytical reagent grade toluene for extraction and synthesis in controlled laboratory settings.',
        purity: 'AR ≥ 99.5%',
        hsnCode: '29023000',
        gst: 18,
        image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=60',
        packings: [
          { size: '500 mL', price: 420, stock: 22 },
          { size: '2.5 L', price: 1650, stock: 14 }
        ],
        isActive: true
      },
      {
        productCode: 'BS10006',
        name: 'Ethanol Absolute 99.9%',
        casNumber: '64-17-5',
        category: catMap['Laboratory Chemicals'],
        description: 'Anhydrous pure ethanol for histological preparations, spectrophotometry, and molecular biology.',
        purity: 'Absolute 99.9%',
        hsnCode: '22071000',
        gst: 18,
        image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&auto=format&fit=crop&q=60',
        packings: [
          { size: '500 mL', price: 580, stock: 20 },
          { size: '2.5 L', price: 2300, stock: 10 }
        ],
        isActive: true
      },
      {
        productCode: 'BS10007',
        name: 'Sodium Chloride AR',
        casNumber: '7647-14-5',
        category: catMap['Laboratory Chemicals'],
        description: 'Analytical reagent grade sodium chloride tested for low bromide, iodide, and heavy metals content.',
        purity: 'AR ≥ 99.5%',
        hsnCode: '25010090',
        gst: 18,
        image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=600&auto=format&fit=crop&q=60',
        packings: [
          { size: '500 gm', price: 280, stock: 45 },
          { size: '5 kg', price: 1950, stock: 15 },
          { size: '25 kg', price: 7800, stock: 6 }
        ],
        isActive: true
      },
      {
        productCode: 'BS10008',
        name: 'Potassium Chloride AR',
        casNumber: '7447-40-7',
        category: catMap['Laboratory Chemicals'],
        description: 'High purity analytical salt for buffer formulation, electrode filling solutions, and biochemistry.',
        purity: 'AR ≥ 99.5%',
        hsnCode: '31042000',
        gst: 18,
        image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=60',
        packings: [
          { size: '500 gm', price: 360, stock: 30 },
          { size: '5 kg', price: 2800, stock: 8 }
        ],
        isActive: true
      },
      {
        productCode: 'BS10009',
        name: 'Sulfuric Acid 98% AR',
        casNumber: '7664-93-9',
        category: catMap['Laboratory Chemicals'],
        description: 'Heavy chemical reagent suitable for digestions, titrations, and chemical oxidations.',
        purity: 'AR 98.0%',
        hsnCode: '28070010',
        gst: 18,
        image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=60',
        packings: [
          { size: '500 mL', price: 450, stock: 25 },
          { size: '2.5 L', price: 1800, stock: 12 }
        ],
        isActive: true
      },
      {
        productCode: 'BS10010',
        name: 'Hydrochloric Acid 37% Trace Metal',
        casNumber: '7647-01-0',
        category: catMap['AAS/ICP Standards'],
        description: 'Trace metal grade acid with metal impurities below 1 ppb for environmental and food sample digestion.',
        purity: 'Trace Metal 37%',
        hsnCode: '28061000',
        gst: 18,
        image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&auto=format&fit=crop&q=60',
        packings: [
          { size: '500 mL', price: 410, stock: 20 },
          { size: '2.5 L', price: 1600, stock: 9 }
        ],
        isActive: true
      },
      {
        productCode: 'BS10011',
        name: 'Nitric Acid 69% Trace Metal',
        casNumber: '7697-37-2',
        category: catMap['AAS/ICP Standards'],
        description: 'Purified for microwave digestions and baseline preparation for ICP-MS and ICP-OES analysis.',
        purity: 'Trace Metal 69%',
        hsnCode: '28080010',
        gst: 18,
        image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=600&auto=format&fit=crop&q=60',
        packings: [
          { size: '500 mL', price: 520, stock: 15 },
          { size: '2.5 L', price: 2100, stock: 7 }
        ],
        isActive: true
      },
      {
        productCode: 'BS10012',
        name: 'Dichloromethane (DCM) HPLC',
        casNumber: '75-09-2',
        category: catMap['HPLC Solvents'],
        description: 'Methylene chloride solvent with minimal non-volatile residue and moisture for HPLC and GC extraction.',
        purity: 'HPLC ≥ 99.8%',
        hsnCode: '29031200',
        gst: 18,
        image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=60',
        packings: [
          { size: '1 L', price: 780, stock: 20 },
          { size: '2.5 L', price: 1750, stock: 11 }
        ],
        isActive: true
      },
      {
        productCode: 'BS10013',
        name: 'Isopropanol (IPA) LC-MS',
        casNumber: '67-63-0',
        category: catMap['LC-MS Solvents'],
        description: 'High-purity 2-propanol filtered to 0.1 µm for reverse-phase chromatography and peptide sequencing.',
        purity: 'LC-MS ≥ 99.9%',
        hsnCode: '29051220',
        gst: 18,
        image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=60',
        packings: [
          { size: '1 L', price: 720, stock: 25 },
          { size: '2.5 L', price: 1600, stock: 10 }
        ],
        isActive: true
      },
      {
        productCode: 'BS10014',
        name: 'Tetrahydrofuran (THF) GC',
        casNumber: '109-99-9',
        category: catMap['GC Solvents'],
        description: 'BHT-inhibited stabilized solvent suitable for GPC/SEC and complex polymer dissolution.',
        purity: 'GC Grade ≥ 99.8%',
        hsnCode: '29321100',
        gst: 18,
        image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&auto=format&fit=crop&q=60',
        packings: [
          { size: '1 L', price: 1450, stock: 12 },
          { size: '2.5 L', price: 3200, stock: 6 }
        ],
        isActive: true
      },
      {
        productCode: 'BS10015',
        name: 'n-Hexane 95% HPLC',
        casNumber: '110-54-3',
        category: catMap['HPLC Solvents'],
        description: 'Low boiling hydrocarbon solvent for normal-phase HPLC separation and pharmaceutical lipid analysis.',
        purity: 'HPLC ≥ 95%',
        hsnCode: '29011000',
        gst: 18,
        image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=600&auto=format&fit=crop&q=60',
        packings: [
          { size: '1 L', price: 890, stock: 16 },
          { size: '2.5 L', price: 1980, stock: 9 }
        ],
        isActive: true
      },
      {
        productCode: 'BS10016',
        name: 'Caffeine Reference Standard',
        casNumber: '58-08-2',
        category: catMap['Reference Standards'],
        description: 'Certified primary reference standard with full COA, HPLC assay, and NMR structural identification.',
        purity: 'Analytical Standard ≥ 99.8%',
        hsnCode: '29393000',
        gst: 18,
        image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=60',
        packings: [
          { size: '100 mg', price: 3400, stock: 8 },
          { size: '500 mg', price: 12500, stock: 3 }
        ],
        isActive: true
      },
      {
        productCode: 'BS10017',
        name: 'Paracetamol Impurity J Standard',
        casNumber: '614-80-2',
        category: catMap['Pharmaceutical Impurities'],
        description: 'European Pharmacopoeia (EP) standard for 4-(acetylamino)phenyl acetate impurity identification.',
        purity: 'Pharmacopeial Grade ≥ 98.5%',
        hsnCode: '29242990',
        gst: 18,
        image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=60',
        packings: [
          { size: '50 mg', price: 4800, stock: 5 },
          { size: '100 mg', price: 8500, stock: 2 }
        ],
        isActive: true
      },
      {
        productCode: 'BS10018',
        name: 'Lead ICP Standard 1000 mg/L',
        casNumber: '7439-92-1',
        category: catMap['AAS/ICP Standards'],
        description: 'NIST traceable 1000 ppm Pb in 2% HNO3 with accredited certificate of analysis.',
        purity: 'NIST Traceable 1000 ppm',
        hsnCode: '38220090',
        gst: 18,
        image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&auto=format&fit=crop&q=60',
        packings: [
          { size: '100 mL', price: 2200, stock: 14 },
          { size: '500 mL', price: 7500, stock: 5 }
        ],
        isActive: true
      },
      {
        productCode: 'BS10019',
        name: 'Arsenic AAS Standard 1000 mg/L',
        casNumber: '7440-38-2',
        category: catMap['AAS/ICP Standards'],
        description: 'Single element standard solution 1000 mg/L As in 2-5% HNO3 for atomic absorption calibration.',
        purity: 'AAS Grade 1000 ppm',
        hsnCode: '38220090',
        gst: 18,
        image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=600&auto=format&fit=crop&q=60',
        packings: [
          { size: '100 mL', price: 2400, stock: 10 },
          { size: '500 mL', price: 8100, stock: 4 }
        ],
        isActive: true
      },
      {
        productCode: 'BS10020',
        name: 'Chlorpyrifos Pesticide Standard',
        casNumber: '2921-88-2',
        category: catMap['Pesticide Standards'],
        description: 'High purity organophosphate pesticide reference material for GC-MS and LC-MS residue analysis.',
        purity: 'Certified Standard ≥ 99.0%',
        hsnCode: '38089190',
        gst: 18,
        image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=60',
        packings: [
          { size: '100 mg', price: 4200, stock: 6 },
          { size: '250 mg', price: 9200, stock: 3 }
        ],
        isActive: true
      },
      {
        productCode: 'BS10021',
        name: 'Sodium Hydroxide Pellets AR',
        casNumber: '1310-73-2',
        category: catMap['Laboratory Chemicals'],
        description: 'Analytical reagent grade caustic soda pellets with minimal carbonate content for standard solutions.',
        purity: 'AR ≥ 98.0%',
        hsnCode: '28151110',
        gst: 18,
        image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=60',
        packings: [
          { size: '500 gm', price: 310, stock: 50 },
          { size: '5 kg', price: 2400, stock: 18 }
        ],
        isActive: true
      },
      {
        productCode: 'BS10022',
        name: 'Potassium Permanganate AR',
        casNumber: '7722-64-7',
        category: catMap['Laboratory Chemicals'],
        description: 'Analytical oxidizing reagent with crystalline dark purple granules for redox volumetric titrations.',
        purity: 'AR ≥ 99.0%',
        hsnCode: '28416100',
        gst: 18,
        image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&auto=format&fit=crop&q=60',
        packings: [
          { size: '500 gm', price: 490, stock: 28 },
          { size: '5 kg', price: 3800, stock: 7 }
        ],
        isActive: true
      }
    ];

    const createdProducts = await Product.insertMany(productData);
    console.log(`[Seed Data] Created ${createdProducts.length} chemical products.`);

    // 3. Seed 5 Fictional Users (all passwords strictly satisfy regex)
    const salt = await bcrypt.genSalt(10);
    const sampleUsers = [
      {
        fullName: 'Rahul Sharma',
        email: 'rahul.sharma@researchlab.org',
        phone: '+91 98111 22334',
        companyName: 'National Research Labs',
        password: await bcrypt.hash('Pass@1', salt),
        role: 'USER',
        isActive: true
      },
      {
        fullName: 'Priya Patel',
        email: 'priya.patel@biotechsolutions.com',
        phone: '+91 98222 33445',
        companyName: 'Apex Biotech Solutions',
        password: await bcrypt.hash('Bio#12', salt),
        role: 'USER',
        isActive: true
      },
      {
        fullName: 'Dr. Anand Kumar',
        email: 'dr.anand@pharmaindia.in',
        phone: '+91 98333 44556',
        companyName: 'Pharma India Laboratories',
        password: await bcrypt.hash('Doc@99', salt),
        role: 'USER',
        isActive: true
      },
      {
        fullName: 'Sunita Rao',
        email: 'sunita.rao@analyticalchem.ac.in',
        phone: '+91 98444 55667',
        companyName: 'Analytical Sciences Institute',
        password: await bcrypt.hash('Chem#1', salt),
        role: 'USER',
        isActive: true
      },
      {
        fullName: 'Vikram Mehta',
        email: 'vikram.mehta@qualitytesting.com',
        phone: '+91 98555 66778',
        companyName: 'Standard Testing & Inspection',
        password: await bcrypt.hash('Qual#7', salt),
        role: 'USER',
        isActive: true
      }
    ];

    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`[Seed Data] Created ${createdUsers.length} sample users.`);

    // 4. Seed 5 Sample Orders
    const sampleOrders = [
      {
        orderNumber: 'BS-ORD-20260920-1011',
        userId: createdUsers[0]._id,
        items: [
          {
            productId: createdProducts[0]._id,
            productName: createdProducts[0].name,
            packingSize: '500 gm',
            quantity: 2,
            price: 726
          },
          {
            productId: createdProducts[1]._id,
            productName: createdProducts[1].name,
            packingSize: '1 L',
            quantity: 1,
            price: 650
          }
        ],
        shippingAddress: {
          fullName: 'Rahul Sharma',
          email: 'rahul.sharma@researchlab.org',
          phone: '+91 98111 22334',
          address: 'Plot 45, Science City Tech Park',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500081'
        },
        subtotal: 2102,
        gstAmount: 378.36,
        totalAmount: 2480.36,
        paymentStatus: 'Paid',
        orderStatus: 'Delivered',
        paymentMethod: 'Card',
        transactionId: 'DEMO-TXN-20260920-881920'
      },
      {
        orderNumber: 'BS-ORD-20260921-2045',
        userId: createdUsers[1]._id,
        items: [
          {
            productId: createdProducts[2]._id,
            productName: createdProducts[2].name,
            packingSize: '2.5 L',
            quantity: 1,
            price: 1950
          },
          {
            productId: createdProducts[3]._id,
            productName: createdProducts[3].name,
            packingSize: '1 L',
            quantity: 2,
            price: 1250
          }
        ],
        shippingAddress: {
          fullName: 'Priya Patel',
          email: 'priya.patel@biotechsolutions.com',
          phone: '+91 98222 33445',
          address: 'Building 7, Biotech Innovation Campus',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560100'
        },
        subtotal: 4450,
        gstAmount: 801,
        totalAmount: 5251,
        paymentStatus: 'Paid',
        orderStatus: 'Confirmed',
        paymentMethod: 'UPI',
        transactionId: 'DEMO-TXN-20260921-341901'
      },
      {
        orderNumber: 'BS-ORD-20260922-3091',
        userId: createdUsers[2]._id,
        items: [
          {
            productId: createdProducts[15]._id,
            productName: createdProducts[15].name,
            packingSize: '100 mg',
            quantity: 1,
            price: 3400
          }
        ],
        shippingAddress: {
          fullName: 'Dr. Anand Kumar',
          email: 'dr.anand@pharmaindia.in',
          phone: '+91 98333 44556',
          address: 'R&D Centre, Industrial Phase II',
          city: 'Ahmedabad',
          state: 'Gujarat',
          pincode: '382445'
        },
        subtotal: 3400,
        gstAmount: 612,
        totalAmount: 4012,
        paymentStatus: 'Paid',
        orderStatus: 'Processing',
        paymentMethod: 'Net Banking',
        transactionId: 'DEMO-TXN-20260922-771239'
      },
      {
        orderNumber: 'BS-ORD-20260922-4112',
        userId: createdUsers[3]._id,
        items: [
          {
            productId: createdProducts[6]._id,
            productName: createdProducts[6].name,
            packingSize: '500 gm',
            quantity: 3,
            price: 280
          }
        ],
        shippingAddress: {
          fullName: 'Sunita Rao',
          email: 'sunita.rao@analyticalchem.ac.in',
          phone: '+91 98444 55667',
          address: 'Chemistry Department, Central University',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411007'
        },
        subtotal: 840,
        gstAmount: 151.2,
        totalAmount: 991.2,
        paymentStatus: 'Pending',
        orderStatus: 'Pending',
        paymentMethod: 'Demo Payment Gateway'
      },
      {
        orderNumber: 'BS-ORD-20260923-5501',
        userId: createdUsers[4]._id,
        items: [
          {
            productId: createdProducts[17]._id,
            productName: createdProducts[17].name,
            packingSize: '100 mL',
            quantity: 1,
            price: 2200
          }
        ],
        shippingAddress: {
          fullName: 'Vikram Mehta',
          email: 'vikram.mehta@qualitytesting.com',
          phone: '+91 98555 66778',
          address: 'Quality Control Unit, Sector 62',
          city: 'Noida',
          state: 'Uttar Pradesh',
          pincode: '201301'
        },
        subtotal: 2200,
        gstAmount: 396,
        totalAmount: 2596,
        paymentStatus: 'Paid',
        orderStatus: 'Shipped',
        paymentMethod: 'Card',
        transactionId: 'DEMO-TXN-20260923-998811'
      }
    ];

    const createdOrders = await Order.insertMany(sampleOrders);
    console.log(`[Seed Data] Created ${createdOrders.length} sample orders.`);

    // 5. Seed Payments for Paid Orders
    for (const ord of createdOrders) {
      if (ord.paymentStatus === 'Paid') {
        await Payment.create({
          orderId: ord._id,
          userId: ord.userId,
          amount: ord.totalAmount,
          paymentMethod: ord.paymentMethod,
          transactionId: ord.transactionId,
          paymentStatus: 'SUCCESS'
        });
      }
    }
    console.log('[Seed Data] Created corresponding payment records.');

    // 6. Seed 5 Sample Chemical Enquiries
    const sampleEnquiries = [
      {
        companyName: 'Zenith BioPharma Ltd',
        customerName: 'Dr. Suresh Varma',
        officialEmail: 'suresh.varma@zenithpharma.com',
        phone: '+91 97111 00223',
        chemicalName: 'Acetonitrile LC-MS Ultra',
        casNumber: '75-05-8',
        requiredQuantity: '50 x 2.5 Litre bottles',
        message: 'Looking for bulk procurement for commercial batch testing. Please provide Certificate of Analysis and quotation.',
        status: 'New'
      },
      {
        companyName: 'GreenCrop Environmental Research',
        customerName: 'Meenakshi Iyer',
        officialEmail: 'meenakshi@greencrop.org',
        phone: '+91 97222 33441',
        chemicalName: 'Chlorpyrifos & Triazophos Mix Standard',
        casNumber: '2921-88-2',
        requiredQuantity: '10 vials of 100 mg',
        message: 'We require pesticide residue standards with ISO 17034 traceability for soil testing project.',
        status: 'Contacted'
      },
      {
        companyName: 'National Metrology Institute',
        customerName: 'Prof. K. Raman',
        officialEmail: 'k.raman@nmi.res.in',
        phone: '+91 97333 44552',
        chemicalName: 'NIST Traceable Lead and Cadmium Standards',
        casNumber: '7439-92-1',
        requiredQuantity: '20 bottles x 500 mL',
        message: 'Formal procurement tender enquiry for annual heavy metal testing calibration.',
        status: 'Resolved'
      },
      {
        companyName: 'Cadila Analytical Testing Services',
        customerName: 'Deepak Joshi',
        officialEmail: 'deepak.j@cadilatesting.com',
        phone: '+91 97444 55663',
        chemicalName: 'Paracetamol Related Compound J & K',
        casNumber: '614-80-2',
        requiredQuantity: '5 x 100 mg',
        message: 'Urgent analytical requirement for method validation study next week.',
        status: 'New'
      },
      {
        companyName: 'Aura Life Sciences',
        customerName: 'Anita Nair',
        officialEmail: 'anita.nair@auralife.in',
        phone: '+91 97555 66774',
        chemicalName: 'High Purity Activated Charcoal Acid Washed',
        casNumber: '7440-44-0',
        requiredQuantity: '100 kg drum',
        message: 'Please share technical data sheet (TDS), ash content specifications, and bulk pricing.',
        status: 'Contacted'
      }
    ];

    const createdEnquiries = await Enquiry.insertMany(sampleEnquiries);
    console.log(`[Seed Data] Created ${createdEnquiries.length} sample enquiries.`);

    // 7. Seed Sample Contact Messages
    const sampleContacts = [
      {
        name: 'Dr. Ramesh Gupta',
        email: 'ramesh.gupta@delhiuniversity.ac.in',
        phone: '+91 98765 11223',
        subject: 'Inquiry regarding HPLC Solvents Batch CoA',
        message: 'Kindly provide certificate of analysis for Acetone HPLC Grade batch BS-2026-09 for academic research validation.',
        status: 'New'
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@biotechsolutions.com',
        phone: '+91 98222 33445',
        subject: 'Certificate of Analysis request for Methanol LC-MS',
        message: 'We are requesting batch compliance data and heavy metal specifications for upcoming commercial batch synthesis.',
        status: 'Contacted'
      },
      {
        name: 'Dr. Anand Kumar',
        email: 'dr.anand@pharmaindia.in',
        phone: '+91 98333 44556',
        subject: 'General inquiry on hazardous chemical delivery protocols',
        message: 'Could you please confirm if cold-chain transport permits are included for regional warehouse dispatch in Gujarat?',
        status: 'Resolved'
      }
    ];

    const createdContacts = await ContactMessage.insertMany(sampleContacts);
    console.log(`[Seed Data] Created ${createdContacts.length} sample contact messages.`);

    console.log('[Seed Data] Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Data Error]: ${error.message}`);
    process.exit(1);
  }
};

seedData();
