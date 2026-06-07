export default function Loading() {
  return (
    <div className="min-h-screen bg-[#D4A017] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFD54F] to-[#D4A017] flex items-center justify-center text-[#0A1F44] font-bold text-lg animate-pulse shadow-lg">B</div>
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full bg-[#0A1F44] animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="size-2.5 rounded-full bg-[#0A1F44] animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="size-2.5 rounded-full bg-[#0A1F44] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-sm font-medium text-[#0A1F44]/70">Loading BookMyService...</p>
      </div>
    </div>
  )
}
