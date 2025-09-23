
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
      bgColor: 'bg-blue-500',
      description: 'Get a preliminary health check.',
      roles: ['patient'],
    },
    {
      name: 'Appointments',
      path: '/appointments',
      icon: 'Calendar',
      bgColor: 'bg-green-500',
      description: 'Schedule new appointments.',
      roles: ['patient', 'provider'],
    },
    {
      name: 'Symptom Tracker',
      path: '/symptom-tracker',
      icon: 'HeartPulse',
      bgColor: 'bg-orange-500',
      description: 'Log your daily symptoms.',
      roles: ['patient'],
    },
    {
      name: 'Document Analyzer',
      path: '/document-analyzer',
      icon: 'FileText',
      bgColor: 'bg-purple-500',
      description: 'Analyze medical documents.',
      roles: ['patient', 'provider'],
    },
    {
      name: 'Medications',
      path: '/medications',
      icon: 'Pill',
      bgColor: 'bg-pink-500',
      description: 'Manage your medications.',
      roles: ['patient'],
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: 'UserIcon',
      bgColor: 'bg-indigo-500',
      description: 'Update your user profile.',
      roles: ['patient'],
    },
    {
      name: 'Family',
      path: '/family',
      icon: 'Users',
      bgColor: 'bg-teal-500',
      description: 'Manage family members.',
      roles: ['patient'],
    },
     {
      name: 'Community Chat',
      path: '/community-chat',
      icon: 'MessageSquareDashed',
      bgColor: 'bg-yellow-500',
      description: 'Connect with the community.',
      roles: ['patient', 'provider'],
    },
    {
      name: 'Video Consultation',
      path: '/video-consultation',
      icon: 'MonitorPlay',
      bgColor: 'bg-fuchsia-500',
      description: 'Start a video call.',
      roles: ['patient', 'provider'],
    },
    // Provider Features
    {
      name: 'Patient Queue',
      path: '/provider-dashboard',
      icon: 'Users',
      bgColor: 'bg-blue-500',
      description: "View today's patient list.",
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
      icon: 'Shield',
      bgColor: 'bg-yellow-500',
      description: 'Review and moderate user content.',
      roles: ['admin'],
    },
     {
      name: 'Support Tickets',
      path: '/admin-dashboard/support',
      icon: 'LifeBuoy',
      bgColor: 'bg-orange-500',
      description: 'Manage and resolve user issues.',
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
