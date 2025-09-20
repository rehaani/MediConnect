
"use client";

import * as React from "react";
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import { Bot, Calendar, FileText, HeartPulse, Pill, User as UserIcon, Shield, Users, MonitorPlay, UserCog, BarChart, Wrench, FlaskConical, LifeBuoy } from "lucide-react";

const icons: { [key: string]: React.ReactNode } = {
  Bot: <Bot />,
  Calendar: <Calendar />,
  FileText: <FileText />,
  HeartPulse: <HeartPulse />,
  Pill: <Pill />,
  UserIcon: <UserIcon />,
  Shield: <Shield />,
  Users: <Users />,
  MonitorPlay: <MonitorPlay />,
  UserCog: <UserCog />,
  BarChart: <BarChart />,
  Wrench: <Wrench />,
  FlaskConical: <FlaskConical />,
  LifeBuoy: <LifeBuoy />,
};


type Feature = {
  name: string;
  path: string;
  icon: string;
  bgColor: string;
  description: string;
};

type DashboardCardsProps = {
  features: Feature[];
};

export default function DashboardCards({ features }: DashboardCardsProps) {
  const router = useRouter();
  
  const handleKeyDown = (event: React.KeyboardEvent, path: string) => {
    if (event.key === 'Enter') {
      router.push(path);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {features.map((feature) => (
        <motion.div
          key={feature.name}
          whileHover={{ scale: 1.05 }}
          className="group"
        >
          <Link 
            href={feature.path} 
            aria-label={feature.name}
            role="button"
            onKeyDown={(e) => handleKeyDown(e, feature.path)}
          >
            <Card 
              className={cn(
                "text-white p-4 h-[140px] md:h-[180px] flex flex-col justify-center items-center text-center transition-shadow duration-300 ease-in-out hover:shadow-lg",
                !feature.bgColor.startsWith('bg-') && "text-white"
              )}
              style={{ backgroundColor: feature.bgColor.startsWith('bg-') ? undefined : feature.bgColor }}
              {...(feature.bgColor.startsWith('bg-') && { className: `p-4 h-[140px] md:h-[180px] flex flex-col justify-center items-center text-center transition-shadow duration-300 ease-in-out hover:shadow-lg text-white ${feature.bgColor}` })}
            >
              <div className="mb-2">
                {React.cloneElement(icons[feature.icon] as React.ReactElement, { className: "h-8 w-8 md:h-10 md:w-10" })}
              </div>
              <h3 className="font-headline text-base md:text-lg font-semibold">{feature.name}</h3>
              <p className="text-xs text-white/80 transition-opacity duration-300 opacity-0 group-hover:opacity-100 h-0 group-hover:h-auto">
                {feature.description}
              </p>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
