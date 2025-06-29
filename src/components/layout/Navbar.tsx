import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img 
                src="/images/main.jpg" 
                alt="Aishwarya Xerox Logo" 
                className="h-8 w-8 sm:h-10 sm:w-10 mr-2 sm:mr-3 rounded-full object-cover"
              />
              <span className="text-lg sm:text-2xl font-bold text-xerox-700">Aishwarya xerox</span>
            </Link>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-xerox-700 transition-colors">
              Home
            </Link>
            <Link to="/about" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-xerox-700 transition-colors">
              About
            </Link>
            <Link to="/order" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-xerox-700 transition-colors">
              Place Order
            </Link>
            <Link to="/track" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-xerox-700 transition-colors">
              Track Order
            </Link>
            <Link to="/admin" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-xerox-700 transition-colors">
              Admin
            </Link>
            <Button variant="default" className="ml-4 bg-xerox-600 hover:bg-xerox-700 transition-colors">
              <Link to="/order" className="text-white">
                Order Now
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center sm:hidden">
            <Button variant="ghost" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-t shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-xerox-700 hover:bg-gray-50 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-xerox-700 hover:bg-gray-50 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/order" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-xerox-700 hover:bg-gray-50 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Place Order
            </Link>
            <Link 
              to="/track" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-xerox-700 hover:bg-gray-50 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Track Order
            </Link>
            <Link 
              to="/admin" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-xerox-700 hover:bg-gray-50 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Admin
            </Link>
            <div className="pt-2 px-3">
              <Button variant="default" className="w-full bg-xerox-600 hover:bg-xerox-700 transition-colors">
                <Link to="/order" className="text-white w-full" onClick={() => setMobileMenuOpen(false)}>
                  Order Now
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;