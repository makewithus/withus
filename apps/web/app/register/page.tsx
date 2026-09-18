'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Loader2, Mail, Lock, User, Building2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '../../lib/api/client';
import { AuthSession } from '../../lib/auth/session';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../lib/auth/AuthContext';
import { useInvitationDetails } from '../../hooks/useOrganization';
import { WithUsLogo } from '../../components/common/WithUsLogo';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { refreshContext } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // Detect if this is an invite-based registration
  const redirectParam = searchParams.get('redirect') || '';
  const inviteMatch = redirectParam.match(/\/invite\/([a-zA-Z0-9\-_]+)/);
  const inviteToken = inviteMatch ? inviteMatch[1] : null;
  const isInviteFlow = !!inviteToken;

  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: inviteDetails } = useInvitationDetails(inviteToken || '');

  // Pre-fill email if we have invite details
  useEffect(() => {
    if (inviteDetails?.status === 'PENDING' && inviteDetails.invitedEmail) {
      setEmail(inviteDetails.invitedEmail);
    }
  }, [inviteDetails]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) { toast('warning', 'Please enter your full name.'); return; }
    if (!isInviteFlow && !companyName.trim()) { toast('warning', 'Please enter your company name.'); return; }
    if (!email.trim()) { toast('warning', 'Please enter your email address.'); return; }
    if (password.length < 8) { toast('warning', 'Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { toast('warning', 'Passwords do not match.'); return; }

    setLoading(true);
    try {
      const payload: any = { fullName, email, password };
      if (isInviteFlow) {
        // Invite flow: send inviteToken so backend atomically accepts the invitation
        payload.inviteToken = inviteToken;
      } else {
        // Normal flow: create a new workspace
        payload.companyName = companyName;
      }

      const response = await apiClient.post('/auth/register', payload);

      if (response.data?.user) {
        AuthSession.setSession(response.data.user, response.data.organization);
        refreshContext();

        if (isInviteFlow) {
          toast('success', `Welcome to ${response.data.organization?.name || 'the team'}!`);
          router.push('/dashboard');
        } else {
          toast('success', `Workspace "${companyName}" created! Welcome aboard.`);
          router.push('/dashboard');
        }
      } else {
        toast('error', 'Invalid response from server. Please try again.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      toast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12 bg-premium-bg text-premium-main">
      {/* Brand Side */}
      <aside className="hidden lg:flex lg:col-span-5 bg-zinc-950 text-white px-12 xl:px-16 py-12 flex-col relative select-none">
        <div className="flex items-center">
          <img
            src="/logo-dark.png"
            alt="WithUs"
            className="h-11 w-auto object-contain"
          />
        </div>

        <div className="flex-1 flex items-center">
          <div className="max-w-lg">

            <h1 className="text-4xl xl:text-5xl font-semibold tracking-[-0.03em] leading-[1.05] text-white">
              {isInviteFlow ? (
                <>
                  Your access.
                  <br />
                  One secure place.
                </>
              ) : (
                <>
                  Build your
                  <br />
                  secure workspace.
                </>
              )}
            </h1>

            <p className="mt-6 max-w-md text-base xl:text-lg leading-7 text-zinc-400">
              {isInviteFlow
                ? 'Join your team and manage delegated credentials securely with WithUs.'
                : 'Manage delegated access, credentials, and secure sessions from one workspace.'}
            </p>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-zinc-500">
              <span>Scoped access</span>
              <span>Secure vaults</span>
              <span>Auditable sessions</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-zinc-600">
          Secure access infrastructure
        </div>
      </aside>

      {/* Registration Side */}
      <main className="lg:col-span-7 min-h-screen lg:min-h-0 flex flex-col bg-[#101010] px-6 sm:px-10 lg:px-16 py-8 lg:py-10">
        <div className="lg:hidden flex justify-center pb-8">
          <img
            src="/logo-dark.png"
            alt="WithUs"
            className="h-9 w-auto object-contain"
          />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-lg py-4">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold tracking-tight text-[#eeeeee]">
                {isInviteFlow ? 'Create your account' : 'Create your workspace'}
              </h2>
              <p className="mt-2 text-sm text-[#777777]">
                {isInviteFlow
                  ? 'Complete your details to join the team.'
                  : 'Set up your WithUs workspace in a few steps.'}
              </p>
            </div>

            {isInviteFlow && (
              <div className="mb-7 bg-[#181818] px-4 py-3.5 text-sm leading-6 text-[#999999]">
                You’re joining via invitation. Your invited email will be used for this account.{' '}
                <Link
                  href={`/login?redirect=${encodeURIComponent(redirectParam)}`}
                  className="text-[#dddddd] hover:text-white underline underline-offset-2 transition-colors"
                >
                  Sign in instead
                </Link>
                .
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#999999]">
                    Full name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      className="w-full h-11 pl-10 pr-4 bg-[#181818] text-sm text-[#eeeeee] outline-none placeholder:text-[#555555] focus:bg-[#202020] transition-colors"
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>

                {!isInviteFlow && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#999999]">
                      Company name
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                      <input
                        type="text"
                        required
                        className="w-full h-11 pl-10 pr-4 bg-[#181818] text-sm text-[#eeeeee] outline-none placeholder:text-[#555555] focus:bg-[#202020] transition-colors"
                        placeholder="Acme Corp"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#999999]">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    disabled={isInviteFlow}
                    className={`w-full h-11 pl-10 pr-4 bg-[#181818] text-sm text-[#eeeeee] outline-none placeholder:text-[#555555] focus:bg-[#202020] transition-colors ${
                      isInviteFlow ? 'text-[#666666] cursor-not-allowed' : ''
                    }`}
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {isInviteFlow && (
                  <p className="text-xs text-[#666666]">
                    This is the email address that was invited.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#999999]">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      className="w-full h-11 pl-10 pr-10 bg-[#181818] text-sm text-[#eeeeee] outline-none placeholder:text-[#555555] focus:bg-[#202020] transition-colors"
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#cccccc] transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#999999]">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      className="w-full h-11 pl-10 pr-10 bg-[#181818] text-sm text-[#eeeeee] outline-none placeholder:text-[#555555] focus:bg-[#202020] transition-colors"
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#cccccc] transition-colors"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-xs leading-5 text-[#666666]">
                By creating an account, you agree to our{' '}
                <Link
                  href="/terms"
                  className="text-[#bbbbbb] hover:text-white underline underline-offset-2"
                >
                  Terms
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy"
                  className="text-[#bbbbbb] hover:text-white underline underline-offset-2"
                >
                  Privacy Policy
                </Link>
                .
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 inline-flex items-center justify-center gap-2 bg-[#eeeeee] text-sm font-semibold text-[#111111] hover:bg-white disabled:cursor-not-allowed disabled:bg-[#242424] disabled:text-[#555555] transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  isInviteFlow ? 'Create Account & Join Team' : 'Create Workspace'
                )}
              </button>

              <div className="pt-2 text-sm text-[#777777]">
                Already have an account?{' '}
                <Link
                  href={isInviteFlow ? `/login?redirect=${encodeURIComponent(redirectParam)}` : '/login'}
                  className="text-[#dddddd] hover:text-white underline underline-offset-2 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </form>
          </div>
        </div>

        <footer className="pt-6 text-center text-xs text-[#555555]">
          <div className="flex justify-center gap-5">
            <Link href="/privacy" className="hover:text-[#888888] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[#888888] transition-colors">
              Terms
            </Link>
            <Link href="/security" className="hover:text-[#888888] transition-colors">
              Security
            </Link>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
