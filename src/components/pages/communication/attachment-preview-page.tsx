'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  File,
  Calendar,
  HardDrive,
  User,
  Maximize2,
  Minimize2,
  Share2,
  MoreVertical,
} from 'lucide-react'

interface AttachmentInfo {
  id: number
  name: string
  type: 'image' | 'pdf' | 'document'
  size: string
  sender: string
  senderInitials: string
  senderColor: string
  date: string
  bookingId?: string
  serviceName?: string
  mimeType: string
}

const attachments: AttachmentInfo[] = [
  {
    id: 1,
    name: 'ac-unit-damage-photo.jpg',
    type: 'image',
    size: '2.4 MB',
    sender: 'Rahul Sharma',
    senderInitials: 'RS',
    senderColor: 'bg-blue-600',
    date: '4 Mar 2025, 9:20 AM',
    bookingId: 'BK-2024-1847',
    serviceName: 'Air Conditioner',
    mimeType: 'image/jpeg',
  },
  {
    id: 2,
    name: 'service-estimate-BK1847.pdf',
    type: 'pdf',
    size: '156 KB',
    sender: 'Amit Sharma',
    senderInitials: 'AS',
    senderColor: 'bg-emerald-600',
    date: '4 Mar 2025, 9:23 AM',
    bookingId: 'BK-2024-1847',
    serviceName: 'Air Conditioner',
    mimeType: 'application/pdf',
  },
  {
    id: 3,
    name: 'plumbing-issue-bathroom.jpg',
    type: 'image',
    size: '3.1 MB',
    sender: 'Priya Patel',
    senderInitials: 'PP',
    senderColor: 'bg-rose-600',
    date: '3 Mar 2025, 2:15 PM',
    bookingId: 'BK-2024-1801',
    serviceName: 'Plumber',
    mimeType: 'image/jpeg',
  },
  {
    id: 4,
    name: 'electrical-wiring-report.pdf',
    type: 'pdf',
    size: '423 KB',
    sender: 'Vikram Singh',
    senderInitials: 'VS',
    senderColor: 'bg-amber-600',
    date: '2 Mar 2025, 11:30 AM',
    bookingId: 'BK-2024-1756',
    serviceName: 'Electrician',
    mimeType: 'application/pdf',
  },
  {
    id: 5,
    name: 'paint-color-reference.png',
    type: 'image',
    size: '1.8 MB',
    sender: 'Sneha Reddy',
    senderInitials: 'SR',
    senderColor: 'bg-purple-600',
    date: '1 Mar 2025, 4:00 PM',
    bookingId: 'BK-2024-1795',
    serviceName: 'Kitchen Appliances',
    mimeType: 'image/png',
  },
]

