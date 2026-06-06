import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/app-context';
import { useApiMutation } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { apiUrl } from '@/lib/api-url';

interface Category {
  id: number;
  name: string;
  slug: string;
  subcategories?: { id: number; name: string }[];
}

interface Subcategory {
  id: number;
  name: string;
}

const DAYS = [
  { key: 'MON', label: 'Monday' },
  { key: 'TUE', label: 'Tuesday' },
  { key: 'WED', label: 'Wednesday' },
  { key: 'THU', label: 'Thursday' },
  { key: 'FRI', label: 'Friday' },
  { key: 'SAT', label: 'Saturday' },
  { key: 'SUN', label: 'Sunday' },
];

export function ProviderCreateServicePage() {
  const { navigate, nav } = useApp();
  const { mutate, loading } = useApiMutation();
  const isEditing = !!nav.params.serviceId;

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [priceNegotiable, setPriceNegotiable] = useState(false);
  const [serviceDuration, setServiceDuration] = useState('');
  const [serviceAreaRadius, setServiceAreaRadius] = useState('10');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [availability, setAvailability] = useState<Record<string, { enabled: boolean; start: string; end: string }>>(
    Object.fromEntries(DAYS.map((d) => [d.key, { enabled: false, start: '09:00', end: '18:00' }]))
  );

  // Fetch categories on mount
  useEffect(() => {
    fetch(apiUrl('/api/categories'))
      .then((r) => r.json())
      .then((data) => {
        const cats = data.categories || data || [];
        setCategories(Array.isArray(cats) ? cats : []);
      })
      .catch(() => {});
  }, []);

  // Handle category change: reset subcategory and fetch subcategories
  const handleCategoryChange = (newCategoryId: string) => {
    setCategoryId(newCategoryId);
    setSubcategoryId('');
    if (!newCategoryId) {
      setSubcategories([]);
      return;
    }
    fetch(apiUrl(`/api/subcategories?categoryId=${newCategoryId}`))
      .then((r) => r.json())
      .then((data) => {
        const subs = data.subcategories || data || [];
        setSubcategories(Array.isArray(subs) ? subs : []);
      })
      .catch(() => {});
  };

  const toggleDay = (key: string) => {
    setAvailability((prev) => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }));
  };

  const updateDayTime = (key: string, field: 'start' | 'end', value: string) => {
    setAvailability((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleSubmit = async () => {
    if (!title || !description || !basePrice || !categoryId) {
      alert('Please fill in all required fields');
      return;
    }

    if (parseFloat(basePrice) < 99) {
      alert('Base price must be at least ₹99');
      return;
    }

    if (parseFloat(basePrice) > 499) {
      alert('Base price must not exceed ₹499');
      return;
    }

    const payload = {
      title,
      description,
      basePrice,
      categoryId,
      subcategoryId: subcategoryId || undefined,
      priceNegotiable,
      serviceDurationMinutes: serviceDuration ? parseInt(serviceDuration) : undefined,
      serviceAreaRadiusKm: parseInt(serviceAreaRadius) || 10,
      address,
      city,
      state,
      availability: Object.entries(availability)
        .filter(([, v]) => v.enabled)
        .map(([day, v]) => ({ day, startTime: v.start, endTime: v.end })),
    };

    try {
      if (isEditing) {
        await mutate(`/api/services/${nav.params.serviceId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await mutate('/api/services', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      navigate('provider-services');
    } catch {
      // handled
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('provider-services')}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEditing ? 'Edit Service' : 'Create New Service'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Fill in the details to list your service</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Category & Subcategory */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={categoryId} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subcategory</Label>
              <Select value={subcategoryId} onValueChange={setSubcategoryId} disabled={!subcategories.length}>
                <SelectTrigger>
                  <SelectValue placeholder={subcategories.length ? 'Select subcategory' : 'Select category first'} />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map((sub) => (
                    <SelectItem key={sub.id} value={String(sub.id)}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Service Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Service Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input placeholder="e.g. AC Repair & Service" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                placeholder="Describe your service in detail..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Base Price (₹) * <span className="text-xs text-muted-foreground">(₹99 - ₹499)</span></Label>
                <Input
                  type="number"
                  min="99"
                  max="499"
                  placeholder="₹99 - ₹499"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 60"
                  value={serviceDuration}
                  onChange={(e) => setServiceDuration(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={priceNegotiable} onCheckedChange={setPriceNegotiable} />
              <Label>Price Negotiable</Label>
            </div>
            <div className="space-y-2">
              <Label>Service Area Radius (km)</Label>
              <Input
                type="number"
                placeholder="10"
                value={serviceAreaRadius}
                onChange={(e) => setServiceAreaRadius(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Address</Label>
              <Input placeholder="Street address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>City</Label>
                <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Availability Schedule */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Availability Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {DAYS.map((day) => (
              <div key={day.key} className="flex flex-col gap-2 border-b pb-3 last:border-0 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 sm:w-36">
                  <Checkbox
                    checked={availability[day.key].enabled}
                    onCheckedChange={() => toggleDay(day.key)}
                  />
                  <Label className="cursor-pointer text-sm" onClick={() => toggleDay(day.key)}>
                    {day.label}
                  </Label>
                </div>
                {availability[day.key].enabled && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      className="w-28"
                      value={availability[day.key].start}
                      onChange={(e) => updateDayTime(day.key, 'start', e.target.value)}
                    />
                    <span className="text-sm text-muted-foreground">to</span>
                    <Input
                      type="time"
                      className="w-28"
                      value={availability[day.key].end}
                      onChange={(e) => updateDayTime(day.key, 'end', e.target.value)}
                    />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-3">
          <Button
            className="bg-[#FFD54F] text-[#0A1F44] hover:bg-[#132D5E] hover:text-white"
            onClick={handleSubmit}
            disabled={loading}
          >
            <Save className="mr-2 size-4" />
            {loading ? 'Saving...' : isEditing ? 'Update Service' : 'Create Service'}
          </Button>
          <Button variant="outline" onClick={() => navigate('provider-services')}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
