import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { MapPin, Clock, User, CalendarDays, Check, ArrowLeft, ArrowRight, Scissors } from 'lucide-react';
import { format, addDays, isBefore, startOfToday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = ['Branch', 'Service', 'Staff', 'Date & Time', 'Confirm'];

const TIME_SLOTS = [
  '09:00','09:30','10:00','10:30','11:00','11:30',
  '12:00','12:30','13:00','13:30','14:00','14:30',
  '15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00'
];

export default function BookAppointment() {
  const [step, setStep] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const queryClient = useQueryClient();
  const { data: branches = [] } = useQuery({ queryKey: ['branches-book'], queryFn: () => base44.entities.Branch.filter({ status: 'active' }) });
  const { data: services = [] } = useQuery({ queryKey: ['services-book'], queryFn: () => base44.entities.Service.filter({ status: 'active' }) });
  const { data: employees = [] } = useQuery({ queryKey: ['employees-book'], queryFn: () => base44.entities.Employee.filter({ status: 'active' }) });
  const { data: existingBookings = [] } = useQuery({
    queryKey: ['bookings-avail', selectedDate, selectedEmployee?.id],
    queryFn: () => selectedDate ? base44.entities.Booking.filter({ date: format(selectedDate, 'yyyy-MM-dd'), employee_id: selectedEmployee?.id }) : [],
    enabled: !!selectedDate && !!selectedEmployee,
  });

  const branchServices = services.filter(s => !selectedBranch || s.branch_ids?.includes(selectedBranch.id));
  const serviceEmployees = employees.filter(e => {
    const branchMatch = !selectedBranch || e.branch_id === selectedBranch.id;
    const serviceMatch = !selectedService || e.service_ids?.includes(selectedService.id);
    return branchMatch && serviceMatch;
  });

  const bookedTimes = existingBookings.filter(b => b.status !== 'cancelled').map(b => b.time_slot);
  const availableSlots = TIME_SLOTS.filter(t => !bookedTimes.includes(t));

  const bookMutation = useMutation({
    mutationFn: (data) => base44.entities.Booking.create(data),
    onSuccess: () => {
      toast.success('Booking created successfully!');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setStep(5); // success step
    },
  });

  const applyCoupon = async () => {
    const coupons = await base44.entities.Coupon.filter({ code: couponCode, status: 'active' });
    if (coupons.length === 0) { toast.error('Invalid coupon code'); return; }
    const coupon = coupons[0];
    if (coupon.expiry_date && isBefore(new Date(coupon.expiry_date), new Date())) { toast.error('Coupon expired'); return; }
    const discountAmt = coupon.discount_type === 'percentage'
      ? (selectedService.price * coupon.discount_value / 100)
      : coupon.discount_value;
    setDiscount(discountAmt);
    toast.success(`Discount of $${discountAmt.toFixed(2)} applied!`);
  };

  const handleBook = () => {
    if (!user) { base44.auth.redirectToLogin(); return; }
    const finalPrice = Math.max(0, selectedService.price - discount);
    bookMutation.mutate({
      customer_email: user.email,
      customer_name: user.full_name,
      branch_id: selectedBranch.id,
      branch_name: selectedBranch.name,
      service_id: selectedService.id,
      service_title: selectedService.title,
      employee_id: selectedEmployee.id,
      employee_name: selectedEmployee.name,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time_slot: selectedTime,
      duration_minutes: selectedService.duration_minutes,
      price: selectedService.price,
      discount,
      final_price: finalPrice,
      coupon_code: couponCode || undefined,
      notes: notes || undefined,
      status: 'pending',
      payment_status: 'unpaid',
    });
  };

  const canGoNext = () => {
    if (step === 0) return !!selectedBranch;
    if (step === 1) return !!selectedService;
    if (step === 2) return !!selectedEmployee;
    if (step === 3) return !!selectedDate && !!selectedTime;
    return true;
  };

  if (step === 5) {
    return (
      <div className="py-20 text-center max-w-lg mx-auto px-4">
        <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-accent" />
        </div>
        <h2 className="font-heading text-3xl font-bold mb-3">Booking Confirmed!</h2>
        <p className="text-muted-foreground mb-8">Your appointment has been booked. You'll receive a confirmation shortly.</p>
        <div className="flex gap-4 justify-center">
          <Button asChild variant="outline" className="rounded-full"><a href="/my-bookings">View Bookings</a></Button>
          <Button onClick={() => { setStep(0); setSelectedBranch(null); setSelectedService(null); setSelectedEmployee(null); setSelectedDate(null); setSelectedTime(null); setDiscount(0); setCouponCode(''); setNotes(''); }} className="rounded-full">Book Another</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl lg:text-4xl font-bold mb-2">Book Appointment</h1>
          <p className="text-muted-foreground">Follow the steps to schedule your visit</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">{i + 1}</span>
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`w-6 h-0.5 ${i < step ? 'bg-primary' : 'bg-muted'}`} />}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            {/* Step 0: Branch */}
            {step === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {branches.map(b => (
                  <Card key={b.id} className={`p-5 cursor-pointer transition-all hover:shadow-md ${selectedBranch?.id === b.id ? 'ring-2 ring-primary border-primary' : ''}`} onClick={() => setSelectedBranch(b)}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><MapPin className="w-5 h-5 text-primary" /></div>
                      <div>
                        <h3 className="font-semibold">{b.name}</h3>
                        <p className="text-sm text-muted-foreground">{b.address}</p>
                      </div>
                    </div>
                  </Card>
                ))}
                {branches.length === 0 && <p className="col-span-full text-center text-muted-foreground py-8">No branches available</p>}
              </div>
            )}

            {/* Step 1: Service */}
            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {branchServices.map(s => (
                  <Card key={s.id} className={`p-5 cursor-pointer transition-all hover:shadow-md ${selectedService?.id === s.id ? 'ring-2 ring-primary border-primary' : ''}`} onClick={() => setSelectedService(s)}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0"><Scissors className="w-5 h-5 text-accent" /></div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{s.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="font-bold text-primary">${s.price}</span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{s.duration_minutes}min</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Step 2: Staff */}
            {step === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {serviceEmployees.map(e => (
                  <Card key={e.id} className={`p-5 cursor-pointer transition-all hover:shadow-md text-center ${selectedEmployee?.id === e.id ? 'ring-2 ring-primary border-primary' : ''}`} onClick={() => setSelectedEmployee(e)}>
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      {e.image_url ? <img src={e.image_url} alt={e.name} className="w-full h-full rounded-full object-cover" /> : <User className="w-7 h-7 text-primary" />}
                    </div>
                    <h3 className="font-semibold">{e.name}</h3>
                    <Badge variant="secondary" className="mt-1 text-xs capitalize">{e.role}</Badge>
                  </Card>
                ))}
                {serviceEmployees.length === 0 && <p className="col-span-full text-center text-muted-foreground py-8">No staff available for this service</p>}
              </div>
            )}

            {/* Step 3: Date & Time */}
            {step === 3 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-3">Select Date</h3>
                  <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} disabled={(date) => isBefore(date, startOfToday())} className="rounded-xl border" />
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Select Time</h3>
                  {selectedDate ? (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map(t => (
                        <Button key={t} size="sm" variant={selectedTime === t ? 'default' : 'outline'} onClick={() => setSelectedTime(t)} className="rounded-lg">{t}</Button>
                      ))}
                      {availableSlots.length === 0 && <p className="col-span-3 text-center text-muted-foreground py-4">No available slots</p>}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">Please select a date first</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Confirm */}
            {step === 4 && (
              <Card className="p-8">
                <h3 className="font-heading text-xl font-bold mb-6">Booking Summary</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Branch</span><span className="font-medium">{selectedBranch?.name}</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Service</span><span className="font-medium">{selectedService?.title}</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Staff</span><span className="font-medium">{selectedEmployee?.name}</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Date</span><span className="font-medium">{selectedDate && format(selectedDate, 'PPP')}</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Time</span><span className="font-medium">{selectedTime}</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Duration</span><span className="font-medium">{selectedService?.duration_minutes} min</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Price</span><span className="font-medium">${selectedService?.price}</span></div>
                  {discount > 0 && <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Discount</span><span className="font-medium text-accent">-${discount.toFixed(2)}</span></div>}
                  <div className="flex justify-between py-2 text-lg font-bold"><span>Total</span><span>${Math.max(0, (selectedService?.price || 0) - discount).toFixed(2)}</span></div>
                </div>

                <div className="flex gap-2 mb-4">
                  <Input placeholder="Coupon code" value={couponCode} onChange={e => setCouponCode(e.target.value)} className="rounded-lg" />
                  <Button variant="outline" onClick={applyCoupon} className="rounded-lg shrink-0">Apply</Button>
                </div>

                <Textarea placeholder="Special notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} className="mb-6 rounded-lg" rows={3} />

                <Button onClick={handleBook} disabled={bookMutation.isPending} className="w-full rounded-full" size="lg">
                  {bookMutation.isPending ? 'Booking...' : 'Confirm Booking'}
                </Button>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {step < 5 && (
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="rounded-full gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            {step < 4 && (
              <Button onClick={() => setStep(step + 1)} disabled={!canGoNext()} className="rounded-full gap-2">
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}