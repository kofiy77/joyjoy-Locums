import { Link } from "wouter";
import { ArrowLeft, ExternalLink, Award, Clock, Users, BookOpen, Shield, Heart, ChevronRight, Star, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TrainingCentre() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  const essentialCourses = [
    {
      title: "Moving and Handling",
      duration: "4 hours",
      type: "Mandatory",
      description: "Safe manual handling techniques to prevent injury to staff and residents",
      providers: ["Skills for Care", "Care Academy", "NHC Training"],
      illustration: (
        <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" fill="#e0f2fe" stroke="#0891b2" strokeWidth="2"/>
          <path d="M20 35c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="#0891b2" strokeWidth="2" fill="none"/>
          <circle cx="32" cy="23" r="3" fill="#0891b2"/>
          <path d="M28 40h8v8h-8z" fill="#0891b2" opacity="0.7"/>
          <path d="M24 44l8-4v8l-8 4z" fill="#f59e0b" opacity="0.8"/>
        </svg>
      )
    },
    {
      title: "Safeguarding Adults",
      duration: "3 hours", 
      type: "Mandatory",
      description: "Protecting vulnerable adults from abuse and neglect",
      providers: ["SCIE", "Care Academy", "Safeguarding Adults Training"],
      illustration: (
        <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2"/>
          <path d="M32 12l8 6v16c0 8-8 12-8 12s-8-4-8-12V18l8-6z" fill="#f59e0b" opacity="0.8"/>
          <path d="M28 28l4 4 8-8" stroke="white" strokeWidth="2" fill="none"/>
        </svg>
      )
    },
    {
      title: "Health and Safety",
      duration: "2 hours",
      type: "Mandatory", 
      description: "Workplace safety regulations and risk assessment",
      providers: ["RoSPA", "IOSH", "Care Quality Training"],
      illustration: (
        <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" fill="#fef2f2" stroke="#dc2626" strokeWidth="2"/>
          <path d="M20 44h24v4H20z" fill="#dc2626"/>
          <circle cx="32" cy="30" r="8" fill="none" stroke="#dc2626" strokeWidth="2"/>
          <path d="M28 30l3 3 6-6" stroke="#dc2626" strokeWidth="2" fill="none"/>
          <rect x="30" y="16" width="4" height="8" fill="#dc2626"/>
        </svg>
      )
    },
    {
      title: "Fire Safety",
      duration: "2 hours",
      type: "Mandatory",
      description: "Fire prevention, evacuation procedures, and equipment use",
      providers: ["Fire Safety Training", "RoSPA", "Care Academy"],
      illustration: (
        <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" fill="#fef2f2" stroke="#ef4444" strokeWidth="2"/>
          <path d="M32 16c-4 0-8 4-8 8 0 4 2 6 4 8 1 1 2 2 2 4h4c0-2 1-3 2-4 2-2 4-4 4-8 0-4-4-8-8-8z" fill="#ef4444"/>
          <path d="M28 40h8v4h-8z" fill="#ef4444" opacity="0.7"/>
          <path d="M30 44h4v2h-4z" fill="#ef4444"/>
        </svg>
      )
    },
    {
      title: "Food Hygiene",
      duration: "3 hours",
      type: "Essential",
      description: "Safe food handling and preparation in care settings",
      providers: ["CIEH", "Highfield Qualifications", "Food Safety Training"],
      illustration: (
        <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" fill="#f0fdf4" stroke="#16a34a" strokeWidth="2"/>
          <path d="M20 38h24v8H20z" fill="#16a34a" opacity="0.8"/>
          <circle cx="26" cy="28" r="3" fill="#16a34a"/>
          <circle cx="32" cy="26" r="2" fill="#16a34a"/>
          <circle cx="38" cy="30" r="2.5" fill="#16a34a"/>
          <path d="M24 35h16v2H24z" fill="#16a34a"/>
        </svg>
      )
    },
    {
      title: "Infection Control",
      duration: "2 hours", 
      type: "Mandatory",
      description: "Preventing spread of infections in care environments",
      providers: ["Skills for Care", "Care Academy", "IPC Training"],
      illustration: (
        <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" fill="#f0f9ff" stroke="#0284c7" strokeWidth="2"/>
          <circle cx="32" cy="32" r="12" fill="none" stroke="#0284c7" strokeWidth="2"/>
          <circle cx="32" cy="32" r="6" fill="#0284c7" opacity="0.3"/>
          <path d="M32 20v-4M44 32h4M32 44v4M20 32h-4" stroke="#0284c7" strokeWidth="2"/>
          <path d="M41.4 22.6l2.8-2.8M41.4 41.4l2.8 2.8M22.6 41.4l-2.8 2.8M22.6 22.6l-2.8-2.8" stroke="#0284c7" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: "Medication Administration",
      duration: "6 hours",
      type: "Specialist",
      description: "Safe handling and administration of medications",
      providers: ["Care Academy", "NHC Training", "Medication Training UK"],
      illustration: (
        <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" fill="#faf5ff" stroke="#7c3aed" strokeWidth="2"/>
          <rect x="24" y="20" width="16" height="24" rx="2" fill="#7c3aed" opacity="0.8"/>
          <circle cx="32" cy="28" r="2" fill="white"/>
          <rect x="28" y="34" width="8" height="2" fill="white"/>
          <rect x="28" y="38" width="8" height="2" fill="white"/>
          <path d="M30 26v4M34 26v4" stroke="white" strokeWidth="1"/>
        </svg>
      )
    },
    {
      title: "Mental Health Awareness",
      duration: "4 hours",
      type: "Essential",
      description: "Understanding and supporting mental health conditions",
      providers: ["Mind", "Mental Health First Aid", "Care Academy"],
      illustration: (
        <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" fill="#fef7cd" stroke="#eab308" strokeWidth="2"/>
          <circle cx="32" cy="28" r="8" fill="none" stroke="#eab308" strokeWidth="2"/>
          <path d="M25 36c3-2 7-2 10 0 3 2 7 2 10 0" stroke="#eab308" strokeWidth="2" fill="none"/>
          <circle cx="29" cy="25" r="1" fill="#eab308"/>
          <circle cx="35" cy="25" r="1" fill="#eab308"/>
          <path d="M29 31c1 2 3 2 4 0" stroke="#eab308" strokeWidth="2" fill="none"/>
        </svg>
      )
    },
    {
      title: "Dementia Care",
      duration: "6 hours",
      type: "Specialist", 
      description: "Person-centred care for individuals with dementia",
      providers: ["Alzheimer's Society", "Dementia UK", "Skills for Care"],
      illustration: (
        <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" fill="#fdf4ff" stroke="#c026d3" strokeWidth="2"/>
          <path d="M32 16c-8 0-12 6-12 12 0 4 2 7 4 9l8 11 8-11c2-2 4-5 4-9 0-6-4-12-12-12z" fill="#c026d3" opacity="0.8"/>
          <circle cx="32" cy="26" r="4" fill="white"/>
          <path d="M28 44c2-1 4-1 6 0s4 1 6 0" stroke="#c026d3" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: "First Aid",
      duration: "6 hours",
      type: "Essential",
      description: "Emergency first aid in care settings",
      providers: ["British Red Cross", "St John Ambulance", "First Aid Training"],
      illustration: (
        <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" fill="#fef2f2" stroke="#dc2626" strokeWidth="2"/>
          <rect x="28" y="20" width="8" height="24" rx="1" fill="#dc2626"/>
          <rect x="20" y="28" width="24" height="8" rx="1" fill="#dc2626"/>
          <circle cx="32" cy="32" r="16" fill="none" stroke="#dc2626" strokeWidth="2"/>
        </svg>
      )
    }
  ];

  const trainingProviders = [
    {
      name: "Skills for Care",
      website: "https://www.skillsforcare.org.uk",
      description: "The workforce development body for adult social care in England",
      specialties: ["Leadership", "Core Skills", "Specialist Care"],
      rating: 5,
      accreditation: "Government Approved",
      logo: (
        <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" fill="#1e40af" stroke="#1e40af" strokeWidth="2"/>
          <path d="M16 20h16v12H16z" fill="white" opacity="0.9"/>
          <circle cx="20" cy="26" r="2" fill="#1e40af"/>
          <circle cx="28" cy="26" r="2" fill="#1e40af"/>
          <path d="M18 30c2-1 4-1 6 0s4 1 6 0" stroke="#1e40af" strokeWidth="2" fill="none"/>
        </svg>
      )
    },
    {
      name: "Care Academy",
      website: "https://www.careacademy.co.uk", 
      description: "Comprehensive online training platform for care professionals",
      specialties: ["Mandatory Training", "CPD", "Management Development"],
      rating: 4.8,
      accreditation: "CPD Certified",
      logo: (
        <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" fill="#059669" stroke="#059669" strokeWidth="2"/>
          <path d="M16 18h16v4H16z" fill="white"/>
          <path d="M16 24h16v4H16z" fill="white" opacity="0.8"/>
          <path d="M16 30h12v4H16z" fill="white" opacity="0.6"/>
          <circle cx="32" cy="32" r="2" fill="white"/>
        </svg>
      )
    },
    {
      name: "SCIE (Social Care Institute for Excellence)",
      website: "https://www.scie.org.uk",
      description: "Leading provider of evidence-based social care training",
      specialties: ["Safeguarding", "Research", "Best Practice"],
      rating: 5,
      accreditation: "Government Endorsed",
      logo: (
        <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" fill="#7c3aed" stroke="#7c3aed" strokeWidth="2"/>
          <path d="M24 12l8 6v16c0 6-8 10-8 10s-8-4-8-10V18l8-6z" fill="white"/>
          <path d="M20 22l3 3 6-6" stroke="#7c3aed" strokeWidth="2" fill="none"/>
        </svg>
      )
    },
    {
      name: "British Red Cross",
      website: "https://www.redcross.org.uk/first-aid",
      description: "Trusted provider of first aid and emergency training",
      specialties: ["First Aid", "Emergency Response", "Health & Safety"],
      rating: 4.9,
      accreditation: "Ofqual Regulated",
      logo: (
        <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" fill="#dc2626" stroke="#dc2626" strokeWidth="2"/>
          <rect x="20" y="12" width="8" height="24" fill="white"/>
          <rect x="12" y="20" width="24" height="8" fill="white"/>
        </svg>
      )
    },
    {
      name: "NHC Training Solutions",
      website: "https://www.nhctraining.co.uk",
      description: "Healthcare and social care training specialists",
      specialties: ["Clinical Skills", "Medication", "Infection Control"],
      rating: 4.7,
      accreditation: "Skills for Health Approved",
      logo: (
        <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" fill="#0891b2" stroke="#0891b2" strokeWidth="2"/>
          <path d="M18 18v12h4V18h4v12h4V18" stroke="white" strokeWidth="2" fill="none"/>
          <circle cx="24" cy="32" r="3" fill="white"/>
        </svg>
      )
    },
    {
      name: "Alzheimer's Society",
      website: "https://www.alzheimers.org.uk/get-involved/learning",
      description: "Leading dementia care training and support",
      specialties: ["Dementia Care", "Person-Centred Care", "Family Support"],
      rating: 4.9,
      accreditation: "Quality Mark Certified",
      logo: (
        <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" fill="#c026d3" stroke="#c026d3" strokeWidth="2"/>
          <path d="M24 12c-6 0-10 4-10 10 0 3 1 5 3 7l7 9 7-9c2-2 3-4 3-7 0-6-4-10-10-10z" fill="white"/>
          <circle cx="24" cy="20" r="3" fill="#c026d3"/>
        </svg>
      )
    },
    {
      name: "St John Ambulance",
      website: "https://www.sja.org.uk/training",
      description: "Nation's leading first aid training charity",
      specialties: ["First Aid", "Mental Health First Aid", "Workplace Training"],
      rating: 4.8,
      accreditation: "Ofqual Regulated",
      logo: (
        <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" fill="#16a34a" stroke="#16a34a" strokeWidth="2"/>
          <rect x="20" y="14" width="8" height="20" fill="white"/>
          <rect x="14" y="20" width="20" height="8" fill="white"/>
          <path d="M24 10l4 4-4 4-4-4z" fill="white"/>
        </svg>
      )
    },
    {
      name: "RoSPA (Royal Society for Prevention of Accidents)",
      website: "https://www.rospa.com/training",
      description: "Health and safety training experts since 1916",
      specialties: ["Health & Safety", "Risk Assessment", "Fire Safety"],
      rating: 4.6,
      accreditation: "Government Recognised",
      logo: (
        <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" fill="#f59e0b" stroke="#f59e0b" strokeWidth="2"/>
          <path d="M24 12l6 8H18l6-8z" fill="white"/>
          <rect x="22" y="20" width="4" height="8" fill="white"/>
          <circle cx="24" cy="32" r="2" fill="white"/>
        </svg>
      )
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Mandatory": return "bg-red-100 text-red-800";
      case "Essential": return "bg-orange-100 text-orange-800";
      case "Specialist": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

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
              <HeartHandshake className="h-12 w-12 text-gray-900" />
              <span className="text-xl font-bold text-gray-900">Training Centre</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="gradient-primary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Professional Care Training Centre
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Access comprehensive training from the UK's leading care education providers. 
              Stay compliant, enhance your skills, and advance your career in healthcare.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="btn-joyjoy btn-secondary-joyjoy"
                onClick={() => scrollToSection('courses-section')}
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Browse Courses
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                onClick={() => scrollToSection('providers-section')}
              >
                <Users className="mr-2 h-5 w-5" />
                Find Training Providers
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10+</div>
              <div className="text-gray-600">Essential Courses</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">8</div>
              <div className="text-gray-600">Approved Providers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-gray-600">UK Compliant</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Access Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Essential Training Courses */}
      <section id="courses-section" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Essential Care Training Courses</h2>
            <p className="text-xl text-gray-600">
              Comprehensive training coverage for full compliance and professional development
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {essentialCourses.map((course, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow overflow-hidden">
                <CardHeader className="text-center pb-4">
                  {course.illustration}
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <Badge className={getTypeColor(course.type)}>
                      {course.type}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-center text-sm text-gray-500 space-x-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {course.duration}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Available from:</h4>
                    <div className="flex flex-wrap gap-2">
                      {course.providers.map((provider, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {provider}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Training Providers */}
      <section id="providers-section" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Approved Training Providers</h2>
            <p className="text-xl text-gray-600">
              Partner with the UK's most trusted care training organizations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {trainingProviders.map((provider, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0">
                      {provider.logo}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-xl">{provider.name}</CardTitle>
                        <div className="flex items-center">
                          {[...Array(Math.floor(provider.rating))].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                          ))}
                          <span className="ml-2 text-sm text-gray-600">{provider.rating}</span>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 w-fit">
                        {provider.accreditation}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{provider.description}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Specialties:</h4>
                      <div className="flex flex-wrap gap-2">
                        {provider.specialties.map((specialty, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => window.open(provider.website, '_blank')}
                    >
                      Visit Website
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Information */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-50 rounded-2xl p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <Shield className="h-16 w-16 text-blue-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-6">Stay Compliant with UK Regulations</h2>
              <p className="text-lg text-gray-700 mb-8">
                All training courses listed meet or exceed UK health and social care regulations. 
                Regular updates ensure compliance with Care Quality Commission (CQC) requirements 
                and Skills for Care standards.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="flex items-start space-x-3">
                  <Award className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Accredited Programs</h3>
                    <p className="text-sm text-gray-600">All courses from government-approved providers</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Certificate Tracking</h3>
                    <p className="text-sm text-gray-600">Automatic renewal reminders and tracking</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Heart className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Career Development</h3>
                    <p className="text-sm text-gray-600">Progressive learning paths for advancement</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-primary py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Advance Your Care Career?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of care professionals who have enhanced their skills through our training partners.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="btn-joyjoy btn-secondary-joyjoy">
                Join JoyJoy Care
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}