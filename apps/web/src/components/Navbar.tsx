'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeartPulse, Sparkles, LogOut, Activity, Bell, Check, CheckCheck, PhoneCall, Menu, X, Stethoscope, Building2, TestTube2, Home, User } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { apiClient, NotificationItem } from '@/lib/api';

export function Navbar() {
  const pathname = usePathname();
  const { user, accessToken, isLoading, logout } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user && !accessToken) return;
    try {
      const res = await apiClient.getNotifications(1, 10);
      setNotifications(res.items || []);
      setUnreadCount(res.unreadCount || 0);
    } catch {
      // Polling fallback
    }
  };

  useEffect(() => {
    if (user || accessToken) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user, accessToken]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiClient.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Ignore errors
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Ignore errors
    }
  };

  const navItems = [
    { label: 'Doctors', href: '/recommendations?type=DOCTOR' },
    { label: 'Nurses', href: '/recommendations?type=HOME_CARE' },
    { label: 'Hospitals', href: '/recommendations?type=HOSPITAL' },
    { label: 'Diagnostics', href: '/recommendations?type=DIAGNOSTIC_CENTER' },
    { label: 'Care Journey', href: '/my-care' },
    { label: 'AI Assistant', href: '/ai', icon: Sparkles, badge: 'Cure AI' },
  ];

  return (
    <header className="sticky top-3 z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Floating Glass Capsule Container */}
      <div className="bg-white/90 backdrop-blur-md rounded-full shadow-lg shadow-purple-900/5 border border-slate-200/80 px-4 sm:px-6 py-2.5 flex items-center justify-between transition-all">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-700 via-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-purple-700/20 group-hover:scale-105 transition-transform">
            <HeartPulse className="w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tight bg-gradient-to-r from-purple-900 via-indigo-700 to-teal-600 bg-clip-text text-transparent">
            CareFlow
          </span>
        </Link>

        {/* Desktop Primary Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href.startsWith('/recommendations') && pathname.includes('recommendations'));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`transition-colors hover:text-purple-700 flex items-center gap-1.5 ${
                  isActive ? 'text-purple-700 font-bold' : ''
                }`}
              >
                {item.icon && <item.icon className="w-3.5 h-3.5 text-teal-500" />}
                {item.label}
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold text-[9px] uppercase tracking-wider">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Right Action Area */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Helpline Phone Pill */}
          <a
            href="tel:01171640348"
            className="hidden xl:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-purple-600" />
            <span>011 71 64 03 48</span>
          </a>

          {/* User Auth / Notification Controls */}
          {isLoading ? (
            <div className="w-8 h-8 flex items-center justify-center text-slate-400">
              <Activity className="w-4 h-4 animate-spin" />
            </div>
          ) : user ? (
            <div className="flex items-center gap-2.5 relative" ref={dropdownRef}>
              {/* Notification Bell */}
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) fetchNotifications();
                }}
                className="relative p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-purple-600 text-white rounded-full text-[9px] font-black w-3.5 h-3.5 flex items-center justify-center shadow-sm animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-11 w-80 sm:w-96 rounded-3xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden space-y-1">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-purple-700" />
                      <span className="font-bold text-slate-900 text-xs">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-[10px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs font-medium">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3.5 text-xs transition-colors flex items-start justify-between gap-3 ${
                            !item.isRead ? 'bg-purple-50/50 font-medium' : 'bg-white text-slate-600'
                          }`}
                        >
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-900 text-xs">{item.title}</h4>
                            <p className="text-[11px] text-slate-600 leading-relaxed">{item.message}</p>
                            <span className="text-[9px] text-slate-400 block">
                              {new Date(item.createdAt).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          {!item.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(item.id)}
                              className="p-1 rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 text-[10px] shrink-0"
                              title="Mark read"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* User Profile Pill */}
              <Link
                href="/my-care"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs border border-purple-200/60 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-purple-700 text-white flex items-center justify-center text-[10px] font-black">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span>{user.name.split(' ')[0]}</span>
              </Link>

              <button
                onClick={() => logout()}
                className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-bold text-xs shadow-md shadow-purple-700/20 transition-all"
            >
              <User className="w-3.5 h-3.5" />
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 p-4 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-2xl hover:bg-purple-50 text-slate-800 font-semibold text-xs flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  {item.icon && <item.icon className="w-4 h-4 text-teal-600" />}
                  {item.label}
                </span>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold text-[9px]">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <a
              href="tel:01171640348"
              className="flex items-center gap-1.5 text-xs font-bold text-purple-700"
            >
              <PhoneCall className="w-3.5 h-3.5" /> 011 71 64 03 48
            </a>

            {!user && (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 rounded-full bg-purple-700 text-white font-bold text-xs"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
