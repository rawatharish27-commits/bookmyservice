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
  // 2. SERVICE CATEGORIES (26 categories)
  // ========================================
  console.log('📂 Creating service categories...');
  const categoryData = [
    { name: 'Home Maintenance & Repairs', slug: 'home-maintenance-repairs', icon: 'Wrench', description: 'General home maintenance and repair services' },
    { name: 'Plumbing Services', slug: 'plumbing-services', icon: 'Droplets', description: 'Professional plumbing installation, repair, and maintenance' },
    { name: 'Electrical Services', slug: 'electrical-services', icon: 'Zap', description: 'Licensed electrical work and installations' },
    { name: 'AC & HVAC Services', slug: 'ac-hvac-services', icon: 'Thermometer', description: 'Air conditioning and HVAC system services' },
    { name: 'Carpentry & Woodwork', slug: 'carpentry-woodwork', icon: 'Hammer', description: 'Custom carpentry and woodworking services' },
    { name: 'Painting & Decoration', slug: 'painting-decoration', icon: 'PaintBucket', description: 'Interior and exterior painting and decoration' },
    { name: 'Handyman Services', slug: 'handyman-services', icon: 'Tool', description: 'Multi-purpose handyman for odd jobs' },
    { name: 'Masonry & Tiling', slug: 'masonry-tiling', icon: 'Grid3x3', description: 'Masonry, tiling, and stone work' },
    { name: 'Pest Control', slug: 'pest-control', icon: 'Bug', description: 'Professional pest control and extermination' },
    { name: 'Home Cleaning', slug: 'home-cleaning', icon: 'Sparkles', description: 'Deep cleaning and regular home cleaning services' },
    { name: 'Water Tank Cleaning', slug: 'water-tank-cleaning', icon: 'Container', description: 'Water tank cleaning and sanitization' },
    { name: 'Appliance Repair', slug: 'appliance-repair', icon: 'Settings', description: 'Home appliance repair and servicing' },
    { name: 'Gadget Repair', slug: 'gadget-repair', icon: 'Smartphone', description: 'Mobile, tablet, and gadget repair' },
    { name: 'Lawn & Gardening', slug: 'lawn-gardening', icon: 'Flower2', description: 'Lawn maintenance and gardening services' },
    { name: 'Exterior Cleaning', slug: 'exterior-cleaning', icon: 'SprayCan', description: 'Exterior wall, driveway, and facade cleaning' },
    { name: 'Moving & Relocation', slug: 'moving-relocation', icon: 'Truck', description: 'Packing, moving, and relocation services' },
    { name: 'Salon for Women', slug: 'salon-women', icon: 'Scissors', description: 'At-home salon services for women' },
    { name: 'Barber for Men', slug: 'barber-men', icon: 'Scissors', description: 'At-home barber and grooming services for men' },
    { name: 'Massage & Spa', slug: 'massage-spa', icon: 'Heart', description: 'At-home massage and spa services' },
    { name: 'Fitness Training', slug: 'fitness-training', icon: 'Dumbbell', description: 'Personal fitness training at home' },
    { name: 'Home Tutoring', slug: 'home-tutoring', icon: 'GraduationCap', description: 'At-home academic tutoring and coaching' },
    { name: 'Event Planning', slug: 'event-planning', icon: 'PartyPopper', description: 'Event planning and management services' },
    { name: 'Photography & Video', slug: 'photography-video', icon: 'Camera', description: 'Professional photography and videography' },
    { name: 'Tailoring & Alteration', slug: 'tailoring-alteration', icon: 'PenTool', description: 'Custom tailoring and clothing alterations' },
    { name: 'Pet Care', slug: 'pet-care', icon: 'PawPrint', description: 'Pet grooming, walking, and veterinary care' },
    { name: 'Car Care', slug: 'car-care', icon: 'Car', description: 'Car washing, detailing, and maintenance' },
  ];

  const categories: Record<string, any> = {};
  for (let i = 0; i < categoryData.length; i++) {
    const cat = await db.serviceCategory.create({
      data: { ...categoryData[i], displayOrder: i + 1, isActive: true },
    });
    categories[cat.slug] = cat;
  }

  // ========================================
  // 3. SUBCATEGORIES (10+ per top 10 categories)
  // ========================================
  console.log('📁 Creating subcategories...');
  const subcategoryData: Record<string, Array<{ name: string; slug: string; description: string }>> = {
    'home-maintenance-repairs': [
      { name: 'Wall Crack Repair', slug: 'wall-crack-repair', description: 'Repair of wall cracks and plaster damage' },
      { name: 'Door & Window Repair', slug: 'door-window-repair', description: 'Door and window frame repair and alignment' },
      { name: 'Roof Leak Repair', slug: 'roof-leak-repair', description: 'Roof leak detection and waterproofing' },
      { name: 'Floor Repair', slug: 'floor-repair', description: 'Floor tile, marble, and wooden floor repair' },
      { name: 'Ceiling Repair', slug: 'ceiling-repair', description: 'False ceiling and POP ceiling repair' },
      { name: 'Gate & Fence Repair', slug: 'gate-fence-repair', description: 'Main gate and boundary fence repair' },
      { name: 'Lock & Latch Repair', slug: 'lock-latch-repair', description: 'Door lock and latch replacement and repair' },
      { name: 'Waterproofing', slug: 'waterproofing', description: 'Bathroom and terrace waterproofing' },
      { name: 'Grout & Sealant Work', slug: 'grout-sealant-work', description: 'Tile grouting and sealant application' },
      { name: 'General Home Inspection', slug: 'general-home-inspection', description: 'Complete home inspection and assessment' },
      { name: 'Termite Treatment', slug: 'termite-treatment', description: 'Pre and post construction anti-termite treatment' },
      { name: 'Wall Putty & Finishing', slug: 'wall-putty-finishing', description: 'Wall putty application and surface finishing' },
    ],
    'plumbing-services': [
      { name: 'Pipe Leakage Repair', slug: 'pipe-leakage-repair', description: 'Detection and repair of pipe leaks' },
      { name: 'Tap & Faucet Installation', slug: 'tap-faucet-installation', description: 'New tap and faucet installation' },
      { name: 'Water Heater Installation', slug: 'water-heater-installation', description: 'Geyser and water heater installation' },
      { name: 'Toilet Repair', slug: 'toilet-repair', description: 'Toilet flush, seat, and cistern repair' },
      { name: 'Drain Cleaning', slug: 'drain-cleaning', description: 'Blocked drain and sewer line cleaning' },
      { name: 'Bathroom Fittings', slug: 'bathroom-fittings', description: 'Shower, jet spray, and bathroom fitting installation' },
      { name: 'Water Pump Installation', slug: 'water-pump-installation', description: 'Motor and water pump installation and repair' },
      { name: 'Kitchen Sink Plumbing', slug: 'kitchen-sink-plumbing', description: 'Kitchen sink pipe and drain installation' },
      { name: 'Sewage Line Repair', slug: 'sewage-line-repair', description: 'Sewage pipe repair and replacement' },
      { name: 'RO & Water Purifier Installation', slug: 'ro-water-purifier-installation', description: 'RO system and water purifier setup' },
      { name: 'Overhead Tank Plumbing', slug: 'overhead-tank-plumbing', description: 'Overhead water tank pipe connections' },
    ],
    'electrical-services': [
      { name: 'Wiring & Rewiring', slug: 'wiring-rewiring', description: 'Complete house wiring and rewiring' },
      { name: 'Switch & Socket Installation', slug: 'switch-socket-installation', description: 'New switch and socket point installation' },
      { name: 'Ceiling Fan Installation', slug: 'ceiling-fan-installation', description: 'Ceiling fan mounting and wiring' },
      { name: 'MCB & DB Box Setup', slug: 'mcb-db-box-setup', description: 'Distribution board and MCB configuration' },
      { name: 'Inverter & UPS Installation', slug: 'inverter-ups-installation', description: 'Power backup system installation' },
      { name: 'Light Fixture Installation', slug: 'light-fixture-installation', description: 'Chandelier, tube light, and LED installation' },
      { name: 'CCTV Wiring', slug: 'cctv-wiring', description: 'Security camera wiring and setup' },
      { name: 'Electrical Safety Audit', slug: 'electrical-safety-audit', description: 'Home electrical safety inspection' },
      { name: 'Earthing & Grounding', slug: 'earthing-grounding', description: 'Proper earthing and grounding installation' },
      { name: 'Smart Home Wiring', slug: 'smart-home-wiring', description: 'Smart home automation wiring setup' },
      { name: 'Doorbell & Intercom', slug: 'doorbell-intercom', description: 'Doorbell and video intercom installation' },
    ],
    'ac-hvac-services': [
      { name: 'AC Installation', slug: 'ac-installation', description: 'Split and window AC installation' },
      { name: 'AC Repair & Troubleshooting', slug: 'ac-repair-troubleshooting', description: 'AC cooling issues and repair' },
      { name: 'AC Gas Refill', slug: 'ac-gas-refill', description: 'Refrigerant gas refill and leak fixing' },
      { name: 'AC Deep Cleaning', slug: 'ac-deep-cleaning', description: 'Foam wash and deep cleaning of AC units' },
      { name: 'AC Uninstallation', slug: 'ac-uninstallation', description: 'Safe AC unit removal and packing' },
      { name: 'AC Annual Maintenance', slug: 'ac-annual-maintenance', description: 'Annual service contract for AC maintenance' },
      { name: 'Central AC Servicing', slug: 'central-ac-servicing', description: 'Central air conditioning system service' },
      { name: 'Duct Cleaning', slug: 'duct-cleaning', description: 'HVAC duct cleaning and sanitization' },
      { name: 'Thermostat Repair', slug: 'thermostat-repair', description: 'AC thermostat replacement and calibration' },
      { name: 'Compressor Repair', slug: 'compressor-repair', description: 'AC compressor diagnosis and repair' },
      { name: 'HVAC System Design', slug: 'hvac-system-design', description: 'Custom HVAC system planning and installation' },
    ],
    'carpentry-woodwork': [
      { name: 'Modular Kitchen', slug: 'modular-kitchen', description: 'Custom modular kitchen design and installation' },
      { name: 'Wardrobe & Closet', slug: 'wardrobe-closet', description: 'Custom wardrobe and closet construction' },
      { name: 'Door & Frame Work', slug: 'door-frame-work', description: 'Wooden door and frame fabrication' },
      { name: 'Furniture Repair', slug: 'furniture-repair', description: 'Repair of wooden furniture and fixtures' },
      { name: 'TV Unit & Shelving', slug: 'tv-unit-shelving', description: 'Custom TV unit and wall shelving' },
      { name: 'Bookshelf & Storage', slug: 'bookshelf-storage', description: 'Custom bookshelf and storage solutions' },
      { name: 'Window Frame & Grill', slug: 'window-frame-grill', description: 'Wooden window frame work' },
      { name: 'False Ceiling Woodwork', slug: 'false-ceiling-woodwork', description: 'Wooden false ceiling and paneling' },
      { name: 'Pooja Room Design', slug: 'pooja-room-design', description: 'Custom pooja room and mandir woodwork' },
      { name: 'Flooring & Decking', slug: 'flooring-decking', description: 'Wooden flooring and deck installation' },
      { name: 'Study Table & Workstation', slug: 'study-table-workstation', description: 'Custom study table and home office workstation' },
    ],
    'painting-decoration': [
      { name: 'Interior Wall Painting', slug: 'interior-wall-painting', description: 'Interior wall painting and color consultation' },
      { name: 'Exterior Wall Painting', slug: 'exterior-wall-painting', description: 'Exterior wall painting and weatherproofing' },
      { name: 'Texture Painting', slug: 'texture-painting', description: 'Decorative texture and stucco painting' },
      { name: 'Wood Polish & Varnish', slug: 'wood-polish-varnish', description: 'Wood furniture and door polishing' },
      { name: 'Wallpaper Installation', slug: 'wallpaper-installation', description: 'Wallpaper selection and installation' },
      { name: 'Stenciling & Murals', slug: 'stenciling-murals', description: 'Custom wall stenciling and mural painting' },
      { name: 'Metal Paint & Anti-Rust', slug: 'metal-paint-anti-rust', description: 'Metal gate and grille painting' },
      { name: 'Waterproof Paint', slug: 'waterproof-paint', description: 'Waterproof coating for walls and roofs' },
      { name: 'Pop & Cornice Work', slug: 'pop-cornice-work', description: 'Plaster of Paris and decorative cornice work' },
      { name: 'Wall Putty & Primer', slug: 'wall-putty-primer', description: 'Wall surface preparation and priming' },
    ],
    'handyman-services': [
      { name: 'Furniture Assembly', slug: 'furniture-assembly', description: 'Flat-pack furniture assembly' },
      { name: 'Picture & Mirror Hanging', slug: 'picture-mirror-hanging', description: 'Wall mounting for pictures and mirrors' },
      { name: 'TV Wall Mounting', slug: 'tv-wall-mounting', description: 'TV bracket installation and cable management' },
      { name: 'Shelf Installation', slug: 'shelf-installation', description: 'Floating and wall shelf installation' },
      { name: 'Curtain Rod Installation', slug: 'curtain-rod-installation', description: 'Curtain rod and blind fitting' },
      { name: 'Small Repairs', slug: 'small-repairs', description: 'General small repair and fix-up jobs' },
      { name: 'Appliance Installation', slug: 'appliance-installation', description: 'Home appliance mounting and setup' },
      { name: 'Weather Stripping', slug: 'weather-stripping', description: 'Door and window weather stripping' },
      { name: 'Gutter Cleaning', slug: 'gutter-cleaning', description: 'Rain gutter cleaning and maintenance' },
      { name: 'Smoke Detector Installation', slug: 'smoke-detector-installation', description: 'Smoke and CO detector installation' },
    ],
    'masonry-tiling': [
      { name: 'Floor Tiling', slug: 'floor-tiling', description: 'Floor tile laying and grouting' },
      { name: 'Wall Tiling', slug: 'wall-tiling', description: 'Bathroom and kitchen wall tiling' },
      { name: 'Marble & Granite Work', slug: 'marble-granite-work', description: 'Marble and granite flooring and countertops' },
      { name: 'Brick Work', slug: 'brick-work', description: 'Brick wall construction and repair' },
      { name: 'Plastering', slug: 'plastering', description: 'Wall plastering and finishing' },
      { name: 'Concrete Work', slug: 'concrete-work', description: 'Concrete pouring and finishing' },
      { name: 'Kitchen Counter Tiling', slug: 'kitchen-counter-tiling', description: 'Kitchen countertop tiling and backsplash' },
      { name: 'Bathroom Renovation', slug: 'bathroom-renovation', description: 'Complete bathroom tile renovation' },
      { name: 'Grout Replacement', slug: 'grout-replacement', description: 'Old grout removal and replacement' },
      { name: 'Stone Cladding', slug: 'stone-cladding', description: 'Natural stone wall cladding' },
    ],
    'pest-control': [
      { name: 'Cockroach Control', slug: 'cockroach-control', description: 'Complete cockroach extermination and prevention' },
      { name: 'Termite Control', slug: 'termite-control', description: 'Anti-termite treatment and protection' },
      { name: 'Mosquito Control', slug: 'mosquito-control', description: 'Mosquito fogging and larvicide treatment' },
      { name: 'Bed Bug Treatment', slug: 'bed-bug-treatment', description: 'Bed bug heat treatment and chemical control' },
      { name: 'Rodent Control', slug: 'rodent-control', description: 'Rat and mice trapping and extermination' },
      { name: 'Ant Control', slug: 'ant-control', description: 'Ant infestation treatment and barrier' },
      { name: 'Spider Control', slug: 'spider-control', description: 'Spider removal and web cleaning' },
      { name: 'Flea & Tick Control', slug: 'flea-tick-control', description: 'Pet area flea and tick treatment' },
      { name: 'Lizard Control', slug: 'lizard-control', description: 'Lizard repellent and removal' },
      { name: 'Annual Pest Contract', slug: 'annual-pest-contract', description: 'Year-round pest control maintenance' },
      { name: 'Commercial Pest Control', slug: 'commercial-pest-control', description: 'Office and commercial space pest management' },
    ],
    'home-cleaning': [
      { name: 'Deep Home Cleaning', slug: 'deep-home-cleaning', description: 'Complete deep cleaning of entire home' },
      { name: 'Kitchen Deep Cleaning', slug: 'kitchen-deep-cleaning', description: 'Kitchen chimney, cabinet, and surface cleaning' },
      { name: 'Bathroom Deep Cleaning', slug: 'bathroom-deep-cleaning', description: 'Bathroom tile, fixture, and sanitization' },
      { name: 'Sofa & Carpet Cleaning', slug: 'sofa-carpet-cleaning', description: 'Sofa shampooing and carpet deep clean' },
      { name: 'Move-In Cleaning', slug: 'move-in-cleaning', description: 'Pre-move-in deep cleaning service' },
      { name: 'Post-Construction Cleaning', slug: 'post-construction-cleaning', description: 'After renovation debris and dust cleaning' },
      { name: 'Window & Glass Cleaning', slug: 'window-glass-cleaning', description: 'Interior and exterior window cleaning' },
      { name: 'Regular Housekeeping', slug: 'regular-housekeeping', description: 'Daily or weekly housekeeping service' },
      { name: 'Mattress Cleaning', slug: 'mattress-cleaning', description: 'Mattress deep cleaning and sanitization' },
      { name: 'Office Cleaning', slug: 'office-cleaning', description: 'Commercial office cleaning service' },
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
  // 7. SAMPLE SERVICES (18 services across categories)
  // ========================================
  console.log('🔧 Creating sample services...');
  const serviceData = [
    // Rajesh Kumar - Delhi provider
    {
      providerId: providers[0].id,
      categoryId: categories['plumbing-services'].id,
      subcategoryId: subcategories['plumbing-services']?.[0]?.id,
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
      providerId: providers[0].id,
      categoryId: categories['electrical-services'].id,
      subcategoryId: subcategories['electrical-services']?.[1]?.id,
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
      providerId: providers[0].id,
      categoryId: categories['home-maintenance-repairs'].id,
      subcategoryId: subcategories['home-maintenance-repairs']?.[0]?.id,
      title: 'Wall Crack & Plaster Repair Service',
      description: 'Complete wall crack repair service including plaster damage restoration. Professional technicians use quality materials for long-lasting repairs. Includes surface preparation, crack filling, and finishing.',
      basePrice: 599,
      priceNegotiable: true,
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
    // Priya Sharma - Mumbai provider
    {
      providerId: providers[1].id,
      categoryId: categories['home-cleaning'].id,
      subcategoryId: subcategories['home-cleaning']?.[0]?.id,
      title: 'Deep Home Cleaning - Complete House',
      description: 'Thorough deep cleaning service for your entire home. Includes kitchen, bathrooms, bedrooms, living area, and balconies. We use eco-friendly cleaning products and professional-grade equipment. Service covers dusting, mopping, scrubbing, and sanitization.',
      basePrice: 2499,
      priceNegotiable: false,
      serviceDurationMinutes: 240,
      serviceAreaRadiusKm: 25,
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
      categoryId: categories['salon-women'].id,
      title: 'At-Home Salon Service for Women',
      description: 'Complete salon experience at your doorstep. Includes haircut, facial, manicure, pedicure, waxing, and threading. Professional beautician with premium products. Relax in the comfort of your home.',
      basePrice: 1499,
      priceNegotiable: false,
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
      categoryId: categories['painting-decoration'].id,
      subcategoryId: subcategories['painting-decoration']?.[0]?.id,
      title: 'Interior Wall Painting - Professional Finish',
      description: 'Transform your home with professional interior painting. Includes surface preparation, putty, primer, and two coats of premium emulsion paint. Color consultation available. We protect your furniture and ensure a clean workspace.',
      basePrice: 3999,
      priceNegotiable: true,
      serviceDurationMinutes: 480,
      serviceAreaRadiusKm: 25,
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      address: '12, Andheri West, Mumbai',
      pincode: '400051',
      latitude: 19.1197,
      longitude: 72.8464,
    },
    // Arun Patel - Bengaluru provider
    {
      providerId: providers[2].id,
      categoryId: categories['ac-hvac-services'].id,
      subcategoryId: subcategories['ac-hvac-services']?.[0]?.id,
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
      pincode: '560034',
      latitude: 12.9352,
      longitude: 77.6245,
    },
    {
      providerId: providers[2].id,
      categoryId: categories['ac-hvac-services'].id,
      subcategoryId: subcategories['ac-hvac-services']?.[2]?.id,
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
      pincode: '560034',
      latitude: 12.9352,
      longitude: 77.6245,
    },
    {
      providerId: providers[2].id,
      categoryId: categories['pest-control'].id,
      subcategoryId: subcategories['pest-control']?.[0]?.id,
      title: 'Cockroach Control - Complete Extermination',
      description: 'Professional cockroach control using safe, herbal-based chemicals. Includes kitchen, bathroom, and all affected areas treatment. 3-month warranty with follow-up visit. Safe for children and pets.',
      basePrice: 999,
      priceNegotiable: false,
      serviceDurationMinutes: 60,
      serviceAreaRadiusKm: 25,
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      address: '78, Koramangala, Bengaluru',
      pincode: '560034',
      latitude: 12.9352,
      longitude: 77.6245,
    },
    // More services across various categories
    {
      providerId: providers[0].id,
      categoryId: categories['carpentry-woodwork'].id,
      subcategoryId: subcategories['carpentry-woodwork']?.[0]?.id,
      title: 'Modular Kitchen Design & Installation',
      description: 'Custom modular kitchen design, fabrication, and installation. Wide range of finishes and accessories. Includes 3D design consultation, material selection, and professional installation with 5-year warranty.',
      basePrice: 49999,
      priceNegotiable: true,
      serviceDurationMinutes: 480,
      serviceAreaRadiusKm: 30,
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
      categoryId: categories['massage-spa'].id,
      title: 'Full Body Massage & Relaxation Therapy',
      description: 'Professional at-home full body massage service. Choose from Swedish, Deep Tissue, or Aromatherapy massage. Certified therapist brings all equipment and oils. 60 or 90 minute sessions available.',
      basePrice: 1799,
      priceNegotiable: false,
      serviceDurationMinutes: 90,
      serviceAreaRadiusKm: 15,
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      address: '12, Andheri West, Mumbai',
      pincode: '400051',
      latitude: 19.1197,
      longitude: 72.8464,
    },
    {
      providerId: providers[2].id,
      categoryId: categories['appliance-repair'].id,
      title: 'Washing Machine Repair & Service',
      description: 'Expert repair for all types of washing machines - top load, front load, and semi-automatic. Diagnosis, spare parts replacement, and testing included. We service all major brands.',
      basePrice: 399,
      priceNegotiable: true,
      serviceDurationMinutes: 60,
      serviceAreaRadiusKm: 15,
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      address: '78, Koramangala, Bengaluru',
      pincode: '560034',
      latitude: 12.9352,
      longitude: 77.6245,
    },
    {
      providerId: providers[0].id,
      categoryId: categories['moving-relocation'].id,
      title: 'Home Relocation & Packing Service',
      description: 'Complete home shifting service including packing, loading, transportation, and unpacking. Professional team with quality packing materials. Insurance coverage available. Local and intercity moves.',
      basePrice: 5999,
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
      providerId: providers[1].id,
      categoryId: categories['fitness-training'].id,
      title: 'Personal Fitness Training at Home',
      description: 'Certified personal trainer for home workouts. Customized fitness plans including weight training, cardio, and yoga. Suitable for all fitness levels. Monthly packages available.',
      basePrice: 799,
      priceNegotiable: false,
      serviceDurationMinutes: 60,
      serviceAreaRadiusKm: 10,
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      address: '12, Andheri West, Mumbai',
      pincode: '400051',
      latitude: 19.1197,
      longitude: 72.8464,
    },
    {
      providerId: providers[2].id,
      categoryId: categories['photography-video'].id,
      title: 'Professional Event Photography',
      description: 'Professional photography for events, parties, and celebrations. Includes candid and traditional shots. High-resolution images delivered via cloud within 7 days. Album design available at extra cost.',
      basePrice: 4999,
      priceNegotiable: true,
      serviceDurationMinutes: 360,
      serviceAreaRadiusKm: 30,
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      address: '78, Koramangala, Bengaluru',
      pincode: '560034',
      latitude: 12.9352,
      longitude: 77.6245,
    },
    {
      providerId: providers[0].id,
      categoryId: categories['handyman-services'].id,
      subcategoryId: subcategories['handyman-services']?.[2]?.id,
      title: 'TV Wall Mounting & Installation',
      description: 'Professional TV wall mounting service. Includes bracket installation, cable management, and TV setup. We mount all TV sizes from 32" to 75". Hidden cable routing available for an extra charge.',
      basePrice: 499,
      priceNegotiable: false,
      serviceDurationMinutes: 45,
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
      categoryId: categories['pet-care'].id,
      title: 'Pet Grooming at Home',
      description: 'Professional pet grooming service at your doorstep. Includes bathing, hair trimming, nail clipping, ear cleaning, and teeth brushing. Experienced groomers handle dogs and cats of all breeds.',
      basePrice: 899,
      priceNegotiable: false,
      serviceDurationMinutes: 90,
      serviceAreaRadiusKm: 15,
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      address: '12, Andheri West, Mumbai',
      pincode: '400051',
      latitude: 19.1197,
      longitude: 72.8464,
    },
    {
      providerId: providers[2].id,
      categoryId: categories['car-care'].id,
      title: 'Car Detailing & Deep Clean',
      description: 'Premium car detailing service at your doorstep. Includes exterior wash, clay bar treatment, wax coating, interior vacuuming, dashboard polish, and seat cleaning. Ceramic coating available at extra cost.',
      basePrice: 2499,
      priceNegotiable: true,
      serviceDurationMinutes: 180,
      serviceAreaRadiusKm: 15,
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      address: '78, Koramangala, Bengaluru',
      pincode: '560034',
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
  // 8. SAMPLE BOOKINGS (12 bookings in various states)
  // ========================================
  console.log('📝 Creating sample bookings...');
  const bookingStatuses = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'CANCELLED', 'CANCELLED', 'PENDING', 'ACCEPTED'];
  const bookings: any[] = [];

  const bookingDataList = [
    { clientId: clients[0].id, providerId: providers[0].id, serviceId: services[0].id, scheduledDate: '2025-07-10', scheduledTime: '10:00', serviceAddress: '23, Banjara Hills, Hyderabad', basePrice: 499, finalPrice: 499, status: 'COMPLETED', paymentStatus: 'PAID', completedAt: new Date('2025-07-10T11:30:00') },
    { clientId: clients[1].id, providerId: providers[1].id, serviceId: services[3].id, scheduledDate: '2025-07-12', scheduledTime: '09:00', serviceAddress: '56, Koregaon Park, Pune', basePrice: 2499, finalPrice: 2499, status: 'COMPLETED', paymentStatus: 'PAID', completedAt: new Date('2025-07-12T13:30:00') },
    { clientId: clients[2].id, providerId: providers[2].id, serviceId: services[6].id, scheduledDate: '2025-07-15', scheduledTime: '11:00', serviceAddress: '89, T. Nagar, Chennai', basePrice: 1299, finalPrice: 1299, status: 'COMPLETED', paymentStatus: 'PAID', completedAt: new Date('2025-07-15T13:00:00') },
    { clientId: clients[3].id, providerId: providers[0].id, serviceId: services[1].id, scheduledDate: '2025-07-18', scheduledTime: '14:00', serviceAddress: '34, Whitefield, Bengaluru', basePrice: 299, finalPrice: 299, status: 'COMPLETED', paymentStatus: 'PAID', completedAt: new Date('2025-07-18T15:00:00') },
    { clientId: clients[0].id, providerId: providers[2].id, serviceId: services[8].id, scheduledDate: '2025-07-20', scheduledTime: '10:00', serviceAddress: '23, Banjara Hills, Hyderabad', basePrice: 999, finalPrice: 999, status: 'COMPLETED', paymentStatus: 'PAID', completedAt: new Date('2025-07-20T11:00:00') },
    { clientId: clients[1].id, providerId: providers[1].id, serviceId: services[4].id, scheduledDate: '2025-07-25', scheduledTime: '10:00', serviceAddress: '56, Koregaon Park, Pune', basePrice: 1499, finalPrice: 1499, status: 'COMPLETED', paymentStatus: 'PAID', completedAt: new Date('2025-07-25T13:00:00') },
    { clientId: clients[3].id, providerId: providers[2].id, serviceId: services[7].id, scheduledDate: '2025-08-01', scheduledTime: '15:00', serviceAddress: '34, Whitefield, Bengaluru', basePrice: 1899, finalPrice: 1899, status: 'COMPLETED', paymentStatus: 'PAID', completedAt: new Date('2025-08-01T16:30:00') },
    { clientId: clients[0].id, providerId: providers[1].id, serviceId: services[10].id, scheduledDate: '2025-08-05', scheduledTime: '09:00', serviceAddress: '23, Banjara Hills, Hyderabad', basePrice: 1799, finalPrice: 1799, status: 'COMPLETED', paymentStatus: 'PAID', completedAt: new Date('2025-08-05T10:30:00') },
    { clientId: clients[0].id, providerId: providers[0].id, serviceId: services[15].id, scheduledDate: '2025-08-10', scheduledTime: '11:00', serviceAddress: '23, Banjara Hills, Hyderabad', basePrice: 499, finalPrice: 499, status: 'PENDING', paymentStatus: 'PENDING' },
    { clientId: clients[1].id, providerId: providers[2].id, serviceId: services[11].id, scheduledDate: '2025-08-12', scheduledTime: '14:00', serviceAddress: '56, Koregaon Park, Pune', basePrice: 399, finalPrice: 399, status: 'ACCEPTED', paymentStatus: 'PAID' },
    { clientId: clients[3].id, providerId: providers[0].id, serviceId: services[12].id, scheduledDate: '2025-08-15', scheduledTime: '08:00', serviceAddress: '34, Whitefield, Bengaluru', basePrice: 5999, negotiatedPrice: 5499, finalPrice: 5499, status: 'IN_PROGRESS', paymentStatus: 'PAID' },
    { clientId: clients[4].id, providerId: providers[1].id, serviceId: services[5].id, scheduledDate: '2025-07-22', scheduledTime: '09:00', serviceAddress: '67, Malviya Nagar, Jaipur', basePrice: 3999, finalPrice: 3999, status: 'CANCELLED', paymentStatus: 'REFUNDED', cancellationReason: 'Schedule conflict - provider unavailable', cancelledBy: providers[1].id, cancelledAt: new Date('2025-07-21T18:00:00') },
    { clientId: clients[2].id, providerId: providers[2].id, serviceId: services[13].id, scheduledDate: '2025-07-28', scheduledTime: '07:00', serviceAddress: '89, T. Nagar, Chennai', basePrice: 799, finalPrice: 799, status: 'CANCELLED', paymentStatus: 'REFUNDED', cancellationReason: 'Changed my mind', cancelledBy: clients[2].id, cancelledAt: new Date('2025-07-27T20:00:00') },
    { clientId: clients[0].id, providerId: providers[2].id, serviceId: services[17].id, scheduledDate: '2025-08-18', scheduledTime: '10:00', serviceAddress: '23, Banjara Hills, Hyderabad', basePrice: 2499, finalPrice: 2499, status: 'PENDING', paymentStatus: 'PENDING' },
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
  // 9. SAMPLE REVIEWS (9 reviews for completed bookings)
  // ========================================
  console.log('⭐ Creating sample reviews...');
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  const reviewData = [
    { rating: 5, comment: 'Excellent work! The plumber was very professional and fixed the leakage in no time. Highly recommended.' },
    { rating: 4, comment: 'Good cleaning service. The team was punctual and thorough. Only giving 4 stars because they were slightly late arriving.' },
    { rating: 5, comment: 'Perfect AC installation! Very neat work with proper copper piping and drainage. The technician was knowledgeable and friendly.' },
    { rating: 4, comment: 'Good electrical work. Switch installation was done properly. Would recommend for basic electrical needs.' },
    { rating: 5, comment: 'The pest control service was extremely effective. No cockroach sightings since the treatment. 3-month warranty gives peace of mind.' },
    { rating: 4, comment: 'Wonderful salon experience at home. The beautician was skilled and used quality products. Will book again!' },
    { rating: 3, comment: 'AC gas refill was okay but took longer than expected. Cooling improved but not as much as I hoped.' },
    { rating: 5, comment: 'Amazing massage therapy! The therapist was well-trained and the oils used were premium quality. Very relaxing experience.' },
    { rating: 4, comment: 'Great modular kitchen work. The design was exactly as discussed. Minor delays in installation but overall satisfied.' },
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
  // 10. FAQs (22 FAQs across categories)
  // ========================================
  console.log('❓ Creating FAQs...');
  const faqData = [
    // General
    { category: 'General', question: 'What is BookYourService?', answer: 'BookYourService is India\'s leading online marketplace connecting customers with verified service providers for home services, beauty, maintenance, and more. We ensure quality, reliability, and transparent pricing for every booking.', displayOrder: 1 },
    { category: 'General', question: 'Which cities does BookYourService operate in?', answer: 'We currently operate in major Indian cities including Delhi, Mumbai, Bengaluru, Hyderabad, Pune, Chennai, Jaipur, Kolkata, and expanding rapidly. Enter your pincode on the homepage to check availability in your area.', displayOrder: 2 },
    { category: 'General', question: 'How do I book a service?', answer: 'Simply browse categories or search for a service, select your preferred provider, choose a date and time, and confirm your booking. You can also call our helpline for assistance with booking.', displayOrder: 3 },
    { category: 'General', question: 'Are the service providers verified?', answer: 'Yes, all service providers on BookYourService undergo a rigorous KYC verification process including identity verification (Aadhaar/PAN), address verification, skill assessment, and background checks before being listed on our platform.', displayOrder: 4 },
    { category: 'General', question: 'What services are available on BookYourService?', answer: 'We offer 25+ categories of services including home maintenance, plumbing, electrical, AC repair, cleaning, beauty, fitness, photography, pet care, car care, and many more. Each category has multiple sub-services to choose from.', displayOrder: 5 },
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
"Services" refers to the home and personal services listed on the platform.

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
  // 12. REVENUE STREAMS (55 revenue streams)
  // ========================================
  console.log('💰 Creating revenue streams...');
  const revenueStreamData = [
    // Commission-based
    { streamType: 'Booking Commission', description: 'Percentage commission on each completed booking', revenueModel: 'COMMISSION', estimatedMonthlyRevenue: 500000 },
    { streamType: 'Premium Provider Commission', description: 'Reduced commission rate for premium plan providers', revenueModel: 'COMMISSION', estimatedMonthlyRevenue: 200000 },
    { streamType: 'Category-specific Commission', description: 'Higher commission for premium service categories', revenueModel: 'COMMISSION', estimatedMonthlyRevenue: 150000 },
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
    { streamType: 'Insurance Add-on', description: 'Service insurance for high-value bookings', revenueModel: 'PREMIUM', estimatedMonthlyRevenue: 25000 },
    { streamType: 'VIP Support', description: 'Dedicated customer support for premium users', revenueModel: 'PREMIUM', estimatedMonthlyRevenue: 20000 },
    { streamType: 'Detailed Service Report', description: 'Comprehensive post-service report with photos', revenueModel: 'PREMIUM', estimatedMonthlyRevenue: 15000 },
    { streamType: 'Scheduled Maintenance Plan', description: 'Prepaid recurring maintenance service plans', revenueModel: 'PREMIUM', estimatedMonthlyRevenue: 75000 },

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
    { streamType: 'Service Package Deals', description: 'Revenue from bundled service packages', revenueModel: 'COMMISSION', estimatedMonthlyRevenue: 90000 },
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
      title: 'BookYourService - Book Home Services Online in India',
      description: 'Book trusted home services online. Plumbing, electrical, cleaning, AC repair, beauty, and 25+ categories. Verified providers, transparent pricing, and guaranteed satisfaction.',
      keywords: 'home services, book service online, plumbing, electrical, cleaning, AC repair, beauty services, India',
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
      description: 'Browse 25+ service categories on BookYourService. Home maintenance, beauty, fitness, events, and more. Book trusted professionals near you.',
      keywords: 'all services, service categories, home services India, book professional',
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
      description: 'Learn about BookYourService, India\'s leading online marketplace connecting customers with verified service providers for home and personal services.',
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

  // Notifications for client Anita Desai
  const notificationData = [
    { userId: clients[0].id, type: 'BOOKING_CONFIRMED', title: 'Booking Confirmed', message: 'Your booking for Pipe Leakage Repair has been confirmed for July 10, 2025 at 10:00 AM.', actionUrl: '/bookings/1', isRead: true },
    { userId: clients[0].id, type: 'SERVICE_COMPLETED', title: 'Service Completed', message: 'Your Pipe Leakage Repair service has been completed. Please rate your experience!', actionUrl: '/bookings/1/review', isRead: true },
    { userId: clients[0].id, type: 'BOOKING_PENDING', title: 'Booking Pending', message: 'Your booking for TV Wall Mounting is awaiting provider confirmation.', actionUrl: '/bookings/9', isRead: false },
    { userId: clients[0].id, type: 'PROMO', title: 'Special Offer!', message: 'Get 20% off on all cleaning services this weekend. Use code CLEAN20 at checkout!', isRead: false },

    { userId: clients[1].id, type: 'BOOKING_CONFIRMED', title: 'Booking Confirmed', message: 'Your Deep Home Cleaning service has been confirmed for July 12, 2025.', actionUrl: '/bookings/2', isRead: true },
    { userId: clients[1].id, type: 'PAYMENT_SUCCESS', title: 'Payment Successful', message: 'Payment of ₹399 has been successfully processed for your Washing Machine Repair booking.', isRead: false },
    { userId: clients[1].id, type: 'REVIEW_REMINDER', title: 'Rate Your Experience', message: 'You recently completed a Deep Home Cleaning. Share your feedback!', isRead: false },

    { userId: clients[2].id, type: 'BOOKING_CANCELLED', title: 'Booking Cancelled', message: 'Your Fitness Training booking has been cancelled. Refund will be processed in 5-7 days.', isRead: true },
    { userId: clients[2].id, type: 'VERIFICATION', title: 'Email Verification', message: 'Please verify your email address to access all features of your account.', actionUrl: '/verify-email', isRead: false },

    { userId: clients[3].id, type: 'BOOKING_CONFIRMED', title: 'Booking Confirmed', message: 'Your Switch & Socket Installation service has been confirmed.', isRead: true },
    { userId: clients[3].id, type: 'BOOKING_IN_PROGRESS', title: 'Service In Progress', message: 'Your Home Relocation service is currently in progress. Track your provider!', actionUrl: '/bookings/11', isRead: false },

    { userId: providers[0].id, type: 'NEW_BOOKING', title: 'New Booking Request', message: 'You have a new booking request for TV Wall Mounting on August 10, 2025.', actionUrl: '/provider/bookings', isRead: false },
    { userId: providers[0].id, type: 'PAYMENT_RECEIVED', title: 'Payment Received', message: '₹474 has been credited to your account for the Pipe Leakage Repair service.', isRead: true },
    { userId: providers[0].id, type: 'NEW_REVIEW', title: 'New Review', message: 'Anita Desai left a 5-star review for your Pipe Leakage Repair service!', isRead: true },

    { userId: providers[1].id, type: 'NEW_BOOKING', title: 'New Booking Request', message: 'New booking for Washing Machine Repair service on August 12, 2025.', isRead: false },
    { userId: providers[1].id, type: 'PAYMENT_RECEIVED', title: 'Payment Received', message: '₹2,374 has been credited for the Deep Home Cleaning service.', isRead: true },
    { userId: providers[1].id, type: 'KYC_APPROVED', title: 'KYC Approved', message: 'Your KYC verification has been approved. You can now list services on the platform.', isRead: true },

    { userId: providers[2].id, type: 'NEW_BOOKING', title: 'New Booking Request', message: 'New booking for Car Detailing service on August 18, 2025.', isRead: false },
    { userId: providers[2].id, type: 'PAYMENT_RECEIVED', title: 'Payment Received', message: '₹1,234 has been credited for the AC Installation service.', isRead: true },
    { userId: providers[2].id, type: 'BOOKING_CANCELLED', title: 'Booking Cancelled by Client', message: 'Your Fitness Training booking was cancelled by the client. No action required.', isRead: true },

    { userId: admin.id, type: 'NEW_PROVIDER_SIGNUP', title: 'New Provider Registration', message: 'A new provider has registered and is pending KYC verification.', isRead: false },
    { userId: admin.id, type: 'DISPUTE_RAISED', title: 'New Dispute', message: 'A new dispute has been raised for booking BYS-1001. Review required.', isRead: false },
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
    { adminId: admin.id, action: 'APPROVE_SERVICE', targetType: 'SERVICE', details: JSON.stringify({ serviceName: 'Professional Pipe Leakage Repair' }) },
    { adminId: admin.id, action: 'APPROVE_SERVICE', targetType: 'SERVICE', details: JSON.stringify({ serviceName: 'Deep Home Cleaning' }) },
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
    { userId: clients[0].id, serviceId: services[3].id },
    { userId: clients[0].id, serviceId: services[6].id },
    { userId: clients[1].id, serviceId: services[0].id },
    { userId: clients[1].id, serviceId: services[10].id },
    { userId: clients[3].id, serviceId: services[7].id },
    { userId: clients[3].id, serviceId: services[17].id },
  ];

  for (const fav of favoriteData) {
    await db.favorite.create({ data: fav });
  }

  // ========================================
  // CONTACT MESSAGES
  // ========================================
  console.log('📩 Creating sample contact messages...');
  const contactMessages = [
    { name: 'Rahul Verma', email: 'rahul.verma@gmail.com', subject: 'Partnership Inquiry', message: 'I run a chain of salons in Delhi NCR and would like to explore listing our services on BookYourService. Please share the partnership details and onboarding process.', isRead: true },
    { name: 'Sunita Devi', email: 'sunita.devi@gmail.com', subject: 'Service Not Satisfactory', message: 'I booked a deep cleaning service on July 12th but the cleaning was not up to the mark. The bathroom was not cleaned properly and there were areas that were completely missed. I would like to raise a complaint.', isRead: false },
    { name: 'Amitabh Patel', email: 'amitabh.p@corporate.com', subject: 'Corporate Account Setup', message: 'We are a company with 500+ employees looking for corporate service packages for home maintenance. Can you provide bulk booking options and corporate pricing?', isRead: false },
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
