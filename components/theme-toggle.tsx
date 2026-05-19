"use client"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative"
    >
      <div className="h-5 w-5 bg-muted rounded-full" />
    </Button>
  )
}
