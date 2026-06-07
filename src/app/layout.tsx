import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const SITE_URL = "https://bookyourservice.co.in";

// ─── LocalBusiness Schema ───────────────────────────────────────────────────
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}/#business`,
  name: "BookMyService",
  description:
    "Palwal's #1 home service platform for AC repair, RO service, electrician, plumber, and more",
  url: SITE_URL,
  telephone: "+91-9999999999",
  priceRange: "₹99 - ₹499",
  image: `${SITE_URL}/og-image.png`,
  logo: `${SITE_URL}/logo.png`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Palwal",
    addressRegion: "Haryana",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "28.1281",
    longitude: "77.3298",
  },
  areaServed: {
    "@type": "City",
    name: "Palwal",
    containedInPlace: {
      "@type": "State",
      name: "Haryana",
    },
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "08:00",
    closes: "22:00",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    bestRating: "5",
    worstRating: "1",
    ratingCount: "1500",
  },
  sameAs: [],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Home Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "AC Repair & Service",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "RO Service & Repair",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Electrician Services",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Plumber Services",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "TV Repair",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Washing Machine Repair",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Geyser Repair",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Water Tank Cleaning",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Movers & Packers",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Kitchen Appliance Repair",
        },
      },
    ],
  },
};

// ─── WebSite Schema ─────────────────────────────────────────────────────────
const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "BookMyService",
  url: SITE_URL,
  description:
    "Palwal's #1 home service platform for AC repair, RO service, electrician, plumber, and more",
  publisher: {
    "@id": `${SITE_URL}/#business`,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
  inLanguage: "en-IN",
};

// ─── FAQPage Schema ─────────────────────────────────────────────────────────
const faqPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${SITE_URL}/#faq`,
  mainEntity: [
    {
      "@type": "Question",
      name: "What services does BookMyService offer in Palwal?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AC repair, RO service, electrician, plumber, TV repair, washing machine, geyser, water tank cleaning, movers & packers, and kitchen appliance repair.",
      },
    },
    {
      "@type": "Question",
      name: "How fast can I get a technician in Palwal?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Within 2 hours for regular bookings, and within 1 hour for emergency bookings.",
      },
    },
    {
      "@type": "Question",
      name: "Is there a warranty on services?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, all services come with a 3-month warranty. If the issue persists, we provide a free revisit.",
      },
    },
    {
      "@type": "Question",
      name: "What are the service charges in Palwal?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Services start from ₹99 with transparent fixed pricing. No hidden charges.",
      },
    },
    {
      "@type": "Question",
      name: "Which areas in Palwal does BookMyService cover?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We cover all areas in Palwal including HUDA Sectors, Camp Colony, Railway Road, Old City, New Colony, and surrounding localities within Palwal district.",
      },
    },
    {
      "@type": "Question",
      name: "How do I book a service on BookMyService?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can book a service through our website bookyourservice.co.in, or call us directly at +91-9999999999. Select your service, choose a time slot, and our verified technician will be at your doorstep.",
      },
    },
  ],
};

