"use client";

import { useContext, useEffect, useRef, useState } from "react";
import type { User } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Phone, User as UserIcon, MapPin, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";
import { MenuContext } from "@/context/menu-provider";
import { cn } from "@/lib/utils";

// Mock data for emergency contacts
const emergencyContacts = [
  { name: "John Reed", relationship: "Spouse", phone: "+10987654321", avatar: "https://picsum.photos/seed/spouse/40/40" },
  { name: "Jane Reed", relationship: "Daughter", phone: "+1234509876", avatar: "https://picsum.photos/seed/daughter/40/40" },
];

const PatientDashboard = ({ user }: { user: User }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [locationStatus, setLocationStatus] = useState<"loading" | "success" | "error">("loading");
  const [locationError, setLocationError] = useState<string | null>(null);
  const { isMobileMenuOpen } = useContext(MenuContext);

  useEffect(() => {
    // Dynamically check if window is defined (for SSR)
    if (typeof window === 'undefined' || !mapRef.current) return;
    
    // @ts-ignore - Leaflet is loaded from CDN
    if (!window.L) {
        console.error("Leaflet is not loaded");
        setLocationStatus("error");
        setLocationError("Map service is currently unavailable. Please try again later.");
        return;
    }

    // @ts-ignore
    const L = window.L;

    const map = L.map(mapRef.current, {
        scrollWheelZoom: false, // More user-friendly for embedded maps
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const handleLocationFound = (e: any) => {
        const radius = e.accuracy;
        const latlng = e.latlng;

        map.setView(latlng, 15);

        L.marker(latlng).addTo(map)
          .bindPopup(`You are within ${radius.toFixed(0)} meters from this point`).openPopup();

        L.circle(latlng, radius).addTo(map);
        setLocationStatus("success");
    }

    const handleLocationError = (e: any) => {
        console.error("Geolocation error:", e.message);
        // Set a default view (e.g., center of India)
        map.setView([20.5937, 78.9629], 5);
        setLocationStatus("error");
        setLocationError("Could not access your location. Please enable location services in your browser settings. Showing a default map view.");
    }
    
    map.on('locationfound', handleLocationFound);
    map.on('locationerror', handleLocationError);

    map.locate({ setView: true, maxZoom: 16, watch: true });
    
    // Cleanup function
    return () => {
        map.stopLocate();
        map.remove();
    };

  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-2">
        <Card className="relative z-0">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <MapPin /> Live Location
                </CardTitle>
                <CardDescription>
                    Your current location for emergency services.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div 
                    id="map" 
                    ref={mapRef} 
                    className="h-[300px] md:h-[400px] w-full rounded-md bg-muted flex items-center justify-center"
                >
                    {locationStatus === 'loading' && (
                        <div className="text-center text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                            <p>Accessing your location...</p>
                        </div>
                    )}
                </div>
                 {locationStatus === 'error' && (
                    <div className="mt-4 p-3 bg-destructive/10 border border-destructive/50 rounded-md text-sm text-destructive flex gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        <p>{locationError}</p>
                    </div>
                )}
            </CardContent>
             <div className={cn(
                "absolute inset-0 bg-background/80 transition-opacity duration-300 z-20",
                isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
             )} />
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <UserIcon /> Emergency Contacts
                </CardTitle>
                <CardDescription>
                    Your designated contacts for emergency situations.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {emergencyContacts.map(contact => (
                    <div key={contact.name} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                            <p className="font-semibold">{contact.name}</p>
                            <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                        </div>
                        <Button size="icon">
                            <Phone />
                            <span className="sr-only">Call {contact.name}</span>
                        </Button>
                    </div>
                 ))}
            </CardContent>
        </Card>
    </div>
  );
};

export default PatientDashboard;
