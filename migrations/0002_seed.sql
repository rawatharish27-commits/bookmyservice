-- BookYourService D1 Seed Data
-- Run with: npx wrangler d1 execute bookyourservice-db --file=./migrations/0002_seed.sql
--
-- IMPORTANT: Password hashes use the placeholder 'REPLACE_AFTER_SEED'.
-- After seeding, run a password-update script to set proper bcrypt hashes:
--   admin@bookyourservice.co.in / admin123
--   provider accounts / provider123
--   client accounts / client123
--
-- ID Reference:
--   Roles:       1=CLIENT, 2=PROVIDER, 3=ADMIN
--   Categories:  1=Plumbing, 2=Electrical, 3=AC & HVAC
--   Subcats:     1-10 Plumbing, 11-20 Electrical, 21-30 AC & HVAC
--   Users:       usr_admin_001, usr_provider_001-005, usr_client_001-008
--   Services:    svc_001 through svc_014
--   Bookings:    bkg_001 through bkg_012

-- ========================================
-- 1. ROLES
-- ========================================
INSERT INTO Role (id, name, description) VALUES (1, 'CLIENT', 'Regular client who books services');
INSERT INTO Role (id, name, description) VALUES (2, 'PROVIDER', 'Service provider who offers services');
INSERT INTO Role (id, name, description) VALUES (3, 'ADMIN', 'Platform administrator with full access');

-- ========================================
-- 2. SERVICE CATEGORIES
-- ========================================
INSERT INTO ServiceCategory (id, name, slug, icon, description, displayOrder, isActive) VALUES (1, 'Plumbing', 'plumbing', 'Droplets', 'Professional plumbing services for your home', 1, 1);
INSERT INTO ServiceCategory (id, name, slug, icon, description, displayOrder, isActive) VALUES (2, 'Electrical', 'electrical', 'Zap', 'Licensed electrical services for your home', 2, 1);
INSERT INTO ServiceCategory (id, name, slug, icon, description, displayOrder, isActive) VALUES (3, 'AC & HVAC', 'ac-hvac', 'Wind', 'Air conditioning and heating services for your home', 3, 1);

-- ========================================
-- 3. SUBCATEGORIES (10 per category)
-- ========================================
-- Plumbing (categoryId=1)
INSERT INTO ServiceSubcategory (id, categoryId, name, slug, description, displayOrder, isActive) VALUES (1, 1, 'Leak Repair', 'leak-repair', 'Detection and repair of pipe leaks and water seepage', 1, 1);
INSERT INTO ServiceSubcategory (id, categoryId, name, slug, description, displayOrder, isActive) VALUES (2, 1, 'Drain Cleaning', 'drain-cleaning', 'Blocked drain and sewer line cleaning services', 2, 1);
INSERT INTO ServiceSubcategory (id, categoryId, name, slug, description, displayOrder, isActive) VALUES (3, 1, 'Pipe Installation', 'pipe-installation', 'New pipe installation and replacement services', 3, 1);
INSERT INTO ServiceSubcategory (id, categoryId, name, slug, description, displayOrder, isActive) VALUES (4, 1, 'Faucet Repair', 'faucet-repair', 'Tap and faucet repair and replacement', 4, 1);
INSERT INTO ServiceSubcategory (id, categoryId, name, slug, description, displayOrder, isActive) VALUES (5, 1, 'Toilet Installation', 'toilet-installation', 'Toilet seat, cistern, and flush installation', 5, 1);
INSERT INTO ServiceSubcategory (id, categoryId, name, slug, description, displayOrder, isActive) VALUES (6, 1, 'Water Heater Repair', 'water-heater-repair', 'Geyser and water heater repair and servicing', 6, 1);
INSERT INTO ServiceSubcategory (id, categoryId, name, slug, description, displayOrder, isActive) VALUES (7, 1, 'Sewage Cleaning', 'sewage-cleaning', 'Sewage line cleaning and unclogging services', 7, 1);
INSERT INTO ServiceSubcategory (id, categoryId, name, slug, description, displayOrder, isActive) VALUES (8, 1, 'Shower/Tub Repair', 'shower-tub-repair', 'Shower and bathtub repair and fitting services', 8, 1);
INSERT INTO ServiceSubcategory (id, categoryId, name, slug, description, displayOrder, isActive) VALUES (9, 1, 'Gas Line Servicing', 'gas-line-servicing', 'Gas pipe installation, repair, and safety checks', 9, 1);
INSERT INTO ServiceSubcategory (id, categoryId, name, slug, description, displayOrder, isActive) VALUES (10, 1, 'Pump Repair', 'pump-repair', 'Water pump and motor repair and installation', 10, 1);

-- Electrical (categoryId=2)
INSERT INTO ServiceSubcategory (id, categoryId, name, slug, description, displayOrder, isActive) VALUES (11, 2, 'Wiring Repairs', 'wiring-repairs', 'House wiring repair and rewiring services', 1, 1);
INSERT INTO ServiceSubcategory (id, categoryId, name, slug, description, displayOrder, isActive) VALUES (12, 2, 'Light Fixture Installation', 'light-fixture-installation', 'Chandelier, tube light, and LED fixture installation', 2, 1);
INSERT INTO ServiceSubcategory (id, categoryId, name, slug, description, displayOrder, isActive) VALUES (13, 2, 'Socket Repairs', 'socket-repairs', 'Switch and socket point repair and installation', 3, 1);
INSERT INTO ServiceSubcategory (id, categoryId, name, slug, description, displayOrder, isActive) VALUES (14, 2, 'Circuit Breaker Fixing', 'circuit-breaker-fixing', 'MCB, DB box, and circuit breaker repair and setup', 4, 1);
INSERT INTO ServiceSubcategory (id, categoryId, name, slug, description, displayOrder, isActive) VALUES (15, 2, 'Ceiling Fan Installation', 'ceiling-fan-installation', 'Ceiling fan mounting, wiring, and repair', 5, 1);
INSERT INTO ServiceSubcategory (id, categoryId, name, slug, description, displayOrder, isActive) VALUES (16, 2, 'Smart Home Setup', 'smart-home-setup', 'Smart home automation wiring and device setup', 6, 1);
INSERT INTO ServiceSubcategory (id, categoryId, name, slug, description, displayOrder, isActive) VALUES (17, 2, 'Generator Maintenance', 'generator-maintenance', 'Generator servicing, repair, and maintenance', 7, 1);
INSERT INTO ServiceSubcategory (id, categoryId, name, slug, description, displayOrder, isActive) VALUES (18, 2, 'Switchboard Upgrades', 'switchboard-upgrades', 'Switchboard and distribution board upgrades', 8, 1);
INSERT INTO ServiceSubcategory (id, categoryId, name, slug, description, displayOrder, isActive) VALUES (19, 2, 'Panel Repair', 'panel-repair', 'Electrical panel and control panel repair', 9, 1);
INSERT INTO ServiceSubcategory (id, categoryId, name, slug, description, displayOrder, isActive) VALUES (20, 2, 'Appliance Grounding', 'appliance-grounding', 'Earthing, grounding, and electrical safety installation', 10, 1);

-- AC & HVAC (categoryId=3)
INSERT INTO ServiceSubcategory (id, categoryId, name, slug, description, displayOrder, isActive) VALUES (21, 3, 'AC Installation', 'ac-installation', 'Split and window AC installation services', 1, 1);
INSERT INTO ServiceSubcategory (id, categoryId, name, slug, description, displayOrder, isActive) VALUES (22, 3, 'AC Repair', 'ac-repair', 'AC cooling issues, troubleshooting, and repair', 2, 1);
INSERT INTO ServiceSubcategory (id, categoryId, name, slug, description, displayOrder, isActive) VALUES (23, 3, 'AC Cleaning/Servicing', 'ac-cleaning-servicing', 'Foam wash, deep cleaning, and regular AC servicing', 3, 1);
INSERT INTO ServiceSubcategory (id, categoryId, name, slug, description, displayOrder, isActive) VALUES (24, 3, 'Heating Unit Repairs', 'heating-unit-repairs', 'Heater and heating system repair services', 4, 1);
INSERT INTO ServiceSubcategory (id, categoryId, name, slug, description, displayOrder, isActive) VALUES (25, 3, 'Thermostat Setup', 'thermostat-setup', 'Thermostat installation, calibration, and repair', 5, 1);
INSERT INTO ServiceSubcategory (id, categoryId, name, slug, description, displayOrder, isActive) VALUES (26, 3, 'Central Air Maintenance', 'central-air-maintenance', 'Central air conditioning system maintenance and servicing', 6, 1);
INSERT INTO ServiceSubcategory (id, categoryId, name, slug, description, displayOrder, isActive) VALUES (27, 3, 'Duct Cleaning', 'duct-cleaning', 'HVAC duct cleaning and sanitization services', 7, 1);
INSERT INTO ServiceSubcategory (id, categoryId, name, slug, description, displayOrder, isActive) VALUES (28, 3, 'Furnace Repair', 'furnace-repair', 'Furnace diagnosis, repair, and maintenance', 8, 1);
INSERT INTO ServiceSubcategory (id, categoryId, name, slug, description, displayOrder, isActive) VALUES (29, 3, 'Ventilator Services', 'ventilator-services', 'Ventilation system installation and servicing', 9, 1);
INSERT INTO ServiceSubcategory (id, categoryId, name, slug, description, displayOrder, isActive) VALUES (30, 3, 'Gas Refilling', 'gas-refilling', 'Refrigerant gas refill and leak fixing services', 10, 1);

-- ========================================
-- 4. ADMIN USER
-- ========================================
INSERT INTO User (id, email, phone, passwordHash, name, roleId, status, emailVerified, phoneVerified, city, state, country, pincode, address) VALUES
  ('usr_admin_001', 'admin@bookyourservice.co.in', '+919876543210', 'REPLACE_AFTER_SEED', 'Admin User', 3, 'ACTIVE', 1, 1, 'Mumbai', 'Maharashtra', 'India', '400001', 'BookYourService HQ, Fort, Mumbai');

