import { BookingOfferingRating } from '@/features/booking/components/BookingOfferingRating';
import { BookingOfferingToggle, type BookingOfferingType } from '@/features/booking/components/BookingOfferingToggle';
import { BookingSearchField } from '@/features/booking/components/BookingSearchField';
import { BookingStepper } from '@/features/booking/components/BookingStepper';
import { CouponPicker } from '@/features/booking/components/CouponPicker';
import { CatalogPopularBadge } from '@/features/catalog/components/CatalogPopularBadge';
import { BookingStatusHighlights } from '@/features/my-bookings/components/BookingStatusHighlights';
import { CUSTOMER_BOOKING_STEPS } from '@/features/booking/lib/booking-steps';
import { useBookingBranch } from '@/features/booking/context/BookingBranchContext';
import { BookingSalonFooter } from '@/features/layout/CustomerFooter';
import {
  clearActiveBookingDraft,
  clearAllBookingDrafts,
  getBookingDraftScope,
  loadActiveBookingDraft,
  migrateSessionBookingDraftToGuestEmail,
  saveActiveBookingDraft,
} from '@/features/booking/lib/booking-draft';
import {
  bookingLineTitle,
  packageDurationMinutes,
  packagePrimaryServiceId,
} from '@/features/booking/lib/bookingOffering';
import {
  filterBranchesForBookingSearch,
  filterPackagesForBookingSearch,
  filterServicesForBookingSearch,
} from '@/features/booking/lib/booking-search';
import {
  getBookableBranches,
  getBranchesForPackage,
  getBranchesForService,
  isPackageAvailableAtAnyBranch,
  isPackageAvailableAtBranch,
  isServiceAvailableAtAnyBranch,
} from '@/features/packages/lib/package-branches';
import { useCustomerBranches } from '@/features/location/hooks/useCustomerBranches';
import { useCustomerLocation } from '@/features/location/context/CustomerLocationContext';
import { BranchNearYouLabel } from '@/features/location/components/BranchNearYouLabel';
import { sortBranchesByProximity } from '@mit-salon/shared/lib/branch-distance';
import { useActivePackages } from '@/features/packages/hooks/useActivePackages';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  bookingsApi,
  couponsApiExtra,
  employeesApi,
  reviewsApi,
  servicesApi,
  staffTimeOffApi,
} from '@mit-salon/shared/api';
import { CoverImage } from '@mit-salon/shared/components/CoverImage';
import { useFormatMoney } from '@mit-salon/shared/hooks/useCurrency';
import { branchImageHints } from '@mit-salon/shared/lib/branch-image-hints';
import {
  branchRatingForBookingChoice,
  packageRatingAtBranch,
  packageReviewOfferingIds,
  serviceRatingAtBranch,
  sortBranchesForBookingRating,
  sortOfferingsByBranchRating,
} from '@mit-salon/shared/lib/branch-offering-reviews';
import { buildBranchReviewStats } from '@mit-salon/shared/lib/salon-review-stats';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent } from '@mit-salon/shared/components/ui/card';
import { BookingDatePickerInput } from '@/features/booking/components/BookingDatePickerInput';
import { FieldError, FormTextField } from '@mit-salon/shared/components/FormField';
import { Label } from '@mit-salon/shared/components/ui/label';
import { Textarea } from '@mit-salon/shared/components/ui/textarea';
import {
  EMAIL_RE,
  type FieldErrors,
  hasFieldErrors,
  validateEmail,
  validateFullName,
  validateNotes,
  validatePhone,
} from '@mit-salon/shared/lib/form-validation';
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
  NO_SERVICE_FOR_DAY_MESSAGE,
  PAST_BOOKING_DATE_MESSAGE,
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
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const PAYMENT_ICONS: Record<PaymentMethodId, typeof CreditCard> = {
  card: CreditCard,
  wallet: Smartphone,
  cash: Banknote,
};

const STEP_COUNT = CUSTOMER_BOOKING_STEPS.length;
const BOOKING_DRAFT_RESUME_TOAST_ID = 'booking-draft-resume';

