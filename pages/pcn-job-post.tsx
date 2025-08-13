import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import PCNJobPostForm from "@/components/PCNJobPostForm";
import { HeartHandshake, ArrowLeft } from "lucide-react";

export default function PCNJobPost() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50" style={{ backgroundColor: '#1e2563' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center">
              <div className="text-white font-bold text-2xl flex items-center">
                <HeartHandshake className="h-8 w-8 mr-3 text-white" />
                JoyJoy Locums
              </div>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/gp-locums" className="text-white hover:text-blue-200 transition-colors">
                For GPs
              </Link>
              <Link href="/nurse-practitioner-locums" className="text-white hover:text-blue-200 transition-colors">
                For ANPs
              </Link>
              <Link href="/pcn-locums" className="text-white hover:text-blue-200 transition-colors">
                PCN Roles
              </Link>
              <Link href="/clinical-pharmacist-locums" className="text-white hover:text-blue-200 transition-colors">
                Clinical Pharmacists
              </Link>
              <Link href="/gp-practices" className="text-white hover:text-blue-200 transition-colors">
                For GP Practices
              </Link>
              <Link href="/compliance" className="text-white hover:text-blue-200 transition-colors">
                Compliance
              </Link>
              <Link href="/auth">
                <Button variant="outline" className="bg-white text-blue-900 hover:bg-blue-50 border-white">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Back Navigation */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/pcn-locums" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to PCN Locums
          </Link>
        </div>
      </section>

      {/* Page Header */}
      <section className="py-12 bg-gradient-to-r from-[#1e2563] to-[#3b4b8c] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Post PCN Primary Care Role
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Connect with qualified healthcare professionals for your Primary Care Network opportunities.
          </p>
        </div>
      </section>

      {/* Job Post Form */}
      <section className="py-20 bg-gray-50">
        <PCNJobPostForm />
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <HeartHandshake className="h-8 w-8 mr-3" />
                <span className="text-xl font-bold">JoyJoy Locums</span>
              </div>
              <p className="text-gray-400">
                Connecting healthcare professionals with NHS Primary Care Networks across England.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">PCN Professionals</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/register" className="hover:text-white transition-colors">Register</Link></li>
                <li><Link href="/pcn-locums" className="hover:text-white transition-colors">Find PCN Roles</Link></li>
                <li><Link href="/training-centre" className="hover:text-white transition-colors">Training Centre</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">PCN Employers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/gp-practices" className="hover:text-white transition-colors">Post Positions</Link></li>
                <li><Link href="/gp-practice-enquiry" className="hover:text-white transition-colors">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/compliance" className="hover:text-white transition-colors">Compliance</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 JoyJoy Locums. All rights reserved. Supporting NHS Primary Care Networks across England.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}