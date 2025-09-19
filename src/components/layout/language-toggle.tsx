
"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCurrentUser, updateUserLanguage } from "@/lib/auth";

export function LanguageToggle() {
  const { i18n } = useTranslation();

  const changeLanguage = async (lang: 'en' | 'hi' | 'de') => {
    i18n.changeLanguage(lang);
    try {
      // In a real app, you'd get the current user's ID
      const user = await getCurrentUser();
      await updateUserLanguage(user.email, lang);
    } catch (error) {
      // User may not be logged in, which is fine. The language will be saved in localStorage.
      console.log("User not logged in, language preference not saved to profile.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage("en")}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage("hi")}>
          हिंदी (Hindi)
        </DropdownMenuItem>
         <DropdownMenuItem onClick={() => changeLanguage("de")}>
          Deutsch (German)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