export default function BookAppointmentPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const formatMoney = useFormatMoney();
  const { setBookingBranch } = useBookingBranch();
  const [step, setStep] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [step]);

  const [packagePrefilled, setPackagePrefilled] = useState(false);
  const [servicePrefilled, setServicePrefilled] = useState(false);
  const offeringPrefilled = packagePrefilled || servicePrefilled;
  const [urlBookingApplied, setUrlBookingApplied] = useState(false);
  const [branch, setBranch] = useState<Branch | null>(null);

  useEffect(() => {
    if (branch) {
      setBookingBranch({
        id: branch.id,
        name: branch.name,
        phone: branch.phone,
        email: branch.email,
        address: branch.address,
        city: branch.city,
        opening_time: branch.opening_time,
        closing_time: branch.closing_time,
        image_url: branch.image_url,
      });
    } else {
      setBookingBranch(null);
    }
  }, [branch, setBookingBranch]);
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
  const [guestFieldErrors, setGuestFieldErrors] = useState<
    FieldErrors<'guestName' | 'guestEmail' | 'guestPhone' | 'notes'>
  >({});
  const [done, setDone] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [draftReady, setDraftReady] = useState(false);
  const [resumedDraft, setResumedDraft] = useState(false);
  const draftResumeHandledRef = useRef(false);
  const [clockTick, setClockTick] = useState(0);
  const [salonSearchQuery, setSalonSearchQuery] = useState('');
  const [offeringSearchQuery, setOfferingSearchQuery] = useState('');
  const todayStr = format(startOfToday(), 'yyyy-MM-dd');

  const bookingEmail = user?.email ?? guestEmail.trim();
  const bookingName = user?.full_name ?? guestName.trim();
  const draftScope = useMemo(
    () =>
      getBookingDraftScope({
        userEmail: user?.email,
        guestEmail,
        isAuthenticated,
      }),
    [user?.email, guestEmail, isAuthenticated],
  );
  const guestEmailValid = EMAIL_RE.test(bookingEmail);
  const guestPhoneValid = validatePhone(guestPhone, { required: true }) === null;
  const guestDetailsValid =
    bookingName.length > 0 && guestEmailValid && guestPhoneValid;

  const clearGuestFieldError = (field: keyof typeof guestFieldErrors) => {
    setGuestFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const validateGuestFields = (): boolean => {
    const errors: FieldErrors<'guestName' | 'guestEmail' | 'guestPhone' | 'notes'> = {
      notes: validateNotes(notes),
    };
    if (!isAuthenticated) {
      errors.guestName = validateFullName(guestName);
      errors.guestEmail = validateEmail(guestEmail);
      errors.guestPhone = validatePhone(guestPhone, { required: true });
    }
    setGuestFieldErrors(errors);
    return !hasFieldErrors(errors);
  };

  useEffect(() => {
    if (step !== 0 && salonSearchQuery) setSalonSearchQuery('');
  }, [step, salonSearchQuery]);

  useEffect(() => {
    if (step !== 1 && offeringSearchQuery) setOfferingSearchQuery('');
  }, [step, offeringSearchQuery]);

  useEffect(() => {
    setOfferingSearchQuery('');
  }, [offeringType]);

  useEffect(() => {
    if (step === 3 && employee && !date) {
      setDate(todayStr);
    }
  }, [step, employee, date, todayStr]);

  useEffect(() => {
    if (!date || date >= todayStr) return;
    setDate('');
    setTime('');
    toast.error(PAST_BOOKING_DATE_MESSAGE);
  }, [date, todayStr]);

  const { data: branches = [] } = useCustomerBranches({
    queryKeyPrefix: 'branches-book',
    staleTime: 0,
    refetchInterval: 10_000,
  });
  const { data: services = [] } = useQuery({
    queryKey: ['services-book'],
    queryFn: () => servicesApi.list(),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 10_000,
  });
  const { data: employees = [] } = useQuery({
    queryKey: ['employees-book'],
    queryFn: () => employeesApi.list(),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 10_000,
  });
  const { data: packages = [] } = useActivePackages(true, {
    staleTime: 0,
    refetchInterval: 10_000,
  });
  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews-book'],
    queryFn: () => reviewsApi.list(),
    staleTime: 60_000,
  });
  const branchReviewStats = useMemo(() => buildBranchReviewStats(reviews), [reviews]);
  const { data: dayBookings = [], isFetching: loadingSlots } = useQuery({
    queryKey: ['bookings-slot', date, employee?.id],
    queryFn: () => bookingsApi.filter({ date, employee_id: employee!.id }),
    enabled: !!date && !!employee && step === 3,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: step === 3 && date && employee ? 5000 : false,
  });

  const { data: staffTimeOffBlocks = [] } = useQuery({
    queryKey: ['staff-time-off-slot', employee?.id, date],
    queryFn: () =>
      staffTimeOffApi.list({
        employee_id: employee!.id,
        from: date,
        to: date,
      }),
    enabled: !!date && !!employee && step === 3,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: step === 3 && date && employee ? 5000 : false,
  });

  const activeBranches = branches.filter((b) => b.status === 'active');
  const bookableServices = useMemo(
    () => services.filter((s) => isServiceAvailableAtAnyBranch(s, activeBranches)),
    [services, activeBranches],
  );
  const bookablePackages = useMemo(
    () => packages.filter((p) => isPackageAvailableAtAnyBranch(p, activeBranches)),
    [packages, activeBranches],
  );
  const bookableBranches = useMemo(
    () => getBookableBranches(activeBranches, bookableServices, bookablePackages),
    [activeBranches, bookableServices, bookablePackages],
  );
  const { coords } = useCustomerLocation();
  const branchChoices = useMemo(() => {
    let choices;
    if (packagePrefilled && selectedPackage) {
      choices = getBranchesForPackage(selectedPackage, activeBranches, bookableServices);
    } else if (servicePrefilled && service) {
      choices = getBranchesForService(service, activeBranches);
    } else {
      choices = bookableBranches;
    }
    const withDistance = sortBranchesByProximity(choices, coords);
    return sortBranchesForBookingRating(withDistance, (branchId) =>
      branchRatingForBookingChoice(reviews, branchId, {
        branchStats: branchReviewStats,
        prefilledService: servicePrefilled && service ? service : null,
        prefilledPackage: packagePrefilled && selectedPackage ? selectedPackage : null,
      }),
    );
  }, [
    packagePrefilled,
    servicePrefilled,
    selectedPackage,
    service,
    activeBranches,
    bookableServices,
    bookableBranches,
    coords,
    reviews,
    branchReviewStats,
  ]);
  const filteredBranchChoices = useMemo(
    () => filterBranchesForBookingSearch(branchChoices, salonSearchQuery),
    [branchChoices, salonSearchQuery],
  );
  const branchServices = useMemo(() => {
    if (!branch) return [];
    const list = bookableServices.filter((s) => s.branch_ids.includes(branch.id));
    return sortOfferingsByBranchRating(
      list,
      branch.id,
      reviews,
      (s) => [s.id],
      (s) => s.title,
    );
  }, [bookableServices, branch, reviews]);
  const branchPackages = useMemo(() => {
    if (!branch) return [];
    const list = bookablePackages.filter((p) =>
      isPackageAvailableAtBranch(p, branch.id, activeBranches, bookableServices),
    );
    return sortOfferingsByBranchRating(
      list,
      branch.id,
      reviews,
      (p) => packageReviewOfferingIds(p),
      (p) => p.name,
    );
  }, [bookablePackages, branch, activeBranches, bookableServices, reviews]);
  const filteredBranchServices = useMemo(
    () => filterServicesForBookingSearch(branchServices, offeringSearchQuery),
    [branchServices, offeringSearchQuery],
  );
  const filteredBranchPackages = useMemo(
    () => filterPackagesForBookingSearch(branchPackages, offeringSearchQuery),
    [branchPackages, offeringSearchQuery],
  );
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
  const staffOptions = useMemo(
    () =>
      branch && activeOfferingType === 'service' && service
        ? filterStaffForBooking(employees, branch.id, service.id)
        : branch && activeOfferingType === 'package' && selectedPackage
          ? filterStaffForPackage(employees, branch.id, selectedPackage.service_ids)
          : [],
    [branch, activeOfferingType, service, selectedPackage, employees],
  );
  const bookingDisabledSteps = useMemo(() => {
    const disabled: number[] = [];
    if (offeringPrefilled) disabled.push(1);
    return disabled;
  }, [offeringPrefilled]);

  const staffOptionIds = useMemo(
    () => staffOptions.map((e) => e.id).join(','),
    [staffOptions],
  );

  useEffect(() => {
    if (!branch || !hasOffering) return;

    if (staffOptions.length === 1) {
      const only = staffOptions[0];
      setEmployee((current) => (current?.id === only.id ? current : only));
      return;
    }

    // Multiple (or zero) staff: never auto-select when the available list changes.
    setEmployee(null);
  }, [branch?.id, hasOffering, activeOfferingType, service?.id, selectedPackage?.id, staffOptionIds, staffOptions]);

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
            timeOffBlocks: staffTimeOffBlocks,
            slotDate: date,
          })
        : [],
    [date, employee, lineDuration, staffDayBookings, durationDaySlots, staffTimeOffBlocks],
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
      setStep((current) => (current >= 3 ? 3 : current));
      return;
    }
    if (!lineDuration) return;
    if (isSlotBlockedForNewBooking(time, lineDuration, staffDayBookings)) {
      setTime('');
      toast.error(STAFF_SLOT_CONFLICT_MESSAGE);
      setStep((current) => (current >= 3 ? 3 : current));
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
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: !!bookingEmail && hasOffering && linePrice > 0 ? 5_000 : false,
  });

  const hasProgress = step > 0 || !!branch;

  useEffect(() => {
    if (done || urlBookingApplied) return;
    const packageId = searchParams.get('package');
    const serviceId = searchParams.get('service');
    const branchId = searchParams.get('branch');
    if (!packageId && !serviceId && !branchId) return;
    if (!branches.length || !bookableServices.length) return;

    const finishUrlBooking = () => {
      setSearchParams({}, { replace: true });
      setUrlBookingApplied(true);
      setDraftReady(true);
    };

    clearAllBookingDrafts({ userEmail: user?.email, guestEmail });

    if (packageId) {
      if (!bookablePackages.length) return;
      const pkg = bookablePackages.find((p) => p.id === packageId);
      if (!pkg) {
        toast.error('Package not found or no longer available');
        finishUrlBooking();
        return;
      }

      setOfferingType('package');
      setSelectedPackage(pkg);
      setPackagePrefilled(true);
      setServicePrefilled(false);
      setService(null);
      setEmployee(null);
      setDate('');
      setTime('');
      setDiscount(0);
      setCouponCode('');
      setResumedDraft(false);

      if (branchId) {
        const b = getBranchesForPackage(pkg, activeBranches, bookableServices).find((x) => x.id === branchId);
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

      finishUrlBooking();
      return;
    }

    if (serviceId) {
      const svc = bookableServices.find((s) => s.id === serviceId);
      if (!svc) {
        toast.error('Service not found or no longer available');
        finishUrlBooking();
        return;
      }

      setOfferingType('service');
      setService(svc);
      setServicePrefilled(true);
      setPackagePrefilled(false);
      setSelectedPackage(null);
      setEmployee(null);
      setDate('');
      setTime('');
      setDiscount(0);
      setCouponCode('');
      setResumedDraft(false);

      if (branchId) {
        const b = getBranchesForService(svc, activeBranches).find((x) => x.id === branchId);
        if (!b) {
          toast.error('This salon does not offer the selected service');
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

      finishUrlBooking();
      return;
    }

    if (branchId) {
      const b = bookableBranches.find((x) => x.id === branchId);
      if (!b) {
        toast.error('Salon not found or has no bookable services yet');
        finishUrlBooking();
        return;
      }

      setBranch(b);
      setOfferingType('service');
      setService(null);
      setSelectedPackage(null);
      setPackagePrefilled(false);
      setServicePrefilled(false);
      setEmployee(null);
      setDate('');
      setTime('');
      setDiscount(0);
      setCouponCode('');
      setResumedDraft(false);
      setStep(1);
      finishUrlBooking();
    }
  }, [
    done,
    urlBookingApplied,
    searchParams,
    branches.length,
    bookablePackages,
    bookableServices,
    activeBranches,
    bookableBranches,
    user?.email,
    setSearchParams,
  ]);

  useEffect(() => {
    if (!draftScope || draftReady || done || urlBookingApplied) return;
    if (draftResumeHandledRef.current) return;
    if (!branches.length || !services.length || !employees.length) return;
    if (searchParams.get('package') || searchParams.get('service') || searchParams.get('branch')) return;

    const draft = loadActiveBookingDraft(draftScope);
    if (!draft) {
      draftResumeHandledRef.current = true;
      setDraftReady(true);
      return;
    }

    const restoredBranch = draft.branchId
      ? bookableBranches.find((b) => b.id === draft.branchId) ?? null
      : null;

    if (draft.branchId && !restoredBranch) {
      clearActiveBookingDraft(draftScope);
      draftResumeHandledRef.current = true;
      setDraftReady(true);
      return;
    }

    // Mark handled before state updates so Strict Mode's double effect only toasts once.
    draftResumeHandledRef.current = true;

    if (restoredBranch) setBranch(restoredBranch);
    setOfferingType(draft.offeringType);

    if (draft.serviceId) {
      const s = bookableServices.find((x) => x.id === draft.serviceId);
      if (s) setService(s);
    }
    if (draft.packageId) {
      const p = bookablePackages.find((x) => x.id === draft.packageId);
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
    if (!isAuthenticated) {
      if (draft.guestName) setGuestName(draft.guestName);
      if (draft.guestEmail) setGuestEmail(draft.guestEmail);
      if (draft.guestPhone) setGuestPhone(draft.guestPhone);
    }
    const resumeStep = Math.min(Math.max(0, draft.step), STEP_COUNT - 1);
    setStep(resumeStep);
    setResumedDraft(true);
    setDraftReady(true);
    toast.info(`Resuming your booking from step ${resumeStep + 1}`, {
      id: BOOKING_DRAFT_RESUME_TOAST_ID,
    });
  }, [
    draftScope,
    branches.length,
    services.length,
    employees.length,
    bookableServices,
    bookablePackages,
    bookableBranches,
    draftReady,
    done,
    isAuthenticated,
    urlBookingApplied,
    searchParams,
  ]);

  useEffect(() => {
    if (isAuthenticated || !guestEmailValid || !draftReady) return;
    migrateSessionBookingDraftToGuestEmail(guestEmail);
  }, [isAuthenticated, guestEmail, guestEmailValid, draftReady]);

  useEffect(() => {
    if (!draftScope || done || !draftReady) return;
    if (!hasProgress) {
      clearActiveBookingDraft(draftScope);
      return;
    }
    saveActiveBookingDraft(draftScope, {
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
      guestName: !isAuthenticated && guestName.trim() ? guestName.trim() : undefined,
      guestEmail: !isAuthenticated && guestEmail.trim() ? guestEmail.trim().toLowerCase() : undefined,
      guestPhone: !isAuthenticated && guestPhone.trim() ? guestPhone.trim() : undefined,
      savedAt: new Date().toISOString(),
    });
  }, [
    draftScope,
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
    isAuthenticated,
    guestName,
    guestEmail,
    guestPhone,
  ]);

  const discardDraft = () => {
    clearAllBookingDrafts({ userEmail: user?.email, guestEmail });
    setStep(0);
    setBranch(null);
    setOfferingType('service');
    setService(null);
    setSelectedPackage(null);
    setPackagePrefilled(false);
    setServicePrefilled(false);
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
      clearAllBookingDrafts({ userEmail: user?.email, guestEmail });
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

  const selectBranch = (b: Branch, options?: { keepPackage?: boolean; keepService?: boolean }) => {
    setBranch(b);
    if (!options?.keepService) {
      setService(null);
      setServicePrefilled(false);
    }
    if (!options?.keepPackage) {
      setSelectedPackage(null);
      setPackagePrefilled(false);
    }
    setEmployee(null);
    setDate('');
    setTime('');
    setDiscount(0);
    setCouponCode('');
    // Do not auto-advance — user confirms with Continue (especially when multiple salons exist).
  };

  const goBack = () => {
    setStep((s) => {
      if (s === 2 && offeringPrefilled) return 0;
      return Math.max(0, s - 1);
    });
  };

  const goToStep = (target: number) => {
    if (target >= step || target < 0) return;
    if (target === 1 && offeringPrefilled) return;
    setStep(target);
  };

  const goNext = () => {
    setStep((s) => {
      const next = Math.min(STEP_COUNT - 1, s + 1);
      // After salon selection with a prefilled service/package, skip the offering step.
      if (s === 0 && offeringPrefilled && next === 1) {
        return 2;
      }
      return next;
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
      toast.success(`Discount ${formatMoney(amt)} applied`);
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
      date >= todayStr &&
      !!time &&
      !isSlotInPast(date, time, now) &&
      !isSlotBlockedForNewBooking(time, lineDuration, staffDayBookings)) ||
    (step === 4 && !!paymentMethod);

  const canConfirm =
    !!branch &&
    hasOffering &&
    !!employee &&
    !!date &&
    date >= todayStr &&
    !!time &&
    !!paymentMethod &&
    (isAuthenticated || guestDetailsValid) &&
    !isSlotInPast(date, time, now) &&
    !isSlotBlockedForNewBooking(time, lineDuration, staffDayBookings);

  const confirmBlockReason = useMemo(() => {
    if (canConfirm) return null;
    if (!time) {
      return date
        ? 'Your time slot is no longer available. Please choose a new time.'
        : 'Please choose a date and time for your visit.';
    }
    if (!paymentMethod) return 'Please select a payment method.';
    if (!isAuthenticated && !guestDetailsValid) {
      return bookingName.length === 0
        ? 'Please enter your full name to continue.'
        : !guestEmailValid
          ? 'Please enter a valid email address to continue.'
          : 'Please enter a valid phone number to continue.';
    }
    if (date && time && isSlotInPast(date, time, now)) return PAST_SLOT_MESSAGE;
    if (date && time && isSlotBlockedForNewBooking(time, lineDuration, staffDayBookings)) {
      return STAFF_SLOT_CONFLICT_MESSAGE;
    }
    return 'Please complete all required booking details.';
  }, [
    canConfirm,
    time,
    date,
    paymentMethod,
    isAuthenticated,
    guestDetailsValid,
    guestEmailValid,
    bookingName.length,
    now,
    lineDuration,
    staffDayBookings,
  ]);

  const submit = async () => {
    if (!branch || !hasOffering || !employee || !date || !time || !paymentMethod) return;
    if (!validateGuestFields()) return;
    if (!isAuthenticated && !guestDetailsValid) return;

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
      <div className="customer-page customer-booking-confirm-page flex w-full min-w-0 justify-center px-3 sm:px-4">
        <Card className="customer-booking-confirm-card w-full min-w-0 max-w-lg border-0 shadow-lg sm:shadow-xl">
          <CardContent className="customer-booking-confirm-content p-2.5 text-center sm:p-4 md:p-5">
            <div className="customer-booking-confirm-hero min-w-0">
              <div className="customer-booking-confirm-hero-icon mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-green-100 sm:h-9 sm:w-9">
                <CheckCircle2 className="h-4 w-4 text-green-600 sm:h-5 sm:w-5" />
              </div>
              <h1 className="font-heading mt-1.5 text-balance text-base font-bold sm:mt-2 sm:text-lg md:text-xl">
                You&apos;re all set!
              </h1>
              <p className="customer-booking-confirm-hero-copy mx-auto mt-0.5 max-w-prose text-pretty text-[11px] text-muted-foreground sm:text-xs">
                {isAuthenticated
                  ? 'Confirmation sent to your account and email.'
                  : `Confirmation will be sent to ${bookingEmail}.`}
              </p>
            </div>

            <div className="customer-booking-confirm-details mt-2 min-w-0 sm:mt-2.5">
              <div className="customer-booking-confirm-detail-row">
                <span className="customer-booking-confirm-detail-label">
                  <MapPin className="h-3 w-3 shrink-0" aria-hidden />
                  Salon
                </span>
                <span className="customer-booking-confirm-detail-value">{branch?.name}</span>
              </div>
              <div className="customer-booking-confirm-detail-row">
                <span className="customer-booking-confirm-detail-label">
                  <Scissors className="h-3 w-3 shrink-0" aria-hidden />
                  Service
                </span>
                <span className="customer-booking-confirm-detail-value">{lineTitle}</span>
              </div>
              <div className="customer-booking-confirm-detail-row">
                <span className="customer-booking-confirm-detail-label">
                  <User className="h-3 w-3 shrink-0" aria-hidden />
                  Stylist
                </span>
                <span className="customer-booking-confirm-detail-value">{employee?.name}</span>
              </div>
              <div className="customer-booking-confirm-detail-row">
                <span className="customer-booking-confirm-detail-label">
                  <CalendarDays className="h-3 w-3 shrink-0" aria-hidden />
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
              <div className="customer-booking-confirm-status mt-2 min-w-0 text-left sm:mt-2.5">
                <BookingStatusHighlights
                  bookingStatus={confirmedBooking.status}
                  paymentStatus={confirmedBooking.payment_status}
                  compact
                />
              </div>
            )}

            <div className="customer-booking-confirm-price mt-2 min-w-0 sm:mt-2.5">
              <p className="customer-booking-confirm-price-amount text-lg font-bold text-primary sm:text-xl">
                {formatMoney(finalPrice)}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">{paymentLabel}</p>
            </div>

            <div className="customer-booking-confirm-actions mt-2.5 flex flex-col gap-1.5 sm:mt-3 sm:flex-row sm:gap-2">
              {isAuthenticated && confirmedBooking && (
                <Button
                  asChild
                  className="customer-booking-confirm-btn h-8 w-full flex-1 rounded-full text-xs sm:h-9 sm:text-sm"
                  size="lg"
                >
                  <Link to={`/messages/booking/${confirmedBooking.id}`}>
                    <MessageCircle className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Chat with salon</span>
                  </Link>
                </Button>
              )}
              {isAuthenticated ? (
                <Button
                  asChild={!!confirmedBooking}
                  className="customer-booking-confirm-btn h-8 w-full flex-1 rounded-full text-xs sm:h-9 sm:text-sm"
                  size="lg"
                  variant={confirmedBooking ? 'outline' : 'default'}
                  onClick={confirmedBooking ? undefined : () => navigate('/my-bookings')}
                >
                  {confirmedBooking ? (
                    <Link to={`/my-bookings/${confirmedBooking.id}`}>
                      <span className="truncate">View my booking</span>
                    </Link>
                  ) : (
                    'View my bookings'
                  )}
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    className="customer-booking-confirm-btn h-8 w-full flex-1 rounded-full text-xs sm:h-9 sm:text-sm"
                    size="lg"
                  >
                    <Link to="/login" state={{ from: { pathname: '/my-bookings' } }}>
                      Sign in to manage
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="customer-booking-confirm-btn h-8 w-full flex-1 rounded-full text-xs sm:h-9 sm:text-sm"
                    size="lg"
                  >
                    <Link to="/register">Create account</Link>
                  </Button>
                </>
              )}
            </div>

            {!isAuthenticated && confirmedBooking && (
              <p className="customer-booking-confirm-ref mt-1.5 break-all text-[10px] leading-snug text-muted-foreground sm:mt-2 sm:text-[11px]">
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
    <div className="customer-page customer-booking-page min-w-0 w-full max-w-full pb-0">
      <section className="customer-booking-page-header border-b bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/90">
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
                  disabledSteps={bookingDisabledSteps}
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
                  disabledSteps={bookingDisabledSteps}
                />
              </div>
            </div>
        </div>
      </section>

      <div className="customer-booking-main">
      <div className="customer-booking-scroll">
      <section className="customer-container-wide customer-booking-page-body py-4 max-md:py-4 md:py-5">
        <div className="customer-booking-flow-wide min-w-0">
        {step === 0 && (
          <div className="customer-booking-step customer-booking-step--locations mx-auto w-full min-w-0">
            <h2 className="font-heading text-balance text-lg font-semibold sm:text-xl md:text-2xl">
              {packagePrefilled && selectedPackage
                ? 'Choose salon for your package'
                : servicePrefilled && service
                  ? 'Choose salon for your service'
                  : 'Choose your location'}
            </h2>
            <p className="mt-1 text-pretty text-sm text-muted-foreground sm:text-base">
              {packagePrefilled && selectedPackage ? (
                <>
                  Booking{' '}
                  <span className="inline-flex flex-wrap items-center gap-2 font-medium text-foreground">
                    {selectedPackage.name}
                    <CatalogPopularBadge
                      entityType="package"
                      entityId={selectedPackage.id}
                      isFeatured={selectedPackage.is_featured}
                      variant="chip"
                    />
                  </span>{' '}
                  — {branchChoices.length} salon{branchChoices.length !== 1 ? 's' : ''} available. Salons with
                  reviews for this package are listed first.
                  {branchChoices.length > 1
                    ? ' Select a salon, then tap Continue — nothing is chosen automatically.'
                    : null}
                </>
              ) : servicePrefilled && service ? (
                <>
                  Booking{' '}
                  <span className="inline-flex flex-wrap items-center gap-2 font-medium text-foreground">
                    {service.title}
                    <CatalogPopularBadge
                      entityType="service"
                      entityId={service.id}
                      isFeatured={service.is_featured}
                      variant="chip"
                    />
                  </span>{' '}
                  — {branchChoices.length} salon{branchChoices.length !== 1 ? 's' : ''} available. Salons with
                  reviews for this service are listed first.
                  {branchChoices.length > 1
                    ? ' Select a salon, then tap Continue — nothing is chosen automatically.'
                    : null}
                </>
              ) : (
                <>
                  {branchChoices.length} salon{branchChoices.length !== 1 ? 's' : ''} available — salons with
                  reviews are listed first. Tap to select
                  {branchChoices.length > 1 ? ', then Continue' : ''}.
                </>
              )}
            </p>
            {packagePrefilled && selectedPackage && (
              <div className="mx-auto mt-4 flex max-w-lg items-center gap-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm">
                <Gift className="h-5 w-5 shrink-0 text-primary" />
                <span className="inline-flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{selectedPackage.name}</span>
                  <CatalogPopularBadge
                    entityType="package"
                    entityId={selectedPackage.id}
                    isFeatured={selectedPackage.is_featured}
                    variant="chip"
                  />
                  <span>is already selected — pick a salon to continue.</span>
                </span>
              </div>
            )}
            {servicePrefilled && service && (
              <div className="mx-auto mt-4 flex max-w-lg items-center gap-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm">
                <Scissors className="h-5 w-5 shrink-0 text-primary" />
                <span className="inline-flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{service.title}</span>
                  <CatalogPopularBadge
                    entityType="service"
                    entityId={service.id}
                    isFeatured={service.is_featured}
                    variant="chip"
                  />
                  <span>is already selected — pick a salon to continue.</span>
                </span>
              </div>
            )}
            {branchChoices.length > 0 && (
              <BookingSearchField
                id="booking-salon-search"
                className="mt-4 md:mt-5"
                value={salonSearchQuery}
                onChange={setSalonSearchQuery}
                placeholder="Search salons by name, city, or address…"
                resultCount={filteredBranchChoices.length}
                totalCount={branchChoices.length}
                resultLabel="salons"
              />
            )}
            <div className="customer-booking-cards-scroll customer-booking-cards-grid customer-booking-cards-grid--locations mt-4 md:mt-5">
              {branchChoices.length === 0 ? (
                <p className="col-span-full py-12 text-center text-muted-foreground">
                  {offeringPrefilled
                    ? `No salons offer this ${packagePrefilled ? 'package' : 'service'} right now.`
                    : (
                      <>
                        No bookable salons yet. <Link to="/explore" className="text-primary underline">Explore</Link>
                      </>
                    )}
                </p>
              ) : filteredBranchChoices.length === 0 ? (
                <p className="col-span-full py-12 text-center text-muted-foreground">
                  No salons match your search. Try a different name, city, or address.
                </p>
              ) : (
                filteredBranchChoices.map((b) => (
                  <Card
                    key={b.id}
                    className={cn(
                      'customer-booking-select-card customer-card-hover cursor-pointer overflow-hidden shadow-md',
                      branch?.id === b.id && 'customer-card-selected',
                    )}
                    onClick={() =>
                      selectBranch(b, {
                        keepPackage: packagePrefilled,
                        keepService: servicePrefilled,
                      })
                    }
                  >
                    <div className="customer-service-card-media aspect-[2/1] overflow-hidden">
                      <CoverImage
                        src={b.image_url}
                        alt={b.name}
                        kind="branch"
                        entityId={b.id}
                        entityName={b.name}
                        entityDescription={branchImageHints(b)}
                        className="h-full w-full"
                      />
                      <BranchNearYouLabel
                        distanceKm={b.distance_km}
                        isNearest={branchChoices.find((x) => x.distance_km != null)?.id === b.id}
                        branch={b}
                        className="landing-showcase-card__nearby-badge"
                      />
                    </div>
                    <CardContent className="customer-branch-card-body p-3 text-left md:p-3.5">
                      <div className="grid grid-cols-[1rem_minmax(0,1fr)] gap-x-1.5 gap-y-1">
                        <h3 className="col-start-2 font-heading text-base font-semibold leading-snug md:text-[1.05rem]">
                          {b.name}
                        </h3>
                        <MapPin className="col-start-1 row-start-2 mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <p className="customer-branch-card-address col-start-2 row-start-2 min-w-0 text-xs leading-snug text-muted-foreground md:text-[0.8125rem]">
                          {b.address}
                          {b.city ? `, ${b.city}` : ''}
                        </p>
                      </div>
                      <BookingOfferingRating
                        className="mt-1.5"
                        showStars={false}
                        stats={branchRatingForBookingChoice(reviews, b.id, {
                          branchStats: branchReviewStats,
                          prefilledService: servicePrefilled && service ? service : null,
                          prefilledPackage: packagePrefilled && selectedPackage ? selectedPackage : null,
                        })}
                        prefix={
                          offeringPrefilled && (service || selectedPackage)
                            ? packagePrefilled
                              ? 'Package rating at this salon'
                              : 'Service rating at this salon'
                            : undefined
                        }
                      />
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {step === 1 && !offeringPrefilled && (
          <div className="customer-booking-flow">
            <h2 className="font-heading text-2xl font-semibold">Service or package</h2>
            <p className="mt-2 hidden text-muted-foreground lg:block">
              At {branch?.name} — choose what you want to book
            </p>
            <div className="mt-4 flex justify-center lg:mt-6">
              <BookingOfferingToggle value={offeringType} onChange={selectOfferingType} />
            </div>

            {offeringType === 'service' ? (
              <>
                {branchServices.length > 0 && (
                  <BookingSearchField
                    id="booking-service-search"
                    className="mt-6"
                    value={offeringSearchQuery}
                    onChange={setOfferingSearchQuery}
                    placeholder="Search services by name or description…"
                    resultCount={filteredBranchServices.length}
                    totalCount={branchServices.length}
                    resultLabel="services"
                  />
                )}
              <div className="customer-booking-cards-scroll customer-booking-cards-grid mt-8">
                {branchServices.length === 0 ? (
                  <p className="col-span-full text-muted-foreground">No services at this branch.</p>
                ) : filteredBranchServices.length === 0 ? (
                  <p className="col-span-full text-muted-foreground">
                    No services match your search. Try another keyword.
                  </p>
                ) : (
                  filteredBranchServices.map((s) => {
                    const isSelected = service?.id === s.id;
                    return (
                    <Card
                      key={s.id}
                      className={cn(
                        'customer-card-hover customer-offering-card relative flex h-full cursor-pointer flex-col overflow-hidden border-2 shadow-md transition-all',
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
                      <div className="customer-service-card-media relative aspect-[2/1] shrink-0 overflow-hidden">
                        <CoverImage
                          src={s.image_url}
                          alt={s.title}
                          kind="service"
                          entityId={s.id}
                          entityName={s.title}
                          entityDescription={s.description}
                          className="h-full w-full"
                        />
                        <CatalogPopularBadge
                          entityType="service"
                          entityId={s.id}
                          isFeatured={s.is_featured}
                          variant="overlay"
                        />
                      </div>
                      <CardContent className="customer-offering-card-body flex flex-1 flex-col p-3.5 md:p-4">
                        <h3
                          className={cn(
                            'customer-offering-card-title font-heading text-base font-semibold leading-snug',
                            isSelected && 'text-primary',
                          )}
                        >
                          {s.title}
                        </h3>
                        <div className="customer-offering-card-rating mt-1.5 flex min-h-[1.5rem] items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <BookingOfferingRating
                              stats={branch && serviceRatingAtBranch(reviews, branch.id, s)}
                            />
                          </div>
                          <span className="shrink-0 text-lg font-bold text-primary md:text-xl">
                            {formatMoney(s.price)}
                          </span>
                        </div>
                        <p className="customer-offering-card-meta mt-auto flex items-center gap-1 pt-2 text-xs text-muted-foreground md:text-sm">
                          <Scissors className="h-3.5 w-3.5 shrink-0" />
                          {s.duration_minutes} minutes
                        </p>
                      </CardContent>
                    </Card>
                    );
                  })
                )}
              </div>
              </>
            ) : (
              <>
                {branchPackages.length > 0 && (
                  <BookingSearchField
                    id="booking-package-search"
                    className="mt-6"
                    value={offeringSearchQuery}
                    onChange={setOfferingSearchQuery}
                    placeholder="Search packages by name or description…"
                    resultCount={filteredBranchPackages.length}
                    totalCount={branchPackages.length}
                    resultLabel="packages"
                  />
                )}
              <div className="customer-booking-cards-scroll customer-booking-cards-grid mt-8">
                {branchPackages.length === 0 ? (
                  <p className="col-span-full text-muted-foreground">
                    No packages at this branch yet. Try a single service instead.
                  </p>
                ) : filteredBranchPackages.length === 0 ? (
                  <p className="col-span-full text-muted-foreground">
                    No packages match your search. Try another keyword.
                  </p>
                ) : (
                  filteredBranchPackages.map((p) => {
                    const isSelected = selectedPackage?.id === p.id;
                    return (
                    <Card
                      key={p.id}
                      className={cn(
                        'customer-card-hover customer-offering-card relative flex h-full cursor-pointer flex-col overflow-hidden border-2 shadow-md transition-all',
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
                      <div className="customer-service-card-media relative aspect-[2/1] shrink-0 overflow-hidden">
                        <CoverImage
                          src={p.image_url}
                          alt={p.name}
                          kind="package"
                          entityId={p.id}
                          entityName={p.name}
                          entityDescription={p.description}
                          className="h-full w-full"
                        />
                        <CatalogPopularBadge
                          entityType="package"
                          entityId={p.id}
                          isFeatured={p.is_featured}
                          variant="overlay"
                        />
                      </div>
                      <CardContent className="customer-offering-card-body flex flex-1 flex-col p-3.5 md:p-4">
                        <h3
                          className={cn(
                            'customer-offering-card-title font-heading text-base font-semibold leading-snug',
                            isSelected && 'text-primary',
                          )}
                        >
                          {p.name}
                        </h3>
                        <div className="customer-offering-card-rating mt-1.5 flex min-h-[1.5rem] items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <BookingOfferingRating
                              stats={branch && packageRatingAtBranch(reviews, branch.id, p)}
                            />
                          </div>
                          <span className="shrink-0 text-lg font-bold text-primary md:text-xl">
                            {formatMoney(p.price)}
                          </span>
                        </div>
                        {p.description ? (
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground md:text-sm">
                            {p.description}
                          </p>
                        ) : null}
                        <div className="customer-offering-card-meta mt-auto pt-2">
                          <p className="flex items-center gap-1 text-xs text-muted-foreground md:text-sm">
                            <Gift className="h-3.5 w-3.5 shrink-0" />
                            {p.total_sessions} session{p.total_sessions !== 1 ? 's' : ''} · {p.validity_days}{' '}
                            days
                          </p>
                          <p className="mt-0.5 text-[0.6875rem] text-muted-foreground md:text-xs">
                            Includes {p.service_ids.length} service
                            {p.service_ids.length !== 1 ? 's' : ''} · ~
                            {packageDurationMinutes(p, services)} min visit
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    );
                  })
                )}
              </div>
              </>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="customer-booking-flow">
            <h2 className="font-heading text-2xl font-semibold">Choose your professional</h2>
            {staffOptions.length === 1 && employee ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Only one stylist is available for this booking — they are pre-selected. Tap Continue when
                you&apos;re ready.
              </p>
            ) : staffOptions.length > 1 ? (
              <p className="mt-2 text-muted-foreground">
                {staffOptions.length} professionals available — choose one to continue (none are selected
                automatically).
              </p>
            ) : (
            <p className="mt-2 text-muted-foreground">
              {packagePrefilled && selectedPackage ? (
                <span className="inline-flex flex-wrap items-center gap-2">
                  {selectedPackage.name}
                  <CatalogPopularBadge
                    entityType="package"
                    entityId={selectedPackage.id}
                    isFeatured={selectedPackage.is_featured}
                    variant="chip"
                  />
                  <span>at {branch?.name}</span>
                </span>
              ) : servicePrefilled && service ? (
                <span className="inline-flex flex-wrap items-center gap-2">
                  {service.title}
                  <CatalogPopularBadge
                    entityType="service"
                    entityId={service.id}
                    isFeatured={service.is_featured}
                    variant="chip"
                  />
                  <span>at {branch?.name}</span>
                </span>
              ) : (
                <span className="inline-flex flex-wrap items-center gap-2">
                  <span>
                    Specialists available for {lineTitle} at {branch?.name}
                  </span>
                  {service ? (
                    <CatalogPopularBadge
                      entityType="service"
                      entityId={service.id}
                      isFeatured={service.is_featured}
                      variant="chip"
                    />
                  ) : selectedPackage ? (
                    <CatalogPopularBadge
                      entityType="package"
                      entityId={selectedPackage.id}
                      isFeatured={selectedPackage.is_featured}
                      variant="chip"
                    />
                  ) : null}
                </span>
              )}
            </p>
            )}
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
                  <BookingDatePickerInput
                    id="date"
                    className="h-12 text-base"
                    minDate={todayStr}
                    value={date}
                    onChange={(next) => {
                      setDate(next);
                      setTime('');
                    }}
                  />
                </div>
                {date && (
                  <div>
                    <Label className="mb-3 block text-base">
                      {loadingSlots ? 'Checking availability…' : 'Select a time'}
                    </Label>
                    {loadingSlots ? (
                      <p className="text-sm text-muted-foreground">Checking availability…</p>
                    ) : lineDuration > 0 && availableSlots.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-border/80 bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                        {NO_SERVICE_FOR_DAY_MESSAGE}
                      </p>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {step === 4 && (
          <div className="customer-booking-flow customer-booking-step--payment mx-auto w-full max-w-3xl">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-heading text-sm font-semibold sm:text-base">Payment method</h2>
              <p className="shrink-0 text-xs text-muted-foreground sm:text-sm">
                Total: <span className="font-bold text-primary">{formatMoney(finalPrice)}</span>
              </p>
            </div>
            <div className="customer-booking-payment-grid mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {PAYMENT_METHODS.map((method) => {
                const Icon = PAYMENT_ICONS[method.id];
                return (
                  <button
                    key={method.id}
                    type="button"
                    className={cn(
                      'customer-booking-payment-card flex w-full min-w-0 items-center gap-2.5 rounded-lg border border-border/70 bg-card px-3 py-2 text-left transition-colors',
                      'hover:border-primary/35 hover:bg-muted/40',
                      paymentMethod === method.id &&
                        'border-primary bg-primary/5 shadow-[0_0_0_1px_hsl(var(--primary)/0.35)]',
                    )}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold leading-tight">
                        {method.label}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] leading-tight text-muted-foreground">
                        {method.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 5 && hasOffering && branch && employee && paymentMethod && (
          <div className="customer-booking-flow customer-booking-step--confirm mx-auto w-full max-w-5xl">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-heading text-sm font-semibold sm:text-base">Review & confirm</h2>
              <p className="shrink-0 font-heading text-sm font-bold text-primary sm:text-base">
                Total: {formatMoney(finalPrice)}
              </p>
            </div>

            <div className="customer-booking-confirm-layout mt-1.5">
              {!isAuthenticated && (
                <section className="customer-booking-confirm-guest min-w-0 rounded-lg border border-primary/20 bg-primary/5 p-2.5 sm:p-3">
                  <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    <h3 className="font-heading text-sm font-semibold leading-snug">Your contact details</h3>
                    <p className="min-w-0 flex-1 text-[11px] leading-snug text-muted-foreground sm:text-xs">
                      Confirmation goes to this email.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <FormTextField
                      id="guest-name"
                      label="Full name"
                      className="customer-booking-field h-9 text-sm"
                      wrapperClassName="space-y-1 min-w-0"
                      value={guestName}
                      onChange={(e) => {
                        setGuestName(e.target.value);
                        clearGuestFieldError('guestName');
                      }}
                      error={guestFieldErrors.guestName}
                      placeholder="Jane Smith"
                      autoComplete="name"
                    />
                    <FormTextField
                      id="guest-email"
                      label="Email"
                      type="email"
                      className="customer-booking-field h-9 text-sm"
                      wrapperClassName="space-y-1 min-w-0"
                      value={guestEmail}
                      onChange={(e) => {
                        setGuestEmail(e.target.value);
                        clearGuestFieldError('guestEmail');
                      }}
                      error={guestFieldErrors.guestEmail}
                      placeholder="you@email.com"
                      autoComplete="email"
                    />
                    <FormTextField
                      id="guest-phone"
                      label="Phone"
                      type="tel"
                      className="customer-booking-field h-9 text-sm"
                      wrapperClassName="space-y-1 min-w-0"
                      value={guestPhone}
                      onChange={(e) => {
                        setGuestPhone(e.target.value);
                        clearGuestFieldError('guestPhone');
                      }}
                      error={guestFieldErrors.guestPhone}
                      placeholder="For salon to reach you"
                      autoComplete="tel"
                    />
                  </div>
                </section>
              )}

              <section className="customer-booking-confirm-summary min-w-0 rounded-lg border border-border/60 bg-card p-2.5 text-left shadow-sm sm:p-3">
                <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md bg-muted/45 px-2.5 py-1.5">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <CalendarCheck className="h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold leading-snug">
                        {date}
                        {time && lineDuration > 0
                          ? ` · ${formatBookingTimeWindow(time, lineDuration)}`
                          : time
                            ? ` at ${time}`
                            : ''}
                      </p>
                      {!time ? (
                        <p className="text-xs font-medium text-destructive">
                          Time slot required — pick a new time below.
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <p className="min-w-0 truncate text-xs text-muted-foreground sm:max-w-[42%]">
                    {branch.name}
                  </p>
                </div>

                <div className="customer-booking-confirm-meta mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-[13px]">
                  <p className="min-w-0 leading-snug">
                    <span className="text-muted-foreground">
                      {activeOfferingType === 'package' ? 'Package' : 'Service'}:{' '}
                    </span>
                    <span className="inline-flex max-w-full items-center gap-1 font-medium">
                      <span className="truncate">{lineTitle}</span>
                      {activeOfferingType === 'service' && service ? (
                        <CatalogPopularBadge
                          entityType="service"
                          entityId={service.id}
                          isFeatured={service.is_featured}
                          variant="chip"
                        />
                      ) : null}
                      {activeOfferingType === 'package' && selectedPackage ? (
                        <CatalogPopularBadge
                          entityType="package"
                          entityId={selectedPackage.id}
                          isFeatured={selectedPackage.is_featured}
                          variant="chip"
                        />
                      ) : null}
                    </span>
                  </p>
                  <p className="min-w-0 truncate leading-snug">
                    <span className="text-muted-foreground">Stylist: </span>
                    <span className="font-medium">{employee.name}</span>
                  </p>
                  {selectedPackage ? (
                    <p className="min-w-0 leading-snug">
                      <span className="text-muted-foreground">Sessions: </span>
                      <span className="font-medium">
                        {selectedPackage.total_sessions} · {selectedPackage.validity_days} days
                      </span>
                    </p>
                  ) : null}
                  <p className="min-w-0 leading-snug">
                    <span className="text-muted-foreground">Duration: </span>
                    <span className="font-medium">{lineDuration} min</span>
                  </p>
                  <p className="min-w-0 truncate leading-snug">
                    <span className="text-muted-foreground">Payment: </span>
                    <span className="font-medium">{paymentLabel}</span>
                  </p>
                </div>

                <div className="customer-booking-confirm-footer mt-2 grid gap-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end">
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
                  <div className="space-y-1 min-w-0">
                    <Label htmlFor="notes" className="text-xs">
                      Special requests (optional)
                    </Label>
                    <Textarea
                      id="notes"
                      rows={1}
                      className={`customer-booking-field min-h-[2.25rem] resize-y px-3 py-1.5 text-sm${guestFieldErrors.notes ? ' border-destructive' : ''}`}
                      placeholder="Any notes for your stylist..."
                      value={notes}
                      onChange={(e) => {
                        setNotes(e.target.value);
                        clearGuestFieldError('notes');
                      }}
                      aria-invalid={!!guestFieldErrors.notes}
                    />
                    <FieldError message={guestFieldErrors.notes} />
                  </div>
                </div>

                {!canConfirm &&
                confirmBlockReason &&
                (isAuthenticated || guestDetailsValid) ? (
                  <div
                    className="mt-2 rounded-md border border-destructive/30 bg-destructive/5 px-2.5 py-1.5 text-xs leading-snug text-destructive"
                    role="alert"
                  >
                    <p>{confirmBlockReason}</p>
                    {!time || (date && time && isSlotInPast(date, time, now)) ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-1.5 h-7 rounded-full border-destructive/30 px-3 text-xs text-destructive hover:bg-destructive/10"
                        onClick={() => setStep(3)}
                      >
                        Choose a new time
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </section>
            </div>
          </div>
        )}

        </div>
      </section>

      <nav className="customer-booking-nav" aria-label="Booking steps">
        <div className="customer-booking-nav-inner">
          {step > 0 ? (
            <Button
              variant="outline"
              size="default"
              className="customer-booking-nav-btn customer-booking-nav-btn--back"
              onClick={goBack}
            >
              <ChevronLeft className="mr-1 h-3.5 w-3.5 shrink-0" /> Back
            </Button>
          ) : null}
          {step < STEP_COUNT - 1 ? (
            <Button
              size="default"
              className="customer-booking-nav-btn customer-booking-nav-btn--continue"
              disabled={!canGoNext}
              onClick={goNext}
            >
              Continue <ChevronRight className="ml-1 h-3.5 w-3.5 shrink-0" />
            </Button>
          ) : (
            <Button
              size="default"
              className="customer-booking-nav-btn customer-booking-nav-btn--continue"
              disabled={bookMutation.isPending || !canConfirm}
              title={!canConfirm && confirmBlockReason ? confirmBlockReason : undefined}
              onClick={submit}
            >
              {bookMutation.isPending ? 'Confirming...' : 'Confirm booking'}
            </Button>
          )}
        </div>
      </nav>

      {branch ? <BookingSalonFooter /> : null}
      </div>
      </div>
    </div>
  );
}
