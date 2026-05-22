import { useAuth } from '@/features/auth/context/AuthContext';
import {
  bookingsApi,
  branchesApi,
  couponsApiExtra,
  employeesApi,
  servicesApi,
} from '@/services/api';
import { CoverImage } from '@/shared/components/CoverImage';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { BOOKING_STEPS, TIME_SLOTS } from '@/shared/lib/constants';
import type { Booking, Branch, Employee, Service } from '@/shared/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, startOfToday } from 'date-fns';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function BookAppointmentPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [done, setDone] = useState(false);

  const { data: branches = [] } = useQuery({ queryKey: ['branches-book'], queryFn: () => branchesApi.list() });
  const { data: services = [] } = useQuery({ queryKey: ['services-book'], queryFn: () => servicesApi.list() });
  const { data: employees = [] } = useQuery({ queryKey: ['employees-book'], queryFn: () => employeesApi.list() });
  const { data: dayBookings = [] } = useQuery({
    queryKey: ['bookings-slot', date, employee?.id],
    queryFn: () => bookingsApi.filter({ date, employee_id: employee?.id }),
    enabled: !!date && !!employee,
  });

  const branchServices = services.filter((s) => s.status === 'active' && (!branch || s.branch_ids.includes(branch.id)));
  const staffOptions = employees.filter(
    (e) => e.status === 'active' && (!branch || e.branch_id === branch.id) && (!service || e.service_ids.includes(service.id)),
  );
  const bookedTimes = dayBookings.filter((b) => b.status !== 'cancelled').map((b) => b.time_slot);
  const slots = TIME_SLOTS.filter((t) => !bookedTimes.includes(t));

  const bookMutation = useMutation({
    mutationFn: (data: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) => bookingsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setDone(true);
      toast.success('Booking created!');
    },
  });

  const applyCoupon = async () => {
    const coupon = await couponsApiExtra.validate(couponCode);
    if (!coupon || !service) {
      toast.error('Invalid coupon');
      return;
    }
    const amt = coupon.discount_type === 'percentage' ? service.price * coupon.discount_value / 100 : coupon.discount_value;
    setDiscount(amt);
    toast.success(`Discount $${amt.toFixed(2)} applied`);
  };

  const submit = () => {
    if (!isAuthenticated || !user) {
      toast.error('Please sign in to book');
      navigate('/login');
      return;
    }
    if (!branch || !service || !employee || !date || !time) return;
    const finalPrice = Math.max(0, service.price - discount);
    bookMutation.mutate({
      customer_email: user.email,
      customer_name: user.full_name,
      branch_id: branch.id,
      branch_name: branch.name,
      service_id: service.id,
      service_title: service.title,
      employee_id: employee.id,
      employee_name: employee.name,
      date,
      time_slot: time,
      duration_minutes: service.duration_minutes,
      price: service.price,
      discount,
      final_price: finalPrice,
      coupon_code: couponCode || undefined,
      notes: notes || undefined,
      status: 'pending',
      payment_status: 'unpaid',
    });
  };

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h1 className="font-heading text-3xl font-bold text-green-700">Booking confirmed!</h1>
        <p className="text-muted-foreground mt-4">We will see you on {date} at {time}.</p>
        <Button className="mt-8 rounded-full" onClick={() => navigate('/my-bookings')}>View my bookings</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-heading text-3xl font-bold mb-2">Book appointment</h1>
      <div className="flex gap-2 mb-8 flex-wrap">
        {BOOKING_STEPS.map((label, i) => (
          <span key={label} className={`text-xs px-3 py-1 rounded-full ${i === step ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{i + 1}. {label}</span>
        ))}
      </div>

      {step === 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {branches.filter((b) => b.status === 'active').map((b) => (
            <Card key={b.id} className={`cursor-pointer overflow-hidden ${branch?.id === b.id ? 'ring-2 ring-primary' : ''}`} onClick={() => setBranch(b)}>
              <div className="h-32 overflow-hidden">
                <CoverImage src={b.image_url} alt={b.name} fallback="branch" className="h-32" />
              </div>
              <CardContent className="p-4">
                <p className="font-semibold">{b.name}</p>
                <p className="text-sm text-muted-foreground">{b.address}{b.city ? `, ${b.city}` : ''}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {branchServices.map((s) => (
            <Card key={s.id} className={`cursor-pointer overflow-hidden ${service?.id === s.id ? 'ring-2 ring-primary' : ''}`} onClick={() => setService(s)}>
              <div className="h-28 overflow-hidden">
                <CoverImage src={s.image_url} alt={s.title} className="h-28" />
              </div>
              <CardContent className="p-4 flex justify-between items-center">
                <span className="font-semibold">{s.title}</span>
                <span className="text-primary font-bold">${s.price}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-3">
          {staffOptions.map((e) => (
            <Card key={e.id} className={`cursor-pointer ${employee?.id === e.id ? 'ring-2 ring-primary' : ''}`} onClick={() => setEmployee(e)}>
              <CardContent className="p-4"><p className="font-semibold">{e.name}</p><p className="text-sm capitalize text-muted-foreground">{e.role}</p></CardContent>
            </Card>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <Input type="date" min={format(startOfToday(), 'yyyy-MM-dd')} value={date} onChange={(e) => setDate(e.target.value)} />
          <div className="grid grid-cols-4 gap-2">
            {slots.map((slot) => (
              <Button key={slot} variant={time === slot ? 'default' : 'outline'} size="sm" onClick={() => setTime(slot)}>{slot}</Button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && service && branch && employee && (
        <Card>
          <CardContent className="p-6 space-y-3 text-sm">
            <p><strong>Branch:</strong> {branch.name}</p>
            <p><strong>Service:</strong> {service.title} — ${service.price}</p>
            <p><strong>Staff:</strong> {employee.name}</p>
            <p><strong>When:</strong> {date} at {time}</p>
            <div className="flex gap-2">
              <Input placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
              <Button variant="outline" onClick={applyCoupon}>Apply</Button>
            </div>
            <p className="font-bold text-lg">Total: ${Math.max(0, service.price - discount).toFixed(2)}</p>
            <Input placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between mt-8">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
        {step < 4 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={
            (step === 0 && !branch) || (step === 1 && !service) || (step === 2 && !employee) || (step === 3 && (!date || !time))
          }>Next</Button>
        ) : (
          <Button onClick={submit} disabled={bookMutation.isPending}>Confirm booking</Button>
        )}
      </div>
    </div>
  );
}
