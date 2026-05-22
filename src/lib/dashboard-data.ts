// ─── Data for All Three Dashboards ────────────────────────────────
// This data should eventually come from API endpoints via useApi hooks.
// Currently used as placeholder data for dashboard components.

// ─── Admin Dashboard Data ──────────────────────────────────────────────

export const adminMetrics = [
  { title: 'Total Users', value: '12,548', change: '+18.2%', trend: 'up' as const, icon: 'Users', color: 'blue' },
  { title: 'Total Providers', value: '2,845', change: '+15.7%', trend: 'up' as const, icon: 'Briefcase', color: 'green' },
  { title: 'Total Bookings', value: '8,632', change: '+22.4%', trend: 'up' as const, icon: 'Calendar', color: 'purple' },
  { title: 'Total Revenue', value: '₹24,58,320', change: '+28.6%', trend: 'up' as const, icon: 'IndianRupee', color: 'yellow' },
  { title: 'Total Transactions', value: '15,235', change: '+16.8%', trend: 'up' as const, icon: 'CreditCard', color: 'red' },
  { title: 'Average Rating', value: '4.6', change: '+0.4', trend: 'up' as const, icon: 'Star', color: 'cyan' },
]

export const bookingStatsData = [
  { date: 'May 19', bookings: 820, completed: 640 },
  { date: 'May 20', bookings: 932, completed: 720 },
  { date: 'May 21', bookings: 1101, completed: 890 },
  { date: 'May 22', bookings: 894, completed: 680 },
  { date: 'May 23', bookings: 1050, completed: 820 },
  { date: 'May 24', bookings: 1180, completed: 950 },
  { date: 'May 25', bookings: 980, completed: 760 },
  { date: 'May 26', bookings: 1120, completed: 880 },
  { date: 'May 27', bookings: 1040, completed: 810 },
  { date: 'May 28', bookings: 960, completed: 750 },
  { date: 'May 29', bookings: 1080, completed: 860 },
  { date: 'May 30', bookings: 1150, completed: 920 },
  { date: 'Jun 1', bookings: 1020, completed: 790 },
  { date: 'Jun 2', bookings: 940, completed: 720 },
  { date: 'Jun 3', bookings: 870, completed: 650 },
  { date: 'Jun 4', bookings: 1100, completed: 880 },
  { date: 'Jun 5', bookings: 1060, completed: 840 },
  { date: 'Jun 6', bookings: 990, completed: 770 },
  { date: 'Jun 7', bookings: 1150, completed: 910 },
  { date: 'Jun 8', bookings: 890, completed: 690 },
  { date: 'Jun 9', bookings: 1040, completed: 830 },
  { date: 'Jun 10', bookings: 980, completed: 760 },
  { date: 'Jun 11', bookings: 1120, completed: 890 },
  { date: 'Jun 12', bookings: 1050, completed: 840 },
  { date: 'Jun 13', bookings: 970, completed: 750 },
  { date: 'Jun 14', bookings: 1180, completed: 940 },
  { date: 'Jun 15', bookings: 1100, completed: 870 },
  { date: 'Jun 16', bookings: 1020, completed: 800 },
  { date: 'Jun 17', bookings: 960, completed: 740 },
  { date: 'Jun 18', bookings: 1080, completed: 860 },
  { date: 'Jun 19', bookings: 1150, completed: 920 },
]

export const bookingsByStatusData = [
  { name: 'Completed', value: 4521, color: '#10b981' },
  { name: 'Pending', value: 2156, color: '#f59e0b' },
  { name: 'Confirmed', value: 1245, color: '#3b82f6' },
  { name: 'Cancelled', value: 710, color: '#8b5cf6' },
]

export const recentBookingsAdmin = [
  { id: '1', service: 'Air Conditioner', date: 'May 19, 2024', time: '10:30 AM', status: 'Completed', amount: '₹499', color: 'green' },
  { id: '2', service: 'Plumber', date: 'May 19, 2024', time: '11:00 AM', status: 'Confirmed', amount: '₹199', color: 'blue' },
  { id: '3', service: 'Electrician', date: 'May 19, 2024', time: '12:30 PM', status: 'Pending', amount: '₹299', color: 'orange' },
  { id: '4', service: 'Washing Machine Repair', date: 'May 19, 2024', time: '02:00 PM', status: 'Confirmed', amount: '₹349', color: 'blue' },
  { id: '5', service: 'Water Purifier Service', date: 'May 19, 2024', time: '03:30 PM', status: 'Cancelled', amount: '₹349', color: 'red' },
]

