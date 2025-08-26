"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Zap, Loader2, User, Mail, Lock, CheckCircle } from "lucide-react";
import { signup } from "@/app/actions/auth.actions";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await signup(email, password, fullName);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className='min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'>
        <Card className='w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:border-gray-700'>
          <CardHeader className='text-center space-y-4'>
            <div className='flex items-center justify-center'>
              <div className='flex aspect-square size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg'>
                <CheckCircle className='size-8' />
              </div>
            </div>
            <div className='space-y-2'>
              <CardTitle className='text-2xl font-bold text-green-600 dark:text-green-400'>
                Check your email
              </CardTitle>
              <CardDescription className='text-base'>
                We've sent you a confirmation link at{" "}
                <span className='font-medium text-gray-900 dark:text-white'>{email}</span>
              </CardDescription>
            </div>
          </CardHeader>
          <CardFooter>
            <Button
              onClick={() => router.push("/auth/signin")}
              className='w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600'
            >
              Back to Sign In
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'>
      <div className='w-full max-w-md'>
        <Card className='shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:border-gray-700'>
          <CardHeader className='text-center space-y-4 pb-6'>
            <div className='flex items-center justify-center'>
              <div className='flex aspect-square size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 text-white shadow-lg'>
                <Zap className='size-8' />
              </div>
            </div>
            <div className='space-y-2'>
              <CardTitle className='text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-400 bg-clip-text text-transparent'>
                Create your account
              </CardTitle>
              <CardDescription className='text-base text-muted-foreground dark:text-gray-300'>
                Get started with SmartCollab today
              </CardDescription>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className='space-y-6'>
              {error && (
                <Alert
                  variant='destructive'
                  className='border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900'
                >
                  <AlertDescription className='text-red-800 dark:text-red-400'>
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label
                    htmlFor='fullName'
                    className='text-sm font-medium text-gray-700 dark:text-gray-300'
                  >
                    Full Name
                  </Label>
                  <div className='relative'>
                    <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 dark:text-gray-500' />
                    <Input
                      id='fullName'
                      type='text'
                      placeholder='Enter your full name'
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className='pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:focus:border-blue-500 dark:focus:ring-blue-500'
                      required
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label
                    htmlFor='email'
                    className='text-sm font-medium text-gray-700 dark:text-gray-300'
                  >
                    Email Address
                  </Label>
                  <div className='relative'>
                    <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 dark:text-gray-500' />
                    <Input
                      id='email'
                      type='email'
                      placeholder='Enter your email'
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className='pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:focus:border-blue-500 dark:focus:ring-blue-500'
                      required
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label
                    htmlFor='password'
                    className='text-sm font-medium text-gray-700 dark:text-gray-300'
                  >
                    Password
                  </Label>
                  <div className='relative'>
                    <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 dark:text-gray-500' />
                    <Input
                      id='password'
                      type='password'
                      placeholder='Create a password'
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className='pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:focus:border-blue-500 dark:focus:ring-blue-500'
                      required
                      minLength={6}
                    />
                  </div>
                  <p className='text-xs text-muted-foreground dark:text-gray-500'>
                    Password must be at least 6 characters long
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className='flex flex-col space-y-6 pt-2'>
              <Button
                type='submit'
                className='w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200'
                disabled={loading}
              >
                {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {loading ? "Creating Account..." : "Create Account"}
              </Button>

              <div className='text-center'>
                <p className='text-sm text-muted-foreground'>
                  Already have an account?{" "}
                  <Link
                    href='/auth/signin'
                    className='text-blue-600 hover:text-blue-800 hover:underline font-medium'
                  >
                    Sign in here
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
