import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

const db = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean up existing data (order matters due to relations)
  // Child tables first, then parent tables to respect foreign key constraints
  console.log('🧹 Cleaning existing data...');
  // Leaf/child tables (no dependent records)
  await db.inventoryUsage.deleteMany();
  await db.couponUsage.deleteMany();
  await db.aMCSReminder.deleteMany();
  await db.franchiseAnalytics.deleteMany();
  await db.franchiseVendor.deleteMany();
  await db.workPhoto.deleteMany();
  await db.bookingTimeline.deleteMany();
  await db.bookingTracking.deleteMany();
  await db.disputeMessage.deleteMany();
  await db.followUp.deleteMany();
  await db.cRMActivity.deleteMany();
  await db.referralReward.deleteMany();
  await db.notification.deleteMany();
  await db.favorite.deleteMany();
  await db.complaintEscalation.deleteMany();
  await db.adminAction.deleteMany();
  await db.auditLog.deleteMany();
  await db.analyticsSnapshot.deleteMany();
  await db.notificationTemplate.deleteMany();
  await db.liveTechnicianLocation.deleteMany();
  await db.serviceArea.deleteMany();
  await db.payoutRequest.deleteMany();
  await db.invoice.deleteMany();
  await db.walletTransaction.deleteMany();
  await db.wallet.deleteMany();
  // Booking-dependent tables
  await db.dispute.deleteMany();
  await db.negotiation.deleteMany();
  await db.review.deleteMany();
  await db.payment.deleteMany();
  await db.referral.deleteMany();
  await db.coupon.deleteMany();
  await db.aMCSubscription.deleteMany();
  await db.b2BContract.deleteMany();
  await db.inventoryItem.deleteMany();
  // Booking itself
  await db.booking.deleteMany();
  // Service-dependent tables
  await db.serviceAvailability.deleteMany();
  await db.service.deleteMany();
  await db.serviceSubcategory.deleteMany();
  await db.pricingRule.deleteMany();
  await db.aMCPlan.deleteMany();
  await db.serviceCategory.deleteMany();
  // User-dependent tables
  await db.adminLog.deleteMany();
  await db.providerKyc.deleteMany();
  await db.technicianProfile.deleteMany();
  await db.franchise.deleteMany();
  await db.user.deleteMany();
  await db.role.deleteMany();
  // Independent/static tables
  await db.faq.deleteMany();
  await db.legalPage.deleteMany();
  await db.seoMetadata.deleteMany();
  await db.revenueStream.deleteMany();
  await db.contactMessage.deleteMany();
  await db.visitorSession.deleteMany();
  await db.platformStats.deleteMany();
  await db.city.deleteMany();

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
  const technicianRole = await db.role.create({
    data: { name: 'TECHNICIAN', description: 'Field technician who performs service tasks' },
  });
  const vendorRole = await db.role.create({
    data: { name: 'VENDOR', description: 'Parts and equipment vendor supplying the platform' },
  });
  const franchiseRole = await db.role.create({
    data: { name: 'FRANCHISE', description: 'Franchise owner operating in a specific territory' },
  });
  const subAdminRole = await db.role.create({
    data: { name: 'SUB_ADMIN', description: 'Sub-administrator with limited admin privileges' },
  });
  const areaManagerRole = await db.role.create({
    data: { name: 'AREA_MANAGER', description: 'Manages providers and operations in a geographic area' },
  });
  const managerRole = await db.role.create({
    data: { name: 'MANAGER', description: 'City-level manager overseeing multiple area managers' },
  });
  const localAdminRole = await db.role.create({
    data: { name: 'LOCAL_ADMIN', description: 'Local administrator for a specific zone or branch' },
  });

  console.log(`📋 Roles created: CLIENT(${clientRole.id}), PROVIDER(${providerRole.id}), ADMIN(${adminRole.id}), TECHNICIAN(${technicianRole.id}), VENDOR(${vendorRole.id}), FRANCHISE(${franchiseRole.id}), SUB_ADMIN(${subAdminRole.id}), AREA_MANAGER(${areaManagerRole.id}), MANAGER(${managerRole.id}), LOCAL_ADMIN(${localAdminRole.id})`);

  // ========================================
  // 2. SERVICE CATEGORIES (11 categories)
  // ========================================
  console.log('📂 Creating service categories...');
  const categoryData = [
    { name: 'Air Conditioner', slug: 'air-conditioner', icon: 'Wind', imageUrl: '/images/air-conditioner.jpg', description: 'Professional AC repair, installation, and maintenance services for your home' },
    { name: 'Refrigerator', slug: 'refrigerator', icon: 'Snowflake', imageUrl: '/images/refrigerator.jpg', description: 'Expert refrigerator repair and servicing for all brands and models' },
    { name: 'Washing Machine', slug: 'washing-machine', icon: 'WashingMachine', imageUrl: '/images/washing-machine.jpg', description: 'Washing machine repair, installation, and maintenance services' },
    { name: 'Kitchen Appliances', slug: 'kitchen-appliances', icon: 'ChefHat', imageUrl: '/images/kitchen-appliances.jpg', description: 'Repair and servicing for all kitchen appliances including microwave, chimney, and dishwasher' },
    { name: 'TV Repair', slug: 'tv-repair', icon: 'Tv', imageUrl: '/images/tv-repair.jpg', description: 'LED, LCD, and smart TV repair and installation services' },
    { name: 'Water Purifier', slug: 'water-purifier', icon: 'Droplets', imageUrl: '/images/water-purifier.jpg', description: 'RO, UV, and UF water purifier installation, repair, and maintenance services' },
    { name: 'Geyser', slug: 'geyser', icon: 'Flame', imageUrl: '/images/geyser.jpg', description: 'Water geyser and heater repair, installation, and servicing' },
    { name: 'Plumber', slug: 'plumber', icon: 'Wrench', imageUrl: '/images/plumber.jpg', description: 'Professional plumbing services for leaks, pipes, drains, and fixtures' },
    { name: 'Electrician', slug: 'electrician', icon: 'Zap', imageUrl: '/images/electrician.jpg', description: 'Licensed electrical services for wiring, fixtures, and safety' },
    { name: 'Water Tank Cleaning', slug: 'water-tank-cleaning', icon: 'Droplet', imageUrl: '/images/water-tank-cleaning.jpg', description: 'Professional water tank cleaning and sanitization services' },
    { name: 'Movers and Packers', slug: 'movers-and-packers', icon: 'Truck', imageUrl: '/images/movers-and-packers.jpg', description: 'Reliable packing, moving, and relocation services for homes and offices' },
  ];

  const categories: Record<string, any> = {};
  for (let i = 0; i < categoryData.length; i++) {
    const cat = await db.serviceCategory.create({
      data: { ...categoryData[i], displayOrder: i + 1, isActive: true },
    });
    categories[cat.slug] = cat;
  }

  // ========================================
  // 3. SUBCATEGORIES (3-5 per category)
  // ========================================
  console.log('📁 Creating subcategories...');
  const subcategoryData: Record<string, Array<{ name: string; slug: string; description: string }>> = {
    'air-conditioner': [
      { name: 'AC Installation', slug: 'ac-installation', description: 'Split and window AC installation services' },
      { name: 'AC Repair', slug: 'ac-repair', description: 'AC cooling issues, troubleshooting, and repair' },
      { name: 'AC Servicing', slug: 'ac-servicing', description: 'Foam wash, deep cleaning, and regular AC servicing' },
      { name: 'Gas Refilling', slug: 'gas-refilling', description: 'Refrigerant gas refill and leak fixing services' },
      { name: 'AC Uninstallation', slug: 'ac-uninstallation', description: 'Safe removal and uninstallation of AC units' },
    ],
    'refrigerator': [
      { name: 'Fridge Repair', slug: 'fridge-repair', description: 'Refrigerator cooling issues and compressor repair' },
      { name: 'Fridge Servicing', slug: 'fridge-servicing', description: 'Regular maintenance and deep cleaning of refrigerators' },
      { name: 'Gas Refilling', slug: 'gas-refilling', description: 'Refrigerant gas refill for refrigerators' },
      { name: 'Fridge Installation', slug: 'fridge-installation', description: 'New refrigerator installation and setup' },
    ],
    'washing-machine': [
      { name: 'Washing Machine Repair', slug: 'washing-machine-repair', description: 'Fixing drum, motor, and drainage issues' },
      { name: 'Washing Machine Servicing', slug: 'washing-machine-servicing', description: 'Regular cleaning and maintenance service' },
      { name: 'Installation', slug: 'installation', description: 'New washing machine installation and setup' },
      { name: 'Dryer Repair', slug: 'dryer-repair', description: 'Tumble dryer repair and maintenance' },
    ],
    'kitchen-appliances': [
      { name: 'Microwave Repair', slug: 'microwave-repair', description: 'Microwave oven repair and servicing' },
      { name: 'Chimney Repair', slug: 'chimney-repair', description: 'Kitchen chimney cleaning and repair' },
      { name: 'Dishwasher Repair', slug: 'dishwasher-repair', description: 'Dishwasher repair and maintenance' },
      { name: 'Cooktop Repair', slug: 'cooktop-repair', description: 'Gas and induction cooktop repair' },
      { name: 'Mixer Grinder Repair', slug: 'mixer-grinder-repair', description: 'Mixer, grinder, and blender repair' },
    ],
    'tv-repair': [
      { name: 'LED/LCD TV Repair', slug: 'led-lcd-tv-repair', description: 'LED and LCD TV panel, backlight, and board repair' },
      { name: 'Smart TV Setup', slug: 'smart-tv-setup', description: 'Smart TV installation, Wi-Fi setup, and app configuration' },
      { name: 'TV Wall Mount', slug: 'tv-wall-mount', description: 'TV wall mounting and installation service' },
      { name: 'TV Panel Repair', slug: 'tv-panel-repair', description: 'Display panel and screen repair for TVs' },
    ],
    'water-purifier': [
      { name: 'RO Installation', slug: 'ro-installation', description: 'RO water purifier installation and setup' },
      { name: 'RO Repair', slug: 'ro-repair', description: 'RO purifier troubleshooting and repair' },
      { name: 'Filter Replacement', slug: 'filter-replacement', description: 'RO filter and membrane replacement service' },
      { name: 'Annual Maintenance', slug: 'annual-maintenance', description: 'Annual AMC service for water purifiers' },
    ],
    'geyser': [
      { name: 'Geyser Installation', slug: 'geyser-installation', description: 'Water heater and geyser installation service' },
      { name: 'Geyser Repair', slug: 'geyser-repair', description: 'Geyser heating element, thermostat, and valve repair' },
      { name: 'Geyser Servicing', slug: 'geyser-servicing', description: 'Regular maintenance and tank cleaning for geysers' },
      { name: 'Solar Water Heater', slug: 'solar-water-heater', description: 'Solar water heater installation and repair' },
    ],
    'plumber': [
      { name: 'Leak Repair', slug: 'leak-repair', description: 'Detection and repair of pipe leaks and water seepage' },
      { name: 'Drain Cleaning', slug: 'drain-cleaning', description: 'Blocked drain and sewer line cleaning services' },
      { name: 'Pipe Installation', slug: 'pipe-installation', description: 'New pipe installation and replacement services' },
      { name: 'Faucet & Tap Repair', slug: 'faucet-tap-repair', description: 'Tap and faucet repair and replacement' },
      { name: 'Toilet Repair', slug: 'toilet-repair', description: 'Toilet seat, cistern, and flush repair' },
    ],
    'electrician': [
      { name: 'Wiring Repairs', slug: 'wiring-repairs', description: 'House wiring repair and rewiring services' },
      { name: 'Light Fixture Installation', slug: 'light-fixture-installation', description: 'Chandelier, tube light, and LED fixture installation' },
      { name: 'Switch & Socket Repair', slug: 'switch-socket-repair', description: 'Switch and socket point repair and installation' },
      { name: 'Fan Installation', slug: 'fan-installation', description: 'Ceiling fan mounting, wiring, and repair' },
      { name: 'MCB & Circuit Breaker', slug: 'mcb-circuit-breaker', description: 'MCB, DB box, and circuit breaker repair and setup' },
    ],
    'water-tank-cleaning': [
      { name: 'Domestic Tank Cleaning', slug: 'domestic-tank-cleaning', description: 'Household water tank cleaning and sanitization' },
      { name: 'Commercial Tank Cleaning', slug: 'commercial-tank-cleaning', description: 'Large commercial and building water tank cleaning' },
      { name: 'Tank Disinfection', slug: 'tank-disinfection', description: 'Water tank disinfection and anti-bacterial treatment' },
      { name: 'Sump Cleaning', slug: 'sump-cleaning', description: 'Underground sump cleaning and maintenance' },
    ],
    'movers-and-packers': [
      { name: 'House Shifting', slug: 'house-shifting', description: 'Complete home relocation and shifting service' },
      { name: 'Office Relocation', slug: 'office-relocation', description: 'Office and commercial space moving service' },
      { name: 'Vehicle Transport', slug: 'vehicle-transport', description: 'Car and bike transportation services' },
      { name: 'Storage & Warehouse', slug: 'storage-warehouse', description: 'Temporary storage and warehousing solutions' },
      { name: 'Packing Service', slug: 'packing-service', description: 'Professional packing and unpacking services' },
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
  const adminPasswordHash = await hashPassword('admin@123');
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
  // 5. FAQs
  // ========================================
  console.log('❓ Creating FAQs...');
  const faqData = [
    // General
    { category: 'General', question: 'What is BookYourService?', answer: 'BookYourService is India\'s trusted online marketplace connecting homeowners with verified service providers for home appliances and services. We offer 11 categories: Air Conditioner, Refrigerator, Washing Machine, Kitchen Appliances, TV Repair, Water Purifier, Geyser, Plumber, Electrician, Water Tank Cleaning, and Movers and Packers. We ensure quality, reliability, and transparent pricing for every booking.', displayOrder: 1 },
    { category: 'General', question: 'Which cities does BookYourService operate in?', answer: 'We currently operate in major Indian cities including Delhi, Mumbai, Bengaluru, Hyderabad, and Chennai, with plans to expand rapidly. Enter your pincode on the homepage to check availability in your area.', displayOrder: 2 },
    { category: 'General', question: 'How do I book a service?', answer: 'Simply browse our categories, select your desired service, choose a provider, pick a date and time, and confirm your booking. You can also call our helpline for assistance.', displayOrder: 3 },
    { category: 'General', question: 'Are the service providers verified?', answer: 'Yes, all service providers on BookYourService undergo a rigorous KYC verification process including identity verification (Aadhaar/PAN/Passport), address verification, skill assessment, and background checks before being listed on our platform.', displayOrder: 4 },
    { category: 'General', question: 'What services are available on BookYourService?', answer: 'We offer 11 service categories: Air Conditioner (installation, repair, servicing, gas refilling), Refrigerator (repair, servicing, gas refilling), Washing Machine (repair, servicing, installation), Kitchen Appliances (microwave, chimney, dishwasher repair), TV Repair (LED/LCD repair, smart TV setup, wall mount), Water Purifier (RO installation, repair, filter replacement), Geyser (installation, repair, servicing), Plumber (leak repair, drain cleaning, pipe installation), Electrician (wiring, light fixture, fan installation), Water Tank Cleaning (domestic/commercial tank cleaning), and Movers and Packers (house shifting, office relocation, packing).', displayOrder: 5 },
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
    { category: 'Provider', question: 'How can I become a service provider on BookYourService?', answer: 'Register as a provider, complete KYC verification (Aadhaar/PAN/Passport + selfie), and get your profile approved. Once verified, you can list your services across any of our 11 categories, set pricing, and start receiving bookings. The approval process typically takes 24-48 hours.', displayOrder: 15 },
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
  // 6. LEGAL PAGES (Comprehensive)
  // ========================================
  console.log('📜 Creating legal pages...');

  // Terms & Conditions — Acceptable Usage Policy (AUP)
  await db.legalPage.create({
    data: {
      pageType: 'TERMS',
      title: 'Acceptable Usage Policy & Terms of Service',
      version: '1.0',
      effectiveDate: '2025-01-01',
      content: `ACCEPTABLE USAGE POLICY AND TERMS OF SERVICE FOR BOOKYOURSERVICE

Last Updated: January 1, 2025 | Version: 1.0 | Effective Date: January 1, 2025

IMPORTANT NOTICE: PLEASE READ THIS ACCEPTABLE USAGE POLICY AND TERMS OF SERVICE CAREFULLY BEFORE USING THE BOOKYOURSERVICE PLATFORM. BY ACCESSING OR USING THE PLATFORM, YOU AGREE TO BE BOUND BY THESE TERMS. IF YOU DO NOT AGREE WITH ANY PART OF THESE TERMS, YOU MUST NOT USE OUR SERVICES. THIS DOCUMENT CONSTITUTES A LEGALLY BINDING AGREEMENT BETWEEN YOU AND BOOKYOURSERVICE TECHNOLOGIES PVT. LTD.

1. INTRODUCTION
1.1 This Acceptable Usage Policy and Terms of Service ("AUP," "Terms," or "Agreement") governs your access to and use of the BookYourService platform, including the website at https://bookyourservice.co.in, the mobile application, and all associated services operated by BookYourService Technologies Pvt. Ltd. ("Company," "we," "us," or "our"), a company incorporated under the laws of India.
1.2 BookYourService is an online intermediary marketplace that connects Clients with independent Service Providers for Plumbing, Electrical, and AC & HVAC home services across India.
1.3 By registering an account, browsing, booking, or listing services on the Platform, you acknowledge that you have read, understood, and agree to be bound by this AUP, our Privacy Policy, Refund Policy, Cookie Policy, and all applicable laws and regulations of India.
1.4 If you are using the Platform on behalf of a business or entity, you represent and warrant that you have the authority to bind that entity to these Terms.
1.5 This AUP sets forth the acceptable and prohibited uses of the Platform, the rights and obligations of all users, and the limitations of liability of the Company. It is designed to ensure a safe, fair, and legally compliant environment for all participants.
1.6 The Company reserves the right to update, modify, or replace any part of this AUP at its sole discretion. It is your responsibility to review these Terms periodically. Your continued use of the Platform after any changes constitutes acceptance of those changes.

2. ELIGIBILITY
2.1 You must be at least 18 (eighteen) years of age and a resident of India to create an account and use the Platform. By using the Platform, you represent and warrant that you meet these eligibility requirements.
2.2 Individuals who are legally barred from entering into contracts under Indian law, including but not limited to undischarged insolvents and persons of unsound mind, are not eligible to use the Platform.
2.3 Service Providers must possess the necessary qualifications, licenses, and permits required by applicable Indian law to perform the services they list on the Platform (e.g., electrical license from the State Electricity Board, plumbing certification, HVAC technician certification).
2.4 Clients must have the legal capacity and authority to request services at the address provided and must be the owner or authorized occupant of the premises where services are to be rendered.
2.5 Users who have been previously suspended or terminated from the Platform for policy violations are not eligible to create new accounts. Creating multiple or duplicate accounts to circumvent a suspension is strictly prohibited.
2.6 Corporate and enterprise users must designate an authorized representative who accepts these Terms on behalf of the organization and must maintain accurate business registration details on the Platform.

3. ACCOUNT RESPONSIBILITIES
3.1 Users must provide accurate, current, and complete information during registration, including full legal name, valid email address, active phone number, and correct residential or business address. Users must keep such information updated at all times.
3.2 Each user may maintain only one active account at a time. Creating multiple accounts using different email addresses or phone numbers is prohibited and may result in immediate suspension of all associated accounts.
3.3 Users are solely responsible for maintaining the confidentiality of their account credentials (email, password, OTP) and for all activities that occur under their account, whether or not the user authorized such activities.
3.4 Users must not share, transfer, or sell their account credentials to any third party. Any unauthorized use of an account must be reported to the Company immediately by contacting support@bookyourservice.co.in.
3.5 The Company shall NOT be liable for any loss, damage, or harm arising from a user's failure to comply with the account security obligations set forth in this Section 3.
3.6 The Company reserves the right to suspend, terminate, or restrict any account that violates these Terms, engages in fraudulent activity, provides false information, or is deemed harmful to other users or the Platform.
3.7 Users must not create accounts using automated means, bots, or scripts. All registrations must be performed manually by a real person.

4. PROHIBITED ACTIVITIES
4.1 Users must NOT use the Platform for any unlawful purpose or in violation of any applicable Indian law, including but not limited to the Indian Penal Code, the Information Technology Act, 2000, the Consumer Protection Act, 2019, and state-specific regulations.
4.2 The following activities are strictly prohibited on the Platform:
• Submitting false, misleading, or fraudulent information in profiles, listings, reviews, or communications
• Impersonating any person or entity or misrepresenting your identity, qualifications, or affiliation
• Interfering with or disrupting the Platform's operation, servers, or networks
• Attempting to gain unauthorized access to any part of the Platform, user accounts, or systems
• Using automated tools (bots, scrapers, crawlers) to access or collect data from the Platform without written permission
• Engaging in any form of price manipulation, bid rigging, or market distortion
• Circumventing or attempting to circumvent the Platform's payment, booking, or review systems
• Soliciting Platform users for services or transactions outside the Platform (platform bypass)
• Posting or transmitting content that is defamatory, obscene, harassing, threatening, hateful, or discriminatory
• Uploading viruses, malware, or any malicious code that may harm the Platform or its users
• Engaging in money laundering, terrorist financing, or any activity prohibited under the Prevention of Money Laundering Act, 2002
• Using the Platform to advertise or promote products, services, or websites not approved by the Company
• Creating fake bookings, reviews, or ratings to artificially inflate metrics
• Harassing, stalking, or intimidating other users through the Platform's communication channels
4.3 Any violation of this Section 4 may result in immediate account suspension or termination, forfeiture of any pending payments or credits, and referral to law enforcement authorities where applicable.
4.4 The Company bears NO liability for any actions taken by users in violation of this Section 4. Users are solely responsible for their conduct on the Platform.

5. KYC AND VERIFICATION
5.1 All Service Providers must complete the Know Your Customer (KYC) verification process before listing any services on the Platform. KYC verification includes submission of government-issued identity proof (Aadhaar, PAN, Passport, or Driving License), address proof, a recent photograph/selfie, and any trade-specific certifications or licenses.
5.2 The Company reserves the right to request additional documentation or verification at any time, including but not limited to police verification, reference checks, skill assessments, and background checks.
5.3 KYC verification status (APPROVED, PENDING, REJECTED) is displayed on the Provider's profile. Providers with PENDING or REJECTED status cannot list or offer services on the Platform.
5.4 The Company's KYC verification is a preliminary identity check only and does NOT constitute an endorsement, guarantee, or warranty of the Provider's competence, skill, reliability, or suitability. The Company is NOT liable for any inaccuracies in KYC documents or any harm caused by a KYC-verified Provider.
5.5 Providers must notify the Company within 7 days of any changes to their KYC information, including change of address, legal name, or license status. Failure to update KYC information may result in account suspension.
5.6 The Company may periodically re-verify KYC documents. Providers must cooperate fully with re-verification requests.
5.7 KYC documents are retained for the duration of the Provider relationship plus 1 year after termination, in compliance with applicable data protection and tax laws of India.

6. SERVICE LISTING RULES
6.1 Service Providers may only list services within the three approved categories on the Platform: Plumbing, Electrical, and AC & HVAC. Listing services outside these categories is prohibited.
6.2 Service listings must include accurate and complete information, including but not limited to: service title, detailed description, base price (in INR), estimated service duration, service area (city and radius), and availability schedule.
6.3 Providers must not list services that they are not qualified, licensed, or legally permitted to perform. For example, only licensed electricians may list electrical services, and only certified HVAC technicians may list AC gas refilling services.
6.4 Service descriptions must not contain misleading claims, guarantees of results, or pricing that does not reflect the actual cost. "Bait and switch" pricing tactics are strictly prohibited.
6.5 Providers must set fair and reasonable prices. The Company reserves the right to delist services with prices that are demonstrably exploitative or significantly deviate from market rates without justification.
6.6 Providers may mark prices as "Negotiable" if they are open to discussion with Clients. However, the base price must still represent a good-faith estimate of the service cost.
6.7 All service images must be original or properly licensed. Using stock photos that misrepresent the Provider's work is prohibited. Images must not contain watermarks from other platforms or businesses.
6.8 Providers must not list the same service multiple times under different names to manipulate search rankings or visibility.
6.9 The Company reserves the right to remove, modify, or reject any service listing that violates these rules or is deemed inappropriate, without prior notice to the Provider.

7. BOOKING RULES
7.1 Clients can browse, select, and book services through the Platform from the available categories: Plumbing, Electrical, and AC & HVAC. All bookings are subject to provider availability and confirmation.
7.2 A booking request does not constitute a confirmed appointment until the Service Provider accepts it. The Company is NOT a party to the service agreement between the Client and the Provider.
7.3 Service prices displayed on the Platform are indicative and based on information provided by the Service Provider. The actual price may vary depending on the scope of work, materials required, and any negotiation between the Client and Provider.
7.4 Clients must provide accurate service address, contact information, and any special instructions at the time of booking. Failure to provide accurate information may result in service cancellation without refund.
7.5 Booking confirmation constitutes a service agreement between the Client and the Provider. The Company is NOT a party to this agreement and bears NO liability for its execution.
7.6 The Company does NOT guarantee the timely delivery, quality, or outcome of any service. Any guarantee or warranty for services is solely the responsibility of the Service Provider.
7.7 Clients acknowledge that home services involve inherent risks including but not limited to property damage, water damage, electrical hazards, and refrigerant exposure. Clients engage services at their own risk and the Company bears NO liability for any such risks.
7.8 Providers must arrive at the scheduled time or notify the Client of any delays at least 30 minutes in advance. Repeated no-shows or late arrivals will negatively impact the Provider's rating and may result in account suspension.
7.9 Clients may cancel bookings subject to the cancellation policy outlined in Section 15. Providers may cancel bookings only in genuine emergencies and must provide a valid reason.

8. COMMUNICATION POLICY
8.1 The Platform provides in-app messaging and calling features to facilitate communication between Clients and Providers regarding service bookings. All communications through the Platform are logged for dispute resolution purposes.
8.2 Users must NOT use the Platform's communication channels for purposes unrelated to service bookings, including but not limited to: sending spam, promotional material, offensive content, threats, or any form of harassment.
8.3 Users must NOT share personal contact information (personal phone numbers, personal email addresses, social media profiles) through the Platform's messaging system for the purpose of circumventing the Platform's booking and payment systems.
8.4 The Company reserves the right to monitor, filter, and moderate communications on the Platform to ensure compliance with this AUP and applicable laws. However, the Company is NOT obligated to monitor all communications and bears NO liability for the content of user communications.
8.5 Users must not record, screenshot, or distribute communications from other users without their consent, except as required for dispute resolution or legal proceedings.
8.6 The Company may restrict or terminate communication privileges for users who violate this Section 8.
8.7 In case of emergency or safety concerns during a service visit, users should contact local emergency services (100 for police, 101 for fire, 108 for ambulance) first and then report the incident to the Company at support@bookyourservice.co.in.

9. PRIVACY AND DATA PROTECTION
9.1 User data is collected, processed, and stored in accordance with our Privacy Policy, which is incorporated herein by reference and available at https://bookyourservice.co.in.
9.2 We comply with the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and all applicable data protection laws of India, including the Digital Personal Data Protection Act, 2023.
9.3 By using the Platform, you consent to the collection, use, storage, and disclosure of your personal information as described in our Privacy Policy.
9.4 Users consent to receiving transactional and service-related communications (booking confirmations, reminders, security alerts). Marketing communications are subject to user opt-in consent and can be opted out at any time.
9.5 The Company implements industry-standard security measures to protect user data, including TLS/SSL encryption, encrypted databases, firewalls, intrusion detection systems, and regular security audits.
9.6 NOTWITHSTANDING THE FOREGOING, NO METHOD OF ELECTRONIC TRANSMISSION OR STORAGE IS 100% SECURE. The Company cannot guarantee absolute security of user data and bears NO liability for unauthorized access, data breaches, or cyber attacks beyond its reasonable control.
9.7 Users have the right to access, correct, and request deletion of their personal data by contacting support@bookyourservice.co.in or the Data Protection Officer at dpo@bookyourservice.co.in.

10. INTELLECTUAL PROPERTY
10.1 All content, features, and functionality of the Platform, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, software, and the overall design and layout, are the exclusive property of BookYourService Technologies Pvt. Ltd. or its licensors and are protected by Indian and international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
10.2 Users may NOT copy, reproduce, distribute, publish, display, modify, create derivative works from, decompile, reverse engineer, or commercially exploit any content from the Platform without the express written consent of the Company.
10.3 Provider listings, reviews, ratings, and other user-generated content submitted to the Platform are licensed to the Company on a non-exclusive, worldwide, royalty-free, transferable, sub-licensable basis for use in connection with the Platform's operation, marketing, and improvement.
10.4 The "BookYourService" name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of the Company. Users may NOT use such marks without the Company's prior written permission.
10.5 Any feedback, suggestions, or ideas submitted by users to the Company regarding the Platform shall become the exclusive property of the Company, and the Company may use such feedback without any obligation of attribution or compensation.

11. SECURITY POLICY
11.1 Users must NOT attempt to compromise the security of the Platform, including but not limited to: attempting to bypass authentication, accessing restricted areas, exploiting vulnerabilities, conducting denial-of-service attacks, or introducing malicious code.
11.2 Users must NOT use the Platform in any manner that could damage, disable, overburden, or impair the Platform's servers or networks.
11.3 Users must report any discovered security vulnerabilities to the Company immediately at legal@bookyourservice.co.in. Users must NOT publicly disclose or exploit such vulnerabilities.
11.4 The Company reserves the right to investigate and take appropriate legal action against anyone who, in the Company's sole discretion, violates this Section 11, including removing offending content, suspending or terminating the accounts of such violators, and/or reporting them to law enforcement authorities.
11.5 The Company implements reasonable security measures but does NOT guarantee that the Platform will be free from security vulnerabilities, unauthorized access, or cyber attacks. The Company bears NO liability for any security incidents beyond its reasonable control.

12. CONTENT POLICY
12.1 Users are solely responsible for all content they post, upload, or transmit on the Platform, including but not limited to: profile information, service listings, reviews, ratings, messages, images, and any other materials.
12.2 The following content is prohibited on the Platform:
• Content that is false, misleading, deceptive, or fraudulent
• Content that infringes on the intellectual property rights of any third party
• Content that is defamatory, libelous, obscene, pornographic, or offensive
• Content that promotes violence, terrorism, hatred, discrimination, or illegal activities
• Content that contains personal information of other users without their consent
• Content that contains viruses, malware, or other harmful code
• Content that impersonates another person or entity
• Content that violates any applicable Indian law or regulation
12.3 The Company reserves the right to remove, modify, or reject any content that violates this Section 12 or is deemed inappropriate, at its sole discretion, without prior notice.
12.4 The Company does NOT endorse, verify, or guarantee the accuracy of any user-generated content on the Platform. All content is provided "as is" and the Company bears NO liability for any content posted by users.
12.5 Reviews and ratings must be based on genuine service experiences. Posting fake, incentivized, or retaliatory reviews is strictly prohibited and may result in account termination.

13. PLATFORM FEES
13.1 The Company charges a Platform Fee for providing the intermediary service of connecting Clients with Providers. The Platform Fee is separate from the service price and is disclosed transparently during the booking process.
13.2 The current Platform Fee structure is as follows:
• A percentage-based commission (currently 5-10%) is charged on each completed booking
• For the current direct payment model, the Platform Fee is collected from the Provider's earnings on a periodic basis
• Once the online payment system is activated, the Platform Fee will be automatically deducted before Provider disbursement
13.3 CURRENT PAYMENT MODEL: At present, the Company's online payment system is under development. All service payments are settled DIRECTLY between the Client and the Service Provider through cash, bank transfer, UPI, or any other mutually agreed payment method. The Company DOES NOT collect, process, hold, or handle any service payments at this time.
13.4 The Company is NOT responsible for any payment disputes, defaults, or issues between Clients and Providers. Both parties are solely responsible for agreeing upon and completing payment transactions.
13.5 All prices are listed in Indian Rupees (INR). Applicable taxes (including GST) are included in the displayed prices unless otherwise stated.
13.6 The Company reserves the right to modify the Platform Fee structure at any time with prior notice to users. Changes to the fee structure will not affect bookings already confirmed at the previous rate.

14. DISPUTE RESOLUTION
14.1 INFORMAL RESOLUTION: Before initiating any formal proceedings, the parties agree to first attempt to resolve any dispute through the Platform's built-in dispute resolution mechanism or through good-faith negotiation.
14.2 Clients can raise a quality dispute within 7 days of service completion through the Platform. The Client must provide supporting evidence including photos, descriptions, and any relevant documentation.
14.3 The Company will act as a mediator and attempt to facilitate a fair resolution between the Client and the Provider. However, the Company is NOT bound to enforce any particular outcome.
14.4 ARBITRATION: Any dispute, controversy, or claim arising out of or relating to these Terms that cannot be resolved through informal resolution shall be settled by binding arbitration in accordance with the Arbitration and Conciliation Act, 1996 (as amended).
14.5 The arbitration shall be conducted by a sole arbitrator appointed mutually by the parties. If the parties cannot agree on an arbitrator within 30 days, the arbitrator shall be appointed by the Bombay High Court.
14.6 The seat and venue of arbitration shall be Mumbai, Maharashtra, India. The language of the arbitration proceedings shall be English.
14.7 The arbitrator's decision shall be final and binding on both parties. Each party shall bear its own costs and expenses of arbitration, unless the arbitrator determines otherwise.
14.8 NOTWITHSTANDING THE FOREGOING, THE COMPANY MAY SEEK INJUNCTIVE OR EQUITABLE RELIEF IN ANY COURT OF COMPETENT JURISDICTION TO PROTECT ITS INTELLECTUAL PROPERTY RIGHTS OR PREVENT IRREPARABLE HARM.
14.9 The courts of Mumbai, Maharashtra, India shall have exclusive jurisdiction over any disputes not subject to arbitration.

15. REFUNDS AND CANCELLATIONS
15.1 Cancellation by Client:
• Full refund (no cancellation fee): Cancellations made 24 or more hours before the scheduled service time
• Partial refund (90% of service price): Cancellations made 4-24 hours before the scheduled service time
• Partial refund (75% of service price): Cancellations made within 4 hours of the scheduled service time
• No refund: No-show by the Client without prior cancellation
15.2 Cancellation by Provider:
• Providers may cancel bookings only in genuine emergencies or unavoidable circumstances
• Frequent cancellations by a Provider will negatively impact their rating and may result in account suspension or termination
• If a Provider cancels a booking, the Company will attempt to arrange an alternative Provider or facilitate a full refund to the Client
15.3 REFUND PROCESSING:
• For the current direct payment model, refunds are the responsibility of the Service Provider. The Company will facilitate the refund process but cannot guarantee refund timelines or outcomes
• Once the online payment system is activated, refunds will be processed to the original payment method within 5-7 business days
• Refund processing times may vary by payment method: UPI (3-5 business days), Credit/Debit Card (5-7 business days), Net Banking (5-7 business days), Wallet (24-48 hours)
15.4 The Company's liability for any refund is limited to the Platform Fee collected by the Company for the specific booking. The Company is NOT liable for the service payment amount.
15.5 Detailed refund policies are available in our Refund Policy at https://bookyourservice.co.in.

16. ADVERTISING AND SEO POLICY
16.1 Service Providers must NOT engage in any form of deceptive advertising or search engine manipulation (black-hat SEO) to artificially boost their visibility on the Platform or external search engines.
16.2 The following advertising practices are prohibited:
• Using misleading keywords, tags, or metadata that do not accurately describe the listed service
• Keyword stuffing in service titles or descriptions
• Creating duplicate or near-duplicate service listings to occupy more search result positions
• Using the BookYourService brand name, logo, or trademarks in external advertising without written permission
• Making false or unverifiable claims in service descriptions (e.g., "Best plumber in India," "100% guaranteed")
• Paying for or incentivizing fake reviews, ratings, or bookings
16.3 The Company may offer legitimate advertising and featured listing options (such as priority placement, search result boosts, and banner advertising) through the Platform. Users must only use these approved methods for promoting their services.
16.4 Any Provider found engaging in prohibited advertising or SEO practices may have their listings delisted, their account suspended, and any associated fees forfeited.
16.5 The Company reserves the right to modify search ranking algorithms and advertising options at any time without prior notice.

17. INTERNATIONAL USE
17.1 The Platform is designed for use within India only. All services, bookings, and transactions are subject to Indian law.
17.2 Users accessing the Platform from outside India do so at their own risk and are responsible for compliance with all applicable local laws. The Company makes no representation that the Platform is appropriate or available for use in jurisdictions outside India.
17.3 Service Providers must be physically located in India and must hold valid Indian identity documents and business registrations. Foreign nationals operating in India must have valid work permits and business visas.
17.4 All payments must be made in Indian Rupees (INR). The Company does not support international currency transactions at this time.
17.5 Data processed by the Platform is primarily stored on servers located in India. In the event of any international data processing, appropriate safeguards are implemented in compliance with applicable Indian data protection laws.

18. ACCOUNT SUSPENSION AND TERMINATION
18.1 The Company may terminate or suspend your account and access to the Platform at its sole discretion, without prior notice, for any of the following reasons:
• Violation of this AUP or any other Platform policy
• Engaging in fraudulent, illegal, or harmful activity
• Providing false or misleading information during registration or KYC verification
• Repeated negative reviews or complaints from other users
• Failure to pay applicable Platform Fees
• Any conduct that the Company determines is harmful to other users, the Platform, or the Company's reputation
18.2 Users may terminate their account at any time by contacting customer support at support@bookyourservice.co.in or through their account settings.
18.3 Upon termination:
• All active bookings will be cancelled
• Any pending payments or refunds will be processed according to the applicable policies
• The provisions of this AUP that by their nature should survive shall remain in effect, including but not limited to Sections 1, 4, 9, 10, 11, 12, 14, 19, and 24
• The Company shall NOT be liable for any damages resulting from the termination or suspension of your account
18.4 The Company reserves the right to pursue legal action against users whose accounts are terminated for cause, including but not limited to fraud, theft, or intentional harm.

19. LIMITATION OF LIABILITY
19.1 NO WARRANTY: ALL SERVICES PROVIDED THROUGH THE PLATFORM ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE. THE COMPANY SPECIFICALLY DISCLAIMS ALL IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
19.2 INTERMEDIARY STATUS: BookYourService is an INTERMEDIARY and ONLINE MARKETPLACE ONLY. The Company DOES NOT directly provide any plumbing, electrical, or AC & HVAC services. All services listed on the Platform are provided by independent third-party Service Providers who are NOT employees, agents, or representatives of the Company.
19.3 NOT RESPONSIBLE FOR SERVICE QUALITY: The Company is NOT responsible or liable for the quality, safety, legality, or appropriateness of any service provided by a Service Provider. The Company does not guarantee that any service will meet a Client's expectations or requirements.
19.4 NO LIABILITY FOR DAMAGES: UNDER NO CIRCUMSTANCES SHALL THE COMPANY, ITS DIRECTORS, OFFICERS, EMPLOYEES, AGENTS, OR AFFILIATES BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
• Personal injury, bodily harm, or death resulting from services
• Property damage, water damage, fire damage, or electrical damage
• Loss of use, loss of data, loss of profits, loss of business, or loss of goodwill
• Emotional distress, mental anguish, or reputational harm
• Any damages arising from the negligence, recklessness, or intentional misconduct of a Service Provider or Client
• Any damages arising from delays, failures, errors, or interruptions in the Platform's operation
• Any damages arising from unauthorized access to or use of our servers or any personal information stored therein
• Any damages arising from any content, goods, or services obtained through the Platform
19.5 LIMITATION OF LIABILITY: THE COMPANY'S TOTAL AGGREGATE LIABILITY FOR ANY AND ALL CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR THE USE OF THE PLATFORM SHALL NOT EXCEED THE AMOUNT OF THE PLATFORM FEE PAID BY YOU TO THE COMPANY IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE LIABILITY, OR INR 1,000 (INDIAN RUPEES ONE THOUSAND), WHICHEVER IS LESS.
19.6 INDEMNIFICATION: You agree to indemnify, defend, and hold harmless the Company, its directors, officers, employees, agents, and affiliates from and against any and all claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or related to:
• Your use of or inability to use the Platform
• Your violation of these Terms
• Your violation of any applicable law, regulation, or third-party right
• Any service you provide or receive through the Platform
• Any dispute between you and another user of the Platform
• Any content you submit, post, or transmit through the Platform
• Any negligent or wrongful act or omission on your part
19.7 The Company shall not be liable for any failure or delay in performing its obligations under these Terms where such failure or delay results from circumstances beyond its reasonable control (force majeure).
19.8 You acknowledge that the Company has relied on the limitations and exclusions of liability set forth herein in providing the Platform at its current pricing and that these limitations and exclusions form an essential basis of the agreement between the parties.

20. COMPLIANCE WITH LAW
20.1 Users must comply with all applicable Indian laws, regulations, and rules when using the Platform, including but not limited to:
• The Information Technology Act, 2000 and its associated rules
• The Consumer Protection Act, 2019 and the Consumer Protection (E-Commerce) Rules, 2020
• The Digital Personal Data Protection Act, 2023
• The Goods and Services Tax (GST) laws and regulations
• State-specific labor laws, licensing requirements, and trade regulations
• The Indian Penal Code and the Code of Criminal Procedure
• The Prevention of Money Laundering Act, 2002
• The Equal Remuneration Act, 1976 and anti-discrimination laws
20.2 Service Providers must obtain and maintain all necessary permits, licenses, and registrations required for their trade (plumbing, electrical, HVAC) in the jurisdiction where they operate.
20.3 Providers must comply with all applicable tax obligations, including GST registration and filing, and must provide valid tax invoices to Clients upon request.
20.4 The Company will cooperate with law enforcement and regulatory authorities as required by law, including responding to subpoenas, court orders, and lawful requests for user information.
20.5 The Company bears NO liability for any user's failure to comply with applicable laws and regulations. Users are solely responsible for ensuring their own legal compliance.

21. REPORTING VIOLATIONS
21.1 Users are encouraged to report any violations of this AUP, suspicious activity, or safety concerns to the Company.
21.2 Reports can be submitted through the following channels:
• Email: support@bookyourservice.co.in for general violations
• Email: legal@bookyourservice.co.in for legal or compliance concerns
• In-app reporting feature on service and user profile pages
21.3 The Company will investigate all reported violations and take appropriate action, which may include: issuing warnings, removing prohibited content, suspending or terminating accounts, and referring matters to law enforcement.
21.4 The Company will keep the identity of reporting users confidential to the extent permitted by law. The Company will NOT retaliate against users who report violations in good faith.
21.5 Filing false or malicious reports is itself a violation of this AUP and may result in account suspension.
21.6 In case of immediate danger or emergencies, users should contact local emergency services (100 for police, 101 for fire, 108 for ambulance) first, before reporting to the Company.

22. POLICY UPDATES
22.1 The Company reserves the right to update, modify, or replace any part of this AUP at its sole discretion.
22.2 Material changes to this AUP will be communicated to users through one or more of the following methods:
• Email notification to the registered email address
• Prominent notice on the Platform's homepage or login screen
• In-app notification or popup
• SMS to the registered phone number (for critical changes)
22.3 The Company will provide at least 15 days' notice before material changes take effect, except where immediate changes are necessary for security, legal compliance, or the protection of users.
22.4 Your continued use of the Platform after the effective date of any changes constitutes acceptance of the revised AUP.
22.5 If you do not agree with the revised terms, you must stop using the Platform and terminate your account. The Company's obligation to you shall be limited to any applicable refunds as per the Refund Policy.
22.6 The Company will maintain an archive of previous versions of this AUP. Users may request a copy of any previous version by contacting legal@bookyourservice.co.in.

23. CONTACT INFORMATION
For questions, concerns, or notices regarding this Acceptable Usage Policy and Terms of Service:
• Company: BookYourService Technologies Pvt. Ltd.
• Website: https://bookyourservice.co.in
• General Support: support@bookyourservice.co.in
• Legal and Compliance: legal@bookyourservice.co.in
• Data Protection Officer: dpo@bookyourservice.co.in
• Grievance Officer: grievance@bookyourservice.co.in
• Registered Address: Fort, Mumbai 400001, Maharashtra, India
• Support Hours: 8:00 AM - 10:00 PM IST, 7 days a week

24. ADDITIONAL ENTERPRISE CLAUSES
24.1 CORPORATE ACCOUNTS: Organizations using the Platform for bulk or recurring service bookings may enter into a separate Enterprise Service Agreement (ESA) with the Company. The terms of the ESA will supplement but not override this AUP, except where expressly stated in the ESA.
24.2 VOLUME DISCOUNTS: Enterprise clients may be eligible for volume-based discounts on Platform Fees, subject to negotiation and mutual agreement. Such discounts do not affect the Company's limitation of liability under Section 19.
24.3 SERVICE LEVEL AGREEMENTS (SLAs): The Company may offer SLAs for enterprise clients that specify response times, availability commitments, and support priorities. However, failure to meet SLA targets shall NOT result in liability beyond the refund of the affected Platform Fee.
24.4 INDEMNIFICATION BY ENTERPRISE: Enterprise clients agree to indemnify the Company against any claims arising from the enterprise's use of the Platform, including claims by the enterprise's employees, contractors, or agents.
24.5 AUDIT RIGHTS: The Company reserves the right to audit enterprise accounts for compliance with this AUP and any applicable ESA, upon reasonable notice.
24.6 CORPORATE GOVERNANCE: Enterprise users must ensure that their employees and agents using the Platform are trained on and comply with this AUP. The enterprise is responsible for all activities conducted under its corporate account.

25. FINAL PROVISIONS AND IMPLEMENTATION
25.1 SEVERABILITY: If any provision of this AUP is held to be invalid, illegal, or unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect. The invalid or unenforceable provision shall be modified to the minimum extent necessary to make it valid and enforceable while preserving the intent of the original provision.
25.2 ENTIRE AGREEMENT: This AUP, together with the Privacy Policy, Refund Policy, and Cookie Policy (all available at https://bookyourservice.co.in), constitute the entire agreement between you and the Company regarding the use of the Platform, and supersede any prior agreements, understandings, or representations.
25.3 WAIVER: The failure of the Company to enforce any right or provision of this AUP shall not constitute a waiver of such right or provision. Any waiver of any provision of this AUP must be in writing and signed by the Company to be effective.
25.4 ASSIGNMENT: You may not assign or transfer your rights or obligations under this AUP without the Company's prior written consent. The Company may assign its rights and obligations under this AUP without your consent.
25.5 FORCE MAJEURE: The Company shall not be liable for any failure or delay in performing its obligations under this AUP if such failure or delay is caused by events beyond the Company's reasonable control, including but not limited to natural disasters, war, terrorism, epidemics, government actions, strikes, power outages, cyber attacks, and internet service disruptions.
25.6 GOVERNING LAW: This AUP shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.
25.7 JURISDICTION: Subject to the arbitration provisions in Section 14, the courts of Mumbai, Maharashtra, India shall have exclusive jurisdiction over any disputes arising from or related to this AUP.
25.8 LANGUAGE: This AUP is written in English. In the event of any inconsistency between the English version and any translated version, the English version shall prevail.
25.9 EFFECTIVE DATE: This AUP is effective as of January 1, 2025 and applies to all use of the Platform from that date forward.
25.10 ACKNOWLEDGMENT: BY USING THE PLATFORM, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY ALL THE TERMS AND CONDITIONS OF THIS ACCEPTABLE USAGE POLICY, INCLUDING THE LIMITATION OF LIABILITY PROVISIONS IN SECTION 19.`,
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

Last Updated: January 1, 2025 | Version: 1.0 | Effective Date: January 1, 2025

BookYourService Technologies Pvt. Ltd. ("we," "our," "us") is committed to protecting the privacy and personal data of our users. This Privacy Policy is referenced in and forms an integral part of our Acceptable Usage Policy and Terms of Service. It explains how we collect, use, disclose, and safeguard your information when you use our platform for Plumbing, Electrical, and AC & HVAC services.

1. INTRODUCTION AND SCOPE
1.1 This Privacy Policy applies to all users (Clients, Service Providers, and Administrators) of the BookYourService platform, including our website at https://bookyourservice.co.in and our mobile application.
1.2 By using the Platform, you consent to the data practices described in this Privacy Policy. This consent is given in conjunction with the Acceptable Usage Policy (AUP) and Terms of Service.
1.3 We comply with the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, the Digital Personal Data Protection Act, 2023, and all applicable data protection laws of India.
1.4 This Privacy Policy applies to all personal data processed in connection with the Platform, regardless of whether the data is collected online, offline, or through third-party integrations.
1.5 The Company acts as a data fiduciary under Indian data protection law and is responsible for determining the purposes and means of processing personal data collected through the Platform.

2. INFORMATION WE COLLECT
2.1 Personal Information: Name, email address, phone number, profile photo, residential address, date of birth, and gender.
2.2 Identity Verification (KYC): Aadhaar number, PAN number, driving license number, passport number (for Service Providers undergoing KYC verification as required by Section 5 of the AUP).
2.3 Location Data: GPS coordinates for service delivery matching, provider proximity calculation, and service area determination. Location data is collected only with your explicit consent.
2.4 Payment Information: Currently, we do not collect or process payment information as all payments are settled directly between Clients and Providers. When our online payment system is activated, payment data will be processed securely by PCI DSS Level 1 certified third-party payment gateways. We will NOT store card numbers, CVVs, or bank account details on our servers.
2.5 Device Information: IP address, browser type and version, device type and model, operating system, unique device identifiers, and mobile network information.
2.6 Usage Data: Pages visited, features used, search queries, booking history, time spent on pages, click patterns, and navigation paths.
2.7 Communications: Chat messages between Clients and Providers through the Platform, customer support tickets, and feedback submissions. Communications are logged for dispute resolution as described in Section 8 of the AUP (Communication Policy).
2.8 Service Data: Service categories browsed (Plumbing, Electrical, AC & HVAC), subcategories selected, booking details, service addresses, and special instructions.
2.9 Cookies and Tracking Data: As described in our Cookie Policy, we use cookies and similar technologies to enhance your experience. Please refer to our Cookie Policy for details.

3. HOW WE USE YOUR INFORMATION
3.1 To provide, operate, and maintain the Platform, including matching Clients with appropriate Service Providers.
3.2 To process bookings, facilitate communication between Clients and Providers, and manage service delivery.
3.3 To verify user identity through KYC processes, prevent fraud, and maintain platform security (as outlined in Section 11 of the AUP — Security Policy).
3.4 To send booking confirmations, reminders, service updates, and transactional notifications.
3.5 To provide customer support, resolve disputes as per Section 14 of the AUP (Dispute Resolution), and handle complaints.
3.6 To send promotional offers, newsletters, and platform updates (with opt-out option for marketing communications).
3.7 To comply with legal obligations, regulatory requirements, and law enforcement requests as per Section 20 of the AUP (Compliance with Law).
3.8 To analyze usage patterns, improve platform performance, and develop new features.
3.9 To enforce our AUP and Terms of Service and protect the rights, property, or safety of BookYourService, our users, or the public.
3.10 To detect and prevent prohibited activities as outlined in Section 4 of the AUP (Prohibited Activities).

4. DATA SHARING AND DISCLOSURE
4.1 Service Providers: When you book a service, your name, service address, and phone number are shared with the assigned Service Provider to facilitate service delivery.
4.2 Clients: Service Provider's name, profile photo, rating, and approximate location (city-level) are visible to Clients browsing services.
4.3 Payment Processors: When the online payment system is activated, payment data will be shared with authorized payment gateways (such as Razorpay) for transaction processing.
4.4 Analytics Partners: Anonymized and aggregated usage data may be shared with analytics services to improve our Platform.
4.5 Legal Requirements: We may disclose personal data when required by law, regulation, legal process, or governmental request, or when we believe in good faith that disclosure is necessary to protect our rights, your safety or the safety of others, investigate fraud, or respond to a government request.
4.6 Business Transfers: In the event of a merger, acquisition, reorganization, bankruptcy, or sale of all or a portion of our assets, user data may be transferred to the acquiring entity.
4.7 We do NOT sell, rent, or trade your personal data to third parties for their marketing purposes.
4.8 The Company bears NO liability for how third parties use your data after it has been shared in accordance with this Section 4, except where such sharing was in violation of this Privacy Policy.

5. DATA SECURITY
5.1 All data transmissions between your device and our servers are encrypted using TLS/SSL (Transport Layer Security/Secure Sockets Layer).
5.2 Personal data is stored in encrypted databases with strict access controls.
5.3 We conduct regular security audits, vulnerability assessments, and penetration testing.
5.4 Access to personal data is limited to authorized personnel on a strict need-to-know basis.
5.5 We implement firewalls, intrusion detection systems, and anti-malware protections.
5.6 DESPITE OUR BEST EFFORTS, NO METHOD OF ELECTRONIC TRANSMISSION OR STORAGE IS 100% SECURE. We cannot guarantee absolute security of your data.
5.7 The Company bears NO liability for data breaches, unauthorized access, or cyber attacks beyond its reasonable control, as further outlined in Section 19 of the AUP (Limitation of Liability).
5.8 In the event of a data breach, we will notify affected users and the relevant authorities within 72 hours as required by the Digital Personal Data Protection Act, 2023.

6. DATA RETENTION
6.1 Active account data is retained for the duration of your account.
6.2 Booking records are retained for 3 years after the booking date for dispute resolution and legal compliance.
6.3 Payment records (when activated) will be retained for 7 years as required by Indian tax laws.
6.4 KYC documents are retained for the duration of the Provider relationship plus 1 year after termination, as specified in Section 5.7 of the AUP.
6.5 Deleted account data is retained for 30 days for recovery purposes, then permanently deleted.
6.6 You can request deletion of your account and associated data at any time by contacting support@bookyourservice.co.in.
6.7 Communication logs are retained for 2 years for dispute resolution purposes.
6.8 Analytics data is retained in anonymized form for up to 3 years for platform improvement.

7. YOUR RIGHTS UNDER INDIAN DATA PROTECTION LAW
7.1 Access: You can view and download your personal data from your account settings.
7.2 Correction: You can update your personal information at any time through your account settings.
7.3 Deletion: You can request deletion of your account and data by contacting support@bookyourservice.co.in.
7.4 Objection: You can opt out of marketing communications at any time by clicking the unsubscribe link or updating your preferences.
7.5 Data Portability: You can request a copy of your data in a machine-readable format by contacting our Data Protection Officer at dpo@bookyourservice.co.in.
7.6 Right to Withdraw Consent: You may withdraw consent for data processing at any time, subject to legal and contractual obligations. Withdrawal of consent may result in limited Platform functionality.
7.7 Right to Grievance Redressal: You may file a grievance with our Grievance Officer at grievance@bookyourservice.co.in. Grievances will be acknowledged within 48 hours and resolved within 30 days.

8. COOKIES AND TRACKING TECHNOLOGIES
8.1 We use essential cookies for platform functionality, session management, and security.
8.2 Analytics cookies help us understand usage patterns and improve our services.
8.3 Functional cookies remember your preferences such as location, language, and recently viewed services.
8.4 Marketing cookies (subject to your consent) help us deliver relevant recommendations and advertisements.
8.5 You can manage cookie preferences through your browser settings or our cookie consent banner.
8.6 Please refer to our Cookie Policy for detailed information on cookie usage, including the specific cookies used and their purposes.

9. CHILDREN'S PRIVACY
9.1 Our Platform is not intended for children under 18 years of age. We do not knowingly collect personal information from children.
9.2 If we become aware that we have collected personal data from a child under 18, we will take steps to delete such information promptly.
9.3 Parents or guardians who believe their child has provided personal data to us should contact us immediately at support@bookyourservice.co.in.

10. INTERNATIONAL DATA TRANSFERS
10.1 Your data is primarily stored on servers located in India.
10.2 In the event of international data processing, we ensure appropriate safeguards are in place in compliance with applicable data protection laws, including standard contractual clauses and adequacy decisions.
10.3 Any cross-border transfer of personal data will be conducted only with your explicit consent and in compliance with the Digital Personal Data Protection Act, 2023.
10.4 The Company bears NO liability for data processing by third parties in jurisdictions outside India beyond the safeguards described in this Section 10.

11. SENSITIVE PERSONAL DATA
11.1 We process sensitive personal data (as defined under the IT Rules, 2011) only to the extent necessary for the purposes described in this Privacy Policy, including:
• KYC verification documents (Aadhaar, PAN, passport, driving license) for Service Providers
• Financial information for payment processing (when the online payment system is activated)
• Biometric data (selfie photographs) for identity verification purposes
11.2 Sensitive personal data is stored with enhanced security measures, including encryption at rest and in transit, restricted access controls, and regular access audits.
11.3 The Company bears NO liability for the misuse of sensitive personal data by third parties who gain unauthorized access despite our reasonable security measures.

12. CHANGES TO THIS PRIVACY POLICY
12.1 We may update this Privacy Policy from time to time.
12.2 Significant changes will be communicated via email or platform notification at least 15 days before taking effect, as described in Section 22 of the AUP (Policy Updates).
12.3 Your continued use of the Platform after changes constitutes acceptance of the revised policy.
12.4 If you do not agree with the revised policy, you may terminate your account as described in Section 18 of the AUP (Account Suspension and Termination).

13. DATA PROTECTION OFFICER AND CONTACT
For privacy-related inquiries, data access requests, to exercise your rights, or to file a complaint:
• Email: support@bookyourservice.co.in
• Privacy Team: privacy@bookyourservice.co.in
• Data Protection Officer: dpo@bookyourservice.co.in
• Legal and Compliance: legal@bookyourservice.co.in
• Grievance Officer: grievance@bookyourservice.co.in
• Address: BookYourService Technologies Pvt. Ltd., Fort, Mumbai 400001, Maharashtra, India
• Website: https://bookyourservice.co.in
• Support Hours: 8:00 AM - 10:00 PM IST, 7 days a week`,
    },
  });

  // Refund Policy
  await db.legalPage.create({
    data: {
      pageType: 'REFUND',
      title: 'Refund & Cancellation Policy',
      version: '1.0',
      effectiveDate: '2025-01-01',
      content: `REFUND AND CANCELLATION POLICY FOR BOOKYOURSERVICE

Last Updated: January 1, 2025 | Version: 1.0 | Effective Date: January 1, 2025

This Refund and Cancellation Policy is referenced in and forms an integral part of our Acceptable Usage Policy and Terms of Service (Section 15 — Refunds and Cancellations). It provides detailed information about cancellation rights, refund eligibility, and dispute resolution for bookings made on the BookYourService platform.

1. OVERVIEW AND INTERMEDIARY STATUS
1.1 BookYourService facilitates connections between Clients and Service Providers for Plumbing, Electrical, and AC & HVAC services. As an intermediary platform, our refund policy applies to the Platform Fee charged by BookYourService and the facilitation of refunds for service payments between Clients and Providers.
1.2 IMPORTANT: Currently, all service payments are settled directly between Clients and Providers (cash/direct transfer/UPI). The Company does NOT hold, process, or control service payments. Refunds for service payments must be arranged directly between the Client and Provider.
1.3 The Company bears NO liability for any Provider's refusal to issue a refund or delay in refund processing, as further outlined in Section 19 of the AUP (Limitation of Liability).
1.4 Once our online payment system is activated, the refund process will be managed through the Platform as described in the relevant sections below.

2. CANCELLATION BY CLIENT
2.1 Full Refund (no cancellation fee): Cancellations made 24 or more hours before the scheduled service time.
2.2 Partial Refund (90% of service price): Cancellations made 4-24 hours before the scheduled service time. A 10% cancellation fee applies.
2.3 Partial Refund (75% of service price): Cancellations made within 4 hours of the scheduled service time. A 25% cancellation fee applies.
2.4 No Refund: No-show by the Client without prior cancellation.
2.5 Clients can cancel bookings through the Platform's booking management interface or by contacting support@bookyourservice.co.in.

3. CANCELLATION BY PROVIDER
3.1 Providers may cancel bookings only in genuine emergencies or unavoidable circumstances.
3.2 Frequent cancellations by a Provider will negatively impact their rating and may result in account suspension or termination, as outlined in Section 18 of the AUP (Account Suspension and Termination).
3.3 If a Provider cancels a booking, the Company will attempt to arrange an alternative Provider or facilitate a full refund to the Client.
3.4 The Company bears NO liability for losses arising from a Provider's cancellation, including but not limited to consequential damages, time lost, or emergency service costs.

4. PLATFORM FEE REFUND
4.1 The Platform Fee is refundable under the following conditions:
• The booking was cancelled by the Client within the applicable cancellation window
• The booking was cancelled by the Provider without adequate notice
• The Service Provider failed to arrive (no-show)
• A duplicate Platform Fee charge was applied
4.2 The Platform Fee is NOT refundable under the following conditions:
• The service was completed, regardless of Client satisfaction
• The Client was a no-show without prior cancellation
• The cancellation was made within 4 hours of the scheduled time (partial refund may apply)
• The Platform Fee was for a featured listing or advertising service

5. SERVICE PAYMENT REFUND — CURRENT MODEL (DIRECT PAYMENT)
5.1 Since payments are currently settled directly between Clients and Providers, the Company CANNOT process refunds for service payments.
5.2 Clients must request refunds directly from the Service Provider.
5.3 The Company will facilitate communication and mediation between the parties to resolve refund disputes, as described in Section 14 of the AUP (Dispute Resolution).
5.4 The Company is NOT liable for any Provider's refusal to issue a refund or delay in refund processing.
5.5 The Company recommends obtaining receipts and maintaining records of all payments for refund purposes.

6. SERVICE PAYMENT REFUND — FUTURE ONLINE PAYMENT MODEL
6.1 When the online payment system is activated, the following refund policies will apply:
• Full Refund: Cancellations made 24 or more hours before the scheduled service time. Both service payment and Platform Fee will be refunded.
• Partial Refund (90%): Cancellations made 4-24 hours before the scheduled service time. 10% cancellation fee applies.
• Partial Refund (75%): Cancellations made within 4 hours of the scheduled service time. 25% cancellation fee applies.
• No Refund: Client no-show without prior cancellation.

7. ELIGIBILITY FOR SERVICE QUALITY REFUND
7.1 The service was not delivered as described in the listing.
7.2 The Provider did not arrive within 30 minutes of the scheduled time (no-show).
7.3 The service quality is significantly below the expected standard as evidenced by photos or documentation.
7.4 The Provider cancelled the booking without adequate notice.
7.5 A duplicate charge was applied.
7.6 The service could not be completed due to Provider's inability or equipment failure.

8. SERVICE QUALITY DISPUTE PROCESS
8.1 Clients can raise a quality dispute within 7 days of service completion through the Platform.
8.2 The Client must provide supporting evidence including photos, descriptions, and any relevant documentation.
8.3 The Company will review the dispute and contact the Provider for their response.
8.4 Review process takes up to 48 business hours.
8.5 If the quality issue is verified, the Company will facilitate a full or partial refund from the Provider.
8.6 In some cases, the Company may offer a re-service through a different Provider instead of a refund.
8.7 The Company's mediation is non-binding. The Company bears NO liability for the outcome of any dispute resolution, as per Section 19 of the AUP.

9. REFUND PROCESSING (ONLINE PAYMENT MODEL)
9.1 Approved refunds will be processed to the original payment method.
9.2 Refund processing times vary by payment method:
• UPI: 3-5 business days
• Credit/Debit Card: 5-7 business days
• Net Banking: 5-7 business days
• Wallet: 24-48 hours
9.3 The Company is NOT responsible for delays caused by payment gateways or banking systems.
9.4 The Company bears NO liability for any losses incurred during the refund processing period.

10. NON-REFUNDABLE ITEMS
10.1 Platform Fee for completed services (unless a quality dispute is upheld).
10.2 Tips or bonuses paid directly to Providers.
10.3 Subscription fees for Provider plans (after 7 days of activation).
10.4 Any charges for additional materials or work requested by the Client beyond the original scope.
10.5 Featured listing fees or advertising charges.
10.6 Cancellation fees as described in Section 2 of this Policy.

11. PARTIAL REFUNDS
11.1 If a service is partially completed, a partial refund may be issued based on the portion not completed.
11.2 The refund amount is determined based on the scope of work completed versus agreed upon.
11.3 Both Client and Provider input is considered in determining the partial refund amount.
11.4 The Company's mediation of partial refund disputes is non-binding and the Company bears NO liability for the final outcome.

12. REFUND TO WALLET (FUTURE)
12.1 When the online payment system is activated, refunds may be offered as BookYourService Wallet credit.
12.2 Wallet refunds are processed instantly and can be used for future bookings.
12.3 Wallet credits have no expiry date and can be withdrawn to your bank account.
12.4 Wallet credits are not transferable to other users.

13. DISPUTE ESCALATION
13.1 If a refund request is denied, you can escalate the matter to our Grievance Officer at grievance@bookyourservice.co.in.
13.2 Escalated disputes are reviewed within 5 business days.
13.3 The decision of the Grievance Officer is final and binding on matters of Platform Fee refunds.
13.4 Nothing in this Refund Policy prevents you from seeking remedies available under applicable consumer protection laws, including the Consumer Protection Act, 2019.
13.5 For arbitration of larger disputes, please refer to Section 14 of the AUP (Dispute Resolution).

14. LIMITATION OF LIABILITY
14.1 The Company's liability for any refund is limited to the Platform Fee collected by the Company for the specific booking in question.
14.2 The Company is NOT liable for the service payment amount, as it is settled directly between the Client and Provider.
14.3 Under no circumstances shall the Company be liable for any indirect, incidental, special, or consequential damages arising from refund-related disputes.
14.4 The Company's total aggregate liability shall not exceed the amount specified in Section 19.5 of the AUP (INR 1,000 or the Platform Fee paid in the preceding 12 months, whichever is less).
14.5 The Company does NOT guarantee any particular outcome from dispute resolution or mediation.

15. COMPLIANCE WITH CONSUMER PROTECTION LAW
15.1 This Refund Policy is issued in compliance with the Consumer Protection Act, 2019 and the Consumer Protection (E-Commerce) Rules, 2020.
15.2 Clients are entitled to all rights available under the Consumer Protection Act, 2019, including the right to seek redressal before the appropriate Consumer Disputes Redressal Commission.
15.3 Nothing in this Refund Policy limits or extinguishes any rights available to consumers under Indian law.

16. CONTACT
For refund inquiries and dispute resolution:
• Email: support@bookyourservice.co.in
• Refund Team: refunds@bookyourservice.co.in
• Legal and Compliance: legal@bookyourservice.co.in
• Grievance Officer: grievance@bookyourservice.co.in
• Website: https://bookyourservice.co.in
• Address: BookYourService Technologies Pvt. Ltd., Fort, Mumbai 400001, Maharashtra, India
• Support Hours: 8:00 AM - 10:00 PM IST, 7 days a week`,
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

Last Updated: January 1, 2025 | Version: 1.0 | Effective Date: January 1, 2025

This Cookie Policy is referenced in and forms an integral part of our Acceptable Usage Policy and Terms of Service (Section 9 — Privacy and Data Protection) and our Privacy Policy (Section 8 — Cookies and Tracking Technologies). It explains how BookYourService Technologies Pvt. Ltd. ("we," "us," or "our") uses cookies and similar tracking technologies when you visit our website at https://bookyourservice.co.in or use our mobile application.

1. INTRODUCTION AND SCOPE
1.1 This Cookie Policy applies to all visitors and users of the BookYourService platform, including our website and mobile application.
1.2 By using the Platform, you consent to the use of cookies as described in this Cookie Policy, subject to your right to manage or withdraw consent as outlined in Section 5.
1.3 This policy should be read alongside our Privacy Policy and Acceptable Usage Policy (AUP), both available at https://bookyourservice.co.in.

2. WHAT ARE COOKIES?
2.1 Cookies are small text files placed on your device (computer, tablet, or mobile phone) when you visit a website or use an application.
2.2 They help us remember your preferences, understand how you use our Platform, and improve your experience when browsing for Plumbing, Electrical, and AC & HVAC services.
2.3 Similar technologies we use include: local storage, session storage, web beacons (pixels), and device identifiers.

3. TYPES OF COOKIES WE USE

3.1 ESSENTIAL COOKIES (STRICTLY NECESSARY)
These cookies are required for the Platform to function properly and cannot be disabled. They enable core features such as:
• User authentication and secure session management
• Security and fraud prevention measures (as outlined in Section 11 of the AUP — Security Policy)
• Load balancing and server optimization
• Booking state management and cart functionality
• Compliance with legal obligations

3.2 FUNCTIONAL COOKIES
These cookies enable enhanced functionality and personalization:
• Remembering your city/location and preferred service area
• Saving your search preferences and category filters (Plumbing, Electrical, AC & HVAC)
• Storing your recently viewed services and providers
• Language and display preferences
• Auto-filling form data for faster booking

3.3 ANALYTICS AND PERFORMANCE COOKIES
These cookies help us understand how users interact with our Platform:
• Page views and navigation patterns
• Feature usage statistics
• Error tracking and performance monitoring
• A/B testing for Platform improvements
• Conversion tracking and funnel analysis
We use Google Analytics for website analytics. Data is collected anonymously and aggregated.

3.4 MARKETING AND ADVERTISING COOKIES
These cookies are used for targeted advertising and remarketing:
• Showing relevant service recommendations based on browsing history
• Retargeting ads across partner networks
• Measuring the effectiveness of marketing campaigns (as referenced in Section 16 of the AUP — Advertising and SEO Policy)
• Social media integration features
• Email campaign tracking
These cookies require your explicit consent before activation.

4. THIRD-PARTY COOKIES
We allow the following third parties to set cookies on our Platform:
4.1 Google Analytics — Website analytics and user behavior tracking
4.2 Google Maps — Location services and provider proximity mapping
4.3 Razorpay — Payment processing (when online payments are activated)
4.4 Facebook/Meta — Social integration and advertising
4.5 WhatsApp — Click-to-chat functionality with providers and support
4.6 The Company bears NO liability for the cookies and data practices of third parties. Users should review the privacy policies of these third parties independently.

5. MANAGING COOKIES
5.1 Browser Settings
You can manage cookies through your browser settings:
• Chrome: Settings > Privacy and Security > Cookies and other site data
• Firefox: Options > Privacy & Security > Cookies and Site Data
• Safari: Preferences > Privacy > Cookies and website data
• Edge: Settings > Cookies and site permissions > Manage and delete cookies
5.2 Cookie Consent Banner
Our Platform displays a cookie consent banner upon your first visit. You can accept or reject non-essential cookies through this banner. You can modify your preferences at any time.
5.3 Opt-Out Links
You can opt out of specific third-party cookies:
• Google Analytics: https://tools.google.com/dlpage/gaoptout
• Facebook: https://www.facebook.com/help/568137493302217
• Network Advertising Initiative: https://optout.networkadvertising.org/
5.4 Do Not Track
We respect Do Not Track (DNT) browser signals to the extent required by applicable law. However, DNT is not uniformly supported across all browsers and may not fully prevent all tracking.

6. COOKIE DURATION
6.1 Session cookies expire when you close your browser.
6.2 Persistent cookies have varying durations:
• Authentication cookies: 30 days
• Preference cookies: 1 year
• Analytics cookies: 2 years
• Marketing cookies: 90 days
• Essential cookies: Until browser session ends

7. COOKIES AND MOBILE APPLICATIONS
Our mobile application uses similar tracking technologies including:
7.1 Local Storage for session data and user preferences
7.2 Device identifiers (IDFA/GAID) for analytics
7.3 Push notification tokens for communication
7.4 In-app tracking for usage analytics and feature optimization

8. SPECIFIC COOKIES USED
The following categories of cookies are specifically used on our Platform:
• _ga, _gid, _gat — Google Analytics tracking
• session_id — User session management
• auth_token — Authentication and security
• csrf_token — Cross-site request forgery protection
• preferred_city — User location preference
• recent_services — Recently viewed services
• cookie_consent — User cookie preferences

9. YOUR RIGHTS
9.1 You have the right to be informed about cookies used on our Platform.
9.2 You have the right to consent to or reject non-essential cookies.
9.3 You have the right to withdraw consent at any time by updating your cookie preferences.
9.4 You have the right to request information about how your data is used through cookies, as further detailed in Section 7 of our Privacy Policy (Your Rights Under Indian Data Protection Law).

10. IMPACT OF DISABLING COOKIES
10.1 Essential cookies cannot be disabled as they are required for Platform functionality.
10.2 Disabling functional cookies may result in a less personalized experience.
10.3 Disabling analytics cookies will not affect Platform functionality but may limit our ability to improve the Platform.
10.4 Disabling marketing cookies will prevent targeted advertising but will not affect core Platform features.
10.5 The Company bears NO liability for any degraded experience resulting from the user's decision to disable cookies.

11. COMPLIANCE WITH DATA PROTECTION LAW
11.1 This Cookie Policy is issued in compliance with the Information Technology Act, 2000, the Digital Personal Data Protection Act, 2023, and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.
11.2 We obtain explicit consent before setting non-essential cookies, as required by applicable Indian law.
11.3 Cookie consent records are maintained for compliance and audit purposes.

12. UPDATES TO THIS COOKIE POLICY
12.1 We may update this Cookie Policy to reflect changes in our practices, technology, or regulatory requirements.
12.2 Material changes will be communicated through our Platform or via email, as described in Section 22 of the AUP (Policy Updates).
12.3 We encourage you to review this policy periodically.
12.4 Continued use of the Platform after changes constitutes acceptance of the revised policy.

13. CONTACT
For questions about our use of cookies or to exercise your rights:
• Email: support@bookyourservice.co.in
• Privacy Team: privacy@bookyourservice.co.in
• Data Protection Officer: dpo@bookyourservice.co.in
• Legal and Compliance: legal@bookyourservice.co.in
• Grievance Officer: grievance@bookyourservice.co.in
• Address: BookYourService Technologies Pvt. Ltd., Fort, Mumbai 400001, Maharashtra, India
• Website: https://bookyourservice.co.in
• Support Hours: 8:00 AM - 10:00 PM IST, 7 days a week`,
    },
  });

  // Acceptable Usage Policy (Standalone)
  await db.legalPage.create({
    data: {
      pageType: 'AUP',
      title: 'Acceptable Usage Policy',
      version: '1.0',
      effectiveDate: '2025-01-01',
      content: `ACCEPTABLE USAGE POLICY FOR BOOKYOURSERVICE

Last Updated: January 1, 2025 | Version: 1.0 | Effective Date: January 1, 2025

This Acceptable Usage Policy ("AUP") governs the acceptable use of the BookYourService platform operated by BookYourService Technologies Pvt. Ltd. ("Company," "we," "us," or "our"). This AUP is incorporated by reference into our Terms of Service and applies to all users of the Platform.

1. PURPOSE AND SCOPE
1.1 This AUP establishes the standards and rules for acceptable use of the BookYourService platform, including the website at https://bookyourservice.co.in and all associated services.
1.2 This policy applies to all users, including Clients, Service Providers, and visitors, and is designed to ensure a safe, fair, and legally compliant environment for all participants.
1.3 By using the Platform, you agree to comply with this AUP. Violations may result in account suspension, termination, or legal action as described herein.

2. ACCEPTABLE USE
2.1 Users may use the Platform only for lawful purposes and in accordance with these policies.
2.2 Clients may browse, search, and book services in the categories offered: Plumbing, Electrical, and AC & HVAC.
2.3 Service Providers may list and offer services only within the three approved categories: Plumbing, Electrical, and AC & HVAC.
2.4 All communications through the Platform must be professional, respectful, and related to service bookings.
2.5 Users must provide accurate and truthful information at all times when using the Platform.

3. PROHIBITED CONDUCT
3.1 Users must NOT use the Platform for any unlawful purpose or in violation of any applicable Indian law.
3.2 The following activities are strictly prohibited:
• Submitting false, misleading, or fraudulent information
• Impersonating any person or entity
• Interfering with or disrupting the Platform's operation
• Attempting to gain unauthorized access to any part of the Platform
• Using automated tools (bots, scrapers) without written permission
• Circumventing the Platform's payment, booking, or review systems
• Soliciting users for transactions outside the Platform
• Posting defamatory, obscene, harassing, threatening, or discriminatory content
• Uploading viruses, malware, or malicious code
• Engaging in money laundering or terrorist financing
• Creating fake bookings, reviews, or ratings
• Harassing, stalking, or intimidating other users
3.3 The Company bears NO liability for any actions taken by users in violation of this Section 3.

4. SERVICE-SPECIFIC RULES
4.1 PLUMBING SERVICES: Providers offering plumbing services must hold valid plumbing certifications or licenses as required by applicable state regulations. Services include but are not limited to: leak repair, pipe installation, drain cleaning, faucet replacement, water heater service, bathroom plumbing, kitchen plumbing, sewage repair, water tank installation, and bathroom renovation plumbing.
4.2 ELECTRICAL SERVICES: Providers offering electrical services must hold valid electrical licenses from the State Electricity Board or equivalent authority. Services include but are not limited to: wiring and rewiring, light fixture installation, ceiling fan installation, socket and switch repair, MCB and DB box installation, inverter and UPS setup, earthing and grounding, electrical safety inspection, appliance repair, and electrical renovation.
4.3 AC & HVAC SERVICES: Providers offering AC and HVAC services must hold relevant HVAC certifications. Services include but are not limited to: AC installation, AC repair and troubleshooting, AC gas refilling, AC cleaning and servicing, ducted AC service, central AC maintenance, heater repair, ventilation system service, thermostat installation, and HVAC system overhaul.
4.4 Providers must NOT list services outside these three categories. Any attempt to list services in unapproved categories will result in listing removal and potential account suspension.

5. ACCOUNT INTEGRITY
5.1 Each user may maintain only one active account. Creating multiple accounts is prohibited.
5.2 Users are responsible for maintaining the confidentiality of their account credentials.
5.3 Users must not share, transfer, or sell their account credentials to any third party.
5.4 Any unauthorized use of an account must be reported to support@bookyourservice.co.in immediately.
5.5 The Company shall NOT be liable for any loss arising from a user's failure to comply with these account security obligations.

6. CONTENT STANDARDS
6.1 All content posted on the Platform must be accurate, truthful, and not misleading.
6.2 Prohibited content includes: false or fraudulent content, infringing content, defamatory or obscene material, content promoting violence or illegal activities, content containing personal information of others without consent, and content containing malicious code.
6.3 Reviews and ratings must be based on genuine service experiences. Fake, incentivized, or retaliatory reviews are strictly prohibited.
6.4 The Company reserves the right to remove any content that violates these standards at its sole discretion.

7. COMMUNICATION STANDARDS
7.1 All communications through the Platform must be professional and courteous.
7.2 Users must NOT use communication channels for spam, promotional material, offensive content, threats, or harassment.
7.3 Users must NOT share personal contact information to circumvent the Platform's booking and payment systems.
7.4 The Company may monitor communications for compliance but is NOT obligated to do so and bears NO liability for user communications.

8. ENFORCEMENT
8.1 The Company may take the following actions for AUP violations: issuing warnings, removing prohibited content, suspending accounts, terminating accounts, forfeiting pending payments, and referring matters to law enforcement.
8.2 The Company reserves the right to determine, in its sole discretion, whether a violation has occurred and what action is appropriate.
8.3 The Company bears NO liability for any actions taken pursuant to this enforcement section.

9. REPORTING VIOLATIONS
9.1 Users are encouraged to report AUP violations through: support@bookyourservice.co.in (general violations), legal@bookyourservice.co.in (legal/compliance concerns), or the in-app reporting feature.
9.2 The Company will investigate all reports and take appropriate action.
9.3 Reporter identity will be kept confidential to the extent permitted by law.
9.4 Filing false or malicious reports is itself a violation of this AUP.

10. POLICY UPDATES
10.1 The Company reserves the right to update this AUP at its sole discretion.
10.2 Material changes will be communicated via email, Platform notice, or in-app notification.
10.3 The Company will provide at least 15 days' notice before material changes take effect, except for security or legal compliance changes.
10.4 Continued use after changes constitutes acceptance.

11. CONTACT
For questions regarding this Acceptable Usage Policy:
• General Support: support@bookyourservice.co.in
• Legal and Compliance: legal@bookyourservice.co.in
• Registered Address: BookYourService Technologies Pvt. Ltd., Fort, Mumbai 400001, Maharashtra, India
• Website: https://bookyourservice.co.in
• Support Hours: 8:00 AM - 10:00 PM IST, 7 days a week`,
    },
  });

  // Provider Agreement
  await db.legalPage.create({
    data: {
      pageType: 'PROVIDER_AGREEMENT',
      title: 'Service Provider Agreement',
      version: '1.0',
      effectiveDate: '2025-01-01',
      content: `SERVICE PROVIDER AGREEMENT FOR BOOKYOURSERVICE

Last Updated: January 1, 2025 | Version: 1.0 | Effective Date: January 1, 2025

IMPORTANT: THIS SERVICE PROVIDER AGREEMENT ("AGREEMENT") CONSTITUTES A LEGALLY BINDING AGREEMENT BETWEEN YOU ("PROVIDER," "YOU," OR "YOUR") AND BOOKYOURSERVICE TECHNOLOGIES PVT. LTD. ("COMPANY," "WE," "US," OR "OUR"). BY REGISTERING AS A SERVICE PROVIDER ON THE PLATFORM, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THIS AGREEMENT.

1. DEFINITIONS
1.1 "Platform" means the BookYourService website at https://bookyourservice.co.in and associated mobile applications.
1.2 "Services" means the home maintenance and repair services offered by the Provider through the Platform, limited to Plumbing, Electrical, and AC & HVAC categories.
1.3 "Client" means a user of the Platform who books services through the Platform.
1.4 "Platform Fee" means the commission charged by the Company for facilitating the booking transaction.
1.5 "Booking" means a confirmed appointment for a service between a Client and a Provider.

2. SCOPE OF AGREEMENT
2.1 This Agreement governs the relationship between the Provider and the Company regarding the use of the Platform to offer and deliver services to Clients.
2.2 The Provider acknowledges that they are an INDEPENDENT CONTRACTOR and NOT an employee, agent, or representative of the Company.
2.3 The Company is an INTERMEDIARY and MARKETPLACE ONLY. The Company does NOT provide any plumbing, electrical, or AC & HVAC services directly.
2.4 Nothing in this Agreement creates an employer-employee relationship, partnership, joint venture, or agency relationship between the Provider and the Company.

3. PROVIDER OBLIGATIONS
3.1 KYC AND VERIFICATION: The Provider must complete the Know Your Customer (KYC) verification process, including submission of government-issued ID (Aadhaar, PAN, Passport, or Driving License), address proof, a recent photograph/selfie, and trade-specific certifications or licenses.
3.2 The Provider must notify the Company within 7 days of any changes to KYC information.
3.3 QUALIFICATIONS: The Provider must possess and maintain all necessary qualifications, licenses, and permits required by applicable Indian law to perform the services listed.
3.4 SERVICE QUALITY: The Provider must deliver services in a professional, workmanlike manner consistent with industry standards and applicable laws.
3.5 AVAILABILITY: The Provider must maintain accurate availability schedules on the Platform and honor accepted bookings.
3.6 PUNCTUALITY: The Provider must arrive at the scheduled time or notify the Client of delays at least 30 minutes in advance.
3.7 COMMUNICATION: The Provider must maintain professional and courteous communication with Clients through the Platform.

4. SERVICE LISTING RULES
4.1 The Provider may ONLY list services within the three approved categories: Plumbing, Electrical, and AC & HVAC.
4.2 Service listings must include accurate information: service title, detailed description, base price (INR), estimated duration, service area, and availability.
4.3 The Provider must NOT list services they are not qualified or legally permitted to perform.
4.4 Service descriptions must NOT contain misleading claims or "bait and switch" pricing.
4.5 All service images must be original or properly licensed. Stock photos misrepresenting the Provider's work are prohibited.
4.6 The Provider must NOT list the same service multiple times under different names.
4.7 The Company reserves the right to remove, modify, or reject any service listing at its sole discretion.

5. PRICING AND PAYMENTS
5.1 CURRENT PAYMENT MODEL: At present, the Company's online payment system is under development. All service payments are settled DIRECTLY between the Client and the Provider through cash, bank transfer, UPI, or any other mutually agreed method. The Company DOES NOT collect, process, hold, or handle any service payments at this time.
5.2 Upon activation of the online payment system, the following will apply:
• All payments will be processed through the Platform's secure payment gateway
• The Company will deduct the Platform Fee before disbursing the Provider's earnings
• The Provider will receive payouts according to the disbursement schedule
5.3 PLATFORM FEE: The Company charges a commission (currently 5-10%) on each completed booking. The Platform Fee is disclosed transparently during the booking process.
5.4 All prices must be listed in Indian Rupees (INR). Applicable GST must be included unless otherwise stated.
5.5 The Company is NOT responsible for any payment disputes between the Provider and the Client.

6. TAX OBLIGATIONS
6.1 The Provider is solely responsible for all tax obligations arising from services provided through the Platform, including income tax and GST.
6.2 The Provider must obtain and maintain GST registration if applicable and must provide valid tax invoices to Clients upon request.
6.3 The Company will issue Form 16A or equivalent documentation for TDS deductions as applicable.
6.4 The Company bears NO liability for the Provider's failure to comply with tax obligations.

7. INSURANCE AND LIABILITY
7.1 The Provider is solely responsible for obtaining and maintaining appropriate insurance coverage, including but not limited to: professional liability insurance, general liability insurance, workers' compensation (if employing helpers), and vehicle insurance.
7.2 The Provider assumes ALL risk and liability for:
• Personal injury, bodily harm, or death occurring during service delivery
• Property damage caused during service delivery (water damage, fire damage, electrical damage, etc.)
• Damage to Client's property or third-party property
• Any negligence, recklessness, or intentional misconduct by the Provider or their employees/agents
7.3 THE COMPANY BEARS NO LIABILITY FOR ANY DAMAGES ARISING FROM THE PROVISION OF SERVICES BY THE PROVIDER.

8. INDEMNIFICATION
8.1 The Provider agrees to indemnify, defend, and hold harmless the Company, its directors, officers, employees, agents, and affiliates from and against any and all claims, liabilities, damages, losses, costs, expenses, or fees arising out of or related to:
• Services provided or failed to be provided by the Provider
• Any breach of this Agreement by the Provider
• Any violation of applicable law by the Provider
• Any dispute between the Provider and a Client
• Any injury, damage, or loss caused by the Provider's negligence or misconduct
• Any content submitted by the Provider on the Platform

9. BOOKING COMMITMENTS
9.1 The Provider must honor all accepted bookings. Failure to do so may result in:
• Negative impact on the Provider's rating and visibility
• Account suspension for repeated cancellations
• Forfeiture of any applicable credits or benefits
9.2 The Provider may cancel bookings only in genuine emergencies and must provide a valid reason.
9.3 The Provider must not solicit Clients for transactions outside the Platform (platform bypass).
9.4 The Provider must not request additional payments beyond the agreed service price without the Client's consent.

10. INTELLECTUAL PROPERTY
10.1 The Provider grants the Company a non-exclusive, worldwide, royalty-free, transferable, sub-licensable license to use their listing content, reviews, and other user-generated content for Platform operation, marketing, and improvement.
10.2 The Provider must NOT use the "BookYourService" name, logo, or trademarks without written permission.
10.3 The Provider retains ownership of their original content, subject to the license granted above.

11. ACCOUNT SUSPENSION AND TERMINATION
11.1 The Company may suspend or terminate the Provider's account for:
• Violation of this Agreement, the AUP, or any Platform policy
• Providing false or misleading information
• Fraudulent activity or illegal conduct
• Repeated negative reviews or complaints
• Failure to pay applicable Platform Fees
• Any conduct harmful to other users or the Platform
11.2 The Provider may terminate their account by contacting support@bookyourservice.co.in.
11.3 Upon termination, all active bookings will be cancelled, pending payments processed per applicable policies, and surviving provisions (Sections 7, 8, 10) remain in effect.

12. LIMITATION OF LIABILITY
12.1 THE COMPANY'S TOTAL AGGREGATE LIABILITY SHALL NOT EXCEED THE PLATFORM FEE PAID BY THE PROVIDER IN THE TWELVE (12) MONTHS PRECEDING THE EVENT, OR INR 1,000, WHICHEVER IS LESS.
12.2 THE COMPANY IS NOT LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
12.3 THE COMPANY DOES NOT GUARANTEE ANY MINIMUM NUMBER OF BOOKINGS OR EARNINGS FOR THE PROVIDER.

13. DISPUTE RESOLUTION
13.1 Disputes shall be resolved per the dispute resolution provisions in Section 14 of the AUP.
13.2 Arbitration shall be conducted in Mumbai, Maharashtra, India per the Arbitration and Conciliation Act, 1996.
13.3 The courts of Mumbai, Maharashtra, India shall have exclusive jurisdiction.

14. MODIFICATIONS
14.1 The Company reserves the right to modify this Agreement at its sole discretion with at least 15 days' notice.
14.2 Continued use after modifications constitutes acceptance.

15. CONTACT
For questions regarding this Provider Agreement:
• General Support: support@bookyourservice.co.in
• Legal and Compliance: legal@bookyourservice.co.in
• Registered Address: BookYourService Technologies Pvt. Ltd., Fort, Mumbai 400001, Maharashtra, India
• Website: https://bookyourservice.co.in
• Support Hours: 8:00 AM - 10:00 PM IST, 7 days a week`,
    },
  });

  // Community Guidelines
  await db.legalPage.create({
    data: {
      pageType: 'COMMUNITY_GUIDELINES',
      title: 'Community Guidelines',
      version: '1.0',
      effectiveDate: '2025-01-01',
      content: `COMMUNITY GUIDELINES FOR BOOKYOURSERVICE

Last Updated: January 1, 2025 | Version: 1.0 | Effective Date: January 1, 2025

At BookYourService, we are committed to building a safe, respectful, and trustworthy community for Clients and Service Providers alike. These Community Guidelines outline the behavior expected of all users on our Platform. By using BookYourService, you agree to follow these guidelines.

1. OUR COMMUNITY VALUES
1.1 SAFETY FIRST: The safety of our users is our top priority. We expect all interactions on the Platform to prioritize physical safety, emotional well-being, and property protection.
1.2 RESPECT AND PROFESSIONALISM: Treat every user with dignity and respect. Professional communication and behavior are expected at all times.
1.3 HONESTY AND TRANSPARENCY: Be truthful in your profile, listings, reviews, and communications. Accurate information builds trust and ensures positive experiences.
1.4 FAIRNESS: Engage in fair business practices. Do not manipulate pricing, reviews, or the booking system.
1.5 ACCOUNTABILITY: Take responsibility for your actions. If you make a mistake, own it and work to make it right.

2. GUIDELINES FOR CLIENTS
2.1 RESPECT PROVIDERS: Service Providers are skilled professionals. Treat them with the same respect you would expect. Do not use abusive language, make threats, or engage in harassment.
2.2 ACCURATE BOOKING INFORMATION: Provide accurate service addresses, contact information, and special instructions. Misleading information wastes everyone's time and may result in service cancellation.
2.3 TIMELY COMMUNICATION: Respond to Provider messages promptly. If you need to cancel or reschedule, do so as early as possible.
2.4 FAIR REVIEWS: Leave honest, fair reviews based on your actual experience. Do not post retaliatory reviews or threaten negative reviews to extract discounts.
2.5 PAYMENT INTEGRITY: Pay the agreed-upon price for services rendered. Do not attempt to negotiate lower prices after a service has been completed.
2.6 PROPERTY ACCESS: Ensure the Provider has safe and appropriate access to the work area. Remove hazards and supervise children and pets during service visits.
2.7 NO SOLICITATION: Do not ask Providers to work outside the Platform or bypass the booking system.

3. GUIDELINES FOR SERVICE PROVIDERS
3.1 PROFESSIONAL CONDUCT: Arrive on time, dress appropriately, and conduct yourself professionally. You are representing both yourself and the BookYourService community.
3.2 QUALITY WORKMANSHIP: Deliver services to the best of your ability, consistent with industry standards. If a job is beyond your expertise, communicate this honestly.
3.3 TRANSPARENT PRICING: Clearly communicate the scope of work and pricing before starting. Do not add hidden charges or increase prices without the Client's consent.
3.4 RESPECT CLIENT PROPERTY: Treat the Client's home and property with care. Clean up after completing work. Report any accidental damage immediately.
3.5 HONEST REVIEWS: Do not solicit positive reviews or create fake reviews. Report any Client who offers incentives for positive reviews.
3.6 SAFETY COMPLIANCE: Follow all safety protocols relevant to your trade. Use appropriate safety equipment. Ensure electrical, plumbing, and HVAC work meets safety codes.
3.7 NO PLATFORM BYPASS: Never ask Clients to book directly with you outside the Platform or share personal contact details for the purpose of circumventing the Platform.

4. PROHIBITED BEHAVIOR
4.1 The following behaviors are strictly prohibited and may result in immediate account suspension or termination:
• Harassment, bullying, or intimidation of any kind
• Discrimination based on caste, religion, gender, sexual orientation, disability, age, or any other protected characteristic
• Use of offensive, abusive, or threatening language
• Sharing or requesting personal contact information to bypass the Platform
• Posting fake, misleading, or incentivized reviews
• Creating multiple accounts
• Providing services while under the influence of alcohol or drugs
• Engaging in any form of fraud, theft, or dishonesty
• Recording or photographing other users without their consent
• Carrying weapons or dangerous materials to a service location (beyond tools required for the service)
• Any form of physical, verbal, or sexual harassment

5. SAFETY GUIDELINES
5.1 DURING SERVICE VISITS:
• Providers should carry valid ID and present it upon request
• Clients should ensure the work area is safe and accessible
• Both parties should maintain professional boundaries
• If you feel unsafe at any time, leave the situation and contact support immediately
5.2 EMERGENCY PROCEDURES:
• In case of immediate danger, contact emergency services first (100 for police, 101 for fire, 108 for ambulance)
• Then report the incident to support@bookyourservice.co.in
• Preserve any evidence (messages, photos) for investigation

6. REVIEW AND RATING GUIDELINES
6.1 Reviews must be based on genuine, first-hand experiences.
6.2 Keep reviews factual, constructive, and professional.
6.3 Do NOT include personal information, offensive language, or irrelevant content in reviews.
6.4 Do NOT post reviews in exchange for money, discounts, or other incentives.
6.5 Do NOT threaten negative reviews to extract concessions.
6.6 The Company reserves the right to remove reviews that violate these guidelines.

7. DISPUTE RESOLUTION
7.1 If a dispute arises between a Client and a Provider, both parties should first attempt to resolve it through good-faith communication.
7.2 If informal resolution fails, use the Platform's built-in dispute resolution mechanism.
7.3 The Company will act as a mediator but is NOT bound to enforce any particular outcome.
7.4 Both parties must provide truthful information and evidence during dispute resolution.

8. CONSEQUENCES OF VIOLATIONS
8.1 FIRST MINOR VIOLATION: Warning and reminder of community guidelines.
8.2 REPEATED MINOR VIOLATIONS: Account restrictions, reduced visibility, or temporary suspension.
8.3 SERIOUS VIOLATIONS: Immediate account suspension or termination.
8.4 ILLEGAL ACTIVITY: Account termination and referral to law enforcement.
8.5 The Company reserves the right to determine the severity of violations and appropriate consequences at its sole discretion.

9. REPORTING CONCERNS
9.1 If you experience or witness behavior that violates these Community Guidelines:
• Use the in-app reporting feature on user profiles or service pages
• Email: support@bookyourservice.co.in
• Email: legal@bookyourservice.co.in for legal or safety concerns
9.2 The Company takes all reports seriously and will investigate promptly.
9.3 Reporter identity will be kept confidential to the extent permitted by law.
9.4 The Company will NOT retaliate against users who report violations in good faith.
9.5 Filing false reports is itself a violation and may result in account action.

10. POSITIVE COMMUNITY RECOGNITION
10.1 Providers who consistently deliver excellent service and maintain high ratings may receive:
• "Top Provider" badge on their profile
• Priority placement in search results
• Access to premium features and benefits
• Invitation to the Provider Advisory Board
10.2 Clients who maintain positive booking history and provide helpful reviews may receive:
• "Trusted Client" badge
• Priority booking for high-demand services
• Access to exclusive offers and discounts

11. GUIDELINE UPDATES
11.1 The Company may update these Community Guidelines at any time.
11.2 Material changes will be communicated via email, Platform notice, or in-app notification.
11.3 Continued use after changes constitutes acceptance.

12. CONTACT
For questions about these Community Guidelines:
• General Support: support@bookyourservice.co.in
• Legal and Compliance: legal@bookyourservice.co.in
• Community Team: community@bookyourservice.co.in
• Registered Address: BookYourService Technologies Pvt. Ltd., Fort, Mumbai 400001, Maharashtra, India
• Website: https://bookyourservice.co.in
• Support Hours: 8:00 AM - 10:00 PM IST, 7 days a week`,
    },
  });

  // ========================================
  // 7. REVENUE STREAMS (for 3 categories only)
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
  // 8. SEO METADATA (for 3 categories)
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
  // 9. PLATFORM STATS
  // ========================================
  console.log('📊 Creating platform stats...');
  await db.platformStats.create({
    data: {
      totalVisitors: 0,
      totalUsers: 1, // admin only
      totalProviders: 0,
      totalBookings: 0,
      totalServices: 0,
      activeVisitors: 0,
    },
  });

  // ========================================
  // NOTIFICATIONS — REMOVED (demo data)
  // ========================================
  // Demo notifications removed. Notifications will be created organically as users interact.

  // ========================================
  // SUMMARY
  // ========================================
  console.log('\n');
  console.log('========================================');
  console.log('📊 SEED DATA SUMMARY');
  console.log('========================================');
  console.log(`Roles: 10 (CLIENT, PROVIDER, ADMIN, TECHNICIAN, VENDOR, FRANCHISE, SUB_ADMIN, AREA_MANAGER, MANAGER, LOCAL_ADMIN)`);
  console.log(`Categories: 11 (Air Conditioner, Refrigerator, Washing Machine, Kitchen Appliances, TV Repair, Water Purifier, Geyser, Plumber, Electrician, Water Tank Cleaning, Movers and Packers)`);
  console.log(`Subcategories: 47 (3-5 per category)`);
  console.log(`Admin User: 1 (admin@bookyourservice.co.in / admin@123)`);
  console.log(`Providers: 0 (removed — providers will register through the app)`);
  console.log(`Clients: 0 (removed — clients will register through the app)`);
  console.log(`Services: 0 (removed — services will be created by providers)`);
  console.log(`Bookings: 0 (removed — bookings will be created organically)`);
  console.log(`Reviews: 0 (removed)`);
  console.log(`FAQs: ${faqData.length}`);
  console.log(`Legal Pages: 7 (Terms, Privacy, Refund, Cookies, AUP, Provider Agreement, Community Guidelines)`);
  console.log(`Revenue Streams: ${revenueStreamData.length}`);
  console.log(`SEO Metadata: ${seoData.length}`);
  console.log(`Notifications: 0 (removed — notifications will be created organically)`);
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
