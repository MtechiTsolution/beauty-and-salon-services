import { bookingsApi, branchesApi, employeesApi, servicesApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarDays, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const COLORS = ['hsl(30,45%,30%)', 'hsl(38,60%,55%)', 'hsl(150,40%,40%)', 'hsl(200,50%,45%)'];

export default function DashboardPage() {
  const { data: bookings = [] } = useQuery({ queryKey: ['admin-bookings'], queryFn: () => bookingsApi.list() });
  const { data: branches = [] } = useQuery({ queryKey: ['admin-branches-dash'], queryFn: () => branchesApi.list() });
  useQuery({ queryKey: ['admin-employees'], queryFn: () => employeesApi.list() });
  useQuery({ queryKey: ['admin-services'], queryFn: () => servicesApi.list() });

  const totalRevenue = bookings.filter((b) => b.payment_status === 'paid').reduce((s, b) => s + (b.final_price || 0), 0);
  const pending = bookings.filter((b) => b.status === 'pending').length;
  const today = bookings.filter((b) => b.date === format(new Date(), 'yyyy-MM-dd')).length;

  const statusData = ['pending', 'confirmed', 'completed', 'cancelled']
    .map((name) => ({ name, value: bookings.filter((b) => b.status === name).length }))
    .filter((d) => d.value > 0);

  const branchData = branches.map((b) => ({
    name: b.name.substring(0, 12),
    bookings: bookings.filter((bk) => bk.branch_id === b.id).length,
  }));

  const stats = [
    { label: 'Total Bookings', value: bookings.length, icon: CalendarDays },
    { label: 'Revenue', value: `$${totalRevenue.toFixed(0)}`, icon: DollarSign },
    { label: 'Pending', value: pending, icon: Clock },
    { label: "Today's", value: today, icon: TrendingUp },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl lg:text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground mt-1 mb-8">Business overview</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-5 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <Icon className="w-8 h-8 text-primary opacity-80" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle className="text-base">Bookings by branch</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={branchData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="bookings" fill="hsl(30,45%,30%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Booking status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent bookings</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {bookings.slice(0, 6).map((b) => (
            <div key={b.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
              <div>
                <p className="font-medium">{b.customer_name}</p>
                <p className="text-muted-foreground">{b.service_title} · {b.date} {b.time_slot}</p>
              </div>
              <StatusBadge status={b.status} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
