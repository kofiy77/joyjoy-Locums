import { Link } from "wouter";
import { ArrowLeft, HeartHandshake } from "lucide-react";

export default function TermsOfService() {
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

      {/* Terms of Service Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <p className="text-gray-600 mb-8">
            <strong>Last updated:</strong> January 23, 2025
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction and Acceptance</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms of Service ("Terms") govern your use of the JoyJoy Recruits platform and services operated by JoyJoy Recruits Company Limited (Company Number: 06609003). By accessing or using our platform, you agree to be bound by these Terms. If you do not agree to these Terms, you must not use our services.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                JoyJoy Recruits Company Limited is a medical recruitment platform that connects qualified medical professionals with GP practices and healthcare facilities across the United Kingdom.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Definitions</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>"Platform"</strong> refers to the JoyJoy Recruits website, mobile applications, and related services</li>
                <li><strong>"Users"</strong> includes medical professionals, GP practices, healthcare facilities, and administrators</li>
                <li><strong>"Medical Professionals"</strong> refers to qualified locums, GPs, and nurse practitioners seeking employment through our platform</li>
                <li><strong>"GP Practices"</strong> refers to medical practices and healthcare facilities seeking staffing services</li>
                <li><strong>"Services"</strong> refers to all functionality provided through our platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Eligibility and Registration</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 General Eligibility</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>You must be at least 18 years old to use our services</li>
                <li>You must be legally eligible to work in the United Kingdom</li>
                <li>You must provide accurate and complete information during registration</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.2 Medical Professional Requirements</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Valid medical qualifications and registrations (GMC/NMC)</li>
                <li>Current DBS (Disclosure and Barring Service) check</li>
                <li>Right to Work documentation</li>
                <li>Medical indemnity insurance coverage</li>
                <li>Compliance with relevant professional body requirements</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.3 GP Practice Requirements</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Valid business registration and medical practice licensing</li>
                <li>Appropriate medical practice insurance coverage</li>
                <li>Compliance with NHS and healthcare regulations</li>
                <li>Patient safety and safeguarding policies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Platform Services</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 For Medical Professionals</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Access to available locum opportunities at GP practices</li>
                <li>Profile management and medical qualification tracking</li>
                <li>Session booking and payment processing</li>
                <li>Communication tools for practice coordination</li>
                <li>Medical training resources and compliance support</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.2 For GP Practices</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Locum booking and medical professional matching services</li>
                <li>Medical professional profile review and selection tools</li>
                <li>Session management and billing oversight</li>
                <li>Compliance tracking and medical registration verification</li>
                <li>Performance feedback and rating systems</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. User Responsibilities</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 General Responsibilities</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide accurate and up-to-date information</li>
                <li>Maintain the security of your account</li>
                <li>Use the platform in compliance with applicable laws</li>
                <li>Respect the rights and safety of other users</li>
                <li>Report any security vulnerabilities or misuse</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.2 Professional Standards</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Maintain professional conduct during all interactions</li>
                <li>Adhere to relevant professional codes of conduct</li>
                <li>Ensure qualifications and certifications remain current</li>
                <li>Report any incidents or concerns promptly</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Payment Terms</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Medical Professional Payments</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Payments are processed weekly following session completion</li>
                <li>Rates are agreed upon prior to session acceptance</li>
                <li>All payments are subject to applicable taxes and deductions</li>
                <li>Payment disputes must be raised within 30 days</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">6.2 GP Practice Billing</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Invoices are generated based on completed sessions</li>
                <li>Payment terms are typically 30 days from invoice date</li>
                <li>Late payment charges may apply as per agreed terms</li>
                <li>All charges include applicable VAT where required</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cancellation and No-Show Policy</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Session cancellations must be made at least 24 hours before the session start time</li>
                <li>Emergency cancellations will be considered on a case-by-case basis</li>
                <li>Repeated cancellations or no-shows may result in account restrictions</li>
                <li>GP practices may be charged for confirmed sessions that are cancelled within 24 hours</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>All platform content, design, and functionality are owned by JoyJoy Recruits Company Limited</li>
                <li>Users retain ownership of their personal data and uploaded content</li>
                <li>Users grant us a license to use their data for platform operation</li>
                <li>Unauthorized use of our intellectual property is prohibited</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Data Protection and Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                We are committed to protecting your personal data in accordance with UK GDPR and the Data Protection Act 2018. Please refer to our Privacy Policy for detailed information about how we collect, use, and protect your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Prohibited Activities</h2>
              <p className="text-gray-700 leading-relaxed mb-4">Users must not:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide false or misleading information</li>
                <li>Attempt to circumvent platform security measures</li>
                <li>Use the platform for any illegal or unauthorized purpose</li>
                <li>Harass, abuse, or discriminate against other users</li>
                <li>Share account credentials with third parties</li>
                <li>Attempt to reverse engineer or copy platform functionality</li>
                <li>Spam or send unsolicited communications through the platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Account Suspension and Termination</h2>
              <p className="text-gray-700 leading-relaxed mb-4">We reserve the right to suspend or terminate accounts for:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Violation of these Terms of Service</li>
                <li>Fraudulent or illegal activity</li>
                <li>Repeated policy violations</li>
                <li>Non-payment of fees (for GP practices)</li>
                <li>Failure to maintain required qualifications</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Users may terminate their accounts at any time by contacting support. Termination does not relieve obligations for services already provided.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                To the maximum extent permitted by law, JoyJoy Recruits Company Limited shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our platform. Our total liability for any claim shall not exceed the amount paid by the user in the 12 months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Indemnification</h2>
              <p className="text-gray-700 leading-relaxed">
                Users agree to indemnify and hold harmless JoyJoy Recruits Company Limited from any claims, damages, or expenses arising from their use of the platform, violation of these Terms, or infringement of any third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Force Majeure</h2>
              <p className="text-gray-700 leading-relaxed">
                JoyJoy Recruits Company Limited shall not be liable for any failure to perform due to circumstances beyond our reasonable control, including but not limited to natural disasters, government actions, or technical failures by third-party service providers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Dispute Resolution</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Any disputes arising from these Terms shall be resolved through:
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                <li>Good faith negotiation between the parties</li>
                <li>Mediation through a mutually agreed mediator</li>
                <li>Arbitration or court proceedings in English courts (if mediation fails)</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms are governed by the laws of England and Wales. Any legal proceedings shall be subject to the exclusive jurisdiction of the English courts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">17. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update these Terms periodically. Users will be notified of significant changes via email or platform notifications. Continued use of the platform after changes constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">18. Severability</h2>
              <p className="text-gray-700 leading-relaxed">
                If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">19. Contact Information</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>Legal Enquiries:</strong> legal@joyjoylocums.co.uk</p>
                <p className="text-gray-700 mb-2"><strong>General Support:</strong> hello@joyjoylocums.co.uk</p>
                <p className="text-gray-700 mb-2"><strong>Platform Issues:</strong> support@joyjoylocums.co.uk</p>
                <p className="text-gray-700"><strong>Address:</strong> JoyJoy Recruits Company Limited, 185 Mount Pleasant Lane, London, England, E5 9JG</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}