import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  CheckCircle, 
  Gift, 
  Calendar,
  Clock,
  Users,
  Shield,
  Star,
  Heart,
  Building2,
  Sparkles,
  TrendingUp,
  Award,
  ChevronRight,
  HeartHandshake
} from "lucide-react";

export default function Promotions() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: "Care Home Manager",
      facility: "Meadowbrook Residential Care",
      quote: "The 50% discount on our first shift let us test JoyJoy Care at half the cost. We were so impressed with the quality of staff that we've been using them weekly ever since.",
      rating: 5
    },
    {
      name: "David Thompson", 
      role: "Operations Director",
      facility: "Sunset Manor Nursing Home",
      quote: "Getting 50% off our first shift gave us confidence to try something new. The matching system found us exactly the right nurse for our dementia unit.",
      rating: 5
    },
    {
      name: "Emma Wilson",
      role: "Administrator", 
      facility: "Oakwood Care Services",
      quote: "We saved £140 with 50% off our first shift and found a Healthcare Assistant who now works with us regularly. Best decision we made this year!",
      rating: 5
    }
  ];

  const benefits = [
    {
      icon: Gift,
      title: "First Shift 50% Off",
      description: "No hidden costs, no setup fees. Get 50% off your first qualified staff member.",
      value: "Save up to £175"
    },
    {
      icon: Clock,
      title: "Same-Day Placement",
      description: "Emergency cover or planned shifts - we match you with qualified staff within hours.",
      value: "Available 24/7"
    },
    {
      icon: Shield,
      title: "Pre-Vetted Professionals",
      description: "All staff are DBS checked, right-to-work verified, and qualification certified.",
      value: "100% Verified"
    },
    {
      icon: TrendingUp,
      title: "Fair Pricing Always",
      description: "Transparent rates with no markup surprises. Pay only for the hours worked.",
      value: "No Hidden Fees"
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Quick Registration",
      description: "Complete our simple 3-minute care home registration form",
      icon: Building2
    },
    {
      number: "2", 
      title: "Post Your First Shift",
      description: "Tell us what type of staff you need and when you need them",
      icon: Calendar
    },
    {
      number: "3",
      title: "Get Matched Instantly",
      description: "Our algorithm finds the perfect qualified staff member for your needs",
      icon: Users
    },
    {
      number: "4",
      title: "Staff Arrives Ready",
      description: "Get 50% off your first shift booking - pay half price to test our service",
      icon: Gift
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  // SVG Infographic Component
  const SavingsInfographic = () => (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 text-center">
      <div className="relative">
        {/* Main Circle */}
        <div className="w-48 h-48 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-xl">
          <div className="text-center text-white">
            <div className="text-4xl font-bold">50%</div>
            <div className="text-lg">OFF</div>
            <div className="text-sm opacity-90">First Shift</div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-4 left-8 bg-white rounded-full p-3 shadow-lg">
          <Gift className="h-6 w-6 text-green-500" />
        </div>
        <div className="absolute top-12 right-12 bg-white rounded-full p-3 shadow-lg">
          <Star className="h-6 w-6 text-yellow-500" />
        </div>
        <div className="absolute bottom-16 left-4 bg-white rounded-full p-3 shadow-lg">
          <Heart className="h-6 w-6 text-red-500" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Zero Risk Trial</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Experience premium care staffing with no upfront investment. 
          Your first shift is 50% off to prove our quality.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-32">
            <Link href="/">
              <div className="flex items-center cursor-pointer" style={{ color: 'var(--header-blue)' }}>
                <HeartHandshake className="h-12 w-12 mr-3 text-white" />
                <span className="text-2xl font-bold">JoyJoy Locums</span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
              <Link href="/care-home-enquiry">
                <Button className="bg-green-600 hover:bg-green-700">
                  Get 50% Off First Shift
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-8 w-8 text-yellow-300" />
                <Badge className="bg-yellow-400 text-yellow-900 font-semibold text-lg px-4 py-2">
                  LIMITED TIME OFFER
                </Badge>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Your First Shift is
                <span className="text-yellow-300 block">50% OFF</span>
              </h1>
              
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Experience premium care staffing at half the cost. Get qualified, 
                DBS-checked care professionals delivered to your facility with 50% savings on your first shift.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/care-home-enquiry">
                  <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold text-lg px-8 py-4">
                    <Gift className="h-5 w-5 mr-2" />
                    Get 50% Off First Shift
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  className="!bg-transparent !border-2 !border-white !text-white hover:!bg-white hover:!text-green-600 !font-semibold !text-lg !px-8 !py-4 transition-all duration-200"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Learn More
                </Button>
              </div>
              
              <div className="flex items-center gap-6 text-white/80">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span>No Setup Fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span>No Contracts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span>No Risk</span>
                </div>
              </div>
            </div>
            
            <div className="lg:pl-8">
              <SavingsInfographic />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get 50% Off Your First Shift in 4 Simple Steps
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From registration to having qualified staff at your door - the entire process takes less than 24 hours
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="h-full border-2 hover:border-green-300 transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-white">{step.number}</span>
                    </div>
                    <step.icon className="h-8 w-8 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </CardContent>
                </Card>
                
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ChevronRight className="h-8 w-8 text-green-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose JoyJoy Care?
            </h2>
            <p className="text-xl text-gray-600">
              More than just 50% savings - it's a gateway to reliable, professional care staffing
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-2 hover:border-green-300 transition-all hover:shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{benefit.title}</h3>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {benefit.value}
                        </Badge>
                      </div>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Carousel */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Care Home Managers Say
            </h2>
            <p className="text-xl text-gray-600">
              Real feedback from care homes who got 50% off their first shift
            </p>
          </div>
          
          <div className="relative">
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="flex justify-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  <blockquote className="text-xl text-gray-700 italic mb-6 leading-relaxed">
                    "{testimonials[currentTestimonial].quote}"
                  </blockquote>
                  
                  <div>
                    <div className="font-semibold text-lg text-gray-900">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-green-600 font-medium">
                      {testimonials[currentTestimonial].role}
                    </div>
                    <div className="text-gray-600">
                      {testimonials[currentTestimonial].facility}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Testimonial Indicators */}
            <div className="flex justify-center mt-6 gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial 
                      ? 'bg-green-600' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-emerald-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12">
            <Sparkles className="h-16 w-16 text-yellow-300 mx-auto mb-6" />
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Save £175 on Your First Shift?
            </h2>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto">
              Join hundreds of care homes who've discovered reliable, professional staffing with zero risk. 
              Your first qualified staff member is 50% off.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link href="/care-home-enquiry">
                <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold text-xl px-12 py-6">
                  <Gift className="h-6 w-6 mr-3" />
                  Claim Your 50% Discount Now
                  <ArrowRight className="h-6 w-6 ml-3" />
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-white/80">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-300" />
                <span>Rated 4.9/5 by care homes</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-300" />
                <span>500+ qualified staff ready</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-300" />
                <span>24/7 support available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <HeartHandshake className="h-10 w-10 text-white" />
              <span className="text-xl font-bold">JoyJoy Locums</span>
            </div>
            <p className="text-gray-400 mb-4">
              Professional medical locum staffing for GPs and Nurse Practitioners
            </p>
            <div className="text-gray-400 text-sm mb-6 space-y-1">
              <p>185 Mount Pleasant Lane, London, E5 9JG</p>
              <p>Phone: 01293660094 | Email: info@joyjoycare.co.uk</p>
            </div>
            <div className="flex justify-center gap-8 text-sm text-gray-400">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Link href="/care-home-enquiry" className="hover:text-white transition-colors">Get Started</Link>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
              <a href="#terms" className="hover:text-white transition-colors">Terms</a>
            </div>
            <div className="text-sm text-gray-400 mt-4 space-y-1">
              <p>VAT Registration No: GB494539249</p>
              <p>ICO Registration No: 00010487221</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}