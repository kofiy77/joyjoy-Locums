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
  HeartHandshake,
  Pill,
  UserCheck,
  Target,
  Briefcase,
  BookOpen,
  PoundSterling,
  GraduationCap,
  Stethoscope,
  Calendar,
  FileText
} from "lucide-react";

export default function ClinicalPharmacistLocums() {
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
              <Link href="/clinical-pharmacist-locums" className="text-white font-medium border-b-2 border-white pb-1">
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
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/attached_assets/shutterstock_2539516065_1753567420681.jpg')`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge className="bg-blue-100 text-blue-900 px-4 py-2 text-sm font-medium">
                NHS Long Term Workforce Plan 2025
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Clinical Pharmacist <span className="text-blue-200">Opportunities</span>
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed max-w-2xl">
                Join the NHS transformation with universal independent prescribing from 2025/26. 
                Be part of expanding training places by 29% to 4,300 positions by 2028/29.
              </p>
              <div className="flex justify-center sm:justify-start">
                <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                  <Link href="/register">
                    <UserCheck className="w-5 h-5 mr-2" />
                    Register as Clinical Pharmacist
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm border border-white/20">
                <h3 className="text-2xl font-bold mb-6">Clinical Pharmacist Framework 2025</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">Current FTE in Primary Care</span>
                    <span className="text-2xl font-bold">1,000+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">Training Places Expansion</span>
                    <span className="text-2xl font-bold text-green-300">+29%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">Target by 2028/29</span>
                    <span className="text-2xl font-bold">4,300</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">Universal Prescribing</span>
                    <span className="text-2xl font-bold text-green-300">2025/26</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Training Revolution */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-900 px-4 py-2 text-sm font-medium mb-4">
              Foundation Training Revolution 2025/26
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Universal Independent Prescribing</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From 2025/26, all newly qualified pharmacists will be independent prescribers, 
              reducing the pathway from 8 years to just 5 years.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center mb-2">
                  <GraduationCap className="h-8 w-8 text-green-500 mr-3" />
                  <Badge className="bg-green-100 text-green-900">NEW 2025/26</Badge>
                </div>
                <CardTitle className="text-xl">Foundation Year Enhancement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Revised learning outcomes include pharmacist independent prescribing integrated into foundation training.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />MPharm prescribing integration</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Prescribing training & assessment</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />GPhC updated standards</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center mb-2">
                  <Target className="h-8 w-8 text-blue-500 mr-3" />
                  <Badge className="bg-blue-100 text-blue-900">ACCELERATED</Badge>
                </div>
                <CardTitle className="text-xl">Pathway Acceleration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Shortening independent prescribing pathway from 8 years to 5 years.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />5-year qualification route</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Integrated prescribing training</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Faster clinical impact</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center mb-2">
                  <Users className="h-8 w-8 text-purple-500 mr-3" />
                  <Badge className="bg-purple-100 text-purple-900">SUPPORT</Badge>
                </div>
                <CardTitle className="text-xl">Existing Staff Development</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Supporting 3,000 existing pharmacists to develop independent prescribing skills.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />3,000 staff supported</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Skills development programs</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Multidisciplinary teams</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Clinical Responsibilities */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Core Clinical Responsibilities</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Clinical pharmacists work as integral members of general practice teams to improve outcomes from medicines
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Pill className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Structured Medication Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Comprehensive medication optimization for patients with complex polypharmacy and long-term conditions.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Stethoscope className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-lg">Patient Consultations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Direct patient consultations providing expert advice for those on multiple medicines and chronic conditions.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Independent Prescribing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Independent prescribing authority for medicines optimization and therapeutic interventions.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Building2 className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Care Home Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Specialized medicines management and optimization support for care home residents.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Workforce Expansion */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">NHS Long Term Workforce Plan</h2>
            <p className="text-xl text-gray-600">Strategic expansion of clinical pharmacist training and employment</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Training Place Expansion Timeline</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">2028/29 Target</h4>
                    <p className="text-gray-600">Expand training places by 29% to around 4,300</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">2031/32 Vision</h4>
                    <p className="text-gray-600">Increase training places by 50% overall to almost 5,000</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">2032/33 Demand</h4>
                    <p className="text-gray-600">Estimated growth of 31-55% needed to meet pharmacy service demand</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Current Opportunities</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium text-blue-900">FTE in Primary Care</span>
                  <span className="text-2xl font-bold text-blue-600">1,000+</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-green-900">PCN Funding Available</span>
                  <span className="text-2xl font-bold text-green-600">70%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium text-purple-900">ARRS Guaranteed Places</span>
                  <span className="text-2xl font-bold text-purple-600">20,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NHS Pay & Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">NHS Pay Structure & Benefits</h2>
            <p className="text-xl text-gray-600">Competitive salary progression with comprehensive benefits package</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <PoundSterling className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle className="text-xl">Starting Salary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">£46,148 - £52,809</div>
                <p className="text-gray-600">Band 6 Agenda for Change (pro rata for 37.5 hours)</p>
                <p className="text-sm text-gray-500 mt-2">Depending on experience</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle className="text-xl">Career Progression</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">Band 9</div>
                <p className="text-gray-600">Progress to Chief Pharmacist level</p>
                <p className="text-sm text-gray-500 mt-2">Clear advancement pathway</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <Calendar className="h-8 w-8 text-purple-500 mb-2" />
                <CardTitle className="text-xl">Annual Leave</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-2">27+ Days</div>
                <p className="text-gray-600">Plus bank holidays, increases after 5 years</p>
                <p className="text-sm text-gray-500 mt-2">NHS pension scheme included</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Training Programs */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Available Training Programs</h2>
            <p className="text-xl text-gray-600">Comprehensive development pathways for clinical pharmacists</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center mb-2">
                  <BookOpen className="h-8 w-8 text-blue-500 mr-3" />
                  <Badge className="bg-blue-100 text-blue-900">18-MONTH PROGRAM</Badge>
                </div>
                <CardTitle className="text-xl">Workplace Training Program</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Comprehensive workplace training for Clinical Pharmacists in General Practice Programme or PCN Contract DES recruits.
                </p>
                <h4 className="font-semibold text-gray-900 mb-2">Program Content:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Structured medication reviews</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Medicine optimization and safety</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Care home support protocols</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Practice clinic management</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center mb-2">
                  <Award className="h-8 w-8 text-green-500 mr-3" />
                  <Badge className="bg-green-100 text-green-900">FULLY FUNDED</Badge>
                </div>
                <CardTitle className="text-xl">Independent Prescribing Training</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Fully funded training for 2025/26. Critical capability for pharmacists delivering care across the NHS.
                </p>
                <h4 className="font-semibold text-gray-900 mb-2">Key Benefits:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />No training costs</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Enhanced clinical autonomy</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Career advancement opportunities</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Patient safety improvement</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-[#1e2563] to-[#3b4b8c] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Shape the Future of Medicines Optimization</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join the NHS transformation with universal independent prescribing from 2025/26. 
            Be part of multidisciplinary teams improving patient outcomes and reducing medicines wastage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
              <Link href="/register">
                <ArrowRight className="w-5 h-5 mr-2" />
                Register as Clinical Pharmacist
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-blue-900 bg-transparent">
              <Link href="/gp-practices">
                <Building2 className="w-5 h-5 mr-2" />
                Recruit Clinical Pharmacists
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
                Supporting clinical pharmacist career development across NHS primary care networks.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Clinical Pharmacists</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/register" className="hover:text-white transition-colors">Register</Link></li>
                <li><Link href="/clinical-pharmacist-locums" className="hover:text-white transition-colors">Find Positions</Link></li>
                <li><Link href="/training-centre" className="hover:text-white transition-colors">Training Centre</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Employers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/gp-practices" className="hover:text-white transition-colors">Recruit Pharmacists</Link></li>
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
            <p>&copy; 2025 JoyJoy Locums. All rights reserved. Supporting NHS clinical pharmacist workforce expansion.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}