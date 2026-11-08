'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, User, LogOut, Menu, X } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function StudentSidebar({ studentName, admissionNo }: { studentName: string, admissionNo: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: 'Overview', href: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Check Results', href: '/student/results', icon: FileText },
    { name: 'My Profile', href: '/student/profile', icon: User },
  ];

  return (
    <>
      <div className="md:hidden fixed top-0 w-full h-16 bg-[#0A1F44] text-white flex items-center px-4 z-50 justify-between">
        <h1 className="text-xl font-bold">Student Portal</h1>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0A1F44] text-white flex flex-col transition-transform duration-300 md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-16 flex items-center px-6 border-b border-white/10 hidden md:flex">
          <h1 className="text-xl font-bold tracking-tight">Student Portal</h1>
        </div>
        
        <div className="px-6 py-4 border-b border-white/10 bg-white/5 mt-16 md:mt-0">
          <p className="text-sm font-medium text-slate-300">Welcome,</p>
          <p className="font-semibold truncate text-white">{studentName}</p>
          <p className="text-xs text-slate-400 mt-1">{admissionNo}</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/20 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 mt-auto">
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="flex items-center gap-3 px-3 py-3 w-full rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}