export const revenueOverviewData = [
  { date: 'May 19', revenue: 32400 },
  { date: 'May 22', revenue: 28500 },
  { date: 'May 25', revenue: 42300 },
  { date: 'May 28', revenue: 38100 },
  { date: 'May 31', revenue: 45600 },
  { date: 'Jun 3', revenue: 35200 },
  { date: 'Jun 6', revenue: 41800 },
  { date: 'Jun 9', revenue: 39400 },
  { date: 'Jun 12', revenue: 47200 },
  { date: 'Jun 15', revenue: 43500 },
  { date: 'Jun 18', revenue: 49800 },
  { date: 'Jun 19', revenue: 42600 },
]

export const topServicesData = [
  { rank: 1, name: 'Air Conditioner', revenue: '₹6,14,400', bookings: '2,456', growth: '25.0%', icon: '❄️' },
  { rank: 2, name: 'Plumber', revenue: '₹4,70,104', bookings: '1,896', growth: '19.1%', icon: '🔧' },
  { rank: 3, name: 'Electrician', revenue: '₹3,85,512', bookings: '1,542', growth: '15.7%', icon: '⚡' },
  { rank: 4, name: 'Water Purifier', revenue: '₹3,14,400', bookings: '1,256', growth: '12.8%', icon: '💧' },
  { rank: 5, name: 'Washing Machine', revenue: '₹2,58,000', bookings: '1,032', growth: '10.5%', icon: '🫧' },
]

export const userGrowthData = [
  { date: 'May 19', users: 8200 },
  { date: 'May 22', users: 8600 },
  { date: 'May 25', users: 9100 },
  { date: 'May 28', users: 9400 },
  { date: 'May 31', users: 9800 },
  { date: 'Jun 3', users: 10200 },
  { date: 'Jun 6', users: 10600 },
  { date: 'Jun 9', users: 10900 },
  { date: 'Jun 12', users: 11300 },
  { date: 'Jun 15', users: 11700 },
  { date: 'Jun 18', users: 12100 },
  { date: 'Jun 19', users: 12548 },
]

// ─── Client Dashboard Data ─────────────────────────────────────────────

export const clientMetrics = [
  { title: 'Total Bookings', value: '12', change: '+20%', trend: 'up' as const, icon: 'Calendar', color: 'blue' },
  { title: 'Completed', value: '8', change: '+25%', trend: 'up' as const, icon: 'CheckCircle', color: 'green' },
  { title: 'Upcoming', value: '3', change: 'No change', trend: 'neutral' as const, icon: 'Clock', color: 'orange' },
  { title: 'Cancelled', value: '1', change: '-50%', trend: 'down' as const, icon: 'XCircle', color: 'purple' },
  { title: 'Wallet Balance', value: '₹1,250', change: '', trend: 'up' as const, icon: 'Wallet', color: 'blue', link: 'Add Money' },
]

export const upcomingBooking = {
  service: 'Air Conditioner',
  status: 'Confirmed',
  date: '22 May 2024',
  time: '10:00 AM - 12:00 PM',
  address: 'A-123, Green Park, New Delhi - 110016',
  provider: 'Cool Care Services',
  amount: '₹499',
}

export const clientRecentBookings = [
  { id: '1', service: 'Plumber', date: '18 May 2024', time: '11:00 AM', status: 'Completed', amount: '₹199' },
  { id: '2', service: 'Electrician', date: '15 May 2024', time: '02:00 PM', status: 'Completed', amount: '₹299' },
  { id: '3', service: 'Washing Machine Repair', date: '10 May 2024', time: '04:30 PM', status: 'Completed', amount: '₹349' },
  { id: '4', service: 'TV Repair', date: '05 May 2024', time: '01:00 PM', status: 'Cancelled', amount: '₹399' },
]

export const clientQuickActions = [
  { icon: 'Calendar', label: 'My Bookings', description: 'View all your bookings', color: 'blue' },
  { icon: 'Wallet', label: 'My Wallet', description: 'View wallet transactions', color: 'green' },
  { icon: 'Shield', label: 'My AMC', description: 'View AMC plans', color: 'cyan' },
  { icon: 'Tag', label: 'Coupons', description: 'View best offers', color: 'pink' },
  { icon: 'Users', label: 'Refer & Earn', description: 'Invite & earn rewards', color: 'purple' },
]

