-- BookYourService Seed Data
-- Migration 0002: Initial data

-- Roles
INSERT INTO Role (id, name, description) VALUES (1, 'CLIENT', 'Service booking client');
INSERT INTO Role (id, name, description) VALUES (2, 'PROVIDER', 'Service provider professional');
INSERT INTO Role (id, name, description) VALUES (3, 'ADMIN', 'Platform administrator');

-- Service Categories (Plumbing, Electrical, AC & HVAC)
INSERT INTO ServiceCategory (id, name, slug, description, icon, isActive, displayOrder) VALUES (1, 'Plumbing', 'plumbing', 'Expert plumbing services for your home — pipe repair, leak detection, drain cleaning, and more', 'Droplets', 1, 1);
INSERT INTO ServiceCategory (id, name, slug, description, icon, isActive, displayOrder) VALUES (2, 'Electrical', 'electrical', 'Certified electricians for safe and reliable electrical solutions', 'Zap', 1, 2);
INSERT INTO ServiceCategory (id, name, slug, description, icon, isActive, displayOrder) VALUES (3, 'AC & HVAC', 'ac-hvac', 'Professional AC and HVAC installation, repair, and maintenance services', 'Wind', 1, 3);

-- Plumbing Subcategories
INSERT INTO ServiceSubcategory (categoryId, name, slug, description, isActive, displayOrder) VALUES (1, 'Pipe Repair & Fitting', 'pipe-repair-fitting', 'Pipe leak repair, replacement, and new fitting installation', 1, 1);
INSERT INTO ServiceSubcategory (categoryId, name, slug, description, isActive, displayOrder) VALUES (1, 'Leak Detection & Fix', 'leak-detection-fix', 'Professional water leak detection and repair services', 1, 2);
INSERT INTO ServiceSubcategory (categoryId, name, slug, description, isActive, displayOrder) VALUES (1, 'Drain Cleaning', 'drain-cleaning', 'Blocked drain unclogging and cleaning services', 1, 3);
INSERT INTO ServiceSubcategory (categoryId, name, slug, description, isActive, displayOrder) VALUES (1, 'Water Heater Installation', 'water-heater-installation', 'Geyser and water heater installation and repair', 1, 4);
INSERT INTO ServiceSubcategory (categoryId, name, slug, description, isActive, displayOrder) VALUES (1, 'Bathroom Plumbing', 'bathroom-plumbing', 'Complete bathroom plumbing installation and repair', 1, 5);
INSERT INTO ServiceSubcategory (categoryId, name, slug, description, isActive, displayOrder) VALUES (1, 'Kitchen Plumbing', 'kitchen-plumbing', 'Kitchen sink, tap, and pipe installation and repair', 1, 6);
INSERT INTO ServiceSubcategory (categoryId, name, slug, description, isActive, displayOrder) VALUES (1, 'Sewer Line Service', 'sewer-line-service', 'Sewer line cleaning, repair, and replacement', 1, 7);
INSERT INTO ServiceSubcategory (categoryId, name, slug, description, isActive, displayOrder) VALUES (1, 'Tap & Faucet Repair', 'tap-faucet-repair', 'Tap installation, repair, and replacement', 1, 8);
INSERT INTO ServiceSubcategory (categoryId, name, slug, description, isActive, displayOrder) VALUES (1, 'Toilet Repair', 'toilet-repair', 'Toilet installation, flush repair, and unclogging', 1, 9);
INSERT INTO ServiceSubcategory (categoryId, name, slug, description, isActive, displayOrder) VALUES (1, 'Water Pressure Fix', 'water-pressure-fix', 'Low water pressure diagnosis and fix', 1, 10);

