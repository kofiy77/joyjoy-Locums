import { CheckCircle, Mail, ArrowRight, Home, HeartHandshake, Clock, Shield, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';


export default function RegistrationSuccess() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, var(--medical-blue-50) 0%, var(--medical-blue-100) 100%)' }}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-4xl shadow-2xl border-0">
          <CardHeader className="text-center space-y-6" style={{ backgroundColor: 'var(--medical-blue-50)' }}>
            {/* JoyJoy Locums Logo */}
            <div className="flex justify-center mb-4">
              <div className="text-blue-900 font-bold text-4xl flex items-center">
                <HeartHandshake className="h-12 w-12 mr-3" />
                JoyJoy Locums
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
            </div>
            
            <div>
              <CardTitle className="text-4xl font-bold mb-3" style={{ color: 'var(--header-blue)' }}>
                Registration Successful!
              </CardTitle>
              <CardDescription className="text-xl text-gray-600">
                Welcome to JoyJoy Locums - Your professional medical profile has been submitted
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 p-8">
          {/* What Happens Next */}
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--medical-blue-50)' }}>
            <h3 className="font-semibold mb-4 flex items-center" style={{ color: 'var(--header-blue)' }}>
              <Clock className="w-5 h-5 mr-2" />
              What happens next?
            </h3>
            <div className="space-y-4" style={{ color: 'var(--header-blue)' }}>
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-0.5" 
                     style={{ backgroundColor: 'var(--medical-blue-200)', color: 'var(--header-blue)' }}>
                  1
                </div>
                <div>
                  <p className="font-medium">Email Verification</p>
                  <p className="text-gray-600 text-sm">Check your email for portal setup instructions and verification link</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-0.5" 
                     style={{ backgroundColor: 'var(--medical-blue-200)', color: 'var(--header-blue)' }}>
                  2
                </div>
                <div>
                  <p className="font-medium">Document Upload</p>
                  <p className="text-gray-600 text-sm">Upload required compliance documents (DBS, Right to Work, Professional Registration)</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-0.5" 
                     style={{ backgroundColor: 'var(--medical-blue-200)', color: 'var(--header-blue)' }}>
                  3
                </div>
                <div>
                  <p className="font-medium">Verification Process</p>
                  <p className="text-gray-600 text-sm">Our compliance team will verify your documents within 24-48 hours</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-0.5" 
                     style={{ backgroundColor: 'var(--medical-blue-200)', color: 'var(--header-blue)' }}>
                  4
                </div>
                <div>
                  <p className="font-medium">Start Working</p>
                  <p className="text-gray-600 text-sm">Browse and apply for locum shifts across UK GP practices</p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-amber-50 rounded-lg p-6 border-l-4 border-amber-400">
            <h3 className="font-semibold text-amber-900 mb-3 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Registration Status
            </h3>
            <p className="text-amber-800 mb-2">
              Your registration status is currently <span className="font-semibold">"Pending Documents"</span>. 
            </p>
            <p className="text-amber-700 text-sm">
              You'll have limited access to the portal until all required documents are verified and approved by our compliance team.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button asChild className="flex-1" style={{ backgroundColor: 'var(--medical-blue-600)' }}>
              <Link href="/auth">
                <UserCheck className="w-4 h-4 mr-2" />
                Access Portal Login
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="flex-1" style={{ borderColor: 'var(--medical-blue-600)', color: 'var(--header-blue)' }}>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Return to Homepage
              </Link>
            </Button>
          </div>

          {/* Support Information */}
          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@joyjoylocums.co.uk" className="hover:underline" style={{ color: 'var(--medical-blue-600)' }}>
                support@joyjoylocums.co.uk
              </a>
            </p>
          </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}