export const walletTransactions = [
  { id: '1', description: 'Added Money', date: '20 May 2024', amount: '+₹500', type: 'credit' as const },
  { id: '2', description: 'Booking Payment', date: '18 May 2024', amount: '-₹299', type: 'debit' as const },
  { id: '3', description: 'Cashback Credit', date: '15 May 2024', amount: '+₹50', type: 'credit' as const },
]

export const activeAMC = {
  name: 'Platinum Home AMC',
  status: 'Active',
  validTill: '20 Dec 2024',
  visitsUsed: 4,
  visitsTotal: 6,
  nextVisit: '20 Jun 2024',
}

export const clientOffers = [
  { title: 'UPTO 20% OFF', subtitle: 'on Air Conditioner', code: 'AC20', color: 'purple' },
  { title: 'Flat ₹50 Off', subtitle: 'on Your Next Booking', code: 'BMS50', color: 'orange' },
]

// ─── Provider Dashboard Data ───────────────────────────────────────────

export const providerMetrics = [
  { title: 'Total Bookings', value: '48', change: '+20.5%', trend: 'up' as const, icon: 'Calendar', color: 'blue' },
  { title: 'Completed', value: '36', change: '+18.2%', trend: 'up' as const, icon: 'CheckCircle', color: 'green' },
  { title: 'Upcoming', value: '10', change: '+11.1%', trend: 'up' as const, icon: 'Clock', color: 'orange' },
  { title: 'Cancelled', value: '2', change: '-33.3%', trend: 'down' as const, icon: 'XCircle', color: 'purple' },
  { title: 'Total Earnings', value: '₹18,750', change: '+22.8%', trend: 'up' as const, icon: 'IndianRupee', color: 'blue' },
]

export const earningsOverviewData = [
  { date: '13 May', earnings: 4200 },
  { date: '14 May', earnings: 3800 },
  { date: '15 May', earnings: 5100 },
  { date: '16 May', earnings: 4600 },
  { date: '17 May', earnings: 3200 },
  { date: '18 May', earnings: 4900 },
  { date: '19 May', earnings: 5450 },
]

export const providerRecentBookings = [
  { id: '1', service: 'Air Conditioner', date: '19 May 2024', time: '10:00 AM', amount: '₹499', status: 'Upcoming' },
  { id: '2', service: 'Refrigerator Repair', date: '19 May 2024', time: '02:00 PM', amount: '₹399', status: 'Completed' },
  { id: '3', service: 'Plumber', date: '18 May 2024', time: '11:30 AM', amount: '₹199', status: 'Completed' },
  { id: '4', service: 'Electrician', date: '18 May 2024', time: '04:00 PM', amount: '₹299', status: 'Upcoming' },
  { id: '5', service: 'Washing Machine Repair', date: '17 May 2024', time: '01:00 PM', amount: '₹349', status: 'Cancelled' },
]

export const todaySchedule = [
  { time: '10:00 AM', service: 'Air Conditioner', location: 'Green Park', status: 'upcoming' },
  { time: '12:00 PM', service: 'Electrician', location: 'Hauz Khas', status: 'upcoming' },
  { time: '02:00 PM', service: 'Plumber', location: 'Saket', status: 'completed' },
  { time: '04:00 PM', service: 'Geyser Installation', location: 'Malviya Nagar', status: 'upcoming' },
  { time: '06:00 PM', service: 'Water Purifier Service', location: 'Kotla', status: 'upcoming' },
]

export const providerServices = [
  { name: 'Air Conditioner', price: '₹499', status: 'Active' },
  { name: 'Refrigerator Repair', price: '₹399', status: 'Active' },
  { name: 'Plumber', price: '₹199', status: 'Active' },
  { name: 'Electrician', price: '₹299', status: 'Active' },
]

export const customerReviews = {
  average: 4.8,
  total: 128,
  distribution: [
    { stars: 5, count: 98 },
    { stars: 4, count: 22 },
    { stars: 3, count: 6 },
    { stars: 2, count: 1 },
    { stars: 1, count: 1 },
  ],
  recent: {
    name: 'Rohit Sharma',
    rating: 5,
    time: '2 days ago',
    text: 'Excellent service! Very professional and on time. Highly recommended.',
  },
}

export const earningsSummary = {
  walletBalance: '₹6,250',
  pendingPayout: '₹2,350',
  totalPayouts: '₹45,600',
}
