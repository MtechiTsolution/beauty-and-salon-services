import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles } from 'lucide-react';

export default function Packages() {
  const { data: packages = [], isLoading } = useQuery({ queryKey: ['packages'], queryFn: () => base44.entities.Package.filter({ status: 'active' }) });
  const { data: services = [] } = useQuery({ queryKey: ['services-pkg'], queryFn: () => base44.entities.Service.list() });

  const getServiceName = (id) => services.find(s => s.id === id)?.title || 'Service';

  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h1 className="font-heading text-3xl lg:text-5xl font-bold mb-4">Packages & Bundles</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">Save more with our prepaid service packages</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map(i => <div key={i} className="h-80 bg-muted animate-pulse rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map(pkg => (
              <div key={pkg.id} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all p-8 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <Badge variant="secondary" className="text-xs">{pkg.total_sessions} Sessions</Badge>
                </div>
                <h3 className="font-heading text-xl font-bold mb-2">{pkg.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1">{pkg.description || 'Premium package deal'}</p>
                {pkg.service_ids?.length > 0 && (
                  <div className="space-y-2 mb-6">
                    {pkg.service_ids.map(sid => (
                      <div key={sid} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-accent" /> {getServiceName(sid)}
                      </div>
                    ))}
                  </div>
                )}
                {pkg.validity_days && <p className="text-xs text-muted-foreground mb-4">Valid for {pkg.validity_days} days</p>}
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-heading text-2xl font-bold text-primary">${pkg.price}</span>
                  <Button className="rounded-full">Purchase</Button>
                </div>
              </div>
            ))}
            {packages.length === 0 && <p className="col-span-full text-center text-muted-foreground py-12">No packages available yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}