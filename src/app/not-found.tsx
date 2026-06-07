import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#D4A017] p-8">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="text-8xl font-extrabold text-[#0A1F44] mb-4">404</div>
        <h1 className="text-2xl font-extrabold text-[#0A1F44] mb-3">Page Not Found</h1>
        <p className="text-slate-500 mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <div className="flex flex-col gap-3">
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0A1F44] text-[#FFD54F] font-bold hover:bg-[#132D5E] transition-all"
          >
            <Home className="size-4" /> Go Home
          </a>
        </div>
      </div>
    </div>
  )
}
