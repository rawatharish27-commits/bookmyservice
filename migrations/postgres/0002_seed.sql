-- BookYourService Seed Data (PostgreSQL)
-- Migration 0002: Initial data

-- Roles
INSERT INTO "Role" (id, name, description) VALUES (1, 'CLIENT', 'Service booking client');
INSERT INTO "Role" (id, name, description) VALUES (2, 'PROVIDER', 'Service provider professional');
INSERT INTO "Role" (id, name, description) VALUES (3, 'ADMIN', 'Platform administrator');

-- Service Categories (Plumbing, Electrical, AC & HVAC)
INSERT INTO "ServiceCategory" (id, name, slug, description, icon, "isActive", "displayOrder") VALUES (1, 'Plumbing', 'plumbing', 'Expert plumbing services for your home — pipe repair, leak detection, drain cleaning, and more', 'Droplets', true, 1);
INSERT INTO "ServiceCategory" (id, name, slug, description, icon, "isActive", "displayOrder") VALUES (2, 'Electrical', 'electrical', 'Certified electricians for safe and reliable electrical solutions', 'Zap', true, 2);
INSERT INTO "ServiceCategory" (id, name, slug, description, icon, "isActive", "displayOrder") VALUES (3, 'AC & HVAC', 'ac-hvac', 'Professional AC and HVAC installation, repair, and maintenance services', 'Wind', true, 3);

-- Plumbing Subcategories
INSERT INTO "ServiceSubcategory" ("categoryId", name, slug, description, "isActive", "displayOrder") VALUES (1, 'Pipe Repair & Fitting', 'pipe-repair-fitting', 'Pipe leak repair, replacement, and new fitting installation', true, 1);
INSERT INTO "ServiceSubcategory" ("categoryId", name, slug, description, "isActive", "displayOrder") VALUES (1, 'Leak Detection & Fix', 'leak-detection-fix', 'Professional water leak detection and repair services', true, 2);
INSERT INTO "ServiceSubcategory" ("categoryId", name, slug, description, "isActive", "displayOrder") VALUES (1, 'Drain Cleaning', 'drain-cleaning', 'Blocked drain unclogging and cleaning services', true, 3);
INSERT INTO "ServiceSubcategory" ("categoryId", name, slug, description, "isActive", "displayOrder") VALUES (1, 'Water Heater Installation', 'water-heater-installation', 'Geyser and water heater installation and repair', true, 4);
INSERT INTO "ServiceSubcategory" ("categoryId", name, slug, description, "isActive", "displayOrder") VALUES (1, 'Bathroom Plumbing', 'bathroom-plumbing', 'Complete bathroom plumbing installation and repair', true, 5);
INSERT INTO "ServiceSubcategory" ("categoryId", name, slug, description, "isActive", "displayOrder") VALUES (1, 'Kitchen Plumbing', 'kitchen-plumbing', 'Kitchen sink, tap, and pipe installation and repair', true, 6);
INSERT INTO "ServiceSubcategory" ("categoryId", name, slug, description, "isActive", "displayOrder") VALUES (1, 'Sewer Line Service', 'sewer-line-service', 'Sewer line cleaning, repair, and replacement', true, 7);
INSERT INTO "ServiceSubcategory" ("categoryId", name, slug, description, "isActive", "displayOrder") VALUES (1, 'Tap & Faucet Repair', 'tap-faucet-repair', 'Tap installation, repair, and replacement', true, 8);
INSERT INTO "ServiceSubcategory" ("categoryId", name, slug, description, "isActive", "displayOrder") VALUES (1, 'Toilet Repair', 'toilet-repair', 'Toilet installation, flush repair, and unclogging', true, 9);
INSERT INTO "ServiceSubcategory" ("categoryId", name, slug, description, "isActive", "displayOrder") VALUES (1, 'Water Pressure Fix', 'water-pressure-fix', 'Low water pressure diagnosis and fix', true, 10);

