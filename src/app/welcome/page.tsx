import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Calendar, HeartPulse } from 'lucide-react';
import Logo from '@/components/layout/logo';
import Image from 'next/image';

const features = [
  {
    icon: <Bot className="h-10 w-10 text-primary" />,
    title: 'AI Symptom Checker',
    description:
      'Get intelligent health insights by describing your symptoms. Our AI helps you understand potential risks and next steps.',
  },
  {
    icon: <Calendar className="h-10 w-10 text-primary" />,
    title: 'Easy Appointments',
    description:
      'Find the right doctor and book your consultation—video, chat, or in-person—in just a few clicks.',
  },
  {
    icon: <HeartPulse className="h-10 w-10 text-primary" />,
    title: 'Emergency Support',
    description:
      'In critical situations, our platform provides live location tracking and quick access to your emergency contacts.',
  },
];

export default function WelcomePage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[60vh] flex items-center justify-center text-center text-white">
          <Image
            src="https://picsum.photos/seed/welcome-hero/1200/800"
            alt="Rural healthcare professional assisting a patient"
            layout="fill"
            objectFit="cover"
            className="absolute z-0"
            data-ai-hint="rural healthcare"
          />
          <div className="absolute inset-0 bg-black/50 z-10" />
          <div className="relative z-20 space-y-4 p-4">
            <h1 className="text-4xl md:text-6xl font-extrabold font-headline tracking-tight">
              Welcome to MediConnect
            </h1>
            <p className="text-lg md:text-2xl max-w-3xl mx-auto text-primary-foreground/90">
              Bridging Rural Healthcare with AI-Powered Telemedicine
            </p>
            <div className="space-x-4 pt-4">
              <Button asChild size="lg">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center font-headline mb-10">
              Your Health Companion
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                      {feature.icon}
                    </div>
                    <CardTitle className="pt-4 font-headline">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between text-center md:text-left">
          <Logo />
          <p className="text-sm text-muted-foreground mt-4 md:mt-0">
            &copy; {new Date().getFullYear()} MediConnect. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
