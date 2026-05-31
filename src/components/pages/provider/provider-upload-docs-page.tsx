'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Upload, FileText, Eye, CheckCircle, Clock, XCircle } from 'lucide-react'

const documents = [
  { id: 1, name: 'PAN Card', fileName: 'pan_card_front.jpg', status: 'Verified', size: '245 KB', uploaded: '20 Mar 2023' },
  { id: 2, name: 'Aadhaar Front', fileName: 'aadhaar_front.pdf', status: 'Verified', size: '512 KB', uploaded: '20 Mar 2023' },
  { id: 3, name: 'Aadhaar Back', fileName: 'aadhaar_back.pdf', status: 'Verified', size: '498 KB', uploaded: '20 Mar 2023' },
  { id: 4, name: 'Bank Statement', fileName: 'hdfc_statement.pdf', status: 'Verified', size: '1.2 MB', uploaded: '22 Mar 2023' },
  { id: 5, name: 'GST Certificate', fileName: '', status: 'Not Uploaded', size: '—', uploaded: '—' },
  { id: 6, name: 'Business License', fileName: 'license.pdf', status: 'Under Review', size: '890 KB', uploaded: '10 May 2024' },
]

const statusConfig: Record<string, { color: string; icon: React.ComponentType<{ className?: string }> }> = {
  Verified: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
  'Under Review': { color: 'bg-[#1D63FF]/10 text-[#0B3D91] border-blue-200', icon: Clock },
  'Not Uploaded': { color: 'bg-slate-100 text-slate-500 border-slate-200', icon: XCircle },
  Rejected: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
}

export function ProviderUploadDocsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Upload Documents</h1>

        {documents.map((doc) => {
          const config = statusConfig[doc.status]
          const StatusIcon = config.icon
          return (
            <Card key={doc.id} className="bg-white rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-blue-50 shrink-0">
                    <FileText className="size-6 text-[#1D63FF]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">{doc.name}</p>
                      <Badge variant="secondary" className={`${config.color} hover:${config.color} gap-1`}>
                        <StatusIcon className="size-3" /> {doc.status}
                      </Badge>
                    </div>
                    {doc.fileName ? (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-slate-500">{doc.fileName} • {doc.size}</p>
                        <p className="text-xs text-slate-400">Uploaded on {doc.uploaded}</p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 rounded-lg"><Eye className="size-3" /> Preview</Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 rounded-lg"><Upload className="size-3" /> Replace</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <Button size="sm" className="h-7 text-xs gap-1 bg-[#1D63FF] hover:bg-[#0B3D91] text-white rounded-lg"><Upload className="size-3" /> Upload Document</Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