-- Electrical Subcategories
INSERT INTO "ServiceSubcategory" ("categoryId", name, slug, description, "isActive", "displayOrder") VALUES (2, 'Wiring & Rewiring', 'wiring-rewiring', 'Complete house wiring and rewiring by certified electricians', true, 1);
INSERT INTO "ServiceSubcategory" ("categoryId", name, slug, description, "isActive", "displayOrder") VALUES (2, 'Switch & Outlet Fix', 'switch-outlet-fix', 'Switch, socket, and electrical outlet repair and installation', true, 2);
INSERT INTO "ServiceSubcategory" ("categoryId", name, slug, description, "isActive", "displayOrder") VALUES (2, 'Ceiling Fan Installation', 'ceiling-fan-installation', 'Ceiling fan, exhaust fan installation and repair', true, 3);
INSERT INTO "ServiceSubcategory" ("categoryId", name, slug, description, "isActive", "displayOrder") VALUES (2, 'MCB & Fuse Repair', 'mcb-fuse-repair', 'MCB, fuse box, and circuit breaker repair and replacement', true, 4);
INSERT INTO "ServiceSubcategory" ("categoryId", name, slug, description, "isActive", "displayOrder") VALUES (2, 'Light Fixture Setup', 'light-fixture-setup', 'Light fitting, LED installation, and lighting solutions', true, 5);
INSERT INTO "ServiceSubcategory" ("categoryId", name, slug, description, "isActive", "displayOrder") VALUES (2, 'Inverter & UPS Setup', 'inverter-ups-setup', 'Inverter and UPS installation, battery replacement', true, 6);
INSERT INTO "ServiceSubcategory" ("categoryId", name, slug, description, "isActive", "displayOrder") VALUES (2, 'Electrical Inspection', 'electrical-inspection', 'Complete electrical safety inspection and audit', true, 7);
INSERT INTO "ServiceSubcategory" ("categoryId", name, slug, description, "isActive", "displayOrder") VALUES (2, 'Appliance Wiring', 'appliance-wiring', 'AC, geyser, and heavy appliance wiring', true, 8);
INSERT INTO "ServiceSubcategory" ("categoryId", name, slug, description, "isActive", "displayOrder") VALUES (2, 'Earthing & Grounding', 'earthing-grounding', 'Electrical earthing and grounding installation', true, 9);
INSERT INTO "ServiceSubcategory" ("categoryId", name, slug, description, "isActive", "displayOrder") VALUES (2, 'Doorbell & Intercom', 'doorbell-intercom', 'Doorbell, intercom, and video door phone installation', true, 10);

-- AC & HVAC Subcategories
INSERT INTO "ServiceSubcategory" ("categoryId", name, slug, description, "isActive", "displayOrder") VALUES (3, 'AC Installation', 'ac-installation', 'Split and window AC installation service', true, 1);
INSERT INTO "ServiceSubcategory" ("categoryId", name, slug, description, "isActive", "displayOrder") VALUES (3, 'AC Repair & Gas Refill', 'ac-repair-gas-refill', 'AC repair, gas refill, and cooling restore', true, 2);
INSERT INTO "ServiceSubcategory" ("categoryId", name, slug, description, "isActive", "displayOrder") VALUES (3, 'AC Servicing & Cleaning', 'ac-servicing-cleaning', 'Regular AC servicing, deep cleaning, and filter replacement', true, 3);
INSERT INTO "ServiceSubcategory" ("categoryId", name, slug, description, "isActive", "displayOrder") VALUES (3, 'HVAC System Repair', 'hvac-system-repair', 'Central HVAC system diagnosis and repair', true, 4);
INSERT INTO "ServiceSubcategory" ("categoryId", name, slug, description, "isActive", "displayOrder") VALUES (3, 'Duct Cleaning', 'duct-cleaning', 'AC duct cleaning and sanitization', true, 5);
INSERT INTO "ServiceSubcategory" ("categoryId", name, slug, description, "isActive", "displayOrder") VALUES (3, 'Thermostat Repair', 'thermostat-repair', 'Thermostat and temperature control repair', true, 6);
INSERT INTO "ServiceSubcategory" ("categoryId", name, slug, description, "isActive", "displayOrder") VALUES (3, 'Heat Pump Service', 'heat-pump-service', 'Heat pump installation, repair, and maintenance', true, 7);
INSERT INTO "ServiceSubcategory" ("categoryId", name, slug, description, "isActive", "displayOrder") VALUES (3, 'Ventilation Service', 'ventilation-service', 'Ventilation system installation and cleaning', true, 8);
INSERT INTO "ServiceSubcategory" ("categoryId", name, slug, description, "isActive", "displayOrder") VALUES (3, 'Refrigerant Leak Fix', 'refrigerant-leak-fix', 'Refrigerant leak detection and repair', true, 9);
INSERT INTO "ServiceSubcategory" ("categoryId", name, slug, description, "isActive", "displayOrder") VALUES (3, 'Central AC Service', 'central-ac-service', 'Central air conditioning system service and repair', true, 10);