-- ========================================
-- 5. SERVICE PROVIDERS (5 providers)
-- ========================================
INSERT INTO User (id, email, phone, passwordHash, name, roleId, status, emailVerified, phoneVerified, city, state, country, pincode, address, latitude, longitude) VALUES
  ('usr_provider_001', 'rajesh.kumar@gmail.com', '+919812345670', 'REPLACE_AFTER_SEED', 'Rajesh Kumar', 2, 'ACTIVE', 1, 1, 'Delhi', 'Delhi', 'India', '110001', '45, Connaught Place, New Delhi', 28.6315, 77.2167),
  ('usr_provider_002', 'priya.sharma@gmail.com', '+919812345671', 'REPLACE_AFTER_SEED', 'Priya Sharma', 2, 'ACTIVE', 1, 1, 'Mumbai', 'Maharashtra', 'India', '400051', '12, Andheri West, Mumbai', 19.1197, 72.8464),
  ('usr_provider_003', 'arun.patel@gmail.com', '+919812345672', 'REPLACE_AFTER_SEED', 'Arun Patel', 2, 'ACTIVE', 1, 1, 'Bengaluru', 'Karnataka', 'India', '560001', '78, Koramangala, Bengaluru', 12.9352, 77.6245),
  ('usr_provider_004', 'srinivas.rao@gmail.com', '+919812345673', 'REPLACE_AFTER_SEED', 'Srinivas Rao', 2, 'ACTIVE', 1, 1, 'Hyderabad', 'Telangana', 'India', '500001', '23, Banjara Hills, Hyderabad', 17.4156, 78.4489),
  ('usr_provider_005', 'karthik.iyer@gmail.com', '+919812345674', 'REPLACE_AFTER_SEED', 'Karthik Iyer', 2, 'ACTIVE', 1, 1, 'Chennai', 'Tamil Nadu', 'India', '600001', '89, T. Nagar, Chennai', 13.0418, 80.2341);

-- Provider KYC records
INSERT INTO ProviderKyc (id, providerId, documentType, documentNumber, documentFrontUrl, documentBackUrl, selfieUrl, verificationStatus, verifiedBy, verifiedAt) VALUES
  ('kyc_001', 'usr_provider_001', 'AADHAAR', '234567890123', '/uploads/kyc/rajesh-aadhaar-front.jpg', '/uploads/kyc/rajesh-aadhaar-back.jpg', '/uploads/kyc/rajesh-selfie.jpg', 'APPROVED', 'usr_admin_001', '2025-01-15T00:00:00'),
  ('kyc_002', 'usr_provider_002', 'PAN', 'ABCDE1234F', '/uploads/kyc/priya-pan-front.jpg', NULL, '/uploads/kyc/priya-selfie.jpg', 'APPROVED', 'usr_admin_001', '2025-01-15T00:00:00'),
  ('kyc_003', 'usr_provider_003', 'DRIVING_LICENSE', 'KA0120120012345', '/uploads/kyc/arun-dl-front.jpg', '/uploads/kyc/arun-dl-back.jpg', '/uploads/kyc/arun-selfie.jpg', 'APPROVED', 'usr_admin_001', '2025-01-15T00:00:00'),
  ('kyc_004', 'usr_provider_004', 'AADHAAR', '567890123456', '/uploads/kyc/srinivas-aadhaar-front.jpg', '/uploads/kyc/srinivas-aadhaar-back.jpg', '/uploads/kyc/srinivas-selfie.jpg', 'APPROVED', 'usr_admin_001', '2025-01-15T00:00:00'),
  ('kyc_005', 'usr_provider_005', 'PASSPORT', 'T5678901', '/uploads/kyc/karthik-passport-front.jpg', '/uploads/kyc/karthik-passport-back.jpg', '/uploads/kyc/karthik-selfie.jpg', 'APPROVED', 'usr_admin_001', '2025-01-15T00:00:00');

-- ========================================
-- 6. CLIENT USERS (8 clients)
-- ========================================
INSERT INTO User (id, email, phone, passwordHash, name, roleId, status, emailVerified, phoneVerified, city, state, country, pincode, address, latitude, longitude) VALUES
  ('usr_client_001', 'anita.desai@gmail.com', '+919912345670', 'REPLACE_AFTER_SEED', 'Anita Desai', 1, 'ACTIVE', 1, 1, 'Hyderabad', 'Telangana', 'India', '500001', '23, Banjara Hills, Hyderabad', 17.4156, 78.4489),
  ('usr_client_002', 'vikram.singh@gmail.com', '+919912345671', 'REPLACE_AFTER_SEED', 'Vikram Singh', 1, 'ACTIVE', 1, 1, 'Delhi', 'Delhi', 'India', '110001', '56, GK-II, New Delhi', 28.5485, 77.2485),
  ('usr_client_003', 'meera.nair@gmail.com', '+919912345672', 'REPLACE_AFTER_SEED', 'Meera Nair', 1, 'PENDING', 0, 1, 'Chennai', 'Tamil Nadu', 'India', '600001', '89, T. Nagar, Chennai', 13.0418, 80.2341),
  ('usr_client_004', 'suresh.reddy@gmail.com', '+919912345673', 'REPLACE_AFTER_SEED', 'Suresh Reddy', 1, 'ACTIVE', 1, 1, 'Bengaluru', 'Karnataka', 'India', '560034', '34, Whitefield, Bengaluru', 12.9698, 77.7500),
  ('usr_client_005', 'kavita.joshi@gmail.com', '+919912345674', 'REPLACE_AFTER_SEED', 'Kavita Joshi', 1, 'BLOCKED', 1, 0, 'Mumbai', 'Maharashtra', 'India', '400051', '67, Malviya Nagar, Mumbai', 19.0596, 72.8456),
  ('usr_client_006', 'deepak.verma@gmail.com', '+919912345675', 'REPLACE_AFTER_SEED', 'Deepak Verma', 1, 'ACTIVE', 1, 1, 'Hyderabad', 'Telangana', 'India', '500034', '12, Madhapur, Hyderabad', 17.4491, 78.3912),
  ('usr_client_007', 'pooja.menon@gmail.com', '+919912345676', 'REPLACE_AFTER_SEED', 'Pooja Menon', 1, 'SUSPENDED', 1, 1, 'Chennai', 'Tamil Nadu', 'India', '600018', '45, Adyar, Chennai', 13.0067, 80.2572),
  ('usr_client_008', 'rahul.gupta@gmail.com', '+919912345677', 'REPLACE_AFTER_SEED', 'Rahul Gupta', 1, 'ACTIVE', 1, 1, 'Delhi', 'Delhi', 'India', '110019', '78, Saket, New Delhi', 28.5244, 77.2066);

-- ========================================
-- 7. SERVICES (14 services)
-- ========================================
-- Rajesh Kumar - Delhi (Plumbing + Electrical)
INSERT INTO Service (id, providerId, categoryId, subcategoryId, title, description, basePrice, priceNegotiable, serviceDurationMinutes, serviceAreaRadiusKm, city, state, country, address, pincode, latitude, longitude, isActive, isApproved, approvalStatus, approvedBy, approvedAt, averageRating, totalBookings, totalReviews) VALUES
  ('svc_001', 'usr_provider_001', 1, 1, 'Professional Leak Repair & Detection Service', 'Expert plumbing service for detecting and repairing all types of pipe leakages, water seepage, and dampness issues. We use advanced leak detection equipment including thermal imaging and acoustic sensors. Service includes thorough inspection, precise leak location identification, professional repair using quality materials, and post-repair pressure testing to ensure the fix is permanent.', 499, 1, 60, 15, 'Delhi', 'Delhi', 'India', '45, Connaught Place, New Delhi', '110001', 28.6315, 77.2167, 1, 1, 'APPROVED', 'usr_admin_001', '2025-01-20T00:00:00', 4.2, 25, 10),
  ('svc_002', 'usr_provider_001', 1, 5, 'Toilet Installation & Repair Service', 'Complete toilet installation, replacement, and repair service. Whether you need a new western-style toilet installed, an existing one repaired, or a cistern fixed, our experienced plumbers handle it all. We work with all major brands and ensure proper sealing, water connection, and flush mechanism setup. Same-day service available for urgent repairs.', 399, 0, 90, 15, 'Delhi', 'Delhi', 'India', '45, Connaught Place, New Delhi', '110001', 28.6315, 77.2167, 1, 1, 'APPROVED', 'usr_admin_001', '2025-01-20T00:00:00', 4.5, 12, 5),
  ('svc_003', 'usr_provider_001', 2, 11, 'Complete House Wiring & Rewiring Service', 'Professional house wiring and rewiring by licensed electricians with 10+ years of experience. We handle new construction wiring, old house rewiring, and electrical system upgrades. All work meets ISI standards and local electrical codes. Includes conduit piping, wire pulling, switch and socket connections, DB box setup, and thorough safety testing.', 499, 1, 240, 20, 'Delhi', 'Delhi', 'India', '45, Connaught Place, New Delhi', '110001', 28.6315, 77.2167, 1, 1, 'APPROVED', 'usr_admin_001', '2025-01-20T00:00:00', 4.0, 8, 3);

-- Priya Sharma - Mumbai (Electrical + AC & HVAC)
INSERT INTO Service (id, providerId, categoryId, subcategoryId, title, description, basePrice, priceNegotiable, serviceDurationMinutes, serviceAreaRadiusKm, city, state, country, address, pincode, latitude, longitude, isActive, isApproved, approvalStatus, approvedBy, approvedAt, averageRating, totalBookings, totalReviews) VALUES
  ('svc_004', 'usr_provider_002', 2, 12, 'Light Fixture & Chandelier Installation', 'Professional installation of all types of light fixtures including chandeliers, pendant lights, recessed lighting, tube lights, LED panels, and decorative fixtures. We handle ceiling mounting, wiring, switch connection, and dimmer setup. Our electricians ensure safe installation with proper load balancing and circuit protection.', 349, 0, 60, 20, 'Mumbai', 'Maharashtra', 'India', '12, Andheri West, Mumbai', '400051', 19.1197, 72.8464, 1, 1, 'APPROVED', 'usr_admin_001', '2025-01-20T00:00:00', 3.8, 33, 15),
  ('svc_005', 'usr_provider_002', 2, 16, 'Smart Home Automation Setup', 'Transform your home with smart home automation. We install and configure smart switches, smart lights, motion sensors, smart doorbells, voice assistant integration (Alexa/Google Home), and automated curtain controls. Complete setup includes Wi-Fi configuration, app setup, and user training. Make your home future-ready with our expert smart home services.', 499, 1, 180, 20, 'Mumbai', 'Maharashtra', 'India', '12, Andheri West, Mumbai', '400051', 19.1197, 72.8464, 1, 1, 'APPROVED', 'usr_admin_001', '2025-01-20T00:00:00', 4.7, 5, 2),
  ('svc_006', 'usr_provider_002', 3, 23, 'AC Deep Cleaning & Servicing', 'Comprehensive AC cleaning and servicing for split and window ACs. Our foam wash deep cleaning removes dust, mold, and bacteria from evaporator and condenser coils, filters, and drain pan. Includes gas level check, thermostat calibration, electrical connection inspection, and performance testing. Improves cooling efficiency and air quality. Recommended every 6 months.', 349, 0, 60, 25, 'Mumbai', 'Maharashtra', 'India', '12, Andheri West, Mumbai', '400051', 19.1197, 72.8464, 1, 1, 'APPROVED', 'usr_admin_001', '2025-01-20T00:00:00', 4.3, 18, 8);

