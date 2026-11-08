'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BookOpen, GraduationCap, Upload, FileText, Settings, LogOut, Menu, X } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Students', href: '/admin/students', icon: Users },
    { name: 'Classes', href: '/admin/classes', icon: GraduationCap },
    { name: 'Subjects', href: '/admin/subjects', icon: BookOpen },
    { name: 'Upload Results', href: '/admin/results/upload', icon: Upload },
    { name: 'Manage Results', href: '/admin/results/manage', icon: FileText },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <>
      <div className="md:hidden fixed top-0 w-full h-16 bg-[#0A1F44] text-white flex items-center px-4 z-50 justify-between shadow-md">
        <h1 className="text-xl font-bold tracking-tight">School Admin</h1>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0A1F44] text-white flex flex-col transition-transform duration-300 md:translate-x-0 shadow-xl ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-16 flex items-center px-6 border-b border-white/10 hidden md:flex">
          <h1 className="text-xl font-bold tracking-tight">School Admin</h1>
        </div>
        
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 md:hidden">
          <h1 className="text-xl font-bold tracking-tight">Menu</h1>
          <button onClick={() => setIsOpen(false)} className="p-2">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={true}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-white text-[#0A1F44] shadow-sm' 
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-[#0A1F44]' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-white/10 mt-auto">
          <button onClick={() => signOut({ callbackUrl: '/admin-login' })} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}