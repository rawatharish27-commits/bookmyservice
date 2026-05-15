# Task 4 - Update Header & Footer with Navy Blue Theme

## Task
Update header and footer components to use NAVY BLUE theme and show all 11 service categories.

## Changes Made

### header.tsx
- Replaced ALL emerald/teal/cyan colors with navy blue (#1e3a5f, #2d5a8e, #3b82f6)
- Simplified unauthenticated nav: Home | Services | How It Works | Contact (was 7 links)
- Removed individual category links (Plumbing, Electrical, AC & HVAC)
- Removed unused Droplets and Wind icon imports
- All role badges, avatar gradients, mobile menu updated to navy blue
- All hover/active states use blue-50/blue-700 instead of emerald-50/emerald-600

### footer.tsx
- Replaced ALL emerald/teal/cyan colors with navy blue
- Updated serviceLinks from 3 to 11 categories with icons:
  - Air Conditioner (Thermometer), Refrigerator (Snowflake), Washing Machine (RotateCcw)
  - Kitchen Appliances (Utensils), TV Repair (Tv), Water Purifier (Droplets)
  - Geyser (Flame), Plumber (Wrench), Electrician (Zap)
  - Water Tank Cleaning (GlassWater), Movers & Packers (Truck)
- Added new icon imports: Thermometer, Snowflake, RotateCcw, Utensils, Tv, Flame, GlassWater, Truck
- Removed Wind icon (no longer used)
- Added max-h-96 overflow-y-auto for scrollable service list
- All underline gradients, social hover, contact pills updated to navy blue

## Status: COMPLETE
