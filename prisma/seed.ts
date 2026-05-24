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
  await db.commission.deleteMany();
  await db.referral.deleteMany();
  await db.serviceArea.deleteMany();
  await db.areaManager.deleteMany();

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
  // 2. SERVICE CATEGORIES (11 categories)
  // ========================================
  console.log('📂 Creating service categories...');
  const categoryData = [
    { name: 'Air Conditioner', slug: 'air-conditioner', icon: 'Thermometer', description: 'AC installation, repair, gas refill, and maintenance services' },
    { name: 'Refrigerator', slug: 'refrigerator', icon: 'Snowflake', description: 'Fridge repair, servicing, and installation for all brands' },
    { name: 'Washing Machine', slug: 'washing-machine', icon: 'RotateCcw', description: 'Washing machine repair, servicing, and installation' },
    { name: 'Kitchen Appliances', slug: 'kitchen-appliances', icon: 'Utensils', description: 'Repair and servicing of kitchen appliances like microwave, chimney, dishwasher' },
    { name: 'TV Repair', slug: 'tv-repair', icon: 'Tv', description: 'LED, LCD, OLED TV repair, installation, and wall mounting' },
    { name: 'Water Purifier', slug: 'water-purifier', icon: 'Droplets', description: 'RO, UV, UF water purifier installation, repair, and filter replacement' },
    { name: 'Geyser', slug: 'geyser', icon: 'Flame', description: 'Water heater installation, repair, and servicing' },
    { name: 'Plumber', slug: 'plumber', icon: 'Wrench', description: 'Professional plumbing installation, repair, and maintenance' },
    { name: 'Electrician', slug: 'electrician', icon: 'Zap', description: 'Licensed electrical work, wiring, and installations' },
    { name: 'Water Tank Cleaning', slug: 'water-tank-cleaning', icon: 'GlassWater', description: 'Overhead and underground water tank cleaning and sanitization' },
    { name: 'Movers and Packers', slug: 'movers-packers', icon: 'Truck', description: 'Home and office relocation, packing, and moving services' },
  ];

  const categories: Record<string, any> = {};
  for (let i = 0; i < categoryData.length; i++) {
    const cat = await db.serviceCategory.create({
      data: { ...categoryData[i], displayOrder: i + 1, isActive: true },
    });
    categories[cat.slug] = cat;
  }

  // ========================================
  // 3. SUBCATEGORIES (5-8 per category)
  // ========================================
  console.log('📁 Creating subcategories...');
  const subcategoryData: Record<string, Array<{ name: string; slug: string; description: string }>> = {
    'air-conditioner': [
      { name: 'AC Installation', slug: 'ac-installation', description: 'Split and window AC installation' },
      { name: 'AC Repair & Troubleshooting', slug: 'ac-repair-troubleshooting', description: 'AC cooling issues, noise, and repair' },
      { name: 'AC Gas Refill', slug: 'ac-gas-refill', description: 'Refrigerant gas refill and leak fixing' },
      { name: 'AC Deep Cleaning', slug: 'ac-deep-cleaning', description: 'Foam wash and deep cleaning of AC units' },
      { name: 'AC Uninstallation', slug: 'ac-uninstallation', description: 'Safe AC unit removal and packing' },
      { name: 'AC Annual Maintenance', slug: 'ac-annual-maintenance', description: 'Annual service contract for AC maintenance' },
      { name: 'Compressor Repair', slug: 'compressor-repair', description: 'AC compressor diagnosis and repair' },
      { name: 'Thermostat Repair', slug: 'thermostat-repair', description: 'AC thermostat replacement and calibration' },
    ],
    'refrigerator': [
      { name: 'Fridge Cooling Repair', slug: 'fridge-cooling-repair', description: 'Fixing refrigerator cooling and temperature issues' },
      { name: 'Compressor Replacement', slug: 'fridge-compressor-replacement', description: 'Refrigerator compressor diagnosis and replacement' },
      { name: 'Gas Charging', slug: 'fridge-gas-charging', description: 'Refrigerant gas refill for refrigerators' },
      { name: 'Thermostat & Sensor Repair', slug: 'fridge-thermostat-sensor-repair', description: 'Thermostat and sensor repair and calibration' },
      { name: 'Door Seal & Gasket Replacement', slug: 'fridge-door-seal-replacement', description: 'Rubber gasket and door seal replacement' },
      { name: 'Deep Cleaning & Defrost', slug: 'fridge-deep-cleaning-defrost', description: 'Deep cleaning and defrost service for refrigerators' },
      { name: 'Ice Maker Repair', slug: 'ice-maker-repair', description: 'Ice maker and water dispenser repair' },
    ],
    'washing-machine': [
      { name: 'Drum & Spin Repair', slug: 'drum-spin-repair', description: 'Washing machine drum and spin cycle issues' },
      { name: 'Water Inlet & Drain Repair', slug: 'water-inlet-drain-repair', description: 'Fixing water inlet valve and drain pump problems' },
      { name: 'Motor Repair', slug: 'washing-machine-motor-repair', description: 'Motor diagnosis, repair, and replacement' },
      { name: 'Control Panel Repair', slug: 'control-panel-repair', description: 'Electronic control board and panel repair' },
      { name: 'Leak Fixing', slug: 'washing-machine-leak-fixing', description: 'Detection and repair of water leaks' },
      { name: 'Installation & Demo', slug: 'washing-machine-installation-demo', description: 'New washing machine installation and demo' },
      { name: 'Rubber Seal Replacement', slug: 'rubber-seal-replacement', description: 'Door rubber seal and gasket replacement' },
    ],
    'kitchen-appliances': [
      { name: 'Microwave Repair', slug: 'microwave-repair', description: 'Microwave oven repair and servicing' },
      { name: 'Chimney Repair & Cleaning', slug: 'chimney-repair-cleaning', description: 'Kitchen chimney repair and deep cleaning' },
      { name: 'Dishwasher Repair', slug: 'dishwasher-repair', description: 'Dishwasher repair and servicing' },
      { name: 'Gas Stove Repair', slug: 'gas-stove-repair', description: 'Gas stove and cooktop repair' },
      { name: 'Mixer Grinder Repair', slug: 'mixer-grinder-repair', description: 'Mixer, grinder, and blender repair' },
      { name: 'Water Dispenser Repair', slug: 'water-dispenser-repair', description: 'Hot and cold water dispenser repair' },
    ],
    'tv-repair': [
      { name: 'LED/LCD Panel Repair', slug: 'led-lcd-panel-repair', description: 'TV screen and panel repair for LED/LCD TVs' },
      { name: 'TV Motherboard Repair', slug: 'tv-motherboard-repair', description: 'Main board and power board repair' },
      { name: 'TV Installation & Wall Mount', slug: 'tv-installation-wall-mount', description: 'TV wall mounting and setup' },
      { name: 'Sound & Speaker Repair', slug: 'tv-sound-speaker-repair', description: 'TV sound, speaker, and audio issues' },
      { name: 'Smart TV Software Update', slug: 'smart-tv-software-update', description: 'Smart TV firmware update and troubleshooting' },
      { name: 'Remote & Sensor Repair', slug: 'remote-sensor-repair', description: 'TV remote and IR sensor repair' },
      { name: 'Backlight Repair', slug: 'tv-backlight-repair', description: 'TV backlight and LED strip replacement' },
    ],
    'water-purifier': [
      { name: 'RO Installation', slug: 'ro-installation', description: 'New RO water purifier installation and setup' },
      { name: 'Filter Replacement', slug: 'filter-replacement', description: 'RO filter and membrane replacement' },
      { name: 'RO Repair & Service', slug: 'ro-repair-service', description: 'Water purifier repair and general servicing' },
      { name: 'UV Lamp Replacement', slug: 'uv-lamp-replacement', description: 'UV lamp and UF membrane replacement' },
      { name: 'Leak & Noise Fixing', slug: 'ro-leak-noise-fixing', description: 'Fixing water leaks and unusual noise issues' },
      { name: 'AMC Plans', slug: 'ro-amc-plans', description: 'Annual maintenance contract for water purifiers' },
      { name: 'TDS Controller Adjustment', slug: 'tds-controller-adjustment', description: 'TDS controller calibration and mineral adjustment' },
    ],
    'geyser': [
      { name: 'Geyser Installation', slug: 'geyser-installation', description: 'New water heater installation and plumbing' },
      { name: 'Heating Element Replacement', slug: 'heating-element-replacement', description: 'Heating element and thermostat replacement' },
      { name: 'Leak Repair', slug: 'geyser-leak-repair', description: 'Water leak detection and repair in geysers' },
      { name: 'Temperature Control Repair', slug: 'temperature-control-repair', description: 'Thermostat and temperature control fixing' },
      { name: 'Tank Cleaning & Descaling', slug: 'tank-cleaning-descaling', description: 'Geyser tank cleaning and descaling service' },
      { name: 'Gas Geyser Repair', slug: 'gas-geyser-repair', description: 'Gas water heater repair and safety check' },
      { name: 'Solar Water Heater Service', slug: 'solar-water-heater-service', description: 'Solar water heater maintenance and repair' },
    ],
    'plumber': [
      { name: 'Pipe Leakage Repair', slug: 'pipe-leakage-repair', description: 'Detection and repair of pipe leaks' },
      { name: 'Tap & Faucet Installation', slug: 'tap-faucet-installation', description: 'New tap and faucet installation' },
      { name: 'Toilet Repair', slug: 'toilet-repair', description: 'Toilet flush, seat, and cistern repair' },
      { name: 'Drain Cleaning', slug: 'drain-cleaning', description: 'Blocked drain and sewer line cleaning' },
      { name: 'Bathroom Fittings', slug: 'bathroom-fittings', description: 'Shower, jet spray, and bathroom fitting installation' },
      { name: 'Water Pump Installation', slug: 'water-pump-installation', description: 'Motor and water pump installation and repair' },
      { name: 'Kitchen Sink Plumbing', slug: 'kitchen-sink-plumbing', description: 'Kitchen sink pipe and drain installation' },
      { name: 'Sewage Line Repair', slug: 'sewage-line-repair', description: 'Sewage pipe repair and replacement' },
    ],
    'electrician': [
      { name: 'Wiring & Rewiring', slug: 'wiring-rewiring', description: 'Complete house wiring and rewiring' },
      { name: 'Switch & Socket Installation', slug: 'switch-socket-installation', description: 'New switch and socket point installation' },
      { name: 'Ceiling Fan Installation', slug: 'ceiling-fan-installation', description: 'Ceiling fan mounting and wiring' },
      { name: 'MCB & DB Box Setup', slug: 'mcb-db-box-setup', description: 'Distribution board and MCB configuration' },
      { name: 'Inverter & UPS Installation', slug: 'inverter-ups-installation', description: 'Power backup system installation' },
      { name: 'Light Fixture Installation', slug: 'light-fixture-installation', description: 'Chandelier, tube light, and LED installation' },
      { name: 'Electrical Safety Audit', slug: 'electrical-safety-audit', description: 'Home electrical safety inspection' },
    ],
    'water-tank-cleaning': [
      { name: 'Overhead Tank Cleaning', slug: 'overhead-tank-cleaning', description: 'Rooftop overhead water tank cleaning and sanitization' },
      { name: 'Underground Tank Cleaning', slug: 'underground-tank-cleaning', description: 'Underground sump tank cleaning and disinfection' },
      { name: 'Tank Disinfection & Sanitization', slug: 'tank-disinfection-sanitization', description: 'Chemical disinfection and UV sanitization of tanks' },
      { name: 'Sediment & Sludge Removal', slug: 'sediment-sludge-removal', description: 'Removal of sediment, sludge, and deposits from tanks' },
      { name: 'Tank Repair & Waterproofing', slug: 'tank-repair-waterproofing', description: 'Water tank crack repair and waterproofing' },
      { name: 'Annual Tank Maintenance', slug: 'annual-tank-maintenance', description: 'Scheduled annual tank cleaning and maintenance' },
    ],
    'movers-packers': [
      { name: 'Local Home Shifting', slug: 'local-home-shifting', description: 'Within-city home relocation and shifting' },
      { name: 'Intercity Moving', slug: 'intercity-moving', description: 'Long-distance intercity home relocation' },
      { name: 'Office Relocation', slug: 'office-relocation', description: 'Corporate and office moving services' },
      { name: 'Packing & Unpacking', slug: 'packing-unpacking', description: 'Professional packing and unpacking service' },
      { name: 'Vehicle Transport', slug: 'vehicle-transport', description: 'Car and bike transportation services' },
      { name: 'Storage & Warehousing', slug: 'storage-warehousing', description: 'Temporary storage and warehousing solutions' },
      { name: 'Furniture Moving', slug: 'furniture-moving', description: 'Single item and furniture moving service' },
      { name: 'Insurance & Claims', slug: 'insurance-claims', description: 'Transit insurance and damage claims assistance' },
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
  // 5. SAMPLE PROVIDERS (3 providers with KYC APPROVED)
  // ========================================
  console.log('👷 Creating sample providers...');
  const providerPasswordHash = await bcrypt.hash('provider123', SALT_ROUNDS);

  const providers = [];
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
  // 6. SAMPLE CLIENTS (5 clients with various statuses)
  // ========================================
  console.log('👥 Creating sample clients...');
  const clientPasswordHash = await bcrypt.hash('client123', SALT_ROUNDS);
  const clients = [];
  const clientInfos = [
    { name: 'Anita Desai', email: 'anita.desai@gmail.com', phone: '+919912345670', status: 'ACTIVE', city: 'Hyderabad', state: 'Telangana', country: 'India', pincode: '500001', address: '23, Banjara Hills, Hyderabad', latitude: 17.4156, longitude: 78.4489, emailVerified: true, phoneVerified: true },
    { name: 'Vikram Singh', email: 'vikram.singh@gmail.com', phone: '+919912345671', status: 'ACTIVE', city: 'Pune', state: 'Maharashtra', country: 'India', pincode: '411001', address: '56, Koregaon Park, Pune', latitude: 18.5362, longitude: 73.8938, emailVerified: true, phoneVerified: true },
    { name: 'Meera Nair', email: 'meera.nair@gmail.com', phone: '+919912345672', status: 'PENDING', city: 'Chennai', state: 'Tamil Nadu', country: 'India', pincode: '600001', address: '89, T. Nagar, Chennai', latitude: 13.0418, longitude: 80.2341, emailVerified: false, phoneVerified: true },
    { name: 'Suresh Reddy', email: 'suresh.reddy@gmail.com', phone: '+919912345673', status: 'ACTIVE', city: 'Bengaluru', state: 'Karnataka', country: 'India', pincode: '560034', address: '34, Whitefield, Bengaluru', latitude: 12.9698, longitude: 77.7500, emailVerified: true, phoneVerified: true },
    { name: 'Kavita Joshi', email: 'kavita.joshi@gmail.com', phone: '+919912345674', status: 'BLOCKED', city: 'Jaipur', state: 'Rajasthan', country: 'India', pincode: '302001', address: '67, Malviya Nagar, Jaipur', latitude: 26.8571, longitude: 75.8098, emailVerified: true, phoneVerified: false },
  ];

  for (const cInfo of clientInfos) {
    const client = await db.user.create({
      data: { ...cInfo, passwordHash: clientPasswordHash, roleId: clientRole.id },
    });
    clients.push(client);
  }

  // ========================================
  // 7. SAMPLE SERVICES (17 services across all 11 categories)
  // ========================================
  console.log('🔧 Creating sample services...');
  const serviceData = [
    // Air Conditioner
    {
      providerId: providers[2].id,
      categoryId: categories['air-conditioner'].id,
      subcategoryId: subcategories['air-conditioner']?.[0]?.id,
      title: 'Split AC Installation Service',
      description: 'Professional split AC installation by certified technician. Includes copper piping, drainage pipe setup, gas charging, and performance testing. We install all major brands. 30-day service warranty included.',
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
      categoryId: categories['air-conditioner'].id,
      subcategoryId: subcategories['air-conditioner']?.[2]?.id,
      title: 'AC Gas Refill & Leak Fixing',
      description: 'Complete AC gas refill service with leak detection and fixing. We use genuine refrigerant gas and ensure optimal cooling performance. Includes pressure testing and performance verification.',
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

    // Refrigerator
    {
      providerId: providers[0].id,
      categoryId: categories['refrigerator'].id,
      subcategoryId: subcategories['refrigerator']?.[0]?.id,
      title: 'Refrigerator Cooling Repair Service',
      description: 'Expert repair for all refrigerator cooling issues. Whether your fridge is not cooling enough, too cold, or has uneven temperature, our technicians diagnose and fix the problem quickly. We service all brands including Samsung, LG, Whirlpool, and Godrej.',
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

    // Washing Machine
    {
      providerId: providers[1].id,
      categoryId: categories['washing-machine'].id,
      subcategoryId: subcategories['washing-machine']?.[0]?.id,
      title: 'Washing Machine Drum & Spin Repair',
      description: 'Expert repair for washing machine drum issues, spin cycle problems, and unusual vibrations. We fix top-load, front-load, and semi-automatic machines. Diagnosis, spare parts replacement, and testing included. All major brands serviced.',
      basePrice: 549,
      priceNegotiable: true,
      serviceDurationMinutes: 60,
      serviceAreaRadiusKm: 15,
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      address: '12, Andheri West, Mumbai',
      pincode: '400051',
      latitude: 19.1197,
      longitude: 72.8464,
    },

    // Kitchen Appliances
    {
      providerId: providers[0].id,
      categoryId: categories['kitchen-appliances'].id,
      subcategoryId: subcategories['kitchen-appliances']?.[1]?.id,
      title: 'Kitchen Chimney Repair & Deep Cleaning',
      description: 'Professional kitchen chimney repair and deep cleaning service. We fix suction issues, motor problems, and replace filters. Deep cleaning includes degreasing, filter wash, and duct cleaning. Service covers all chimney brands and types.',
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
      providerId: providers[1].id,
      categoryId: categories['kitchen-appliances'].id,
      subcategoryId: subcategories['kitchen-appliances']?.[0]?.id,
      title: 'Microwave Oven Repair & Service',
      description: 'Expert microwave oven repair for all types - solo, grill, and convection. We fix heating issues, turntable problems, display errors, and more. Genuine spare parts used with service warranty. All brands including Samsung, LG, IFB, and Bajaj.',
      basePrice: 399,
      priceNegotiable: false,
      serviceDurationMinutes: 45,
      serviceAreaRadiusKm: 20,
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      address: '12, Andheri West, Mumbai',
      pincode: '400051',
      latitude: 19.1197,
      longitude: 72.8464,
    },

    // TV Repair
    {
      providerId: providers[0].id,
      categoryId: categories['tv-repair'].id,
      subcategoryId: subcategories['tv-repair']?.[2]?.id,
      title: 'TV Installation & Wall Mounting',
      description: 'Professional TV wall mounting service for LED, LCD, OLED, and QLED TVs. Includes bracket installation, cable management, wall concealment, and TV setup. We mount all TV sizes from 32" to 85". Hidden cable routing available.',
      basePrice: 599,
      priceNegotiable: false,
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
      providerId: providers[2].id,
      categoryId: categories['tv-repair'].id,
      subcategoryId: subcategories['tv-repair']?.[0]?.id,
      title: 'LED/LCD TV Panel Repair',
      description: 'Expert TV panel repair for LED and LCD televisions. We fix display issues including lines on screen, dead pixels, backlight failure, and color distortion. Component-level repair by experienced technicians. Service warranty included.',
      basePrice: 1499,
      priceNegotiable: true,
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

    // Water Purifier
    {
      providerId: providers[1].id,
      categoryId: categories['water-purifier'].id,
      subcategoryId: subcategories['water-purifier']?.[0]?.id,
      title: 'RO Water Purifier Installation',
      description: 'Professional RO water purifier installation and setup. Includes mounting, pipe connections, initial filter flushing, and TDS testing. We install all RO brands - Kent, Aquaguard, Livpure, Pureit, and more. Free first-month service check included.',
      basePrice: 599,
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

    // Geyser
    {
      providerId: providers[0].id,
      categoryId: categories['geyser'].id,
      subcategoryId: subcategories['geyser']?.[0]?.id,
      title: 'Geyser Installation Service',
      description: 'Professional water heater installation by certified technician. Includes wall mounting, plumbing connections, electrical wiring, safety valve setup, and temperature testing. We install storage, instant, and gas geysers. Safety inspection included.',
      basePrice: 699,
      priceNegotiable: false,
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

    // Plumber
    {
      providerId: providers[0].id,
      categoryId: categories['plumber'].id,
      subcategoryId: subcategories['plumber']?.[0]?.id,
      title: 'Professional Pipe Leakage Repair & Fixing',
      description: 'Expert plumbing service for detecting and repairing all types of pipe leakages. We use advanced leak detection equipment and provide long-lasting solutions for residential and commercial properties. Service includes inspection, repair, and post-repair testing.',
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
      providerId: providers[1].id,
      categoryId: categories['plumber'].id,
      subcategoryId: subcategories['plumber']?.[3]?.id,
      title: 'Blocked Drain Cleaning Service',
      description: 'Professional drain and sewer line cleaning service. We use high-pressure jetting machines and specialized tools to clear blockages. Covers kitchen sinks, bathroom drains, toilet blocks, and main sewer lines. Preventive tips included.',
      basePrice: 599,
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

    // Electrician
    {
      providerId: providers[0].id,
      categoryId: categories['electrician'].id,
      subcategoryId: subcategories['electrician']?.[1]?.id,
      title: 'Switch & Socket Installation Service',
      description: 'Professional installation of switches, sockets, and electrical points. Licensed electrician with 10+ years of experience. Includes wiring, fitting, and safety testing. We ensure all installations meet ISI standards.',
      basePrice: 299,
      priceNegotiable: false,
      serviceDurationMinutes: 45,
      serviceAreaRadiusKm: 20,
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      address: '45, Connaught Place, New Delhi',
      pincode: '110001',
      latitude: 28.6315,
      longitude: 77.2167,
    },
    {
      providerId: providers[2].id,
      categoryId: categories['electrician'].id,
      subcategoryId: subcategories['electrician']?.[0]?.id,
      title: 'Complete House Wiring & Rewiring',
      description: 'Full house wiring and rewiring by licensed electricians. Includes concealed wiring, MCB distribution board setup, earthing, and safety certification. We use ISI-marked wires and accessories. Ideal for new construction and renovation projects.',
      basePrice: 4999,
      priceNegotiable: true,
      serviceDurationMinutes: 480,
      serviceAreaRadiusKm: 25,
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      address: '78, Koramangala, Bengaluru',
      pincode: '560001',
      latitude: 12.9352,
      longitude: 77.6245,
    },

    // Water Tank Cleaning
    {
      providerId: providers[1].id,
      categoryId: categories['water-tank-cleaning'].id,
      subcategoryId: subcategories['water-tank-cleaning']?.[0]?.id,
      title: 'Overhead Water Tank Cleaning & Sanitization',
      description: 'Professional overhead water tank cleaning and sanitization. Includes draining, sludge removal, high-pressure washing, anti-bacterial treatment, and UV sanitization. We ensure safe and hygienic drinking water. Suitable for residential and commercial buildings.',
      basePrice: 999,
      priceNegotiable: false,
      serviceDurationMinutes: 120,
      serviceAreaRadiusKm: 25,
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      address: '12, Andheri West, Mumbai',
      pincode: '400051',
      latitude: 19.1197,
      longitude: 72.8464,
    },

    // Movers and Packers
    {
      providerId: providers[0].id,
      categoryId: categories['movers-packers'].id,
      subcategoryId: subcategories['movers-packers']?.[0]?.id,
      title: 'Local Home Shifting Service',
      description: 'Complete local home shifting service including packing, loading, transportation, and unpacking. Professional team with quality packing materials. Insurance coverage available. Within-city relocation made hassle-free with our experienced movers.',
      basePrice: 3999,
      priceNegotiable: true,
      serviceDurationMinutes: 480,
      serviceAreaRadiusKm: 50,
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      address: '45, Connaught Place, New Delhi',
      pincode: '110001',
      latitude: 28.6315,
      longitude: 77.2167,
    },
    {
      providerId: providers[2].id,
      categoryId: categories['movers-packers'].id,
      subcategoryId: subcategories['movers-packers']?.[1]?.id,
      title: 'Intercity Home Relocation',
      description: 'Long-distance intercity home relocation service. Includes professional packing with premium materials, safe transportation in enclosed carriers, transit insurance, and doorstep delivery. We handle moves across all major Indian cities with care and reliability.',
      basePrice: 14999,
      priceNegotiable: true,
      serviceDurationMinutes: 480,
      serviceAreaRadiusKm: 100,
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      address: '78, Koramangala, Bengaluru',
      pincode: '560001',
      latitude: 12.9352,
      longitude: 77.6245,
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
        averageRating: (3.5 + Math.random() * 1.5),
        totalBookings: Math.floor(Math.random() * 50),
        totalReviews: Math.floor(Math.random() * 20),
      },
    });
    services.push(service);
  }

  // Fix average ratings to be rounded
  for (const service of services) {
    await db.service.update({
      where: { id: service.id },
      data: { averageRating: Math.round(service.averageRating * 10) / 10 },
    });
  }

  // ========================================
  // SERVICE AVAILABILITY SLOTS
  // ========================================
  console.log('📅 Creating service availability slots...');
  for (const service of services) {
    // Monday to Saturday (1-6), available 9 AM to 7 PM
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
    { clientId: clients[0].id, providerId: providers[0].id, serviceId: services[9].id, scheduledDate: '2025-07-10', scheduledTime: '10:00', serviceAddress: '23, Banjara Hills, Hyderabad', basePrice: 499, finalPrice: 499, status: 'COMPLETED', paymentStatus: 'PAID', completedAt: new Date('2025-07-10T11:30:00') },
    { clientId: clients[1].id, providerId: providers[1].id, serviceId: services[12].id, scheduledDate: '2025-07-12', scheduledTime: '09:00', serviceAddress: '56, Koregaon Park, Pune', basePrice: 599, finalPrice: 599, status: 'COMPLETED', paymentStatus: 'PAID', completedAt: new Date('2025-07-12T10:30:00') },
    { clientId: clients[2].id, providerId: providers[2].id, serviceId: services[0].id, scheduledDate: '2025-07-15', scheduledTime: '11:00', serviceAddress: '89, T. Nagar, Chennai', basePrice: 1299, finalPrice: 1299, status: 'COMPLETED', paymentStatus: 'PAID', completedAt: new Date('2025-07-15T13:00:00') },
    { clientId: clients[3].id, providerId: providers[0].id, serviceId: services[11].id, scheduledDate: '2025-07-18', scheduledTime: '14:00', serviceAddress: '34, Whitefield, Bengaluru', basePrice: 299, finalPrice: 299, status: 'COMPLETED', paymentStatus: 'PAID', completedAt: new Date('2025-07-18T15:00:00') },
    { clientId: clients[0].id, providerId: providers[2].id, serviceId: services[1].id, scheduledDate: '2025-07-20', scheduledTime: '10:00', serviceAddress: '23, Banjara Hills, Hyderabad', basePrice: 1899, finalPrice: 1899, status: 'COMPLETED', paymentStatus: 'PAID', completedAt: new Date('2025-07-20T11:30:00') },
    { clientId: clients[1].id, providerId: providers[1].id, serviceId: services[7].id, scheduledDate: '2025-07-25', scheduledTime: '10:00', serviceAddress: '56, Koregaon Park, Pune', basePrice: 599, finalPrice: 599, status: 'COMPLETED', paymentStatus: 'PAID', completedAt: new Date('2025-07-25T11:00:00') },
    { clientId: clients[3].id, providerId: providers[2].id, serviceId: services[13].id, scheduledDate: '2025-08-01', scheduledTime: '15:00', serviceAddress: '34, Whitefield, Bengaluru', basePrice: 4999, negotiatedPrice: 4500, finalPrice: 4500, status: 'COMPLETED', paymentStatus: 'PAID', completedAt: new Date('2025-08-01T16:30:00') },
    { clientId: clients[0].id, providerId: providers[0].id, serviceId: services[8].id, scheduledDate: '2025-08-05', scheduledTime: '09:00', serviceAddress: '23, Banjara Hills, Hyderabad', basePrice: 699, finalPrice: 699, status: 'COMPLETED', paymentStatus: 'PAID', completedAt: new Date('2025-08-05T10:30:00') },
    { clientId: clients[0].id, providerId: providers[1].id, serviceId: services[14].id, scheduledDate: '2025-08-10', scheduledTime: '11:00', serviceAddress: '23, Banjara Hills, Hyderabad', basePrice: 999, finalPrice: 999, status: 'PENDING', paymentStatus: 'PENDING' },
    { clientId: clients[1].id, providerId: providers[0].id, serviceId: services[2].id, scheduledDate: '2025-08-12', scheduledTime: '14:00', serviceAddress: '56, Koregaon Park, Pune', basePrice: 499, finalPrice: 499, status: 'ACCEPTED', paymentStatus: 'PAID' },
    { clientId: clients[3].id, providerId: providers[0].id, serviceId: services[15].id, scheduledDate: '2025-08-15', scheduledTime: '08:00', serviceAddress: '34, Whitefield, Bengaluru', basePrice: 3999, negotiatedPrice: 3699, finalPrice: 3699, status: 'IN_PROGRESS', paymentStatus: 'PAID' },
    { clientId: clients[4].id, providerId: providers[2].id, serviceId: services[6].id, scheduledDate: '2025-07-22', scheduledTime: '09:00', serviceAddress: '67, Malviya Nagar, Jaipur', basePrice: 1499, finalPrice: 1499, status: 'CANCELLED', paymentStatus: 'REFUNDED', cancellationReason: 'Schedule conflict - provider unavailable', cancelledBy: providers[2].id, cancelledAt: new Date('2025-07-21T18:00:00') },
    { clientId: clients[2].id, providerId: providers[1].id, serviceId: services[3].id, scheduledDate: '2025-07-28', scheduledTime: '07:00', serviceAddress: '89, T. Nagar, Chennai', basePrice: 549, finalPrice: 549, status: 'CANCELLED', paymentStatus: 'REFUNDED', cancellationReason: 'Changed my mind', cancelledBy: clients[2].id, cancelledAt: new Date('2025-07-27T20:00:00') },
    { clientId: clients[0].id, providerId: providers[2].id, serviceId: services[16].id, scheduledDate: '2025-08-18', scheduledTime: '10:00', serviceAddress: '23, Banjara Hills, Hyderabad', basePrice: 14999, negotiatedPrice: 13500, finalPrice: 13500, status: 'PENDING', paymentStatus: 'PENDING' },
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
    { rating: 5, comment: 'Excellent plumbing work! The plumber was very professional and fixed the pipe leakage in no time. Highly recommended.' },
    { rating: 4, comment: 'Good drain cleaning service. The team was punctual and thorough. Only giving 4 stars because they were slightly late arriving.' },
    { rating: 5, comment: 'Perfect AC installation! Very neat work with proper copper piping and drainage. The technician was knowledgeable and friendly.' },
    { rating: 4, comment: 'Good electrical work. Switch installation was done properly. Would recommend for basic electrical needs.' },
    { rating: 5, comment: 'AC gas refill was done expertly. Cooling is now much better. The technician found and fixed the leak too. Great service!' },
    { rating: 4, comment: 'RO installation was quick and professional. The technician explained everything clearly and tested the water quality after setup.' },
    { rating: 5, comment: 'Excellent house wiring work! The electricians were meticulous and ensured all safety standards. Very professional team.' },
    { rating: 5, comment: 'Geyser installation was done perfectly. The technician ensured proper safety measures and tested everything before leaving.' },
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
  // 10. FAQs
  // ========================================
  console.log('❓ Creating FAQs...');
  const faqData = [
    // General
    { category: 'General', question: 'What is BookYourService?', answer: 'BookYourService is India\'s leading online marketplace connecting customers with verified service providers for home appliance repair, plumbing, electrical work, water tank cleaning, and relocation services. We ensure quality, reliability, and transparent pricing for every booking.', displayOrder: 1 },
    { category: 'General', question: 'Which cities does BookYourService operate in?', answer: 'We currently operate in major Indian cities including Delhi, Mumbai, Bengaluru, Hyderabad, Pune, Chennai, Jaipur, Kolkata, and expanding rapidly. Enter your pincode on the homepage to check availability in your area.', displayOrder: 2 },
    { category: 'General', question: 'How do I book a service?', answer: 'Simply browse categories or search for a service, select your preferred provider, choose a date and time, and confirm your booking. You can also call our helpline for assistance with booking.', displayOrder: 3 },
    { category: 'General', question: 'Are the service providers verified?', answer: 'Yes, all service providers on BookYourService undergo a rigorous KYC verification process including identity verification (Aadhaar/PAN), address verification, skill assessment, and background checks before being listed on our platform.', displayOrder: 4 },
    { category: 'General', question: 'What services are available on BookYourService?', answer: 'We offer 11 categories of services including AC repair, refrigerator repair, washing machine repair, kitchen appliance repair, TV repair, water purifier service, geyser repair, plumbing, electrical work, water tank cleaning, and movers & packers. Each category has multiple sub-services to choose from.', displayOrder: 5 },
    // Booking
    { category: 'Booking', question: 'Can I reschedule my booking?', answer: 'Yes, you can reschedule your booking up to 4 hours before the scheduled time at no extra charge. Go to My Bookings, select the booking, and click Reschedule. Subject to provider availability.', displayOrder: 6 },
    { category: 'Booking', question: 'What happens if the provider doesn\'t show up?', answer: 'If a provider fails to arrive within 30 minutes of the scheduled time without prior notice, you can raise a no-show complaint. We\'ll arrange an alternative provider or provide a full refund along with a 10% credit as compensation.', displayOrder: 7 },
    { category: 'Booking', question: 'Can I book services for someone else?', answer: 'Yes, during booking you can specify a different service address and contact person. The booking confirmation will be sent to your registered number/email while the service details go to the service address contact.', displayOrder: 8 },
    { category: 'Booking', question: 'Is there a minimum booking amount?', answer: 'There is no minimum booking amount. However, some services have a base price which is the minimum charge for that service. The final price may vary based on the scope of work and negotiation.', displayOrder: 9 },
    { category: 'Booking', question: 'How far in advance can I book a service?', answer: 'You can book services up to 30 days in advance. For same-day bookings, we recommend booking at least 2 hours before the desired time slot to ensure provider availability.', displayOrder: 10 },
    // Payment
    { category: 'Payment', question: 'What payment methods are accepted?', answer: 'We accept UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and BookYourService Wallet. Cash payment is available for select services only.', displayOrder: 11 },
    { category: 'Payment', question: 'Is it safe to make online payments on BookYourService?', answer: 'Absolutely. All payments are processed through Razorpay, a PCI DSS Level 1 certified payment gateway. Your card and banking details are encrypted and never stored on our servers.', displayOrder: 12 },
    { category: 'Payment', question: 'When is the payment deducted from my account?', answer: 'For most services, payment is authorized at the time of booking but charged only after the service is completed. For premium services, an advance may be required at the time of booking.', displayOrder: 13 },
    { category: 'Payment', question: 'Can I negotiate the service price?', answer: 'Yes, for services marked as "Price Negotiable," you can propose a different price through our negotiation feature. The provider can accept, reject, or counter-offer. Both parties must agree before the booking is confirmed.', displayOrder: 14 },
    { category: 'Payment', question: 'Do I need to pay extra charges or taxes?', answer: 'The final price shown includes all applicable charges. A nominal platform fee (5%) is charged separately and displayed during checkout. GST is included in the service price where applicable.', displayOrder: 15 },
    // Provider
    { category: 'Provider', question: 'How can I become a service provider on BookYourService?', answer: 'Register as a provider, complete KYC verification (Aadhaar/PAN + selfie), and get your profile approved. Once verified, you can list your services, set pricing, and start receiving bookings. The approval process typically takes 24-48 hours.', displayOrder: 16 },
    { category: 'Provider', question: 'What commission does BookYourService charge providers?', answer: 'We charge a competitive commission of 15-20% depending on the service category and your subscription plan. Premium plan providers enjoy lower commission rates and priority listing.', displayOrder: 17 },
    { category: 'Provider', question: 'How do I receive my earnings?', answer: 'Provider earnings are transferred directly to your registered bank account within 3-5 business days after service completion. You can track all payments and earnings in your Provider Dashboard.', displayOrder: 18 },
    { category: 'Provider', question: 'Can I set my own prices for services?', answer: 'Yes, you have full control over your service pricing. You can also mark prices as negotiable to allow clients to propose different rates. We recommend competitive pricing based on your experience and market rates.', displayOrder: 19 },
    // Cancellation
    { category: 'Cancellation', question: 'What is the cancellation policy?', answer: 'Cancellations made 24+ hours before the scheduled time are fully refundable. Cancellations within 4-24 hours incur a 10% fee. Cancellations within 4 hours or no-shows incur a 25% fee. Refunds are processed within 5-7 business days.', displayOrder: 20 },
    { category: 'Cancellation', question: 'How do I cancel a booking?', answer: 'Go to My Bookings, select the booking you wish to cancel, and click Cancel Booking. You\'ll need to provide a cancellation reason. The refund (if applicable) will be initiated immediately to your original payment method.', displayOrder: 21 },
    { category: 'Cancellation', question: 'Can a provider cancel my booking?', answer: 'Providers can cancel only in genuine emergencies. Frequent cancellations affect their rating and may lead to account suspension. If your booking is cancelled by the provider, we\'ll offer an alternative provider or a full refund with a 10% credit bonus.', displayOrder: 22 },
  ];

  for (const faq of faqData) {
    await db.faq.create({ data: faq });
  }

  // ========================================
  // 11. LEGAL PAGES
  // ========================================
  console.log('📜 Creating legal pages...');

  // Terms & Conditions
  await db.legalPage.create({
    data: {
      pageType: 'TERMS',
      title: 'Terms & Conditions',
      version: '1.0',
      effectiveDate: '2025-01-01',
      content: `TERMS AND CONDITIONS FOR BOOKYOURSERVICE

Last Updated: January 1, 2025

1. ACCEPTANCE OF TERMS
By accessing or using the BookYourService platform (website and mobile application), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services.

2. DEFINITIONS
"Platform" refers to the BookYourService website and mobile application operated by BookYourService Technologies Pvt. Ltd.
"Service Provider" refers to individuals or businesses registered on the platform to offer services.
"Client" refers to users who book services through the platform.
"Services" refers to the home appliance repair, plumbing, electrical, water tank cleaning, and relocation services listed on the platform.

3. USER REGISTRATION
3.1 Users must provide accurate and complete information during registration.
3.2 Users must be at least 18 years of age to create an account.
3.3 Each user may maintain only one account at a time.
3.4 Users are responsible for maintaining the confidentiality of their account credentials.
3.5 BookYourService reserves the right to suspend accounts that violate these terms.

4. SERVICE BOOKING
4.1 Clients can browse, select, and book services through the platform.
4.2 All bookings are subject to provider availability and confirmation.
4.3 The platform acts as an intermediary and does not directly provide services.
4.4 Service prices are indicative and may vary based on the actual scope of work.
4.5 Booking confirmation constitutes a service agreement between the Client and Provider.

5. PAYMENT TERMS
5.1 Payments are processed through secure third-party payment gateways.
5.2 The platform charges a service fee on each booking as displayed during checkout.
5.3 All prices are listed in Indian Rupees (INR) inclusive of applicable taxes.
5.4 Payment must be completed before service commencement unless otherwise stated.
5.5 Provider earnings are disbursed after deducting the platform commission.

6. CANCELLATION AND REFUND
6.1 Cancellations made 24+ hours before the scheduled time receive a full refund.
6.2 Cancellations within 4-24 hours incur a 10% cancellation fee.
6.3 Cancellations within 4 hours or no-shows incur a 25% cancellation fee.
6.4 Refunds are processed within 5-7 business days to the original payment method.
6.5 The platform reserves the right to modify the cancellation policy with prior notice.

7. SERVICE GUARANTEE
7.1 BookYourService provides a 7-day service guarantee for completed bookings.
7.2 If the service quality is unsatisfactory, clients can raise a dispute within 7 days.
7.3 The platform will mediate disputes and facilitate resolution.
7.4 Re-service or refund will be provided based on the dispute resolution outcome.

8. PROVIDER OBLIGATIONS
8.1 Providers must complete KYC verification before listing services.
8.2 Providers must maintain professional conduct and service quality standards.
8.3 Providers must arrive on time and complete services as described.
8.4 Providers must not solicit direct business bypassing the platform.
8.5 Providers are responsible for their own tools, equipment, and insurance.

9. LIABILITY LIMITATIONS
9.1 BookYourService is not liable for any direct, indirect, or consequential damages arising from service delivery.
9.2 The platform does not guarantee the outcome of any service rendered.
9.3 Total liability is limited to the amount paid for the specific service in question.
9.4 The platform is not responsible for delays or failures due to force majeure events.

10. INTELLECTUAL PROPERTY
10.1 All content on the platform is owned by BookYourService Technologies Pvt. Ltd.
10.2 Users may not copy, reproduce, or distribute platform content without written consent.
10.3 Provider listings and reviews remain the property of BookYourService.

11. PRIVACY AND DATA
11.1 User data is collected and processed in accordance with our Privacy Policy.
11.2 We comply with the Information Technology Act, 2000 and applicable data protection laws.
11.3 Users consent to receiving transactional and promotional communications.

12. DISPUTE RESOLUTION
12.1 Disputes shall first be attempted to be resolved through the platform's dispute mechanism.
12.2 Unresolved disputes shall be referred to arbitration in accordance with the Arbitration and Conciliation Act, 1996.
12.3 The seat of arbitration shall be Mumbai, India.
12.4 All proceedings shall be conducted in English.

13. MODIFICATIONS
13.1 BookYourService reserves the right to modify these terms at any time.
13.2 Users will be notified of significant changes via email or platform notification.
13.3 Continued use of the platform after modifications constitutes acceptance of revised terms.

14. GOVERNING LAW
These Terms and Conditions are governed by the laws of India. The courts of Mumbai shall have exclusive jurisdiction over any disputes arising from these terms.

Contact: legal@bookyourservice.co.in`,
    },
  });

  // Privacy Policy
  await db.legalPage.create({
    data: {
      pageType: 'PRIVACY',
      title: 'Privacy Policy',
      version: '1.0',
      effectiveDate: '2025-01-01',
      content: `PRIVACY POLICY FOR BOOKYOURSERVICE

Last Updated: January 1, 2025

1. INTRODUCTION
BookYourService Technologies Pvt. Ltd. ("we", "our", "us") is committed to protecting the privacy and personal data of our users. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.

2. INFORMATION WE COLLECT
2.1 Personal Information: Name, email address, phone number, profile photo, and address.
2.2 Identity Verification: Aadhaar number, PAN number, driving license, passport (for providers).
2.3 Location Data: GPS coordinates for service delivery and provider matching.
2.4 Payment Information: Payment method details (processed securely by Razorpay; we do not store card/bank details).
2.5 Device Information: IP address, browser type, device type, operating system.
2.6 Usage Data: Pages visited, features used, search queries, booking history.
2.7 Communications: Chat messages between clients and providers, support tickets.

3. HOW WE USE YOUR INFORMATION
3.1 To provide and improve our services, including matching clients with providers.
3.2 To process bookings, payments, and refunds.
3.3 To verify user identity and prevent fraud.
3.4 To send booking confirmations, reminders, and service updates.
3.5 To provide customer support and resolve disputes.
3.6 To send promotional offers and updates (with opt-out option).
3.7 To comply with legal obligations and regulatory requirements.
3.8 To analyze usage patterns and improve platform performance.

4. DATA SHARING
4.1 Service Providers: Your name, address, and phone number are shared with the assigned provider for service delivery.
4.2 Payment Processors: Payment data is shared with Razorpay for transaction processing.
4.3 Analytics Partners: Anonymized usage data may be shared with analytics services.
4.4 Legal Requirements: We may disclose data when required by law, regulation, or legal process.
4.5 Business Transfers: In the event of a merger or acquisition, user data may be transferred to the acquiring entity.
4.6 We do NOT sell your personal data to third parties for marketing purposes.

5. DATA SECURITY
5.1 All data transmissions are encrypted using TLS/SSL.
5.2 Personal data is stored in encrypted databases with restricted access.
5.3 We conduct regular security audits and vulnerability assessments.
5.4 Access to personal data is limited to authorized personnel on a need-to-know basis.
5.5 Despite our best efforts, no method of electronic transmission or storage is 100% secure.

6. DATA RETENTION
6.1 Active account data is retained for the duration of your account.
6.2 Booking records are retained for 3 years after the booking date.
6.3 Payment records are retained for 7 years as required by Indian tax laws.
6.4 KYC documents are retained for the duration of the provider relationship plus 1 year.
6.5 You can request deletion of your account and associated data at any time.

7. YOUR RIGHTS
7.1 Access: You can view and download your personal data from your account settings.
7.2 Correction: You can update your personal information at any time.
7.3 Deletion: You can request deletion of your account and data by contacting support.
7.4 Objection: You can opt out of marketing communications at any time.
7.5 Data Portability: You can request a copy of your data in a machine-readable format.

8. COOKIES AND TRACKING
8.1 We use essential cookies for platform functionality and session management.
8.2 Analytics cookies help us understand usage patterns and improve our services.
8.3 You can manage cookie preferences through your browser settings.
8.4 Please refer to our Cookie Policy for detailed information.

9. CHILDREN'S PRIVACY
Our platform is not intended for children under 18 years of age. We do not knowingly collect personal information from children. If we become aware of such data, it will be promptly deleted.

10. INTERNATIONAL DATA TRANSFERS
Your data is primarily stored on servers located in India. In the event of international data processing, we ensure appropriate safeguards are in place in compliance with applicable data protection laws.

11. CHANGES TO THIS POLICY
We may update this Privacy Policy from time to time. Significant changes will be communicated via email or platform notification. Your continued use of the platform after changes constitutes acceptance of the revised policy.

12. CONTACT US
For privacy-related inquiries or data requests:
Email: privacy@bookyourservice.co.in
Address: BookYourService Technologies Pvt. Ltd., Fort, Mumbai 400001, Maharashtra, India

Data Protection Officer: privacy@bookyourservice.co.in`,
    },
  });

  // Refund Policy
  await db.legalPage.create({
    data: {
      pageType: 'REFUND',
      title: 'Refund Policy',
      version: '1.0',
      effectiveDate: '2025-01-01',
      content: `REFUND POLICY FOR BOOKYOURSERVICE

Last Updated: January 1, 2025

1. OVERVIEW
At BookYourService, we strive to ensure complete satisfaction with every service. If you are not satisfied with a service, we offer a comprehensive refund policy as outlined below.

2. ELIGIBILITY FOR REFUND
2.1 The service was not delivered as described in the listing.
2.2 The provider did not arrive within 30 minutes of the scheduled time (no-show).
2.3 The service quality is significantly below the expected standard.
2.4 The booking was cancelled within the applicable cancellation window.
2.5 A duplicate charge was applied to your account.
2.6 The provider cancelled the booking without adequate notice.

3. CANCELLATION-BASED REFUNDS
3.1 Full Refund: Cancellations made 24 or more hours before the scheduled service time.
3.2 Partial Refund (90%): Cancellations made 4-24 hours before the scheduled service time.
3.3 Partial Refund (75%): Cancellations made within 4 hours of the scheduled service time.
3.4 No Refund: No-show by the client without prior cancellation.

4. SERVICE QUALITY-BASED REFUNDS
4.1 Clients can raise a quality dispute within 7 days of service completion.
4.2 Our team will review the dispute, including photos, descriptions, and provider response.
4.3 If the quality issue is verified, a full or partial refund will be issued.
4.4 In some cases, we may offer a re-service at no additional cost instead of a refund.

5. REFUND PROCESS
5.1 Refund requests can be initiated from My Bookings or by contacting customer support.
5.2 Refund requests are reviewed within 48 business hours.
5.3 Approved refunds are processed to the original payment method.
5.4 Refund processing times vary by payment method:
   - UPI: 3-5 business days
   - Credit/Debit Card: 5-7 business days
   - Net Banking: 5-7 business days
   - Wallet: 24-48 hours

6. NON-REFUNDABLE ITEMS
6.1 Platform fee for completed services (unless the service quality dispute is upheld).
6.2 Convenience charges for premium time slots.
6.3 Tips or bonuses paid to providers.
6.4 Subscription fees for provider plans (after 7 days of activation).

7. PARTIAL REFUNDS
7.1 If a service is partially completed, a partial refund may be issued based on the portion not completed.
7.2 The refund amount is determined based on the scope of work completed vs. agreed upon.
7.3 Both client and provider input is considered in determining the partial refund amount.

8. REFUND TO WALLET
8.1 In some cases, refunds may be offered as BookYourService Wallet credit.
8.2 Wallet refunds are processed instantly and can be used for future bookings.
8.3 Wallet credits have no expiry date and can be withdrawn to your bank account.

9. DISPUTE ESCALATION
9.1 If a refund request is denied, you can escalate the matter to our grievance officer.
9.2 Escalated disputes are reviewed within 5 business days.
9.3 The decision of the grievance officer is final and binding.

10. CONTACT
For refund inquiries:
Email: refunds@bookyourservice.co.in
Phone: 1800-XXX-XXXX (Toll Free)
Support Hours: 8:00 AM - 10:00 PM IST, 7 days a week`,
    },
  });

  // Cookie Policy
  await db.legalPage.create({
    data: {
      pageType: 'COOKIES',
      title: 'Cookie Policy',
      version: '1.0',
      effectiveDate: '2025-01-01',
      content: `COOKIE POLICY FOR BOOKYOURSERVICE

Last Updated: January 1, 2025

1. WHAT ARE COOKIES?
Cookies are small text files placed on your device when you visit our website or use our mobile application. They help us remember your preferences, understand how you use our platform, and improve your experience.

2. TYPES OF COOKIES WE USE

2.1 Essential Cookies (Required)
These cookies are necessary for the platform to function properly. They enable core features such as:
- User authentication and session management
- Security and fraud prevention
- Load balancing and server optimization
- Shopping cart and booking state management

2.2 Functional Cookies
These cookies enable enhanced functionality and personalization:
- Remembering your location and preferred city
- Saving your search preferences and filters
- Storing your recently viewed services
- Language and theme preferences

2.3 Analytics Cookies
These cookies help us understand how users interact with our platform:
- Page views and navigation patterns
- Feature usage statistics
- Error tracking and performance monitoring
- A/B testing for platform improvements
We use Google Analytics for website analytics. Data is collected anonymously and aggregated.

2.4 Marketing Cookies
These cookies are used for targeted advertising and remarketing:
- Showing relevant service recommendations
- Retargeting ads across partner networks
- Measuring the effectiveness of marketing campaigns
- Social media integration features

3. THIRD-PARTY COOKIES
We allow the following third parties to set cookies on our platform:
- Razorpay (Payment processing)
- Google Analytics (Website analytics)
- Google Maps (Location services)
- Facebook/Meta (Social integration and advertising)
- WhatsApp (Click-to-chat functionality)

4. MANAGING COOKIES

4.1 Browser Settings
You can manage cookies through your browser settings:
- Chrome: Settings > Privacy and Security > Cookies
- Firefox: Options > Privacy & Security > Cookies
- Safari: Preferences > Privacy > Cookies
- Edge: Settings > Cookies and site permissions

4.2 Opt-Out
You can opt out of specific cookie categories through our cookie consent banner. Essential cookies cannot be disabled as they are required for platform functionality.

4.3 Do Not Track
We respect Do Not Track (DNT) signals where legally required. However, not all browsers support DNT uniformly.

5. COOKIE DURATION
5.1 Session cookies expire when you close your browser.
5.2 Persistent cookies have varying durations:
   - Authentication cookies: 30 days
   - Preference cookies: 1 year
   - Analytics cookies: 2 years
   - Marketing cookies: 90 days

6. COOKIES AND MOBILE APPS
Our mobile application uses similar technologies including:
- Local Storage for session and preference data
- Device identifiers for analytics
- Push notification tokens for communication

7. UPDATES TO THIS POLICY
We may update this Cookie Policy to reflect changes in our practices or regulatory requirements. We will notify you of material changes through our platform or via email.

8. CONTACT
For questions about our use of cookies:
Email: privacy@bookyourservice.co.in
Address: BookYourService Technologies Pvt. Ltd., Fort, Mumbai 400001, Maharashtra, India`,
    },
  });

  // ========================================
  // 12. REVENUE STREAMS
  // ========================================
  console.log('💰 Creating revenue streams...');
  const revenueStreamData = [
    // Commission-based
    { streamType: 'Booking Commission', description: 'Percentage commission on each completed booking', revenueModel: 'COMMISSION', estimatedMonthlyRevenue: 500000 },
    { streamType: 'Premium Provider Commission', description: 'Reduced commission rate for premium plan providers', revenueModel: 'COMMISSION', estimatedMonthlyRevenue: 200000 },
    { streamType: 'Category-specific Commission', description: 'Higher commission for premium service categories like AC repair and intercity moving', revenueModel: 'COMMISSION', estimatedMonthlyRevenue: 150000 },
    { streamType: 'Urgent Booking Surcharge', description: 'Additional fee for same-day or urgent bookings', revenueModel: 'COMMISSION', estimatedMonthlyRevenue: 75000 },
    { streamType: 'Weekend/Holiday Premium', description: 'Surcharge for weekend and holiday bookings', revenueModel: 'COMMISSION', estimatedMonthlyRevenue: 60000 },

    // Subscription-based
    { streamType: 'Provider Basic Plan', description: 'Monthly subscription for basic provider listing', revenueModel: 'SUBSCRIPTION', estimatedMonthlyRevenue: 100000 },
    { streamType: 'Provider Premium Plan', description: 'Monthly subscription for premium provider features', revenueModel: 'SUBSCRIPTION', estimatedMonthlyRevenue: 250000 },
    { streamType: 'Provider Enterprise Plan', description: 'Monthly subscription for multi-provider businesses', revenueModel: 'SUBSCRIPTION', estimatedMonthlyRevenue: 80000 },
    { streamType: 'Client Plus Membership', description: 'Monthly client membership with discounts and priority booking', revenueModel: 'SUBSCRIPTION', estimatedMonthlyRevenue: 120000 },
    { streamType: 'Client Premium Membership', description: 'Premium client membership with exclusive benefits', revenueModel: 'SUBSCRIPTION', estimatedMonthlyRevenue: 60000 },

    // Featured Listings
    { streamType: 'Category Featured Listing', description: 'Featured placement within service category pages', revenueModel: 'FEATURED_LISTING', estimatedMonthlyRevenue: 90000 },
    { streamType: 'Homepage Featured Listing', description: 'Featured placement on the homepage carousel', revenueModel: 'FEATURED_LISTING', estimatedMonthlyRevenue: 150000 },
    { streamType: 'Search Result Boost', description: 'Boosted position in search results for providers', revenueModel: 'FEATURED_LISTING', estimatedMonthlyRevenue: 85000 },
    { streamType: 'Top Provider Badge', description: 'Premium badge and highlighted listing for top providers', revenueModel: 'FEATURED_LISTING', estimatedMonthlyRevenue: 45000 },
    { streamType: 'City Page Featured', description: 'Featured listing on city-specific landing pages', revenueModel: 'FEATURED_LISTING', estimatedMonthlyRevenue: 55000 },

    // Advertising
    { streamType: 'Banner Ads - Homepage', description: 'Display advertising on homepage', revenueModel: 'ADVERTISING', estimatedMonthlyRevenue: 100000 },
    { streamType: 'Banner Ads - Category Pages', description: 'Display advertising on category listing pages', revenueModel: 'ADVERTISING', estimatedMonthlyRevenue: 60000 },
    { streamType: 'Sponsored Content', description: 'Sponsored blog posts and service guides', revenueModel: 'ADVERTISING', estimatedMonthlyRevenue: 35000 },
    { streamType: 'Push Notification Ads', description: 'Targeted push notification advertising', revenueModel: 'ADVERTISING', estimatedMonthlyRevenue: 25000 },
    { streamType: 'Email Newsletter Ads', description: 'Advertising in weekly email newsletters', revenueModel: 'ADVERTISING', estimatedMonthlyRevenue: 20000 },
    { streamType: 'In-App Banner Ads', description: 'Banner advertising within the mobile app', revenueModel: 'ADVERTISING', estimatedMonthlyRevenue: 40000 },
    { streamType: 'Video Ads', description: 'Pre-roll and mid-roll video advertisements', revenueModel: 'ADVERTISING', estimatedMonthlyRevenue: 30000 },

    // Premium Features
    { streamType: 'Priority Booking', description: 'Clients pay for priority slot booking', revenueModel: 'PREMIUM', estimatedMonthlyRevenue: 50000 },
    { streamType: 'Express Service', description: 'Guaranteed faster service delivery', revenueModel: 'PREMIUM', estimatedMonthlyRevenue: 40000 },
    { streamType: 'Extended Warranty', description: 'Extended service warranty beyond standard period', revenueModel: 'PREMIUM', estimatedMonthlyRevenue: 30000 },
    { streamType: 'Insurance Add-on', description: 'Service insurance for high-value bookings like intercity moving', revenueModel: 'PREMIUM', estimatedMonthlyRevenue: 25000 },
    { streamType: 'VIP Support', description: 'Dedicated customer support for premium users', revenueModel: 'PREMIUM', estimatedMonthlyRevenue: 20000 },
    { streamType: 'Detailed Service Report', description: 'Comprehensive post-service report with photos', revenueModel: 'PREMIUM', estimatedMonthlyRevenue: 15000 },
    { streamType: 'Scheduled Maintenance Plan', description: 'Prepaid recurring maintenance service plans for ACs and water purifiers', revenueModel: 'PREMIUM', estimatedMonthlyRevenue: 75000 },

    // Referral
    { streamType: 'Client Referral Fee', description: 'Fee from referral program for new client acquisition', revenueModel: 'REFERRAL', estimatedMonthlyRevenue: 35000 },
    { streamType: 'Provider Referral Fee', description: 'Fee from referral program for new provider acquisition', revenueModel: 'REFERRAL', estimatedMonthlyRevenue: 25000 },
    { streamType: 'Corporate Partnership Referral', description: 'Referral fees from corporate tie-ups', revenueModel: 'REFERRAL', estimatedMonthlyRevenue: 45000 },
    { streamType: 'Affiliate Marketing', description: 'Commission from affiliate partner referrals', revenueModel: 'REFERRAL', estimatedMonthlyRevenue: 20000 },
    { streamType: 'Social Media Influencer Referral', description: 'Referral fees from influencer partnerships', revenueModel: 'REFERRAL', estimatedMonthlyRevenue: 15000 },

    // API Access
    { streamType: 'API Access - Basic', description: 'Basic API access for third-party integrations', revenueModel: 'API_ACCESS', estimatedMonthlyRevenue: 30000 },
    { streamType: 'API Access - Premium', description: 'Premium API access with higher rate limits', revenueModel: 'API_ACCESS', estimatedMonthlyRevenue: 50000 },
    { streamType: 'White Label Solution', description: 'White-label platform licensing for partners', revenueModel: 'API_ACCESS', estimatedMonthlyRevenue: 100000 },
    { streamType: 'Corporate API Integration', description: 'Custom API integration for corporate clients', revenueModel: 'API_ACCESS', estimatedMonthlyRevenue: 75000 },
    { streamType: 'Real Estate Partner API', description: 'API integration for real estate platforms', revenueModel: 'API_ACCESS', estimatedMonthlyRevenue: 40000 },

    // Data Licensing
    { streamType: 'Market Research Data', description: 'Anonymized market data licensing to researchers', revenueModel: 'DATA_LICENSING', estimatedMonthlyRevenue: 25000 },
    { streamType: 'Pricing Intelligence Data', description: 'Service pricing trends and analytics data', revenueModel: 'DATA_LICENSING', estimatedMonthlyRevenue: 20000 },
    { streamType: 'Demand Forecasting Data', description: 'Service demand forecasting data for partners', revenueModel: 'DATA_LICENSING', estimatedMonthlyRevenue: 30000 },
    { streamType: 'Consumer Behavior Analytics', description: 'Anonymized consumer behavior and preference data', revenueModel: 'DATA_LICENSING', estimatedMonthlyRevenue: 15000 },
    { streamType: 'Geographic Service Mapping Data', description: 'Service availability and demand mapping by geography', revenueModel: 'DATA_LICENSING', estimatedMonthlyRevenue: 10000 },

    // Additional Revenue Streams
    { streamType: 'Platform Convenience Fee', description: 'Flat convenience fee per transaction', revenueModel: 'COMMISSION', estimatedMonthlyRevenue: 80000 },
    { streamType: 'Payment Processing Margin', description: 'Margin on payment gateway processing', revenueModel: 'COMMISSION', estimatedMonthlyRevenue: 40000 },
    { streamType: 'Wallet Float Revenue', description: 'Interest earned on wallet balances', revenueModel: 'COMMISSION', estimatedMonthlyRevenue: 10000 },
    { streamType: 'Late Cancellation Fee', description: 'Fee charged for late booking cancellations', revenueModel: 'COMMISSION', estimatedMonthlyRevenue: 35000 },
    { streamType: 'Service Verification Fee', description: 'Fee for verifying and certifying provider quality', revenueModel: 'PREMIUM', estimatedMonthlyRevenue: 20000 },
    { streamType: 'Background Check Fee', description: 'Charged to providers for background verification', revenueModel: 'PREMIUM', estimatedMonthlyRevenue: 15000 },
    { streamType: 'Training Certification Fee', description: 'Fee for platform-provided skill training and certification', revenueModel: 'PREMIUM', estimatedMonthlyRevenue: 25000 },
    { streamType: 'Lead Generation Fee', description: 'Fee from providers for qualified lead distribution', revenueModel: 'FEATURED_LISTING', estimatedMonthlyRevenue: 65000 },
    { streamType: 'Seasonal Campaign Revenue', description: 'Revenue from seasonal promotional campaigns', revenueModel: 'ADVERTISING', estimatedMonthlyRevenue: 55000 },
    { streamType: 'Corporate Bulk Booking', description: 'Revenue from corporate bulk service bookings', revenueModel: 'COMMISSION', estimatedMonthlyRevenue: 120000 },
    { streamType: 'Service Package Deals', description: 'Revenue from bundled service packages (e.g., AC + geyser service)', revenueModel: 'COMMISSION', estimatedMonthlyRevenue: 90000 },
    { streamType: 'Geographic Expansion Fee', description: 'Revenue from new city launch partnerships', revenueModel: 'REFERRAL', estimatedMonthlyRevenue: 50000 },
  ];

  for (const rs of revenueStreamData) {
    await db.revenueStream.create({ data: rs });
  }

  // ========================================
  // 13. SEO METADATA
  // ========================================
  console.log('🔍 Creating SEO metadata...');
  const seoData = [
    {
      pageType: 'HOME',
      title: 'BookYourService - Book Home Appliance Repair & Services Online in India',
      description: 'Book trusted home appliance repair and services online. AC repair, refrigerator, washing machine, plumbing, electrical, TV repair, water purifier, geyser, water tank cleaning, and movers & packers. Verified providers, transparent pricing.',
      keywords: 'home services, AC repair, refrigerator repair, washing machine repair, plumbing, electrician, TV repair, water purifier, geyser repair, movers packers, India',
      canonicalUrl: 'https://www.bookyourservice.co.in',
      ogImage: '/images/og-home.jpg',
      schemaMarkup: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "BookYourService",
        "url": "https://www.bookyourservice.co.in",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://www.bookyourservice.co.in/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }),
    },
    {
      pageType: 'SERVICES',
      title: 'All Services - BookYourService',
      description: 'Browse 11 service categories on BookYourService. Home appliance repair, plumbing, electrical, water tank cleaning, and movers & packers. Book trusted professionals near you.',
      keywords: 'all services, service categories, home appliance repair, plumbing, electrician, India',
      canonicalUrl: 'https://www.bookyourservice.co.in/services',
    },
    {
      pageType: 'CATEGORY',
      title: '{categoryName} Services - BookYourService',
      description: 'Book professional {categoryName} services online. Verified providers, transparent pricing, and guaranteed satisfaction.',
      keywords: '{categoryName} services, book {categoryName}, {categoryName} near me',
    },
    {
      pageType: 'SERVICE_DETAIL',
      title: '{serviceName} - BookYourService',
      description: 'Book {serviceName} at the best price. Verified provider, transparent pricing, and quality guaranteed.',
      keywords: '{serviceName}, book {serviceName}, {serviceName} online',
    },
    {
      pageType: 'PROVIDER_PROFILE',
      title: '{providerName} - Service Provider on BookYourService',
      description: 'View {providerName}\'s profile, services, ratings, and reviews on BookYourService. Book trusted services today.',
    },
    {
      pageType: 'BOOKING',
      title: 'My Bookings - BookYourService',
      description: 'View and manage your bookings on BookYourService.',
    },
    {
      pageType: 'ABOUT',
      title: 'About BookYourService - India\'s Trusted Service Marketplace',
      description: 'Learn about BookYourService, India\'s leading online marketplace connecting customers with verified service providers for home appliance repair, plumbing, electrical, and relocation services.',
      canonicalUrl: 'https://www.bookyourservice.co.in/about',
    },
    {
      pageType: 'CONTACT',
      title: 'Contact Us - BookYourService',
      description: 'Get in touch with BookYourService. Customer support, business inquiries, and partnership opportunities.',
      canonicalUrl: 'https://www.bookyourservice.co.in/contact',
    },
    {
      pageType: 'FAQ',
      title: 'Frequently Asked Questions - BookYourService',
      description: 'Find answers to common questions about booking, payments, cancellations, and more on BookYourService.',
      canonicalUrl: 'https://www.bookyourservice.co.in/faq',
      schemaMarkup: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": []
      }),
    },
    {
      pageType: 'TERMS',
      title: 'Terms & Conditions - BookYourService',
      description: 'Read the Terms and Conditions for using BookYourService platform.',
      canonicalUrl: 'https://www.bookyourservice.co.in/legal/terms',
    },
    {
      pageType: 'PRIVACY',
      title: 'Privacy Policy - BookYourService',
      description: 'Read our Privacy Policy to understand how BookYourService collects, uses, and protects your personal information.',
      canonicalUrl: 'https://www.bookyourservice.co.in/legal/privacy',
    },
  ];

  for (const seo of seoData) {
    await db.seoMetadata.create({ data: seo });
  }

  // ========================================
  // 14. NOTIFICATIONS
  // ========================================
  console.log('🔔 Creating sample notifications...');

  const notificationData = [
    { userId: clients[0].id, type: 'BOOKING_CONFIRMED', title: 'Booking Confirmed', message: 'Your booking for Pipe Leakage Repair has been confirmed for July 10, 2025 at 10:00 AM.', actionUrl: '/bookings/1', isRead: true },
    { userId: clients[0].id, type: 'SERVICE_COMPLETED', title: 'Service Completed', message: 'Your Pipe Leakage Repair service has been completed. Please rate your experience!', actionUrl: '/bookings/1/review', isRead: true },
    { userId: clients[0].id, type: 'BOOKING_PENDING', title: 'Booking Pending', message: 'Your booking for Water Tank Cleaning is awaiting provider confirmation.', actionUrl: '/bookings/9', isRead: false },
    { userId: clients[0].id, type: 'PROMO', title: 'Special Offer!', message: 'Get 20% off on all AC services this summer. Use code COOL20 at checkout!', isRead: false },

    { userId: clients[1].id, type: 'BOOKING_CONFIRMED', title: 'Booking Confirmed', message: 'Your Drain Cleaning service has been confirmed for July 12, 2025.', actionUrl: '/bookings/2', isRead: true },
    { userId: clients[1].id, type: 'PAYMENT_SUCCESS', title: 'Payment Successful', message: 'Payment of ₹499 has been successfully processed for your Refrigerator Repair booking.', isRead: false },
    { userId: clients[1].id, type: 'REVIEW_REMINDER', title: 'Rate Your Experience', message: 'You recently completed a Drain Cleaning service. Share your feedback!', isRead: false },

    { userId: clients[2].id, type: 'BOOKING_CANCELLED', title: 'Booking Cancelled', message: 'Your Washing Machine Repair booking has been cancelled. Refund will be processed in 5-7 days.', isRead: true },
    { userId: clients[2].id, type: 'VERIFICATION', title: 'Email Verification', message: 'Please verify your email address to access all features of your account.', actionUrl: '/verify-email', isRead: false },

    { userId: clients[3].id, type: 'BOOKING_CONFIRMED', title: 'Booking Confirmed', message: 'Your Switch & Socket Installation service has been confirmed.', isRead: true },
    { userId: clients[3].id, type: 'BOOKING_IN_PROGRESS', title: 'Service In Progress', message: 'Your Local Home Shifting service is currently in progress. Track your provider!', actionUrl: '/bookings/11', isRead: false },

    { userId: providers[0].id, type: 'NEW_BOOKING', title: 'New Booking Request', message: 'You have a new booking request for Refrigerator Cooling Repair on August 12, 2025.', actionUrl: '/provider/bookings', isRead: false },
    { userId: providers[0].id, type: 'PAYMENT_RECEIVED', title: 'Payment Received', message: '₹474 has been credited to your account for the Pipe Leakage Repair service.', isRead: true },
    { userId: providers[0].id, type: 'NEW_REVIEW', title: 'New Review', message: 'Anita Desai left a 5-star review for your Pipe Leakage Repair service!', isRead: true },

    { userId: providers[1].id, type: 'NEW_BOOKING', title: 'New Booking Request', message: 'New booking for Water Tank Cleaning service on August 10, 2025.', isRead: false },
    { userId: providers[1].id, type: 'PAYMENT_RECEIVED', title: 'Payment Received', message: '₹569 has been credited for the Drain Cleaning service.', isRead: true },
    { userId: providers[1].id, type: 'KYC_APPROVED', title: 'KYC Approved', message: 'Your KYC verification has been approved. You can now list services on the platform.', isRead: true },

    { userId: providers[2].id, type: 'NEW_BOOKING', title: 'New Booking Request', message: 'New booking for Intercity Home Relocation on August 18, 2025.', isRead: false },
    { userId: providers[2].id, type: 'PAYMENT_RECEIVED', title: 'Payment Received', message: '₹1,234 has been credited for the AC Installation service.', isRead: true },
    { userId: providers[2].id, type: 'BOOKING_CANCELLED', title: 'Booking Cancelled by Client', message: 'Your TV Panel Repair booking was cancelled by the client. No action required.', isRead: true },

    { userId: admin.id, type: 'NEW_PROVIDER_SIGNUP', title: 'New Provider Registration', message: 'A new provider has registered and is pending KYC verification.', isRead: false },
    { userId: admin.id, type: 'DISPUTE_RAISED', title: 'New Dispute', message: 'A new dispute has been raised for a completed booking. Review required.', isRead: false },
  ];

  for (const notif of notificationData) {
    await db.notification.create({
      data: {
        ...notif,
        readAt: notif.isRead ? new Date() : null,
      },
    });
  }

  // ========================================
  // ADMIN LOGS
  // ========================================
  console.log('📋 Creating admin logs...');
  const adminLogData = [
    { adminId: admin.id, action: 'APPROVE_PROVIDER_KYC', targetType: 'USER', targetId: providers[0].id, details: JSON.stringify({ providerName: 'Rajesh Kumar', documentType: 'AADHAAR' }) },
    { adminId: admin.id, action: 'APPROVE_PROVIDER_KYC', targetType: 'USER', targetId: providers[1].id, details: JSON.stringify({ providerName: 'Priya Sharma', documentType: 'PAN' }) },
    { adminId: admin.id, action: 'APPROVE_PROVIDER_KYC', targetType: 'USER', targetId: providers[2].id, details: JSON.stringify({ providerName: 'Arun Patel', documentType: 'DRIVING_LICENSE' }) },
    { adminId: admin.id, action: 'APPROVE_SERVICE', targetType: 'SERVICE', details: JSON.stringify({ serviceName: 'Split AC Installation Service' }) },
    { adminId: admin.id, action: 'APPROVE_SERVICE', targetType: 'SERVICE', details: JSON.stringify({ serviceName: 'Professional Pipe Leakage Repair' }) },
    { adminId: admin.id, action: 'BLOCK_USER', targetType: 'USER', targetId: clients[4].id, details: JSON.stringify({ reason: 'Fraudulent activity detected', userName: 'Kavita Joshi' }) },
    { adminId: admin.id, action: 'UPDATE_FAQ', targetType: 'FAQ', details: JSON.stringify({ action: 'Created 22 FAQs' }) },
    { adminId: admin.id, action: 'UPDATE_LEGAL_PAGE', targetType: 'LEGAL_PAGE', details: JSON.stringify({ pagesUpdated: ['TERMS', 'PRIVACY', 'REFUND', 'COOKIES'] }) },
  ];

  for (const log of adminLogData) {
    await db.adminLog.create({ data: log });
  }

  // ========================================
  // FAVORITES
  // ========================================
  console.log('❤️ Creating sample favorites...');
  const favoriteData = [
    { userId: clients[0].id, serviceId: services[12].id },
    { userId: clients[0].id, serviceId: services[0].id },
    { userId: clients[1].id, serviceId: services[9].id },
    { userId: clients[1].id, serviceId: services[7].id },
    { userId: clients[3].id, serviceId: services[1].id },
    { userId: clients[3].id, serviceId: services[15].id },
  ];

  for (const fav of favoriteData) {
    await db.favorite.create({ data: fav });
  }

  // ========================================
  // CONTACT MESSAGES
  // ========================================
  console.log('📩 Creating sample contact messages...');
  const contactMessages = [
    { name: 'Rahul Verma', email: 'rahul.verma@gmail.com', subject: 'Partnership Inquiry', message: 'I run an appliance repair shop in Delhi NCR and would like to explore listing our services on BookYourService. Please share the partnership details and onboarding process.', isRead: true },
    { name: 'Sunita Devi', email: 'sunita.devi@gmail.com', subject: 'AC Service Not Satisfactory', message: 'I booked an AC gas refill service on July 20th but the cooling is still not adequate. The technician said the gas was refilled but I am not satisfied. I would like to raise a complaint.', isRead: false },
    { name: 'Amitabh Patel', email: 'amitabh.p@corporate.com', subject: 'Corporate Account Setup', message: 'We are a company with 500+ employees looking for corporate service packages for appliance maintenance and repair. Can you provide bulk booking options and corporate pricing?', isRead: false },
  ];

  for (const cm of contactMessages) {
    await db.contactMessage.create({ data: cm });
  }

  // ========================================
  // SUMMARY
  // ========================================
  console.log('\n✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Roles: 3`);
  console.log(`   Service Categories: ${categoryData.length}`);
  console.log(`   Subcategories: ${Object.values(subcategoryData).flat().length}`);
  console.log(`   Admin Users: 1`);
  console.log(`   Providers: ${providers.length}`);
  console.log(`   Clients: ${clients.length}`);
  console.log(`   Services: ${services.length}`);
  console.log(`   Bookings: ${bookings.length}`);
  console.log(`   Reviews: ${reviewData.length}`);
  console.log(`   FAQs: ${faqData.length}`);
  console.log(`   Legal Pages: 4`);
  console.log(`   Revenue Streams: ${revenueStreamData.length}`);
  console.log(`   SEO Metadata: ${seoData.length}`);
  console.log(`   Notifications: ${notificationData.length}`);
  console.log(`   Admin Logs: ${adminLogData.length}`);
  console.log(`   Favorites: ${favoriteData.length}`);
  console.log(`   Contact Messages: ${contactMessages.length}`);

  // ========================================
  // SERVICE AREAS (Major Indian Cities)
  // ========================================
  console.log('🗺️ Creating service areas...');
  const serviceAreaData = [
    { city: 'Mumbai', state: 'Maharashtra', pincode: '400001', latitude: 19.0760, longitude: 72.8777, radiusKm: 25, isActive: true, providerCount: 3, customerCount: 15, bookingCount: 8, targetProviders: 30, targetCustomers: 150, launchDate: new Date('2025-01-01') },
    { city: 'Delhi', state: 'Delhi', pincode: '110001', latitude: 28.7041, longitude: 77.1025, radiusKm: 25, isActive: true, providerCount: 3, customerCount: 12, bookingCount: 6, targetProviders: 25, targetCustomers: 120, launchDate: new Date('2025-01-01') },
    { city: 'Bengaluru', state: 'Karnataka', pincode: '560001', latitude: 12.9716, longitude: 77.5946, radiusKm: 25, isActive: true, providerCount: 3, customerCount: 10, bookingCount: 5, targetProviders: 25, targetCustomers: 120, launchDate: new Date('2025-01-15') },
    { city: 'Hyderabad', state: 'Telangana', pincode: '500001', latitude: 17.3850, longitude: 78.4867, radiusKm: 20, isActive: true, providerCount: 1, customerCount: 5, bookingCount: 3, targetProviders: 20, targetCustomers: 100, launchDate: new Date('2025-02-01') },
    { city: 'Pune', state: 'Maharashtra', pincode: '411001', latitude: 18.5204, longitude: 73.8567, radiusKm: 20, isActive: true, providerCount: 1, customerCount: 4, bookingCount: 2, targetProviders: 20, targetCustomers: 100, launchDate: new Date('2025-02-15') },
    { city: 'Chennai', state: 'Tamil Nadu', pincode: '600001', latitude: 13.0827, longitude: 80.2707, radiusKm: 20, isActive: false, providerCount: 0, customerCount: 2, bookingCount: 0, targetProviders: 15, targetCustomers: 80, launchDate: null },
    { city: 'Jaipur', state: 'Rajasthan', pincode: '302001', latitude: 26.9124, longitude: 75.7873, radiusKm: 15, isActive: false, providerCount: 0, customerCount: 1, bookingCount: 0, targetProviders: 15, targetCustomers: 80, launchDate: null },
    { city: 'Kolkata', state: 'West Bengal', pincode: '700001', latitude: 22.5726, longitude: 88.3639, radiusKm: 20, isActive: false, providerCount: 0, customerCount: 0, bookingCount: 0, targetProviders: 15, targetCustomers: 80, launchDate: null },
    { city: 'Ahmedabad', state: 'Gujarat', pincode: '380001', latitude: 23.0225, longitude: 72.5714, radiusKm: 20, isActive: false, providerCount: 0, customerCount: 0, bookingCount: 0, targetProviders: 15, targetCustomers: 80, launchDate: null },
    { city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001', latitude: 26.8467, longitude: 80.9462, radiusKm: 15, isActive: false, providerCount: 0, customerCount: 0, bookingCount: 0, targetProviders: 10, targetCustomers: 60, launchDate: null },
  ];

  for (const saData of serviceAreaData) {
    await db.serviceArea.create({ data: saData });
  }
  console.log('   Service Areas: ' + serviceAreaData.length);
  console.log('\n🔐 Login Credentials:');
  console.log('   Admin:    admin@bookyourservice.co.in / admin123');
  console.log('   Provider: rajesh.kumar@gmail.com / provider123');
  console.log('   Provider: priya.sharma@gmail.com / provider123');
  console.log('   Provider: arun.patel@gmail.com / provider123');
  console.log('   Client:   anita.desai@gmail.com / client123');
  console.log('   Client:   vikram.singh@gmail.com / client123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