-- Electrical Subcategories
INSERT INTO ServiceSubcategory (categoryId, name, slug, description, isActive, displayOrder) VALUES (2, 'Wiring & Rewiring', 'wiring-rewiring', 'Complete house wiring and rewiring by certified electricians', 1, 1);
INSERT INTO ServiceSubcategory (categoryId, name, slug, description, isActive, displayOrder) VALUES (2, 'Switch & Outlet Fix', 'switch-outlet-fix', 'Switch, socket, and electrical outlet repair and installation', 1, 2);
INSERT INTO ServiceSubcategory (categoryId, name, slug, description, isActive, displayOrder) VALUES (2, 'Ceiling Fan Installation', 'ceiling-fan-installation', 'Ceiling fan, exhaust fan installation and repair', 1, 3);
INSERT INTO ServiceSubcategory (categoryId, name, slug, description, isActive, displayOrder) VALUES (2, 'MCB & Fuse Repair', 'mcb-fuse-repair', 'MCB, fuse box, and circuit breaker repair and replacement', 1, 4);
INSERT INTO ServiceSubcategory (categoryId, name, slug, description, isActive, displayOrder) VALUES (2, 'Light Fixture Setup', 'light-fixture-setup', 'Light fitting, LED installation, and lighting solutions', 1, 5);
INSERT INTO ServiceSubcategory (categoryId, name, slug, description, isActive, displayOrder) VALUES (2, 'Inverter & UPS Setup', 'inverter-ups-setup', 'Inverter and UPS installation, battery replacement', 1, 6);
INSERT INTO ServiceSubcategory (categoryId, name, slug, description, isActive, displayOrder) VALUES (2, 'Electrical Inspection', 'electrical-inspection', 'Complete electrical safety inspection and audit', 1, 7);
INSERT INTO ServiceSubcategory (categoryId, name, slug, description, isActive, displayOrder) VALUES (2, 'Appliance Wiring', 'appliance-wiring', 'AC, geyser, and heavy appliance wiring', 1, 8);
INSERT INTO ServiceSubcategory (categoryId, name, slug, description, isActive, displayOrder) VALUES (2, 'Earthing & Grounding', 'earthing-grounding', 'Electrical earthing and grounding installation', 1, 9);
INSERT INTO ServiceSubcategory (categoryId, name, slug, description, isActive, displayOrder) VALUES (2, 'Doorbell & Intercom', 'doorbell-intercom', 'Doorbell, intercom, and video door phone installation', 1, 10);

-- AC & HVAC Subcategories
INSERT INTO ServiceSubcategory (categoryId, name, slug, description, isActive, displayOrder) VALUES (3, 'AC Installation', 'ac-installation', 'Split and window AC installation service', 1, 1);
INSERT INTO ServiceSubcategory (categoryId, name, slug, description, isActive, displayOrder) VALUES (3, 'AC Repair & Gas Refill', 'ac-repair-gas-refill', 'AC repair, gas refill, and cooling restore', 1, 2);
INSERT INTO ServiceSubcategory (categoryId, name, slug, description, isActive, displayOrder) VALUES (3, 'AC Servicing & Cleaning', 'ac-servicing-cleaning', 'Regular AC servicing, deep cleaning, and filter replacement', 1, 3);
INSERT INTO ServiceSubcategory (categoryId, name, slug, description, isActive, displayOrder) VALUES (3, 'HVAC System Repair', 'hvac-system-repair', 'Central HVAC system diagnosis and repair', 1, 4);
INSERT INTO ServiceSubcategory (categoryId, name, slug, description, isActive, displayOrder) VALUES (3, 'Duct Cleaning', 'duct-cleaning', 'AC duct cleaning and sanitization', 1, 5);
INSERT INTO ServiceSubcategory (categoryId, name, slug, description, isActive, displayOrder) VALUES (3, 'Thermostat Repair', 'thermostat-repair', 'Thermostat and temperature control repair', 1, 6);
INSERT INTO ServiceSubcategory (categoryId, name, slug, description, isActive, displayOrder) VALUES (3, 'Heat Pump Service', 'heat-pump-service', 'Heat pump installation, repair, and maintenance', 1, 7);
INSERT INTO ServiceSubcategory (categoryId, name, slug, description, isActive, displayOrder) VALUES (3, 'Ventilation Service', 'ventilation-service', 'Ventilation system installation and cleaning', 1, 8);
INSERT INTO ServiceSubcategory (categoryId, name, slug, description, isActive, displayOrder) VALUES (3, 'Refrigerant Leak Fix', 'refrigerant-leak-fix', 'Refrigerant leak detection and repair', 1, 9);
INSERT INTO ServiceSubcategory (categoryId, name, slug, description, isActive, displayOrder) VALUES (3, 'Central AC Service', 'central-ac-service', 'Central air conditioning system service and repair', 1, 10);

