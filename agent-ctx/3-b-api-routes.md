# Task 3-b: API Routes for Bookings, Reviews, Stats, FAQ, Contact, Legal

## Created Files

### Bookings (7 files)
1. `functions/api/bookings/index.ts` - GET (role-based listing) + POST (create booking)
2. `functions/api/bookings/[id].ts` - GET booking details
3. `functions/api/bookings/[id]/accept.ts` - POST accept (PENDING→CONFIRMED)
4. `functions/api/bookings/[id]/reject.ts` - POST reject (PENDING→REJECTED)
5. `functions/api/bookings/[id]/cancel.ts` - POST cancel (PENDING/CONFIRMED→CANCELLED)
6. `functions/api/bookings/[id]/start.ts` - POST start (CONFIRMED→IN_PROGRESS)
7. `functions/api/bookings/[id]/complete.ts` - POST complete (IN_PROGRESS→COMPLETED)

### Reviews (2 files)
8. `functions/api/reviews/index.ts` - GET (by serviceId) + POST (create review)
9. `functions/api/reviews/[id].ts` - GET single review

### Stats (2 files)
10. `functions/api/stats/platform.ts` - GET platform stats (public)
11. `functions/api/stats/visitor.ts` - POST track visitor session

### FAQ (1 file)
12. `functions/api/faq/index.ts` - GET active FAQ items

### Contact (1 file)
13. `functions/api/contact/index.ts` - POST submit contact form

### Legal (2 files)
14. `functions/api/legal/index.ts` - GET list of legal documents
15. `functions/api/legal/[type].ts` - GET specific legal document

## Schema Mappings
- Booking table: `serviceAddress` (combined address+city+pincode), `bookingNumber`, `platformFee`, `providerEarnings`, `specialInstructions` (not `notes`), `cancelledBy`+`cancelledAt`
- Review table: `reviewerId`/`reviewedId` (not `clientId`), `bookingId` UNIQUE
- Faq table (not FAQ): `category`, `isActive`
- ContactMessage (not ContactSubmission): `isRead`
- LegalPage (not LegalDocument): `pageType` (not `type`), `version`, `effectiveDate`
- VisitorSession (not Visitor): `sessionId` UNIQUE, `ipAddress`, `userAgent`

## Key Decisions
- All booking status transitions validate current status before allowing change
- Notifications created for all booking status changes
- Review creation auto-updates Service.averageRating and totalReviews
- Visitor tracking upserts sessions and updates PlatformStats
- Legal type mapping: terms→terms-of-service, privacy→privacy-policy, etc.
