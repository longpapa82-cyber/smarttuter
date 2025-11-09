'use client';

import { useState } from 'react';
import Image from 'next/image';
import { User, GraduationCap } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  type?: 'tutor' | 'user';
  subject?: 'english' | 'math' | 'science' | 'social-studies' | 'korean';
  showOnline?: boolean;
}

const TUTOR_AVATARS = {
  math: '/avatars/tutor-math.png',
  english: '/avatars/tutor-english.png',
  science: '/avatars/tutor-science.png',
  'social-studies': '/avatars/tutor-social.png',
  korean: '/avatars/tutor-korean.png',
};

export default function Avatar({
  src,
  alt,
  size = 'md',
  type = 'user',
  subject,
  showOnline = true,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const sizeMap = {
    sm: 32,
    md: 40,
    lg: 48,
  };

  const dimension = sizeMap[size];

  // Determine avatar source
  let avatarSrc = src;
  if (!avatarSrc && type === 'tutor' && subject) {
    avatarSrc = TUTOR_AVATARS[subject];
  }

  // Show fallback if no src OR if image failed to load
  const showFallback = !avatarSrc || imageError;

  return (
    <div className="relative flex-shrink-0" style={{ width: dimension, height: dimension }}>
      {showFallback ? (
        // Fallback icon
        <div
          className={`w-full h-full rounded-full flex items-center justify-center ${
            type === 'tutor'
              ? 'bg-gradient-to-br from-purple-600 to-indigo-600'
              : 'bg-gradient-to-br from-blue-400 to-sky-400'
          }`}
        >
          {type === 'tutor' ? (
            <GraduationCap className="w-6 h-6 text-white" />
          ) : (
            <User className="w-6 h-6 text-white" />
          )}
        </div>
      ) : avatarSrc ? (
        // Avatar image with fallback
        <Image
          src={avatarSrc}
          width={dimension}
          height={dimension}
          className={`rounded-full object-cover ${
            type === 'tutor'
              ? 'ring-2 ring-purple-200 shadow-md'
              : 'ring-2 ring-blue-200 shadow-sm'
          }`}
          alt={alt}
          onError={() => {
            // On error, trigger fallback icon display
            setImageError(true);
          }}
        />
      ) : null}

      {/* Online status indicator (tutor only) */}
      {type === 'tutor' && showOnline && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
      )}
    </div>
  );
}