-- Admin User (password: Admin@2024)
INSERT INTO User (id, email, phone, passwordHash, name, roleId, status, city, state, country) VALUES
('admin-001', 'admin@bookyourservice.co.in', '9999999999', '$pbkdf2-sha512$i=100000$YWJtaW4tc2FsdC0xMjM0NTY3ODk=$dGhpcyBpcyBhIGZha2UgaGFzaCBmb3IgZGV2IHRlc3Rpbmcgb25seQ==', 'Admin', 3, 'ACTIVE', 'Mumbai', 'Maharashtra', 'India');

-- Platform Stats
INSERT INTO PlatformStats (id, totalVisitors, totalUsers, totalProviders, totalBookings, totalServices, activeVisitors) VALUES (1, 0, 1, 0, 0, 0, 0);

-- FAQ Items
INSERT INTO Faq (category, question, answer, displayOrder, isActive) VALUES
('General', 'How does BookYourService work?', 'Browse services, select a provider, book an appointment, and get the service done at your home. Pay only after service completion.', 1, 1),
('General', 'What services do you offer?', 'We offer Plumbing, Electrical, and AC & HVAC services across India. Each category has 10+ specialized sub-services.', 2, 1),
('General', 'What are the service charges?', 'Service prices range from ₹199 to ₹499 depending on the service type. No hidden charges — the price you see is the price you pay.', 3, 1),
('Booking', 'How do I book a service?', 'Select a service, choose your preferred date and time, enter your address, and confirm. A verified provider will be assigned to you.', 4, 1),
('Booking', 'Can I cancel a booking?', 'Yes, you can cancel a booking before the provider starts the service. Cancellation is free if done at least 2 hours before the scheduled time.', 5, 1),
('Payment', 'How do I pay for a service?', 'Payment is collected after the service is completed. We support UPI, cards, and net banking through secure payment gateways.', 6, 1),
('Payment', 'Is there a refund policy?', 'Yes. If the service is not completed satisfactorily, you can raise a dispute and get a full refund within 7 days.', 7, 1),
('Provider', 'How do I become a service provider?', 'Register as a Provider, complete KYC verification, and start listing your services. We verify all providers for safety and quality.', 8, 1),
('Provider', 'How much can I earn?', 'Providers earn the service price minus a small platform fee. Top providers earn ₹50,000+ per month.', 9, 1),
('Safety', 'Are service providers verified?', 'Yes, all providers undergo KYC verification including identity proof, address proof, and skill verification before being listed on the platform.', 10, 1);

-- Legal Pages
INSERT INTO LegalPage (pageType, title, content, effectiveDate) VALUES
('TERMS', 'Terms of Service', 'Last updated: January 2025\n\nWelcome to BookYourService. By using our platform, you agree to these terms.\n\n1. Service Agreement\nBookYourService connects clients with verified service providers for home services including Plumbing, Electrical, and AC & HVAC.\n\n2. User Responsibilities\n- Provide accurate information during registration\n- Maintain the security of your account credentials\n- Use the platform only for lawful purposes\n- Treat service providers with respect\n\n3. Service Booking\n- All bookings are subject to provider availability\n- Prices are transparent and range from ₹199 to ₹499\n- Services must be paid for after completion\n\n4. Cancellation Policy\n- Free cancellation up to 2 hours before scheduled time\n- Late cancellations may incur a fee\n\n5. Payment Terms\n- Payment is collected after service completion\n- We use secure payment gateways (Razorpay)\n- Platform fee of 5% is charged to providers\n\n6. Limitation of Liability\nBookYourService acts as a marketplace. We are not responsible for the quality of work performed by providers, though we mediate disputes.\n\n7. Dispute Resolution\nContact us within 7 days of service completion for any issues. We will investigate and resolve disputes fairly.', '2025-01-01'),

('PRIVACY', 'Privacy Policy', 'Last updated: January 2025\n\nYour privacy is important to us. This policy explains how we collect, use, and protect your data.\n\n1. Information We Collect\n- Account information: name, email, phone, address\n- Service data: bookings, reviews, payment history\n- Device data: IP address, browser type, location\n\n2. How We Use Your Data\n- To provide and improve our services\n- To match you with service providers\n- To process payments securely\n- To send booking confirmations and updates\n- To prevent fraud and abuse\n\n3. Data Protection\n- All data is encrypted in transit (TLS 1.3)\n- Passwords are hashed using PBKDF2-SHA512\n- We never share your personal data with third parties for marketing\n\n4. Your Rights\n- Access your personal data\n- Request data correction or deletion\n- Opt out of marketing communications\n- Export your data\n\n5. Data Retention\n- Account data: retained while account is active\n- Booking data: retained for 3 years for legal compliance\n- Payment data: retained for 7 years per Indian tax law\n\n6. Contact\nFor privacy concerns, email us at privacy@bookyourservice.co.in', '2025-01-01'),

