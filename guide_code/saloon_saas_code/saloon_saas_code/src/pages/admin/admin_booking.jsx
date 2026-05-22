import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, MoreVertical, CheckCircle, XCircle, Clock, Ban } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const statusColors = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-gray-100 text-gray-800',
};

export default function AdminBookings() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({ queryKey: ['admin-all-bookings'], queryFn: () => base44.entities.Booking.list('-created_date', 200) });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Booking.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-all-bookings'] }); toast.success('Booking updated'); },
  });

  const filtered = bookings.filter(b => {
    const matchSearch = !search || b.customer_name?.toLowerCase().includes(search.toLowerCase()) || b.service_title?.toLowerCase().includes(search.toLowerCase()) || b.customer_email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-heading text-2xl font-bold">Bookings</h1><p className="text-sm text-muted-foreground mt-1">{bookings.length} total bookings</p></div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search bookings..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no_show">No Show</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={8}><div className="h-5 bg-muted animate-pulse rounded" /></TableCell></TableRow>
              ))
            ) : filtered.map(b => (
              <TableRow key={b.id}>
                <TableCell>
                  <div><p className="font-medium text-sm">{b.customer_name || '-'}</p><p className="text-xs text-muted-foreground">{b.customer_email}</p></div>
                </TableCell>
                <TableCell className="text-sm">{b.service_title}</TableCell>
                <TableCell className="text-sm">{b.employee_name || '-'}</TableCell>
                <TableCell className="text-sm">{b.date} {b.time_slot}</TableCell>
                <TableCell><Badge className={`${statusColors[b.status] || 'bg-muted'} border-0 capitalize text-xs`}>{b.status}</Badge></TableCell>
                <TableCell><Badge variant={b.payment_status === 'paid' ? 'default' : 'secondary'} className="capitalize text-xs">{b.payment_status}</Badge></TableCell>
                <TableCell className="font-medium">${(b.final_price || b.price || 0).toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => updateMutation.mutate({ id: b.id, data: { status: 'confirmed' } })}><CheckCircle className="w-4 h-4 mr-2 text-blue-600" /> Confirm</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateMutation.mutate({ id: b.id, data: { status: 'completed', payment_status: 'paid' } })}><CheckCircle className="w-4 h-4 mr-2 text-green-600" /> Complete</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateMutation.mutate({ id: b.id, data: { status: 'cancelled' } })}><XCircle className="w-4 h-4 mr-2 text-red-600" /> Cancel</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateMutation.mutate({ id: b.id, data: { status: 'no_show' } })}><Ban className="w-4 h-4 mr-2" /> No Show</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateMutation.mutate({ id: b.id, data: { payment_status: 'paid' } })}><Clock className="w-4 h-4 mr-2 text-green-600" /> Mark Paid</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && filtered.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No bookings found</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}