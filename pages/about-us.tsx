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
  Stethoscope,
  Building2,
  Target,
  Globe,
  HeartHandshake
} from "lucide-react";
import aboutImage from "@assets/image_1753232246501.png";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${aboutImage})`,
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
                      Established 2008
                    </Badge>
                    <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                      About<br />
                      <span className="text-blue-200">JoyJoy Locums</span>
                    </h1>
                    <p className="text-xl text-blue-100 leading-relaxed max-w-xl">
                      17 years of connecting exceptional medical professionals with practices across the UK.
                    </p>
                  </div>

                  <div className="flex items-center gap-6 pt-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">2008</div>
                      <div className="text-sm text-blue-200">Founded</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">17+</div>
                      <div className="text-sm text-blue-200">Years Experience</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">1000+</div>
                      <div className="text-sm text-blue-200">Successful Placements</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold" style={{ color: 'var(--header-blue)' }}>
                Our Story
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Founded in 2008, JoyJoy Locums began with a simple mission: to bridge the gap between 
                exceptional medical professionals and the practices that need them most. What started as 
                a small venture has grown into one of the UK's most trusted locum agencies.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Over 17 years, we've built lasting relationships with both locums and practices, 
                understanding the unique challenges each faces. Our commitment to quality, reliability, 
                and professional excellence has made us the preferred partner for medical staffing solutions.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Today, we proudly serve over 150 partner practices across the UK, with a network 
                of 500+ vetted medical professionals ready to provide exceptional patient care when and where it's needed most.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--header-blue)' }}>
                Our Milestones
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold" style={{ color: 'var(--header-blue)' }}>2008</h4>
                    <p className="text-gray-600">JoyJoy Locums founded with 5 partner practices</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold" style={{ color: 'var(--header-blue)' }}>2015</h4>
                    <p className="text-gray-600">Expanded to serve 50+ practices nationwide</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold" style={{ color: 'var(--header-blue)' }}>2020</h4>
                    <p className="text-gray-600">Achieved 98% client satisfaction rating</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Globe className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold" style={{ color: 'var(--header-blue)' }}>2025</h4>
                    <p className="text-gray-600">150+ partner practices, 500+ active locums</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--header-blue)' }}>
              Our Values
            </h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow text-center">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HeartHandshake className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold" style={{ color: 'var(--header-blue)' }}>
                  Patient Care First
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Every placement is made with patient welfare as our top priority.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow text-center">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-semibold" style={{ color: 'var(--header-blue)' }}>
                  Professional Excellence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Rigorous vetting ensures only the highest caliber professionals.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow text-center">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-semibold" style={{ color: 'var(--header-blue)' }}>
                  Trust & Reliability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  17 years of consistent, dependable service to our partners.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow text-center">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-semibold" style={{ color: 'var(--header-blue)' }}>
                  Partnership Approach
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Building long-term relationships, not just filling positions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--header-blue)' }}>
              Leadership Team
            </h2>
            <p className="text-xl text-gray-600">
              Experienced professionals dedicated to healthcare excellence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--header-blue)' }}>
                  Sarah Johnson
                </h3>
                <p className="text-blue-600 font-medium mb-4">Chief Executive Officer</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  15+ years in healthcare recruitment, former NHS manager with deep understanding 
                  of practice operations and staffing challenges.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <HeartHandshake className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--header-blue)' }}>
                  Dr. Michael Thompson
                </h3>
                <p className="text-blue-600 font-medium mb-4">Medical Director</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Practicing GP with 20+ years experience, ensures all placements meet 
                  the highest clinical and professional standards.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Building2 className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--header-blue)' }}>
                  Emma Davies
                </h3>
                <p className="text-blue-600 font-medium mb-4">Operations Director</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Expert in healthcare logistics and compliance, ensures seamless 
                  placements and maintains our 98% satisfaction rating.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold" style={{ color: 'var(--header-blue)' }}>
                Why Practices Choose Us
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-lg" style={{ color: 'var(--header-blue)' }}>
                      Proven Track Record
                    </h4>
                    <p className="text-gray-600">
                      17 years of successful placements with a 98% satisfaction rate from both practices and locums.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-lg" style={{ color: 'var(--header-blue)' }}>
                      Rigorous Vetting Process
                    </h4>
                    <p className="text-gray-600">
                      Every locum undergoes comprehensive checks including GMC registration, DBS clearance, 
                      and professional references.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-lg" style={{ color: 'var(--header-blue)' }}>
                      24/7 Support
                    </h4>
                    <p className="text-gray-600">
                      Round-the-clock support for emergency placements and ongoing assistance 
                      throughout every assignment.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-lg" style={{ color: 'var(--header-blue)' }}>
                      Competitive Rates
                    </h4>
                    <p className="text-gray-600">
                      Transparent pricing with no hidden fees, competitive rates that reflect 
                      the quality of our service.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--header-blue)' }}>
                Our Commitment
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <p className="text-gray-700">Same-day emergency placements available</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <p className="text-gray-700">Full indemnity and compliance support</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <p className="text-gray-700">Ongoing professional development support</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <p className="text-gray-700">Transparent invoicing and payment terms</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <p className="text-gray-700">Dedicated account management</p>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">98%</div>
                  <p className="text-gray-600 text-sm">Client Satisfaction Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#1e2563]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Join Our Network?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Whether you're a practice looking for reliable locum cover or a medical professional 
            seeking flexible opportunities, we're here to help.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/gp-practices">
              <Button size="lg" className="bg-white text-[#1e2563] hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
                For GP Practices
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/gp-locums">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-[#1e2563] px-8 py-3 text-lg">
                For Medical Professionals
                <UserCheck className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-blue-400">
            <p className="text-blue-100">
              <Phone className="inline h-5 w-5 mr-2" />
              Call us: 0800 123 4567
              <span className="mx-4">|</span>
              <Mail className="inline h-5 w-5 mr-2" />
              info@joyjoylocums.co.uk
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}