('REFUND', 'Refund Policy', 'Last updated: January 2025\n\n1. Eligibility for Refund\n- Service not performed as described\n- Provider did not show up\n- Service quality is unsatisfactory\n- Duplicate charge\n\n2. Refund Process\n- Raise a dispute within 7 days of service completion\n- Our team will investigate within 48 hours\n- Refund initiated within 5-7 business days\n\n3. Refund Amount\n- Full refund if provider did not show up\n- Partial refund if service was incomplete\n- Full refund for duplicate charges\n\n4. Non-Refundable Cases\n- Change of mind after service completion\n- Service completed as described\n- Cancellation less than 1 hour before scheduled time\n\n5. How to Request\n- Go to My Bookings → Select booking → Raise Dispute\n- Or email support@bookyourservice.co.in', '2025-01-01'),

('COOKIES', 'Cookie Policy', 'Last updated: January 2025\n\n1. What Are Cookies\nSmall text files stored on your device when you visit our website.\n\n2. Cookies We Use\n- Essential: Session management, authentication\n- Functional: Remember your preferences\n- Analytics: Understand how you use our platform (Google Analytics)\n\n3. Third-Party Cookies\n- Payment gateways (Razorpay) for secure transactions\n- Analytics providers for usage insights\n\n4. Managing Cookies\nYou can control cookies through your browser settings. Disabling essential cookies may affect site functionality.\n\n5. Contact\nEmail privacy@bookyourservice.co.in for cookie-related questions.', '2025-01-01'),

('AUP', 'Acceptable Use Policy', 'Last updated: January 2025\n\n1. Acceptable Use\n- Use the platform for legitimate home service bookings\n- Provide accurate information\n- Communicate respectfully with other users\n- Pay for services received\n\n2. Prohibited Activities\n- Fraudulent bookings or payments\n- Harassment of providers or clients\n- Spam or unsolicited advertising\n- Attempting to bypass security measures\n- Creating fake accounts or reviews\n- Sharing illegal or harmful content\n\n3. Consequences of Violation\n- Warning for first offense\n- Account suspension for repeated violations\n- Permanent ban for serious violations\n- Legal action for fraud or illegal activities', '2025-01-01'),

('PROVIDER_AGREEMENT', 'Provider Agreement', 'Last updated: January 2025\n\n1. Provider Requirements\n- Must complete KYC verification\n- Must have relevant skills and experience\n- Must maintain professional conduct\n- Must arrive on time for scheduled bookings\n\n2. Service Standards\n- Complete services as described\n- Use quality materials\n- Maintain cleanliness at service location\n- Communicate proactively with clients\n\n3. Compensation\n- Providers receive service price minus 5% platform fee\n- Payments are settled within 3 business days\n- GST is the provider''s responsibility\n\n4. Termination\n- Either party may terminate with 30 days notice\n- Immediate termination for policy violations\n- Outstanding payments will be settled', '2025-01-01'),

('COMMUNITY_GUIDELINES', 'Community Guidelines', 'Last updated: January 2025\n\n1. Be Respectful\n- Treat all users with courtesy and respect\n- No discrimination based on caste, religion, gender, or background\n- No abusive language or threats\n\n2. Be Honest\n- Provide genuine reviews and ratings\n- Report issues truthfully\n- Do not create fake accounts or reviews\n\n3. Be Safe\n- Verify provider identity before allowing entry\n- Keep children supervised during service\n- Report safety concerns immediately\n\n4. Be Responsible\n- Pay for services on time\n- Be available at scheduled booking times\n- Cancel well in advance if needed\n\n5. Community Support\n- Help us improve by providing feedback\n- Report violations to support@bookyourservice.co.in', '2025-01-01');

-- Revenue Streams
INSERT INTO RevenueStream (streamType, description, revenueModel, status, estimatedMonthlyRevenue) VALUES
('Commission', '5% commission on every completed booking', 'COMMISSION', 'ACTIVE', 50000),
('Premium Listing', 'Featured placement for provider services', 'FEATURED_LISTING', 'ACTIVE', 20000),
('Subscription', 'Monthly subscription for priority bookings', 'SUBSCRIPTION', 'PLANNED', 30000);
