import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100">
        
        <div className="mb-8">
          <Link href="/login" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold transition-colors">
            <ArrowLeft size={18} /> Back to Login
          </Link>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Privacy Policy</h1>
        <p className="text-slate-500 mb-8 font-medium">Last updated: March 2026</p>

        <div className="space-y-6 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">1. Information We Collect</h2>
            <p>Welcome to SkillForge. We respect your privacy and are committed to protecting your personal data. We collect information you provide directly to us, such as your name, email address, and uploaded resumes.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">2. How We Use Your Information</h2>
            <p>We use your information to provide, maintain, and improve our AI career analysis services, to process your resume, and to communicate with you regarding your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">3. Data Security</h2>
            <p>We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">4. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact the SkillForge team.</p>
          </section>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-200 text-center">
           <p className="font-medium text-slate-500">© 2026 SkillForge by Rafay Khalil.</p>
        </div>
      </div>
    </div>
  );
}