-- Admin User (password: Admin@2024 — bcrypt hash regenerated for PostgreSQL)
INSERT INTO "User" (id, email, phone, "passwordHash", name, "roleId", status, city, state, country) VALUES
('admin-001', 'admin@bookyourservice.co.in', '9999999999', '$2b$10$GHxgLZJHTFzD23.gWTQik.qewtYWHZz22h1wJeQk2vlR/B7Xp8J..', 'Admin', 3, 'ACTIVE', 'Mumbai', 'Maharashtra', 'India');

-- Platform Stats
INSERT INTO "PlatformStats" (id, "totalVisitors", "totalUsers", "totalProviders", "totalBookings", "totalServices", "activeVisitors") VALUES (1, 0, 1, 0, 0, 0, 0);

-- FAQ Items
INSERT INTO "Faq" (category, question, answer, "displayOrder", "isActive") VALUES
('General', 'How does BookYourService work?', 'Browse services, select a provider, book an appointment, and get the service done at your home. Pay only after service completion.', 1, true),
('General', 'What services do you offer?', 'We offer Plumbing, Electrical, and AC & HVAC services across India. Each category has 10+ specialized sub-services.', 2, true),
('General', 'What are the service charges?', 'Service prices range from ₹199 to ₹499 depending on the service type. No hidden charges — the price you see is the price you pay.', 3, true),
('Booking', 'How do I book a service?', 'Select a service, choose your preferred date and time, enter your address, and confirm. A verified provider will be assigned to you.', 4, true),
('Booking', 'Can I cancel a booking?', 'Yes, you can cancel a booking before the provider starts the service. Cancellation is free if done at least 2 hours before the scheduled time.', 5, true),
('Payment', 'How do I pay for a service?', 'Payment is collected after the service is completed. We support UPI, cards, and net banking through secure payment gateways.', 6, true),
('Payment', 'Is there a refund policy?', 'Yes. If the service is not completed satisfactorily, you can raise a dispute and get a full refund within 7 days.', 7, true),
('Provider', 'How do I become a service provider?', 'Register as a Provider, complete KYC verification, and start listing your services. We verify all providers for safety and quality.', 8, true),
('Provider', 'How much can I earn?', 'Providers earn the service price minus a small platform fee. Top providers earn ₹50,000+ per month.', 9, true),
('Safety', 'Are service providers verified?', 'Yes, all providers undergo KYC verification including identity proof, address proof, and skill verification before being listed on the platform.', 10, true);

