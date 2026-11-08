'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    
    const res = await signIn('credentials', { identifier: email, password, redirect: false });
    
    setLoading(false);
    if (res?.error) { 
      setErr('Invalid Admin Email or Password'); 
      return; 
    }
    router.push('/admin/dashboard');
    router.refresh();
  }

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
      <div className="bg-[#0A1F44] p-6 text-center text-white">
        <Shield className="h-12 w-12 mx-auto mb-4 text-blue-300" />
        <h1 className="text-2xl font-bold">Administrator Login</h1>
        <p className="text-sm text-blue-200 mt-1">Secure access for school staff</p>
      </div>
      
      <form onSubmit={onSubmit} className="p-8 space-y-4">
        {err && <p className="text-sm text-red-600 bg-red-50 p-2 rounded text-center">{err}</p>}
        
        <div>
          <label className="text-sm font-medium">Admin Email</label>
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@yourschool.ng" 
            className="w-full border rounded px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-[#0A1F44]"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Password</label>
          <input
            type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" 
            className="w-full border rounded px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-[#0A1F44]"
          />
        </div>
        
        <button
          type="submit" disabled={loading}
          className="w-full bg-[#0A1F44] text-white rounded py-2.5 font-medium hover:bg-opacity-90 disabled:opacity-50 transition"
        >
          {loading ? 'Signing in…' : 'Sign In as Admin'}
        </button>
      </form>
    </div>
  );
}