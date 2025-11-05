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
}

function NavItem({ href, icon, label, isActive, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg transition-all
        ${isActive
          ? 'text-primary-600 bg-primary-50 font-semibold'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }
      `}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

interface DropdownProps {
  label: string;
  icon: React.ReactNode;
  items: { href: string; label: string; icon: React.ReactNode }[];
  isActive: boolean;
}

function NavDropdown({ label, icon, items, isActive }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg transition-all
          ${isActive
            ? 'text-primary-600 bg-primary-50 font-semibold'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }
        `}
      >
        {icon}
        <span className="text-sm font-medium">{label}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
          >
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, isAuthenticated } = useAuth();
  const profile = useUserStore((state) => state.profile);

  const profileItems = [
    { href: "/profile", label: "프로필 편집", icon: <User className="w-4 h-4" /> },
    { href: "/settings", label: "설정", icon: <Settings className="w-4 h-4" /> },
    { href: "/learning-report", label: "학습 리포트", icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const handleLogout = () => {
    signOut();
    setIsOpen(false);
  };

  const handleLoginRedirect = () => {
    window.location.href = '/login';
  };

  // 로그아웃 상태: 시작하기 버튼
  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
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
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
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
                className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}

            <div className="border-t border-gray-100 mt-2 pt-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors w-full"
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
  const { isAuthenticated, signOut } = useAuth();

  const mobileNavItems = [
    { href: "/", label: "홈", icon: <Home className="w-5 h-5" /> },
    { href: "/tutor/english", label: "English", icon: <BookOpen className="w-5 h-5" /> },
    { href: "/tutor/math", label: "Math", icon: <Calculator className="w-5 h-5" /> },
    { href: "/tutor/science", label: "Science", icon: <Beaker className="w-5 h-5" /> },
    { href: "/tutor/social-studies", label: "Social", icon: <Landmark className="w-5 h-5" /> },
    { href: "/dashboard", label: "Total DashBoard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: "/dashboard/english", label: "English DashBoard", icon: <BookOpen className="w-5 h-5" /> },
    { href: "/dashboard/math", label: "Math DashBoard", icon: <Calculator className="w-5 h-5" /> },
    { href: "/dashboard/science", label: "Science DashBoard", icon: <Beaker className="w-5 h-5" /> },
    { href: "/dashboard/social", label: "Social DashBoard", icon: <Landmark className="w-5 h-5" /> },
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
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <Link href="/" onClick={onClose} className="flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-primary-600" />
                  <span className="font-bold text-xl bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                    AI Park
                  </span>
                </Link>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-1">
              {mobileNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${pathname === item.href
                      ? 'bg-primary-50 text-primary-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="border-t border-gray-200 p-4">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span>프로필</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    <span>설정</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>로그아웃</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={onClose}
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

  const dashboardItems = [
    { href: "/dashboard", label: "Total DashBoard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: "/dashboard/english", label: "English DashBoard", icon: <BookOpen className="w-4 h-4" /> },
    { href: "/dashboard/math", label: "Math DashBoard", icon: <Calculator className="w-4 h-4" /> },
    { href: "/dashboard/science", label: "Science DashBoard", icon: <Beaker className="w-4 h-4" /> },
    { href: "/dashboard/social", label: "Social DashBoard", icon: <Landmark className="w-4 h-4" /> },
  ];

  const isDashboardActive = pathname?.startsWith('/dashboard');

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
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>

              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-primary-600" />
                <span className="hidden sm:block font-bold text-xl bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  AI Park
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-2">
                <NavItem
                  href="/tutor/english"
                  icon={<BookOpen className="w-4 h-4" />}
                  label="English"
                  isActive={pathname === '/tutor/english'}
                />
                <NavItem
                  href="/tutor/math"
                  icon={<Calculator className="w-4 h-4" />}
                  label="Math"
                  isActive={pathname === '/tutor/math'}
                />
                <NavItem
                  href="/tutor/science"
                  icon={<Beaker className="w-4 h-4" />}
                  label="Science"
                  isActive={pathname === '/tutor/science'}
                />
                <NavItem
                  href="/tutor/social-studies"
                  icon={<Landmark className="w-4 h-4" />}
                  label="Social"
                  isActive={pathname === '/tutor/social-studies'}
                />
                <NavDropdown
                  label="DashBoard"
                  icon={<LayoutDashboard className="w-4 h-4" />}
                  items={dashboardItems}
                  isActive={isDashboardActive}
                />
              </div>
            </div>

            {/* Right: Notifications + Profile */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
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
