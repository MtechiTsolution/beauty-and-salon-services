import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { CalendarDays, DollarSign, Users, TrendingUp } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

const COLORS = ['hsl(30,45%,30%)', 'hsl(38,60%,55%)', 'hsl(150,40%,40%)', 'hsl(200,50%,45%)', 'hsl(340,50%,50%)'];

export default function AdminReports() {
  const { data: bookings = [] } = useQuery({ queryKey: ['report-bookings'], queryFn: () => base44.entities.Booking.list('-created_date', 500) });
  const { data: employees = [] } = useQuery({ queryKey: ['report-employees'], queryFn: () => base44.entities.Employee.list() });
  const { data: services = [] } = useQuery({ queryKey: ['report-services'], queryFn: () => base44.entities.Service.list() });
  const { data: branches = [] } = useQuery({ queryKey: ['report-branches'], queryFn: () => base44.entities.Branch.list() });

  // Revenue by day (last 30 days)
  const last30 = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
  const revenueByDay = last30.map(d => {
    const dateStr = format(d, 'yyyy-MM-dd');
    const dayBookings = bookings.filter(b => b.date === dateStr && b.payment_status === 'paid');
    return { date: format(d, 'MMM dd'), revenue: dayBookings.reduce((s, b) => s + (b.final_price || b.price || 0), 0), bookings: dayBookings.length };
  });

  // Staff performance
  const staffPerf = employees.map(e => ({
    name: e.name?.substring(0, 10),
    bookings: bookings.filter(b => b.employee_id === e.id).length,
    revenue: bookings.filter(b => b.employee_id === e.id && b.payment_status === 'paid').reduce((s, b) => s + (b.final_price || b.price || 0), 0),
  })).sort((a, b) => b.revenue - a.revenue);

  // Service popularity
  const servicePop = services.map(s => ({
    name: s.title?.substring(0, 15),
    value: bookings.filter(b => b.service_id === s.id).length,
  })).filter(s => s.value > 0).sort((a, b) => b.value - a.value).slice(0, 8);

  // Branch revenue
  const branchRev = branches.map(b => ({
    name: b.name?.substring(0, 12),
    revenue: bookings.filter(bk => bk.branch_id === b.id && bk.payment_status === 'paid').reduce((s, bk) => s + (bk.final_price || bk.price || 0), 0),
  }));

  const totalRevenue = bookings.filter(b => b.payment_status === 'paid').reduce((s, b) => s + (b.final_price || b.price || 0), 0);
  const completedCount = bookings.filter(b => b.status === 'completed').length;

  return (
    <div>
      <div className="mb-6"><h1 className="font-heading text-2xl font-bold">Reports & Analytics</h1><p className="text-sm text-muted-foreground mt-1">Business performance insights</p></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toFixed(0)}`, icon: DollarSign, color: 'bg-accent/20 text-accent' },
          { label: 'Total Bookings', value: bookings.length, icon: CalendarDays, color: 'bg-primary/10 text-primary' },
          { label: 'Completed', value: completedCount, icon: TrendingUp, color: 'bg-green-100 text-green-700' },
          { label: 'Active Staff', value: employees.filter(e => e.status === 'active').length, icon: Users, color: 'bg-blue-100 text-blue-700' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-5 flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">{s.label}</p><p className="text-2xl font-bold mt-1">{s.value}</p></div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}><s.icon className="w-5 h-5" /></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList><TabsTrigger value="revenue">Revenue</TabsTrigger><TabsTrigger value="staff">Staff Performance</TabsTrigger><TabsTrigger value="services">Service Popularity</TabsTrigger><TabsTrigger value="branches">Branch Revenue</TabsTrigger></TabsList>

        <TabsContent value="revenue">
          <Card><CardHeader><CardTitle className="text-base">Revenue (Last 30 Days)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={revenueByDay}><CartesianGrid strokeDasharray="3 3" stroke="hsl(35,15%,88%)" /><XAxis dataKey="date" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Line type="monotone" dataKey="revenue" stroke="hsl(30,45%,30%)" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="bookings" stroke="hsl(38,60%,55%)" strokeWidth={2} dot={false} /></LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <Card><CardHeader><CardTitle className="text-base">Staff Performance</CardTitle></CardHeader>
            <CardContent>
              {staffPerf.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={staffPerf}><CartesianGrid strokeDasharray="3 3" stroke="hsl(35,15%,88%)" /><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Bar dataKey="revenue" fill="hsl(30,45%,30%)" radius={[4,4,0,0]} /><Bar dataKey="bookings" fill="hsl(38,60%,55%)" radius={[4,4,0,0]} /></BarChart>
                </ResponsiveContainer>
              ) : <p className="text-center text-muted-foreground py-12">No data</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card><CardHeader><CardTitle className="text-base">Service Popularity</CardTitle></CardHeader>
            <CardContent>
              {servicePop.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart><Pie data={servicePop} cx="50%" cy="50%" innerRadius={70} outerRadius={120} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>{servicePop.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart>
                </ResponsiveContainer>
              ) : <p className="text-center text-muted-foreground py-12">No data</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branches">
          <Card><CardHeader><CardTitle className="text-base">Revenue by Branch</CardTitle></CardHeader>
            <CardContent>
              {branchRev.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={branchRev}><CartesianGrid strokeDasharray="3 3" stroke="hsl(35,15%,88%)" /><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Bar dataKey="revenue" fill="hsl(38,60%,55%)" radius={[4,4,0,0]} /></BarChart>
                </ResponsiveContainer>
              ) : <p className="text-center text-muted-foreground py-12">No data</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}