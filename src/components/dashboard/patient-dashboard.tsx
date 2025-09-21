
"use client";

import { useContext, useEffect, useRef, useState } from "react";
import type { User } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Phone, User as UserIcon, MapPin, Loader2, AlertTriangle, Globe } from "lucide-react";
import { Button } from "../ui/button";
import { MenuContext } from "@/context/menu-provider";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { ToastAction } from "../ui/toast";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { useRouter } from "next/navigation";


// Mock data for emergency contacts
const emergencyContacts = [
  { name: "John Reed", relationship: "Spouse", phone: "+10987654321", avatar: "https://picsum.photos/seed/spouse/40/40" },
  { name: "Jane Reed", relationship: "Daughter", phone: "+1234509876", avatar: "https://picsum.photos/seed/daughter/40/40" },
];

const PatientDashboard = ({ user }: { user: User }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null); // To hold the Leaflet map instance
  const router = useRouter();
  const [locationStatus, setLocationStatus] = useState<"loading" | "success" | "error">("loading");
  const [locationError, setLocationError] = useState<string | null>(null);
  const { isMobileMenuOpen } = useContext(MenuContext);
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  const mapCountryToLanguage = (code: string | null): {lang: 'en' | 'hi' | 'de', langName: string} => {
    const map: Record<string, {lang: 'en' | 'hi' | 'de', langName: string}> = {
        'IN': { lang: 'hi', langName: 'Hindi' },
        'US': { lang: 'en', langName: 'English' },
        'DE': { lang: 'de', langName: 'German' },
    };
    if (code && map[code]) {
      return map[code];
    }
    return { lang: 'en', langName: 'English' }; // Default to English
  };
  
  const handleLanguageSwitch = (lang: 'en' | 'hi' | 'de') => {
    i18n.changeLanguage(lang);
    // In a real app, you would save this preference to the user's document in Firestore.
    console.log(`Simulating saving language preference: ${lang}`);
  };

  useEffect(() => {
    // Dynamically check if window is defined (for SSR)
    if (typeof window === 'undefined' || !mapContainerRef.current) return;
    
    // @ts-ignore - Leaflet is loaded from CDN
    if (!window.L) {
        console.error("Leaflet is not loaded");
        setLocationStatus("error");
        setLocationError("Map service is currently unavailable. Please try again later.");
        return;
    }
     // If map is already initialized, don't re-initialize
    if (mapInstanceRef.current) {
        return;
    }

    if (!navigator.geolocation) {
      setLocationStatus("error");
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    // @ts-ignore
    const L = window.L;

    const map = L.map(mapContainerRef.current, {
        scrollWheelZoom: false, // More user-friendly for embedded maps
    });
    mapInstanceRef.current = map;


    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const handleLocationFound = async (e: any) => {
        const radius = e.accuracy;
        const latlng = e.latlng;

        map.setView(latlng, 15);

        L.marker(latlng).addTo(map)
          .bindPopup(`You are within ${radius.toFixed(0)} meters from this point`).openPopup();

        L.circle(latlng, radius).addTo(map);
        setLocationStatus("success");

        // Reverse geocoding
        const cachedCountryCode = localStorage.getItem('countryCode');
        if (cachedCountryCode) {
            setCountryCode(cachedCountryCode);
        } else {
            try {
                setIsGeocoding(true);
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`);
                const data = await response.json();
                if (data && data.address && data.address.country_code) {
                    const code = data.address.country_code.toUpperCase();
                    setCountryCode(code);
                    localStorage.setItem('countryCode', code);

                    // Language Suggestion Logic
                    const currentLang = i18n.language;
                    const { lang, langName } = mapCountryToLanguage(code);
                    const suggestionShown = sessionStorage.getItem('langSuggestionShown');

                    if (lang !== currentLang && !suggestionShown) {
                        toast({
                            title: t("Language Suggestion"),
                            description: t('LanguageSuggestion', { langName }),
                            duration: 10000,
                            action: <ToastAction altText={t("Switch")} onClick={() => handleLanguageSwitch(lang)}>{t("Switch")}</ToastAction>,
                        });
                        sessionStorage.setItem('langSuggestionShown', 'true');
                    }
                }
            } catch (error) {
                console.error("Reverse geocoding failed:", error);
            } finally {
                setIsGeocoding(false);
            }
        }
    }

    const handleLocationError = (e: any) => {
        console.error("Geolocation error:", e.message);
        // Set a default view (e.g., center of India)
        map.setView([20.5937, 78.9629], 5);
        setLocationStatus("error");
        setLocationError("Could not access your location. Please enable location services in your browser settings to see your live location and get language suggestions.");
    }
    
    map.on('locationfound', handleLocationFound);
    map.on('locationerror', handleLocationError);

    // Show a consent-like message before requesting
    setLocationError('Please allow location access to see your live position on the map and help us suggest your preferred language.');
    map.locate({ setView: true, maxZoom: 16 });
    
    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };

  }, [toast, i18n, t]);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="relative z-0 lg:col-span-2">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline">
                      <MapPin /> {t('Live Location')}
                  </CardTitle>
                  <CardDescription>
                      {t('Your current location for emergency services and language preferences.')}
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <div
                      id="map"
                      ref={mapContainerRef}
                      className="h-[300px] md:h-[400px] w-full rounded-md bg-muted flex items-center justify-center"
                  >
                      {locationStatus === 'loading' && (
                          <div className="text-center text-muted-foreground p-4">
                              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                              <p>Requesting location permission...</p>
                          </div>
                      )}
                  </div>
                  {(locationStatus === 'error' || (locationStatus === 'loading' && locationError)) && (
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
          <div className="space-y-6">
              <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-headline">
                          <UserIcon /> {t('Emergency Contacts')}
                      </CardTitle>
                      <CardDescription>
                          {t('Your designated contacts for emergency situations.')}
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
              <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-headline">
                        <Globe /> {t('Region')}
                      </CardTitle>
                      <CardDescription>
                        {t('Your detected region for language and service personalization.')}
                      </CardDescription>
                  </CardHeader>
                  <CardContent>
                      {isGeocoding ? (
                          <div className="flex items-center gap-2 text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin"/>
                              <span>Determining country...</span>
                          </div>
                      ) : countryCode ? (
                          <p className="text-lg font-bold">{countryCode} ({mapCountryToLanguage(countryCode).langName})</p>
                      ) : (
                          <p className="text-sm text-muted-foreground">Country not detected. Please enable location access.</p>
                      )}
                  </CardContent>
              </Card>
          </div>
      </div>
    </>
  );
};

export default PatientDashboard;
