import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { UserAvatar } from './UserAvatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, Home, Clock, User } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-800">
      {/* Navigation */}
      <nav className="bg-white shadow z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard" className="h-8 w-auto flex items-center">
                  <span className="text-primary text-2xl font-bold">Pay</span>
                  <span className="text-[#002E6E] text-2xl font-bold">Wallet</span>
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="flex items-center space-x-4">
                <Link 
                  href="/dashboard"
                  className={`px-3 py-2 text-sm font-medium rounded-md transition ${
                    location === '/dashboard' 
                      ? 'text-neutral-800 bg-neutral-100' 
                      : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/history"
                  className={`px-3 py-2 text-sm font-medium rounded-md transition ${
                    location === '/history' 
                      ? 'text-neutral-800 bg-neutral-100' 
                      : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100'
                  }`}
                >
                  History
                </Link>
              </div>
              <div className="ml-3 relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-0 h-8 w-8 rounded-full">
                      <UserAvatar 
                        firstName={user?.firstName ?? ''} 
                        lastName={user?.lastName ?? ''} 
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="font-medium">
                      {user?.firstName} {user?.lastName}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-sm text-muted-foreground">
                      {user?.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 focus:outline-none"
              >
                <Menu size={24} />
              </Button>
            </div>
          </div>
        </div>
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
          <div className="pt-2 pb-3 space-y-1">
            <Link 
              href="/dashboard"
              className={`block px-3 py-2 text-base font-medium ${
                location === '/dashboard' 
                  ? 'text-neutral-800 bg-neutral-100' 
                  : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center">
                <Home size={18} className="mr-2" />
                Dashboard
              </div>
            </Link>
            <Link 
              href="/history"
              className={`block px-3 py-2 text-base font-medium ${
                location === '/history' 
                  ? 'text-neutral-800 bg-neutral-100' 
                  : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center">
                <Clock size={18} className="mr-2" />
                History
              </div>
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-neutral-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <UserAvatar firstName={user?.firstName ?? ''} lastName={user?.lastName ?? ''} />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-neutral-800">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-sm font-medium text-neutral-500">
                  {user?.email}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button 
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-base font-medium text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
}