-- Arun Patel - Bengaluru (AC & HVAC)
INSERT INTO Service (id, providerId, categoryId, subcategoryId, title, description, basePrice, priceNegotiable, serviceDurationMinutes, serviceAreaRadiusKm, city, state, country, address, pincode, latitude, longitude, isActive, isApproved, approvalStatus, approvedBy, approvedAt, averageRating, totalBookings, totalReviews) VALUES
  ('svc_007', 'usr_provider_003', 3, 21, 'Split & Window AC Installation', 'Professional AC installation by certified technician. For split ACs: includes wall bracket mounting, indoor-outdoor unit connection, copper piping (up to 10 ft), drainage pipe setup, gas charging, electrical connection, and performance testing. For window ACs: includes window frame preparation, unit mounting, sealing, and testing. We install all major brands. 30-day service warranty included.', 499, 0, 120, 20, 'Bengaluru', 'Karnataka', 'India', '78, Koramangala, Bengaluru', '560001', 12.9352, 77.6245, 1, 1, 'APPROVED', 'usr_admin_001', '2025-01-20T00:00:00', 4.8, 41, 18),
  ('svc_008', 'usr_provider_003', 3, 30, 'AC Gas Refilling & Leak Fixing', 'Complete AC gas refill service with leak detection and fixing. We use genuine refrigerant gas (R32/R410a/R22 as applicable) and ensure optimal cooling performance. Service includes pressure testing, leak detection using UV dye, leak sealing, vacuum pumping, gas charging to manufacturer specifications, and performance verification. 90-day warranty on gas refill.', 499, 1, 90, 20, 'Bengaluru', 'Karnataka', 'India', '78, Koramangala, Bengaluru', '560001', 12.9352, 77.6245, 1, 1, 'APPROVED', 'usr_admin_001', '2025-01-20T00:00:00', 3.9, 7, 3),
  ('svc_009', 'usr_provider_003', 3, 22, 'AC Repair & Troubleshooting Service', 'Expert AC repair service for all types of issues — not cooling, strange noises, water leakage, remote not working, compressor problems, or electrical faults. Our certified technicians diagnose the issue quickly and provide transparent repair estimates. We service all brands including Daikin, Voltas, LG, Samsung, Blue Star, and more. Genuine spare parts used with warranty.', 399, 1, 60, 20, 'Bengaluru', 'Karnataka', 'India', '78, Koramangala, Bengaluru', '560001', 12.9352, 77.6245, 1, 1, 'APPROVED', 'usr_admin_001', '2025-01-20T00:00:00', 4.1, 15, 7);

-- Srinivas Rao - Hyderabad (Plumbing + AC & HVAC)
INSERT INTO Service (id, providerId, categoryId, subcategoryId, title, description, basePrice, priceNegotiable, serviceDurationMinutes, serviceAreaRadiusKm, city, state, country, address, pincode, latitude, longitude, isActive, isApproved, approvalStatus, approvedBy, approvedAt, averageRating, totalBookings, totalReviews) VALUES
  ('svc_010', 'usr_provider_004', 1, 2, 'Drain Cleaning & Unclogging Service', 'Professional drain cleaning service for kitchen sinks, bathroom drains, floor drains, and main sewer lines. We use high-pressure water jetting, motorized drain snakes, and chemical treatments to clear blockages caused by grease, hair, food waste, and tree roots. Includes camera inspection for persistent blocks. Preventive maintenance tips provided.', 349, 0, 60, 15, 'Hyderabad', 'Telangana', 'India', '23, Banjara Hills, Hyderabad', '500001', 17.4156, 78.4489, 1, 1, 'APPROVED', 'usr_admin_001', '2025-01-20T00:00:00', 4.6, 22, 9),
  ('svc_011', 'usr_provider_004', 1, 6, 'Water Heater/Geyser Repair & Installation', 'Expert water heater and geyser repair, servicing, and installation. We handle both electric and gas water heaters of all brands and capacities. Services include thermostat replacement, heating element change, valve repair, tank cleaning, anode rod replacement, and new unit installation. Safety checks included with every service. Same-day repair available.', 449, 1, 60, 15, 'Hyderabad', 'Telangana', 'India', '23, Banjara Hills, Hyderabad', '500001', 17.4156, 78.4489, 1, 1, 'APPROVED', 'usr_admin_001', '2025-01-20T00:00:00', 4.4, 9, 4),
  ('svc_012', 'usr_provider_004', 3, 27, 'HVAC Duct Cleaning & Sanitization', 'Professional HVAC duct cleaning service for homes and offices. We remove dust, allergens, mold, and contaminants from air ducts using powerful vacuum systems and rotary brushes. Includes vent cover cleaning, filter replacement, and antimicrobial sanitization treatment. Improves indoor air quality and HVAC efficiency. Recommended annually.', 499, 1, 180, 20, 'Hyderabad', 'Telangana', 'India', '23, Banjara Hills, Hyderabad', '500001', 17.4156, 78.4489, 1, 1, 'APPROVED', 'usr_admin_001', '2025-01-20T00:00:00', 3.7, 3, 1);

-- Karthik Iyer - Chennai (Electrical + Plumbing)
INSERT INTO Service (id, providerId, categoryId, subcategoryId, title, description, basePrice, priceNegotiable, serviceDurationMinutes, serviceAreaRadiusKm, city, state, country, address, pincode, latitude, longitude, isActive, isApproved, approvalStatus, approvedBy, approvedAt, averageRating, totalBookings, totalReviews) VALUES
  ('svc_013', 'usr_provider_005', 2, 15, 'Ceiling Fan Installation & Repair', 'Professional ceiling fan installation, repair, and replacement service. We install all types of fans — regular ceiling fans, decorative fans, hunter fans, and exhaust fans. Service includes ceiling hook mounting, downrod installation, wiring from switch to fan, regulator setup, and blade balancing. Repair service covers motor winding, capacitor replacement, and noise fixing.', 349, 0, 45, 15, 'Chennai', 'Tamil Nadu', 'India', '89, T. Nagar, Chennai', '600001', 13.0418, 80.2341, 1, 1, 'APPROVED', 'usr_admin_001', '2025-01-20T00:00:00', 4.9, 28, 12),
  ('svc_014', 'usr_provider_005', 2, 14, 'Circuit Breaker & DB Box Repair', 'Expert circuit breaker, MCB, and distribution board (DB box) repair and upgrade service. We diagnose tripping breakers, replace faulty MCBs/RCCBs, upgrade DB boxes, add new circuits, and ensure proper load distribution. All work complies with electrical safety standards. Includes thorough wiring inspection and safety audit. Emergency same-day service available.', 399, 1, 90, 15, 'Chennai', 'Tamil Nadu', 'India', '89, T. Nagar, Chennai', '600001', 13.0418, 80.2341, 1, 1, 'APPROVED', 'usr_admin_001', '2025-01-20T00:00:00', 4.0, 11, 5);

-- ========================================
-- SERVICE AVAILABILITY SLOTS
-- (14 services × 6 days = 84 slots)
-- Mon-Fri 9AM-7PM, Sat 9AM-3PM
-- ========================================
-- Service svc_001
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_001', 'svc_001', 1, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_002', 'svc_001', 2, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_003', 'svc_001', 3, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_004', 'svc_001', 4, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_005', 'svc_001', 5, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_006', 'svc_001', 6, '09:00', '15:00', 1, 2);
-- Service svc_002
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_007', 'svc_002', 1, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_008', 'svc_002', 2, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_009', 'svc_002', 3, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_010', 'svc_002', 4, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_011', 'svc_002', 5, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_012', 'svc_002', 6, '09:00', '15:00', 1, 2);
-- Service svc_003
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_013', 'svc_003', 1, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_014', 'svc_003', 2, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_015', 'svc_003', 3, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_016', 'svc_003', 4, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_017', 'svc_003', 5, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_018', 'svc_003', 6, '09:00', '15:00', 1, 2);
-- Service svc_004
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_019', 'svc_004', 1, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_020', 'svc_004', 2, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_021', 'svc_004', 3, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_022', 'svc_004', 4, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_023', 'svc_004', 5, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_024', 'svc_004', 6, '09:00', '15:00', 1, 2);
-- Service svc_005
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_025', 'svc_005', 1, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_026', 'svc_005', 2, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_027', 'svc_005', 3, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_028', 'svc_005', 4, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_029', 'svc_005', 5, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_030', 'svc_005', 6, '09:00', '15:00', 1, 2);
-- Service svc_006
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_031', 'svc_006', 1, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_032', 'svc_006', 2, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_033', 'svc_006', 3, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_034', 'svc_006', 4, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_035', 'svc_006', 5, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_036', 'svc_006', 6, '09:00', '15:00', 1, 2);
-- Service svc_007
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_037', 'svc_007', 1, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_038', 'svc_007', 2, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_039', 'svc_007', 3, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_040', 'svc_007', 4, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_041', 'svc_007', 5, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_042', 'svc_007', 6, '09:00', '15:00', 1, 2);
-- Service svc_008
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_043', 'svc_008', 1, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_044', 'svc_008', 2, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_045', 'svc_008', 3, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_046', 'svc_008', 4, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_047', 'svc_008', 5, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_048', 'svc_008', 6, '09:00', '15:00', 1, 2);
-- Service svc_009
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_049', 'svc_009', 1, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_050', 'svc_009', 2, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_051', 'svc_009', 3, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_052', 'svc_009', 4, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_053', 'svc_009', 5, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_054', 'svc_009', 6, '09:00', '15:00', 1, 2);
-- Service svc_010
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_055', 'svc_010', 1, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_056', 'svc_010', 2, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_057', 'svc_010', 3, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_058', 'svc_010', 4, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_059', 'svc_010', 5, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_060', 'svc_010', 6, '09:00', '15:00', 1, 2);
-- Service svc_011
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_061', 'svc_011', 1, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_062', 'svc_011', 2, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_063', 'svc_011', 3, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_064', 'svc_011', 4, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_065', 'svc_011', 5, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_066', 'svc_011', 6, '09:00', '15:00', 1, 2);
-- Service svc_012
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_067', 'svc_012', 1, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_068', 'svc_012', 2, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_069', 'svc_012', 3, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_070', 'svc_012', 4, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_071', 'svc_012', 5, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_072', 'svc_012', 6, '09:00', '15:00', 1, 2);
-- Service svc_013
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_073', 'svc_013', 1, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_074', 'svc_013', 2, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_075', 'svc_013', 3, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_076', 'svc_013', 4, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_077', 'svc_013', 5, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_078', 'svc_013', 6, '09:00', '15:00', 1, 2);
-- Service svc_014
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_079', 'svc_014', 1, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_080', 'svc_014', 2, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_081', 'svc_014', 3, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_082', 'svc_014', 4, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_083', 'svc_014', 5, '09:00', '19:00', 1, 2);
INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot) VALUES ('avail_084', 'svc_014', 6, '09:00', '15:00', 1, 2);

