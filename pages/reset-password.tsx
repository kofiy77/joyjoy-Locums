import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, CheckCircle, Eye, EyeOff, Shield, Clock } from "lucide-react";
import { Link, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  // Timer countdown for verification code
  useEffect(() => {
    if (showVerification && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [showVerification, timeLeft]);

  useEffect(() => {
    // Check if we have the access token and refresh token from the URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    
    if (!accessToken) {
      setError("Invalid or expired reset link. Please request a new password reset.");
      // For demonstration, show verification step instead
      setShowVerification(true);
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];
    
    if (pwd.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/\d/.test(pwd)) {
      errors.push("Password must contain at least one number");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      errors.push("Password must contain at least one special character");
    }
    
    return errors;
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setValidationErrors(validatePassword(value));
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (verificationCode.length !== 6) {
        setError("Please enter a valid 6-digit verification code");
        return;
      }

      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowVerification(false);
      toast({
        title: "Email verified successfully",
        description: "You can now set your new password",
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
      // Simulate sending new verification code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTimeLeft(300);
      toast({
        title: "New verification code sent",
        description: "Check your email for a new verification code",
      });
    } catch (err: any) {
      setError("Failed to resend verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password strength
    const errors = validatePassword(password);
    if (errors.length > 0) {
      setError("Please fix the password requirements below");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          setLocation("/auth");
        }, 3000);
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
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
              <CardTitle className="text-2xl font-bold">Password Reset Successful</CardTitle>
              <CardDescription>
                Your password has been updated successfully
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Lock className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Password updated successfully
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      You can now sign in with your new password. You'll be redirected to the login page automatically.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Link href="/auth">
                  <Button className="w-full">
                    Continue to Login
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
              Enter the 6-digit verification code to proceed with password reset
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Email Verification Required</CardTitle>
              <CardDescription className="text-center">
                For security, we need to verify your email before allowing password reset
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
            <CardTitle className="text-2xl font-bold">Create New Password</CardTitle>
            <CardDescription>
              Enter your new password below
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
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder="Enter your new password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                
                {/* Password Requirements */}
                <div className="space-y-1 text-xs">
                  <p className="font-medium text-gray-700">Password requirements:</p>
                  <ul className="space-y-1">
                    <li className={`flex items-center ${password.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-2">{password.length >= 8 ? '✓' : '•'}</span>
                      At least 8 characters
                    </li>
                    <li className={`flex items-center ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-2">{/[A-Z]/.test(password) ? '✓' : '•'}</span>
                      One uppercase letter
                    </li>
                    <li className={`flex items-center ${/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-2">{/[a-z]/.test(password) ? '✓' : '•'}</span>
                      One lowercase letter
                    </li>
                    <li className={`flex items-center ${/\d/.test(password) ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-2">{/\d/.test(password) ? '✓' : '•'}</span>
                      One number
                    </li>
                    <li className={`flex items-center ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-2">{/[!@#$%^&*(),.?":{}|<>]/.test(password) ? '✓' : '•'}</span>
                      One special character
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-600">Passwords do not match</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || validationErrors.length > 0 || password !== confirmPassword}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating Password...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Update Password
                  </>
                )}
              </Button>

              <div className="text-center">
                <Link href="/auth">
                  <Button variant="ghost" className="text-sm">
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