"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, Loader2, XCircle, Mail, Lock } from "lucide-react";
import { validateEnvironment } from "@/lib/config-validation";
import { ConfigStatus } from "@/components/config-status";
import { login } from "@/app/actions/auth.actions";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [configError, setConfigError] = useState<string | null>(null);

  // Check configuration on mount
  useEffect(() => {
    try {
      const validation = validateEnvironment();
      if (!validation.isValid) {
        setConfigError(`Configuration error: ${validation.errors.join(", ")}`);
        return;
      }
      setConfigError(null);
    } catch (error) {
      setConfigError("Failed to validate Supabase configuration");
    }
  }, []);

  // If there's a configuration error, show it
  if (configError) {
    return (
      <div className='min-h-screen flex items-center justify-center p-4'>
        <div className='w-full max-w-2xl space-y-4'>
          <Card>
            <CardHeader className='text-center'>
              <div className='flex items-center justify-center mb-4'>
                <XCircle className='h-12 w-12 text-red-600' />
              </div>
              <CardTitle className='text-xl text-red-600'>
                Configuration Error
              </CardTitle>
              <CardDescription>{configError}</CardDescription>
            </CardHeader>
          </Card>
          <ConfigStatus />
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await login(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <Card className='shadow-2xl border-0 bg-white/80 backdrop-blur-sm'>
          <CardHeader className='text-center space-y-4 pb-6'>
            <div className='flex items-center justify-center'>
              <div className='flex aspect-square size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 text-white shadow-lg'>
                <Zap className='size-8' />
              </div>
            </div>
            <div className='space-y-2'>
              <CardTitle className='text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                Welcome back
              </CardTitle>
              <CardDescription className='text-base text-muted-foreground'>
                Sign in to your SmartCollab account
              </CardDescription>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className='space-y-6'>
              {error && (
                <Alert
                  variant='destructive'
                  className='border-red-200 bg-red-50'
                >
                  <AlertDescription className='text-red-800'>
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label
                    htmlFor='email'
                    className='text-sm font-medium text-gray-700'
                  >
                    Email Address
                  </Label>
                  <div className='relative'>
                    <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                    <Input
                      id='email'
                      type='email'
                      placeholder='Enter your email'
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className='pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                      required
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label
                    htmlFor='password'
                    className='text-sm font-medium text-gray-700'
                  >
                    Password
                  </Label>
                  <div className='relative'>
                    <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                    <Input
                      id='password'
                      type='password'
                      placeholder='Enter your password'
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className='pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                      required
                    />
                  </div>
                </div>
              </div>

              <div className='flex items-center justify-end'>
                <Link
                  href='/auth/forgot-password'
                  className='text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium'
                >
                  Forgot your password?
                </Link>
              </div>
            </CardContent>

            <CardFooter className='flex flex-col space-y-6 pt-2'>
              <Button
                type='submit'
                className='w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 cursor-pointer text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200'
                disabled={loading}
              >
                {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <div className='text-center'>
                <p className='text-sm text-muted-foreground'>
                  {"Don't have an account? "}
                  <Link
                    href='/auth/signup'
                    className='text-blue-600 hover:text-blue-800 hover:underline font-medium'
                  >
                    Create one here
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