-- ========================================
-- 8. BOOKINGS (12 bookings)
-- ========================================
INSERT INTO Booking (id, bookingNumber, clientId, providerId, serviceId, status, scheduledDate, scheduledTime, serviceAddress, basePrice, finalPrice, platformFee, providerEarnings, completedAt, paymentStatus) VALUES
  ('bkg_001', 'BYS-1001-SEED01', 'usr_client_001', 'usr_provider_001', 'svc_001', 'COMPLETED', '2025-07-10', '10:00', '23, Banjara Hills, Hyderabad', 499, 499, 25, 474, '2025-07-10T11:30:00', 'PAID'),
  ('bkg_002', 'BYS-1002-SEED02', 'usr_client_002', 'usr_provider_002', 'svc_004', 'COMPLETED', '2025-07-12', '09:00', '56, GK-II, New Delhi', 349, 349, 17, 332, '2025-07-12T10:30:00', 'PAID'),
  ('bkg_003', 'BYS-1003-SEED03', 'usr_client_004', 'usr_provider_003', 'svc_007', 'COMPLETED', '2025-07-15', '11:00', '34, Whitefield, Bengaluru', 499, 499, 25, 474, '2025-07-15T13:00:00', 'PAID'),
  ('bkg_004', 'BYS-1004-SEED04', 'usr_client_001', 'usr_provider_004', 'svc_010', 'COMPLETED', '2025-07-18', '14:00', '23, Banjara Hills, Hyderabad', 349, 349, 17, 332, '2025-07-18T15:00:00', 'PAID'),
  ('bkg_005', 'BYS-1005-SEED05', 'usr_client_006', 'usr_provider_005', 'svc_013', 'COMPLETED', '2025-07-20', '10:00', '12, Madhapur, Hyderabad', 399, 399, 20, 379, '2025-07-20T11:00:00', 'PAID'),
  ('bkg_006', 'BYS-1006-SEED06', 'usr_client_008', 'usr_provider_001', 'svc_002', 'COMPLETED', '2025-07-25', '10:00', '78, Saket, New Delhi', 399, 399, 20, 379, '2025-07-25T12:00:00', 'PAID'),
  ('bkg_007', 'BYS-1007-SEED07', 'usr_client_004', 'usr_provider_003', 'svc_008', 'COMPLETED', '2025-08-01', '15:00', '34, Whitefield, Bengaluru', 499, 499, 25, 474, '2025-08-01T16:30:00', 'PAID'),
  ('bkg_008', 'BYS-1008-SEED08', 'usr_client_002', 'usr_provider_002', 'svc_006', 'COMPLETED', '2025-08-05', '09:00', '56, GK-II, New Delhi', 349, 349, 17, 332, '2025-08-05T10:30:00', 'PAID');

-- Booking 9: PENDING with special instructions
INSERT INTO Booking (id, bookingNumber, clientId, providerId, serviceId, status, scheduledDate, scheduledTime, serviceAddress, basePrice, finalPrice, platformFee, paymentStatus, specialInstructions) VALUES
  ('bkg_009', 'BYS-1009-SEED09', 'usr_client_001', 'usr_provider_003', 'svc_009', 'PENDING', '2025-08-10', '11:00', '23, Banjara Hills, Hyderabad', 399, 399, 20, 'PENDING', 'Please call before arriving');

-- Booking 10: ACCEPTED
INSERT INTO Booking (id, bookingNumber, clientId, providerId, serviceId, status, scheduledDate, scheduledTime, serviceAddress, basePrice, finalPrice, platformFee, paymentStatus) VALUES
  ('bkg_010', 'BYS-1010-SEED10', 'usr_client_004', 'usr_provider_004', 'svc_011', 'ACCEPTED', '2025-08-12', '14:00', '34, Whitefield, Bengaluru', 449, 449, 22, 'PAID');

-- Booking 11: IN_PROGRESS with negotiated price
INSERT INTO Booking (id, bookingNumber, clientId, providerId, serviceId, status, scheduledDate, scheduledTime, serviceAddress, basePrice, negotiatedPrice, finalPrice, platformFee, paymentStatus) VALUES
  ('bkg_011', 'BYS-1011-SEED11', 'usr_client_008', 'usr_provider_001', 'svc_003', 'IN_PROGRESS', '2025-08-15', '08:00', '78, Saket, New Delhi', 499, 449, 449, 22, 'PAID');

-- Booking 12: CANCELLED
INSERT INTO Booking (id, bookingNumber, clientId, providerId, serviceId, status, scheduledDate, scheduledTime, serviceAddress, basePrice, finalPrice, platformFee, paymentStatus, cancellationReason, cancelledBy, cancelledAt) VALUES
  ('bkg_012', 'BYS-1012-SEED12', 'usr_client_005', 'usr_provider_002', 'svc_005', 'CANCELLED', '2025-07-22', '09:00', '67, Malviya Nagar, Mumbai', 499, 499, 25, 'REFUNDED', 'Schedule conflict - provider unavailable', 'usr_provider_002', '2025-07-21T18:00:00');

-- ========================================
-- PAYMENTS (11 payments for PAID/REFUNDED bookings)
-- ========================================
-- Bookings 1-8: COMPLETED/PAID → SUCCESS
INSERT INTO Payment (id, bookingId, amount, currency, paymentMethod, gateway, gatewayOrderId, gatewayPaymentId, status) VALUES
  ('pay_001', 'bkg_001', 499, 'INR', 'UPI', 'RAZORPAY', 'order_seed_001', 'pay_seed_001', 'SUCCESS'),
  ('pay_002', 'bkg_002', 349, 'INR', 'CARD', 'RAZORPAY', 'order_seed_002', 'pay_seed_002', 'SUCCESS'),
  ('pay_003', 'bkg_003', 499, 'INR', 'NET_BANKING', 'RAZORPAY', 'order_seed_003', 'pay_seed_003', 'SUCCESS'),
  ('pay_004', 'bkg_004', 349, 'INR', 'WALLET', 'RAZORPAY', 'order_seed_004', 'pay_seed_004', 'SUCCESS'),
  ('pay_005', 'bkg_005', 399, 'INR', 'UPI', 'RAZORPAY', 'order_seed_005', 'pay_seed_005', 'SUCCESS'),
  ('pay_006', 'bkg_006', 399, 'INR', 'CARD', 'RAZORPAY', 'order_seed_006', 'pay_seed_006', 'SUCCESS'),
  ('pay_007', 'bkg_007', 499, 'INR', 'NET_BANKING', 'RAZORPAY', 'order_seed_007', 'pay_seed_007', 'SUCCESS'),
  ('pay_008', 'bkg_008', 349, 'INR', 'WALLET', 'RAZORPAY', 'order_seed_008', 'pay_seed_008', 'SUCCESS');
-- Booking 10: ACCEPTED/PAID → SUCCESS
INSERT INTO Payment (id, bookingId, amount, currency, paymentMethod, gateway, gatewayOrderId, gatewayPaymentId, status) VALUES
  ('pay_009', 'bkg_010', 449, 'INR', 'UPI', 'RAZORPAY', 'order_seed_009', 'pay_seed_009', 'SUCCESS');
-- Booking 11: IN_PROGRESS/PAID → SUCCESS
INSERT INTO Payment (id, bookingId, amount, currency, paymentMethod, gateway, gatewayOrderId, gatewayPaymentId, status) VALUES
  ('pay_010', 'bkg_011', 449, 'INR', 'CARD', 'RAZORPAY', 'order_seed_010', 'pay_seed_010', 'SUCCESS');
-- Booking 12: CANCELLED/REFUNDED → REFUNDED
INSERT INTO Payment (id, bookingId, amount, currency, paymentMethod, gateway, gatewayOrderId, gatewayPaymentId, status, refundAmount, refundReason, refundedAt) VALUES
  ('pay_011', 'bkg_012', 499, 'INR', 'UPI', 'RAZORPAY', 'order_seed_011', 'pay_seed_011', 'REFUNDED', 499, 'Schedule conflict - provider unavailable', '2025-07-21T18:00:00');

-- ========================================
-- 9. REVIEWS (8 reviews for completed bookings)
-- ========================================
INSERT INTO Review (id, bookingId, reviewerId, reviewedId, serviceId, rating, comment, isVerified) VALUES
  ('rev_001', 'bkg_001', 'usr_client_001', 'usr_provider_001', 'svc_001', 5, 'Excellent work! The plumber was very professional and fixed the leak in no time. Highly recommended for any plumbing issue.', 1),
  ('rev_002', 'bkg_002', 'usr_client_002', 'usr_provider_002', 'svc_004', 4, 'Good light fixture installation. The electrician was punctual and neat with the wiring. Minor delay in arrival but quality work.', 1),
  ('rev_003', 'bkg_003', 'usr_client_004', 'usr_provider_003', 'svc_007', 5, 'Perfect AC installation! Very neat work with proper copper piping and drainage. The technician was knowledgeable and friendly.', 1),
  ('rev_004', 'bkg_004', 'usr_client_001', 'usr_provider_004', 'svc_010', 4, 'Great drain cleaning service. The blockage was completely cleared. Would recommend for plumbing needs.', 1),
  ('rev_005', 'bkg_005', 'usr_client_006', 'usr_provider_005', 'svc_013', 5, 'Fan installation was done perfectly. Clean wiring and the fan runs smoothly without any wobble. Very satisfied!', 1),
  ('rev_006', 'bkg_006', 'usr_client_008', 'usr_provider_001', 'svc_002', 4, 'Toilet installation was done properly. Professional approach and clean work area. Good service overall.', 1),
  ('rev_007', 'bkg_007', 'usr_client_004', 'usr_provider_003', 'svc_008', 5, 'AC gas refill service was excellent. Cooling improved dramatically. The technician explained the issue clearly before starting work.', 1),
  ('rev_008', 'bkg_008', 'usr_client_002', 'usr_provider_002', 'svc_006', 4, 'AC servicing was thorough. The foam wash really made a difference in cooling efficiency. Will book again for regular servicing.', 1);

