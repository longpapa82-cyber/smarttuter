"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  BookOpen,
  Calculator,
  LayoutDashboard,
  Menu,
  X,
  ChevronDown,
  Bell,
  User,
  Settings,
  BarChart3,
  LogOut,
  GraduationCap,
  Beaker,
  Landmark
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserStore } from "@/lib/gamification/store";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
  showBeta?: boolean;
  requireAuth?: boolean; // New: Whether this link requires authentication
}

function NavItem({ href, icon, label, isActive, onClick, showBeta = false, requireAuth = false }: NavItemProps) {
  const { navigateProtected, isAuthenticated } = useAuth();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If authentication is required and user is not authenticated, prevent default and redirect to login
    if (requireAuth && !isAuthenticated) {
      e.preventDefault();
      navigateProtected(href);
      return;
    }

    // If custom onClick is provided, call it
    if (onClick) {
      onClick();
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      scroll={true}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg transition-all touch-manipulation
        min-h-[44px] active:scale-95
        ${isActive
          ? 'text-primary-600 bg-primary-50 font-semibold'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100'
        }
      `}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
      {showBeta && (
        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded uppercase tracking-wide">
          Beta
        </span>
      )}
    </Link>
  );
}

function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, isAuthenticated } = useAuth();
  const profile = useUserStore((state) => state.profile);

  // Check if user is admin
  const isAdmin = user?.email === 'a090723@naver.com';

  const profileItems = [
    { href: "/profile", label: "프로필 편집", icon: <User className="w-4 h-4" /> },
    { href: "/settings", label: "학년 설정", icon: <Settings className="w-4 h-4" /> },
    { href: "/learning-report", label: "학습 리포트", icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const handleLogout = () => {
    signOut();
    setIsOpen(false);
  };

  const handleLoginRedirect = () => {
    window.location.href = '/login';
  };

  // 로그아웃 상태: 시작하기 버튼 (로그인 불필요 - 홈으로 이동)
  if (!isAuthenticated) {
    return (
      <Link
        href="/"
        scroll={true}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full font-semibold text-sm hover:shadow-lg hover:scale-105 transform transition-all"
      >
        시작하기
      </Link>
    );
  }

  // 로그인 상태: 프로필 드롭다운
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all touch-manipulation min-h-[44px]"
        aria-label="프로필 메뉴 열기"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-semibold text-sm">
          {profile?.avatar || user?.name?.[0] || '🎓'}
        </div>
        <ChevronDown className="w-4 h-4 text-gray-600" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
          >
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="font-semibold text-gray-900">{profile?.username || user?.name || '게스트'}</p>
              <p className="text-xs text-gray-500">{profile?.gradeLevel || '학년 미설정'}</p>
            </div>

            {profileItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                scroll={true}
                className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}

            {/* Admin Dashboard Link - Only for admin */}
            {isAdmin && (
              <>
                <div className="border-t border-gray-100 my-2" />
                <Link
                  href="/admin/errors"
                  onClick={() => setIsOpen(false)}
                  scroll={true}
                  className="flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-xs font-medium">Admin Dashboard</span>
                </Link>
              </>
            )}

            <div className="border-t border-gray-100 mt-2 pt-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 active:bg-red-100 transition-all touch-manipulation w-full min-h-[44px]"
                aria-label="로그아웃"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">로그아웃</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileNav({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { user, isAuthenticated, signOut } = useAuth();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Check if user is admin
  const isAdmin = user?.email === 'a090723@naver.com';

  // Swipe gesture detection: minimum swipe distance (50px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;

    // Close menu on left swipe
    if (isLeftSwipe) {
      onClose();
    }
  };

  const mobileNavItems = [
    { href: "/", label: "홈", icon: <Home className="w-5 h-5" />, requireAuth: false },
    { href: "/dashboard/english", label: "English", icon: <BookOpen className="w-5 h-5" />, requireAuth: false },
    { href: "/dashboard/math", label: "Math", icon: <Calculator className="w-5 h-5" />, requireAuth: false },
    { href: "/dashboard/science", label: "Science", icon: <Beaker className="w-5 h-5" />, requireAuth: false },
    { href: "/dashboard/social", label: "Social", icon: <Landmark className="w-5 h-5" />, requireAuth: false },
    { href: "/dashboard/korean", label: "Korean 📚", icon: <BookOpen className="w-5 h-5" />, requireAuth: false },
    { href: "/dashboard", label: "DashBoard", icon: <LayoutDashboard className="w-5 h-5" />, requireAuth: false },
  ];

  const handleLogout = () => {
    signOut();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-white shadow-2xl z-50 lg:hidden overflow-y-auto"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <Link href="/" onClick={onClose} scroll={true} className="flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-primary-600" />
                  <span className="font-bold text-xl bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                    AI Park
                  </span>
                </Link>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-all touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="메뉴 닫기"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-1">
              {mobileNavItems.map((item) => {
                // Check if active based on pathname containing subject name
                let isActive = false;
                if (item.href === '/' || item.href === '/dashboard') {
                  isActive = pathname === item.href;
                } else {
                  const subject = item.href.split('/').pop() || '';
                  isActive = pathname.includes(subject);
                }

                const handleItemClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                  // Check authentication if required
                  if (item.requireAuth && !isAuthenticated) {
                    e.preventDefault();
                    // Save intended destination for redirect after login
                    sessionStorage.setItem('redirectAfterLogin', item.href);
                    onClose();
                    window.location.href = '/login';
                    return;
                  }
                  onClose();
                };

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleItemClick}
                    scroll={true}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all touch-manipulation
                      min-h-[48px] active:scale-[0.98]
                      ${isActive
                        ? 'bg-primary-50 text-primary-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                      }
                    `}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-gray-200 p-4">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    onClick={onClose}
                    scroll={true}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-all touch-manipulation min-h-[48px]"
                  >
                    <User className="w-5 h-5" />
                    <span>프로필</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={onClose}
                    scroll={true}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-all touch-manipulation min-h-[48px]"
                  >
                    <Settings className="w-5 h-5" />
                    <span>설정</span>
                  </Link>

                  {/* Admin Dashboard Link - Only for admin */}
                  {isAdmin && (
                    <Link
                      href="/admin/errors"
                      onClick={onClose}
                      scroll={true}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-all touch-manipulation min-h-[48px]"
                    >
                      <Settings className="w-5 h-5" />
                      <span className="text-sm">Admin Dashboard</span>
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 active:bg-red-100 transition-all touch-manipulation w-full min-h-[48px]"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>로그아웃</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/"
                  onClick={onClose}
                  scroll={true}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transform transition-all"
                >
                  시작하기
                </Link>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function TopNavigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications] = useState(0);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo + Main Nav */}
            <div className="flex items-center gap-6">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-all touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="메뉴 열기"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>

              {/* Logo */}
              <Link href="/" scroll={true} className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-primary-600" />
                <span className="hidden sm:block font-bold text-xl bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  AI Park
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-2">
                <NavItem
                  href="/dashboard/english"
                  icon={<BookOpen className="w-4 h-4" />}
                  label="English"
                  isActive={pathname.includes('/english')}
                  requireAuth={false}
                />
                <NavItem
                  href="/dashboard/math"
                  icon={<Calculator className="w-4 h-4" />}
                  label="Math"
                  isActive={pathname.includes('/math')}
                  requireAuth={false}
                />
                <NavItem
                  href="/dashboard/science"
                  icon={<Beaker className="w-4 h-4" />}
                  label="Science"
                  isActive={pathname.includes('/science')}
                  requireAuth={false}
                />
                <NavItem
                  href="/dashboard/social"
                  icon={<Landmark className="w-4 h-4" />}
                  label="Social"
                  isActive={pathname.includes('/social')}
                  requireAuth={false}
                />
                <NavItem
                  href="/dashboard/korean"
                  icon={<BookOpen className="w-4 h-4" />}
                  label="Korean 📚"
                  isActive={pathname.includes('/korean')}
                  requireAuth={false}
                />
                <NavItem
                  href="/dashboard"
                  icon={<LayoutDashboard className="w-4 h-4" />}
                  label="DashBoard"
                  isActive={pathname === '/dashboard'}
                  requireAuth={false}
                />
              </div>
            </div>

            {/* Right: Notifications + Profile */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button
                className="relative p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-all touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="알림"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>

              {/* Profile Dropdown */}
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
