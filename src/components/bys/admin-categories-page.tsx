import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useApiMutation } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Grid3X3, Plus, Pencil, Trash2, Save } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  displayOrder: number;
  subcategories?: { id: number; name: string }[];
  _count?: { subcategories: number };
}

export function AdminCategoriesPage() {
  const { token } = useAuth();
  const { mutate } = useApiMutation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formIcon, setFormIcon] = useState('');
  const [formOrder, setFormOrder] = useState('0');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || data || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormSlug('');
    setFormDesc('');
    setFormIcon('');
    setFormOrder('0');
  };

  const openAdd = () => {
    resetForm();
    setEditingCat(null);
    setShowAdd(true);
  };

  const openEdit = (cat: Category) => {
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDesc(cat.description || '');
    setFormIcon(cat.icon || '');
    setFormOrder(String(cat.displayOrder));
    setEditingCat(cat);
    setShowAdd(true);
  };

  const handleSave = async () => {
    if (!formName || !formSlug) {
      alert('Name and slug are required');
      return;
    }
    setSaving(true);
    try {
      if (editingCat) {
        await mutate('/api/admin/categories', {
          method: 'PATCH',
          body: JSON.stringify({
            id: editingCat.id,
            name: formName,
            slug: formSlug,
            description: formDesc,
            icon: formIcon,
            displayOrder: parseInt(formOrder),
          }),
        });
      } else {
        await mutate('/api/admin/categories', {
          method: 'POST',
          body: JSON.stringify({
            name: formName,
            slug: formSlug,
            description: formDesc,
            icon: formIcon,
            displayOrder: parseInt(formOrder),
          }),
        });
      }
      setShowAdd(false);
      resetForm();
      setEditingCat(null);
      fetchCategories();
    } catch {
      // handled
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage service categories and subcategories</p>
        </div>
        <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={openAdd}>
          <Plus className="mr-2 size-4" /> Add Category
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Grid3X3 className="mb-4 size-12 text-muted-foreground/50" />
            <h3 className="text-lg font-medium">No categories</h3>
            <p className="mt-1 text-sm text-muted-foreground">Create your first category</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <Card key={cat.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-lg">
                    {cat.icon || '📂'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{cat.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {cat._count?.subcategories || cat.subcategories?.length || 0} subcategories
                      </Badge>
                      {!cat.isActive && (
                        <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 text-xs">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">/{cat.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Order: {cat.displayOrder}</span>
                  <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(cat)}>
                    <Pencil className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCat ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Category name" />
            </div>
            <div className="space-y-2">
              <Label>Slug *</Label>
              <Input value={formSlug} onChange={(e) => setFormSlug(e.target.value)} placeholder="category-slug" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Category description" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon (emoji)</Label>
                <Input value={formIcon} onChange={(e) => setFormIcon(e.target.value)} placeholder="🔧" />
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input type="number" value={formOrder} onChange={(e) => setFormOrder(e.target.value)} />
              </div>
            </div>
            <Button className="bg-emerald-600 text-white hover:bg-emerald-700 w-full" onClick={handleSave} disabled={saving}>
              <Save className="mr-2 size-4" />
              {saving ? 'Saving...' : editingCat ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
