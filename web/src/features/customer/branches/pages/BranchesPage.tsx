import { branchesApi } from '@/services/api';
import { CoverImage } from '@/shared/components/CoverImage';
import { Card, CardContent } from '@/shared/components/ui/card';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useQuery } from '@tanstack/react-query';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function BranchesPage() {
  const { data: branches = [] } = useQuery({ queryKey: ['branches'], queryFn: () => branchesApi.list() });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="font-heading text-3xl font-bold mb-2">Our Branches</h1>
      <p className="text-muted-foreground mb-10">Visit us at any of our {branches.length} locations</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {branches.map((b) => (
          <Card key={b.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-56 overflow-hidden">
              <CoverImage src={b.image_url} alt={b.name} fallback="branch" className="h-56" />
            </div>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-heading text-xl font-semibold">{b.name}</h3>
                <StatusBadge status={b.status} />
              </div>
              <p className="text-muted-foreground mt-3 flex items-start gap-2">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                {b.address}{b.city ? `, ${b.city}` : ''}
              </p>
              {b.phone && <p className="text-sm mt-2 flex items-center gap-2"><Phone className="w-4 h-4" />{b.phone}</p>}
              {b.email && <p className="text-sm mt-1 flex items-center gap-2"><Mail className="w-4 h-4" />{b.email}</p>}
              {b.description && <p className="text-sm text-muted-foreground mt-4">{b.description}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
