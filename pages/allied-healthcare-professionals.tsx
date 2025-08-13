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
  Activity,
  UserCheck,
  Target,
  Briefcase,
  BookOpen,
  PoundSterling,
  GraduationCap,
  Stethoscope,
  Heart,
  Brain,
  Eye,
  Zap
} from "lucide-react";

export default function AlliedHealthcareProfessionals() {
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

      {/* Hero Section */}
      <section 
        className="relative text-white py-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(30, 37, 99, 0.75), rgba(59, 75, 140, 0.75)), url('/attached_assets/image_1753633159610.png')`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge className="bg-blue-100 text-blue-900 px-4 py-2 text-sm font-medium">
                Allied Healthcare Professionals
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Specialized Healthcare <span className="text-blue-200">Opportunities</span>
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed max-w-2xl">
                Join the NHS as an Allied Healthcare Professional. From physiotherapy to occupational therapy, 
                speech and language therapy to healthcare science - expand your career in specialized healthcare roles.
              </p>
              <div className="flex justify-center sm:justify-start">
                <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                  <Link href="/allied-healthcare-registration">
                    <UserCheck className="w-5 h-5 mr-2" />
                    Register as AHP Professional
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm border border-white/20">
                <h3 className="text-2xl font-bold mb-6">AHP Career Opportunities</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">Professional Disciplines</span>
                    <span className="text-2xl font-bold">12+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">NHS Job Openings</span>
                    <span className="text-2xl font-bold">15,000+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">Average Salary Range</span>
                    <span className="text-2xl font-bold">£25k-£55k</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">Career Progression</span>
                    <span className="text-2xl font-bold text-green-300">Band 9</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Disciplines */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Allied Healthcare Professional Disciplines</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Diverse career opportunities across specialized healthcare professions supporting patient care and rehabilitation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center mb-2">
                  <Activity className="h-8 w-8 text-blue-500 mr-3" />
                  <Badge className="bg-blue-100 text-blue-900">REHABILITATION</Badge>
                </div>
                <CardTitle className="text-xl">Physiotherapy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Movement and exercise therapy for injury recovery, chronic conditions, and disability management.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Musculoskeletal disorders</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Neurological rehabilitation</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Respiratory therapy</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center mb-2">
                  <Heart className="h-8 w-8 text-green-500 mr-3" />
                  <Badge className="bg-green-100 text-green-900">DAILY LIVING</Badge>
                </div>
                <CardTitle className="text-xl">Occupational Therapy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Helping people achieve independence in daily activities and meaningful occupations.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Adaptive equipment training</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Cognitive rehabilitation</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Home assessments</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center mb-2">
                  <Brain className="h-8 w-8 text-purple-500 mr-3" />
                  <Badge className="bg-purple-100 text-purple-900">COMMUNICATION</Badge>
                </div>
                <CardTitle className="text-xl">Speech & Language Therapy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Assessment and treatment of speech, language, communication, and swallowing disorders.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Speech disorders</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Dysphagia management</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Communication aids</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center mb-2">
                  <Zap className="h-8 w-8 text-orange-500 mr-3" />
                  <Badge className="bg-orange-100 text-orange-900">DIAGNOSTIC</Badge>
                </div>
                <CardTitle className="text-xl">Healthcare Science</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Laboratory testing, imaging, and clinical technology supporting diagnosis and treatment.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Biomedical science</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Medical imaging</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Clinical engineering</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center mb-2">
                  <Users className="h-8 w-8 text-red-500 mr-3" />
                  <Badge className="bg-red-100 text-red-900">SOCIAL CARE</Badge>
                </div>
                <CardTitle className="text-xl">Social Work</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Supporting vulnerable individuals and families through social intervention and advocacy.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Child protection</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Mental health support</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Community care</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-indigo-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center mb-2">
                  <Eye className="h-8 w-8 text-indigo-500 mr-3" />
                  <Badge className="bg-indigo-100 text-indigo-900">SPECIALIZED</Badge>
                </div>
                <CardTitle className="text-xl">Other AHP Disciplines</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Additional specialized healthcare professions including dietetics, podiatry, and orthoptics.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Dietetics & nutrition</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Podiatry & foot care</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Orthoptics & vision</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Career Progression */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">NHS Career Progression for AHPs</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Clear advancement pathways with competitive salaries and professional development opportunities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <GraduationCap className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Band 5 - Newly Qualified</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 mb-2">£25k - £31k</div>
                <p className="text-gray-600 text-sm">Entry level positions for newly qualified AHP professionals</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-lg">Band 6 - Experienced</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 mb-2">£32k - £39k</div>
                <p className="text-gray-600 text-sm">Experienced practitioners with specialized skills and responsibilities</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Band 7 - Senior</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600 mb-2">£40k - £46k</div>
                <p className="text-gray-600 text-sm">Senior practitioners, team leaders, and clinical specialists</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Band 8+ - Leadership</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 mb-2">£47k - £55k+</div>
                <p className="text-gray-600 text-sm">Management, consultancy, and strategic leadership roles</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits & Support */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Choose AHP Careers?</h2>
            <p className="text-xl text-gray-600">Comprehensive benefits and professional development support</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle className="text-xl">Continuous Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Access to NHS Learning Hub, professional development programs, and continuing education opportunities.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle className="text-xl">Job Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Stable NHS employment with excellent pension scheme, job security, and comprehensive benefits package.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-8 w-8 text-purple-500 mb-2" />
                <CardTitle className="text-xl">Multidisciplinary Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Work alongside doctors, nurses, and other healthcare professionals in collaborative care environments.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Heart className="h-8 w-8 text-red-500 mb-2" />
                <CardTitle className="text-xl">Patient Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Make a meaningful difference in patients' lives through specialized expertise and compassionate care.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-indigo-500 mb-2" />
                <CardTitle className="text-xl">Career Flexibility</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Opportunities in hospitals, community settings, private practice, research, and education sectors.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Award className="h-8 w-8 text-orange-500 mb-2" />
                <CardTitle className="text-xl">Professional Recognition</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Registration with professional bodies (HCPC, RCCP, RCSLT) ensuring high standards and public trust.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-[#1e2563] to-[#3b4b8c] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Start Your AHP Career Journey</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of Allied Healthcare Professionals making a difference in the NHS. 
            From rehabilitation to diagnostics, find your specialized healthcare career path.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
              <Link href="/allied-healthcare-registration">
                <ArrowRight className="w-5 h-5 mr-2" />
                Register as AHP Professional
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
                Supporting Allied Healthcare Professional career development across the NHS.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">AHP Professionals</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/register" className="hover:text-white transition-colors">Register</Link></li>
                <li><Link href="/allied-healthcare-professionals" className="hover:text-white transition-colors">Find Opportunities</Link></li>
                <li><Link href="/training-centre" className="hover:text-white transition-colors">Training Centre</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Employers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/gp-practices" className="hover:text-white transition-colors">Recruit AHPs</Link></li>
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
            <p>&copy; 2025 JoyJoy Locums. All rights reserved. Supporting Allied Healthcare Professional careers in the NHS.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}