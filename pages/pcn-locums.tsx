import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { 
  ArrowRight, 
  Users, 
  Building2, 
  Clock, 
  Shield, 
  Star,
  CheckCircle,
  Award,
  MapPin,
  TrendingUp,
  Network,
  HeartHandshake,
  Stethoscope,
  UserCheck,
  Target,
  Briefcase,
  BookOpen,
  PoundSterling
} from "lucide-react";

export default function PCNLocums() {
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
              <Link href="/pcn-locums" className="text-white font-medium border-b-2 border-white pb-1">
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

      {/* Hero Section */}
      <section 
        className="relative text-white py-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(30, 37, 99, 0.85), rgba(59, 75, 140, 0.85)), url('/attached_assets/IMG_1667_1753631216038.jpeg')`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge className="bg-blue-100 text-blue-900 px-4 py-2 text-sm font-medium">
                PCN Management Solutions
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Complete <span className="text-blue-200">PCN Workforce</span> Solutions
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed max-w-2xl">
                JoyJoy Locums provides both permanent placements and locum staffing for PCNs through our dedicated online portal. 
                Build your team with permanent hires or fill gaps with flexible locum support - all managed in one place with full ARRS compliance.
              </p>
              <div className="flex justify-center sm:justify-start">
                <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                  <Link href="/pcn-job-post">
                    <Building2 className="w-5 h-5 mr-2" />
                    Post PCN Role
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm border border-white/20">
                <h3 className="text-2xl font-bold mb-6">PCN Management Benefits</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">Average Booking Time</span>
                    <span className="text-2xl font-bold text-green-300">2 mins</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">Fill Rate</span>
                    <span className="text-2xl font-bold">98%+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">Compliance Tracking</span>
                    <span className="text-2xl font-bold text-green-300">100%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">24/7 Support</span>
                    <span className="text-2xl font-bold">✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Online Portal Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-900 px-4 py-2 text-sm font-medium mb-4">
              PCN Management Portal
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Complete Workforce Solutions Portal</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our dedicated PCN portal manages both permanent recruitment and locum staffing. From building your core team 
              to covering short-term needs, everything is streamlined with full ARRS compliance and automated reporting.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Quick Staffing Requests */}
            <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center mb-2">
                  <Clock className="h-8 w-8 text-blue-500 mr-3" />
                  <Badge className="bg-blue-100 text-blue-900">INSTANT</Badge>
                </div>
                <CardTitle className="text-xl">Dual Staffing Solutions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Choose permanent recruitment or locum cover through a single streamlined request system.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Permanent placement service</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Flexible locum coverage</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Mixed workforce planning</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center mb-2">
                  <Network className="h-8 w-8 text-green-500 mr-3" />
                  <Badge className="bg-green-100 text-green-900">COMPREHENSIVE</Badge>
                </div>
                <CardTitle className="text-xl">Portal Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Complete workforce oversight with our intuitive PCN management dashboard.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Live assignment tracking</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Timesheet approval system</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Performance analytics</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center mb-2">
                  <UserCheck className="h-8 w-8 text-purple-500 mr-3" />
                  <Badge className="bg-purple-100 text-purple-900">EXPANDED</Badge>
                </div>
                <CardTitle className="text-xl">Clinical Pharmacists</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Essential for medicines optimization and structured medication reviews.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Medication reviews</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Independent prescribing</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Care home support</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center mb-2">
                  <Users className="h-8 w-8 text-orange-500 mr-3" />
                  <Badge className="bg-orange-100 text-orange-900">CORE</Badge>
                </div>
                <CardTitle className="text-xl">Social Prescribing Link Workers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Supporting personalized care delivery and addressing health inequalities.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Community connections</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Holistic support</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Health inequalities focus</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center mb-2">
                  <Shield className="h-8 w-8 text-red-500 mr-3" />
                  <Badge className="bg-red-100 text-red-900">UNCAPPED</Badge>
                </div>
                <CardTitle className="text-xl">Mental Health Practitioners</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Caps removed for mental health roles reflecting urgent need.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />No headcount limits</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Integrated care delivery</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Population health focus</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-indigo-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center mb-2">
                  <Network className="h-8 w-8 text-indigo-500 mr-3" />
                  <Badge className="bg-indigo-100 text-indigo-900">DIGITAL</Badge>
                </div>
                <CardTitle className="text-xl">Digital & Transformation Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Supporting technology adoption and workflow optimization.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />E-consultation rollout</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Technology implementation</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Workflow improvement</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works - PCN Portal Workflow */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-900 px-4 py-2 text-sm font-medium mb-4">
              Simple 4-Step Process
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">How PCN Managers Use Our Portal</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From urgent staffing need to professional in place - streamlined for PCN efficiency
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl mb-2">1. Quick Request</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Submit permanent or locum requests through our online portal. Select role type, requirements, and practice locations in under 2 minutes.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl mb-2">2. Smart Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Our system matches verified professionals for both permanent roles and locum positions based on location, skills, and ARRS requirements.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl mb-2">3. Instant Confirmation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Receive confirmation within hours. All compliance checks pre-completed including DBS, right-to-work, and professional registration.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl mb-2">4. Ongoing Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Track attendance, approve timesheets, and receive automated ARRS-compliant invoicing - all through your dedicated portal dashboard.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* PCN Management Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Complete PCN Workforce Partnership</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Supporting PCNs with permanent recruitment and flexible locum solutions designed for ARRS compliance and operational excellence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Workforce Diversification</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Moving from GP-centric model to multidisciplinary teams with expanded clinical roles and shared care delivery.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Training Investment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Increased focus on upskilling existing workforce through advanced practitioner training and career progression pathways.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Network className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Integration Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Collaborative working across primary care, community services, mental health providers, and social care partners.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-indigo-600" />
                </div>
                <CardTitle className="text-xl">Technology Enhancement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Digital transformation with e-consultation implementation by October 2025 and technology adoption for improved access.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Personalized Care</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Expansion of care coordinators, health coaches, and social prescribers to address health inequalities proactively.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <PoundSterling className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-xl">Enhanced Funding</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  London weighting now applies to all ARRS roles with 4.4% overall budget increase and £82m additional GP funding.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Implementation Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Implementation Timeline</h2>
            <p className="text-xl text-gray-600">Key milestones for PCN workforce transformation</p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Current - GP ARRS Funding Available</h3>
                <p className="text-gray-600">GP ARRS funding available since October 2024</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">April 2025 - Advanced Practitioner Training</h3>
                <p className="text-gray-600">Nurse advanced practitioner training reimbursement begins</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <Network className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">October 2025 - E-consultation Implementation</h3>
                <p className="text-gray-600">E-consultation core hours implementation target</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">2025/26 - Full ARRS Expansion</h3>
                <p className="text-gray-600">Complete expanded ARRS scheme operational with all new roles</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-[#1e2563] to-[#3b4b8c] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Join the PCN Workforce Revolution</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Be part of the NHS transformation to team-based primary care delivery. 
            Enhanced clinical capabilities, improved patient access, and career progression opportunities await.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
              <Link href="/pcn-job-post">
                <ArrowRight className="w-5 h-5 mr-2" />
                Post PCN Position
              </Link>
            </Button>
          </div>
        </div>
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