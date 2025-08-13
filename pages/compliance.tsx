import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import nhsLanyardsImage from "@assets/image_1753827622629.png";
import { 
  Shield, 
  FileCheck, 
  CreditCard, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  ArrowRight,
  Download,
  ExternalLink,
  Users,
  BookOpen,
  Award,
  Upload,
  HeartHandshake
} from "lucide-react";

export default function Compliance() {
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
              <Link href="/compliance" className="text-white font-medium border-b-2 border-white pb-1">
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
      <section className="bg-gradient-to-r from-[#1e2563] to-[#3b4b8c] text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${nhsLanyardsImage})` }}
        ></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-6">
            <Badge className="bg-blue-100 text-blue-900 px-4 py-2 text-sm font-medium">
              Essential Requirements
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold">
              Compliance <span className="text-blue-200">Requirements</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Everything you need to know about joining JoyJoy Locums as a healthcare professional. 
              Ensure you meet all regulatory requirements before starting your locum journey.
            </p>
          </div>
        </div>
      </section>

      {/* Requirements Overview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Before You Start</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              All locums must complete these essential requirements to ensure patient safety and regulatory compliance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-2">
                <Shield className="h-8 w-8 text-red-500 mb-2" />
                <CardTitle className="text-lg">DBS Enhanced</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Enhanced DBS check with adult/child barred lists</p>
                <Badge variant="destructive" className="mt-2 text-xs">Mandatory</Badge>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CreditCard className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle className="text-lg">Smart Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">NHS Smart Card for system access and patient records</p>
                <Badge variant="secondary" className="mt-2 text-xs">Required</Badge>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <FileCheck className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle className="text-lg">Professional Registration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">GMC or NMC registration with licence to practice</p>
                <Badge className="mt-2 text-xs bg-green-100 text-green-800">Active</Badge>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-2">
                <Clock className="h-8 w-8 text-orange-500 mb-2" />
                <CardTitle className="text-lg">Mandatory Training</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Safeguarding, Fire Safety, Health & Safety, Information Governance</p>
                <Badge variant="outline" className="mt-2 text-xs">Annual</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Detailed Requirements */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Detailed Requirements</h2>
          
          <div className="space-y-12">
            {/* DBS Enhanced */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-start space-x-4">
                <div className="bg-red-100 p-3 rounded-lg">
                  <Shield className="h-8 w-8 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Enhanced DBS Check</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Requirements:</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Enhanced level DBS certificate</li>
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Adult barred list check included</li>
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Child barred list check included</li>
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Certificate dated within last 3 years</li>
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Update Service subscription recommended</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">How to Apply:</h4>
                      <p className="text-gray-600 mb-4">Apply through the DBS online portal or approved umbrella bodies.</p>
                      <Button variant="outline" size="sm" className="mb-2">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        DBS Application Portal
                      </Button>
                      <p className="text-sm text-gray-500">Processing time: 2-4 weeks</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Card */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">NHS Smart Card</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">What You Need:</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Active NHS Smart Card</li>
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Current role-based access</li>
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />SystmOne/EMIS access credentials</li>
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Valid authentication certificate</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Application Process:</h4>
                      <p className="text-gray-600 mb-4">Apply through your NHS Trust or contact NHS Digital directly.</p>
                      <Button variant="outline" size="sm" className="mb-2">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        NHS Smart Card Portal
                      </Button>
                      <p className="text-sm text-gray-500">Processing time: 5-10 working days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Registration */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <FileCheck className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Professional Registration</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">For GPs:</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Full GMC registration</li>
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Valid licence to practice</li>
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />GP specialty training (CCT/CESR)</li>
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Current indemnity insurance</li>
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Annual appraisal compliance</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">For Nurse Practitioners:</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />NMC registration (Part 1)</li>
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Independent/Supplementary prescribing annotation</li>
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Advanced Nurse Practitioner qualification</li>
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Professional indemnity insurance</li>
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Annual revalidation compliance</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mandatory Training */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-start space-x-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <BookOpen className="h-8 w-8 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Mandatory Training</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Core Training:</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Safeguarding Adults (Level 3)</li>
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Safeguarding Children (Level 3)</li>
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Fire Safety</li>
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Health & Safety</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Information Governance:</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Data Security & Protection Toolkit</li>
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />GDPR Awareness</li>
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Information Security</li>
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Confidentiality</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Clinical Training:</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Basic Life Support (BLS)</li>
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Infection Prevention Control</li>
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Mental Capacity Act</li>
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Equality & Diversity</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Requirements */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Additional Requirements</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Award className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Right to Work</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>UK passport or valid visa</li>
                  <li>Right to work documentation</li>
                  <li>Share code if applicable</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>References</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>2 professional references</li>
                  <li>Most recent employer contact</li>
                  <li>Clinical supervisor reference</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileCheck className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Occupational Health</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Health questionnaire</li>
                  <li>Immunisation records</li>
                  <li>Hepatitis B status</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Document Upload Process */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-50 rounded-lg p-8 border-l-4 border-blue-500">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Document Upload Process</h3>
                <p className="text-lg text-gray-700 mb-6">
                  You can easily upload all required documents through your secure staff portal after completing registration.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Step-by-Step Process:</h4>
                    <ol className="space-y-2 text-gray-700">
                      <li className="flex items-start">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">1</span>
                        Complete your initial registration
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">2</span>
                        Access your secure staff portal
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">3</span>
                        Upload all compliance documents
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">4</span>
                        Our team reviews and verifies
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">5</span>
                        Start accepting locum assignments
                      </li>
                    </ol>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Portal Features:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        Secure document upload with encryption
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        Real-time compliance tracking
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        Automatic expiry date reminders
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        Document status notifications
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        Quick document replacement
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> You don't need to have all documents ready before registering. 
                    Complete your registration first, then use the staff portal to upload documents at your convenience. 
                    Our compliance team will guide you through any missing requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-12 bg-yellow-50 border-t-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="h-8 w-8 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Important Notice</h3>
              <p className="text-gray-700 mb-4">
                All documentation must be original or certified copies. Falsification of documents is a criminal offence 
                and will result in immediate termination and reporting to relevant authorities. We reserve the right to 
                verify all information provided.
              </p>
              <p className="text-sm text-gray-600">
                Some requirements may vary depending on the specific practice or role. Our compliance team will review 
                your application and notify you of any additional requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#1e2563] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
            Have all your documentation ready? Begin your application process today and join our network of qualified locums.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/gp-locums">
              <Button size="lg" className="bg-white text-[#1e2563] hover:bg-blue-50 px-8 py-3">
                Apply as GP Locum
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/nurse-practitioner-locums">
              <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-[#1e2563] px-8 py-3 bg-transparent">
                Apply as Nurse Practitioner
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}