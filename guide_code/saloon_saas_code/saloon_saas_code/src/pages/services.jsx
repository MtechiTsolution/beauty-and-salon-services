import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Search, ArrowRight } from 'lucide-react';

export default function Services() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const { data: services = [], isLoading } = useQuery({ queryKey: ['services'], queryFn: () => base44.entities.Service.filter({ status: 'active' }) });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => base44.entities.ServiceCategory.filter({ status: 'active' }) });

  const filtered = services.filter(s => {
    const matchSearch = !search || s.title?.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'all' || s.category_id === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-heading text-3xl lg:text-5xl font-bold mb-4">Our Services</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">Browse our complete range of beauty and wellness services</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search services..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-full" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant={activeCategory === 'all' ? 'default' : 'outline'} onClick={() => setActiveCategory('all')} className="rounded-full">All</Button>
            {categories.map(cat => (
              <Button key={cat.id} size="sm" variant={activeCategory === cat.id ? 'default' : 'outline'} onClick={() => setActiveCategory(cat.id)} className="rounded-full">{cat.name}</Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-72 bg-muted animate-pulse rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(service => (
              <div key={service.id} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-shadow group">
                <div className="h-48 bg-muted overflow-hidden">
                  <img src={service.image_url || 'https://media.base44.com/images/public/6a0c3489d0b44053c2e274cf/260e054f2_generated_63b3e2fe.png'} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-lg font-semibold mb-1">{service.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{service.description || 'Premium service'}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-primary">${service.price}</span>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="w-3.5 h-3.5" />{service.duration_minutes}min</span>
                    </div>
                    <Button asChild size="sm" className="rounded-full"><Link to="/book">Book <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link></Button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p className="col-span-full text-center text-muted-foreground py-12">No services found.</p>}
          </div>
        )}
      </div>
    </div>
  );
}