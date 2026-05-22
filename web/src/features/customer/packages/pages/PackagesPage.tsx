import { packagesApi } from '@/services/api';
import { CoverImage } from '@/shared/components/CoverImage';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

export default function PackagesPage() {
  const { data: packages = [] } = useQuery({ queryKey: ['packages'], queryFn: () => packagesApi.list() });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="font-heading text-3xl font-bold mb-2">Packages</h1>
      <p className="text-muted-foreground mb-10">Save with our bundled session packages</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.filter((p) => p.status === 'active').map((pkg) => (
          <Card key={pkg.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-44 overflow-hidden">
              <CoverImage src={pkg.image_url} alt={pkg.name} className="h-44" />
            </div>
            <CardContent className="p-6">
              <h3 className="font-heading text-xl font-semibold">{pkg.name}</h3>
              <p className="text-sm text-muted-foreground mt-2">{pkg.description}</p>
              <p className="text-2xl font-bold text-primary mt-4">${pkg.price}</p>
              <p className="text-sm text-muted-foreground">{pkg.total_sessions} sessions · {pkg.validity_days} days validity</p>
              <Button asChild className="w-full mt-4 rounded-full"><Link to="/book">Book now</Link></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