export function AttachmentPreviewPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)

  const current = attachments[currentIndex]

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : attachments.length - 1))
    setZoom(100)
    setRotation(0)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < attachments.length - 1 ? prev + 1 : 0))
    setZoom(100)
    setRotation(0)
  }

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 300))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 25))
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360)
  const handleReset = () => {
    setZoom(100)
    setRotation(0)
  }

  const isImage = current.type === 'image'

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Top Toolbar */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-slate-700 size-8"
            >
              <X className="size-4" />
            </Button>
            <Separator orientation="vertical" className="h-5 bg-slate-600" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate max-w-[200px] sm:max-w-[400px]">
                {current.name}
              </p>
              <p className="text-[10px] text-slate-400">
                {currentIndex + 1} of {attachments.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Zoom Controls */}
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-slate-700 size-8"
              onClick={handleZoomOut}
            >
              <ZoomOut className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-slate-700 text-xs h-8 min-w-[50px]"
              onClick={handleReset}
            >
              {zoom}%
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-slate-700 size-8"
              onClick={handleZoomIn}
            >
              <ZoomIn className="size-4" />
            </Button>

            <Separator orientation="vertical" className="h-5 bg-slate-600 mx-1" />

            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-slate-700 size-8"
              onClick={handleRotate}
            >
              <RotateCw className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-slate-700 size-8"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize2 className="size-4" />
              ) : (
                <Maximize2 className="size-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-slate-700 size-8"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <FileText className="size-4" />
            </Button>

            <Separator orientation="vertical" className="h-5 bg-slate-600 mx-1" />

            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-slate-700 size-8"
            >
              <Share2 className="size-4" />
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white size-8 rounded-lg">
              <Download className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-slate-700 size-8"
            >
              <MoreVertical className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Preview Area */}
        <div className="flex-1 flex items-center justify-center relative bg-slate-900">
          {/* Navigation Arrows */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white hover:bg-slate-700/50 size-10 rounded-full z-10"
            onClick={handlePrev}
          >
            <ChevronLeft className="size-6" />
          </Button>

          {/* Preview Content */}
          <div
            className="flex items-center justify-center transition-transform duration-200"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            }}
          >
            {isImage ? (
              <div className="bg-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
                <div className="w-[500px] h-[400px] sm:w-[600px] sm:h-[450px] lg:w-[700px] lg:h-[500px] flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                  <div className="text-center">
                    <ImageIcon className="size-20 text-slate-500 mx-auto mb-3" />
                    <p className="text-sm text-slate-400 font-medium">{current.name}</p>
                    <p className="text-xs text-slate-500 mt-1">Image Preview</p>
                    <Badge className="mt-3 bg-slate-600 text-slate-300 text-[10px]">
                      {current.mimeType}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl overflow-hidden shadow-2xl w-[500px] sm:w-[600px] lg:w-[700px]">
                {/* PDF Header */}
                <div className="bg-red-600 text-white p-4 flex items-center gap-3">
                  <FileText className="size-8" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{current.name}</p>
                    <p className="text-xs text-red-200">PDF Document • {current.size}</p>
                  </div>
                </div>
                {/* PDF Content Placeholder */}
                <div className="p-8 space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                  <div className="h-4 bg-slate-200 rounded w-5/6" />
                  <div className="h-4 bg-slate-100 rounded w-2/3" />
                  <div className="mt-6 h-4 bg-slate-200 rounded w-full" />
                  <div className="h-4 bg-slate-200 rounded w-4/5" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-5/6" />
                  <div className="mt-6 h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                  <div className="h-4 bg-slate-100 rounded w-4/5" />
                </div>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white hover:bg-slate-700/50 size-10 rounded-full z-10"
            onClick={handleNext}
          >
            <ChevronRight className="size-6" />
          </Button>
        </div>

        {/* File Info Sidebar */}
        {showSidebar && (
          <div className="w-72 bg-slate-800 border-l border-slate-700 overflow-y-auto shrink-0 hidden md:block">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-white mb-4">File Information</h3>

              {/* File Icon Preview */}
              <div className="bg-slate-700 rounded-xl p-6 mb-4 text-center">
                {isImage ? (
                  <ImageIcon className="size-12 text-blue-400 mx-auto mb-2" />
                ) : (
                  <FileText className="size-12 text-red-400 mx-auto mb-2" />
                )}
                <p className="text-xs text-slate-300 font-medium truncate">{current.name}</p>
              </div>

              {/* File Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <File className="size-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500">File Name</p>
                    <p className="text-xs text-slate-200 truncate">{current.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <HardDrive className="size-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-500">Size</p>
                    <p className="text-xs text-slate-200">{current.size}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <File className="size-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-500">Type</p>
                    <p className="text-xs text-slate-200">{current.mimeType}</p>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                <div className="flex items-center gap-3">
                  <User className="size-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500">Sent By</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-5">
                        <AvatarFallback
                          className={`${current.senderColor} text-white text-[8px]`}
                        >
                          {current.senderInitials}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-xs text-slate-200">{current.sender}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="size-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-500">Date</p>
                    <p className="text-xs text-slate-200">{current.date}</p>
                  </div>
                </div>

                {current.bookingId && (
                  <>
                    <Separator className="bg-slate-700" />
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1">Related Booking</p>
                      <div className="bg-slate-700 rounded-lg p-2.5">
                        <p className="text-xs font-medium text-blue-400">{current.bookingId}</p>
                        <p className="text-[11px] text-slate-400">{current.serviceName}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                  <Download className="size-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 rounded-xl"
                >
                  <Share2 className="size-4 mr-2" />
                  Share
                </Button>
              </div>

              {/* Attachment Thumbnails */}
              <div className="mt-6">
                <p className="text-xs text-slate-400 mb-2">All Attachments</p>
                <div className="grid grid-cols-3 gap-2">
                  {attachments.map((att, i) => (
                    <button
                      key={att.id}
                      onClick={() => {
                        setCurrentIndex(i)
                        setZoom(100)
                        setRotation(0)
                      }}
                      className={`rounded-lg p-2 text-center transition-colors ${
                        i === currentIndex
                          ? 'bg-blue-600/20 border border-blue-500'
                          : 'bg-slate-700 hover:bg-slate-600 border border-transparent'
                      }`}
                    >
                      {att.type === 'image' ? (
                        <ImageIcon className="size-4 mx-auto text-slate-400" />
                      ) : (
                        <FileText className="size-4 mx-auto text-red-400" />
                      )}
                      <p className="text-[9px] text-slate-400 mt-1 truncate">{att.name.split('.')[0]}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Thumbnail Strip (Mobile) */}
      <div className="bg-slate-800 border-t border-slate-700 p-2 md:hidden">
        <div className="flex gap-2 overflow-x-auto">
          {attachments.map((att, i) => (
            <button
              key={att.id}
              onClick={() => {
                setCurrentIndex(i)
                setZoom(100)
                setRotation(0)
              }}
              className={`shrink-0 w-14 h-14 rounded-lg flex items-center justify-center transition-colors ${
                i === currentIndex ? 'bg-blue-600/20 border border-blue-500' : 'bg-slate-700'
              }`}
            >
              {att.type === 'image' ? (
                <ImageIcon className="size-5 text-slate-400" />
              ) : (
                <FileText className="size-5 text-red-400" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
