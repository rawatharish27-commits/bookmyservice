---
Task ID: 2-a
Agent: Communication Pages Builder
Task: Build 6 Communication page components

Work Log:
- Created chat-inbox-page.tsx - Chat inbox with conversation list, search bar, tabs (All/Unread/Support), avatar + online status, unread badges, service name + booking ID, quick stats cards
- Created provider-customer-chat-page.tsx - Active chat with message bubbles (text/image/document/location/system), typing indicator, booking context header, quick replies, read receipts, attachment support, send message with simulated auto-reply
- Created admin-support-chat-page.tsx - Admin support chat monitor with split view (ticket list + chat), ticket priority badges (High/Medium/Low), status badges (Open/In Progress/Waiting), agent assignment dropdown, quick replies, search, stats cards
- Created attachment-preview-page.tsx - Full-screen attachment viewer with dark theme, zoom controls (25%-300%), rotation, fullscreen toggle, file info sidebar (name/size/type/sender/date/booking), PDF and image previews, thumbnail strip, navigation arrows, download/share buttons
- Created video-consultation-page.tsx - Video call interface with main video + PiP self-view, call controls (mute/camera/screen share/chat/details/end call), duration timer, chat sidebar with message history, booking details panel (service/provider/customer info), security badge
- Created call-history-page.tsx - Past calls list with date grouping, call type badges (video/audio), direction indicators (incoming/outgoing), status badges (Completed/Missed/Cancelled), filter tabs (All/Video/Audio/Missed), search, stats cards, call again buttons, CTA footer
- Fixed TypeScript errors: Message type union for 'system' sender, Select onValueChange type compatibility with @base-ui/react

Stage Summary:
- 6 communication pages built with full UI and mock data
- All pages use consistent design system: bg-[#f8fafc], white rounded-xl cards, blue-600 primary, p-4 sm:p-6 spacing
- Indian context: Indian names, ₹ currency, Indian addresses, Indian service types
- Each page fully functional with realistic mock data and interactive state management
- Zero TypeScript compilation errors in communication pages
