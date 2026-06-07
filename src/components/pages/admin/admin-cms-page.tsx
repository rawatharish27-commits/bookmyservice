'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { FileEdit, Plus, Eye, Image, Layout } from 'lucide-react'

const pages = [
  { id: 1, title: 'Home Page', slug: '/', status: 'Published', lastEdited: '22 May 2024', blocks: 8 },
  { id: 2, title: 'About Us', slug: '/about', status: 'Published', lastEdited: '15 May 2024', blocks: 5 },
  { id: 3, title: 'Contact', slug: '/contact', status: 'Published', lastEdited: '10 May 2024', blocks: 3 },
  { id: 4, title: 'Become a Provider', slug: '/become-provider', status: 'Draft', lastEdited: '20 May 2024', blocks: 6 },
]

const banners = [
  { id: 1, title: 'Summer Sale Banner', position: 'Home Hero', active: true, impressions: '12.5K' },
  { id: 2, title: 'New Category Launch', position: 'Category Top', active: true, impressions: '8.2K' },
  { id: 3, title: 'Refer & Earn', position: 'Home Middle', active: false, impressions: '0' },
]

const contentBlocks = [
  { id: 1, name: 'Testimonials Section', type: 'Testimonials', page: 'Home', order: 3 },
  { id: 2, name: 'How It Works', type: 'Steps', page: 'Home', order: 2 },
  { id: 3, name: 'FAQ Accordion', type: 'FAQ', page: 'Home', order: 7 },
]

export function AdminCmsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">CMS</h1>
          <Button size="sm" className="gap-1 bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white rounded-xl"><Plus className="size-4" /> New Page</Button>
        </div>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><FileEdit className="size-4 text-[#0A1F44]" /><CardTitle className="text-sm font-semibold text-slate-900">Pages</CardTitle></div>
          </CardHeader>
          <CardContent className="space-y-0">
            {pages.map((page, i) => (
              <div key={page.id}>
                <div className="flex items-center gap-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2"><p className="text-sm font-medium text-slate-900">{page.title}</p><Badge variant="secondary" className={page.status === 'Published' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}>{page.status}</Badge></div>
                    <p className="text-xs text-slate-400">{page.slug} • {page.blocks} blocks • Last edited: {page.lastEdited}</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1 rounded-lg"><FileEdit className="size-3" /> Edit</Button>
                </div>
                {i < pages.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><Image className="size-4 text-[#0A1F44]" /><CardTitle className="text-sm font-semibold text-slate-900">Banners</CardTitle></div>
          </CardHeader>
          <CardContent className="space-y-0">
            {banners.map((banner, i) => (
              <div key={banner.id}>
                <div className="flex items-center justify-between py-3">
                  <div><p className="text-sm font-medium text-slate-900">{banner.title}</p><p className="text-xs text-slate-400">{banner.position} • {banner.impressions} impressions</p></div>
                  <div className="flex items-center gap-2"><Badge variant="secondary" className={banner.active ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}>{banner.active ? 'Active' : 'Inactive'}</Badge><Button variant="ghost" size="sm" className="h-7"><Eye className="size-3" /></Button></div>
                </div>
                {i < banners.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><Layout className="size-4 text-[#0A1F44]" /><CardTitle className="text-sm font-semibold text-slate-900">Content Blocks</CardTitle></div>
          </CardHeader>
          <CardContent className="space-y-0">
            {contentBlocks.map((block, i) => (
              <div key={block.id}>
                <div className="flex items-center justify-between py-3">
                  <div><p className="text-sm font-medium text-slate-900">{block.name}</p><p className="text-xs text-slate-400">{block.type} • Page: {block.page} • Order: {block.order}</p></div>
                  <Button variant="outline" size="sm" className="h-7 text-xs rounded-lg">Edit</Button>
                </div>
                {i < contentBlocks.length - 1 && <Separator className="bg-slate-100" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
