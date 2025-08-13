import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CheckCircle, Mail, Key } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const setupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type SetupFormData = z.infer<typeof setupSchema>;

export default function PortalSetup() {
  const [setupComplete, setSetupComplete] = useState(false);
  const { toast } = useToast();

  const form = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const setupPortalAccess = useMutation({
    mutationFn: async (data: SetupFormData) => {
      const response = await fetch('/api/staff/setup-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create portal access. Please try again.');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setSetupComplete(true);
      toast({
        title: "Portal Access Setup Complete",
        description: "You can now login to the staff portal with your credentials."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Setup Failed",
        description: error.message || "Please check your email address and try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: SetupFormData) => {
    setupPortalAccess.mutate(data);
  };

  if (setupComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">Setup Complete!</CardTitle>
            <CardDescription>
              Your portal access has been successfully configured.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-800">Next Steps:</h3>
              <ul className="mt-2 text-sm text-green-700 space-y-1">
                <li>• Use your email and password to login</li>
                <li>• Complete your profile information</li>
                <li>• Upload required documents</li>
                <li>• Start receiving shift assignments</li>
              </ul>
            </div>
            <Button 
              onClick={() => window.location.href = '/auth'} 
              className="w-full"
            >
              Go to Portal Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Key className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Setup Portal Access</CardTitle>
          <CardDescription>
            Complete your registration by setting up access to the staff portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Enter your registration email" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-muted-foreground">
                      Use the same email from your registration
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Create Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Create a secure password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Confirm your password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Password Requirements:</strong><br/>
                  • At least 8 characters<br/>
                  • One uppercase and lowercase letter<br/>
                  • One number and one special character
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={setupPortalAccess.isPending}
              >
                {setupPortalAccess.isPending ? "Setting up..." : "Complete Setup"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}