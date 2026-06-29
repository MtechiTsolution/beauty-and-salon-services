import { BookingOfferingToggle, type BookingOfferingType } from '@/features/booking/components/BookingOfferingToggle';
import { BookingStepper } from '@/features/booking/components/BookingStepper';
import { CouponPicker } from '@/features/booking/components/CouponPicker';
import { BookingStatusHighlights } from '@/features/my-bookings/components/BookingStatusHighlights';
import { CUSTOMER_BOOKING_STEPS } from '@/features/booking/lib/booking-steps';
import {
  clearBookingDraft,
  loadBookingDraft,
  saveBookingDraft,
} from '@/features/booking/lib/booking-draft';
import {
  bookingLineTitle,
  packageDurationMinutes,
  packagePrimaryServiceId,
} from '@/features/booking/lib/bookingOffering';
import {
  getBranchesForPackage,
  isPackageAvailableAtBranch,
} from '@/features/packages/lib/package-branches';
import { useActivePackages } from '@/features/packages/hooks/useActivePackages';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  bookingsApi,
  branchesApi,
  couponsApiExtra,
  employeesApi,
  servicesApi,
} from '@mit-salon/shared/api';
import { CoverImage } from '@mit-salon/shared/components/CoverImage';
import { branchImageHints } from '@mit-salon/shared/lib/branch-image-hints';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent } from '@mit-salon/shared/components/ui/card';
import { Input } from '@mit-salon/shared/components/ui/input';
import { Label } from '@mit-salon/shared/components/ui/label';
import { Textarea } from '@mit-salon/shared/components/ui/textarea';
import {
  PAYMENT_METHODS,
  TIME_SLOTS,
  type PaymentMethodId,
} from '@mit-salon/shared/lib/constants';
import {
  formatBookingTimeWindow,
  formatBookingTimeWindowCompact,
  getServiceStartSlots,
  filterSlotsForServiceDuration,
  getAvailableSlots,
  getBookedSlots,
  isSlotBlockedForNewBooking,
  isSlotCoveredByExistingBooking,
  isSlotInPast,
  PAST_SLOT_MESSAGE,
  slotFitsServiceDuration,
  slotsForSelectedDate,
  STAFF_SLOT_CONFLICT_MESSAGE,
} from '@mit-salon/shared/lib/booking-slots';
import { COUPON_VALIDATE_MESSAGES } from '@mit-salon/shared/lib/coupon-validate';
import { invalidateAllCatalogQueries } from '@mit-salon/shared/lib/catalog-query-keys';
import { filterStaffForBooking, filterStaffForPackage, getStaffRoleLabel } from '@mit-salon/shared/lib/staff-roles';
import type { Booking, Branch, Employee, Package, Service } from '@mit-salon/shared/types';
import { cn } from '@mit-salon/shared/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, startOfToday } from 'date-fns';
import {
  Banknote,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Gift,
  MapPin,
  MessageCircle,
  Scissors,
  Smartphone,
  RotateCcw,
  Star,
  User,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const PAYMENT_ICONS: Record<PaymentMethodId, typeof CreditCard> = {
  card: CreditCard,
  wallet: Smartphone,
  cash: Banknote,
};

const STEP_COUNT = CUSTOMER_BOOKING_STEPS.length;

export default function BookAppointmentPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [step]);
  const [packagePrefilled, setPackagePrefilled] = useState(false);
  const [urlBookingApplied, setUrlBookingApplied] = useState(false);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [offeringType, setOfferingType] = useState<BookingOfferingType>('service');
  const [service, setService] = useState<Service | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplying, setCouponApplying] = useState(false);
  const [notes, setNotes] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [done, setDone] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [draftReady, setDraftReady] = useState(false);
  const [resumedDraft, setResumedDraft] = useState(false);
  const [clockTick, setClockTick] = useState(0);
  const todayStr = format(startOfToday(), 'yyyy-MM-dd');

  const bookingEmail = user?.email ?? guestEmail.trim();
  const bookingName = user?.full_name ?? guestName.trim();
  const draftEmailKey = user?.email ?? (guestEmail.trim() ? guestEmail.trim().toLowerCase() : null);
  const guestEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingEmail);
  const guestDetailsValid = bookingName.length > 0 && guestEmailValid;

  useEffect(() => {
    if (step === 3 && employee && !date) {
      setDate(todayStr);
    }
  }, [step, employee, date, todayStr]);

  const { data: branches = [] } = useQuery({
    queryKey: ['branches-book'],
    queryFn: () => branchesApi.list(),
    refetchOnMount: 'always',
  });
  const { data: services = [] } = useQuery({
    queryKey: ['services-book'],
    queryFn: () => servicesApi.list(),
    refetchOnMount: 'always',
  });
  const { data: employees = [] } = useQuery({
    queryKey: ['employees-book'],
    queryFn: () => employeesApi.list(),
    refetchOnMount: 'always',
  });
  const { data: packages = [] } = useActivePackages();
  const { data: dayBookings = [], isFetching: loadingSlots } = useQuery({
    queryKey: ['bookings-slot', date, employee?.id],
    queryFn: () => bookingsApi.filter({ date, employee_id: employee!.id }),
    enabled: !!date && !!employee && step === 3,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: step === 3 && date && employee ? 5000 : false,
  });

  const activeBranches = branches.filter((b) => b.status === 'active');
  const branchChoices = useMemo(() => {
    if (packagePrefilled && selectedPackage) {
      return getBranchesForPackage(selectedPackage, activeBranches, services);
    }
    return activeBranches;
  }, [packagePrefilled, selectedPackage, activeBranches, services]);
  const branchServices = services.filter(
    (s) => s.status === 'active' && branch && s.branch_ids.includes(branch.id),
  );
  const branchPackages = useMemo(() => {
    if (!branch) return [];
    return packages.filter(
      (p) => p.status === 'active' && isPackageAvailableAtBranch(p, branch.id, activeBranches, services),
    );
  }, [packages, branch, activeBranches, services]);
  const activeOfferingType: BookingOfferingType | null = selectedPackage
    ? 'package'
    : service
      ? 'service'
      : null;
  const hasOffering = activeOfferingType !== null;
  const linePrice =
    activeOfferingType === 'package' ? (selectedPackage?.price ?? 0) : (service?.price ?? 0);
  const lineDuration =
    activeOfferingType === 'package' && selectedPackage
      ? packageDurationMinutes(selectedPackage, services)
      : (service?.duration_minutes ?? 0);
  const lineTitle = bookingLineTitle(service, selectedPackage);
  const staffOptions =
    branch && activeOfferingType === 'service' && service
      ? filterStaffForBooking(employees, branch.id, service.id)
      : branch && activeOfferingType === 'package' && selectedPackage
        ? filterStaffForPackage(employees, branch.id, selectedPackage.service_ids)
        : [];
  const staffDayBookings = useMemo(
    () => dayBookings.filter((b) => b.status !== 'cancelled'),
    [dayBookings],
  );

  useEffect(() => {
    if (date !== todayStr) return;
    const id = window.setInterval(() => setClockTick((t) => t + 1), 60_000);
    return () => window.clearInterval(id);
  }, [date, todayStr]);

  const now = useMemo(() => new Date(), [clockTick]);

  const daySlots = useMemo(
    () => (date ? slotsForSelectedDate(date, TIME_SLOTS, now) : []),
    [date, now],
  );

  const durationDaySlots = useMemo(
    () =>
      lineDuration > 0
        ? getServiceStartSlots(daySlots, lineDuration, TIME_SLOTS)
        : daySlots,
    [daySlots, lineDuration],
  );

  const bookedSlots = useMemo(
    () =>
      date && employee && lineDuration > 0
        ? getBookedSlots(durationDaySlots, lineDuration, staffDayBookings, {
            allDaySlots: TIME_SLOTS,
          })
        : [],
    [date, employee, lineDuration, staffDayBookings, durationDaySlots],
  );

  const bookedSlotSet = useMemo(() => new Set(bookedSlots), [bookedSlots]);

  const staffBusySlotSet = useMemo(() => {
    if (!date || !employee) return new Set<string>();
    return new Set(
      durationDaySlots.filter((slot) => isSlotCoveredByExistingBooking(slot, staffDayBookings)),
    );
  }, [date, employee, durationDaySlots, staffDayBookings]);

  const availableSlots = useMemo(
    () =>
      date && employee && lineDuration > 0
        ? getAvailableSlots(durationDaySlots, lineDuration, staffDayBookings, {
            allDaySlots: TIME_SLOTS,
          })
        : [],
    [date, employee, lineDuration, staffDayBookings, durationDaySlots],
  );

  useEffect(() => {
    if (!time || lineDuration <= 0) return;
    if (!slotFitsServiceDuration(time, lineDuration, TIME_SLOTS)) {
      setTime('');
    }
  }, [time, lineDuration]);

  useEffect(() => {
    if (!time || !date) return;
    if (isSlotInPast(date, time, now)) {
      setTime('');
      toast.error(PAST_SLOT_MESSAGE);
      return;
    }
    if (!lineDuration) return;
    if (isSlotBlockedForNewBooking(time, lineDuration, staffDayBookings)) {
      setTime('');
      toast.error(STAFF_SLOT_CONFLICT_MESSAGE);
    }
  }, [staffDayBookings, time, lineDuration, date, now]);
  const finalPrice = hasOffering ? Math.max(0, linePrice - discount) : 0;
  const paymentLabel = PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label ?? '';

  const couponCategoryId = useMemo(() => {
    if (activeOfferingType === 'service' && service) return service.category_id;
    if (activeOfferingType === 'package' && selectedPackage) {
      const serviceId = packagePrimaryServiceId(selectedPackage);
      return services.find((s) => s.id === serviceId)?.category_id;
    }
    return undefined;
  }, [activeOfferingType, service, selectedPackage, services]);

  const couponScope = useMemo(
    () => ({
      branchId: branch?.id,
      categoryId: couponCategoryId,
    }),
    [branch?.id, couponCategoryId],
  );

  const { data: couponOptions = [], isLoading: couponsLoading } = useQuery({
    queryKey: ['customer-coupon-options', bookingEmail, linePrice, couponScope.branchId, couponScope.categoryId],
    queryFn: () => couponsApiExtra.listOptions(bookingEmail, linePrice, couponScope),
    enabled: !!bookingEmail && hasOffering && linePrice > 0,
  });

  const hasProgress = step > 0 || !!branch;

  useEffect(() => {
    if (done || urlBookingApplied) return;
    const packageId = searchParams.get('package');
    const branchId = searchParams.get('branch');
    if (!packageId) return;
    if (!branches.length || !packages.length) return;

    const pkg = packages.find((p) => p.id === packageId && p.status === 'active');
    if (!pkg) {
      toast.error('Package not found or no longer available');
      setSearchParams({}, { replace: true });
      setUrlBookingApplied(true);
      setDraftReady(true);
      return;
    }

    if (user?.email) clearBookingDraft(user.email);

    setOfferingType('package');
    setSelectedPackage(pkg);
    setPackagePrefilled(true);
    setService(null);
    setEmployee(null);
    setDate('');
    setTime('');
    setDiscount(0);
    setCouponCode('');
    setResumedDraft(false);

    if (branchId) {
      const b = activeBranches.find((x) => x.id === branchId);
      if (!b) {
        toast.error('This salon is not available for the selected package');
        setBranch(null);
        setStep(0);
      } else {
        setBranch(b);
        setStep(2);
      }
    } else {
      setBranch(null);
      setStep(0);
    }

    setSearchParams({}, { replace: true });
    setUrlBookingApplied(true);
    setDraftReady(true);
  }, [
    done,
    urlBookingApplied,
    searchParams,
    branches.length,
    packages,
    activeBranches,
    user?.email,
    setSearchParams,
  ]);

  useEffect(() => {
    if (!draftEmailKey || draftReady || done || urlBookingApplied) return;
    if (!branches.length || !services.length || !employees.length) return;
    if (searchParams.get('package')) return;

    const draft = loadBookingDraft(draftEmailKey);
    if (!draft) {
      setDraftReady(true);
      return;
    }

    const restoredBranch = draft.branchId
      ? activeBranches.find((b) => b.id === draft.branchId) ?? null
      : null;

    if (draft.branchId && !restoredBranch) {
      clearBookingDraft(draftEmailKey);
      setDraftReady(true);
      return;
    }

    if (restoredBranch) setBranch(restoredBranch);
    setOfferingType(draft.offeringType);

    if (draft.serviceId) {
      const s = services.find((x) => x.id === draft.serviceId && x.status === 'active');
      if (s) setService(s);
    }
    if (draft.packageId) {
      const p = packages.find((x) => x.id === draft.packageId && x.status === 'active');
      if (p) setSelectedPackage(p);
    }
    if (draft.employeeId && restoredBranch) {
      const e = employees.find((x) => x.id === draft.employeeId);
      if (e) setEmployee(e);
    }

    setDate(draft.date || '');
    setTime(draft.time || '');
    setPaymentMethod(draft.paymentMethod);
    setCouponCode(draft.couponCode || '');
    setDiscount(draft.discount || 0);
    setNotes(draft.notes || '');
    const resumeStep = Math.min(Math.max(0, draft.step), STEP_COUNT - 1);
    setStep(resumeStep);
    setResumedDraft(true);
    setDraftReady(true);
    toast.info(`Resuming your booking from step ${resumeStep + 1}`);
  }, [
    draftEmailKey,
    branches.length,
    services.length,
    employees.length,
    packages.length,
    draftReady,
    done,
    activeBranches,
    branches,
    services,
    employees,
    packages,
    urlBookingApplied,
    searchParams,
  ]);

  useEffect(() => {
    if (!draftEmailKey || done || !draftReady) return;
    if (!hasProgress) {
      clearBookingDraft(draftEmailKey);
      return;
    }
    saveBookingDraft(draftEmailKey, {
      step,
      branchId: branch?.id ?? null,
      offeringType: activeOfferingType ?? offeringType,
      serviceId: service?.id ?? null,
      packageId: selectedPackage?.id ?? null,
      employeeId: employee?.id ?? null,
      date,
      time,
      paymentMethod,
      couponCode,
      discount,
      notes,
      savedAt: new Date().toISOString(),
    });
  }, [
    draftEmailKey,
    done,
    draftReady,
    hasProgress,
    step,
    branch,
    activeOfferingType,
    offeringType,
    service,
    selectedPackage,
    employee,
    date,
    time,
    paymentMethod,
    couponCode,
    discount,
    notes,
  ]);

  const discardDraft = () => {
    if (user?.email) clearBookingDraft(user.email);
    if (guestEmail.trim()) clearBookingDraft(guestEmail.trim().toLowerCase());
    setStep(0);
    setBranch(null);
    setOfferingType('service');
    setService(null);
    setSelectedPackage(null);
    setPackagePrefilled(false);
    setEmployee(null);
    setDate('');
    setTime('');
    setPaymentMethod(null);
    setCouponCode('');
    setDiscount(0);
    setNotes('');
    setGuestName('');
    setGuestEmail('');
    setGuestPhone('');
    setResumedDraft(false);
    setUrlBookingApplied(false);
    toast.success('Draft cleared — starting fresh');
  };

  const bookMutation = useMutation({
    mutationFn: (data: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) => bookingsApi.create(data),
    onSuccess: async (booking) => {
      if (draftEmailKey) clearBookingDraft(draftEmailKey);
      setConfirmedBooking(booking);
      await invalidateAllCatalogQueries(queryClient);
      setDone(true);
      toast.success('Booking confirmed!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Could not complete booking');
    },
  });

  const clearScheduleAndPayment = () => {
    setEmployee(null);
    setDate('');
    setTime('');
    setDiscount(0);
    setCouponCode('');
    setPaymentMethod(null);
  };

  const restartFromServiceStep = () => {
    setStep(1);
    setResumedDraft(false);
  };

  const selectBranch = (b: Branch, options?: { keepPackage?: boolean }) => {
    setBranch(b);
    setService(null);
    if (!options?.keepPackage) {
      setSelectedPackage(null);
      setPackagePrefilled(false);
    }
    setEmployee(null);
    setDate('');
    setTime('');
    setDiscount(0);
    setCouponCode('');
  };

  const goBack = () => {
    setStep((s) => {
      if (s === 2 && packagePrefilled) return 0;
      return Math.max(0, s - 1);
    });
  };

  const goToStep = (target: number) => {
    if (target >= step || target < 0) return;
    if (target === 1 && packagePrefilled) return;
    setStep(target);
  };

  const goNext = () => {
    setStep((s) => {
      if (s === 0 && packagePrefilled && branch) return 2;
      return Math.min(STEP_COUNT - 1, s + 1);
    });
  };

  const selectOfferingType = (type: BookingOfferingType) => {
    if (type === offeringType) return;
    setOfferingType(type);
  };

  const selectService = (s: Service) => {
    const offeringChanged = service?.id !== s.id;
    setOfferingType('service');
    setService(s);
    setSelectedPackage(null);
    if (offeringChanged) {
      clearScheduleAndPayment();
      if (step > 1 || resumedDraft) {
        restartFromServiceStep();
        toast.info('Service changed — starting from service selection');
      }
    }
  };

  const selectPackage = (p: Package) => {
    const offeringChanged = selectedPackage?.id !== p.id;
    setOfferingType('package');
    setSelectedPackage(p);
    setService(null);
    if (offeringChanged) {
      clearScheduleAndPayment();
      if (step > 1 || resumedDraft) {
        restartFromServiceStep();
        toast.info('Package changed — starting from service selection');
      }
    }
  };

  const selectEmployee = (e: Employee) => {
    setEmployee(e);
    setDate('');
    setTime('');
  };

  const applyCoupon = async (codeOverride?: string) => {
    if (!bookingEmail) {
      toast.error('Enter your email to apply a coupon');
      return;
    }
    const code = (codeOverride ?? couponCode).trim();
    if (!code) {
      toast.error('Enter a coupon code');
      return;
    }
    if (!hasOffering) {
      toast.error('Select a service or package first');
      return;
    }
    setCouponApplying(true);
    try {
      const result = await couponsApiExtra.validate(code, bookingEmail, linePrice, couponScope);
      if (!result.ok) {
        toast.error(COUPON_VALIDATE_MESSAGES[result.reason]);
        setDiscount(0);
        return;
      }
      const { coupon } = result;
      const amt =
        coupon.discount_type === 'percentage'
          ? (linePrice * coupon.discount_value) / 100
          : coupon.discount_value;
      setCouponCode(code.toUpperCase());
      setDiscount(amt);
      toast.success(`Discount $${amt.toFixed(2)} applied`);
    } finally {
      setCouponApplying(false);
    }
  };

  const canGoNext =
    (step === 0 && !!branch) ||
    (step === 1 && hasOffering) ||
    (step === 2 && !!employee) ||
    (step === 3 &&
      !!date &&
      !!time &&
      !isSlotInPast(date, time, now) &&
      !isSlotBlockedForNewBooking(time, lineDuration, staffDayBookings)) ||
    (step === 4 && !!paymentMethod);

  const canConfirm =
    !!branch &&
    hasOffering &&
    !!employee &&
    !!date &&
    !!time &&
    !!paymentMethod &&
    (isAuthenticated || guestDetailsValid) &&
    !isSlotInPast(date, time, now) &&
    !isSlotBlockedForNewBooking(time, lineDuration, staffDayBookings);

  const submit = async () => {
    if (!branch || !hasOffering || !employee || !date || !time || !paymentMethod) return;
    if (!isAuthenticated && !guestDetailsValid) {
      toast.error('Please enter your name and email');
      return;
    }

    const serviceId =
      activeOfferingType === 'service' ? service?.id : packagePrimaryServiceId(selectedPackage!);
    if (!serviceId) {
      toast.error('This package has no linked services. Please choose another package.');
      return;
    }

    const latestDayBookings = await bookingsApi.filter({ date, employee_id: employee.id });
    const latestActive = latestDayBookings.filter((b) => b.status !== 'cancelled');

    if (isSlotBlockedForNewBooking(time, lineDuration, latestActive)) {
      toast.error(STAFF_SLOT_CONFLICT_MESSAGE);
      setTime('');
      setStep(3);
      await queryClient.invalidateQueries({ queryKey: ['bookings-slot', date, employee.id] });
      return;
    }

    const paidOnline = paymentMethod === 'card' || paymentMethod === 'wallet';
    const packageNote =
      selectedPackage &&
      `Package: ${selectedPackage.name} (${selectedPackage.total_sessions} sessions, ${selectedPackage.validity_days} days validity)`;
    const guestPhoneNote = guestPhone.trim() ? `Contact phone: ${guestPhone.trim()}` : '';
    const combinedNotes = [packageNote, guestPhoneNote, notes].filter(Boolean).join('\n') || undefined;

    bookMutation.mutate({
      customer_email: bookingEmail,
      customer_name: bookingName,
      branch_id: branch.id,
      branch_name: branch.name,
      service_id: serviceId,
      service_title: lineTitle,
      employee_id: employee.id,
      employee_name: employee.name,
      date,
      time_slot: time,
      duration_minutes: lineDuration,
      price: linePrice,
      discount,
      final_price: finalPrice,
      coupon_code: couponCode || undefined,
      notes: combinedNotes,
      status: 'pending',
      payment_status: paidOnline ? 'paid' : 'unpaid',
      payment_method: paymentMethod,
    });
  };

  if (done) {
    const confirmDateLabel = date
      ? format(new Date(`${date}T12:00:00`), 'EEE, MMM d, yyyy')
      : '';
    const confirmTimeLabel =
      time && lineDuration > 0
        ? formatBookingTimeWindow(time, lineDuration)
        : time ?? '';

    return (
      <div className="customer-page customer-booking-confirm-page flex justify-center px-4">
        <Card className="customer-booking-confirm-card w-full max-w-lg border-0 shadow-xl">
          <CardContent className="customer-booking-confirm-content p-8 text-center md:p-10">
            <div className="customer-booking-confirm-hero">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 md:h-16 md:w-16">
                <CheckCircle2 className="h-8 w-8 text-green-600 md:h-10 md:w-10" />
              </div>
              <h1 className="font-heading mt-4 text-2xl font-bold md:mt-6 md:text-3xl">You&apos;re all set!</h1>
              <p className="mt-2 text-sm text-muted-foreground md:mt-3 md:text-base">
                {isAuthenticated
                  ? 'Confirmation sent to your account and email.'
                  : `Confirmation will be sent to ${bookingEmail}.`}
              </p>
            </div>

            <div className="customer-booking-confirm-details mt-5 md:mt-6">
              <div className="customer-booking-confirm-detail-row">
                <span className="customer-booking-confirm-detail-label">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Salon
                </span>
                <span className="customer-booking-confirm-detail-value">{branch?.name}</span>
              </div>
              <div className="customer-booking-confirm-detail-row">
                <span className="customer-booking-confirm-detail-label">
                  <Scissors className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Service
                </span>
                <span className="customer-booking-confirm-detail-value">{lineTitle}</span>
              </div>
              <div className="customer-booking-confirm-detail-row">
                <span className="customer-booking-confirm-detail-label">
                  <User className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Stylist
                </span>
                <span className="customer-booking-confirm-detail-value">{employee?.name}</span>
              </div>
              <div className="customer-booking-confirm-detail-row">
                <span className="customer-booking-confirm-detail-label">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  When
                </span>
                <span className="customer-booking-confirm-detail-value">
                  {confirmDateLabel}
                  {confirmTimeLabel ? (
                    <>
                      <span className="customer-booking-confirm-detail-sep" aria-hidden>
                        {' '}
                        ·{' '}
                      </span>
                      <span className="customer-booking-confirm-detail-time">{confirmTimeLabel}</span>
                    </>
                  ) : null}
                </span>
              </div>
            </div>

            {confirmedBooking && (
              <div className="customer-booking-confirm-status mt-4 text-left md:mt-5">
                <BookingStatusHighlights
                  bookingStatus={confirmedBooking.status}
                  paymentStatus={confirmedBooking.payment_status}
                />
              </div>
            )}

            <div className="customer-booking-confirm-price mt-5 md:mt-6">
              <p className="text-2xl font-bold text-primary md:text-3xl">${finalPrice.toFixed(2)}</p>
              <p className="mt-1 text-sm text-muted-foreground">{paymentLabel}</p>
            </div>

            <div className="customer-booking-confirm-actions mt-6 flex flex-row gap-2 md:mt-8 md:gap-3">
              {isAuthenticated && confirmedBooking && (
                <Button asChild className="customer-booking-confirm-btn h-12 flex-1 rounded-full text-base" size="lg">
                  <Link to={`/messages/booking/${confirmedBooking.id}`}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Chat with salon
                  </Link>
                </Button>
              )}
              {isAuthenticated ? (
                <Button
                  asChild={!!confirmedBooking}
                  className="customer-booking-confirm-btn h-12 flex-1 rounded-full text-base"
                  size="lg"
                  variant={confirmedBooking ? 'outline' : 'default'}
                  onClick={confirmedBooking ? undefined : () => navigate('/my-bookings')}
                >
                  {confirmedBooking ? (
                    <Link to={`/my-bookings/${confirmedBooking.id}`}>View my booking</Link>
                  ) : (
                    'View my bookings'
                  )}
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    className="customer-booking-confirm-btn h-12 flex-1 rounded-full text-base"
                    size="lg"
                  >
                    <Link to="/login" state={{ from: { pathname: '/my-bookings' } }}>Sign in to manage</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="customer-booking-confirm-btn h-12 flex-1 rounded-full text-base"
                    size="lg"
                  >
                    <Link to="/register">Create account</Link>
                  </Button>
                </>
              )}
            </div>

            {!isAuthenticated && confirmedBooking && (
              <p className="customer-booking-confirm-ref mt-5 text-xs leading-relaxed text-muted-foreground md:mt-6">
                Booking reference:{' '}
                <span className="font-mono font-medium text-foreground">{confirmedBooking.id}</span>
                <span className="customer-booking-confirm-ref-hint"> — save this if you need to contact the salon.</span>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="customer-page customer-booking-page min-w-0 w-full max-w-full overflow-x-hidden pb-16">
      <section className="customer-booking-page-header border-b bg-card/95 backdrop-blur-md max-lg:sticky max-lg:z-40 max-lg:shadow-sm supports-[backdrop-filter]:bg-card/90">
        <div className="customer-container-wide customer-booking-page-header-inner py-4 max-md:py-3 lg:pb-3 lg:pt-4">
            {/* Desktop: title | stepper | start again in one row */}
            <div className="customer-booking-page-header-desktop hidden w-full lg:grid lg:grid-cols-[minmax(0,max-content)_minmax(0,1fr)_minmax(0,max-content)] lg:items-start lg:gap-x-6 xl:gap-x-8">
              <div className="customer-booking-page-header-title-cell flex min-w-0 items-center">
                <h1 className="shrink-0 whitespace-nowrap font-heading text-xl font-bold leading-none xl:text-2xl">
                  Book your appointment
                </h1>
              </div>
              <div className="booking-stepper-wrap customer-booking-page-header-stepper min-w-0 w-full max-w-none">
                <BookingStepper
                  currentStep={step}
                  onStepClick={goToStep}
                  disabledSteps={packagePrefilled ? [1] : undefined}
                />
              </div>
              <div className="customer-booking-page-header-action-cell flex shrink-0 items-center justify-end">
                {draftReady && hasProgress && !done ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="customer-booking-start-again h-7 gap-1.5 rounded-full border-border/80 bg-card px-4 py-0 text-sm shadow-sm hover:bg-muted/60"
                    onClick={discardDraft}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Start again
                  </Button>
                ) : (
                  <span className="w-px shrink-0" aria-hidden />
                )}
              </div>
            </div>

            {/* Mobile: unchanged stacked layout */}
            <div className="customer-booking-flow min-w-0 max-lg:text-left lg:hidden">
              <div className="customer-booking-page-title-row flex items-start justify-between gap-3">
                <h1 className="min-w-0 flex-1 font-heading text-balance text-left text-xl font-bold sm:text-2xl md:text-3xl">
                  Book your appointment
                </h1>
                {draftReady && hasProgress && !done && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="customer-booking-start-again shrink-0 gap-1.5 rounded-full border-border/80 bg-card px-3 shadow-sm hover:bg-muted/60 sm:gap-2 sm:px-5 md:size-lg md:px-6"
                    onClick={discardDraft}
                  >
                    <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm md:text-base">Start again</span>
                  </Button>
                )}
              </div>
              <div className="booking-stepper-wrap mx-auto mt-3 max-md:mt-3 md:mt-4">
                <BookingStepper
                  currentStep={step}
                  onStepClick={goToStep}
                  disabledSteps={packagePrefilled ? [1] : undefined}
                />
              </div>
            </div>
        </div>
      </section>

      <section className="customer-container-wide py-4 max-md:py-4 md:py-5">
        <div className="customer-booking-flow-wide min-w-0">
        {step === 0 && (
          <div className="customer-booking-step customer-booking-step--locations mx-auto w-full min-w-0">
            <h2 className="font-heading text-balance text-lg font-semibold sm:text-xl md:text-2xl">
              {packagePrefilled && selectedPackage
                ? 'Choose salon for your package'
                : 'Choose your location'}
            </h2>
            <p className="mt-1 text-pretty text-sm text-muted-foreground sm:text-base">
              {packagePrefilled && selectedPackage ? (
                <>
                  Booking <span className="font-medium text-foreground">{selectedPackage.name}</span> —{' '}
                  {branchChoices.length} salon{branchChoices.length !== 1 ? 's' : ''} available.
                </>
              ) : (
                <>
                  {branchChoices.length} salon{branchChoices.length !== 1 ? 's' : ''} available — tap to select.
                </>
              )}
            </p>
            {packagePrefilled && selectedPackage && (
              <div className="mx-auto mt-4 flex max-w-lg items-center gap-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm">
                <Gift className="h-5 w-5 shrink-0 text-primary" />
                <span>
                  <span className="font-semibold">{selectedPackage.name}</span> is already selected — pick a
                  salon to continue.
                </span>
              </div>
            )}
            <div className="customer-booking-cards-scroll customer-booking-cards-grid customer-booking-cards-grid--locations mt-4 md:mt-5">
              {branchChoices.length === 0 ? (
                <p className="col-span-full py-12 text-center text-muted-foreground">
                  {packagePrefilled
                    ? 'No salons offer this package right now.'
                    : (
                      <>
                        No branches yet. <Link to="/explore" className="text-primary underline">Explore</Link>
                      </>
                    )}
                </p>
              ) : (
                branchChoices.map((b) => (
                  <Card
                    key={b.id}
                    className={cn(
                      'customer-booking-select-card customer-card-hover cursor-pointer overflow-hidden shadow-md',
                      branch?.id === b.id && 'customer-card-selected',
                    )}
                    onClick={() => selectBranch(b, { keepPackage: packagePrefilled })}
                  >
                    <div className="aspect-[16/10] overflow-hidden lg:aspect-video">
                      <CoverImage
                        src={b.image_url}
                        alt={b.name}
                        kind="branch"
                        entityId={b.id}
                        entityName={b.name}
                        entityDescription={branchImageHints(b)}
                        className="h-full w-full"
                      />
                    </div>
                    <CardContent className="customer-branch-card-body p-4 md:p-5 text-left">
                      <div className="grid grid-cols-[1.125rem_minmax(0,1fr)] gap-x-2 gap-y-2">
                        <h3 className="col-start-2 font-heading text-xl font-semibold leading-snug">{b.name}</h3>
                        <MapPin className="col-start-1 row-start-2 mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <p className="customer-branch-card-address col-start-2 row-start-2 min-w-0 text-sm leading-relaxed text-muted-foreground">
                          {b.address}
                          {b.city ? `, ${b.city}` : ''}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {step === 1 && !packagePrefilled && (
          <div className="customer-booking-flow">
            <h2 className="font-heading text-2xl font-semibold">Service or package</h2>
            <p className="mt-2 hidden text-muted-foreground lg:block">
              At {branch?.name} — choose what you want to book
            </p>
            <div className="mt-4 flex justify-center lg:mt-6">
              <BookingOfferingToggle value={offeringType} onChange={selectOfferingType} />
            </div>

            {offeringType === 'service' ? (
              <div className="customer-booking-cards-scroll customer-booking-cards-grid mt-8">
                {branchServices.length === 0 ? (
                  <p className="col-span-full text-muted-foreground">No services at this branch.</p>
                ) : (
                  branchServices.map((s) => {
                    const isSelected = service?.id === s.id;
                    return (
                    <Card
                      key={s.id}
                      className={cn(
                        'customer-card-hover customer-offering-card relative cursor-pointer overflow-hidden border-2 shadow-md transition-all',
                        isSelected
                          ? 'customer-offering-card--selected border-primary'
                          : 'border-transparent bg-card',
                      )}
                      onClick={() => selectService(s)}
                    >
                      {isSelected && (
                        <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Selected
                        </div>
                      )}
                      <div className="aspect-[16/9] overflow-hidden">
                        <CoverImage
                          src={s.image_url}
                          alt={s.title}
                          kind="service"
                          entityId={s.id}
                          entityName={s.title}
                          entityDescription={s.description}
                          className="h-full w-full"
                        />
                      </div>
                      <CardContent className="customer-offering-card-body flex items-end justify-between gap-4 p-6">
                        <div>
                          <h3 className={cn('customer-offering-card-title font-heading text-lg font-semibold', isSelected && 'text-primary')}>
                            {s.title}
                          </h3>
                          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                            <Scissors className="h-4 w-4" />
                            {s.duration_minutes} minutes
                          </p>
                        </div>
                        <span className="text-2xl font-bold text-primary">${s.price}</span>
                      </CardContent>
                    </Card>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="customer-booking-cards-scroll customer-booking-cards-grid mt-8">
                {branchPackages.length === 0 ? (
                  <p className="col-span-full text-muted-foreground">
                    No packages at this branch yet. Try a single service instead.
                  </p>
                ) : (
                  branchPackages.map((p) => {
                    const isSelected = selectedPackage?.id === p.id;
                    return (
                    <Card
                      key={p.id}
                      className={cn(
                        'customer-card-hover customer-offering-card relative cursor-pointer overflow-hidden border-2 shadow-md transition-all',
                        isSelected
                          ? 'customer-offering-card--selected border-primary'
                          : 'border-transparent bg-card',
                      )}
                      onClick={() => selectPackage(p)}
                    >
                      {isSelected && (
                        <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Selected
                        </div>
                      )}
                      <div className="aspect-[16/9] overflow-hidden">
                        <CoverImage
                          src={p.image_url}
                          alt={p.name}
                          kind="package"
                          entityId={p.id}
                          entityName={p.name}
                          entityDescription={p.description}
                          className="h-full w-full"
                        />
                      </div>
                      <CardContent className="customer-offering-card-body flex items-end justify-between gap-4 p-6">
                        <div>
                          <h3 className={cn('customer-offering-card-title font-heading text-lg font-semibold', isSelected && 'text-primary')}>
                            {p.name}
                          </h3>
                          {p.description && (
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                          )}
                          <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                            <Gift className="h-4 w-4" />
                            {p.total_sessions} session{p.total_sessions !== 1 ? 's' : ''} · {p.validity_days} days
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Includes {p.service_ids.length} service{p.service_ids.length !== 1 ? 's' : ''} · ~
                            {packageDurationMinutes(p, services)} min visit
                          </p>
                        </div>
                        <span className="text-2xl font-bold text-primary">${p.price}</span>
                      </CardContent>
                    </Card>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="customer-booking-flow">
            <h2 className="font-heading text-2xl font-semibold">Choose your professional</h2>
            <p className="mt-2 text-muted-foreground">
              {packagePrefilled && selectedPackage
                ? `${selectedPackage.name} at ${branch?.name}`
                : `Specialists available for ${lineTitle} at ${branch?.name}`}
            </p>
            <div className="customer-booking-cards-scroll customer-booking-cards-grid customer-booking-cards-grid--compact mt-8">
              {staffOptions.length === 0 ? (
                <p className="text-muted-foreground">
                  No staff available for this {activeOfferingType === 'package' ? 'package' : 'service'}.
                </p>
              ) : (
                staffOptions.map((e) => (
                  <Card
                    key={e.id}
                    className={cn(
                      'customer-booking-select-card customer-card-hover customer-staff-select-card cursor-pointer overflow-hidden shadow-md',
                      employee?.id === e.id && 'customer-card-selected',
                    )}
                    onClick={() => selectEmployee(e)}
                  >
                    <CardContent className="flex items-center gap-4 p-5 text-left md:gap-5 md:p-6">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-muted/30">
                        <CoverImage
                          src={e.image_url}
                          alt={e.name}
                          kind="staff"
                          entityId={e.id}
                          entityName={e.name}
                          entityDescription={e.bio}
                          className="h-16 w-16"
                        />
                      </div>
                      <div className="customer-staff-card-body min-w-0 flex-1">
                        <h3 className="font-heading text-lg font-semibold leading-tight">{e.name}</h3>
                        <div className="mt-1 flex items-center justify-between gap-3 text-sm">
                          <span className="text-muted-foreground">{getStaffRoleLabel(e.role)}</span>
                          {e.rating != null && (
                            <span className="flex shrink-0 items-center gap-1 font-medium text-accent">
                              <Star className="h-4 w-4 fill-current" />
                              {e.rating} rating
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="customer-booking-flow mx-auto max-w-3xl">
            <h2 className="font-heading text-2xl font-semibold">Date & time</h2>
            <p className="mt-2 text-muted-foreground">
              With {employee?.name} ·{' '}
              <span className="font-medium text-foreground">{lineDuration} min appointment</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Each slot is your full appointment window. Unavailable times are hidden or marked.
            </p>
            <Card className="mt-8 border-0 text-left shadow-md">
              <CardContent className="space-y-6 p-6 md:p-8">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-base">
                    Appointment date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    className="h-12 text-base"
                    min={format(startOfToday(), 'yyyy-MM-dd')}
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setTime('');
                    }}
                  />
                </div>
                {date && (
                  <div>
                    <Label className="mb-3 block text-base">
                      {loadingSlots ? 'Checking availability…' : 'Select a time'}
                    </Label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {durationDaySlots.map((slot) => {
                        const isPast = date ? isSlotInPast(date, slot, now) : false;
                        const isBooked = !isPast && bookedSlotSet.has(slot);
                        const isStaffBusy = !isPast && !isBooked && staffBusySlotSet.has(slot);
                        const isUnavailable = isPast || isBooked;
                        const isSelected = time === slot && !isUnavailable;
                        const windowLabel =
                          lineDuration > 0
                            ? formatBookingTimeWindowCompact(slot, lineDuration)
                            : slot;
                        return (
                          <Button
                            key={slot}
                            type="button"
                            disabled={isUnavailable}
                            variant={isSelected ? 'default' : isUnavailable ? 'secondary' : 'outline'}
                            className={cn(
                              'h-auto min-h-12 flex-col gap-0.5 px-2 py-2.5 text-center',
                              isUnavailable && 'cursor-not-allowed border-dashed opacity-70',
                              isStaffBusy && !isUnavailable && 'border-primary/25 bg-primary/5',
                            )}
                            onClick={() => {
                              if (!isUnavailable) setTime(slot);
                            }}
                          >
                            <span
                              className={cn(
                                'text-xs font-semibold leading-tight sm:text-sm',
                                isUnavailable && 'text-muted-foreground line-through',
                              )}
                            >
                              {windowLabel}
                            </span>
                            {isPast && (
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-destructive">
                                Past
                              </span>
                            )}
                            {isBooked && (
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-destructive">
                                Unavailable
                              </span>
                            )}
                            {isStaffBusy && (
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-primary/80">
                                Busy
                              </span>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                    {durationDaySlots.length === 0 && lineDuration > 0 && !loadingSlots && (
                      <p className="mt-4 text-sm text-destructive">
                        No start times fit a {lineDuration}-minute visit on this date. Try another day or
                        service.
                      </p>
                    )}
                    {availableSlots.length === 0 && durationDaySlots.length > 0 && !loadingSlots && (
                      <p className="mt-4 text-sm text-destructive">
                        {employee?.name} is fully booked on this date. Try another day or choose another
                        professional.
                      </p>
                    )}
                    {availableSlots.length > 0 && bookedSlots.length > 0 && (
                      <p className="mt-4 text-sm text-muted-foreground">
                        {availableSlots.length} time window{availableSlots.length !== 1 ? 's' : ''}{' '}
                        available for your {lineDuration}-minute visit
                      </p>
                    )}
                    {time && lineDuration > 0 && (
                      <p className="mt-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
                        Selected:{' '}
                        <span className="font-semibold text-foreground">
                          {formatBookingTimeWindow(time, lineDuration)}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {step === 4 && (
          <div className="customer-booking-flow mx-auto max-w-2xl">
            <h2 className="font-heading text-2xl font-semibold">Payment method</h2>
            <p className="mt-2 text-muted-foreground">
              Total: <span className="font-bold text-primary">${finalPrice.toFixed(2)}</span>
            </p>
            <div className="mt-8 space-y-4 text-left">
              {PAYMENT_METHODS.map((method) => {
                const Icon = PAYMENT_ICONS[method.id];
                return (
                  <Card
                    key={method.id}
                    className={cn(
                      'customer-card-hover cursor-pointer overflow-hidden shadow-md',
                      paymentMethod === method.id && 'customer-card-selected',
                    )}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <CardContent className="flex items-center gap-5 p-6">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <p className="font-heading text-lg font-semibold">{method.label}</p>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {step === 5 && hasOffering && branch && employee && paymentMethod && (
          <div className="customer-booking-flow mx-auto max-w-2xl">
            <h2 className="font-heading text-2xl font-semibold">Review & confirm</h2>
            {!isAuthenticated && (
              <Card className="mt-6 border-primary/25 bg-primary/5 shadow-sm">
                <CardContent className="space-y-4 p-6">
                  <div>
                    <h3 className="font-heading text-lg font-semibold">Your contact details</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      We&apos;ll send your confirmation to this email. No account required.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="guest-name">Full name</Label>
                      <Input
                        id="guest-name"
                        className="h-11"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Jane Smith"
                        required
                        autoComplete="name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guest-email">Email</Label>
                      <Input
                        id="guest-email"
                        type="email"
                        className="h-11"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="you@email.com"
                        required
                        autoComplete="email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guest-phone">Phone (optional)</Label>
                      <Input
                        id="guest-phone"
                        type="tel"
                        className="h-11"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="For salon to reach you"
                        autoComplete="tel"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <Card className="mt-8 border-0 text-left shadow-lg">
              <CardContent className="space-y-5 p-6 md:p-8">
                <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-4">
                  <CalendarCheck className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-semibold">
                      {date}
                      {time && lineDuration > 0
                        ? ` · ${formatBookingTimeWindow(time, lineDuration)}`
                        : time
                          ? ` at ${time}`
                          : ''}
                    </p>
                    <p className="text-sm text-muted-foreground">{branch.name}</p>
                  </div>
                </div>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">
                      {activeOfferingType === 'package' ? 'Package' : 'Service'}
                    </dt>
                    <dd className="font-medium">{lineTitle}</dd>
                  </div>
                  {selectedPackage && (
                    <div>
                      <dt className="text-muted-foreground">Sessions</dt>
                      <dd className="font-medium">
                        {selectedPackage.total_sessions} · {selectedPackage.validity_days} days validity
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-muted-foreground">Stylist</dt>
                    <dd className="font-medium">{employee.name}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Duration</dt>
                    <dd className="font-medium">{lineDuration} min</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Payment</dt>
                    <dd className="font-medium">{paymentLabel}</dd>
                  </div>
                </dl>
                <CouponPicker
                  options={couponOptions}
                  isLoading={couponsLoading}
                  orderAmount={linePrice}
                  selectedCode={couponCode}
                  appliedDiscount={discount}
                  onCodeChange={setCouponCode}
                  onApply={applyCoupon}
                  onClear={() => setDiscount(0)}
                  isApplying={couponApplying}
                  signedIn={!!bookingEmail}
                />
                <p className="font-heading text-2xl font-bold">Total: ${finalPrice.toFixed(2)}</p>
                <div className="space-y-2">
                  <Label htmlFor="notes">Special requests (optional)</Label>
                  <Textarea
                    id="notes"
                    rows={3}
                    className="customer-booking-field min-h-[5.5rem] resize-y pl-4 pr-4 py-3"
                    placeholder="Any notes for your stylist..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="customer-booking-nav mt-12 flex items-center justify-between gap-3 border-t pt-8 sm:gap-4 max-lg:mt-4 max-lg:border-t-0 max-lg:pt-0">
          <div className="min-w-0 flex-1">
            {step > 0 && (
              <Button
                variant="outline"
                size="lg"
                className="w-full max-w-[9.5rem] rounded-full px-4 sm:w-auto sm:px-8 max-lg:min-h-11 max-lg:max-w-none"
                onClick={goBack}
              >
                <ChevronLeft className="mr-1 h-4 w-4 shrink-0" /> Back
              </Button>
            )}
          </div>
          <div className="flex shrink-0 justify-end">
            {step < STEP_COUNT - 1 ? (
              <Button
                size="lg"
                className="rounded-full px-6 shadow-md sm:px-10 max-lg:min-h-11 max-lg:px-7 max-lg:font-semibold"
                disabled={!canGoNext}
                onClick={goNext}
              >
                Continue <ChevronRight className="ml-1 h-4 w-4 shrink-0" />
              </Button>
            ) : (
              <Button
                size="lg"
                className="rounded-full px-5 sm:px-10 max-lg:min-h-11 max-lg:px-7 max-lg:font-semibold"
                disabled={bookMutation.isPending || !canConfirm}
                onClick={submit}
              >
                {bookMutation.isPending ? 'Confirming...' : 'Confirm booking'}
              </Button>
            )}
          </div>
        </div>
        </div>
      </section>
    </div>
  );
}
