import {
  SalonRegisterStepper,
  type SalonRegisterStep,
} from '@/features/auth/components/SalonRegisterStepper';
import { AppLogo } from '@mit-salon/shared/components/AppLogo';
import { FieldError, FormPasswordField, FormTextField } from '@mit-salon/shared/components/FormField';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@mit-salon/shared/components/ui/card';
import { CoverImage } from '@mit-salon/shared/components/CoverImage';
import { Textarea } from '@mit-salon/shared/components/ui/textarea';
import { APP_NAME } from '@mit-salon/shared/lib/constants';
import {
  type FieldErrors,
  hasFieldErrors,
  normalizeEmail,
  validateAddress,
  validateDescription,
  validateEmail,
  validateFullName,
  validateOptionalEmail,
  validateOtp,
  validatePassword,
  validatePhone,
  validateSalonName,
  validateTimeRange,
} from '@mit-salon/shared/lib/form-validation';
import { IMAGES } from '@mit-salon/shared/lib/images';
import { useSalonRegistrationStatusWatch } from '@mit-salon/shared/hooks/useSalonRegistrationStatusWatch';
import { authApi } from '@mit-salon/shared/api';
import { Building2, Store } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${local.length > 2 ? '•••' : ''}@${domain}`;
}

const STEP_TITLES: Record<SalonRegisterStep, string> = {
  email: 'Start with your email',
  otp: 'Verify your email',
  account: 'Create your admin account',
  salon: 'Tell us about your salon',
  review: 'Review and submit',
  done: 'Registration complete',
};

const ADMIN_APP_URL = import.meta.env.VITE_ADMIN_APP_URL ?? 'http://localhost:5174';

type SalonFields =
  | 'email'
  | 'otp'
  | 'fullName'
  | 'phone'
  | 'password'
  | 'confirmPassword'
  | 'salonName'
  | 'address'
  | 'salonPhone'
  | 'salonEmail'
  | 'openingTime'
  | 'closingTime'
  | 'description';

export default function RegisterSalonPage() {
  const [step, setStep] = useState<SalonRegisterStep>('email');
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [registrationToken, setRegistrationToken] = useState('');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [salonName, setSalonName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [salonPhone, setSalonPhone] = useState('');
  const [salonEmail, setSalonEmail] = useState('');
  const [openingTime, setOpeningTime] = useState('09:00');
  const [closingTime, setClosingTime] = useState('19:00');
  const [description, setDescription] = useState('');

  const [registeredSalonName, setRegisteredSalonName] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<SalonFields>>({});

  const clearFieldError = (field: SalonFields) => {
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  useSalonRegistrationStatusWatch({
    email,
    enabled: step === 'done',
    onApproved: (salonName) => {
      toast.success(
        salonName
          ? `"${salonName}" was approved! Opening salon admin sign-in…`
          : 'Your salon was approved! Opening salon admin sign-in…',
      );
      window.location.href = `${ADMIN_APP_URL}/login`;
    },
  });

  const sendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const errors: FieldErrors<SalonFields> = { email: validateEmail(email) };
    setFieldErrors(errors);
    if (hasFieldErrors(errors)) return;

    setLoading(true);
    try {
      const result = await authApi.sendSalonRegisterOtp(normalizeEmail(email));
      setStep('otp');
      setOtp('');
      setFieldErrors({});
      toast.success(result.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send verification code');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: FieldErrors<SalonFields> = { otp: validateOtp(otp) };
    setFieldErrors(errors);
    if (hasFieldErrors(errors)) return;

    setLoading(true);
    try {
      const result = await authApi.verifySalonRegisterOtp(normalizeEmail(email), otp.trim());
      setRegistrationToken(result.registrationToken);
      setStep('account');
      toast.success(result.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const goToSalon = (e: React.FormEvent) => {
    e.preventDefault();
    const passwordError = validatePassword(password);
    const errors: FieldErrors<SalonFields> = {
      fullName: validateFullName(fullName),
      phone: validatePhone(phone),
    };
    if (passwordError) {
      errors.password = passwordError;
    } else if (!confirmPassword.trim()) {
      errors.confirmPassword = 'Confirm your password';
    } else if (password !== confirmPassword) {
      errors.password = 'Passwords do not match';
      errors.confirmPassword = 'Passwords do not match';
    }
    setFieldErrors(errors);
    if (hasFieldErrors(errors)) return;

    setSalonEmail((prev) => prev || normalizeEmail(email));
    setStep('salon');
    setFieldErrors({});
  };

  const goToReview = (e: React.FormEvent) => {
    e.preventDefault();
    const timeError = validateTimeRange(openingTime, closingTime);
    const errors: FieldErrors<SalonFields> = {
      salonName: validateSalonName(salonName),
      address: validateAddress(address),
      salonPhone: validatePhone(salonPhone),
      salonEmail: validateOptionalEmail(salonEmail),
      description: validateDescription(description),
      openingTime: timeError,
      closingTime: timeError,
    };
    setFieldErrors(errors);
    if (hasFieldErrors(errors)) return;

    setStep('review');
    setFieldErrors({});
  };

  const submitRegistration = async () => {
    setLoading(true);
    try {
      const result = await authApi.completeSalonRegistration({
        email: email.trim(),
        registrationToken,
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
        password: password.trim(),
        salon: {
          name: salonName.trim(),
          address: address.trim(),
          city: city.trim() || undefined,
          phone: salonPhone.trim() || undefined,
          email: salonEmail.trim() || email.trim(),
          description: description.trim() || undefined,
          opening_time: openingTime,
          closing_time: closingTime,
        },
      });
      setRegisteredSalonName(String(result.request?.salon_name ?? salonName));
      setStep('done');
      toast.success(result.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen min-w-0 max-w-full overflow-x-clip lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <CoverImage src={IMAGES.branches.downtown} alt="Salon business" className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-slate-900/20" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
            <Store className="h-4 w-4" aria-hidden />
            Salon partner registration
          </div>
          <h2 className="font-heading text-4xl font-bold">List your salon on {APP_NAME}</h2>
          <p className="mt-3 max-w-lg text-lg text-white/85">
            Register your business, verify your email, and submit your salon for platform approval.
          </p>
        </div>
      </div>

      <div className="salon-register-panel customer-page flex items-center justify-center p-6 md:p-10">
        <Card className="salon-register-card w-full max-w-xl border-0 shadow-xl">
          <CardHeader className="pb-2 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Building2 className="h-6 w-6" aria-hidden />
            </div>
            <AppLogo size="md" className="mb-3 justify-center" />
            <CardTitle className="font-heading text-2xl">{STEP_TITLES[step]}</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              {step === 'email' && 'We will send a one-time code to confirm you own this email.'}
              {step === 'otp' && 'Enter the 6-digit code from your inbox to continue.'}
              {step === 'account' && 'This account will be used to sign in to your salon admin portal.'}
              {step === 'salon' && 'Customers will see this information when browsing your location.'}
              {step === 'review' && 'Check everything looks correct before we create your salon.'}
              {step === 'done' && 'Your request was submitted. We will email you when the platform approves your salon.'}
            </p>
          </CardHeader>

          <CardContent>
            <SalonRegisterStepper current={step} />

            {step === 'email' && (
              <form onSubmit={sendOtp} className="space-y-5">
                <FormTextField
                  id="owner-email"
                  label="Business owner email"
                  type="email"
                  className="h-11"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError('email');
                  }}
                  error={fieldErrors.email}
                  placeholder="you@yoursalon.com"
                  autoComplete="email"
                />
                <Button type="submit" className="h-11 w-full rounded-full" disabled={loading}>
                  {loading ? 'Sending code…' : 'Send verification code'}
                </Button>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={verifyOtp} className="space-y-5">
                <p className="text-sm text-muted-foreground">
                  Code sent to <span className="font-medium text-foreground">{maskEmail(email)}</span>
                </p>
                <FormTextField
                  id="otp"
                  label="Verification code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="h-11 text-center text-lg tracking-[0.35em]"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                    clearFieldError('otp');
                  }}
                  error={fieldErrors.otp}
                  placeholder="000000"
                  autoComplete="one-time-code"
                />
                <Button type="submit" className="h-11 w-full rounded-full" disabled={loading || otp.length !== 6}>
                  {loading ? 'Verifying…' : 'Verify email'}
                </Button>
                <div className="flex flex-col gap-2 text-center text-sm">
                  <button
                    type="button"
                    className="font-medium text-primary hover:underline"
                    disabled={loading}
                    onClick={() => void sendOtp()}
                  >
                    Resend code
                  </button>
                  <button
                    type="button"
                    className="text-muted-foreground hover:underline"
                    onClick={() => {
                      setStep('email');
                      setOtp('');
                    }}
                  >
                    Use a different email
                  </button>
                </div>
              </form>
            )}

            {step === 'account' && (
              <form onSubmit={goToSalon} className="space-y-4">
                <FormTextField
                  id="full-name"
                  label="Your full name"
                  className="h-11"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    clearFieldError('fullName');
                  }}
                  error={fieldErrors.fullName}
                />
                <FormTextField
                  id="phone"
                  label="Phone (optional)"
                  type="tel"
                  className="h-11"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    clearFieldError('phone');
                  }}
                  error={fieldErrors.phone}
                />
                <FormPasswordField
                  id="password"
                  label="Password"
                  className="h-11"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError('password');
                  }}
                  error={fieldErrors.password}
                  autoComplete="new-password"
                />
                <FormPasswordField
                  id="confirm-password"
                  label="Confirm password"
                  className="h-11"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearFieldError('confirmPassword');
                  }}
                  error={fieldErrors.confirmPassword}
                  autoComplete="new-password"
                />
                <Button type="submit" className="h-11 w-full rounded-full">
                  Continue to salon details
                </Button>
              </form>
            )}

            {step === 'salon' && (
              <form onSubmit={goToReview} className="space-y-4">
                <FormTextField
                  id="salon-name"
                  label="Salon name"
                  className="h-11"
                  value={salonName}
                  onChange={(e) => {
                    setSalonName(e.target.value);
                    clearFieldError('salonName');
                  }}
                  error={fieldErrors.salonName}
                  placeholder="e.g. MIT Salon Downtown"
                />
                <FormTextField
                  id="address"
                  label="Street address"
                  className="h-11"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    clearFieldError('address');
                  }}
                  error={fieldErrors.address}
                />
                <FormTextField
                  id="city"
                  label="City (optional)"
                  className="h-11"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormTextField
                    id="salon-phone"
                    label="Salon phone (optional)"
                    type="tel"
                    className="h-11"
                    value={salonPhone}
                    onChange={(e) => {
                      setSalonPhone(e.target.value);
                      clearFieldError('salonPhone');
                    }}
                    error={fieldErrors.salonPhone}
                  />
                  <FormTextField
                    id="salon-email"
                    label="Salon contact email (optional)"
                    type="email"
                    className="h-11"
                    value={salonEmail}
                    onChange={(e) => {
                      setSalonEmail(e.target.value);
                      clearFieldError('salonEmail');
                    }}
                    error={fieldErrors.salonEmail}
                    placeholder={email}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormTextField
                    id="open"
                    label="Opening time"
                    type="time"
                    className="h-11"
                    value={openingTime}
                    onChange={(e) => {
                      setOpeningTime(e.target.value);
                      clearFieldError('openingTime');
                      clearFieldError('closingTime');
                    }}
                    error={fieldErrors.openingTime}
                  />
                  <FormTextField
                    id="close"
                    label="Closing time"
                    type="time"
                    className="h-11"
                    value={closingTime}
                    onChange={(e) => {
                      setClosingTime(e.target.value);
                      clearFieldError('openingTime');
                      clearFieldError('closingTime');
                    }}
                    error={fieldErrors.closingTime}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium leading-none">
                    Description (optional)
                  </label>
                  <Textarea
                    id="description"
                    rows={3}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      clearFieldError('description');
                    }}
                    placeholder="A short note about your salon for customers"
                    className={fieldErrors.description ? 'border-destructive' : undefined}
                    aria-invalid={!!fieldErrors.description}
                  />
                  <FieldError message={fieldErrors.description} />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="h-11 flex-1 rounded-full" onClick={() => setStep('account')}>
                    Back
                  </Button>
                  <Button type="submit" className="h-11 flex-1 rounded-full">
                    Review details
                  </Button>
                </div>
              </form>
            )}

            {step === 'review' && (
              <div className="space-y-5">
                <div className="rounded-xl border border-border/70 bg-muted/20 p-4 text-sm">
                  <p className="font-semibold text-foreground">Account</p>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>{fullName}</li>
                    <li>{email}</li>
                    {phone ? <li>{phone}</li> : null}
                  </ul>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 p-4 text-sm">
                  <p className="font-semibold text-foreground">Salon</p>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>{salonName}</li>
                    <li>{address}{city ? `, ${city}` : ''}</li>
                    <li>
                      Hours: {openingTime} – {closingTime}
                    </li>
                    {(salonPhone || salonEmail) && (
                      <li>
                        {salonPhone}
                        {salonPhone && salonEmail ? ' · ' : ''}
                        {salonEmail}
                      </li>
                    )}
                    {description ? <li>{description}</li> : null}
                  </ul>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="h-11 flex-1 rounded-full" onClick={() => setStep('salon')}>
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="h-11 flex-1 rounded-full"
                    disabled={loading}
                    onClick={() => void submitRegistration()}
                  >
                    {loading ? 'Creating salon…' : 'Register salon'}
                  </Button>
                </div>
              </div>
            )}

            {step === 'done' && (
              <div className="space-y-5 text-center">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{registeredSalonName}</span> has been
                  submitted for review on {APP_NAME}. A platform administrator will approve your salon
                  before you can sign in to the admin portal.
                </p>
                <p className="text-xs text-muted-foreground">
                  You will receive an email at <span className="font-medium">{email}</span> once your
                  application is reviewed. This page will redirect you to salon admin sign-in when approved.
                </p>
                <Button asChild variant="outline" className="h-11 w-full rounded-full">
                  <a href={`${ADMIN_APP_URL}/login`}>Back to salon sign in</a>
                </Button>
              </div>
            )}

            {step === 'email' && (
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Booking as a customer?{' '}
                <Link to="/register" className="font-medium text-primary underline">
                  Create customer account
                </Link>
                {' · '}
                <Link to="/login" className="font-medium text-primary underline">
                  Sign in
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
