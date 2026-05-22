import { bookingsApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function ReportsAdminPage() {
  const { data: bookings = [] } = useQuery({ queryKey: ['reports-bookings'], queryFn: () => bookingsApi.list() });

  const revenueByMonth = bookings.reduce<Record<string, number>>((acc, b) => {
    const month = b.date.slice(0, 7);
    acc[month] = (acc[month] ?? 0) + (b.final_price || 0);
    return acc;
  }, {});

  const chartData = Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue }));

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-2">Reports</h1>
      <p className="text-muted-foreground mb-8">Revenue and booking analytics</p>
      <Card>
        <CardHeader><CardTitle>Revenue by month</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="hsl(30,45%,30%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
