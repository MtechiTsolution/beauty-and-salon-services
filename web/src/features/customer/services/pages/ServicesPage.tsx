import { categoriesApi, servicesApi } from '@/services/api';
import { CoverImage } from '@/shared/components/CoverImage';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Clock } from 'lucide-react';

export default function ServicesPage() {
  const { data: services = [] } = useQuery({ queryKey: ['services'], queryFn: () => servicesApi.list() });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => categoriesApi.list() });

  const active = services.filter((s) => s.status === 'active');

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="font-heading text-3xl font-bold mb-2">Our Services</h1>
      <p className="text-muted-foreground mb-10">Browse our full range of salon treatments</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {active.map((service) => {
          const cat = categories.find((c) => c.id === service.category_id);
          return (
            <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-52 overflow-hidden">
                <CoverImage src={service.image_url} alt={service.title} className="h-52 hover:scale-105 transition-transform duration-500" />
              </div>
              <CardContent className="p-6">
                {cat && <span className="text-xs text-accent font-medium">{cat.name}</span>}
                <h3 className="font-heading text-lg font-semibold mt-1">{service.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{service.description}</p>
                <div className="flex justify-between mt-4 text-sm">
                  <span className="font-bold text-primary">${service.price}</span>
                  <span className="flex items-center gap-1 text-muted-foreground"><Clock className="w-4 h-4" />{service.duration_minutes}m</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
