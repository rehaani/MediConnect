
"use client";
import type { UserRole } from "./auth";

export type Feature = {
  name: string;
  path: string;
  icon: string;
  bgColor: string;
  description: string;
  roles: UserRole[];
};

export const FEATURES: Feature[] = [
    // Patient Features
    {
      name: 'AI Health Assessor',
      path: '/ai-health-assessor',
      icon: 'Bot',
      bgColor: '#3b82f6',
      description: 'Get a preliminary health check.',
      roles: ['patient'],
    },
    {
      name: 'Appointments',
      path: '/appointments',
      icon: 'Calendar',
      bgColor: '#10b981',
      description: 'Schedule new appointments.',
      roles: ['patient', 'provider'],
    },
    {
      name: 'Symptom Tracker',
      path: '/symptom-tracker',
      icon: 'HeartPulse',
      bgColor: '#f97316',
      description: 'Log your daily symptoms.',
      roles: ['patient'],
    },
    {
      name: 'Document Analyzer',
      path: '/document-analyzer',
      icon: 'FileText',
      bgColor: '#8b5cf6',
      description: 'Analyze medical documents.',
      roles: ['patient', 'provider'],
    },
    {
      name: 'Medications',
      path: '/medications',
      icon: 'Pill',
      bgColor: '#ec4899',
      description: 'Manage your medications.',
      roles: ['patient'],
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: 'UserIcon',
      bgColor: '#6366f1',
      description: 'Update your user profile.',
      roles: ['patient'],
    },
    {
      name: 'Family',
      path: '/family',
      icon: 'Users',
      bgColor: '#14b8a6',
      description: 'Manage family members.',
      roles: ['patient'],
    },
    {
      name: 'Video Consultation',
      path: '/video-consultation',
      icon: 'Shield',
      bgColor: '#d946ef',
      description: 'Start a video call.',
      roles: ['patient', 'provider'],
    },
    // Provider Features
    {
      name: 'Patient Queue',
      path: '/provider-dashboard',
      icon: 'Users',
      bgColor: '#3b82f6',
      description: "View today's patient list.",
      roles: ['provider'],
    },
    {
      name: 'Start Consultation',
      path: '/video-consultation',
      icon: 'MonitorPlay',
      bgColor: '#f97316',
      description: 'Launch a video call room.',
      roles: ['provider'],
    },
    // Admin Features
     {
      name: 'User Management',
      path: '/admin-dashboard/users',
      icon: 'UserCog',
      bgColor: 'bg-blue-500',
      description: 'Manage user roles and permissions.',
      roles: ['admin'],
    },
    {
      name: 'Platform Analytics',
      path: '/admin-dashboard/analytics',
      icon: 'BarChart',
      bgColor: 'bg-green-500',
      description: 'View usage statistics and metrics.',
      roles: ['admin'],
    },
    {
      name: 'Content Moderation',
      path: '/admin-dashboard/moderation',
      icon: 'FileText',
      bgColor: 'bg-yellow-500',
      description: 'Review and moderate user content.',
      roles: ['admin'],
    },
    {
      name: 'Platform Settings',
      path: '/admin-dashboard/settings',
      icon: 'Wrench',
      bgColor: 'bg-purple-500',
      description: 'Configure global app settings.',
      roles: ['admin'],
    },
    {
      name: 'Test Suite',
      path: '/admin-dashboard/test-suite',
      icon: 'FlaskConical',
      bgColor: 'bg-red-500',
      description: 'Run automated system checks.',
      roles: ['admin'],
    },
];
