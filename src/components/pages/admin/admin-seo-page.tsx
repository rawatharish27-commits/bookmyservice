'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Search, Globe, Code, BarChart3, Save } from 'lucide-react'

const metaTags = [
  { page: 'Home', title: 'BookMyService - Home Services at Your Doorstep', description: 'Book trusted home service professionals for AC repair, cleaning, plumbing and more.', keywords: 'home services, AC repair, cleaning' },
  { page: 'Categories', title: 'Service Categories - BookMyService', description: 'Browse all service categories available on BookMyService.', keywords: 'service categories, home services' },
  { page: 'About', title: 'About Us - BookMyService', description: 'Learn about BookMyService and our mission to provide quality home services.', keywords: 'about, bookmyservice' },
]

export function AdminSeoPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">SEO Settings</h1>
          <Button size="sm" className="gap-1 bg-[#1D63FF] hover:bg-[#0B3D91] text-white rounded-xl"><Save className="size-4" /> Save All</Button>
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><Search className="size-4 text-[#1D63FF]" /><CardTitle className="text-sm font-semibold text-slate-900">Meta Tags</CardTitle></div>
          </CardHeader>
          <CardContent className="space-y-4">
            {metaTags.map((meta, i) => (
              <div key={meta.page}>
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-slate-900">{meta.page} Page</h3>
                  <div><label className="text-xs font-medium text-slate-500 mb-1 block">Title</label><Input defaultValue={meta.title} /></div>
                  <div><label className="text-xs font-medium text-slate-500 mb-1 block">Description</label><Textarea defaultValue={meta.description} rows={2} /></div>
                  <div><label className="text-xs font-medium text-slate-500 mb-1 block">Keywords</label><Input defaultValue={meta.keywords} /></div>
                </div>
                {i < metaTags.length - 1 && <Separator className="mt-4 bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><Globe className="size-4 text-[#1D63FF]" /><CardTitle className="text-sm font-semibold text-slate-900">Sitemap</CardTitle></div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between"><div><p className="text-sm text-slate-700">Sitemap URL</p><p className="text-xs text-[#1D63FF]">https://bookmyservice.com/sitemap.xml</p></div><Button variant="outline" size="sm" className="text-xs rounded-lg">Regenerate</Button></div>
            <Separator className="bg-slate-100" />
            <div className="flex items-center justify-between"><div><p className="text-sm text-slate-700">Last Generated</p><p className="text-xs text-slate-400">22 May 2024 at 10:00 AM</p></div><Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">Auto</Badge></div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><Code className="size-4 text-[#1D63FF]" /><CardTitle className="text-sm font-semibold text-slate-900">robots.txt</CardTitle></div>
          </CardHeader>
          <CardContent>
            <Textarea defaultValue={`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: https://bookmyservice.com/sitemap.xml`} rows={6} className="font-mono text-xs" />
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><BarChart3 className="size-4 text-[#1D63FF]" /><CardTitle className="text-sm font-semibold text-slate-900">Analytics Code</CardTitle></div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div><label className="text-xs font-medium text-slate-500 mb-1 block">Google Analytics ID</label><Input defaultValue="G-XXXXXXXXXX" /></div>
            <div><label className="text-xs font-medium text-slate-500 mb-1 block">Google Tag Manager ID</label><Input defaultValue="GTM-XXXXXXX" /></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
