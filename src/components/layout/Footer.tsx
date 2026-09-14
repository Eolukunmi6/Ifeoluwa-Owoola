import React from 'react';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6 mt-2">
              <img src="/logo.png" alt="Auralearn Logo" className="h-24 sm:h-28 w-auto object-contain mix-blend-multiply grayscale hover:grayscale-0 transition-all opacity-80 hover:opacity-100 scale-[1.35] sm:scale-150 origin-left" />
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Premium tutor marketplace connecting parents with qualified tutors. Learning made easier.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">For Parents</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/tutors" className="hover:text-emerald-500 transition-colors">Find a Tutor</Link></li>
              <li><Link to="/how-it-works" className="hover:text-emerald-500 transition-colors">How it Works</Link></li>
              <li><Link to="/register" className="hover:text-emerald-500 transition-colors">Create Parent Account</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">For Tutors</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/tutor/register" className="hover:text-fuchsia-500 transition-colors">Register as Tutor</Link></li>
              <li><Link to="/tutor/guidelines" className="hover:text-sky-500 transition-colors">Tutor Guidelines</Link></li>
              <li><Link to="/login" className="hover:text-sky-500 transition-colors">Tutor Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/about" className="hover:text-sky-500 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-sky-500 transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-sky-500 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Auralearn. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
