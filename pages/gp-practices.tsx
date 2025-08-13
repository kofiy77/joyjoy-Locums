import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Users, 
  Clock, 
  Shield, 
  CheckCircle,
  Star,
  MapPin,
  Calendar,
  TrendingUp,
  Phone,
  Mail,
  UserCheck,
  Award,
  Handshake,
  HeartHandshake
} from "lucide-react";
import practiceImage from "@assets/shutterstock_98521178_1753236105261.jpg";

export default function GPPractices() {
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
              <Link href="/gp-practices" className="text-white font-medium border-b-2 border-white pb-1">
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
            <div className="md:hidden">
              <button className="text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[70vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${practiceImage})`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover'
          }}>
          <div className="absolute inset-0 bg-gradient-to-r from-[#1e2563]/90 to-[#1e2563]/70"></div>
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-2xl text-white">
                <div className="space-y-8">
                  <div className="space-y-6">
                    <Badge className="bg-blue-100 text-blue-900 px-4 py-2 text-sm font-medium">
                      For GP Practices & Healthcare Facilities
                    </Badge>
                    <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-white drop-shadow-lg">
                      Reliable Locum<br />
                      <span className="text-blue-200">Staffing Solutions</span>
                    </h1>
                    <p className="text-xl text-blue-100 drop-shadow-md leading-relaxed max-w-xl">
                      Access qualified GPs and Nurse Practitioners when you need them most.
                    </p>
                  </div>
                  
                  <div className="flex justify-center sm:justify-start">
                    <Link href="/gp-practice-enquiry">
                      <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                        Get Started Today
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </div>

                  <div className="flex items-center gap-6 pt-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white drop-shadow-lg">24/7</div>
                      <div className="text-sm text-blue-200 drop-shadow-md">Support</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white drop-shadow-lg">150+</div>
                      <div className="text-sm text-blue-200 drop-shadow-md">Partner Practices</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white drop-shadow-lg">98%</div>
                      <div className="text-sm text-blue-200 drop-shadow-md">Fill Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--header-blue)' }}>
              Why Partner with JoyJoy Locums?
            </h2>
            <p className="text-xl text-gray-600">
              Trusted by practices across the UK for reliable, professional locum coverage
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-semibold" style={{ color: 'var(--header-blue)' }}>
                  Vetted Professionals
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 leading-relaxed">
                  All our locums are thoroughly vetted with current GMC registration, 
                  DBS checks, and comprehensive references.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-semibold" style={{ color: 'var(--header-blue)' }}>
                  Rapid Response
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 leading-relaxed">
                  Same-day and next-day placements available. 
                  Emergency cover arranged within hours of your request.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-semibold" style={{ color: 'var(--header-blue)' }}>
                  Full Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 leading-relaxed">
                  Complete indemnity insurance, ongoing compliance monitoring, 
                  and full regulatory support included.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--header-blue)' }}>
              Our Services
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive locum solutions tailored to your practice needs
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Handshake className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--header-blue)' }}>
                    GP Locums
                  </h3>
                  <p className="text-gray-600">
                    Experienced GPs for routine clinics, home visits, and emergency cover. 
                    All with current NHS experience and local area knowledge.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--header-blue)' }}>
                    Nurse Practitioners
                  </h3>
                  <p className="text-gray-600">
                    Qualified Advanced Nurse Practitioners for chronic disease management, 
                    minor illness clinics, and routine appointments.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--header-blue)' }}>
                    Planned & Emergency Cover
                  </h3>
                  <p className="text-gray-600">
                    Book in advance for holidays and training, or call us for emergency 
                    same-day cover when staff are unexpectedly unavailable.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--header-blue)' }}>
                    Specialist Services
                  </h3>
                  <p className="text-gray-600">
                    Access to specialists including contraception, travel health, 
                    mental health, and chronic disease management expertise.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--header-blue)' }}>
                Simple Booking Process
              </h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <p className="text-gray-700">Submit your request with dates and requirements</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <p className="text-gray-700">Receive matched locum profiles within 2 hours</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <p className="text-gray-700">Confirm your preferred locum</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <p className="text-gray-700">We handle all admin and invoicing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--header-blue)' }}>
              What Practice Managers Say
            </h2>
            <p className="text-xl text-gray-600">
              Trusted by practices across the UK
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "JoyJoy Locums has been a lifesaver for our practice. Professional service, 
                  vetted clinicians, and always available when we need emergency cover."
                </p>
                <div className="font-semibold" style={{ color: 'var(--header-blue)' }}>
                  Sarah Johnson
                </div>
                <div className="text-sm text-gray-500">
                  Practice Manager, Hillside Medical Centre
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "The quality of locums is exceptional. They integrate seamlessly with our team 
                  and patients are always satisfied with the care received."
                </p>
                <div className="font-semibold" style={{ color: 'var(--header-blue)' }}>
                  Dr. Michael Thompson
                </div>
                <div className="text-sm text-gray-500">
                  Senior Partner, Riverside Health Group
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "Reliable, professional, and cost-effective. JoyJoy Locums understands 
                  the pressures we face and always delivers quality solutions."
                </p>
                <div className="font-semibold" style={{ color: 'var(--header-blue)' }}>
                  Emma Davies
                </div>
                <div className="text-sm text-gray-500">
                  Operations Manager, Central Medical Practice
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#1e2563]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Partner with Us?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join over 150 practices across the UK who trust JoyJoy Locums for their staffing needs. 
            Get started today with a simple enquiry.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/gp-practice-enquiry">
              <Button size="lg" className="bg-white text-[#1e2563] hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
                Submit Practice Enquiry
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-[#1e2563] px-8 py-3 text-lg">
              <Phone className="mr-2 h-5 w-5" />
              Call Us: 0800 123 4567
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t border-blue-400">
            <p className="text-blue-100">
              <Mail className="inline h-5 w-5 mr-2" />
              partnerships@joyjoylocums.co.uk
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}