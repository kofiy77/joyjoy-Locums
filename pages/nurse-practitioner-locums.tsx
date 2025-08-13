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
  Heart,
  UserCheck,
  HeartHandshake
} from "lucide-react";

export default function NursePractitionerLocumsPage() {
  const benefits = [
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Patient-Centered Care",
      description: "Work in practices that value comprehensive, compassionate patient care."
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Excellent Compensation",
      description: "Competitive rates for Advanced Nurse Practitioners with weekly payments and bonuses."
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Nationwide Opportunities",
      description: "Positions available across the UK in modern, well-equipped practices."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Professional Development",
      description: "Ongoing training, mentorship, and career advancement opportunities."
    }
  ];

  const testimonials = [
    {
      name: "Emma Rodriguez, NP",
      location: "Birmingham", 
      quote: "The flexibility and support I receive allows me to provide the best patient care while maintaining work-life balance.",
      rating: 5
    },
    {
      name: "Michael Thompson, NP",
      location: "Leeds",
      quote: "Professional practices with excellent teams. JoyJoy Locums understands what Advanced Nurse Practitioners need.",
      rating: 5
    }
  ];

  const specialties = [
    "Family Practice",
    "Urgent Care", 
    "Women's Health",
    "Pediatrics",
    "Geriatrics",
    "Mental Health",
    "Chronic Disease Management",
    "Preventive Care"
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
              <Link href="/gp-locums" className="text-white hover:text-blue-200 transition-colors">
                For GPs
              </Link>
              <Link href="/nurse-practitioner-locums" className="text-white font-medium border-b-2 border-white pb-1">
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
                 backgroundImage: `linear-gradient(rgba(30, 37, 99, 0.7), rgba(30, 37, 99, 0.7)), url('/attached_assets/image_1753233114194.jpeg')`,
                 backgroundPosition: 'center center',
                 backgroundSize: 'cover'
               }}>
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <div className="space-y-8">
                <div className="space-y-6">
                  <Badge className="bg-purple-100 text-purple-900 px-4 py-2 text-sm font-medium">
                    Advanced Nurse Practitioner Opportunities
                  </Badge>
                  <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-white">
                    UK-leading<br />
                    <span className="text-white">Advanced Nurse Practitioner</span><br />
                    opportunities
                  </h1>
                  <p className="text-xl text-gray-200 leading-relaxed max-w-xl">
                    Dedicated to improving patient outcomes through advanced practice nursing excellence
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/register">
                    <Button 
                      size="lg" 
                      className="px-8 py-4 text-lg font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-all duration-300 hover:shadow-lg"
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

      {/* Specialties Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#1e2563] mb-4">
              Specialty Areas for Advanced Nurse Practitioners
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Work across diverse specialty areas with full autonomy and professional support
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {specialties.map((specialty, index) => (
              <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center hover:bg-purple-100 transition-colors">
                <div className="text-purple-700 font-medium">{specialty}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20" style={{ backgroundColor: '#f8faff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#1e2563] mb-4">
              Why Advanced Nurse Practitioners Choose Us
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Dedicated support for your advanced practice career with opportunities that match your expertise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4">
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

      {/* Testimonials Section */}
      <section className="py-20" style={{ backgroundColor: '#1e2563' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              What Our Nurse Practitioners Say
            </h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Real experiences from advanced practice nurses in our network
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-6">"{testimonial.quote}"</p>
                  <div className="border-t pt-4">
                    <div className="font-semibold text-[#1e2563]">{testimonial.name}</div>
                    <div className="text-gray-500 text-sm">{testimonial.location}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-[#1e2563] mb-6">
            Ready to Advance Your Nursing Career?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of Nurse Practitioners who have found rewarding positions through JoyJoy Locums. 
            Start your application today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button 
                size="lg" 
                className="px-8 py-4 text-lg font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-all duration-300"
              >
                Apply Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/gp-practice-enquiry">
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-4 text-lg font-semibold border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition-all duration-300"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <HeartHandshake className="h-8 w-8 mr-3 text-white" />
                <span className="text-2xl font-bold">JoyJoy Locums</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Connecting exceptional Nurse Practitioners with leading GP practices across the UK. 
                Professional excellence, personal support.
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-gray-400">
                  <MapPin className="h-4 w-4 mr-2" />
                  London, United Kingdom
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">For Nurse Practitioners</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/register" className="hover:text-white transition-colors">Register</Link></li>
                <li><Link href="/auth" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/training-centre" className="hover:text-white transition-colors">Training Centre</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">For Practices</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/gp-practice-enquiry" className="hover:text-white transition-colors">Join Our Network</Link></li>
                <li><Link href="/auth" className="hover:text-white transition-colors">Practice Portal</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              © 2025 JoyJoy Locums. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy-policy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}