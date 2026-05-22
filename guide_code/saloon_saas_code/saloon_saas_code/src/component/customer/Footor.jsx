import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
                <Scissors className="w-4 h-4 text-accent-foreground" />
              </div>
              <span className="font-heading text-xl font-bold">Frezka</span>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              Premium salon & spa experience across multiple locations. Book your appointment today.
            </p>
          </div>

          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/services" className="text-sm opacity-80 hover:opacity-100 transition-opacity">Services</Link>
              <Link to="/branches" className="text-sm opacity-80 hover:opacity-100 transition-opacity">Branches</Link>
              <Link to="/packages" className="text-sm opacity-80 hover:opacity-100 transition-opacity">Packages</Link>
              <Link to="/book" className="text-sm opacity-80 hover:opacity-100 transition-opacity">Book Appointment</Link>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Account</h4>
            <div className="flex flex-col gap-2">
              <Link to="/my-bookings" className="text-sm opacity-80 hover:opacity-100 transition-opacity">My Bookings</Link>
              <Link to="/profile" className="text-sm opacity-80 hover:opacity-100 transition-opacity">Profile</Link>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Contact</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm opacity-80">
                <Phone className="w-4 h-4" /> +1 (555) 123-4567
              </div>
              <div className="flex items-center gap-2 text-sm opacity-80">
                <Mail className="w-4 h-4" /> hello@frezka.com
              </div>
              <div className="flex items-center gap-2 text-sm opacity-80">
                <MapPin className="w-4 h-4" /> Multiple Locations
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center">
          <p className="text-sm opacity-60">&copy; {new Date().getFullYear()} Frezka. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}