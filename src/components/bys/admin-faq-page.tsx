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
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { HelpCircle, Plus, Pencil, Trash2, Save } from 'lucide-react';
import { apiUrl } from '@/lib/api-url';

interface Faq {
  id: number;
  category: string;
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

export function AdminFaqPage() {
  const { token } = useAuth();
  const { mutate } = useApiMutation();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [formCategory, setFormCategory] = useState('');
  const [formQuestion, setFormQuestion] = useState('');
  const [formAnswer, setFormAnswer] = useState('');
  const [formOrder, setFormOrder] = useState('0');
  const [formActive, setFormActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/admin/faq'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFaqs(Array.isArray(data) ? data : data.faqs || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchFaqs();
  }, []);

  const resetForm = () => {
    setFormCategory('');
    setFormQuestion('');
    setFormAnswer('');
    setFormOrder('0');
    setFormActive(true);
  };

  const openAdd = () => {
    resetForm();
    setEditingFaq(null);
    setShowAdd(true);
  };

  const openEdit = (faq: Faq) => {
    setFormCategory(faq.category);
    setFormQuestion(faq.question);
    setFormAnswer(faq.answer);
    setFormOrder(String(faq.displayOrder));
    setFormActive(faq.isActive);
    setEditingFaq(faq);
    setShowAdd(true);
  };

  const handleSave = async () => {
    if (!formCategory || !formQuestion || !formAnswer) {
      alert('All fields are required');
      return;
    }
    setSaving(true);
    try {
      if (editingFaq) {
        await mutate(`/api/admin/faq/${editingFaq.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            category: formCategory,
            question: formQuestion,
            answer: formAnswer,
            displayOrder: parseInt(formOrder),
            isActive: formActive,
          }),
        });
      } else {
        await mutate('/api/admin/faq', {
          method: 'POST',
          body: JSON.stringify({
            category: formCategory,
            question: formQuestion,
            answer: formAnswer,
            displayOrder: parseInt(formOrder),
            isActive: formActive,
          }),
        });
      }
      setShowAdd(false);
      resetForm();
      setEditingFaq(null);
      fetchFaqs();
    } catch {
      // handled
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (faqId: number) => {
    if (!confirm('Delete this FAQ?')) return;
    try {
      await mutate(`/api/admin/faq/${faqId}`, { method: 'DELETE' });
      fetchFaqs();
    } catch {
      // handled
    }
  };

  // Group FAQs by category
  const grouped = faqs.reduce<Record<string, Faq[]>>((acc, faq) => {
    const cat = faq.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">FAQ Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage frequently asked questions</p>
        </div>
        <Button className="bg-blue-800 text-white hover:bg-[#1e3a5f]" onClick={openAdd}>
          <Plus className="mr-2 size-4" /> Add FAQ
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : faqs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <HelpCircle className="mb-4 size-12 text-muted-foreground/50" />
            <h3 className="text-lg font-medium">No FAQs</h3>
            <p className="mt-1 text-sm text-muted-foreground">Create your first FAQ entry</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, categoryFaqs]) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <HelpCircle className="size-4 text-blue-700" />
                  {category}
                  <Badge variant="secondary" className="text-xs">{categoryFaqs.length}</Badge>
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="p-0">
                {categoryFaqs.map((faq) => (
                  <div key={faq.id} className="flex items-start justify-between border-b p-4 last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">{faq.question}</p>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{faq.answer}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">Order: {faq.displayOrder}</Badge>
                        {!faq.isActive && (
                          <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 text-[10px]">Inactive</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-3">
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(faq)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => handleDelete(faq.id)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingFaq ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Input value={formCategory} onChange={(e) => setFormCategory(e.target.value)} placeholder="e.g. General, Booking, Payment" />
            </div>
            <div className="space-y-2">
              <Label>Question *</Label>
              <Input value={formQuestion} onChange={(e) => setFormQuestion(e.target.value)} placeholder="Enter the question" />
            </div>
            <div className="space-y-2">
              <Label>Answer *</Label>
              <Textarea value={formAnswer} onChange={(e) => setFormAnswer(e.target.value)} placeholder="Enter the answer" rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input type="number" value={formOrder} onChange={(e) => setFormOrder(e.target.value)} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={formActive} onCheckedChange={setFormActive} />
                <Label>Active</Label>
              </div>
            </div>
            <Button className="bg-blue-800 text-white hover:bg-[#1e3a5f] w-full" onClick={handleSave} disabled={saving}>
              <Save className="mr-2 size-4" />
              {saving ? 'Saving...' : editingFaq ? 'Update FAQ' : 'Create FAQ'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
