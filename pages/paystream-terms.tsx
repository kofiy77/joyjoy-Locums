import { Link } from "wouter";
import { ArrowLeft, FileText, Shield, CreditCard, Users, AlertTriangle } from "lucide-react";

export default function PayStreamTerms() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/register">
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Registration
              </button>
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-900">PayStream Terms & Conditions</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          {/* Title Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">PayStream Terms & Conditions</h1>
                <p className="text-gray-600">Umbrella Company Services Agreement</p>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">Important Notice</h3>
                  <p className="text-sm text-blue-700">
                    By agreeing to these terms, you consent to PayStream acting as your umbrella company 
                    for payment processing and employment services through JoyJoy Locums.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Terms Content */}
          <div className="prose max-w-none">
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900 m-0">1. Service Overview</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                PayStream provides umbrella company services to healthcare professionals working through 
                JoyJoy Locums. Our services include payroll processing, tax calculations, National Insurance 
                contributions, and statutory compliance for locum assignments.
              </p>
              <ul className="mt-4 space-y-2 text-gray-700">
                <li>• Weekly payroll processing with direct bank transfers</li>
                <li>• Automated tax and National Insurance deductions</li>
                <li>• P60 and P45 documentation</li>
                <li>• Employment law compliance and statutory benefits</li>
                <li>• Professional indemnity insurance coverage</li>
              </ul>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900 m-0">2. Payment Structure</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                PayStream operates on a transparent fee structure for umbrella company services:
              </p>
              <div className="bg-gray-50 border rounded-lg p-4 mt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Weekly Administration Fee</h4>
                    <p className="text-sm text-gray-600">£25.00 per week (inc. VAT)</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Margin on Assignments</h4>
                    <p className="text-sm text-gray-600">2.5% of gross earnings</p>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed mt-4">
                All fees are deducted automatically from your gross pay before tax calculations. 
                You will receive detailed payslips showing all deductions and net pay.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Employment Status</h2>
              <p className="text-gray-700 leading-relaxed">
                As a contractor working through PayStream's umbrella company model, you will be:
              </p>
              <ul className="mt-4 space-y-2 text-gray-700">
                <li>• Employed directly by PayStream Limited</li>
                <li>• Subject to PAYE tax and National Insurance contributions</li>
                <li>• Entitled to statutory employment rights and benefits</li>
                <li>• Covered by employer's liability and professional indemnity insurance</li>
                <li>• Eligible for statutory holiday pay and sick pay</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Tax and National Insurance</h2>
              <p className="text-gray-700 leading-relaxed">
                PayStream handles all tax obligations in compliance with HMRC regulations:
              </p>
              <ul className="mt-4 space-y-2 text-gray-700">
                <li>• Income tax calculated and deducted under PAYE</li>
                <li>• National Insurance contributions (both employee and employer portions)</li>
                <li>• Real Time Information (RTI) reporting to HMRC</li>
                <li>• Annual P60 certificates provided</li>
                <li>• P45 issued upon leaving the scheme</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Protection</h2>
              <p className="text-gray-700 leading-relaxed">
                PayStream is committed to protecting your personal data in accordance with UK GDPR:
              </p>
              <ul className="mt-4 space-y-2 text-gray-700">
                <li>• Personal data processed lawfully for employment and tax purposes</li>
                <li>• Data shared only with HMRC, pension providers, and regulatory bodies as required</li>
                <li>• Secure data storage and transmission protocols</li>
                <li>• Right to access, rectify, or request deletion of your data</li>
                <li>• Data retention in line with statutory requirements (typically 6 years)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Professional Indemnity Insurance</h2>
              <p className="text-gray-700 leading-relaxed">
                All contractors are covered by PayStream's comprehensive professional indemnity insurance:
              </p>
              <ul className="mt-4 space-y-2 text-gray-700">
                <li>• £6 million professional indemnity coverage</li>
                <li>• Public liability insurance included</li>
                <li>• Coverage for clinical negligence claims</li>
                <li>• 24/7 legal helpline access</li>
                <li>• Automatic coverage renewal</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                Either party may terminate this agreement with written notice:
              </p>
              <ul className="mt-4 space-y-2 text-gray-700">
                <li>• One week's notice required from either party</li>
                <li>• Final payments processed within 7 days of last assignment</li>
                <li>• P45 issued upon termination</li>
                <li>• Outstanding holiday pay calculated and paid</li>
                <li>• Professional indemnity coverage continues for 6 years post-termination</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Contact Information</h2>
              <div className="bg-gray-50 border rounded-lg p-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">PayStream Limited</h4>
                    <p className="text-sm text-gray-600">
                      1 Finsbury Square<br />
                      London EC2A 1AE<br />
                      United Kingdom
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Contact Details</h4>
                    <p className="text-sm text-gray-600">
                      Phone: 0800 077 3777<br />
                      Email: support@paystream.co.uk<br />
                      Web: www.paystream.co.uk
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Last updated: January 24, 2025 | Version 2.1
              </div>
              <Link href="/register">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Return to Registration
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}