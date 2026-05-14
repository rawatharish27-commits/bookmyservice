import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/app-context';
import { useApiMutation } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';

export function ForgotPasswordPage() {
  const { navigate } = useApp();
  const { mutate, loading, error } = useApiMutation();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback('');
    if (!email.trim()) {
      setFeedback('Please enter your registered email address.');
      return;
    }

    try {
      const result = await mutate('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setSubmitted(true);
      setFeedback(result.message || 'If an account exists with that email, reset instructions have been sent.');
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Unable to send reset instructions. Please try again.');
    }
  };

  return (
    <div className="relative flex min-h-[80vh] overflow-hidden bg-white text-slate-900">
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <button
            type="button"
            onClick={() => navigate('login')}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            <ArrowLeft className="size-4" />
            Back to Login
          </button>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/40">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700">
                <Mail className="size-6" />
              </div>
              <h1 className="text-2xl font-semibold text-slate-900">Forgot Password</h1>
              <p className="mt-2 text-sm text-slate-600">
                Enter your registered email address and we will send you instructions to reset your password.
              </p>
            </div>

            {feedback && (
              <div className={`mb-4 rounded-2xl border p-3 ${submitted ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
                {feedback}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email" className="text-sm font-medium text-slate-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="pl-11 h-12 rounded-2xl border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-400 focus:ring-emerald-400/20"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 rounded-2xl bg-slate-900 text-white hover:bg-slate-800">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              If you don’t receive an email, check your spam folder or contact support.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
