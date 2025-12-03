import React from 'react';
import { Bitcoin, Twitter, Facebook, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Bitcoin className="h-6 w-6 text-blue-500" />
              <span className="font-bold text-xl text-white">CoinSwift</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              The world's most trusted platform to buy and sell cryptocurrency instantly. Secure, fast, and low fees.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-blue-400">About Us</a></li>
              <li><a href="#" className="hover:text-blue-400">Careers</a></li>
              <li><a href="#" className="hover:text-blue-400">Blog</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-blue-400">Help Center</a></li>
              <li><a href="#" className="hover:text-blue-400">Contact Us</a></li>
              <li><a href="#" className="hover:text-blue-400">API Documentation</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Socials</h3>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-blue-400"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-blue-400"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-blue-400"><Instagram className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} CoinSwift. All rights reserved.</p>
          <p className="text-gray-600 text-xs mt-2 md:mt-0">Not financial advice. Trading crypto involves risk.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;