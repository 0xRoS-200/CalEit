"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { useCalendar } from "@/lib/calendar-context";
import { formatMonthYear } from "@/lib/calendar-utils";
import { WireBinding } from "./wire-binding";
import { HeroImage } from "./hero-image";
import { CalendarGrid } from "./calendar-grid";
import { NotesPanel } from "./notes-panel";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Moon, Sun, X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(Draggable);
}

export function WallCalendar() {
  const { currentDate, isDark, toggleTheme, goToNextMonth, goToPrevMonth } =
    useCalendar();
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev">("next");
  const [targetMonth, setTargetMonth] = useState(currentDate.getMonth());
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const calendarRef = useRef<HTMLDivElement>(null);
  const notesPanelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<Draggable[]>([]);
  const wobbleTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const handleNextMonth = useCallback(() => {
    if (isFlipping) return;
    const nextMonth = (currentDate.getMonth() + 1) % 12;
    setTargetMonth(nextMonth);
    setFlipDirection("next");
    setIsFlipping(true);
  }, [currentDate, isFlipping]);

  const handlePrevMonth = useCallback(() => {
    if (isFlipping) return;
    const prevMonth = (currentDate.getMonth() - 1 + 12) % 12;
    setTargetMonth(prevMonth);
    setFlipDirection("prev");
    setIsFlipping(true);
  }, [currentDate, isFlipping]);

  const handleFlipComplete = useCallback(() => {
    setIsFlipping(false);
    if (flipDirection === "next") {
      goToNextMonth();
    } else {
      goToPrevMonth();
    }
  }, [flipDirection, goToNextMonth, goToPrevMonth]);

  // Create wobble animation
  const startWobble = useCallback(() => {
    if (!calendarRef.current || isZoomedIn) return;
    
    // Kill any existing wobble
    if (wobbleTimelineRef.current) {
      wobbleTimelineRef.current.kill();
    }
    
    // Create subtle continuous wobble
    wobbleTimelineRef.current = gsap.timeline({ repeat: -1, yoyo: true });
    wobbleTimelineRef.current
      .to(calendarRef.current, {
        rotation: 1.5,
        duration: 2,
        ease: "sine.inOut",
      })
      .to(calendarRef.current, {
        rotation: -1.5,
        duration: 2,
        ease: "sine.inOut",
      });
  }, [isZoomedIn]);

  const stopWobble = useCallback(() => {
    if (wobbleTimelineRef.current) {
      wobbleTimelineRef.current.kill();
      wobbleTimelineRef.current = null;
    }
    if (calendarRef.current) {
      gsap.to(calendarRef.current, {
        rotation: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, []);

  // Zoom in animation when clicking the calendar
  const handleZoomIn = useCallback(() => {
    if (isZoomedIn || isDragging || !calendarRef.current || !notesPanelRef.current) return;
    
    // Stop wobble and dragging
    stopWobble();
    if (draggableRef.current.length > 0) {
      draggableRef.current.forEach(d => d.disable());
    }
    
    setIsZoomedIn(true);
    
    // Animate calendar to full view - fixed position
    gsap.to(calendarRef.current, {
      scale: 1,
      x: 0,
      y: 0,
      rotation: 0,
      duration: 0.6,
      ease: "power3.out",
    });
    
    // Fade in the notes panel
    gsap.to(notesPanelRef.current, {
      opacity: 1,
      x: 0,
      duration: 0.5,
      delay: 0.2,
      ease: "power2.out",
    });
  }, [isZoomedIn, isDragging, stopWobble]);

  // Zoom out animation
  const handleZoomOut = useCallback(() => {
    if (!isZoomedIn || !calendarRef.current || !notesPanelRef.current) return;
    
    // Hide notes panel first
    gsap.to(notesPanelRef.current, {
      opacity: 0,
      x: 50,
      duration: 0.3,
      ease: "power2.in",
    });
    
    // Zoom out calendar to center
    gsap.to(calendarRef.current, {
      scale: 0.55,
      x: 0,
      y: 0,
      duration: 0.5,
      delay: 0.1,
      ease: "power2.inOut",
      onComplete: () => {
        setIsZoomedIn(false);
        // Re-enable dragging
        if (draggableRef.current.length > 0) {
          draggableRef.current.forEach(d => d.enable());
        }
        // Restart wobble
        startWobble();
      },
    });
  }, [isZoomedIn, startWobble]);

  // Set initial zoomed-out state and setup draggable
  useEffect(() => {
    if (!calendarRef.current || !notesPanelRef.current) return;
    
    // Start zoomed out and centered
    gsap.set(calendarRef.current, {
      scale: 0.55,
      transformOrigin: "center center",
      x: 0,
      y: 0,
    });
    
    // Notes panel hidden initially
    gsap.set(notesPanelRef.current, {
      opacity: 0,
      x: 50,
    });

    // Setup draggable
    draggableRef.current = Draggable.create(calendarRef.current, {
      type: "x,y",
      bounds: containerRef.current,
      inertia: true,
      edgeResistance: 0.65,
      onDragStart: () => {
        setIsDragging(true);
        stopWobble();
        gsap.to(calendarRef.current, {
          scale: 0.58,
          duration: 0.2,
          ease: "power2.out",
        });
      },
      onDragEnd: () => {
        setTimeout(() => setIsDragging(false), 100);
        gsap.to(calendarRef.current, {
          scale: 0.55,
          duration: 0.3,
          ease: "elastic.out(1, 0.5)",
          onComplete: startWobble,
        });
      },
      onThrowComplete: () => {
        startWobble();
      },
    });

    // Start wobble animation
    const wobbleTimer = setTimeout(startWobble, 500);

    return () => {
      clearTimeout(wobbleTimer);
      if (wobbleTimelineRef.current) {
        wobbleTimelineRef.current.kill();
      }
      if (draggableRef.current.length > 0) {
        draggableRef.current.forEach(d => d.kill());
      }
    };
  }, [startWobble, stopWobble]);

  return (
    <div className="fixed inset-0 bg-background transition-colors duration-300 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Header controls - fixed at top */}
      <header className="absolute top-0 left-0 right-0 z-40 p-4 md:p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-foreground tracking-tight">
              Wall Calendar
            </h1>
            {isZoomedIn && (
              <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                Your personal planner with notes
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full w-9 h-9 transition-all hover:scale-105"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </header>

      {/* Main container */}
      <div 
        ref={containerRef}
        className="absolute inset-0 flex items-center justify-center"
      >
        {/* Calendar and notes layout */}
        <div className={cn(
          "flex items-center justify-center w-full h-full",
          isZoomedIn && "flex-row gap-4 px-4 py-16 md:px-8"
        )}>
          {/* Calendar section */}
          <div 
            ref={calendarRef}
            className={cn(
              "will-change-transform",
              !isZoomedIn && "cursor-grab active:cursor-grabbing",
              isZoomedIn && "flex-1 max-w-3xl"
            )}
            onClick={!isZoomedIn && !isDragging ? handleZoomIn : undefined}
          >
            {/* Calendar card with paper effect */}
            <div 
              className={cn(
                "relative bg-calendar-paper rounded-xl overflow-hidden transition-shadow duration-300",
                "shadow-[0_8px_30px_-4px_rgba(0,0,0,0.15),0_16px_60px_-8px_rgba(0,0,0,0.15)]",
                "dark:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.5),0_16px_60px_-8px_rgba(0,0,0,0.4)]",
                !isZoomedIn && "hover:shadow-[0_12px_40px_-4px_rgba(0,0,0,0.2),0_20px_70px_-8px_rgba(0,0,0,0.2)]"
              )}
            >
              {/* Drag indicator when zoomed out */}
              {!isZoomedIn && (
                <div className="absolute top-2 right-2 z-20 bg-background/80 backdrop-blur-sm rounded-full p-1.5 opacity-60">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              
              {/* Wire binding */}
              <WireBinding />

              {/* Hero image with page flip */}
              <HeroImage
                month={isFlipping ? targetMonth : currentDate.getMonth()}
                year={currentDate.getFullYear()}
                isFlipping={isFlipping}
                direction={flipDirection}
                onFlipComplete={handleFlipComplete}
              />

              {/* Calendar content */}
              <div className="p-3 md:p-4 lg:p-6">
                {/* Month navigation */}
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevMonth();
                    }}
                    disabled={isFlipping || !isZoomedIn}
                    className="hover:bg-muted rounded-full w-8 h-8 md:w-9 md:h-9 transition-transform hover:scale-105 active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="sr-only">Previous month</span>
                  </Button>

                  <h2 className="text-lg md:text-xl lg:text-2xl font-serif font-semibold text-foreground tracking-wide">
                    {formatMonthYear(currentDate)}
                  </h2>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextMonth();
                    }}
                    disabled={isFlipping || !isZoomedIn}
                    className="hover:bg-muted rounded-full w-8 h-8 md:w-9 md:h-9 transition-transform hover:scale-105 active:scale-95"
                  >
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="sr-only">Next month</span>
                  </Button>
                </div>

                {/* Calendar grid - compact version */}
                <CalendarGrid className={cn(!isZoomedIn && "pointer-events-none")} />
              </div>

              {/* Paper edge effects */}
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
              <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-r from-black/5 to-transparent pointer-events-none" />
              <div className="absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-l from-black/5 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Notes panel - only visible when zoomed in */}
          <aside 
            ref={notesPanelRef}
            className={cn(
              "will-change-transform h-full max-h-[calc(100vh-8rem)]",
              isZoomedIn ? "w-80 lg:w-96 flex-shrink-0" : "absolute pointer-events-none"
            )}
          >
            <NotesPanel className="h-full" />
          </aside>
        </div>
      </div>

      {/* Zoom out button - shown when zoomed in */}
      {isZoomedIn && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleZoomOut}
            className="rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 gap-2"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Close</span>
          </Button>
        </div>
      )}

      {/* Instructions when zoomed out */}
      {!isZoomedIn && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 text-center">
          <div className="bg-background/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-border/50">
            <p className="text-sm text-muted-foreground font-medium">
              Drag to move • Click to open
            </p>
          </div>
        </div>
      )}

      {/* Footer info when zoomed in */}
      {isZoomedIn && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
          <p className="text-xs text-muted-foreground text-center">
            Click any date to select • Click again for range
          </p>
        </div>
      )}
    </div>
  );
}