-- ========================================
-- 10. FAQs (21 FAQs)
-- ========================================
-- General
INSERT INTO Faq (category, question, answer, displayOrder) VALUES ('General', 'What is BookYourService?', 'BookYourService is India''s trusted online marketplace connecting homeowners with verified service providers for Plumbing, Electrical, and AC & HVAC services. We ensure quality, reliability, and transparent pricing for every booking.', 1);
INSERT INTO Faq (category, question, answer, displayOrder) VALUES ('General', 'Which cities does BookYourService operate in?', 'We currently operate in major Indian cities including Delhi, Mumbai, Bengaluru, Hyderabad, and Chennai, with plans to expand rapidly. Enter your pincode on the homepage to check availability in your area.', 2);
INSERT INTO Faq (category, question, answer, displayOrder) VALUES ('General', 'How do I book a service?', 'Simply browse our three categories — Plumbing, Electrical, or AC & HVAC — select your desired sub-service, choose a provider, pick a date and time, and confirm your booking. You can also call our helpline for assistance.', 3);
INSERT INTO Faq (category, question, answer, displayOrder) VALUES ('General', 'Are the service providers verified?', 'Yes, all service providers on BookYourService undergo a rigorous KYC verification process including identity verification (Aadhaar/PAN/Passport), address verification, skill assessment, and background checks before being listed on our platform.', 4);
INSERT INTO Faq (category, question, answer, displayOrder) VALUES ('General', 'What services are available on BookYourService?', 'We offer three main categories of home services: Plumbing (leak repair, drain cleaning, pipe installation, faucet repair, toilet installation, water heater repair, sewage cleaning, shower/tub repair, gas line servicing, pump repair), Electrical (wiring repairs, light fixture installation, socket repairs, circuit breaker fixing, ceiling fan installation, smart home setup, generator maintenance, switchboard upgrades, panel repair, appliance grounding), and AC & HVAC (AC installation, AC repair, AC cleaning/servicing, heating unit repairs, thermostat setup, central air maintenance, duct cleaning, furnace repair, ventilator services, gas refilling).', 5);
-- Booking
INSERT INTO Faq (category, question, answer, displayOrder) VALUES ('Booking', 'Can I reschedule my booking?', 'Yes, you can reschedule your booking up to 4 hours before the scheduled time at no extra charge. Go to My Bookings, select the booking, and click Reschedule. Subject to provider availability.', 6);
INSERT INTO Faq (category, question, answer, displayOrder) VALUES ('Booking', 'What happens if the provider doesn''t show up?', 'If a provider fails to arrive within 30 minutes of the scheduled time without prior notice, you can raise a no-show complaint. We''ll arrange an alternative provider or provide a full refund along with a 10% credit as compensation.', 7);
INSERT INTO Faq (category, question, answer, displayOrder) VALUES ('Booking', 'Can I book services for someone else?', 'Yes, during booking you can specify a different service address and contact person. The booking confirmation will be sent to your registered number/email while the service details go to the service address contact.', 8);
INSERT INTO Faq (category, question, answer, displayOrder) VALUES ('Booking', 'Is there a minimum booking amount?', 'There is no minimum booking amount. However, each service has a base price which is the minimum charge for that service. The final price may vary based on the scope of work and negotiation.', 9);
INSERT INTO Faq (category, question, answer, displayOrder) VALUES ('Booking', 'How far in advance can I book a service?', 'You can book services up to 30 days in advance. For same-day bookings, we recommend booking at least 2 hours before the desired time slot to ensure provider availability.', 10);
-- Payment
INSERT INTO Faq (category, question, answer, displayOrder) VALUES ('Payment', 'What payment methods are accepted?', 'Currently, payments are settled directly between the client and the provider via cash or direct bank transfer. Our online payment system (UPI, Cards, Net Banking) will be activated soon for a more seamless experience.', 11);
INSERT INTO Faq (category, question, answer, displayOrder) VALUES ('Payment', 'How does the platform fee work?', 'BookYourService charges a small platform fee on each booking. This fee is separate from the service price and supports platform maintenance, provider verification, and customer support. The platform fee is displayed transparently during checkout.', 12);
INSERT INTO Faq (category, question, answer, displayOrder) VALUES ('Payment', 'Can I negotiate the service price?', 'Yes, for services marked as "Price Negotiable," you can propose a different price through our negotiation feature. The provider can accept, reject, or counter-offer. Both parties must agree before the booking is confirmed.', 13);
INSERT INTO Faq (category, question, answer, displayOrder) VALUES ('Payment', 'Do I need to pay extra charges or taxes?', 'The service price is agreed upon between you and the provider. A nominal platform fee is charged separately and displayed during checkout. GST, if applicable, is included in the service price.', 14);
-- Provider
INSERT INTO Faq (category, question, answer, displayOrder) VALUES ('Provider', 'How can I become a service provider on BookYourService?', 'Register as a provider, complete KYC verification (Aadhaar/PAN/Passport + selfie), and get your profile approved. Once verified, you can list your services under Plumbing, Electrical, or AC & HVAC categories, set pricing, and start receiving bookings. The approval process typically takes 24-48 hours.', 15);
INSERT INTO Faq (category, question, answer, displayOrder) VALUES ('Provider', 'What commission does BookYourService charge providers?', 'We charge a competitive commission of 15-20% depending on the service category and your subscription plan. Premium plan providers enjoy lower commission rates and priority listing in their category.', 16);
INSERT INTO Faq (category, question, answer, displayOrder) VALUES ('Provider', 'How do I receive my earnings?', 'Currently, payments are collected directly by providers from clients (cash/direct transfer). Once our online payment system is activated, provider earnings will be transferred to your registered bank account within 3-5 business days after deducting the platform commission.', 17);
INSERT INTO Faq (category, question, answer, displayOrder) VALUES ('Provider', 'Can I set my own prices for services?', 'Yes, you have full control over your service pricing. You can also mark prices as negotiable to allow clients to propose different rates. We recommend competitive pricing based on your experience and market rates in your city.', 18);
-- Cancellation
INSERT INTO Faq (category, question, answer, displayOrder) VALUES ('Cancellation', 'What is the cancellation policy?', 'Cancellations made 24+ hours before the scheduled time are fully refundable. Cancellations within 4-24 hours incur a 10% fee. Cancellations within 4 hours or no-shows incur a 25% fee. Refunds are processed within 5-7 business days once online payments are active.', 19);
INSERT INTO Faq (category, question, answer, displayOrder) VALUES ('Cancellation', 'How do I cancel a booking?', 'Go to My Bookings, select the booking you wish to cancel, and click Cancel Booking. You''ll need to provide a cancellation reason. The refund (if applicable) will be initiated immediately to your original payment method once online payments are active.', 20);
INSERT INTO Faq (category, question, answer, displayOrder) VALUES ('Cancellation', 'Can a provider cancel my booking?', 'Providers can cancel only in genuine emergencies. Frequent cancellations affect their rating and may lead to account suspension. If your booking is cancelled by the provider, we''ll offer an alternative provider or a full refund with a 10% credit bonus.', 21);

