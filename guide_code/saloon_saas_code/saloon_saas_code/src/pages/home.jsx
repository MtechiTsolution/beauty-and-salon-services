import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Clock, MapPin, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

export default function Home() {
  const { data: services = [] } = useQuery({ queryKey: ['services-home'], queryFn: () => base44.entities.Service.filter({ status: 'active' }, '-created_date', 6) });
  const { data: branches = [] } = useQuery({ queryKey: ['branches-home'], queryFn: () => base44.entities.Branch.filter({ status: 'active' }, '-created_date', 4) });

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center">
        <div className="absolute inset-0">
          <img src="https://media.base44.com/images/public/6a0c3489d0b44053c2e274cf/6d2e3581c_generated_f1671466.png" alt="Luxury salon interior" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-xl">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-medium mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4" /> Premium Salon Experience
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Beauty That <br />Defines <em className="text-accent not-italic">Elegance</em>
            </h1>
            <p className="text-lg text-white/80 mb-8 leading-relaxed">
              Discover premium salon services across multiple locations. Expert stylists, luxurious treatments, and an experience crafted just for you.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8">
                <Link to="/book">Book Appointment <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/10 rounded-full px-8">
                <Link to="/services">Explore Services</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Happy Clients', value: '5,000+' },
              { label: 'Expert Stylists', value: '50+' },
              { label: 'Salon Locations', value: '10+' },
              { label: 'Services', value: '100+' },
            ].map(stat => (
              <div key={stat.label}>
                <p className="font-heading text-3xl lg:text-4xl font-bold">{stat.value}</p>
                <p className="text-sm opacity-70 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Discover our range of premium beauty and wellness services</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.length > 0 ? services.map(service => (
              <motion.div key={service.id} whileHover={{ y: -6 }} className="group bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-shadow">
                <div className="h-48 bg-muted overflow-hidden">
                  <img src={service.image_url || 'https://media.base44.com/images/public/6a0c3489d0b44053c2e274cf/260e054f2_generated_63b3e2fe.png'} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-lg font-semibold mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{service.description || 'Premium salon service'}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-primary">${service.price}</span>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" /> {service.duration_minutes}min
                      </span>
                    </div>
                    <Button asChild size="sm" variant="outline" className="rounded-full">
                      <Link to="/book">Book</Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No services available yet. Check back soon!
              </div>
            )}
          </div>
          {services.length > 0 && (
            <div className="text-center mt-10">
              <Button asChild variant="outline" className="rounded-full px-8">
                <Link to="/services">View All Services <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Branches */}
      <section className="py-20 lg:py-28 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold mb-4">Our Locations</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Visit us at any of our premium salon locations</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {branches.length > 0 ? branches.map(branch => (
              <motion.div key={branch.id} whileHover={{ y: -4 }} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all">
                <div className="h-48 bg-muted overflow-hidden">
                  <img src={branch.image_url || 'https://media.base44.com/images/public/6a0c3489d0b44053c2e274cf/00efe15af_generated_eee86eed.png'} alt={branch.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-xl font-semibold mb-2">{branch.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4" /> {branch.address}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{branch.description || 'Premium salon location'}</p>
                  <Button asChild size="sm" className="rounded-full">
                    <Link to="/book">Book at this Branch</Link>
                  </Button>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Branches coming soon!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl lg:text-4xl font-bold mb-4">Ready for a Fresh Look?</h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">Book your appointment today and experience the luxury you deserve.</p>
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-10">
            <Link to="/book">Book Your Appointment <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}