// ─── Service Schemas ────────────────────────────────────────────────────────
const serviceEntries = [
  {
    name: "AC Repair & Service in Palwal",
    description:
      "Professional AC repair, installation, gas refilling, and annual maintenance service in Palwal. Expert technicians for split AC, window AC, and central AC units. 3-month warranty included.",
    serviceType: "AC Repair & Service",
    url: `${SITE_URL}/ac-repair`,
  },
  {
    name: "RO Service & Repair in Palwal",
    description:
      "RO water purifier service, filter replacement, membrane change, and repair in Palwal. All brands serviced with genuine parts. Starting from ₹99.",
    serviceType: "RO Service & Repair",
    url: `${SITE_URL}/ro-service`,
  },
  {
    name: "Electrician Services in Palwal",
    description:
      "Licensed electrician for wiring, switchboard repair, fan installation, MCB replacement, and all electrical work in Palwal. Same-day service available.",
    serviceType: "Electrician Services",
    url: `${SITE_URL}/electrician`,
  },
  {
    name: "Plumber Services in Palwal",
    description:
      "Professional plumber for pipe repair, tap installation, bathroom fittings, leakage fix, and drainage solutions in Palwal. Transparent pricing, no hidden charges.",
    serviceType: "Plumber Services",
    url: `${SITE_URL}/plumber`,
  },
  {
    name: "TV Repair in Palwal",
    description:
      "LED, LCD, and Smart TV repair service in Palwal. Screen replacement, motherboard repair, and software update by certified technicians.",
    serviceType: "TV Repair",
    url: `${SITE_URL}/tv-repair`,
  },
  {
    name: "Washing Machine Repair in Palwal",
    description:
      "Washing machine repair for all brands — semi-automatic, fully automatic, and front-load. Drum issues, motor repair, and drainage fix in Palwal.",
    serviceType: "Washing Machine Repair",
    url: `${SITE_URL}/washing-machine-repair`,
  },
  {
    name: "Geyser Repair in Palwal",
    description:
      "Water heater / geyser repair and installation in Palwal. Thermostat replacement, element change, and leakage fix. All brands covered.",
    serviceType: "Geyser Repair",
    url: `${SITE_URL}/geyser-repair`,
  },
  {
    name: "Water Tank Cleaning in Palwal",
    description:
      "Professional water tank cleaning and sanitization service in Palwal. Industrial-grade cleaning for overhead and underground tanks. Hygiene guaranteed.",
    serviceType: "Water Tank Cleaning",
    url: `${SITE_URL}/water-tank-cleaning`,
  },
  {
    name: "Movers & Packers in Palwal",
    description:
      "Reliable movers and packers for home and office shifting in Palwal. Safe packing, transportation, and unpacking with insurance coverage.",
    serviceType: "Movers & Packers",
    url: `${SITE_URL}/movers-packers`,
  },
  {
    name: "Kitchen Appliance Repair in Palwal",
    description:
      "Chimney, microwave, mixer grinder, and gas stove repair in Palwal. Expert technicians for all kitchen appliance brands with warranty.",
    serviceType: "Kitchen Appliance Repair",
    url: `${SITE_URL}/kitchen-appliance-repair`,
  },
];

const serviceSchemas = serviceEntries.map((svc, index) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${SITE_URL}/#service-${index + 1}`,
  name: svc.name,
  description: svc.description,
  serviceType: svc.serviceType,
  url: svc.url,
  provider: {
    "@id": `${SITE_URL}/#business`,
  },
  areaServed: {
    "@type": "City",
    name: "Palwal",
    containedInPlace: {
      "@type": "State",
      name: "Haryana",
    },
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: `${svc.serviceType} Pricing`,
    itemListElement: [
      {
        "@type": "Offer",
        price: "99",
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
        description: `Starting price for ${svc.serviceType} in Palwal`,
      },
    ],
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    bestRating: "5",
    worstRating: "1",
    ratingCount: "200",
  },
}));

// ─── BreadcrumbList Schema ──────────────────────────────────────────────────
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${SITE_URL}/#breadcrumb`,
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    },
  ],
};

// ─── Combine all schemas ────────────────────────────────────────────────────
const allSchemas = [
  localBusinessSchema,
  webSiteSchema,
  faqPageSchema,
  breadcrumbSchema,
  ...serviceSchemas,
];

export const metadata: Metadata = {
  title: "BookMyService — Palwal's #1 Home Service Platform | AC Repair, Electrician, Plumber",
  description: "Book verified technicians for AC repair, RO service, electrician, plumber, TV repair & more in Palwal. Service within 2 hours. 3 months warranty. Fixed pricing from ₹99.",
  keywords: [
    "AC repair Palwal", "electrician Palwal", "plumber Palwal", "RO service Palwal",
    "home service Palwal", "appliance repair Palwal", "TV repair Palwal",
    "geyser repair Palwal", "water purifier Palwal", "washing machine repair Palwal",
    "water tank cleaning Palwal", "movers and packers Palwal",
    "BookMyService", "book my service", "home service booking",
    "verified technician", "same day service", "service warranty",
    "HUDA Sector Palwal", "Camp Colony Palwal", "Railway Road Palwal",
  ],
  authors: [{ name: "BookMyService" }],
  creator: "BookMyService",
  publisher: "BookMyService",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "BookMyService",
    title: "BookMyService — Palwal's #1 Home Service Platform",
    description: "AC Repair, RO Service, Electrician, Plumber & More — Service Within 2 Hours. 3 Months Warranty. Starting ₹99.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BookMyService — Palwal's #1 Home Service Platform",
    description: "Book verified technicians for home services in Palwal. Service within 2 hours. 3 months warranty.",
  },
  other: {
    'cache-control': 'no-cache',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("scroll-smooth", "font-sans", geist.variable)}>
      <head>
        <link rel="canonical" href={SITE_URL} />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased bg-background text-foreground m-0 p-0">
        {/* ─── JSON-LD Structured Data for SEO ──────────────────────────── */}
        {allSchemas.map((schema, index) => (
          <script
            key={`schema-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}

        {children}
      </body>
    </html>
  );
}
