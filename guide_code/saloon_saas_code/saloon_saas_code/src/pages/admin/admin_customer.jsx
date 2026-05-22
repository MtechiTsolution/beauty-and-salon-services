import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, User } from 'lucide-react';

export default function AdminCustomers() {
  const [search, setSearch] = useState('');
  const { data: users = [] } = useQuery({ queryKey: ['admin-users'], queryFn: () => base44.entities.User.list('-created_date') });
  const { data: bookings = [] } = useQuery({ queryKey: ['admin-bookings-cust'], queryFn: () => base44.entities.Booking.list() });

  const customers = users.filter(u => u.role === 'user');
  const filtered = customers.filter(c => !search || c.full_name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()));

  const getBookingCount = (email) => bookings.filter(b => b.customer_email === email).length;
  const getTotalSpent = (email) => bookings.filter(b => b.customer_email === email && b.payment_status === 'paid').reduce((sum, b) => sum + (b.final_price || b.price || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-heading text-2xl font-bold">Customers</h1><p className="text-sm text-muted-foreground mt-1">{customers.length} customers</p></div>
      </div>

      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="border rounded-xl overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Bookings</TableHead><TableHead>Total Spent</TableHead><TableHead>Joined</TableHead></TableRow></TableHeader>
          <TableBody>
            {filtered.map(c => (
              <TableRow key={c.id}>
                <TableCell><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-4 h-4 text-primary" /></div><span className="font-medium">{c.full_name || '-'}</span></div></TableCell>
                <TableCell className="text-sm">{c.email}</TableCell>
                <TableCell className="text-sm">{c.phone || '-'}</TableCell>
                <TableCell><Badge variant="secondary">{getBookingCount(c.email)}</Badge></TableCell>
                <TableCell className="font-medium">${getTotalSpent(c.email).toFixed(2)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.created_date?.split('T')[0]}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No customers found</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}