import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <img 
                src="/images/main.jpg" 
                alt="Aishwarya Xerox Logo" 
                className="h-8 w-8 mr-3 rounded-full object-cover"
              />
              <h3 className="text-lg font-semibold text-gray-800">Aishwarya xerox</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Professional printing and copying services for all your needs. Fast, reliable, and affordable solutions.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-xerox-700 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-xerox-700 transition-colors">About</Link>
              </li>
              <li>
                <Link to="/order" className="text-gray-600 hover:text-xerox-700 transition-colors">Place Order</Link>
              </li>
              <li>
                <Link to="/track" className="text-gray-600 hover:text-xerox-700 transition-colors">Track Order</Link>
              </li>
              <li>
                <Link to="/admin" className="text-gray-600 hover:text-xerox-700 transition-colors">Admin</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Us</h3>
            <address className="not-italic text-gray-600 space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 text-xerox-600 flex-shrink-0" />
                <div>
                  <p>ADB road near pragati engineering college</p>
                  <p>ramesampeta, surampalem</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-xerox-600 flex-shrink-0" />
                <p>+91 6301526803</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-xerox-600 flex-shrink-0" />
                <p>aishwaryaxerox1999@gmail.com</p>
              </div>
            </address>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-600">
            &copy; {currentYear} Aishwarya xerox. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;