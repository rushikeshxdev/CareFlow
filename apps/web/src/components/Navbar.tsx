'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { HeartPulse, Search, Sparkles, User, LogOut, Activity, Bell, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { apiClient, NotificationItem } from '@/lib/api';

export function Navbar() {
  const { user, accessToken, isLoading, logout } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user && !accessToken) return;
    try {
      const res = await apiClient.getNotifications(1, 10);
      setNotifications(res.items || []);
      setUnreadCount(res.unreadCount || 0);
    } catch {
      // Ignore polling errors
    }
  };

  useEffect(() => {
    if (user || accessToken) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000); // 15s refresh
      return () => clearInterval(interval);
    }
  }, [user, accessToken]);

  // Click outside to close notification dropdown
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
      // Handle error
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Handle error
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-teal-600 flex items-center justify-center text-white shadow-md shadow-brand-700/20 group-hover:scale-105 transition-transform">
            <HeartPulse className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-brand-700 via-purple-700 to-teal-600 bg-clip-text text-transparent">
            CareFlow
          </span>
        </Link>

        {/* Primary Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600 text-sm">
          <Link href="/" className="hover:text-brand-700 transition-colors flex items-center gap-1.5">
            <Search className="w-4 h-4 text-teal-600" />
            Discover Providers
          </Link>
          <Link href="/ai" className="hover:text-brand-700 transition-colors flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-600" />
            AI Health Assistant
          </Link>
          <Link href="/my-care" className="hover:text-brand-700 transition-colors">
            Care Journey
          </Link>
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="w-8 h-8 flex items-center justify-center text-slate-400">
              <Activity className="w-4 h-4 animate-spin" />
            </div>
          ) : user ? (
            <div className="flex items-center gap-3 relative" ref={dropdownRef}>
              {/* Notification Bell Icon */}
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) fetchNotifications();
                }}
                className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white rounded-full text-[10px] font-black w-4 h-4 flex items-center justify-center shadow-sm animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Popover */}
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden space-y-2">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-teal-700" />
                      <span className="font-bold text-slate-900 text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs font-medium">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3.5 text-xs transition-colors flex items-start justify-between gap-3 ${
                            !item.isRead ? 'bg-teal-50/50 font-medium' : 'bg-white text-slate-600'
                          }`}
                        >
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-900 text-xs">{item.title}</h4>
                            <p className="text-[11px] text-slate-600 leading-relaxed">{item.message}</p>
                            <span className="text-[10px] text-slate-400 block">
                              {new Date(item.createdAt).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          {!item.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(item.id)}
                              className="p-1 rounded bg-teal-100 text-teal-700 hover:bg-teal-200 text-[10px] shrink-0"
                              title="Mark read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* User Avatar Link */}
              <Link
                href="/my-care"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center text-[10px] font-black">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span>{user.name.split(' ')[0]}</span>
              </Link>

              <button
                onClick={() => logout()}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-sm transition-all"
            >
              <User className="w-4 h-4" />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
