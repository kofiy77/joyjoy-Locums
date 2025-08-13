import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, ArrowLeft, CheckCircle, Shield, Clock } from "lucide-react";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const { toast } = useToast();

  // Timer countdown for verification code
  useEffect(() => {
    if (showVerification && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [showVerification, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Send verification email with 2FA code
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setShowVerification(true);
        setTimeLeft(300); // Reset timer
        toast({
          title: "Verification code sent",
          description: "Check your email for the 6-digit verification code",
        });
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Simulate verification process
      if (verificationCode.length !== 6) {
        setError("Please enter a valid 6-digit code");
        return;
      }

      // In a real implementation, verify the code with backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setShowVerification(false);
      toast({
        title: "Email verified successfully",
        description: "You can now reset your password using the link in your email",
      });
    } catch (err: any) {
      setError("Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setTimeLeft(300);
        toast({
          title: "New verification code sent",
          description: "Check your email for a new verification code",
        });
      }
    } catch (err: any) {
      setError("Failed to resend verification code");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
              <CardDescription>
                We've sent a password reset link to your email address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Password reset email sent
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      Check your inbox at <strong>{email}</strong> and click the reset link to continue.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 space-y-2">
                <p>• The reset link will expire in 1 hour</p>
                <p>• Check your spam folder if you don't see the email</p>
                <p>• You can close this window and return when you're ready</p>
              </div>

              <div className="pt-4 space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSuccess(false);
                    setEmail("");
                  }}
                >
                  Send Another Reset Email
                </Button>
                
                <Link href="/auth">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Verification code interface
  if (showVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-blue-600" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Verify Your Email</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter the 6-digit verification code sent to <span className="font-medium">{email}</span>
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Email Verification</CardTitle>
              <CardDescription className="text-center">
                This adds an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert>
                  <AlertDescription className="text-red-600">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleVerificationSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="verification-code">Verification Code</Label>
                  <Input
                    id="verification-code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-lg tracking-widest font-mono"
                    maxLength={6}
                    required
                  />
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>Code expires in {formatTime(timeLeft)}</span>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || verificationCode.length !== 6 || timeLeft === 0}
                >
                  {loading ? "Verifying..." : "Verify Email"}
                </Button>
              </form>

              <div className="text-center space-y-3">
                <Button
                  type="button"
                  variant="link"
                  className="text-sm"
                  onClick={resendCode}
                  disabled={loading || timeLeft > 240} // Allow resend after 1 minute
                >
                  {timeLeft > 240 ? `Resend available in ${formatTime(timeLeft - 240)}` : "Resend verification code"}
                </Button>
                
                <div>
                  <Link href="/auth">
                    <Button variant="ghost" className="text-sm">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending Reset Link...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Reset Link
                  </>
                )}
              </Button>

              <div className="text-center">
                <Link href="/auth">
                  <Button variant="ghost" className="text-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-600">
          <p>Remember your password? <Link href="/auth" className="font-medium text-primary hover:underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}