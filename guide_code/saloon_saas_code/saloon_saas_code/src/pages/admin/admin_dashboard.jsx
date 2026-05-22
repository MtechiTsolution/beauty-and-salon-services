import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, DollarSign, Users, TrendingUp, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(30,45%,30%)', 'hsl(38,60%,55%)', 'hsl(150,40%,40%)', 'hsl(200,50%,45%)', 'hsl(340,50%,50%)'];

export default function Dashboard() {
  const { data: bookings = [] } = useQuery({ queryKey: ['admin-bookings'], queryFn: () => base44.entities.Booking.list('-created_date', 100) });
  const { data: employees = [] } = useQuery({ queryKey: ['admin-employees'], queryFn: () => base44.entities.Employee.list() });
  const { data: branches = [] } = useQuery({ queryKey: ['admin-branches'], queryFn: () => base44.entities.Branch.list() });
  const { data: services = [] } = useQuery({ queryKey: ['admin-services'], queryFn: () => base44.entities.Service.list() });

  const totalRevenue = bookings.filter(b => b.payment_status === 'paid').reduce((sum, b) => sum + (b.final_price || b.price || 0), 0);
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const todayBookings = bookings.filter(b => b.date === format(new Date(), 'yyyy-MM-dd')).length;

  const statusData = ['pending', 'confirmed', 'completed', 'cancelled'].map(s => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    value: bookings.filter(b => b.status === s).length,
  })).filter(d => d.value > 0);

  const recentBookings = bookings.slice(0, 8);

  const branchData = branches.map(b => ({
    name: b.name?.substring(0, 12),
    bookings: bookings.filter(bk => bk.branch_id === b.id).length,
  }));

  const stats = [
    { label: 'Total Bookings', value: bookings.length, icon: CalendarDays, color: 'bg-primary/10 text-primary' },
    { label: 'Revenue', value: `$${totalRevenue.toFixed(0)}`, icon: DollarSign, color: 'bg-accent/20 text-accent' },
    { label: 'Pending', value: pendingBookings, icon: Clock, color: 'bg-amber-100 text-amber-700' },
    { label: "Today's Bookings", value: todayBookings, icon: TrendingUp, color: 'bg-green-100 text-green-700' },
  ];

  const statusColors = {
    Pending: 'bg-amber-100 text-amber-800',
    Confirmed: 'bg-blue-100 text-blue-800',
    Completed: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl lg:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your business overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle className="text-base">Bookings by Branch</CardTitle></CardHeader>
          <CardContent>
            {branchData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={branchData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(35,15%,88%)" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="hsl(30,45%,30%)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-center py-12 text-sm">No data yet</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Booking Status</CardTitle></CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-center py-12 text-sm">No data yet</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Bookings</CardTitle></CardHeader>
        <CardContent>
          {recentBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-3 px-2 font-medium">Customer</th>
                    <th className="text-left py-3 px-2 font-medium">Service</th>
                    <th className="text-left py-3 px-2 font-medium">Date</th>
                    <th className="text-left py-3 px-2 font-medium">Status</th>
                    <th className="text-right py-3 px-2 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map(b => (
                    <tr key={b.id} className="border-b last:border-0">
                      <td className="py-3 px-2">{b.customer_name || b.customer_email}</td>
                      <td className="py-3 px-2">{b.service_title}</td>
                      <td className="py-3 px-2">{b.date} {b.time_slot}</td>
                      <td className="py-3 px-2"><Badge className={`${statusColors[b.status?.charAt(0).toUpperCase() + b.status?.slice(1)] || 'bg-muted'} border-0 capitalize text-xs`}>{b.status}</Badge></td>
                      <td className="py-3 px-2 text-right font-medium">${(b.final_price || b.price || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-muted-foreground text-center py-8 text-sm">No bookings yet</p>}
        </CardContent>
      </Card>
    </div>
  );
}