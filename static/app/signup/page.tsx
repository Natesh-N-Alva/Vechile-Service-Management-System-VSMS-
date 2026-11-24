'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CarFront } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ Name: '', Email: '', Password: '', Phone: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Account created successfully! Please log in.");
        router.push('/login');
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('Could not connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-card border border-border shadow-2xl">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-accent/20">
            <CarFront className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create an Account</h1>
          <p className="text-sm text-muted-foreground mt-2">Join VehicleFlow to manage your fleet.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <input required type="text" placeholder="Full Name" value={formData.Name} onChange={(e) => setFormData({ ...formData, Name: e.target.value })} className="w-full px-4 py-3 bg-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-accent/50" />
          <input required type="email" placeholder="Email Address" value={formData.Email} onChange={(e) => setFormData({ ...formData, Email: e.target.value })} className="w-full px-4 py-3 bg-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-accent/50" />
          <input type="tel" placeholder="Phone Number (Optional)" value={formData.Phone} onChange={(e) => setFormData({ ...formData, Phone: e.target.value })} className="w-full px-4 py-3 bg-muted border border-border rounded-lg outline-none focus:ring-2 focus:ring-accent/50" />
          <input required type="password" placeholder="Password" value={formData.Password} onChange={(e) => setFormData({ ...formData, Password: e.target.value })} className="w-full px-4 py-3 bg-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-accent/50" />

          <Button type="submit" className="w-full h-12 bg-accent hover:bg-accent/90 text-primary font-bold rounded-xl mt-2" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-accent font-semibold hover:underline transition-all">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}