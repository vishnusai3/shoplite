import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

interface ContactPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-orange-600">Client Support & Inquiries</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-['Space_Grotesk'] tracking-tight">
          How can we help your setup?
        </h1>
        <p className="text-stone-500 text-xs sm:text-sm">
          Have questions regarding mechanical switch compatibility, planar tuning, or shipment logistics?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Contact Info Card */}
        <div className="md:col-span-5 bg-stone-900 text-white rounded-3xl p-8 space-y-6 shadow-md">
          <h3 className="font-bold text-lg font-['Space_Grotesk']">Studio Headquarters</h3>
          <p className="text-xs text-stone-400 leading-relaxed">
            Our hardware testing studio and fulfillment hub is based in Bengaluru, India.
          </p>

          <div className="space-y-4 text-xs pt-4 border-t border-stone-800">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-orange-400 shrink-0" />
              <span>concierge@shoplite.dev</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-orange-400 shrink-0" />
              <span>+91 80 4123 4567</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
              <span>Indiranagar 100ft Road, Bengaluru, 560038</span>
            </div>
          </div>

          <div className="pt-6 border-t border-stone-800 text-[11px] text-stone-500">
            Hours: Monday – Saturday, 10:00 AM – 7:00 PM IST
          </div>
        </div>

        {/* Form Card */}
        <div className="md:col-span-7 bg-white rounded-3xl border border-stone-200 p-8 shadow-xs">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-900 text-base">Message Dispatched</h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Thank you, {name}. A client associate will get back to you at {email} within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs text-orange-600 font-semibold underline mt-2"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Your Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Arjun Sharma"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Message / Inquiry *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Inquire about custom orders, batch dispatches, or hardware specs..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
