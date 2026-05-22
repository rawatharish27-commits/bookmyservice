'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Download,
  Wifi,
  Bell,
  Zap,
  Smartphone,
  QrCode,
  X,
  ChevronDown,
  ChevronUp,
  Apple,
  Monitor,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Shield,
  Clock,
} from 'lucide-react'

const features = [
  {
    icon: Wifi,
    title: 'Offline Access',
    description: 'Book services even without internet. Your bookings sync automatically when you\'re back online.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: Bell,
    title: 'Push Notifications',
    description: 'Get instant alerts for booking confirmations, provider arrivals, and exclusive offers.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: '3x faster loading with cached content. No more waiting for pages to load on slow networks.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'All data encrypted locally. Your payment info stays safe even on public Wi-Fi.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
]

const installSteps = {
  android: [
    { step: 1, text: 'Tap the menu icon (⋮) in the top right corner' },
    { step: 2, text: 'Select "Add to Home Screen" or "Install App"' },
    { step: 3, text: 'Tap "Install" to confirm' },
    { step: 4, text: 'Find the app on your home screen and enjoy!' },
  ],
  ios: [
    { step: 1, text: 'Tap the Share icon (↑) at the bottom of Safari' },
    { step: 2, text: 'Scroll down and tap "Add to Home Screen"' },
    { step: 3, text: 'Tap "Add" to confirm' },
    { step: 4, text: 'Find the app on your home screen and enjoy!' },
  ],
}

const testimonials = [
  {
    name: 'Priya S.',
    location: 'Mumbai',
    text: 'The app works perfectly even in my basement where there\'s no signal!',
    rating: 5,
  },
  {
    name: 'Rahul K.',
    location: 'Delhi',
    text: 'Notifications help me never miss my booking slots. Super convenient!',
    rating: 5,
  },
  {
    name: 'Anjali M.',
    location: 'Bangalore',
    text: 'So much faster than the website. I can book in seconds now.',
    rating: 4,
  },
]

export function InstallAppPage() {
  const [dismissed, setDismissed] = useState(false)
  const [showAndroidSteps, setShowAndroidSteps] = useState(false)
  const [showIosSteps, setShowIosSteps] = useState(false)
  const [installing, setInstalling] = useState(false)
  const [installed, setInstalled] = useState(false)

  const handleInstall = () => {
    setInstalling(true)
    setTimeout(() => {
      setInstalling(false)
      setInstalled(true)
    }, 2000)
  }

  if (dismissed) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <Card className="w-full max-w-sm bg-white rounded-xl shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Install BookMyService</h3>
            <p className="text-sm text-slate-500 mb-4">
              Get the best experience with our app — faster, offline-ready, and with push notifications.
            </p>
            <Button onClick={() => setDismissed(false)} className="w-full bg-blue-600 hover:bg-blue-700">
              Show Install Prompt
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-lg mx-auto px-4 sm:px-6 pt-12 pb-16">
          {/* Dismiss Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setDismissed(true)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* App Icon & Info */}
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-lg border border-white/30">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-300 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-1">BookMyService</h1>
            <p className="text-blue-100 text-sm mb-1">Home Services at Your Fingertips</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge className="bg-white/20 text-white border-0 text-xs">
                <StarIcon className="w-3 h-3 mr-1" /> 4.8 Rating
              </Badge>
              <Badge className="bg-white/20 text-white border-0 text-xs">
                10M+ Downloads
              </Badge>
            </div>
          </div>

          {/* Install Button */}
          <div className="mt-8">
            {installed ? (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/30">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-300" />
                <p className="font-semibold text-lg">App Installed!</p>
                <p className="text-blue-100 text-sm mt-1">Find BookMyService on your home screen</p>
              </div>
            ) : (
              <Button
                onClick={handleInstall}
                disabled={installing}
                className="w-full h-12 bg-white text-blue-700 hover:bg-blue-50 font-semibold text-base rounded-xl shadow-lg"
              >
                {installing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                    Installing...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Install App
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-lg mx-auto px-4 sm:px-6 -mt-6">
        <Card className="bg-white rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-center">Why Install the App?</CardTitle>
            <CardDescription className="text-center">Experience BookMyService like never before</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl ${feature.bg} flex items-center justify-center shrink-0`}>
                    <feature.icon className={`w-5 h-5 ${feature.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-900">{feature.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Phone Mockup */}
      <div className="max-w-lg mx-auto px-4 sm:px-6 mt-6">
        <Card className="bg-white rounded-xl shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <p className="text-sm font-semibold text-slate-900">See How It Looks</p>
              <p className="text-xs text-slate-500">Your home screen, your way</p>
            </div>
            <div className="flex justify-center">
              <div className="relative w-56 h-96 bg-slate-900 rounded-[2.5rem] p-2 shadow-2xl">
                {/* Phone notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-b-2xl z-10" />
                {/* Phone screen */}
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-white rounded-[2rem] overflow-hidden">
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-6 pt-8 pb-2">
                    <span className="text-[10px] font-semibold text-slate-900">9:41</span>
                    <div className="flex gap-1">
                      <div className="w-3 h-2 bg-slate-900 rounded-sm" />
                      <div className="w-3 h-2 bg-slate-400 rounded-sm" />
                      <div className="w-5 h-2.5 border border-slate-900 rounded-sm relative">
                        <div className="absolute inset-0.5 bg-emerald-500 rounded-sm" style={{ width: '70%' }} />
                      </div>
                    </div>
                  </div>
                  {/* App content mockup */}
                  <div className="px-4 pt-2">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-bold text-slate-900">BookMyService</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mb-2">Good morning, Priya! 👋</div>
                    <div className="bg-blue-600 rounded-lg p-2 mb-2">
                      <div className="text-[8px] text-blue-100">Upcoming Booking</div>
                      <div className="text-[10px] text-white font-semibold">Deep Cleaning - Today 2:00 PM</div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 mb-2">
                      {['Cleaning', 'Plumbing', 'Electrical', 'Painting'].map((cat) => (
                        <div key={cat} className="bg-slate-100 rounded-lg p-2 text-center">
                          <div className="w-4 h-4 rounded bg-blue-100 mx-auto mb-1" />
                          <span className="text-[8px] text-slate-600">{cat}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <div className="text-[8px] text-slate-400">Special Offer</div>
                      <div className="text-[10px] text-slate-900 font-medium">20% off AC Service</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Step-by-Step Guide */}
      <div className="max-w-lg mx-auto px-4 sm:px-6 mt-6">
        <Card className="bg-white rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-center">How to Install</CardTitle>
            <CardDescription className="text-center">Follow these simple steps</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Android Steps */}
            <div className="mb-4">
              <button
                onClick={() => setShowAndroidSteps(!showAndroidSteps)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium text-sm text-slate-900">Android (Chrome)</span>
                </div>
                {showAndroidSteps ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>
              {showAndroidSteps && (
                <div className="mt-3 space-y-3 pl-4">
                  {installSteps.android.map((step) => (
                    <div key={step.step} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-emerald-700">{step.step}</span>
                      </div>
                      <p className="text-sm text-slate-600 pt-0.5">{step.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* iOS Steps */}
            <div>
              <button
                onClick={() => setShowIosSteps(!showIosSteps)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Apple className="w-5 h-5 text-slate-700" />
                  <span className="font-medium text-sm text-slate-900">iPhone / iPad (Safari)</span>
                </div>
                {showIosSteps ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>
              {showIosSteps && (
                <div className="mt-3 space-y-3 pl-4">
                  {installSteps.ios.map((step) => (
                    <div key={step.step} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-slate-700">{step.step}</span>
                      </div>
                      <p className="text-sm text-slate-600 pt-0.5">{step.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Code Section */}
      <div className="max-w-lg mx-auto px-4 sm:px-6 mt-6">
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <QrCode className="w-5 h-5 text-blue-600" />
              <p className="font-semibold text-sm text-slate-900">Scan to Install on Another Device</p>
            </div>
            {/* QR Code Placeholder */}
            <div className="w-40 h-40 mx-auto bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center mb-3">
              <div className="grid grid-cols-5 gap-1">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-5 h-5 rounded-sm ${
                      [0,1,3,4,5,9,10,14,15,19,20,21,23,24].includes(i)
                        ? 'bg-slate-900'
                        : 'bg-white'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-400">Point your phone camera at the QR code</p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Smartphone className="w-3.5 h-3.5" /> Mobile
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Monitor className="w-3.5 h-3.5" /> Desktop
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Testimonials */}
      <div className="max-w-lg mx-auto px-4 sm:px-6 mt-6">
        <Card className="bg-white rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-center">Loved by Millions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testimonials.map((t, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <StarIcon
                        key={j}
                        className={`w-3.5 h-3.5 ${j < t.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 italic">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-blue-600">{t.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-900">{t.name}</p>
                      <p className="text-[10px] text-slate-400">{t.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom CTA */}
      <div className="max-w-lg mx-auto px-4 sm:px-6 mt-6 pb-8">
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-sm text-white">
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 mx-auto mb-3 text-blue-200" />
            <p className="font-semibold text-lg mb-1">Install in Under 30 Seconds</p>
            <p className="text-blue-100 text-sm mb-4">No app store needed. Install directly from your browser.</p>
            {!installed && (
              <Button
                onClick={handleInstall}
                disabled={installing}
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold"
              >
                {installing ? 'Installing...' : 'Install Now'} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Dismiss Link */}
        <div className="text-center mt-4">
          <button
            onClick={() => setDismissed(true)}
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors underline"
          >
            Not now, maybe later
          </button>
        </div>
      </div>
    </div>
  )
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}
