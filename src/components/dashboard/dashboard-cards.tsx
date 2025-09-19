
"use client";

import * as React from "react";
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { cn } from "@/lib/utils";

type Feature = {
  name: string;
  path: string;
  icon: React.ReactNode;
  bgColor: string;
  description: string;
};

type DashboardCardsProps = {
  features: Feature[];
};

export default function DashboardCards({ features }: DashboardCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {features.map((feature) => (
        <Link href={feature.path} key={feature.name} className="group" aria-label={feature.name}>
          <Card 
            className={cn(
              "text-white p-4 h-[140px] md:h-[180px] flex flex-col justify-center items-center text-center transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg",
              !feature.bgColor.startsWith('bg-') && "text-white"
            )}
            style={{ backgroundColor: feature.bgColor.startsWith('bg-') ? undefined : feature.bgColor }}
            {...(feature.bgColor.startsWith('bg-') && { className: `p-4 h-[140px] md:h-[180px] flex flex-col justify-center items-center text-center transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg text-white ${feature.bgColor}` })}
          >
            <div className="mb-2">
              {React.cloneElement(feature.icon as React.ReactElement, { className: "h-8 w-8 md:h-10 md:w-10" })}
            </div>
            <h3 className="font-headline text-base md:text-lg font-semibold">{feature.name}</h3>
            <p className="text-xs text-white/80 transition-opacity duration-300 opacity-0 group-hover:opacity-100 h-0 group-hover:h-auto">
              {feature.description}
            </p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