-- Legal Pages
INSERT INTO "LegalPage" ("pageType", title, content, "effectiveDate") VALUES
('TERMS', 'Terms of Service', 'Last updated: January 2025

Welcome to BookYourService. By using our platform, you agree to these terms.

1. Service Agreement
BookYourService connects clients with verified service providers for home services including Plumbing, Electrical, and AC & HVAC.

2. User Responsibilities
- Provide accurate information during registration
- Maintain the security of your account credentials
- Use the platform only for lawful purposes
- Treat service providers with respect

3. Service Booking
- All bookings are subject to provider availability
- Prices are transparent and range from ₹199 to ₹499
- Services must be paid for after completion

4. Cancellation Policy
- Free cancellation up to 2 hours before scheduled time
- Late cancellations may incur a fee

5. Payment Terms
- Payment is collected after service completion
- We use secure payment gateways (Razorpay)
- Platform fee of 5% is charged to providers

6. Limitation of Liability
BookYourService acts as a marketplace. We are not responsible for the quality of work performed by providers, though we mediate disputes.

7. Dispute Resolution
Contact us within 7 days of service completion for any issues. We will investigate and resolve disputes fairly.', '2025-01-01'),

('PRIVACY', 'Privacy Policy', 'Last updated: January 2025

Your privacy is important to us. This policy explains how we collect, use, and protect your data.

1. Information We Collect
- Account information: name, email, phone, address
- Service data: bookings, reviews, payment history
- Device data: IP address, browser type, location

2. How We Use Your Data
- To provide and improve our services
- To match you with service providers
- To process payments securely
- To send booking confirmations and updates
- To prevent fraud and abuse

3. Data Protection
- All data is encrypted in transit (TLS 1.3)
- Passwords are hashed using bcrypt
- We never share your personal data with third parties for marketing

4. Your Rights
- Access your personal data
- Request data correction or deletion
- Opt out of marketing communications
- Export your data

5. Data Retention
- Account data: retained while account is active
- Booking data: retained for 3 years for legal compliance
- Payment data: retained for 7 years per Indian tax law

6. Contact
For privacy concerns, email us at privacy@bookyourservice.co.in', '2025-01-01'),

('REFUND', 'Refund Policy', 'Last updated: January 2025

1. Eligibility for Refund
- Service not performed as described
- Provider did not show up
- Service quality is unsatisfactory
- Duplicate charge

2. Refund Process
- Raise a dispute within 7 days of service completion
- Our team will investigate within 48 hours
- Refund initiated within 5-7 business days

3. Refund Amount
- Full refund if provider did not show up
- Partial refund if service was incomplete
- Full refund for duplicate charges

4. Non-Refundable Cases
- Change of mind after service completion
- Service completed as described
- Cancellation less than 1 hour before scheduled time

5. How to Request
- Go to My Bookings → Select booking → Raise Dispute
- Or email support@bookyourservice.co.in', '2025-01-01'),

('COOKIES', 'Cookie Policy', 'Last updated: January 2025

1. What Are Cookies
Small text files stored on your device when you visit our website.

2. Cookies We Use
- Essential: Session management, authentication
- Functional: Remember your preferences
- Analytics: Understand how you use our platform (Google Analytics)

3. Third-Party Cookies
- Payment gateways (Razorpay) for secure transactions
- Analytics providers for usage insights

4. Managing Cookies
You can control cookies through your browser settings. Disabling essential cookies may affect site functionality.

5. Contact
Email privacy@bookyourservice.co.in for cookie-related questions.', '2025-01-01'),

('AUP', 'Acceptable Use Policy', 'Last updated: January 2025

1. Acceptable Use
- Use the platform for legitimate home service bookings
- Provide accurate information
- Communicate respectfully with other users
- Pay for services received

2. Prohibited Activities
- Fraudulent bookings or payments
- Harassment of providers or clients
- Spam or unsolicited advertising
- Attempting to bypass security measures
- Creating fake accounts or reviews
- Sharing illegal or harmful content

3. Consequences of Violation
- Warning for first offense
- Account suspension for repeated violations
- Permanent ban for serious violations
- Legal action for fraud or illegal activities', '2025-01-01'),

('PROVIDER_AGREEMENT', 'Provider Agreement', 'Last updated: January 2025

1. Provider Requirements
- Must complete KYC verification
- Must have relevant skills and experience
- Must maintain professional conduct
- Must arrive on time for scheduled bookings

2. Service Standards
- Complete services as described
- Use quality materials
- Maintain cleanliness at service location
- Communicate proactively with clients

3. Compensation
- Providers receive service price minus 5% platform fee
- Payments are settled within 3 business days
- GST is the provider''s responsibility

4. Termination
- Either party may terminate with 30 days notice
- Immediate termination for policy violations
- Outstanding payments will be settled', '2025-01-01'),

('COMMUNITY_GUIDELINES', 'Community Guidelines', 'Last updated: January 2025

1. Be Respectful
- Treat all users with courtesy and respect
- No discrimination based on caste, religion, gender, or background
- No abusive language or threats

2. Be Honest
- Provide genuine reviews and ratings
- Report issues truthfully
- Do not create fake accounts or reviews

3. Be Safe
- Verify provider identity before allowing entry
- Keep children supervised during service
- Report safety concerns immediately

4. Be Responsible
- Pay for services on time
- Be available at scheduled booking times
- Cancel well in advance if needed

5. Community Support
- Help us improve by providing feedback
- Report violations to support@bookyourservice.co.in', '2025-01-01');

-- Revenue Streams
INSERT INTO "RevenueStream" ("streamType", description, "revenueModel", status, "estimatedMonthlyRevenue") VALUES
('Commission', '5% commission on every completed booking', 'COMMISSION', 'ACTIVE', 50000),
('Premium Listing', 'Featured placement for provider services', 'FEATURED_LISTING', 'ACTIVE', 20000),
('Subscription', 'Monthly subscription for priority bookings', 'SUBSCRIPTION', 'PLANNED', 30000);

-- Reset sequences for SERIAL columns after explicit ID inserts
SELECT setval('"Role_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "Role"));
SELECT setval('"ServiceCategory_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "ServiceCategory"));
SELECT setval('"ServiceSubcategory_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "ServiceSubcategory"));
SELECT setval('"Faq_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "Faq"));
SELECT setval('"LegalPage_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "LegalPage"));
SELECT setval('"SeoMetadata_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "SeoMetadata"));
SELECT setval('"RevenueStream_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "RevenueStream"));
SELECT setval('"PlatformStats_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "PlatformStats"));
