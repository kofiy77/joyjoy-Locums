import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Clock, 
  MapPin, 
  Star,
  Users,
  Calendar,
  CreditCard,
  Shield,
  CheckCircle,
  HeartHandshake
} from "lucide-react";

export default function GPLocumsPage() {
  const benefits = [
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Flexible Scheduling",
      description: "Choose your own hours and work-life balance with shifts that fit your lifestyle."
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Competitive Rates",
      description: "Premium pay rates with weekly payments and transparent fee structure."
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Local Opportunities",
      description: "Find positions close to home with practices across the UK."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Full Support",
      description: "Comprehensive indemnity, professional development, and 24/7 support."
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Williams",
      location: "Manchester",
      quote: "JoyJoy Locums has transformed my career flexibility. Professional practices and excellent support.",
      rating: 5
    },
    {
      name: "Dr. James Mitchell",
      location: "London",
      quote: "The quality of practices and transparent communication makes this the best locum platform.",
      rating: 5
    }
  ];

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
              <Link href="/gp-locums" className="text-white font-medium border-b-2 border-white pb-1">
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

      {/* Hero Section - Full Width with Background Image */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden bg-cover bg-center bg-no-repeat" 
               style={{ 
                 backgroundImage: `linear-gradient(rgba(30, 37, 99, 0.7), rgba(30, 37, 99, 0.7)), url('/attached_assets/shutterstock_430385620_1753232327688.jpg')`,
                 backgroundPosition: 'center center',
                 backgroundSize: 'cover'
               }}>
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <div className="space-y-8">
                <div className="space-y-6">
                  <Badge className="bg-blue-100 text-blue-900 px-4 py-2 text-sm font-medium">
                    GP Locum Opportunities
                  </Badge>
                  <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-white">
                    UK-leading<br />
                    <span className="text-white">GP locum</span><br />
                    opportunities
                  </h1>
                  <p className="text-xl text-gray-200 leading-relaxed max-w-xl">
                    Dedicated to improving patient outcomes through exceptional medical practice
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/register">
                    <Button 
                      size="lg" 
                      className="px-8 py-4 text-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 hover:shadow-lg"
                    >
                      Register today
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#1e2563] mb-4">
              Why Choose JoyJoy Locums for GP Work?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Dedicated services built to support your GP career and all the choices you want to make.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-[#1e2563] mb-4">
                    {benefit.icon}
                  </div>
                  <CardTitle className="text-[#1e2563] text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20" style={{ backgroundColor: '#f8faff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#1e2563] mb-4">
              How It Works for GPs
            </h2>
            <p className="text-xl text-gray-600">
              Start your GP locum journey in 4 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Register", description: "Complete your professional profile with GMC registration and experience" },
              { step: "2", title: "Verify", description: "We verify your credentials and arrange professional indemnity" },
              { step: "3", title: "Browse", description: "Access exclusive GP positions with detailed practice information" },
              { step: "4", title: "Work", description: "Start working with full support and weekly payments" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-[#1e2563] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-[#1e2563] mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#1e2563] mb-4">
              What GP Locums Say About Us
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-lg italic text-gray-700 mb-4">
                    "{testimonial.quote}"
                  </blockquote>
                  <div>
                    <div className="font-semibold text-[#1e2563]">{testimonial.name}</div>
                    <div className="text-gray-600">{testimonial.location}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#1e2563]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your GP Locum Career?
          </h2>
          <p className="text-xl text-blue-200 mb-8">
            Join hundreds of GPs who have found flexible, rewarding work through JoyJoy Locums
          </p>
          <Link href="/register">
            <Button 
              size="lg" 
              className="px-8 py-4 text-lg font-semibold bg-white text-[#1e2563] hover:bg-blue-50 transition-all duration-300"
            >
              Register as a GP Locum
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1e2563] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center">
                <HeartHandshake className="h-8 w-8 mr-3 text-white" />
                <span className="text-2xl font-bold">JoyJoy Locums</span>
              </div>
              <p className="text-blue-200">
                Professional medical staffing solutions for GPs and Nurse Practitioners across the UK.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">For Medical Professionals</h3>
              <ul className="space-y-2 text-blue-200">
                <li><Link href="/gp-locums" className="hover:text-white transition-colors">GP Locums</Link></li>
                <li><Link href="/nurse-practitioner-locums" className="hover:text-white transition-colors">Nurse Practitioner Locums</Link></li>
                <li><Link href="/auth" className="hover:text-white transition-colors">Professional Portal</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">For Practices</h3>
              <ul className="space-y-2 text-blue-200">
                <li><Link href="/gp-practice-enquiry" className="hover:text-white transition-colors">Hire Locums</Link></li>
                <li><Link href="/auth" className="hover:text-white transition-colors">Practice Portal</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-blue-200">
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li className="hover:text-white transition-colors">support@joyjoylocums.com</li>
                <li className="hover:text-white transition-colors">0800 123 4567</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-blue-800 mt-12 pt-8 text-center text-blue-200">
            <p>&copy; 2025 JoyJoy Locums. Professional medical staffing solutions.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}