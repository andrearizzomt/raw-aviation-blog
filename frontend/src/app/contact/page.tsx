'use client';

import { useRef, useState, useEffect } from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { useTheme } from '@/components/ui/theme-provider';

const NAME_REGEX = /^[a-zA-ZÀ-ÖØ-öø-ÿ\s'\-]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(formData: { name: string; email: string; subject: string; message: string }) {
  const errors: Record<string, string> = {};
  if (!formData.name.trim()) {
    errors.name = 'Name is required.';
  } else if (!NAME_REGEX.test(formData.name)) {
    errors.name = 'Name must contain letters only — no numbers or special characters.';
  }
  if (!formData.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_REGEX.test(formData.email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!formData.subject.trim()) {
    errors.subject = 'Subject is required.';
  } else if (!NAME_REGEX.test(formData.subject)) {
    errors.subject = 'Subject must contain letters only — no numbers or special characters.';
  }
  if (!formData.message.trim()) {
    errors.message = 'Message is required.';
  }
  return errors;
}

export default function ContactPage() {
  const formLoadedAt = useRef<number>(Date.now());
  const turnstileRef = useRef<TurnstileInstance>(null);
  const { theme } = useTheme();

  // Reset token when theme changes so Turnstile re-renders in the correct theme
  useEffect(() => {
    setTurnstileToken(null);
  }, [theme]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [honeypot, setHoneypot] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const allFieldsFilled =
    formData.name.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.subject.trim() !== '' &&
    formData.message.trim() !== '';

  const canSubmit = allFieldsFilled && !!turnstileToken && !isSubmitting;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validate(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          website: honeypot,
          formLoadedAt: formLoadedAt.current,
          turnstileToken,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setFieldErrors({});
        turnstileRef.current?.reset();
        setTurnstileToken(null);
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.error || 'Failed to send message. Please try again.');
        // Always reset Turnstile after a failed attempt — tokens are single-use
        turnstileRef.current?.reset();
        setTurnstileToken(null);
      }
    } catch {
      setSubmitStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground ${
      fieldErrors[field] ? 'border-red-500' : 'border-border'
    }`;

  const buttonLabel = isSubmitting
    ? 'Sending...'
    : submitStatus === 'success'
    ? 'Message Sent'
    : submitStatus === 'error'
    ? 'Message Not Sent. Please Try Again'
    : !allFieldsFilled
    ? 'Fill in all fields to continue'
    : !turnstileToken
    ? 'Complete verification to send'
    : 'Send Message';

  const buttonClass = isSubmitting || (!canSubmit && submitStatus === 'idle')
    ? 'bg-muted text-muted-foreground cursor-not-allowed'
    : submitStatus === 'success'
    ? 'bg-green-100 dark:bg-green-600 cursor-default'
    : submitStatus === 'error'
    ? 'bg-red-100 dark:bg-red-600 hover:bg-red-200 dark:hover:bg-red-700'
    : 'bg-primary text-primary-foreground hover:bg-primary/90';

  const buttonStyle =
    submitStatus === 'success'
      ? { color: 'var(--btn-success-text)' }
      : submitStatus === 'error'
      ? { color: 'var(--btn-error-text)' }
      : {};

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">Contact Us</h1>
        <div className="max-w-3xl mx-auto">
          <p className="text-xl text-muted-foreground mb-6">
            Have a story to share? Want to contribute to RAW Aviation? Or just want to say hello?
            We&apos;d love to hear from you!
          </p>
          <p className="text-lg text-muted-foreground">
            Whether you&apos;re an aviation enthusiast, industry professional, or photographer,
            your perspectives and stories help make our community stronger.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-lg shadow-sm border border-border p-8">
          <h2 className="text-2xl font-bold mb-6 text-foreground">Send us a Message</h2>


          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Honeypot — hidden from humans, bots fill it */}
            <div style={{ display: 'none' }} aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                type="text"
                id="website"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2 text-foreground">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass('name')}
                  placeholder="Your full name"
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass('email')}
                  placeholder="your.email@example.com"
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-2 text-foreground">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={inputClass('subject')}
                placeholder="Brief description of your message"
              />
              {fieldErrors.subject && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.subject}</p>
              )}
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2 text-foreground">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={6}
                className={`${inputClass('message')} resize-vertical`}
                placeholder="Tell us about your aviation story, contribution ideas, or any questions you have..."
              />
              {fieldErrors.message && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit && submitStatus !== 'error'}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-300 ${buttonClass}`}
              style={buttonStyle}
            >
              {buttonLabel}
            </button>

            {/* Turnstile — hidden after success */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out flex justify-center ${
                submitStatus === 'success' ? 'max-h-0 opacity-0' : 'max-h-24 opacity-100'
              }`}
            >
                <Turnstile
                  ref={turnstileRef}
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '1x00000000000000000000AA'}
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                  onError={() => setTurnstileToken(null)}
                  key={theme}
                  options={{ theme }}
                />
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
