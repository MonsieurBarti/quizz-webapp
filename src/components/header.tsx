"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSession, signIn, signOut } from "next-auth/react";

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            Quizz App
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/quizz" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/quizz") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Take Quizzes
            </Link>
            
            {session && (
              <Link 
                href="/dashboard" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/dashboard") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden md:inline-block">
                {session.user?.name || session.user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={() => void signOut()}>
                Sign Out
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => void signIn()}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
