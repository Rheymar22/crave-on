import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-coffee-dark text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div>
            <div className="flex items-center gap-2 mb-3">
              <img
                src="/crave on.jpg"
                alt="Crave On"
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="font-display font-bold text-lg">Crave On</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Handcrafted coffee and pastries made with love.
              Your daily craving, satisfied.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider
                           text-gray-300 mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                { to: '/menu',    label: 'Our Menu' },
                { to: '/cart',    label: 'Cart' },
                { to: '/orders',  label: 'My Orders' },
                { to: '/profile', label: 'Profile' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to}
                    className="text-gray-400 hover:text-brand-400
                               text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider
                           text-gray-300 mb-3">
              Visit Us
            </h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>📍 Mongpong Proper, Roxas City Capiz</li>
              <li>📞 (032) 123-4567</li>
              <li>✉️ craveon@gmail.com</li>
              <li>🕐 Mon–Sun: 7:00 AM – 9:00 PM</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-500 text-sm">
            Crave On. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}