'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GraduationCap, KeyRound, ArrowRight } from 'lucide-react';
import { setupStudentPassword } from '@/server/actions/students';

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') ?? '/student/dashboard';
  
  const [isActivating, setIsActivating] = useState(false);
  const [admissionNo, setAdmissionNo] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmitLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null); setSuccess(null);
    
    const res = await signIn('credentials', { identifier: admissionNo, password, redirect: false });
    
    setLoading(false);
    if (res?.error) { 
      setErr('Invalid Admission Number or Password'); 
      return; 
    }
    router.push(next);
    router.refresh();
  }

  async function onSubmitActivate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null); setSuccess(null);

    const formData = new FormData();
    formData.append('admissionNo', admissionNo);
    formData.append('password', password);

    const res = await setupStudentPassword(formData);
    
    setLoading(false);
    if (res.error) {
      setErr(res.error);
    } else {
      setSuccess('Account activated successfully! Logging you in...');
      setTimeout(async () => {
        const loginRes = await signIn('credentials', { identifier: admissionNo, password, redirect: false });
        if (loginRes?.error) {
          setErr('Account created, but login failed. Please log in manually.');
          setIsActivating(false);
        } else {
          router.push('/student/dashboard');
          router.refresh();
        }
      }, 1000);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden p-6">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 md:p-10 relative z-10">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-[#0A1F44] rounded-2xl mb-6 shadow-lg shadow-blue-900/20">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#0A1F44] tracking-tight">
            {isActivating ? 'Activate Account' : 'Student Portal'}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            {isActivating 
              ? 'Set a password to access your results.' 
              : 'Welcome back. Sign in to continue.'}
          </p>
        </div>
        
        {err && <div className="p-3 mb-6 text-sm font-medium text-red-600 bg-red-50/80 border border-red-100 rounded-xl text-center">{err}</div>}
        {success && <div className="p-3 mb-6 text-sm font-medium text-green-700 bg-green-50/80 border border-green-100 rounded-xl text-center">{success}</div>}
        
        <form onSubmit={isActivating ? onSubmitActivate : onSubmitLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Admission Number</label>
            <input
              type="text" required value={admissionNo} onChange={(e) => setAdmissionNo(e.target.value)}
              placeholder="e.g. JSS1-001" 
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-[#0A1F44] transition-all outline-none font-medium"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              {isActivating ? 'Create a Password' : 'Password'}
            </label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder={isActivating ? "Minimum 6 characters" : "••••••••"} 
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-[#0A1F44] transition-all outline-none font-medium tracking-wide"
            />
          </div>
          
          <button
            type="submit" disabled={loading || !!success}
            className={`w-full py-3.5 rounded-xl font-bold text-white transition-all disabled:opacity-70 shadow-lg flex items-center justify-center gap-2 group ${
              isActivating 
                ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20' 
                : 'bg-[#0A1F44] hover:bg-[#152e5f] shadow-blue-900/20'
            }`}
          >
            {loading ? 'Processing…' : (isActivating ? 'Activate & Login' : 'Sign In')}
            {!loading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200/60 text-center">
          <button 
            type="button" 
            onClick={() => { setIsActivating(!isActivating); setErr(null); setSuccess(null); setPassword(''); }}
            className="text-sm font-bold text-slate-500 hover:text-[#0A1F44] transition-colors flex items-center justify-center gap-2 w-full"
          >
            <KeyRound className="h-4 w-4" />
            {isActivating ? "Already activated? Log in here" : "First time here? Activate your account"}
          </button>
        </div>
      </div>
    </div>
  );
}