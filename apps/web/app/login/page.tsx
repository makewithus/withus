'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '../../lib/api/client';
import { AuthSession } from '../../lib/auth/session';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../lib/auth/AuthContext';
import { WithUsLogo } from '../../components/common/WithUsLogo';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { refreshContext } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const redirectParam = searchParams.get('redirect') || '';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast('warning', 'Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      toast('warning', 'Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data?.user) {
        AuthSession.setSession(
          {
            ...response.data.user,
            isSuperAdmin: response.data.user.isSuperAdmin ?? false,
          },
          response.data.organization
        );
        refreshContext();
        toast('success', `Welcome back, ${response.data.user?.fullName?.split(' ')[0] || 'there'}!`);
        // Super Admin → redirect to platform admin console
        // Normal users → respect redirect param or go to dashboard
        if (response.data.user.isSuperAdmin) {
          router.push('/superadmin');
        } else {
          router.push(redirectParam || '/dashboard');
        }
      } else {
        toast('error', 'Invalid response from server. Please try again.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please try again.';
      toast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen grid grid-cols-1 lg:grid-cols-[46%_54%] bg-[#0b0b0b] text-[#f5f5f5] overflow-hidden">
      {/* Brand panel */}
      <aside className="hidden lg:flex flex-col justify-between bg-[#101010] px-10 xl:px-14 py-10 select-none">
        <WithUsLogo height="h-9" />

        <div className="max-w-lg -translate-y-2">
          <h1 className="text-4xl xl:text-5xl font-semibold tracking-[-0.03em] leading-[1.05] text-[#f2f2f2]">
            Secure access.<br />
            Nothing extra.
          </h1>
          <p className="mt-6 max-w-md text-base xl:text-lg leading-7 text-[#858585]">
            One place to manage delegated access and credentials across the platforms your team uses.
          </p>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#686868]">
            <span>Scoped sessions</span>
            <span>Encrypted vaults</span>
            <span>Audit trails</span>
          </div>
        </div>

        <p className="text-xs text-[#555555]">
          Secure credential access
        </p>
      </aside>

      {/* Authentication panel */}
      <main className="min-h-screen lg:min-h-0 flex flex-col bg-[#0b0b0b] px-6 sm:px-10 lg:px-16 xl:px-24 py-8">
        <div className="lg:hidden">
          <WithUsLogo height="h-8" />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[380px]">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold tracking-tight text-[#f2f2f2]">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-[#737373]">
                Sign in to continue to your workspace.
              </p>
            </div>

            {redirectParam?.includes('/invite') && (
              <div className="mb-6 bg-[#151515] px-4 py-3.5 text-sm text-[#8a8a8a]">
                <span className="text-[#d4d4d4]">Joining via invitation?</span>{' '}
                <Link
                  href={`/register?redirect=${encodeURIComponent(redirectParam)}`}
                  className="text-[#e5e5e5] underline underline-offset-2 hover:text-white"
                >
                  Create an account
                </Link>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block mb-2 text-xs font-medium text-[#999999]">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5f5f5f]" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 w-full bg-[#151515] pl-10 pr-4 text-sm text-[#eeeeee] outline-none placeholder:text-[#4f4f4f] focus:bg-[#1b1b1b]"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-xs font-medium text-[#999999]">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5f5f5f]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 w-full bg-[#151515] pl-10 pr-11 text-sm text-[#eeeeee] outline-none placeholder:text-[#4f4f4f] focus:bg-[#1b1b1b]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#626262] hover:text-[#bdbdbd]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-11 w-full inline-flex items-center justify-center gap-2 bg-[#ededed] text-sm font-medium text-[#111111] hover:bg-white disabled:cursor-not-allowed disabled:bg-[#292929] disabled:text-[#666666]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 text-sm text-[#696969]">
              Don&apos;t have an account?{' '}
              <Link
                href={redirectParam ? `/register?redirect=${encodeURIComponent(redirectParam)}` : '/register'}
                className="text-[#d0d0d0] hover:text-white"
              >
                {redirectParam?.includes('/invite') ? 'Create Account' : 'Create Workspace'}
              </Link>
            </div>
          </div>
        </div>

        <footer className="pt-6 text-[11px] text-[#505050]">
          <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center lg:justify-end">
            <Link href="/privacy" className="hover:text-[#888888]">Privacy</Link>
            <Link href="/terms" className="hover:text-[#888888]">Terms</Link>
            <Link href="/security" className="hover:text-[#888888]">Security</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
