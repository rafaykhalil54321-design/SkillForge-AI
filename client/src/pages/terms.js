import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100">
        
        <div className="mb-8">
          <Link href="/login" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold transition-colors">
            <ArrowLeft size={18} /> Back to Login
          </Link>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Terms & Conditions</h1>
        <p className="text-slate-500 mb-8 font-medium">Last updated: March 2026</p>

        <div className="space-y-6 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using SkillForge, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">2. Description of Service</h2>
            <p>SkillForge provides AI-driven career analysis, resume matching, and interview preparation tools. The service is provided "as is" and we reserve the right to modify or discontinue the service at any time.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">3. User Conduct</h2>
            <p>You agree to use the service only for lawful purposes. You are solely responsible for the content you upload, including your resume, and must ensure it does not violate any applicable laws or regulations.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">4. Intellectual Property</h2>
            <p>All content included on this site, such as text, graphics, logos, and software, is the property of SkillForge and protected by intellectual property laws.</p>
          </section>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-200 text-center">
           <p className="font-medium text-slate-500">© 2026 SkillForge by Rafay Khalil.</p>
        </div>
      </div>
    </div>
  );
}