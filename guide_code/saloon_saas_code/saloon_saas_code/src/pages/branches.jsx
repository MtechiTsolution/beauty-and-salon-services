import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function Branches() {
  const { data: branches = [], isLoading } = useQuery({ queryKey: ['branches'], queryFn: () => base44.entities.Branch.filter({ status: 'active' }) });

  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h1 className="font-heading text-3xl lg:text-5xl font-bold mb-4">Our Locations</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">Find a Frezka salon near you</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1,2,3,4].map(i => <div key={i} className="h-80 bg-muted animate-pulse rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {branches.map(branch => (
              <div key={branch.id} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                <div className="h-56 bg-muted overflow-hidden">
                  <img src={branch.image_url || 'https://media.base44.com/images/public/6a0c3489d0b44053c2e274cf/00efe15af_generated_eee86eed.png'} alt={branch.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-xl font-semibold mb-3">{branch.name}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 shrink-0" /> {branch.address}{branch.city ? `, ${branch.city}` : ''}
                    </div>
                    {branch.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4 shrink-0" /> {branch.phone}
                      </div>
                    )}
                    {branch.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4 shrink-0" /> {branch.email}
                      </div>
                    )}
                  </div>
                  {branch.description && <p className="text-sm text-muted-foreground mb-4">{branch.description}</p>}
                  <Button asChild className="rounded-full w-full"><Link to="/book">Book at This Location</Link></Button>
                </div>
              </div>
            ))}
            {branches.length === 0 && <p className="col-span-full text-center text-muted-foreground py-12">No branches available yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}