import { Link } from "wouter";
import { ArrowLeft, HeartHandshake } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back to Website</span>
                </button>
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <HeartHandshake className="h-8 w-8 text-teal-600" />
              <span className="text-xl font-bold text-gray-900">JoyJoy Recruits</span>
            </div>
          </div>
        </div>
      </header>

      {/* Privacy Policy Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <p className="text-gray-600 mb-8">
            <strong>Last updated:</strong> January 23, 2025
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                JoyJoy Recruits Company Limited ("we", "us", or "our") (Company Number: 06609003) is committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, store, and protect your information when you use our medical recruitment platform. We are committed to complying with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Data Controller</h2>
              <p className="text-gray-700 leading-relaxed">
                JoyJoy Recruits Company Limited is the data controller for the personal data we process. You can contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p><strong>Company:</strong> JoyJoy Recruits Company Limited</p>
                <p><strong>Company Number:</strong> 06609003</p>
                <p><strong>Registered Address:</strong> 185 Mount Pleasant Lane, London, England, E5 9JG</p>
                <p><strong>Email:</strong> privacy@joyjoylocums.co.uk</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Personal Information</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Name, email address, phone number, and contact details</li>
                <li>Medical qualifications, registrations (GMC/NMC), and certifications</li>
                <li>Medical employment history and clinical references</li>
                <li>DBS (Disclosure and Barring Service) checks and Right to Work documentation</li>
                <li>Bank details for payment processing</li>
                <li>National Insurance number and tax information</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.2 Technical Information</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>IP address, browser type, and device information</li>
                <li>Usage data and platform interactions</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Location data (when using mobile applications)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Legal Basis for Processing</h2>
              <p className="text-gray-700 leading-relaxed mb-4">We process your personal data under the following legal bases:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Contract Performance:</strong> To provide our medical recruitment services and manage locum placements</li>
                <li><strong>Legal Obligation:</strong> To comply with employment law, medical regulations, tax obligations, and GMC/NMC requirements</li>
                <li><strong>Legitimate Interest:</strong> To improve our services, prevent fraud, and ensure platform security</li>
                <li><strong>Consent:</strong> For marketing communications and optional features (where applicable)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Matching medical professionals with suitable locum opportunities at GP practices</li>
                <li>Processing payments and managing session records</li>
                <li>Verifying medical qualifications and conducting compliance checks</li>
                <li>Communicating about locum placements and platform updates</li>
                <li>Providing customer support and resolving disputes</li>
                <li>Improving our platform and developing new features</li>
                <li>Preventing fraud and ensuring platform security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Sharing and Third Parties</h2>
              <p className="text-gray-700 leading-relaxed mb-4">We may share your information with:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>GP Practice Partners:</strong> Essential information for locum placements and medical compliance</li>
                <li><strong>Payment Processors:</strong> Secure payment processing and tax reporting</li>
                <li><strong>Medical Verification Providers:</strong> GMC/NMC, DBS and qualification verification services</li>
                <li><strong>Cloud Services:</strong> Secure data storage and platform hosting (Supabase, AWS)</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                We never sell your personal data to third parties for marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your personal data for as long as necessary to provide our services and comply with legal obligations:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
                <li><strong>Active Accounts:</strong> While your account remains active</li>
                <li><strong>Financial Records:</strong> 7 years for tax and accounting purposes</li>
                <li><strong>Medical Registration and Compliance Data:</strong> As required by GMC/NMC and healthcare regulations</li>
                <li><strong>Marketing Data:</strong> Until you withdraw consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Your Rights Under UK GDPR</h2>
              <p className="text-gray-700 leading-relaxed mb-4">You have the following rights regarding your personal data:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Right of Access:</strong> Request a copy of your personal data</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your data (subject to legal obligations)</li>
                <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
                <li><strong>Right to Withdraw Consent:</strong> Where processing is based on consent</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                To exercise these rights, contact us at privacy@joyjoylocums.co.uk
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Data Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We implement appropriate technical and organisational measures to protect your personal data, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and penetration testing</li>
                <li>Access controls and staff training on data protection</li>
                <li>Secure backup and disaster recovery procedures</li>
                <li>Incident response and breach notification procedures</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed">
                Your data may be processed outside the UK/EEA by our service providers. We ensure adequate protection through:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
                <li>UK adequacy decisions or EU adequacy decisions</li>
                <li>Standard Contractual Clauses (SCCs)</li>
                <li>Certification schemes and codes of conduct</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Cookies and Tracking</h2>
              <p className="text-gray-700 leading-relaxed">
                We use cookies and similar technologies to improve your experience. You can manage cookie preferences through your browser settings. For detailed information, see our Cookie Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our services are not intended for individuals under 18. We do not knowingly collect personal data from children.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy periodically. We will notify you of significant changes via email or platform notifications. Continued use of our services constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Complaints</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have concerns about how we handle your personal data, you can:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
                <li>Contact us directly at privacy@joyjoylocums.co.uk</li>
                <li>Lodge a complaint with the Information Commissioner's Office (ICO) at ico.org.uk</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Contact Information</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>Data Protection Officer:</strong> privacy@joyjoylocums.co.uk</p>
                <p className="text-gray-700 mb-2"><strong>General Enquiries:</strong> hello@joyjoylocums.co.uk</p>
                <p className="text-gray-700"><strong>Address:</strong> JoyJoy Recruits Company Limited, 185 Mount Pleasant Lane, London, England, E5 9JG</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}