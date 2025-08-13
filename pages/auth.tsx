import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { Eye, EyeOff, HeartHandshake } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();



  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onLogin = async (data: LoginData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      // Don't manually redirect - let RoleBasedRedirect handle it
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, var(--medical-blue-50) 0%, var(--medical-blue-100) 100%)' }}>
      <div className="max-w-md w-full space-y-8">
        {/* Back to Website Link */}
        <div className="text-center">
          <Link href="/">
            <Button variant="ghost" size="sm" style={{ color: 'var(--medical-blue-600)' }} className="hover:bg-white/50">
              ← Back to Website
            </Button>
          </Link>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center" style={{ color: 'var(--header-blue)' }}>
              <HeartHandshake className="h-12 w-12 mr-3 text-blue-600" />
              <span className="text-3xl font-bold">JoyJoy Locums</span>
            </div>
          </div>
          <p className="text-gray-600" style={{ color: 'var(--medical-blue-600)' }}>Professional Medical Locum Platform</p>
        </div>

        <Card className="healthcare-shadow">
          <CardHeader>
            <CardTitle className="text-center">Portal Login</CardTitle>
          </CardHeader>
          <CardContent>


            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...loginForm.register("email")}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...loginForm.register("password")}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
              
              <div className="text-center">
                <Link href="/forgot-password">
                  <Button variant="link" className="text-sm text-primary hover:underline p-0">
                    Forgot your password?
                  </Button>
                </Link>
              </div>
            </form>

            {/* Registration Alternative */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">New to JoyJoy Locums?</p>
                <div className="space-y-2">
                  <Link href="/register">
                    <Button variant="outline" className="w-full" style={{ borderColor: 'var(--medical-blue-300)', color: 'var(--medical-blue-600)' }}>
                      Join as GP/Nurse Practitioner
                    </Button>
                  </Link>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  For practice enquiries, contact us directly at info@joyjoylocums.co.uk
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
