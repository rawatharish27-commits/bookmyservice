import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

const SALT_ROUNDS = 10;

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean up existing data (order matters due to relations)
  console.log('🧹 Cleaning existing data...');
  await db.favorite.deleteMany();
  await db.disputeMessage.deleteMany();
  await db.dispute.deleteMany();
  await db.negotiation.deleteMany();
  await db.review.deleteMany();
  await db.payment.deleteMany();
  await db.booking.deleteMany();
  await db.serviceAvailability.deleteMany();
  await db.service.deleteMany();
  await db.serviceSubcategory.deleteMany();
  await db.serviceCategory.deleteMany();
  await db.notification.deleteMany();
  await db.adminLog.deleteMany();
  await db.providerKyc.deleteMany();
  await db.user.deleteMany();
  await db.role.deleteMany();
  await db.faq.deleteMany();
  await db.legalPage.deleteMany();
  await db.seoMetadata.deleteMany();
  await db.revenueStream.deleteMany();
  await db.contactMessage.deleteMany();
  await db.visitorSession.deleteMany();
  await db.platformStats.deleteMany();

  // ========================================
  // 1. ROLES
  // ========================================
  console.log('📋 Creating roles...');
  const clientRole = await db.role.create({
    data: { name: 'CLIENT', description: 'Regular client who books services' },
  });
  const providerRole = await db.role.create({
    data: { name: 'PROVIDER', description: 'Service provider who offers services' },
  });
  const adminRole = await db.role.create({
    data: { name: 'ADMIN', description: 'Platform administrator with full access' },
  });

  // ========================================
  // 2. SERVICE CATEGORIES (3 categories)
  // ========================================
  console.log('📂 Creating service categories...');
  const categoryData = [
    { name: 'Plumbing', slug: 'plumbing', icon: 'Droplets', description: 'Professional plumbing services for your home' },
    { name: 'Electrical', slug: 'electrical', icon: 'Zap', description: 'Licensed electrical services for your home' },
    { name: 'AC & HVAC', slug: 'ac-hvac', icon: 'Wind', description: 'Air conditioning and heating services for your home' },
  ];

  const categories: Record<string, any> = {};
  for (let i = 0; i < categoryData.length; i++) {
    const cat = await db.serviceCategory.create({
      data: { ...categoryData[i], displayOrder: i + 1, isActive: true },
    });
    categories[cat.slug] = cat;
  }

  // ========================================
  // 3. SUBCATEGORIES (10 per category)
  // ========================================
  console.log('📁 Creating subcategories...');
  const subcategoryData: Record<string, Array<{ name: string; slug: string; description: string }>> = {
    'plumbing': [
      { name: 'Leak Repair', slug: 'leak-repair', description: 'Detection and repair of pipe leaks and water seepage' },
      { name: 'Drain Cleaning', slug: 'drain-cleaning', description: 'Blocked drain and sewer line cleaning services' },
      { name: 'Pipe Installation', slug: 'pipe-installation', description: 'New pipe installation and replacement services' },
      { name: 'Faucet Repair', slug: 'faucet-repair', description: 'Tap and faucet repair and replacement' },
      { name: 'Toilet Installation', slug: 'toilet-installation', description: 'Toilet seat, cistern, and flush installation' },
      { name: 'Water Heater Repair', slug: 'water-heater-repair', description: 'Geyser and water heater repair and servicing' },
      { name: 'Sewage Cleaning', slug: 'sewage-cleaning', description: 'Sewage line cleaning and unclogging services' },
      { name: 'Shower/Tub Repair', slug: 'shower-tub-repair', description: 'Shower and bathtub repair and fitting services' },
      { name: 'Gas Line Servicing', slug: 'gas-line-servicing', description: 'Gas pipe installation, repair, and safety checks' },
      { name: 'Pump Repair', slug: 'pump-repair', description: 'Water pump and motor repair and installation' },
    ],
    'electrical': [
      { name: 'Wiring Repairs', slug: 'wiring-repairs', description: 'House wiring repair and rewiring services' },
      { name: 'Light Fixture Installation', slug: 'light-fixture-installation', description: 'Chandelier, tube light, and LED fixture installation' },
      { name: 'Socket Repairs', slug: 'socket-repairs', description: 'Switch and socket point repair and installation' },
      { name: 'Circuit Breaker Fixing', slug: 'circuit-breaker-fixing', description: 'MCB, DB box, and circuit breaker repair and setup' },
      { name: 'Ceiling Fan Installation', slug: 'ceiling-fan-installation', description: 'Ceiling fan mounting, wiring, and repair' },
      { name: 'Smart Home Setup', slug: 'smart-home-setup', description: 'Smart home automation wiring and device setup' },
      { name: 'Generator Maintenance', slug: 'generator-maintenance', description: 'Generator servicing, repair, and maintenance' },
      { name: 'Switchboard Upgrades', slug: 'switchboard-upgrades', description: 'Switchboard and distribution board upgrades' },
      { name: 'Panel Repair', slug: 'panel-repair', description: 'Electrical panel and control panel repair' },
      { name: 'Appliance Grounding', slug: 'appliance-grounding', description: 'Earthing, grounding, and electrical safety installation' },
    ],
    'ac-hvac': [
      { name: 'AC Installation', slug: 'ac-installation', description: 'Split and window AC installation services' },
      { name: 'AC Repair', slug: 'ac-repair', description: 'AC cooling issues, troubleshooting, and repair' },
      { name: 'AC Cleaning/Servicing', slug: 'ac-cleaning-servicing', description: 'Foam wash, deep cleaning, and regular AC servicing' },
      { name: 'Heating Unit Repairs', slug: 'heating-unit-repairs', description: 'Heater and heating system repair services' },
      { name: 'Thermostat Setup', slug: 'thermostat-setup', description: 'Thermostat installation, calibration, and repair' },
      { name: 'Central Air Maintenance', slug: 'central-air-maintenance', description: 'Central air conditioning system maintenance and servicing' },
      { name: 'Duct Cleaning', slug: 'duct-cleaning', description: 'HVAC duct cleaning and sanitization services' },
      { name: 'Furnace Repair', slug: 'furnace-repair', description: 'Furnace diagnosis, repair, and maintenance' },
      { name: 'Ventilator Services', slug: 'ventilator-services', description: 'Ventilation system installation and servicing' },
      { name: 'Gas Refilling', slug: 'gas-refilling', description: 'Refrigerant gas refill and leak fixing services' },
    ],
  };

  const subcategories: Record<string, any[]> = {};
  for (const [catSlug, subs] of Object.entries(subcategoryData)) {
    const cat = categories[catSlug];
    if (!cat) continue;
    subcategories[catSlug] = [];
    for (let i = 0; i < subs.length; i++) {
      const sub = await db.serviceSubcategory.create({
        data: { ...subs[i], categoryId: cat.id, displayOrder: i + 1, isActive: true },
      });
      subcategories[catSlug].push(sub);
    }
  }

  // ========================================
  // 4. ADMIN USER
  // ========================================
  console.log('👤 Creating admin user...');
  const adminPasswordHash = await bcrypt.hash('admin123', SALT_ROUNDS);
  const admin = await db.user.create({
    data: {
      email: 'admin@bookyourservice.co.in',
      phone: '+919876543210',
      passwordHash: adminPasswordHash,
      name: 'Admin User',
      roleId: adminRole.id,
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400001',
      address: 'BookYourService HQ, Fort, Mumbai',
    },
  });

  // ========================================
  // 5. SERVICE PROVIDERS (5 providers - major Indian cities)
  // ========================================
  console.log('👷 Creating service providers...');
  const providerPasswordHash = await bcrypt.hash('provider123', SALT_ROUNDS);

  const providers: any[] = [];
  const providerInfos = [
    {
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@gmail.com',
      phone: '+919812345670',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      pincode: '110001',
      address: '45, Connaught Place, New Delhi',
      latitude: 28.6315,
      longitude: 77.2167,
      kyc: {
        documentType: 'AADHAAR',
        documentNumber: '234567890123',
        documentFrontUrl: '/uploads/kyc/rajesh-aadhaar-front.jpg',
        documentBackUrl: '/uploads/kyc/rajesh-aadhaar-back.jpg',
        selfieUrl: '/uploads/kyc/rajesh-selfie.jpg',
        verificationStatus: 'APPROVED',
        verifiedBy: admin.id,
      },
    },
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@gmail.com',
      phone: '+919812345671',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400051',
      address: '12, Andheri West, Mumbai',
      latitude: 19.1197,
      longitude: 72.8464,
      kyc: {
        documentType: 'PAN',
        documentNumber: 'ABCDE1234F',
        documentFrontUrl: '/uploads/kyc/priya-pan-front.jpg',
        selfieUrl: '/uploads/kyc/priya-selfie.jpg',
        verificationStatus: 'APPROVED',
        verifiedBy: admin.id,
      },
    },
    {
      name: 'Arun Patel',
      email: 'arun.patel@gmail.com',
      phone: '+919812345672',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      pincode: '560001',
      address: '78, Koramangala, Bengaluru',
      latitude: 12.9352,
      longitude: 77.6245,
      kyc: {
        documentType: 'DRIVING_LICENSE',
        documentNumber: 'KA0120120012345',
        documentFrontUrl: '/uploads/kyc/arun-dl-front.jpg',
        documentBackUrl: '/uploads/kyc/arun-dl-back.jpg',
        selfieUrl: '/uploads/kyc/arun-selfie.jpg',
        verificationStatus: 'APPROVED',
        verifiedBy: admin.id,
      },
    },
    {
      name: 'Srinivas Rao',
      email: 'srinivas.rao@gmail.com',
      phone: '+919812345673',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      pincode: '500001',
      address: '23, Banjara Hills, Hyderabad',
      latitude: 17.4156,
      longitude: 78.4489,
      kyc: {
        documentType: 'AADHAAR',
        documentNumber: '567890123456',
        documentFrontUrl: '/uploads/kyc/srinivas-aadhaar-front.jpg',
        documentBackUrl: '/uploads/kyc/srinivas-aadhaar-back.jpg',
        selfieUrl: '/uploads/kyc/srinivas-selfie.jpg',
        verificationStatus: 'APPROVED',
        verifiedBy: admin.id,
      },
    },
    {
      name: 'Karthik Iyer',
      email: 'karthik.iyer@gmail.com',
      phone: '+919812345674',
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      pincode: '600001',
      address: '89, T. Nagar, Chennai',
      latitude: 13.0418,
      longitude: 80.2341,
      kyc: {
        documentType: 'PASSPORT',
        documentNumber: 'T5678901',
        documentFrontUrl: '/uploads/kyc/karthik-passport-front.jpg',
        documentBackUrl: '/uploads/kyc/karthik-passport-back.jpg',
        selfieUrl: '/uploads/kyc/karthik-selfie.jpg',
        verificationStatus: 'APPROVED',
        verifiedBy: admin.id,
      },
    },
  ];

  for (const pInfo of providerInfos) {
    const { kyc, ...userData } = pInfo;
    const provider = await db.user.create({
      data: {
        ...userData,
        passwordHash: providerPasswordHash,
        roleId: providerRole.id,
        status: 'ACTIVE',
        emailVerified: true,
        phoneVerified: true,
        providerKyc: {
          create: {
            ...kyc,
            verifiedAt: new Date('2025-01-15'),
          },
        },
      },
    });
    providers.push(provider);
  }

  // ========================================
  // 6. CLIENT USERS (8 clients with various statuses)
  // ========================================
  console.log('👥 Creating client users...');
  const clientPasswordHash = await bcrypt.hash('client123', SALT_ROUNDS);
  const clients: any[] = [];
  const clientInfos = [
    { name: 'Anita Desai', email: 'anita.desai@gmail.com', phone: '+919912345670', status: 'ACTIVE', city: 'Hyderabad', state: 'Telangana', country: 'India', pincode: '500001', address: '23, Banjara Hills, Hyderabad', latitude: 17.4156, longitude: 78.4489, emailVerified: true, phoneVerified: true },
    { name: 'Vikram Singh', email: 'vikram.singh@gmail.com', phone: '+919912345671', status: 'ACTIVE', city: 'Delhi', state: 'Delhi', country: 'India', pincode: '110001', address: '56, GK-II, New Delhi', latitude: 28.5485, longitude: 77.2485, emailVerified: true, phoneVerified: true },
    { name: 'Meera Nair', email: 'meera.nair@gmail.com', phone: '+919912345672', status: 'PENDING', city: 'Chennai', state: 'Tamil Nadu', country: 'India', pincode: '600001', address: '89, T. Nagar, Chennai', latitude: 13.0418, longitude: 80.2341, emailVerified: false, phoneVerified: true },
    { name: 'Suresh Reddy', email: 'suresh.reddy@gmail.com', phone: '+919912345673', status: 'ACTIVE', city: 'Bengaluru', state: 'Karnataka', country: 'India', pincode: '560034', address: '34, Whitefield, Bengaluru', latitude: 12.9698, longitude: 77.7500, emailVerified: true, phoneVerified: true },
    { name: 'Kavita Joshi', email: 'kavita.joshi@gmail.com', phone: '+919912345674', status: 'BLOCKED', city: 'Mumbai', state: 'Maharashtra', country: 'India', pincode: '400051', address: '67, Malviya Nagar, Mumbai', latitude: 19.0596, longitude: 72.8456, emailVerified: true, phoneVerified: false },
    { name: 'Deepak Verma', email: 'deepak.verma@gmail.com', phone: '+919912345675', status: 'ACTIVE', city: 'Hyderabad', state: 'Telangana', country: 'India', pincode: '500034', address: '12, Madhapur, Hyderabad', latitude: 17.4491, longitude: 78.3912, emailVerified: true, phoneVerified: true },
    { name: 'Pooja Menon', email: 'pooja.menon@gmail.com', phone: '+919912345676', status: 'SUSPENDED', city: 'Chennai', state: 'Tamil Nadu', country: 'India', pincode: '600018', address: '45, Adyar, Chennai', latitude: 13.0067, longitude: 80.2572, emailVerified: true, phoneVerified: true },
    { name: 'Rahul Gupta', email: 'rahul.gupta@gmail.com', phone: '+919912345677', status: 'ACTIVE', city: 'Delhi', state: 'Delhi', country: 'India', pincode: '110019', address: '78, Saket, New Delhi', latitude: 28.5244, longitude: 77.2066, emailVerified: true, phoneVerified: true },
  ];

  for (const cInfo of clientInfos) {
    const client = await db.user.create({
      data: { ...cInfo, passwordHash: clientPasswordHash, roleId: clientRole.id },
    });
    clients.push(client);
  }

  // ========================================
  // 7. SERVICES (14 services across 3 categories)
  // ========================================
  console.log('🔧 Creating services...');
  const serviceData = [
    // Rajesh Kumar - Delhi provider (Plumbing + Electrical)
    {
      providerId: providers[0].id,
      categoryId: categories['plumbing'].id,
      subcategoryId: subcategories['plumbing']?.[0]?.id,
      title: 'Professional Leak Repair & Detection Service',
      description: 'Expert plumbing service for detecting and repairing all types of pipe leakages, water seepage, and dampness issues. We use advanced leak detection equipment including thermal imaging and acoustic sensors. Service includes thorough inspection, precise leak location identification, professional repair using quality materials, and post-repair pressure testing to ensure the fix is permanent.',
      basePrice: 499,
      priceNegotiable: true,
      serviceDurationMinutes: 60,
      serviceAreaRadiusKm: 15,
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      address: '45, Connaught Place, New Delhi',
      pincode: '110001',
      latitude: 28.6315,
      longitude: 77.2167,
    },
    {
      providerId: providers[0].id,
      categoryId: categories['plumbing'].id,
      subcategoryId: subcategories['plumbing']?.[4]?.id,
      title: 'Toilet Installation & Repair Service',
      description: 'Complete toilet installation, replacement, and repair service. Whether you need a new western-style toilet installed, an existing one repaired, or a cistern fixed, our experienced plumbers handle it all. We work with all major brands and ensure proper sealing, water connection, and flush mechanism setup. Same-day service available for urgent repairs.',
      basePrice: 699,
      priceNegotiable: false,
      serviceDurationMinutes: 90,
      serviceAreaRadiusKm: 15,
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      address: '45, Connaught Place, New Delhi',
      pincode: '110001',
      latitude: 28.6315,
      longitude: 77.2167,
    },
    {
      providerId: providers[0].id,
      categoryId: categories['electrical'].id,
      subcategoryId: subcategories['electrical']?.[0]?.id,
      title: 'Complete House Wiring & Rewiring Service',
      description: 'Professional house wiring and rewiring by licensed electricians with 10+ years of experience. We handle new construction wiring, old house rewiring, and electrical system upgrades. All work meets ISI standards and local electrical codes. Includes conduit piping, wire pulling, switch and socket connections, DB box setup, and thorough safety testing.',
      basePrice: 2999,
      priceNegotiable: true,
      serviceDurationMinutes: 240,
      serviceAreaRadiusKm: 20,
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      address: '45, Connaught Place, New Delhi',
      pincode: '110001',
      latitude: 28.6315,
      longitude: 77.2167,
    },

    // Priya Sharma - Mumbai provider (Electrical + AC & HVAC)
    {
      providerId: providers[1].id,
      categoryId: categories['electrical'].id,
      subcategoryId: subcategories['electrical']?.[1]?.id,
      title: 'Light Fixture & Chandelier Installation',
      description: 'Professional installation of all types of light fixtures including chandeliers, pendant lights, recessed lighting, tube lights, LED panels, and decorative fixtures. We handle ceiling mounting, wiring, switch connection, and dimmer setup. Our electricians ensure safe installation with proper load balancing and circuit protection.',
      basePrice: 399,
      priceNegotiable: false,
      serviceDurationMinutes: 60,
      serviceAreaRadiusKm: 20,
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      address: '12, Andheri West, Mumbai',
      pincode: '400051',
      latitude: 19.1197,
      longitude: 72.8464,
    },
    {
      providerId: providers[1].id,
      categoryId: categories['electrical'].id,
      subcategoryId: subcategories['electrical']?.[5]?.id,
      title: 'Smart Home Automation Setup',
      description: 'Transform your home with smart home automation. We install and configure smart switches, smart lights, motion sensors, smart doorbells, voice assistant integration (Alexa/Google Home), and automated curtain controls. Complete setup includes Wi-Fi configuration, app setup, and user training. Make your home future-ready with our expert smart home services.',
      basePrice: 4999,
      priceNegotiable: true,
      serviceDurationMinutes: 180,
      serviceAreaRadiusKm: 20,
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      address: '12, Andheri West, Mumbai',
      pincode: '400051',
      latitude: 19.1197,
      longitude: 72.8464,
    },
    {
      providerId: providers[1].id,
      categoryId: categories['ac-hvac'].id,
      subcategoryId: subcategories['ac-hvac']?.[2]?.id,
      title: 'AC Deep Cleaning & Servicing',
      description: 'Comprehensive AC cleaning and servicing for split and window ACs. Our foam wash deep cleaning removes dust, mold, and bacteria from evaporator and condenser coils, filters, and drain pan. Includes gas level check, thermostat calibration, electrical connection inspection, and performance testing. Improves cooling efficiency and air quality. Recommended every 6 months.',
      basePrice: 599,
      priceNegotiable: false,
      serviceDurationMinutes: 60,
      serviceAreaRadiusKm: 25,
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      address: '12, Andheri West, Mumbai',
      pincode: '400051',
      latitude: 19.1197,
      longitude: 72.8464,
    },

    // Arun Patel - Bengaluru provider (AC & HVAC)
    {
      providerId: providers[2].id,
      categoryId: categories['ac-hvac'].id,
      subcategoryId: subcategories['ac-hvac']?.[0]?.id,
      title: 'Split & Window AC Installation',
      description: 'Professional AC installation by certified technician. For split ACs: includes wall bracket mounting, indoor-outdoor unit connection, copper piping (up to 10 ft), drainage pipe setup, gas charging, electrical connection, and performance testing. For window ACs: includes window frame preparation, unit mounting, sealing, and testing. We install all major brands. 30-day service warranty included.',
      basePrice: 1299,
      priceNegotiable: false,
      serviceDurationMinutes: 120,
      serviceAreaRadiusKm: 20,
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      address: '78, Koramangala, Bengaluru',
      pincode: '560001',
      latitude: 12.9352,
      longitude: 77.6245,
    },
    {
      providerId: providers[2].id,
      categoryId: categories['ac-hvac'].id,
      subcategoryId: subcategories['ac-hvac']?.[9]?.id,
      title: 'AC Gas Refilling & Leak Fixing',
      description: 'Complete AC gas refill service with leak detection and fixing. We use genuine refrigerant gas (R32/R410a/R22 as applicable) and ensure optimal cooling performance. Service includes pressure testing, leak detection using UV dye, leak sealing, vacuum pumping, gas charging to manufacturer specifications, and performance verification. 90-day warranty on gas refill.',
      basePrice: 1899,
      priceNegotiable: true,
      serviceDurationMinutes: 90,
      serviceAreaRadiusKm: 20,
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      address: '78, Koramangala, Bengaluru',
      pincode: '560001',
      latitude: 12.9352,
      longitude: 77.6245,
    },
    {
      providerId: providers[2].id,
      categoryId: categories['ac-hvac'].id,
      subcategoryId: subcategories['ac-hvac']?.[1]?.id,
      title: 'AC Repair & Troubleshooting Service',
      description: 'Expert AC repair service for all types of issues — not cooling, strange noises, water leakage, remote not working, compressor problems, or electrical faults. Our certified technicians diagnose the issue quickly and provide transparent repair estimates. We service all brands including Daikin, Voltas, LG, Samsung, Blue Star, and more. Genuine spare parts used with warranty.',
      basePrice: 399,
      priceNegotiable: true,
      serviceDurationMinutes: 60,
      serviceAreaRadiusKm: 20,
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      address: '78, Koramangala, Bengaluru',
      pincode: '560001',
      latitude: 12.9352,
      longitude: 77.6245,
    },

    // Srinivas Rao - Hyderabad provider (Plumbing + AC & HVAC)
    {
      providerId: providers[3].id,
      categoryId: categories['plumbing'].id,
      subcategoryId: subcategories['plumbing']?.[1]?.id,
      title: 'Drain Cleaning & Unclogging Service',
      description: 'Professional drain cleaning service for kitchen sinks, bathroom drains, floor drains, and main sewer lines. We use high-pressure water jetting, motorized drain snakes, and chemical treatments to clear blockages caused by grease, hair, food waste, and tree roots. Includes camera inspection for persistent blocks. Preventive maintenance tips provided.',
      basePrice: 599,
      priceNegotiable: false,
      serviceDurationMinutes: 60,
      serviceAreaRadiusKm: 15,
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      address: '23, Banjara Hills, Hyderabad',
      pincode: '500001',
      latitude: 17.4156,
      longitude: 78.4489,
    },
    {
      providerId: providers[3].id,
      categoryId: categories['plumbing'].id,
      subcategoryId: subcategories['plumbing']?.[5]?.id,
      title: 'Water Heater/Geyser Repair & Installation',
      description: 'Expert water heater and geyser repair, servicing, and installation. We handle both electric and gas water heaters of all brands and capacities. Services include thermostat replacement, heating element change, valve repair, tank cleaning, anode rod replacement, and new unit installation. Safety checks included with every service. Same-day repair available.',
      basePrice: 449,
      priceNegotiable: true,
      serviceDurationMinutes: 60,
      serviceAreaRadiusKm: 15,
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      address: '23, Banjara Hills, Hyderabad',
      pincode: '500001',
      latitude: 17.4156,
      longitude: 78.4489,
    },
    {
      providerId: providers[3].id,
      categoryId: categories['ac-hvac'].id,
      subcategoryId: subcategories['ac-hvac']?.[6]?.id,
      title: 'HVAC Duct Cleaning & Sanitization',
      description: 'Professional HVAC duct cleaning service for homes and offices. We remove dust, allergens, mold, and contaminants from air ducts using powerful vacuum systems and rotary brushes. Includes vent cover cleaning, filter replacement, and antimicrobial sanitization treatment. Improves indoor air quality and HVAC efficiency. Recommended annually.',
      basePrice: 2499,
      priceNegotiable: true,
      serviceDurationMinutes: 180,
      serviceAreaRadiusKm: 20,
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      address: '23, Banjara Hills, Hyderabad',
      pincode: '500001',
      latitude: 17.4156,
      longitude: 78.4489,
    },

    // Karthik Iyer - Chennai provider (Electrical + Plumbing)
    {
      providerId: providers[4].id,
      categoryId: categories['electrical'].id,
      subcategoryId: subcategories['electrical']?.[4]?.id,
      title: 'Ceiling Fan Installation & Repair',
      description: 'Professional ceiling fan installation, repair, and replacement service. We install all types of fans — regular ceiling fans, decorative fans, hunter fans, and exhaust fans. Service includes ceiling hook mounting, downrod installation, wiring from switch to fan, regulator setup, and blade balancing. Repair service covers motor winding, capacitor replacement, and noise fixing.',
      basePrice: 349,
      priceNegotiable: false,
      serviceDurationMinutes: 45,
      serviceAreaRadiusKm: 15,
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      address: '89, T. Nagar, Chennai',
      pincode: '600001',
      latitude: 13.0418,
      longitude: 80.2341,
    },
    {
      providerId: providers[4].id,
      categoryId: categories['electrical'].id,
      subcategoryId: subcategories['electrical']?.[3]?.id,
      title: 'Circuit Breaker & DB Box Repair',
      description: 'Expert circuit breaker, MCB, and distribution board (DB box) repair and upgrade service. We diagnose tripping breakers, replace faulty MCBs/RCCBs, upgrade DB boxes, add new circuits, and ensure proper load distribution. All work complies with electrical safety standards. Includes thorough wiring inspection and safety audit. Emergency same-day service available.',
      basePrice: 799,
      priceNegotiable: true,
      serviceDurationMinutes: 90,
      serviceAreaRadiusKm: 15,
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      address: '89, T. Nagar, Chennai',
      pincode: '600001',
      latitude: 13.0418,
      longitude: 80.2341,
    },
  ];

  const services: any[] = [];
  for (const sData of serviceData) {
    const service = await db.service.create({
      data: {
        ...sData,
        isActive: true,
        isApproved: true,
        approvalStatus: 'APPROVED',
        approvedBy: admin.id,
        approvedAt: new Date('2025-01-20'),
        averageRating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
        totalBookings: Math.floor(Math.random() * 50),
        totalReviews: Math.floor(Math.random() * 20),
      },
    });
    services.push(service);
  }

  // ========================================
  // SERVICE AVAILABILITY SLOTS
  // ========================================
  console.log('📅 Creating service availability slots...');
  for (const service of services) {
    // Monday to Saturday (1-6), available 9 AM to 7 PM; Saturday 9 AM to 3 PM
    const availabilities = [
      { dayOfWeek: 1, startTime: '09:00', endTime: '19:00' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '19:00' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '19:00' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '19:00' },
      { dayOfWeek: 5, startTime: '09:00', endTime: '19:00' },
      { dayOfWeek: 6, startTime: '09:00', endTime: '15:00' },
    ];
    for (const avail of availabilities) {
      await db.serviceAvailability.create({
        data: {
          serviceId: service.id,
          ...avail,
          isAvailable: true,
          maxBookingsPerSlot: 2,
        },
      });
    }
  }

  // ========================================
  // 8. SAMPLE BOOKINGS
  // ========================================
  console.log('📝 Creating sample bookings...');
  const bookings: any[] = [];

  const bookingDataList = [
    { clientId: clients[0].id, providerId: providers[0].id, serviceId: services[0].id, scheduledDate: '2025-07-10', scheduledTime: '10:00', serviceAddress: '23, Banjara Hills, Hyderabad', basePrice: 499, finalPrice: 499, status: 'COMPLETED', paymentStatus: 'PAID', completedAt: new Date('2025-07-10T11:30:00') },
    { clientId: clients[1].id, providerId: providers[1].id, serviceId: services[3].id, scheduledDate: '2025-07-12', scheduledTime: '09:00', serviceAddress: '56, GK-II, New Delhi', basePrice: 399, finalPrice: 399, status: 'COMPLETED', paymentStatus: 'PAID', completedAt: new Date('2025-07-12T10:30:00') },
    { clientId: clients[3].id, providerId: providers[2].id, serviceId: services[6].id, scheduledDate: '2025-07-15', scheduledTime: '11:00', serviceAddress: '34, Whitefield, Bengaluru', basePrice: 1299, finalPrice: 1299, status: 'COMPLETED', paymentStatus: 'PAID', completedAt: new Date('2025-07-15T13:00:00') },
    { clientId: clients[0].id, providerId: providers[3].id, serviceId: services[9].id, scheduledDate: '2025-07-18', scheduledTime: '14:00', serviceAddress: '23, Banjara Hills, Hyderabad', basePrice: 599, finalPrice: 599, status: 'COMPLETED', paymentStatus: 'PAID', completedAt: new Date('2025-07-18T15:00:00') },
    { clientId: clients[5].id, providerId: providers[4].id, serviceId: services[12].id, scheduledDate: '2025-07-20', scheduledTime: '10:00', serviceAddress: '12, Madhapur, Hyderabad', basePrice: 349, finalPrice: 349, status: 'COMPLETED', paymentStatus: 'PAID', completedAt: new Date('2025-07-20T11:00:00') },
    { clientId: clients[7].id, providerId: providers[0].id, serviceId: services[1].id, scheduledDate: '2025-07-25', scheduledTime: '10:00', serviceAddress: '78, Saket, New Delhi', basePrice: 699, finalPrice: 699, status: 'COMPLETED', paymentStatus: 'PAID', completedAt: new Date('2025-07-25T12:00:00') },
    { clientId: clients[3].id, providerId: providers[2].id, serviceId: services[7].id, scheduledDate: '2025-08-01', scheduledTime: '15:00', serviceAddress: '34, Whitefield, Bengaluru', basePrice: 1899, finalPrice: 1899, status: 'COMPLETED', paymentStatus: 'PAID', completedAt: new Date('2025-08-01T16:30:00') },
    { clientId: clients[1].id, providerId: providers[1].id, serviceId: services[5].id, scheduledDate: '2025-08-05', scheduledTime: '09:00', serviceAddress: '56, GK-II, New Delhi', basePrice: 599, finalPrice: 599, status: 'COMPLETED', paymentStatus: 'PAID', completedAt: new Date('2025-08-05T10:30:00') },
    { clientId: clients[0].id, providerId: providers[2].id, serviceId: services[8].id, scheduledDate: '2025-08-10', scheduledTime: '11:00', serviceAddress: '23, Banjara Hills, Hyderabad', basePrice: 399, finalPrice: 399, status: 'PENDING', paymentStatus: 'PENDING' },
    { clientId: clients[3].id, providerId: providers[3].id, serviceId: services[10].id, scheduledDate: '2025-08-12', scheduledTime: '14:00', serviceAddress: '34, Whitefield, Bengaluru', basePrice: 449, finalPrice: 449, status: 'ACCEPTED', paymentStatus: 'PAID' },
    { clientId: clients[7].id, providerId: providers[0].id, serviceId: services[2].id, scheduledDate: '2025-08-15', scheduledTime: '08:00', serviceAddress: '78, Saket, New Delhi', basePrice: 2999, negotiatedPrice: 2799, finalPrice: 2799, status: 'IN_PROGRESS', paymentStatus: 'PAID' },
    { clientId: clients[4].id, providerId: providers[1].id, serviceId: services[4].id, scheduledDate: '2025-07-22', scheduledTime: '09:00', serviceAddress: '67, Malviya Nagar, Mumbai', basePrice: 4999, finalPrice: 4999, status: 'CANCELLED', paymentStatus: 'REFUNDED', cancellationReason: 'Schedule conflict - provider unavailable', cancelledBy: providers[1].id, cancelledAt: new Date('2025-07-21T18:00:00') },
  ];

  let bookingCounter = 1000;
  for (const bData of bookingDataList) {
    bookingCounter++;
    const bookingNumber = `BYS-${bookingCounter}-${Date.now().toString(36).toUpperCase()}`;
    const booking = await db.booking.create({
      data: {
        ...bData,
        bookingNumber,
        platformFee: Math.round(bData.finalPrice * 0.05),
        providerEarnings: bData.status === 'COMPLETED' ? Math.round(bData.finalPrice * 0.95) : null,
        specialInstructions: bData.status === 'PENDING' ? 'Please call before arriving' : null,
      },
    });
    bookings.push(booking);
  }

  // ========================================
  // PAYMENTS for bookings
  // ========================================
  console.log('💳 Creating payment records...');
  for (const booking of bookings) {
    if (booking.paymentStatus === 'PAID' || booking.paymentStatus === 'REFUNDED') {
      await db.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.finalPrice,
          currency: 'INR',
          paymentMethod: ['UPI', 'CARD', 'NET_BANKING', 'WALLET'][Math.floor(Math.random() * 4)],
          gateway: 'RAZORPAY',
          gatewayOrderId: `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          gatewayPaymentId: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          status: booking.paymentStatus === 'REFUNDED' ? 'REFUNDED' : 'SUCCESS',
          refundAmount: booking.paymentStatus === 'REFUNDED' ? booking.finalPrice : null,
          refundReason: booking.paymentStatus === 'REFUNDED' ? booking.cancellationReason : null,
          refundedAt: booking.paymentStatus === 'REFUNDED' ? booking.cancelledAt : null,
        },
      });
    } else if (booking.paymentStatus === 'PENDING' && booking.status === 'ACCEPTED') {
      await db.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.finalPrice,
          currency: 'INR',
          paymentMethod: 'UPI',
          gateway: 'RAZORPAY',
          gatewayOrderId: `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          status: 'SUCCESS',
        },
      });
    }
  }

  // ========================================
  // 9. SAMPLE REVIEWS
  // ========================================
  console.log('⭐ Creating sample reviews...');
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  const reviewData = [
    { rating: 5, comment: 'Excellent work! The plumber was very professional and fixed the leak in no time. Highly recommended for any plumbing issue.' },
    { rating: 4, comment: 'Good light fixture installation. The electrician was punctual and neat with the wiring. Minor delay in arrival but quality work.' },
    { rating: 5, comment: 'Perfect AC installation! Very neat work with proper copper piping and drainage. The technician was knowledgeable and friendly.' },
    { rating: 4, comment: 'Great drain cleaning service. The blockage was completely cleared. Would recommend for plumbing needs.' },
    { rating: 5, comment: 'Fan installation was done perfectly. Clean wiring and the fan runs smoothly without any wobble. Very satisfied!' },
    { rating: 4, comment: 'Toilet installation was done properly. Professional approach and clean work area. Good service overall.' },
    { rating: 5, comment: 'AC gas refill service was excellent. Cooling improved dramatically. The technician explained the issue clearly before starting work.' },
    { rating: 4, comment: 'AC servicing was thorough. The foam wash really made a difference in cooling efficiency. Will book again for regular servicing.' },
  ];

  for (let i = 0; i < Math.min(completedBookings.length, reviewData.length); i++) {
    const booking = completedBookings[i];
    const review = reviewData[i];
    await db.review.create({
      data: {
        bookingId: booking.id,
        reviewerId: booking.clientId,
        reviewedId: booking.providerId,
        serviceId: booking.serviceId,
        rating: review.rating,
        comment: review.comment,
        isVerified: true,
      },
    });
  }

  // ========================================
  // 10. FAQs (updated for 3 categories only)
  // ========================================
  console.log('❓ Creating FAQs...');
  const faqData = [
    // General
    { category: 'General', question: 'What is BookYourService?', answer: 'BookYourService is India\'s trusted online marketplace connecting homeowners with verified service providers for Plumbing, Electrical, and AC & HVAC services. We ensure quality, reliability, and transparent pricing for every booking.', displayOrder: 1 },
    { category: 'General', question: 'Which cities does BookYourService operate in?', answer: 'We currently operate in major Indian cities including Delhi, Mumbai, Bengaluru, Hyderabad, and Chennai, with plans to expand rapidly. Enter your pincode on the homepage to check availability in your area.', displayOrder: 2 },
    { category: 'General', question: 'How do I book a service?', answer: 'Simply browse our three categories — Plumbing, Electrical, or AC & HVAC — select your desired sub-service, choose a provider, pick a date and time, and confirm your booking. You can also call our helpline for assistance.', displayOrder: 3 },
    { category: 'General', question: 'Are the service providers verified?', answer: 'Yes, all service providers on BookYourService undergo a rigorous KYC verification process including identity verification (Aadhaar/PAN/Passport), address verification, skill assessment, and background checks before being listed on our platform.', displayOrder: 4 },
    { category: 'General', question: 'What services are available on BookYourService?', answer: 'We offer three main categories of home services: Plumbing (leak repair, drain cleaning, pipe installation, faucet repair, toilet installation, water heater repair, sewage cleaning, shower/tub repair, gas line servicing, pump repair), Electrical (wiring repairs, light fixture installation, socket repairs, circuit breaker fixing, ceiling fan installation, smart home setup, generator maintenance, switchboard upgrades, panel repair, appliance grounding), and AC & HVAC (AC installation, AC repair, AC cleaning/servicing, heating unit repairs, thermostat setup, central air maintenance, duct cleaning, furnace repair, ventilator services, gas refilling).', displayOrder: 5 },
    // Booking
    { category: 'Booking', question: 'Can I reschedule my booking?', answer: 'Yes, you can reschedule your booking up to 4 hours before the scheduled time at no extra charge. Go to My Bookings, select the booking, and click Reschedule. Subject to provider availability.', displayOrder: 6 },
    { category: 'Booking', question: 'What happens if the provider doesn\'t show up?', answer: 'If a provider fails to arrive within 30 minutes of the scheduled time without prior notice, you can raise a no-show complaint. We\'ll arrange an alternative provider or provide a full refund along with a 10% credit as compensation.', displayOrder: 7 },
    { category: 'Booking', question: 'Can I book services for someone else?', answer: 'Yes, during booking you can specify a different service address and contact person. The booking confirmation will be sent to your registered number/email while the service details go to the service address contact.', displayOrder: 8 },
    { category: 'Booking', question: 'Is there a minimum booking amount?', answer: 'There is no minimum booking amount. However, each service has a base price which is the minimum charge for that service. The final price may vary based on the scope of work and negotiation.', displayOrder: 9 },
    { category: 'Booking', question: 'How far in advance can I book a service?', answer: 'You can book services up to 30 days in advance. For same-day bookings, we recommend booking at least 2 hours before the desired time slot to ensure provider availability.', displayOrder: 10 },
    // Payment
    { category: 'Payment', question: 'What payment methods are accepted?', answer: 'Currently, payments are settled directly between the client and the provider via cash or direct bank transfer. Our online payment system (UPI, Cards, Net Banking) will be activated soon for a more seamless experience.', displayOrder: 11 },
    { category: 'Payment', question: 'How does the platform fee work?', answer: 'BookYourService charges a small platform fee on each booking. This fee is separate from the service price and supports platform maintenance, provider verification, and customer support. The platform fee is displayed transparently during checkout.', displayOrder: 12 },
    { category: 'Payment', question: 'Can I negotiate the service price?', answer: 'Yes, for services marked as "Price Negotiable," you can propose a different price through our negotiation feature. The provider can accept, reject, or counter-offer. Both parties must agree before the booking is confirmed.', displayOrder: 13 },
    { category: 'Payment', question: 'Do I need to pay extra charges or taxes?', answer: 'The service price is agreed upon between you and the provider. A nominal platform fee is charged separately and displayed during checkout. GST, if applicable, is included in the service price.', displayOrder: 14 },
    // Provider
    { category: 'Provider', question: 'How can I become a service provider on BookYourService?', answer: 'Register as a provider, complete KYC verification (Aadhaar/PAN/Passport + selfie), and get your profile approved. Once verified, you can list your services under Plumbing, Electrical, or AC & HVAC categories, set pricing, and start receiving bookings. The approval process typically takes 24-48 hours.', displayOrder: 15 },
    { category: 'Provider', question: 'What commission does BookYourService charge providers?', answer: 'We charge a competitive commission of 15-20% depending on the service category and your subscription plan. Premium plan providers enjoy lower commission rates and priority listing in their category.', displayOrder: 16 },
    { category: 'Provider', question: 'How do I receive my earnings?', answer: 'Currently, payments are collected directly by providers from clients (cash/direct transfer). Once our online payment system is activated, provider earnings will be transferred to your registered bank account within 3-5 business days after deducting the platform commission.', displayOrder: 17 },
    { category: 'Provider', question: 'Can I set my own prices for services?', answer: 'Yes, you have full control over your service pricing. You can also mark prices as negotiable to allow clients to propose different rates. We recommend competitive pricing based on your experience and market rates in your city.', displayOrder: 18 },
    // Cancellation
    { category: 'Cancellation', question: 'What is the cancellation policy?', answer: 'Cancellations made 24+ hours before the scheduled time are fully refundable. Cancellations within 4-24 hours incur a 10% fee. Cancellations within 4 hours or no-shows incur a 25% fee. Refunds are processed within 5-7 business days once online payments are active.', displayOrder: 19 },
    { category: 'Cancellation', question: 'How do I cancel a booking?', answer: 'Go to My Bookings, select the booking you wish to cancel, and click Cancel Booking. You\'ll need to provide a cancellation reason. The refund (if applicable) will be initiated immediately to your original payment method once online payments are active.', displayOrder: 20 },
    { category: 'Cancellation', question: 'Can a provider cancel my booking?', answer: 'Providers can cancel only in genuine emergencies. Frequent cancellations affect their rating and may lead to account suspension. If your booking is cancelled by the provider, we\'ll offer an alternative provider or a full refund with a 10% credit bonus.', displayOrder: 21 },
  ];

  for (const faq of faqData) {
    await db.faq.create({ data: faq });
  }

  // ========================================
  // 11. LEGAL PAGES (Comprehensive)
  // ========================================
  console.log('📜 Creating legal pages...');

  // Terms & Conditions
  await db.legalPage.create({
    data: {
      pageType: 'TERMS',
      title: 'Terms of Service',
      version: '2.0',
      effectiveDate: '2025-03-05',
      content: `TERMS OF SERVICE FOR BOOKYOURSERVICE

Last Updated: March 5, 2025

IMPORTANT NOTICE: PLEASE READ THESE TERMS OF SERVICE CAREFULLY BEFORE USING THE BOOKYOURSERVICE PLATFORM. BY ACCESSING OR USING THE PLATFORM, YOU AGREE TO BE BOUND BY THESE TERMS. IF YOU DO NOT AGREE WITH ANY PART OF THESE TERMS, YOU MUST NOT USE OUR SERVICES.

1. ACCEPTANCE OF TERMS
1.1 By accessing, browsing, registering on, or using the BookYourService platform (including the website at bookyourservice.co.in and the mobile application), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service ("Terms"), our Privacy Policy, and all applicable laws and regulations.
1.2 If you are using the Platform on behalf of a business or entity, you represent and warrant that you have the authority to bind that entity to these Terms.
1.3 BookYourService reserves the right to update, modify, or replace any part of these Terms at its sole discretion. It is your responsibility to check these Terms periodically for changes. Your continued use of the Platform following the posting of any changes constitutes acceptance of those changes.
1.4 These Terms constitute a legally binding agreement between you and BookYourService Technologies Pvt. Ltd. ("Company," "we," "us," or "our"), a company incorporated under the laws of India.

2. DEFINITIONS
2.1 "Platform" refers to the BookYourService website, mobile application, and all associated services operated by BookYourService Technologies Pvt. Ltd.
2.2 "Service Provider" or "Provider" refers to independent third-party individuals or businesses registered on the Platform to offer plumbing, electrical, and/or AC & HVAC services.
2.3 "Client" or "Customer" refers to users who book or attempt to book services through the Platform.
2.4 "Services" refers to the home services listed on the Platform, specifically plumbing, electrical, and AC & HVAC related services.
2.5 "Booking" refers to a scheduled appointment for a Service between a Client and a Provider facilitated through the Platform.
2.6 "Platform Fee" refers to the fee charged by the Company for the use of the Platform's intermediary services.
2.7 "Content" refers to text, images, reviews, ratings, and other materials posted on the Platform.

3. NATURE OF THE PLATFORM — INTERMEDIARY STATUS
3.1 CRITICAL ACKNOWLEDGMENT: BookYourService is an INTERMEDIARY and ONLINE MARKETPLACE ONLY. The Company DOES NOT directly provide any plumbing, electrical, or AC & HVAC services. All services listed on the Platform are provided by independent third-party Service Providers who are not employees, agents, or representatives of the Company.
3.2 The Platform merely facilitates the connection between Clients and Service Providers. The Company acts as a facilitator and does not endorse, guarantee, or warrant the quality, safety, legality, or suitability of any services provided by any Service Provider.
3.3 The Company is NOT a party to any service agreement between a Client and a Service Provider. Any contract for services is solely between the Client and the Service Provider.
3.4 The Company does not supervise, direct, or control the work of Service Providers. Service Providers are solely responsible for the manner, method, and quality of their work.
3.5 The Company does not guarantee the accuracy of Provider profiles, qualifications, or reviews displayed on the Platform. All such information is provided by the Providers themselves and has not been independently verified beyond basic KYC checks.
3.6 By using the Platform, you expressly acknowledge and agree that the Company shall not be held responsible or liable for any acts, omissions, defaults, or misconduct of any Service Provider or Client.

4. USER REGISTRATION AND ACCOUNTS
4.1 Users must provide accurate, current, and complete information during registration and must keep such information updated at all times.
4.2 Users must be at least 18 years of age to create an account and use the Platform.
4.3 Each user may maintain only one account at a time. Creating multiple accounts is prohibited and may result in suspension.
4.4 Users are solely responsible for maintaining the confidentiality of their account credentials (email, password, OTP) and for all activities that occur under their account.
4.5 Users must notify the Company immediately of any unauthorized use of their account or any other breach of security.
4.6 The Company shall not be liable for any loss or damage arising from a user's failure to comply with this Section 4.
4.7 The Company reserves the right to suspend, terminate, or restrict any account that violates these Terms, engages in fraudulent activity, or is deemed harmful to other users or the Platform.

5. SERVICE BOOKING AND DELIVERY
5.1 Clients can browse, select, and book services through the Platform from the available categories: Plumbing, Electrical, and AC & HVAC.
5.2 All bookings are subject to provider availability and confirmation. A booking request does not guarantee service delivery.
5.3 Service prices displayed on the Platform are indicative and based on information provided by the Service Provider. The actual price may vary depending on the scope of work, materials required, and any negotiation between the Client and Provider.
5.4 Booking confirmation constitutes a service agreement between the Client and the Provider. The Company is NOT a party to this agreement.
5.5 The Company does not guarantee the timely delivery, quality, or outcome of any service. Any guarantee or warranty for services is solely the responsibility of the Service Provider.
5.6 Clients acknowledge that home services involve inherent risks including but not limited to property damage, water damage, electrical hazards, and refrigerant exposure. Clients engage services at their own risk.
5.7 The Company recommends that Clients verify the identity of the Service Provider upon arrival and ensure that safety precautions are followed during service delivery.

6. PAYMENT TERMS
6.1 CURRENT PAYMENT MODEL: At present, the Company's online payment system is under development and has not yet been activated. Accordingly, all payments for services are settled DIRECTLY between the Client and the Service Provider through cash, bank transfer, UPI, or any other mutually agreed payment method.
6.2 The Company DOES NOT collect, process, hold, or handle any service payments at this time. The Company is NOT responsible for any payment disputes, defaults, or issues between Clients and Providers.
6.3 Clients and Providers are solely responsible for agreeing upon and completing payment transactions. The Company recommends obtaining a receipt or confirmation for all payments.
6.4 ONLINE PAYMENT SYSTEM (FUTURE): The Company intends to introduce an online payment system in the near future. Once activated, the following terms will apply:
   (a) Payments will be processed through secure third-party payment gateways (such as Razorpay) that are PCI DSS Level 1 certified.
   (b) The Company may hold payments in escrow until service completion to protect both parties.
   (c) Provider earnings will be disbursed after deducting the applicable platform commission.
   (d) All online payment transactions will be subject to the payment gateway's terms and conditions.
6.5 PLATFORM FEE: The Company charges a Platform Fee for providing the intermediary service of connecting Clients with Providers. The Platform Fee is separate from the service price and is displayed transparently during the booking process. The Platform Fee structure is as follows:
   (a) A percentage-based commission (currently 5-10%) is charged on each completed booking.
   (b) For the current direct payment model, the Platform Fee is collected from the Provider's earnings on a periodic basis.
   (c) Once the online payment system is activated, the Platform Fee will be automatically deducted before Provider disbursement.
6.6 All prices are listed in Indian Rupees (INR). Applicable taxes (including GST) are included in the displayed prices unless otherwise stated.
6.7 The Company reserves the right to modify the Platform Fee structure at any time with prior notice to users.

7. CANCELLATION AND REFUND
7.1 Cancellation by Client:
   (a) Full refund (no cancellation fee): Cancellations made 24 or more hours before the scheduled service time.
   (b) Partial refund (90% of service price): Cancellations made 4-24 hours before the scheduled service time.
   (c) Partial refund (75% of service price): Cancellations made within 4 hours of the scheduled service time.
   (d) No refund: No-show by the Client without prior cancellation.
7.2 Cancellation by Provider:
   (a) Providers may cancel bookings only in genuine emergencies or unavoidable circumstances.
   (b) Frequent cancellations by a Provider will negatively impact their rating and may result in account suspension or termination.
   (c) If a Provider cancels a booking, the Company will attempt to arrange an alternative Provider or facilitate a full refund to the Client.
7.3 REFUND PROCESSING:
   (a) For the current direct payment model, refunds are the responsibility of the Service Provider. The Company will facilitate the refund process but cannot guarantee refund timelines or outcomes.
   (b) Once the online payment system is activated, refunds will be processed to the original payment method within 5-7 business days.
   (c) Refund processing times may vary by payment method: UPI (3-5 business days), Credit/Debit Card (5-7 business days), Net Banking (5-7 business days), Wallet (24-48 hours).
7.4 The Company reserves the right to modify the cancellation policy with reasonable prior notice.

8. SERVICE QUALITY AND DISPUTES
8.1 The Company provides a dispute resolution mechanism to facilitate communication between Clients and Providers regarding service quality issues.
8.2 Clients can raise a quality dispute within 7 days of service completion through the Platform.
8.3 The Company will act as a mediator and attempt to facilitate a fair resolution. However, the Company is NOT bound to enforce any particular outcome.
8.4 THE COMPANY MAKES NO WARRANTIES OR GUARANTEES REGARDING THE QUALITY, SAFETY, TIMELINESS, OR COMPLETENESS OF ANY SERVICE PROVIDED THROUGH THE PLATFORM.
8.5 Any re-service or refund arising from a quality dispute is solely at the discretion of the Service Provider, subject to the Company's mediation efforts.

9. LIABILITY LIMITATIONS AND DISCLAIMERS
9.1 NO WARRANTY: ALL SERVICES PROVIDED THROUGH THE PLATFORM ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE. THE COMPANY SPECIFICALLY DISCLAIMS ALL IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
9.2 NOT RESPONSIBLE FOR SERVICE QUALITY: The Company is NOT responsible or liable for the quality, safety, legality, or appropriateness of any service provided by a Service Provider. The Company does not guarantee that any service will meet a Client's expectations or requirements.
9.3 NO LIABILITY FOR DAMAGES: UNDER NO CIRCUMSTANCES SHALL THE COMPANY, ITS DIRECTORS, OFFICERS, EMPLOYEES, AGENTS, OR AFFILIATES BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
   (a) Personal injury, bodily harm, or death resulting from services;
   (b) Property damage, water damage, fire damage, or electrical damage;
   (c) Loss of use, loss of data, loss of profits, loss of business, or loss of goodwill;
   (d) Emotional distress, mental anguish, or reputational harm;
   (e) Any damages arising from the negligence, recklessness, or intentional misconduct of a Service Provider or Client;
   (f) Any damages arising from delays, failures, errors, or interruptions in the Platform's operation;
   (g) Any damages arising from unauthorized access to or use of our servers or any personal information stored therein;
   (h) Any damages arising from any content, goods, or services obtained through the Platform.
9.4 LIMITATION OF LIABILITY: THE COMPANY'S TOTAL AGGREGATE LIABILITY FOR ANY AND ALL CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR THE USE OF THE PLATFORM SHALL NOT EXCEED THE AMOUNT OF THE PLATFORM FEE PAID BY YOU TO THE COMPANY IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE LIABILITY, OR INR 1,000 (INDIAN RUPEES ONE THOUSAND), WHICHEVER IS LESS.
9.5 INDEMNIFICATION: You agree to indemnify, defend, and hold harmless the Company, its directors, officers, employees, agents, and affiliates from and against any and all claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or related to:
   (a) Your use of or inability to use the Platform;
   (b) Your violation of these Terms;
   (c) Your violation of any applicable law, regulation, or third-party right;
   (d) Any service you provide or receive through the Platform;
   (e) Any dispute between you and another user of the Platform;
   (f) Any content you submit, post, or transmit through the Platform;
   (g) Any negligent or wrongful act or omission on your part;
   (h) Any breach of any representation, warranty, or obligation under these Terms.
9.6 The Company shall not be liable for any failure or delay in performing its obligations under these Terms where such failure or delay results from circumstances beyond its reasonable control.
9.7 You acknowledge that the Company has relied on the limitations and exclusions of liability set forth herein in providing the Platform at its current pricing and that these limitations and exclusions form an essential basis of the bargain between the parties.

10. FORCE MAJEURE
10.1 The Company shall not be liable for any failure or delay in the performance of its obligations under these Terms if such failure or delay is caused by events beyond the Company's reasonable control, including but not limited to:
   (a) Acts of God, natural disasters, earthquakes, floods, storms, or fires;
   (b) War, terrorism, civil unrest, riots, or insurrections;
   (c) Epidemics, pandemics, or public health emergencies;
   (d) Government actions, orders, regulations, or restrictions;
   (e) Strikes, labor disputes, or industrial action;
   (f) Internet service provider failures, power outages, or telecommunication failures;
   (g) Cyber attacks, hacking, or security breaches;
   (h) Shortages of materials, labor, or supplies;
   (i) Transportation disruptions or failures;
   (j) Any other event that could not have been reasonably foreseen or prevented.
10.2 In the event of a force majeure, the Company will use reasonable efforts to mitigate the impact and resume performance as soon as practicable.
10.3 If a force majeure event continues for more than 90 days, either party may terminate these Terms upon written notice.

11. INTELLECTUAL PROPERTY
11.1 All content, features, and functionality of the Platform, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, and software, are the exclusive property of BookYourService Technologies Pvt. Ltd. or its licensors and are protected by Indian and international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
11.2 Users may not copy, reproduce, distribute, publish, display, modify, create derivative works from, or commercially exploit any content from the Platform without the express written consent of the Company.
11.3 Provider listings, reviews, ratings, and other user-generated content submitted to the Platform are licensed to the Company on a non-exclusive, worldwide, royalty-free basis for use in connection with the Platform's operation and marketing.
11.4 The "BookYourService" name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of the Company. You may not use such marks without the Company's prior written permission.

12. PRIVACY AND DATA PROTECTION
12.1 User data is collected, processed, and stored in accordance with our Privacy Policy, which is incorporated herein by reference.
12.2 We comply with the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and all applicable data protection laws of India.
12.3 By using the Platform, you consent to the collection, use, and disclosure of your personal information as described in our Privacy Policy.
12.4 Users consent to receiving transactional and service-related communications. Marketing communications are subject to user opt-in consent and can be opted out at any time.

13. DISPUTE RESOLUTION AND ARBITRATION
13.1 INFORMAL RESOLUTION: Before initiating any formal proceedings, the parties agree to first attempt to resolve any dispute through the Platform's dispute resolution mechanism or through good-faith negotiation.
13.2 ARBITRATION: Any dispute, controversy, or claim arising out of or relating to these Terms, or the breach, termination, or invalidity thereof, shall be settled by binding arbitration in accordance with the Arbitration and Conciliation Act, 1996 (as amended).
13.3 The arbitration shall be conducted by a sole arbitrator appointed mutually by the parties. If the parties cannot agree on an arbitrator within 30 days, the arbitrator shall be appointed by the Bombay High Court.
13.4 The seat and venue of arbitration shall be Mumbai, Maharashtra, India.
13.5 The language of the arbitration proceedings shall be English.
13.6 The arbitration proceedings shall be confidential, and neither party may disclose any information regarding the arbitration without the other party's prior written consent.
13.7 The arbitrator's decision shall be final and binding on both parties, and judgment upon the award may be entered in any court of competent jurisdiction.
13.8 Each party shall bear its own costs and expenses of arbitration, unless the arbitrator determines otherwise.
13.9 NOTWITHSTANDING THE FOREGOING, THE COMPANY MAY SEEK INJUNCTIVE OR EQUITABLE RELIEF IN ANY COURT OF COMPETENT JURISDICTION TO PROTECT ITS INTELLECTUAL PROPERTY RIGHTS OR PREVENT IRREPARABLE HARM.

14. GOVERNING LAW AND JURISDICTION
14.1 These Terms of Service shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.
14.2 Subject to the arbitration provisions in Section 13, the courts of Mumbai, Maharashtra, India shall have exclusive jurisdiction over any disputes arising from or related to these Terms.
14.3 Any legal action or proceeding not subject to arbitration shall be brought exclusively in the courts located in Mumbai, Maharashtra, India.
14.4 You hereby irrevocably consent to the personal jurisdiction and venue of such courts and waive any objection based on inconvenient forum.

15. PROVIDER OBLIGATIONS
15.1 Providers must complete KYC verification before listing services on the Platform.
15.2 Providers must maintain professional conduct, appropriate skill levels, and service quality standards at all times.
15.3 Providers must arrive on time and complete services as described in their listings.
15.4 Providers must NOT solicit direct business or attempt to bypass the Platform for future bookings with Clients met through the Platform.
15.5 Providers are solely responsible for their own tools, equipment, transportation, insurance, and statutory compliance.
15.6 Providers must comply with all applicable laws, regulations, and licensing requirements for their trade (plumbing, electrical, HVAC).
15.7 Providers must maintain valid insurance coverage appropriate for their services.
15.8 Providers are responsible for obtaining all necessary permits and approvals required for service delivery.

16. CLIENT OBLIGATIONS
16.1 Clients must provide accurate service address and contact information.
16.2 Clients must provide safe and reasonable access to the service location.
16.3 Clients must not engage in any form of harassment, abuse, or discrimination against Service Providers.
16.4 Clients must settle payment as agreed with the Service Provider.
16.5 Clients must not request services that are illegal, dangerous, or beyond the scope of the Provider's listing.

17. PROHIBITED ACTIVITIES
17.1 Using the Platform for any unlawful purpose or in violation of any applicable law.
17.2 Submitting false, misleading, or fraudulent information.
17.3 Impersonating any person or entity or misrepresenting your affiliation.
17.4 Interfering with or disrupting the Platform's operation or servers.
17.5 Attempting to gain unauthorized access to any part of the Platform.
17.6 Using automated tools (bots, scrapers) to access or collect data from the Platform.
17.7 Engaging in any form of price manipulation or market distortion.
17.8 Circumventing or attempting to circumvent the Platform's payment system.
17.9 Soliciting Platform users for services outside the Platform.

18. TERMINATION
18.1 The Company may terminate or suspend your account and access to the Platform at its sole discretion, without notice, for conduct that the Company determines violates these Terms, is harmful to other users, or is otherwise objectionable.
18.2 Users may terminate their account at any time by contacting customer support or through their account settings.
18.3 Upon termination, the provisions of these Terms that by their nature should survive shall remain in effect, including but not limited to Sections 3, 9, 10, 11, 13, and 14.
18.4 The Company shall not be liable for any damages resulting from the termination or suspension of your account.

19. SEVERABILITY
19.1 If any provision of these Terms is held to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect.
19.2 The invalid or unenforceable provision shall be modified to the minimum extent necessary to make it valid and enforceable while preserving the intent of the original provision.

20. ENTIRE AGREEMENT
20.1 These Terms, together with the Privacy Policy and any other agreements incorporated by reference, constitute the entire agreement between you and the Company regarding the use of the Platform.
20.2 These Terms supersede any prior agreements, understandings, or representations regarding the Platform.

21. CONTACT INFORMATION
For questions or concerns regarding these Terms of Service:
Company: BookYourService Technologies Pvt. Ltd.
Email: legal@bookyourservice.co.in
Address: Fort, Mumbai 400001, Maharashtra, India
Grievance Officer: grievance@bookyourservice.co.in`,
    },
  });

  // Privacy Policy
  await db.legalPage.create({
    data: {
      pageType: 'PRIVACY',
      title: 'Privacy Policy',
      version: '2.0',
      effectiveDate: '2025-03-05',
      content: `PRIVACY POLICY FOR BOOKYOURSERVICE

Last Updated: March 5, 2025

BookYourService Technologies Pvt. Ltd. ("we," "our," "us") is committed to protecting the privacy and personal data of our users. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform for Plumbing, Electrical, and AC & HVAC services.

1. INTRODUCTION
1.1 This Privacy Policy applies to all users (Clients, Service Providers, and Administrators) of the BookYourService platform, including our website (bookyourservice.co.in) and mobile application.
1.2 By using the Platform, you consent to the data practices described in this Privacy Policy.
1.3 We comply with the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and all applicable data protection laws of India.

2. INFORMATION WE COLLECT
2.1 Personal Information: Name, email address, phone number, profile photo, residential address, and date of birth.
2.2 Identity Verification: Aadhaar number, PAN number, driving license number, passport number (for Service Providers undergoing KYC verification).
2.3 Location Data: GPS coordinates for service delivery matching, provider proximity calculation, and service area determination.
2.4 Payment Information: Currently, we do not collect or process payment information as all payments are settled directly between Clients and Providers. When our online payment system is activated, payment data will be processed securely by PCI DSS Level 1 certified third-party payment gateways. We will NOT store card numbers, CVVs, or bank account details on our servers.
2.5 Device Information: IP address, browser type and version, device type and model, operating system, unique device identifiers, and mobile network information.
2.6 Usage Data: Pages visited, features used, search queries, booking history, time spent on pages, click patterns, and navigation paths.
2.7 Communications: Chat messages between Clients and Providers through the Platform, customer support tickets, and feedback submissions.
2.8 Service Data: Service categories browsed (Plumbing, Electrical, AC & HVAC), subcategories selected, booking details, service addresses, and special instructions.

3. HOW WE USE YOUR INFORMATION
3.1 To provide, operate, and maintain the Platform, including matching Clients with appropriate Service Providers.
3.2 To process bookings, facilitate communication between Clients and Providers, and manage service delivery.
3.3 To verify user identity, prevent fraud, and maintain platform security.
3.4 To send booking confirmations, reminders, service updates, and transactional notifications.
3.5 To provide customer support, resolve disputes, and handle complaints.
3.6 To send promotional offers, newsletters, and platform updates (with opt-out option for marketing communications).
3.7 To comply with legal obligations, regulatory requirements, and law enforcement requests.
3.8 To analyze usage patterns, improve platform performance, and develop new features.
3.9 To enforce our Terms of Service and protect the rights, property, or safety of BookYourService, our users, or the public.

4. DATA SHARING AND DISCLOSURE
4.1 Service Providers: When you book a service, your name, service address, and phone number are shared with the assigned Service Provider to facilitate service delivery.
4.2 Clients: Service Provider's name, profile photo, rating, and approximate location (city-level) are visible to Clients browsing services.
4.3 Payment Processors: When the online payment system is activated, payment data will be shared with authorized payment gateways for transaction processing.
4.4 Analytics Partners: Anonymized and aggregated usage data may be shared with analytics services to improve our Platform.
4.5 Legal Requirements: We may disclose personal data when required by law, regulation, legal process, or governmental request, or when we believe in good faith that disclosure is necessary to protect our rights, your safety or the safety of others, investigate fraud, or respond to a government request.
4.6 Business Transfers: In the event of a merger, acquisition, reorganization, bankruptcy, or sale of all or a portion of our assets, user data may be transferred to the acquiring entity.
4.7 We do NOT sell, rent, or trade your personal data to third parties for their marketing purposes.

5. DATA SECURITY
5.1 All data transmissions between your device and our servers are encrypted using TLS/SSL (Transport Layer Security/Secure Sockets Layer).
5.2 Personal data is stored in encrypted databases with strict access controls.
5.3 We conduct regular security audits, vulnerability assessments, and penetration testing.
5.4 Access to personal data is limited to authorized personnel on a strict need-to-know basis.
5.5 We implement firewalls, intrusion detection systems, and anti-malware protections.
5.6 DESPITE OUR BEST EFFORTS, NO METHOD OF ELECTRONIC TRANSMISSION OR STORAGE IS 100% SECURE. We cannot guarantee absolute security of your data.

6. DATA RETENTION
6.1 Active account data is retained for the duration of your account.
6.2 Booking records are retained for 3 years after the booking date for dispute resolution and legal compliance.
6.3 Payment records (when activated) will be retained for 7 years as required by Indian tax laws.
6.4 KYC documents are retained for the duration of the Provider relationship plus 1 year after termination.
6.5 Deleted account data is retained for 30 days for recovery purposes, then permanently deleted.
6.6 You can request deletion of your account and associated data at any time by contacting support.

7. YOUR RIGHTS
7.1 Access: You can view and download your personal data from your account settings.
7.2 Correction: You can update your personal information at any time through your account settings.
7.3 Deletion: You can request deletion of your account and data by contacting support@bookyourservice.co.in.
7.4 Objection: You can opt out of marketing communications at any time by clicking the unsubscribe link or updating your preferences.
7.5 Data Portability: You can request a copy of your data in a machine-readable format by contacting our Data Protection Officer.

8. COOKIES AND TRACKING TECHNOLOGIES
8.1 We use essential cookies for platform functionality, session management, and security.
8.2 Analytics cookies help us understand usage patterns and improve our services.
8.3 Functional cookies remember your preferences such as location, language, and recently viewed services.
8.4 You can manage cookie preferences through your browser settings or our cookie consent banner.
8.5 Please refer to our Cookie Policy for detailed information on cookie usage.

9. CHILDREN'S PRIVACY
Our Platform is not intended for children under 18 years of age. We do not knowingly collect personal information from children. If we become aware that we have collected personal data from a child under 18, we will take steps to delete such information promptly.

10. INTERNATIONAL DATA TRANSFERS
Your data is primarily stored on servers located in India. In the event of international data processing, we ensure appropriate safeguards are in place in compliance with applicable data protection laws, including standard contractual clauses and adequacy decisions.

11. CHANGES TO THIS PRIVACY POLICY
We may update this Privacy Policy from time to time. Significant changes will be communicated via email or platform notification at least 15 days before taking effect. Your continued use of the Platform after changes constitutes acceptance of the revised policy.

12. CONTACT US
For privacy-related inquiries, data access requests, or to exercise your rights:
Email: privacy@bookyourservice.co.in
Address: BookYourService Technologies Pvt. Ltd., Fort, Mumbai 400001, Maharashtra, India
Data Protection Officer: dpo@bookyourservice.co.in
Grievance Officer: grievance@bookyourservice.co.in`,
    },
  });

  // Refund Policy
  await db.legalPage.create({
    data: {
      pageType: 'REFUND',
      title: 'Refund Policy',
      version: '2.0',
      effectiveDate: '2025-03-05',
      content: `REFUND POLICY FOR BOOKYOURSERVICE

Last Updated: March 5, 2025

1. OVERVIEW
1.1 BookYourService facilitates connections between Clients and Service Providers for Plumbing, Electrical, and AC & HVAC services. As an intermediary platform, our refund policy applies to the Platform Fee charged by BookYourService and the facilitation of refunds for service payments between Clients and Providers.
1.2 IMPORTANT: Currently, all service payments are settled directly between Clients and Providers (cash/direct transfer). The Company does NOT hold, process, or control service payments. Refunds for service payments must be arranged directly between the Client and Provider.
1.3 Once our online payment system is activated, the refund process will be managed through the Platform as described in the relevant sections below.

2. PLATFORM FEE REFUND
2.1 The Platform Fee is refundable under the following conditions:
   (a) The booking was cancelled by the Client within the applicable cancellation window.
   (b) The booking was cancelled by the Provider without adequate notice.
   (c) The Service Provider failed to arrive (no-show).
   (d) A duplicate Platform Fee charge was applied.
2.2 The Platform Fee is NOT refundable under the following conditions:
   (a) The service was completed, regardless of Client satisfaction.
   (b) The Client was a no-show without prior cancellation.
   (c) The cancellation was made within 4 hours of the scheduled time (partial refund may apply).

3. SERVICE PAYMENT REFUND — CURRENT MODEL (DIRECT PAYMENT)
3.1 Since payments are currently settled directly between Clients and Providers, the Company CANNOT process refunds for service payments.
3.2 Clients must request refunds directly from the Service Provider.
3.3 The Company will facilitate communication and mediation between the parties to resolve refund disputes.
3.4 The Company is NOT liable for any Provider's refusal to issue a refund or delay in refund processing.
3.5 The Company recommends obtaining receipts and maintaining records of all payments for refund purposes.

4. SERVICE PAYMENT REFUND — FUTURE ONLINE PAYMENT MODEL
4.1 When the online payment system is activated, the following refund policies will apply:
   (a) Full Refund: Cancellations made 24 or more hours before the scheduled service time. Both service payment and Platform Fee will be refunded.
   (b) Partial Refund (90%): Cancellations made 4-24 hours before the scheduled service time. 10% cancellation fee applies.
   (c) Partial Refund (75%): Cancellations made within 4 hours of the scheduled service time. 25% cancellation fee applies.
   (d) No Refund: Client no-show without prior cancellation.

5. ELIGIBILITY FOR SERVICE QUALITY REFUND
5.1 The service was not delivered as described in the listing.
5.2 The Provider did not arrive within 30 minutes of the scheduled time (no-show).
5.3 The service quality is significantly below the expected standard as evidenced by photos or documentation.
5.4 The Provider cancelled the booking without adequate notice.
5.5 A duplicate charge was applied.
5.6 The service could not be completed due to Provider's inability or equipment failure.

6. SERVICE QUALITY DISPUTE PROCESS
6.1 Clients can raise a quality dispute within 7 days of service completion through the Platform.
6.2 The Client must provide supporting evidence including photos, descriptions, and any relevant documentation.
6.3 The Company will review the dispute and contact the Provider for their response.
6.4 Review process takes up to 48 business hours.
6.5 If the quality issue is verified, the Company will facilitate a full or partial refund from the Provider.
6.6 In some cases, the Company may offer a re-service through a different Provider instead of a refund.

7. REFUND PROCESSING (ONLINE PAYMENT MODEL)
7.1 Approved refunds will be processed to the original payment method.
7.2 Refund processing times vary by payment method:
   - UPI: 3-5 business days
   - Credit/Debit Card: 5-7 business days
   - Net Banking: 5-7 business days
   - Wallet: 24-48 hours
7.3 The Company is NOT responsible for delays caused by payment gateways or banking systems.

8. NON-REFUNDABLE ITEMS
8.1 Platform Fee for completed services (unless a quality dispute is upheld).
8.2 Tips or bonuses paid directly to Providers.
8.3 Subscription fees for Provider plans (after 7 days of activation).
8.4 Any charges for additional materials or work requested by the Client beyond the original scope.

9. PARTIAL REFUNDS
9.1 If a service is partially completed, a partial refund may be issued based on the portion not completed.
9.2 The refund amount is determined based on the scope of work completed versus agreed upon.
9.3 Both Client and Provider input is considered in determining the partial refund amount.

10. REFUND TO WALLET (FUTURE)
10.1 When the online payment system is activated, refunds may be offered as BookYourService Wallet credit.
10.2 Wallet refunds are processed instantly and can be used for future bookings.
10.3 Wallet credits have no expiry date and can be withdrawn to your bank account.

11. DISPUTE ESCALATION
11.1 If a refund request is denied, you can escalate the matter to our Grievance Officer.
11.2 Escalated disputes are reviewed within 5 business days.
11.3 The decision of the Grievance Officer is final and binding.
11.4 Nothing in this Refund Policy prevents you from seeking remedies available under applicable consumer protection laws.

12. LIMITATION OF LIABILITY
12.1 The Company's liability for any refund is limited to the Platform Fee collected by the Company for the specific booking in question.
12.2 The Company is NOT liable for the service payment amount, as it is settled directly between the Client and Provider.
12.3 Under no circumstances shall the Company be liable for any indirect, incidental, special, or consequential damages arising from refund-related disputes.

13. CONTACT
For refund inquiries and dispute resolution:
Email: refunds@bookyourservice.co.in
Grievance Officer: grievance@bookyourservice.co.in
Support Hours: 8:00 AM - 10:00 PM IST, 7 days a week`,
    },
  });

  // Cookie Policy
  await db.legalPage.create({
    data: {
      pageType: 'COOKIES',
      title: 'Cookie Policy',
      version: '2.0',
      effectiveDate: '2025-03-05',
      content: `COOKIE POLICY FOR BOOKYOURSERVICE

Last Updated: March 5, 2025

1. INTRODUCTION
This Cookie Policy explains how BookYourService Technologies Pvt. Ltd. ("we," "us," or "our") uses cookies and similar tracking technologies when you visit our website (bookyourservice.co.in) or use our mobile application. This policy should be read alongside our Privacy Policy.

2. WHAT ARE COOKIES?
Cookies are small text files placed on your device (computer, tablet, or mobile phone) when you visit a website or use an application. They help us remember your preferences, understand how you use our Platform, and improve your experience when browsing for Plumbing, Electrical, and AC & HVAC services.

3. TYPES OF COOKIES WE USE

3.1 Essential Cookies (Strictly Necessary)
These cookies are required for the Platform to function properly and cannot be disabled. They enable core features such as:
- User authentication and secure session management
- Security and fraud prevention measures
- Load balancing and server optimization
- Booking state management and cart functionality
- Compliance with legal obligations

3.2 Functional Cookies
These cookies enable enhanced functionality and personalization:
- Remembering your city/location and preferred service area
- Saving your search preferences and category filters (Plumbing, Electrical, AC & HVAC)
- Storing your recently viewed services and providers
- Language and display preferences
- Auto-filling form data for faster booking

3.3 Analytics and Performance Cookies
These cookies help us understand how users interact with our Platform:
- Page views and navigation patterns
- Feature usage statistics
- Error tracking and performance monitoring
- A/B testing for Platform improvements
- Conversion tracking and funnel analysis
We use Google Analytics for website analytics. Data is collected anonymously and aggregated.

3.4 Marketing and Advertising Cookies
These cookies are used for targeted advertising and remarketing:
- Showing relevant service recommendations based on browsing history
- Retargeting ads across partner networks
- Measuring the effectiveness of marketing campaigns
- Social media integration features
- Email campaign tracking
These cookies require your explicit consent before activation.

4. THIRD-PARTY COOKIES
We allow the following third parties to set cookies on our Platform:
4.1 Google Analytics — Website analytics and user behavior tracking
4.2 Google Maps — Location services and provider proximity mapping
4.3 Razorpay — Payment processing (when online payments are activated)
4.4 Facebook/Meta — Social integration and advertising
4.5 WhatsApp — Click-to-chat functionality with providers and support

5. MANAGING COOKIES
5.1 Browser Settings
You can manage cookies through your browser settings:
- Chrome: Settings > Privacy and Security > Cookies and other site data
- Firefox: Options > Privacy & Security > Cookies and Site Data
- Safari: Preferences > Privacy > Cookies and website data
- Edge: Settings > Cookies and site permissions > Manage and delete cookies

5.2 Cookie Consent Banner
Our Platform displays a cookie consent banner upon your first visit. You can accept or reject non-essential cookies through this banner. You can modify your preferences at any time.

5.3 Opt-Out Links
You can opt out of specific third-party cookies:
- Google Analytics: https://tools.google.com/dlpage/gaoptout
- Facebook: https://www.facebook.com/help/568137493302217
- Network Advertising Initiative: https://optout.networkadvertising.org/

5.4 Do Not Track
We respect Do Not Track (DNT) browser signals to the extent required by applicable law. However, DNT is not uniformly supported across all browsers and may not fully prevent all tracking.

6. COOKIE DURATION
6.1 Session cookies expire when you close your browser.
6.2 Persistent cookies have varying durations:
   - Authentication cookies: 30 days
   - Preference cookies: 1 year
   - Analytics cookies: 2 years
   - Marketing cookies: 90 days
   - Essential cookies: Until browser session ends

7. COOKIES AND MOBILE APPLICATIONS
Our mobile application uses similar tracking technologies including:
7.1 Local Storage for session data and user preferences
7.2 Device identifiers (IDFA/GAID) for analytics
7.3 Push notification tokens for communication
7.4 In-app tracking for usage analytics and feature optimization

8. SPECIFIC COOKIES USED
The following categories of cookies are specifically used on our Platform:
- _ga, _gid, _gat — Google Analytics tracking
- session_id — User session management
- auth_token — Authentication and security
- csrf_token — Cross-site request forgery protection
- preferred_city — User location preference
- recent_services — Recently viewed services
- cookie_consent — User cookie preferences

9. YOUR RIGHTS
9.1 You have the right to be informed about cookies used on our Platform.
9.2 You have the right to consent to or reject non-essential cookies.
9.3 You have the right to withdraw consent at any time by updating your cookie preferences.
9.4 You have the right to request information about how your data is used through cookies.

10. IMPACT OF DISABLING COOKIES
10.1 Essential cookies cannot be disabled as they are required for Platform functionality.
10.2 Disabling functional cookies may result in a less personalized experience.
10.3 Disabling analytics cookies will not affect Platform functionality but may limit our ability to improve the Platform.
10.4 Disabling marketing cookies will prevent targeted advertising but will not affect core Platform features.

11. UPDATES TO THIS COOKIE POLICY
We may update this Cookie Policy to reflect changes in our practices, technology, or regulatory requirements. Material changes will be communicated through our Platform or via email. We encourage you to review this policy periodically.

12. CONTACT
For questions about our use of cookies or to exercise your rights:
Email: privacy@bookyourservice.co.in
Address: BookYourService Technologies Pvt. Ltd., Fort, Mumbai 400001, Maharashtra, India`,
    },
  });

  // ========================================
  // 12. REVENUE STREAMS (for 3 categories only)
  // ========================================
  console.log('💰 Creating revenue streams...');
  const revenueStreamData = [
    // Plumbing category revenue
    { streamType: 'Plumbing Booking Commission', description: 'Percentage commission on completed plumbing service bookings (leak repair, drain cleaning, pipe installation, etc.)', revenueModel: 'COMMISSION', estimatedMonthlyRevenue: 180000, status: 'ACTIVE' },
    { streamType: 'Plumbing Featured Listing', description: 'Featured placement for providers within the Plumbing category page', revenueModel: 'FEATURED_LISTING', estimatedMonthlyRevenue: 35000, status: 'ACTIVE' },
    { streamType: 'Plumbing Premium Provider Plan', description: 'Monthly subscription for premium plumbing providers with priority listing and lower commission', revenueModel: 'SUBSCRIPTION', estimatedMonthlyRevenue: 80000, status: 'ACTIVE' },

    // Electrical category revenue
    { streamType: 'Electrical Booking Commission', description: 'Percentage commission on completed electrical service bookings (wiring, light fixture, socket repair, etc.)', revenueModel: 'COMMISSION', estimatedMonthlyRevenue: 220000, status: 'ACTIVE' },
    { streamType: 'Electrical Featured Listing', description: 'Featured placement for providers within the Electrical category page', revenueModel: 'FEATURED_LISTING', estimatedMonthlyRevenue: 40000, status: 'ACTIVE' },
    { streamType: 'Electrical Premium Provider Plan', description: 'Monthly subscription for premium electrical providers with priority listing and lower commission', revenueModel: 'SUBSCRIPTION', estimatedMonthlyRevenue: 95000, status: 'ACTIVE' },

    // AC & HVAC category revenue
    { streamType: 'AC HVAC Booking Commission', description: 'Percentage commission on completed AC & HVAC service bookings (installation, repair, cleaning, gas refill, etc.)', revenueModel: 'COMMISSION', estimatedMonthlyRevenue: 250000, status: 'ACTIVE' },
    { streamType: 'AC HVAC Featured Listing', description: 'Featured placement for providers within the AC & HVAC category page', revenueModel: 'FEATURED_LISTING', estimatedMonthlyRevenue: 45000, status: 'ACTIVE' },
    { streamType: 'AC HVAC Premium Provider Plan', description: 'Monthly subscription for premium AC & HVAC providers with priority listing and lower commission', revenueModel: 'SUBSCRIPTION', estimatedMonthlyRevenue: 100000, status: 'ACTIVE' },

    // Cross-category revenue
    { streamType: 'Homepage Featured Listing', description: 'Featured placement on the homepage carousel across all categories', revenueModel: 'FEATURED_LISTING', estimatedMonthlyRevenue: 120000, status: 'ACTIVE' },
    { streamType: 'Search Result Boost', description: 'Boosted position in search results for providers across all categories', revenueModel: 'FEATURED_LISTING', estimatedMonthlyRevenue: 60000, status: 'ACTIVE' },
    { streamType: 'Urgent/Same-Day Booking Surcharge', description: 'Additional fee for same-day or urgent bookings across all categories', revenueModel: 'COMMISSION', estimatedMonthlyRevenue: 50000, status: 'ACTIVE' },
    { streamType: 'Client Plus Membership', description: 'Monthly client membership with discounts and priority booking across all categories', revenueModel: 'SUBSCRIPTION', estimatedMonthlyRevenue: 75000, status: 'PLANNED' },
    { streamType: 'Banner Advertising', description: 'Display advertising on category pages and homepage', revenueModel: 'ADVERTISING', estimatedMonthlyRevenue: 45000, status: 'ACTIVE' },
    { streamType: 'Referral Program', description: 'Revenue from client and provider referral programs', revenueModel: 'REFERRAL', estimatedMonthlyRevenue: 25000, status: 'PLANNED' },
  ];

  for (const rs of revenueStreamData) {
    await db.revenueStream.create({ data: rs });
  }

  // ========================================
  // 13. SEO METADATA (for 3 categories)
  // ========================================
  console.log('🔍 Creating SEO metadata...');
  const seoData = [
    {
      pageType: 'home',
      title: 'BookYourService — Trusted Home Services in India | Plumbing, Electrical, AC & HVAC',
      description: 'Book verified professionals for Plumbing, Electrical, and AC & HVAC services at your doorstep. Trusted providers in Delhi, Mumbai, Bengaluru, Hyderabad & Chennai. Transparent pricing, KYC verified providers.',
      keywords: 'home services, plumbing services, electrical services, AC repair, HVAC services, book plumber, book electrician, AC installation, India, Delhi, Mumbai, Bengaluru, Hyderabad, Chennai',
      canonicalUrl: 'https://bookyourservice.co.in',
      indexed: true,
    },
    {
      pageType: 'category',
      pageId: 'plumbing',
      title: 'Plumbing Services — Professional Plumbers Near You | BookYourService',
      description: 'Expert plumbing services including leak repair, drain cleaning, pipe installation, faucet repair, toilet installation, water heater repair, sewage cleaning, and more. Book verified plumbers in Delhi, Mumbai, Bengaluru, Hyderabad & Chennai.',
      keywords: 'plumber near me, leak repair, drain cleaning, pipe installation, faucet repair, toilet installation, water heater repair, plumbing services India, book plumber online',
      canonicalUrl: 'https://bookyourservice.co.in/category/plumbing',
      indexed: true,
    },
    {
      pageType: 'category',
      pageId: 'electrical',
      title: 'Electrical Services — Licensed Electricians Near You | BookYourService',
      description: 'Licensed electrical services including wiring repairs, light fixture installation, socket repairs, circuit breaker fixing, ceiling fan installation, smart home setup, generator maintenance, and more. Book verified electricians in top Indian cities.',
      keywords: 'electrician near me, wiring repair, light fixture installation, socket repair, circuit breaker, ceiling fan, smart home setup, electrical services India, book electrician online',
      canonicalUrl: 'https://bookyourservice.co.in/category/electrical',
      indexed: true,
    },
    {
      pageType: 'category',
      pageId: 'ac-hvac',
      title: 'AC & HVAC Services — Certified Technicians Near You | BookYourService',
      description: 'Professional AC & HVAC services including AC installation, repair, cleaning, gas refilling, heating unit repairs, thermostat setup, central air maintenance, duct cleaning, furnace repair, and more. Book certified technicians in top Indian cities.',
      keywords: 'AC repair near me, AC installation, AC cleaning, gas refill, HVAC services, air conditioning repair, duct cleaning, furnace repair, AC service India, book AC technician online',
      canonicalUrl: 'https://bookyourservice.co.in/category/ac-hvac',
      indexed: true,
    },
    {
      pageType: 'how-it-works',
      title: 'How It Works — BookYourService Home Services Made Easy',
      description: 'Learn how BookYourService connects you with verified professionals for Plumbing, Electrical, and AC & HVAC services in just a few simple steps.',
      keywords: 'how bookyourservice works, book home service, online service booking, plumbing booking, electrical booking, AC service booking',
      canonicalUrl: 'https://bookyourservice.co.in/how-it-works',
      indexed: true,
    },
    {
      pageType: 'about',
      title: 'About BookYourService — India\'s Trusted Home Service Platform',
      description: 'BookYourService connects homeowners with verified service providers for Plumbing, Electrical, and AC & HVAC services across major Indian cities. Learn about our mission and values.',
      keywords: 'about bookyourservice, home service platform India, verified service providers, plumbing electrical HVAC marketplace',
      canonicalUrl: 'https://bookyourservice.co.in/about',
      indexed: true,
    },
    {
      pageType: 'faq',
      title: 'FAQ — Frequently Asked Questions | BookYourService',
      description: 'Find answers to common questions about BookYourService including booking, payments, cancellations, and service categories — Plumbing, Electrical, and AC & HVAC.',
      keywords: 'bookyourservice FAQ, frequently asked questions, home service questions, plumbing FAQ, electrical FAQ, AC HVAC FAQ',
      canonicalUrl: 'https://bookyourservice.co.in/faq',
      indexed: true,
    },
    {
      pageType: 'contact',
      title: 'Contact Us — BookYourService Customer Support',
      description: 'Get in touch with BookYourService for support, queries, or feedback regarding Plumbing, Electrical, or AC & HVAC services. We\'re here to help.',
      keywords: 'contact bookyourservice, customer support, home service help, plumbing support, electrical support, AC support',
      canonicalUrl: 'https://bookyourservice.co.in/contact',
      indexed: true,
    },
  ];

  for (const seo of seoData) {
    await db.seoMetadata.create({ data: seo });
  }

  // ========================================
  // 14. PLATFORM STATS
  // ========================================
  console.log('📊 Creating platform stats...');
  await db.platformStats.create({
    data: {
      totalVisitors: 12500,
      totalUsers: clients.length + providers.length + 1, // clients + providers + admin
      totalProviders: providers.length,
      totalBookings: bookings.length,
      totalServices: services.length,
      activeVisitors: 42,
    },
  });

  // ========================================
  // 15. NOTIFICATIONS
  // ========================================
  console.log('🔔 Creating sample notifications...');
  const notifications = [
    { userId: clients[0].id, type: 'BOOKING_CONFIRMED', title: 'Booking Confirmed', message: 'Your plumbing service booking has been confirmed. The provider will arrive at the scheduled time.', actionUrl: '/bookings', isRead: true, readAt: new Date('2025-07-10T09:30:00') },
    { userId: clients[3].id, type: 'BOOKING_REMINDER', title: 'Upcoming Booking Reminder', message: 'Your AC installation service is scheduled for tomorrow at 11:00 AM. Please ensure access to the service location.', actionUrl: '/bookings', isRead: false },
    { userId: providers[0].id, type: 'NEW_BOOKING', title: 'New Booking Request', message: 'You have a new booking request for leak repair service. Please review and confirm.', actionUrl: '/provider/bookings', isRead: true, readAt: new Date('2025-08-10T10:00:00') },
    { userId: providers[1].id, type: 'PAYMENT_RECEIVED', title: 'Payment Update', message: 'Payment for the recent light fixture installation service has been confirmed by the client.', actionUrl: '/provider/earnings', isRead: false },
    { userId: clients[1].id, type: 'REVIEW_REQUEST', title: 'Rate Your Experience', message: 'How was your light fixture installation? Please take a moment to rate and review the service.', actionUrl: '/reviews', isRead: false },
    { userId: clients[7].id, type: 'BOOKING_CANCELLED', title: 'Booking Cancelled', message: 'Your smart home setup booking has been cancelled by the provider. A refund will be processed if applicable.', actionUrl: '/bookings', isRead: true, readAt: new Date('2025-07-21T18:30:00') },
    { userId: providers[2].id, type: 'KYC_APPROVED', title: 'KYC Verification Approved', message: 'Your KYC verification has been approved. You can now list services and start receiving bookings.', actionUrl: '/provider/profile', isRead: true, readAt: new Date('2025-01-15T12:00:00') },
    { userId: clients[5].id, type: 'PROMOTION', title: 'Special Offer on Plumbing Services', message: 'Get 15% off on all plumbing services this month! Book now and save on leak repairs, drain cleaning, and more.', actionUrl: '/category/plumbing', isRead: false },
  ];

  for (const notif of notifications) {
    await db.notification.create({ data: notif });
  }

  // ========================================
  // SUMMARY
  // ========================================
  console.log('\n');
  console.log('========================================');
  console.log('📊 SEED DATA SUMMARY');
  console.log('========================================');
  console.log(`Roles: 3 (CLIENT, PROVIDER, ADMIN)`);
  console.log(`Categories: 3 (Plumbing, Electrical, AC & HVAC)`);
  console.log(`Subcategories: 30 (10 per category)`);
  console.log(`Admin User: 1 (admin@bookyourservice.co.in / admin123)`);
  console.log(`Providers: ${providers.length} (Delhi, Mumbai, Bengaluru, Hyderabad, Chennai) — All KYC APPROVED`);
  console.log(`Clients: ${clients.length} (various statuses: ACTIVE, PENDING, BLOCKED, SUSPENDED)`);
  console.log(`Services: ${services.length} (across 3 categories, all active & approved)`);
  console.log(`Service Availability Slots: ${services.length * 6} (Mon-Fri 9AM-7PM, Sat 9AM-3PM)`);
  console.log(`Bookings: ${bookings.length}`);
  console.log(`Reviews: ${Math.min(completedBookings.length, reviewData.length)}`);
  console.log(`FAQs: ${faqData.length}`);
  console.log(`Legal Pages: 4 (Terms, Privacy, Refund, Cookies)`);
  console.log(`Revenue Streams: ${revenueStreamData.length}`);
  console.log(`SEO Metadata: ${seoData.length}`);
  console.log(`Notifications: ${notifications.length}`);
  console.log(`PlatformStats: 1 record`);
  console.log('========================================');
  console.log('✅ Database seeding completed successfully!');
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
