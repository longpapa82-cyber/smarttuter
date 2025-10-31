'use client'

import { useState, useEffect } from 'react'
import { User, Mail, GraduationCap, Calendar, Award, Settings, LogOut, Bell } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: 'Student',
    email: 'student@smarttuter.com',
    grade: 'High School',
    gradeDetail: 'Grade 10',
    joinDate: '2025-01-15',
    totalXP: 1250,
    streak: 7,
  })

  const [settings, setSettings] = useState({
    notifications: true,
    soundEffects: true,
    darkMode: false,
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pb-24">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          {/* Avatar & Name */}
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile.name}</h2>
              <p className="text-gray-600 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {profile.email}
              </p>
            </div>
            <button className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              <Settings className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Grade */}
            <div className="p-4 bg-purple-50 rounded-xl">
              <GraduationCap className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-sm text-gray-600 mb-1">Grade</p>
              <p className="font-bold text-gray-900">{profile.gradeDetail}</p>
            </div>

            {/* Join Date */}
            <div className="p-4 bg-blue-50 rounded-xl">
              <Calendar className="w-6 h-6 text-blue-600 mb-2" />
              <p className="text-sm text-gray-600 mb-1">Joined</p>
              <p className="font-bold text-gray-900">
                {new Date(profile.joinDate).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>

            {/* Total XP */}
            <div className="p-4 bg-yellow-50 rounded-xl">
              <Award className="w-6 h-6 text-yellow-600 mb-2" />
              <p className="text-sm text-gray-600 mb-1">Total XP</p>
              <p className="font-bold text-gray-900">{profile.totalXP.toLocaleString()}</p>
            </div>

            {/* Streak */}
            <div className="p-4 bg-orange-50 rounded-xl">
              <div className="flex items-center gap-1 mb-2">
                <span className="text-2xl">🔥</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Streak</p>
              <p className="font-bold text-gray-900">{profile.streak} days</p>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Preferences</h3>

          {/* Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-3">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-700" />
              <div>
                <p className="font-semibold text-gray-900">Notifications</p>
                <p className="text-sm text-gray-600">
                  Receive learning reminders and achievements
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                setSettings({ ...settings, notifications: !settings.notifications })
              }
              className={`
                relative w-14 h-8 rounded-full transition-colors
                ${settings.notifications ? 'bg-purple-600' : 'bg-gray-300'}
              `}
            >
              <div
                className={`
                  absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform
                  ${settings.notifications ? 'translate-x-7' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          {/* Sound Effects */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-3">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔊</span>
              <div>
                <p className="font-semibold text-gray-900">Sound Effects</p>
                <p className="text-sm text-gray-600">Play sounds for actions and rewards</p>
              </div>
            </div>
            <button
              onClick={() =>
                setSettings({ ...settings, soundEffects: !settings.soundEffects })
              }
              className={`
                relative w-14 h-8 rounded-full transition-colors
                ${settings.soundEffects ? 'bg-purple-600' : 'bg-gray-300'}
              `}
            >
              <div
                className={`
                  absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform
                  ${settings.soundEffects ? 'translate-x-7' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          {/* Dark Mode */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-xl">🌙</span>
              <div>
                <p className="font-semibold text-gray-900">Dark Mode</p>
                <p className="text-sm text-gray-600">Switch to dark theme</p>
              </div>
            </div>
            <button
              onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
              className={`
                relative w-14 h-8 rounded-full transition-colors
                ${settings.darkMode ? 'bg-purple-600' : 'bg-gray-300'}
              `}
            >
              <div
                className={`
                  absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform
                  ${settings.darkMode ? 'translate-x-7' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Links</h3>

          <div className="space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <GraduationCap className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900">My Learning Progress</span>
            </Link>

            <Link
              href="/analytics"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Award className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">Achievements & Badges</span>
            </Link>

            <button className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left">
              <Settings className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Account Settings</span>
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <button className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-semibold">Log Out</span>
        </button>
      </div>
    </div>
  )
}
