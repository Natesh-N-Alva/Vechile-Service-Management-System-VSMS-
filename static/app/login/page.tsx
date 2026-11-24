"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // <-- ADDED THIS IMPORT
import { CarFront, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Email: email, Password: password }),
            });

            const data = await response.json();

            if (response.ok) {
                sessionStorage.setItem('authToken', data.token);
                sessionStorage.setItem('loggedInUser', JSON.stringify(data.user));
                
                if (data.user.Role === 'Admin') {
                    router.push('/admin');
                } else {
                    router.push('/dashboard');
                }
            } else {
                setError(data.error || 'Invalid credentials');
                setIsLoading(false);
            }
        } catch (err) {
            setError('Could not connect to the server. Is Flask running?');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4 bg-[url('/grid-pattern.svg')] bg-center">
            <div className="w-full max-w-md bg-card p-8 rounded-2xl border border-border shadow-2xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col items-center mb-8 relative z-10">
                    <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-4 border border-accent/20">
                        <CarFront className="w-8 h-8 text-accent" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">VehicleFlow</h1>
                    <p className="text-muted-foreground text-sm mt-1">Sign in to manage your fleet</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm font-medium text-center animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5 relative z-10">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                            <input 
                                type="email" 
                                required
                                className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-xl outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                            <input 
                                type="password" 
                                required
                                className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-xl outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-3 bg-accent text-primary font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {isLoading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                {/* --- ADDED SIGN UP LINK HERE --- */}
                <div className="mt-6 text-center text-sm text-muted-foreground relative z-10">
                    Don't have an account?{' '}
                    <Link href="/signup" className="text-accent font-semibold hover:underline transition-all">
                        Sign up
                    </Link>
                </div>

            </div>
        </div>
    );
}