-- ========================================
-- 11. LEGAL PAGES (7 pages)
-- ========================================
-- Terms & Conditions / AUP
INSERT INTO LegalPage (pageType, title, version, effectiveDate, content) VALUES ('TERMS', 'Acceptable Usage Policy & Terms of Service', '1.0', '2025-01-01',
'ACCEPTABLE USAGE POLICY AND TERMS OF SERVICE FOR BOOKYOURSERVICE

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
2.3 Service Providers must possess the necessary qualifications, licenses, and permits required by applicable Indian law to perform the services they list on the Platform.
2.4 Clients must have the legal capacity and authority to request services at the address provided.
2.5 Users who have been previously suspended or terminated from the Platform for policy violations are not eligible to create new accounts.
2.6 Corporate and enterprise users must designate an authorized representative who accepts these Terms on behalf of the organization.

3. ACCOUNT RESPONSIBILITIES
3.1 Users must provide accurate, current, and complete information during registration.
3.2 Each user may maintain only one active account at a time.
3.3 Users are solely responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their account.
3.4 Users must not share, transfer, or sell their account credentials to any third party.
3.5 The Company shall NOT be liable for any loss arising from a user''s failure to comply with the account security obligations.
3.6 The Company reserves the right to suspend, terminate, or restrict any account that violates these Terms.
3.7 Users must not create accounts using automated means, bots, or scripts.

4. PROHIBITED ACTIVITIES
4.1 Users must NOT use the Platform for any unlawful purpose or in violation of any applicable Indian law.
4.2 The following activities are strictly prohibited: submitting false information, impersonating any person, interfering with the Platform, unauthorized access, using automated tools without permission, price manipulation, circumventing payment systems, soliciting outside the Platform, posting defamatory content, uploading malware, money laundering, creating fake bookings/reviews, and harassing other users.
4.3 Violations may result in immediate account suspension or termination.
4.4 The Company bears NO liability for any actions taken by users in violation of this Section.

5. KYC AND VERIFICATION
5.1 All Service Providers must complete KYC verification before listing services.
5.2 The Company may request additional documentation or verification at any time.
5.3 KYC verification status (APPROVED, PENDING, REJECTED) is displayed on the Provider''s profile.
5.4 The Company''s KYC verification does NOT constitute an endorsement or guarantee of the Provider.
5.5 Providers must notify the Company within 7 days of any changes to their KYC information.
5.6 The Company may periodically re-verify KYC documents.
5.7 KYC documents are retained for the duration of the Provider relationship plus 1 year after termination.

6. SERVICE LISTING RULES
6.1 Service Providers may only list services within the three approved categories: Plumbing, Electrical, and AC & HVAC.
6.2 Service listings must include accurate and complete information.
6.3 Providers must not list services that they are not qualified or legally permitted to perform.
6.4 Service descriptions must not contain misleading claims or "bait and switch" pricing.
6.5 Providers must set fair and reasonable prices.
6.6 Providers may mark prices as "Negotiable."
6.7 All service images must be original or properly licensed.
6.8 Providers must not list the same service multiple times under different names.
6.9 The Company reserves the right to remove, modify, or reject any service listing.

7. BOOKING RULES
7.1 Clients can browse, select, and book services through the Platform.
7.2 A booking request does not constitute a confirmed appointment until the Service Provider accepts it.
7.3 Service prices displayed on the Platform are indicative and may vary.
7.4 Clients must provide accurate service address and contact information at the time of booking.
7.5 The Company is NOT a party to the service agreement between the Client and the Provider.
7.6 The Company does NOT guarantee the timely delivery, quality, or outcome of any service.
7.7 Clients acknowledge that home services involve inherent risks.
7.8 Providers must arrive at the scheduled time or notify the Client of any delays.
7.9 Clients may cancel bookings subject to the cancellation policy outlined in Section 15.

8. COMMUNICATION POLICY
8.1 The Platform provides in-app messaging and calling features for service bookings.
8.2 Users must NOT use communication channels for spam, offensive content, or harassment.
8.3 Users must NOT share personal contact information to circumvent the Platform.
8.4 The Company may monitor communications for compliance but is NOT obligated to do so.
8.5 Users must not record or distribute communications without consent.

9. PRIVACY AND DATA PROTECTION
9.1 User data is collected and stored in accordance with our Privacy Policy.
9.2 We comply with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023.
9.3 By using the Platform, you consent to the collection and use of your personal information.
9.4 Users consent to receiving transactional communications. Marketing communications are subject to opt-in consent.
9.5 The Company implements industry-standard security measures.
9.6 NO METHOD OF ELECTRONIC TRANSMISSION OR STORAGE IS 100% SECURE.
9.7 Users have the right to access, correct, and request deletion of their personal data.

10. INTELLECTUAL PROPERTY
10.1 All Platform content is the exclusive property of BookYourService Technologies Pvt. Ltd. or its licensors.
10.2 Users may NOT copy, reproduce, or commercially exploit any content without express written consent.
10.3 User-generated content is licensed to the Company on a non-exclusive, worldwide, royalty-free basis.
10.4 The "BookYourService" name and logo are trademarks of the Company.

11. SECURITY POLICY
11.1 Users must NOT attempt to compromise the security of the Platform.
11.2 Users must report any discovered security vulnerabilities immediately.
11.3 The Company implements reasonable security measures but does NOT guarantee absolute security.

12. CONTENT POLICY
12.1 Users are solely responsible for all content they post on the Platform.
12.2 Prohibited content includes false, infringing, defamatory, obscene, and malicious content.
12.3 The Company reserves the right to remove any prohibited content.
12.4 Reviews and ratings must be based on genuine service experiences.

13. PLATFORM FEES
13.1 The Company charges a Platform Fee for connecting Clients with Providers.
13.2 The current Platform Fee is 5-10% on each completed booking.
13.3 Currently, all service payments are settled DIRECTLY between the Client and the Service Provider.
13.4 The Company is NOT responsible for any payment disputes between Clients and Providers.
13.5 All prices are listed in Indian Rupees (INR).

14. DISPUTE RESOLUTION
14.1 Parties should first attempt informal resolution through the Platform.
14.2 Clients can raise a quality dispute within 7 days of service completion.
14.3 The Company will act as a mediator but is NOT bound to enforce any particular outcome.
14.4 Unresolved disputes shall be settled by binding arbitration in accordance with the Arbitration and Conciliation Act, 1996.
14.5 The seat and venue of arbitration shall be Mumbai, Maharashtra, India.
14.6 The courts of Mumbai, Maharashtra, India shall have exclusive jurisdiction over disputes not subject to arbitration.

15. REFUNDS AND CANCELLATIONS
15.1 Cancellation by Client: Full refund (24+ hours), 90% (4-24 hours), 75% (within 4 hours), no refund (no-show).
15.2 Cancellation by Provider: Only in genuine emergencies. Frequent cancellations result in account suspension.
15.3 Refund processing: Currently facilitated between Client and Provider directly. Online refunds within 5-7 business days once payment system is activated.

16-25. ADDITIONAL CLAUSES
Full details on advertising policy, international use, account termination, limitation of liability, compliance with law, reporting violations, policy updates, contact information, enterprise clauses, and final provisions are available in the complete document at https://bookyourservice.co.in

Contact: support@bookyourservice.co.in | legal@bookyourservice.co.in | dpo@bookyourservice.co.in | grievance@bookyourservice.co.in
Registered Address: BookYourService Technologies Pvt. Ltd., Fort, Mumbai 400001, Maharashtra, India
Support Hours: 8:00 AM - 10:00 PM IST, 7 days a week');

-- Privacy Policy
INSERT INTO LegalPage (pageType, title, version, effectiveDate, content) VALUES ('PRIVACY', 'Privacy Policy', '1.0', '2025-01-01',
'PRIVACY POLICY FOR BOOKYOURSERVICE

Last Updated: January 1, 2025 | Version: 1.0 | Effective Date: January 1, 2025

BookYourService Technologies Pvt. Ltd. ("we," "our," "us") is committed to protecting the privacy and personal data of our users. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform for Plumbing, Electrical, and AC & HVAC services.

1. INTRODUCTION AND SCOPE
1.1 This Privacy Policy applies to all users of the BookYourService platform, including our website and mobile application.
1.2 By using the Platform, you consent to the data practices described in this Privacy Policy.
1.3 We comply with the Information Technology Act, 2000, the IT Rules, 2011, and the Digital Personal Data Protection Act, 2023.
1.4 The Company acts as a data fiduciary under Indian data protection law.

2. INFORMATION WE COLLECT
2.1 Personal Information: Name, email, phone, profile photo, address, date of birth, gender.
2.2 Identity Verification (KYC): Aadhaar, PAN, driving license, passport numbers for Service Providers.
2.3 Location Data: GPS coordinates for service delivery matching.
2.4 Payment Information: Currently not collected. When activated, payment data will be processed by PCI DSS certified payment gateways.
2.5 Device Information: IP address, browser type, device type, OS, unique device identifiers.
2.6 Usage Data: Pages visited, features used, search queries, booking history.
2.7 Communications: Chat messages, support tickets, and feedback submissions.
2.8 Service Data: Categories browsed, subcategories selected, booking details.
2.9 Cookies and Tracking Data: As described in our Cookie Policy.

3. HOW WE USE YOUR INFORMATION
3.1 To provide, operate, and maintain the Platform.
3.2 To process bookings and facilitate communication.
3.3 To verify user identity and prevent fraud.
3.4 To send booking confirmations, reminders, and transactional notifications.
3.5 To provide customer support and resolve disputes.
3.6 To send promotional offers (with opt-out option).
3.7 To comply with legal obligations.
3.8 To analyze usage patterns and improve the Platform.
3.9 To enforce our AUP and Terms of Service.
3.10 To detect and prevent prohibited activities.

4. DATA SHARING AND DISCLOSURE
4.1 Service Providers receive Client name, service address, and phone number for service delivery.
4.2 Clients see Provider name, photo, rating, and city-level location.
4.3 Payment data will be shared with authorized payment gateways when activated.
4.4 Anonymized usage data may be shared with analytics services.
4.5 We may disclose personal data when required by law.
4.6 Data may be transferred in the event of a business transfer.
4.7 We do NOT sell, rent, or trade your personal data.

5. DATA SECURITY
5.1 All data transmissions are encrypted using TLS/SSL.
5.2 Personal data is stored in encrypted databases with strict access controls.
5.3 We conduct regular security audits.
5.4 NO METHOD OF ELECTRONIC TRANSMISSION OR STORAGE IS 100% SECURE.
5.5 In the event of a data breach, we will notify affected users within 72 hours.

6. DATA RETENTION
6.1 Active account data is retained for the duration of your account.
6.2 Booking records are retained for 3 years.
6.3 Payment records will be retained for 7 years for tax compliance.
6.4 KYC documents are retained for the Provider relationship plus 1 year.
6.5 Deleted account data is retained for 30 days then permanently deleted.
6.6 Communication logs are retained for 2 years.

7. YOUR RIGHTS
7.1 Access: View and download your personal data.
7.2 Correction: Update your personal information.
7.3 Deletion: Request account and data deletion.
7.4 Objection: Opt out of marketing communications.
7.5 Data Portability: Request a copy of your data.
7.6 Right to Withdraw Consent.
7.7 Right to Grievance Redressal.

8-13. ADDITIONAL SECTIONS
Full details on cookies, children''s privacy, international data transfers, sensitive personal data, changes to this policy, and contact information are available in the complete document.

Contact: support@bookyourservice.co.in | privacy@bookyourservice.co.in | dpo@bookyourservice.co.in
Address: BookYourService Technologies Pvt. Ltd., Fort, Mumbai 400001, Maharashtra, India');

-- Refund Policy
INSERT INTO LegalPage (pageType, title, version, effectiveDate, content) VALUES ('REFUND', 'Refund & Cancellation Policy', '1.0', '2025-01-01',
'REFUND AND CANCELLATION POLICY FOR BOOKYOURSERVICE

Last Updated: January 1, 2025 | Version: 1.0 | Effective Date: January 1, 2025

This Refund and Cancellation Policy forms an integral part of our Terms of Service (Section 15). It provides detailed information about cancellation rights, refund eligibility, and dispute resolution for bookings made on the BookYourService platform.

1. OVERVIEW AND INTERMEDIARY STATUS
1.1 BookYourService facilitates connections between Clients and Service Providers for Plumbing, Electrical, and AC & HVAC services.
1.2 Currently, all service payments are settled directly between Clients and Providers. The Company does NOT hold or process service payments.
1.3 The Company bears NO liability for any Provider''s refusal to issue a refund.

2. CANCELLATION BY CLIENT
2.1 Full Refund: Cancellations 24+ hours before scheduled time.
2.2 Partial Refund (90%): Cancellations 4-24 hours before.
2.3 Partial Refund (75%): Cancellations within 4 hours.
2.4 No Refund: Client no-show.

3. CANCELLATION BY PROVIDER
3.1 Providers may cancel only in genuine emergencies.
3.2 Frequent cancellations negatively impact rating and may result in account suspension.
3.3 The Company will attempt to arrange an alternative Provider or facilitate a full refund.

4. PLATFORM FEE REFUND
4.1 Platform Fee is refundable if: booking cancelled by Client within window, cancelled by Provider, Provider no-show, or duplicate charge.
4.2 Platform Fee is NOT refundable if: service completed, Client no-show, or cancellation within 4 hours (partial may apply).

5. SERVICE PAYMENT REFUND (CURRENT DIRECT PAYMENT MODEL)
5.1 The Company CANNOT process refunds for service payments currently.
5.2 Clients must request refunds directly from the Service Provider.
5.3 The Company will facilitate communication and mediation.

6-16. ADDITIONAL SECTIONS
Full details on future online payment model, quality refund eligibility, dispute process, refund processing times, non-refundable items, partial refunds, wallet refunds, dispute escalation, limitation of liability, compliance with consumer protection law, and contact information are available in the complete document.

Contact: support@bookyourservice.co.in | refunds@bookyourservice.co.in | grievance@bookyourservice.co.in
Address: BookYourService Technologies Pvt. Ltd., Fort, Mumbai 400001, Maharashtra, India');

-- Cookie Policy
INSERT INTO LegalPage (pageType, title, version, effectiveDate, content) VALUES ('COOKIES', 'Cookie Policy', '1.0', '2025-01-01',
'COOKIE POLICY FOR BOOKYOURSERVICE

Last Updated: January 1, 2025 | Version: 1.0 | Effective Date: January 1, 2025

This Cookie Policy explains how BookYourService Technologies Pvt. Ltd. uses cookies and similar tracking technologies.

1. INTRODUCTION
1.1 This Cookie Policy applies to all visitors and users of the BookYourService platform.
1.2 By using the Platform, you consent to the use of cookies as described, subject to your right to manage or withdraw consent.

2. WHAT ARE COOKIES?
2.1 Cookies are small text files placed on your device when you visit a website.
2.2 They help us remember your preferences and improve your experience.
2.3 Similar technologies include: local storage, session storage, web beacons, and device identifiers.

3. TYPES OF COOKIES WE USE
3.1 ESSENTIAL COOKIES: Required for Platform functionality, session management, and security.
3.2 FUNCTIONAL COOKIES: Enhanced functionality and personalization, remembering your city and preferences.
3.3 ANALYTICS COOKIES: Understanding user interaction, page views, error tracking. We use Google Analytics.
3.4 MARKETING COOKIES: Targeted advertising and remarketing. Require explicit consent.

4. THIRD-PARTY COOKIES
4.1 Google Analytics, Google Maps, Razorpay, Facebook/Meta, WhatsApp.
4.2 The Company bears NO liability for third-party cookie practices.

5. MANAGING COOKIES
5.1 You can manage cookies through browser settings.
5.2 Our Platform displays a cookie consent banner.
5.3 You can opt out of specific third-party cookies via provided links.

6. COOKIE DURATION
6.1 Session cookies expire when you close your browser.
6.2 Persistent cookies: Authentication (30 days), Preference (1 year), Analytics (2 years), Marketing (90 days).

7-13. ADDITIONAL SECTIONS
Full details on mobile applications, specific cookies used, your rights, impact of disabling cookies, compliance with data protection law, updates, and contact information are available in the complete document.

Contact: support@bookyourservice.co.in | privacy@bookyourservice.co.in | dpo@bookyourservice.co.in
Address: BookYourService Technologies Pvt. Ltd., Fort, Mumbai 400001, Maharashtra, India');

-- Acceptable Usage Policy (Standalone)
INSERT INTO LegalPage (pageType, title, version, effectiveDate, content) VALUES ('AUP', 'Acceptable Usage Policy', '1.0', '2025-01-01',
'ACCEPTABLE USAGE POLICY FOR BOOKYOURSERVICE

Last Updated: January 1, 2025 | Version: 1.0 | Effective Date: January 1, 2025

This Acceptable Usage Policy governs the acceptable use of the BookYourService platform operated by BookYourService Technologies Pvt. Ltd.

1. PURPOSE AND SCOPE
1.1 This AUP establishes the standards and rules for acceptable use of the BookYourService platform.
1.2 This policy applies to all users, including Clients, Service Providers, and visitors.
1.3 By using the Platform, you agree to comply with this AUP.

2. ACCEPTABLE USE
2.1 Users may use the Platform only for lawful purposes.
2.2 Clients may browse and book services in Plumbing, Electrical, and AC & HVAC.
2.3 Service Providers may list services only within the three approved categories.
2.4 All communications must be professional and related to service bookings.
2.5 Users must provide accurate and truthful information.

3. PROHIBITED CONDUCT
3.1 Users must NOT use the Platform for any unlawful purpose.
3.2 Prohibited activities include: submitting false information, impersonating others, interfering with the Platform, unauthorized access, using automated tools without permission, circumventing payment systems, soliciting outside the Platform, posting offensive content, uploading malware, money laundering, creating fake bookings/reviews, and harassment.
3.3 The Company bears NO liability for prohibited conduct by users.

4. SERVICE-SPECIFIC RULES
4.1 PLUMBING SERVICES: Providers must hold valid plumbing certifications. Services include leak repair, pipe installation, drain cleaning, faucet replacement, water heater service, sewage repair, and more.
4.2 ELECTRICAL SERVICES: Providers must hold valid electrical licenses. Services include wiring, light fixture installation, ceiling fan installation, socket repair, MCB/DB box installation, smart home setup, and more.
4.3 AC & HVAC SERVICES: Providers must hold relevant HVAC certifications. Services include AC installation, repair, gas refilling, cleaning, duct cleaning, furnace repair, and more.
4.4 Providers must NOT list services outside these three categories.

5. ACCOUNT INTEGRITY
5.1 Each user may maintain only one active account.
5.2 Users are responsible for maintaining the confidentiality of their credentials.
5.3 Unauthorized use must be reported to support@bookyourservice.co.in immediately.

6-11. ADDITIONAL SECTIONS
Full details on content standards, communication standards, enforcement, reporting violations, policy updates, and contact information are available in the complete document.

Contact: support@bookyourservice.co.in | legal@bookyourservice.co.in
Address: BookYourService Technologies Pvt. Ltd., Fort, Mumbai 400001, Maharashtra, India');

-- Provider Agreement
INSERT INTO LegalPage (pageType, title, version, effectiveDate, content) VALUES ('PROVIDER_AGREEMENT', 'Service Provider Agreement', '1.0', '2025-01-01',
'SERVICE PROVIDER AGREEMENT FOR BOOKYOURSERVICE

Last Updated: January 1, 2025 | Version: 1.0 | Effective Date: January 1, 2025

IMPORTANT: THIS AGREEMENT CONSTITUTES A LEGALLY BINDING AGREEMENT BETWEEN YOU AND BOOKYOURSERVICE TECHNOLOGIES PVT. LTD. BY REGISTERING AS A SERVICE PROVIDER, YOU ACKNOWLEDGE THAT YOU HAVE READ AND AGREE TO BE BOUND BY THIS AGREEMENT.

1. DEFINITIONS
1.1 "Platform" means the BookYourService website and mobile applications.
1.2 "Services" means home maintenance services offered by the Provider, limited to Plumbing, Electrical, and AC & HVAC.
1.3 "Client" means a user who books services.
1.4 "Platform Fee" means the commission charged by the Company.
1.5 "Booking" means a confirmed appointment.

2. SCOPE OF AGREEMENT
2.1 This Agreement governs the relationship between the Provider and the Company.
2.2 The Provider is an INDEPENDENT CONTRACTOR, NOT an employee of the Company.
2.3 The Company is an INTERMEDIARY and MARKETPLACE ONLY.

3. PROVIDER OBLIGATIONS
3.1 Complete KYC verification including government-issued ID and trade certifications.
3.2 Possess and maintain all necessary qualifications and licenses.
3.3 Deliver services in a professional manner consistent with industry standards.
3.4 Maintain accurate availability schedules and honor accepted bookings.
3.5 Arrive at the scheduled time or notify of delays at least 30 minutes in advance.
3.6 Maintain professional communication with Clients.

4. SERVICE LISTING RULES
4.1 Providers may ONLY list services within Plumbing, Electrical, and AC & HVAC.
4.2 Listings must include accurate information.
4.3 Providers must NOT list services they are not qualified to perform.
4.4 Service descriptions must NOT contain misleading claims.

5. PRICING AND PAYMENTS
5.1 Currently, all service payments are settled DIRECTLY between Client and Provider.
5.2 The Company charges a commission (currently 5-10%) on each completed booking.
5.3 All prices must be listed in Indian Rupees (INR).
5.4 The Company is NOT responsible for payment disputes between Provider and Client.

6-15. ADDITIONAL SECTIONS
Full details on tax obligations, insurance and liability, indemnification, booking commitments, intellectual property, account termination, limitation of liability, dispute resolution, modifications, and contact information are available in the complete document.

Contact: support@bookyourservice.co.in | legal@bookyourservice.co.in
Address: BookYourService Technologies Pvt. Ltd., Fort, Mumbai 400001, Maharashtra, India');

-- Community Guidelines
INSERT INTO LegalPage (pageType, title, version, effectiveDate, content) VALUES ('COMMUNITY_GUIDELINES', 'Community Guidelines', '1.0', '2025-01-01',
'COMMUNITY GUIDELINES FOR BOOKYOURSERVICE

Last Updated: January 1, 2025 | Version: 1.0 | Effective Date: January 1, 2025

At BookYourService, we are committed to building a safe, respectful, and trustworthy community. These Community Guidelines outline the behavior expected of all users.

1. OUR COMMUNITY VALUES
1.1 SAFETY FIRST: The safety of our users is our top priority.
1.2 RESPECT AND PROFESSIONALISM: Treat every user with dignity and respect.
1.3 HONESTY AND TRANSPARENCY: Be truthful in your profile, listings, reviews, and communications.
1.4 FAIRNESS: Engage in fair business practices.
1.5 ACCOUNTABILITY: Take responsibility for your actions.

2. GUIDELINES FOR CLIENTS
2.1 RESPECT PROVIDERS: Treat service providers as skilled professionals.
2.2 ACCURATE BOOKING INFORMATION: Provide accurate service addresses and contact information.
2.3 TIMELY COMMUNICATION: Respond to Provider messages promptly.
2.4 FAIR REVIEWS: Leave honest, fair reviews based on actual experience.
2.5 PAYMENT INTEGRITY: Pay the agreed-upon price.
2.6 PROPERTY ACCESS: Ensure safe access to the work area.
2.7 NO SOLICITATION: Do not ask Providers to work outside the Platform.

3. GUIDELINES FOR SERVICE PROVIDERS
3.1 PROFESSIONAL CONDUCT: Arrive on time and dress appropriately.
3.2 QUALITY WORKMANSHIP: Deliver services consistent with industry standards.
3.3 TRANSPARENT PRICING: Clearly communicate scope and pricing before starting.
3.4 RESPECT CLIENT PROPERTY: Treat the Client''s home and property with care.
3.5 HONEST REVIEWS: Do not solicit positive reviews or create fake reviews.
3.6 SAFETY COMPLIANCE: Follow all safety protocols relevant to your trade.
3.7 NO PLATFORM BYPASS: Never ask Clients to book directly outside the Platform.

4. PROHIBITED BEHAVIOR
4.1 Harassment, bullying, discrimination, abuse, sharing contact info to bypass Platform, fake reviews, multiple accounts, working under the influence, fraud, unauthorized recording, carrying weapons, and sexual harassment.

5. SAFETY GUIDELINES
5.1 Providers should carry valid ID. Clients should ensure safe work areas. Maintain professional boundaries.
5.2 In emergencies, contact 100 (police), 101 (fire), 108 (ambulance) first, then report to support@bookyourservice.co.in.

6-12. ADDITIONAL SECTIONS
Full details on review guidelines, dispute resolution, consequences of violations, reporting concerns, positive community recognition, guideline updates, and contact information are available in the complete document.

Contact: support@bookyourservice.co.in | legal@bookyourservice.co.in | community@bookyourservice.co.in
Address: BookYourService Technologies Pvt. Ltd., Fort, Mumbai 400001, Maharashtra, India');

-- ========================================
-- 12. REVENUE STREAMS (15 streams)
-- ========================================
INSERT INTO RevenueStream (streamType, description, revenueModel, estimatedMonthlyRevenue, status) VALUES
  ('Plumbing Booking Commission', 'Percentage commission on completed plumbing service bookings (leak repair, drain cleaning, pipe installation, etc.)', 'COMMISSION', 180000, 'ACTIVE'),
  ('Plumbing Featured Listing', 'Featured placement for providers within the Plumbing category page', 'FEATURED_LISTING', 35000, 'ACTIVE'),
  ('Plumbing Premium Provider Plan', 'Monthly subscription for premium plumbing providers with priority listing and lower commission', 'SUBSCRIPTION', 80000, 'ACTIVE'),
  ('Electrical Booking Commission', 'Percentage commission on completed electrical service bookings (wiring, light fixture, socket repair, etc.)', 'COMMISSION', 220000, 'ACTIVE'),
  ('Electrical Featured Listing', 'Featured placement for providers within the Electrical category page', 'FEATURED_LISTING', 40000, 'ACTIVE'),
  ('Electrical Premium Provider Plan', 'Monthly subscription for premium electrical providers with priority listing and lower commission', 'SUBSCRIPTION', 95000, 'ACTIVE'),
  ('AC HVAC Booking Commission', 'Percentage commission on completed AC & HVAC service bookings (installation, repair, cleaning, gas refill, etc.)', 'COMMISSION', 250000, 'ACTIVE'),
  ('AC HVAC Featured Listing', 'Featured placement for providers within the AC & HVAC category page', 'FEATURED_LISTING', 45000, 'ACTIVE'),
  ('AC HVAC Premium Provider Plan', 'Monthly subscription for premium AC & HVAC providers with priority listing and lower commission', 'SUBSCRIPTION', 100000, 'ACTIVE'),
  ('Homepage Featured Listing', 'Featured placement on the homepage carousel across all categories', 'FEATURED_LISTING', 120000, 'ACTIVE'),
  ('Search Result Boost', 'Boosted position in search results for providers across all categories', 'FEATURED_LISTING', 60000, 'ACTIVE'),
  ('Urgent/Same-Day Booking Surcharge', 'Additional fee for same-day or urgent bookings across all categories', 'COMMISSION', 50000, 'ACTIVE'),
  ('Client Plus Membership', 'Monthly client membership with discounts and priority booking across all categories', 'SUBSCRIPTION', 75000, 'PLANNED'),
  ('Banner Advertising', 'Display advertising on category pages and homepage', 'ADVERTISING', 45000, 'ACTIVE'),
  ('Referral Program', 'Revenue from client and provider referral programs', 'REFERRAL', 25000, 'PLANNED');

-- ========================================
-- 13. SEO METADATA (8 pages)
-- ========================================
INSERT INTO SeoMetadata (pageType, title, description, keywords, canonicalUrl, indexed) VALUES
  ('home', 'BookYourService — Trusted Home Services in India | Plumbing, Electrical, AC & HVAC', 'Book verified professionals for Plumbing, Electrical, and AC & HVAC services at your doorstep. Trusted providers in Delhi, Mumbai, Bengaluru, Hyderabad & Chennai. Transparent pricing, KYC verified providers.', 'home services, plumbing services, electrical services, AC repair, HVAC services, book plumber, book electrician, AC installation, India, Delhi, Mumbai, Bengaluru, Hyderabad, Chennai', 'https://bookyourservice.co.in', 1),
  ('category', 'Plumbing Services — Professional Plumbers Near You | BookYourService', 'Expert plumbing services including leak repair, drain cleaning, pipe installation, faucet repair, toilet installation, water heater repair, sewage cleaning, and more. Book verified plumbers in Delhi, Mumbai, Bengaluru, Hyderabad & Chennai.', 'plumber near me, leak repair, drain cleaning, pipe installation, faucet repair, toilet installation, water heater repair, plumbing services India, book plumber online', 'https://bookyourservice.co.in/category/plumbing', 1),
  ('category', 'Electrical Services — Licensed Electricians Near You | BookYourService', 'Licensed electrical services including wiring repairs, light fixture installation, socket repairs, circuit breaker fixing, ceiling fan installation, smart home setup, generator maintenance, and more. Book verified electricians in top Indian cities.', 'electrician near me, wiring repair, light fixture installation, socket repair, circuit breaker, ceiling fan, smart home setup, electrical services India, book electrician online', 'https://bookyourservice.co.in/category/electrical', 1),
  ('category', 'AC & HVAC Services — Certified Technicians Near You | BookYourService', 'Professional AC & HVAC services including AC installation, repair, cleaning, gas refilling, heating unit repairs, thermostat setup, central air maintenance, duct cleaning, furnace repair, and more. Book certified technicians in top Indian cities.', 'AC repair near me, AC installation, AC cleaning, gas refill, HVAC services, air conditioning repair, duct cleaning, furnace repair, AC service India, book AC technician online', 'https://bookyourservice.co.in/category/ac-hvac', 1),
  ('how-it-works', 'How It Works — BookYourService Home Services Made Easy', 'Learn how BookYourService connects you with verified professionals for Plumbing, Electrical, and AC & HVAC services in just a few simple steps.', 'how bookyourservice works, book home service, online service booking, plumbing booking, electrical booking, AC service booking', 'https://bookyourservice.co.in/how-it-works', 1),
  ('about', 'About BookYourService — India''s Trusted Home Service Platform', 'BookYourService connects homeowners with verified service providers for Plumbing, Electrical, and AC & HVAC services across major Indian cities. Learn about our mission and values.', 'about bookyourservice, home service platform India, verified service providers, plumbing electrical HVAC marketplace', 'https://bookyourservice.co.in/about', 1),
  ('faq', 'FAQ — Frequently Asked Questions | BookYourService', 'Find answers to common questions about BookYourService including booking, payments, cancellations, and service categories — Plumbing, Electrical, and AC & HVAC.', 'bookyourservice FAQ, frequently asked questions, home service questions, plumbing FAQ, electrical FAQ, AC HVAC FAQ', 'https://bookyourservice.co.in/faq', 1),
  ('contact', 'Contact Us — BookYourService Customer Support', 'Get in touch with BookYourService for support, queries, or feedback regarding Plumbing, Electrical, or AC & HVAC services. We''re here to help.', 'contact bookyourservice, customer support, home service help, plumbing support, electrical support, AC support', 'https://bookyourservice.co.in/contact', 1);

-- ========================================
-- 14. PLATFORM STATS
-- ========================================
INSERT INTO PlatformStats (totalVisitors, totalUsers, totalProviders, totalBookings, totalServices, activeVisitors) VALUES
  (12500, 14, 5, 12, 14, 42);

-- ========================================
-- 15. NOTIFICATIONS (8 sample notifications)
-- ========================================
INSERT INTO Notification (id, userId, type, title, message, actionUrl, isRead, readAt) VALUES
  ('notif_001', 'usr_client_001', 'BOOKING_CONFIRMED', 'Booking Confirmed', 'Your plumbing service booking has been confirmed. The provider will arrive at the scheduled time.', '/bookings', 1, '2025-07-10T09:30:00'),
  ('notif_002', 'usr_client_004', 'BOOKING_REMINDER', 'Upcoming Booking Reminder', 'Your AC installation service is scheduled for tomorrow at 11:00 AM. Please ensure access to the service location.', '/bookings', 0, NULL),
  ('notif_003', 'usr_provider_001', 'NEW_BOOKING', 'New Booking Request', 'You have a new booking request for leak repair service. Please review and confirm.', '/provider/bookings', 1, '2025-08-10T10:00:00'),
  ('notif_004', 'usr_provider_002', 'PAYMENT_RECEIVED', 'Payment Update', 'Payment for the recent light fixture installation service has been confirmed by the client.', '/provider/earnings', 0, NULL),
  ('notif_005', 'usr_client_002', 'REVIEW_REQUEST', 'Rate Your Experience', 'How was your light fixture installation? Please take a moment to rate and review the service.', '/reviews', 0, NULL),
  ('notif_006', 'usr_client_008', 'BOOKING_CANCELLED', 'Booking Cancelled', 'Your smart home setup booking has been cancelled by the provider. A refund will be processed if applicable.', '/bookings', 1, '2025-07-21T18:30:00'),
  ('notif_007', 'usr_provider_003', 'KYC_APPROVED', 'KYC Verification Approved', 'Your KYC verification has been approved. You can now list services and start receiving bookings.', '/provider/profile', 1, '2025-01-15T12:00:00'),
  ('notif_008', 'usr_client_006', 'PROMOTION', 'Special Offer on Plumbing Services', 'Get 15% off on all plumbing services this month! Book now and save on leak repairs, drain cleaning, and more.', '/category/plumbing', 0, NULL);

-- ========================================
-- SEED COMPLETE
-- Summary:
--   Roles: 3 (CLIENT, PROVIDER, ADMIN)
--   Categories: 3 (Plumbing, Electrical, AC & HVAC)
--   Subcategories: 30 (10 per category)
--   Users: 14 (1 admin + 5 providers + 8 clients)
--   Provider KYC: 5
--   Services: 14
--   Service Availability: 84 (6 slots × 14 services)
--   Bookings: 12
--   Payments: 11
--   Reviews: 8
--   FAQs: 21
--   Legal Pages: 7
--   Revenue Streams: 15
--   SEO Metadata: 8
--   Platform Stats: 1
--   Notifications: 8
-- ========================================
