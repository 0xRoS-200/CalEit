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
import { ChevronLeft, ChevronRight, Moon, Sun, X, GripVertical, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const SCALE_OVERVIEW = 0.55;
const SCALE_ZOOMED = 0.85;
const IDLE_TIME_ROAM = 30000;
const IDLE_TIME_CLOSE = 60000;

if (typeof window !== "undefined") {
  gsap.registerPlugin(Draggable);
}

export function WallCalendar() {
  const { currentDate, isDark, toggleTheme, goToNextMonth, goToPrevMonth } =
    useCalendar();
  const isMobile = useIsMobile();
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev">("next");
  const [targetMonth, setTargetMonth] = useState(currentDate.getMonth());
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [isRoaming, setIsRoaming] = useState(false);
  
  const calendarRef = useRef<HTMLDivElement>(null);
  const notesPanelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<Draggable[]>([]);
  const wobbleTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const roamingTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const handleNextMonth = useCallback(() => {
    if (isFlipping) return;
    
    if (isZoomedIn) {
      goToNextMonth();
      return;
    }

    const nextMonth = (currentDate.getMonth() + 1) % 12;
    setTargetMonth(nextMonth);
    setFlipDirection("next");
    setIsFlipping(true);
  }, [currentDate, isFlipping, isZoomedIn, goToNextMonth]);

  const handlePrevMonth = useCallback(() => {
    if (isFlipping) return;

    if (isZoomedIn) {
      goToPrevMonth();
      return;
    }

    const prevMonth = (currentDate.getMonth() - 1 + 12) % 12;
    setTargetMonth(prevMonth);
    setFlipDirection("prev");
    setIsFlipping(true);
  }, [currentDate, isFlipping, isZoomedIn, goToPrevMonth]);

  const handleFlipComplete = useCallback(() => {
    setIsFlipping(false);
    if (flipDirection === "next") {
      goToNextMonth();
    } else {
      goToPrevMonth();
    }
  }, [flipDirection, goToNextMonth, goToPrevMonth]);

  const startFloating = useCallback(() => {
    if (!calendarRef.current || isZoomedIn) return;
    
    if (wobbleTimelineRef.current) {
      wobbleTimelineRef.current.kill();
    }
    
    wobbleTimelineRef.current = gsap.timeline({ 
      repeat: -1, 
      yoyo: true,
      defaults: { force3D: true }
    });
    
    wobbleTimelineRef.current
      .to(calendarRef.current, {
        rotationX: 8,
        rotationY: 8,
        y: -15,
        duration: 4,
        ease: "sine.inOut",
      })
      .to(calendarRef.current, {
        rotationX: -4,
        rotationY: -4,
        y: 15,
        duration: 4,
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
        rotationX: 0,
        rotationY: 0,
        y: 0,
        z: 0.1,
        duration: 0.6,
        ease: "back.out(1.7)",
        force3D: true,
      });
    }
  }, []);

  const stopRoaming = useCallback(() => {
    if (roamingTimelineRef.current) {
      roamingTimelineRef.current.kill();
      roamingTimelineRef.current = null;
    }
    setIsRoaming(false);
  }, []);

  const startRoaming = useCallback(() => {
    if (!calendarRef.current || isZoomedIn || isDragging || isRoaming || isMobile) return;
    
    stopWobble();
    setIsRoaming(true);
    
    const move = () => {
      if (!calendarRef.current || isZoomedIn || isDragging) return;
      
      const bounds = containerRef.current?.getBoundingClientRect();
      if (!bounds) return;
      
      const cardWidth = calendarRef.current.offsetWidth * SCALE_OVERVIEW;
      const cardHeight = calendarRef.current.offsetHeight * SCALE_OVERVIEW;
      
      const maxX = Math.max(0, (bounds.width - cardWidth) / 4);
      const maxY = Math.max(0, (bounds.height - cardHeight) / 4);
      
      const randomX = maxX > 0 ? (Math.random() - 0.5) * maxX * 2 : 0;
      const randomY = maxY > 0 ? (Math.random() - 0.5) * maxY * 2 : 0;
      
      roamingTimelineRef.current = gsap.timeline({ onComplete: move });
      roamingTimelineRef.current.to(calendarRef.current, {
        x: randomX,
        y: randomY,
        rotation: (Math.random() - 0.5) * 5,
        duration: 8 + Math.random() * 4,
        ease: "sine.inOut",
      });
    };
    
    move();
  }, [isZoomedIn, isDragging, isRoaming, isMobile, stopWobble]);

  const handleZoomIn = useCallback(() => {
    if (isZoomedIn || isDragging || !calendarRef.current || !notesPanelRef.current) return;
    
    stopWobble();
    stopRoaming();
    if (draggableRef.current.length > 0) {
      draggableRef.current.forEach(d => d.disable());
    }
    
    setIsZoomedIn(true);
    
    gsap.to(calendarRef.current, {
      scale: isMobile ? 1 : 1,
      x: 0,
      y: 0,
      rotation: 0,
      duration: 0.8,
      ease: "back.out(1.2)",
      force3D: true,
    });
    
    gsap.to(notesPanelRef.current, {
      opacity: 1,
      x: 0,
      duration: 0.6,
      delay: 0.3,
      ease: "power3.out",
    });

    const dates = calendarRef.current.querySelectorAll(".calendar-day-btn");
    if (dates.length > 0) {
      gsap.fromTo(dates, 
        { 
          opacity: 0, 
          scale: 0.8,
          y: 10 
        },
        { 
          opacity: 1, 
          scale: 1,
          y: 0,
          duration: 0.5,
          stagger: {
            each: 0.015,
            from: "center"
          },
          delay: 0.2,
          ease: "back.out(1.5)"
        }
      );
    }
  }, [isZoomedIn, isDragging, stopWobble, stopRoaming, isMobile]);

  const handleZoomOut = useCallback(() => {
    if (!isZoomedIn || !calendarRef.current || !notesPanelRef.current) return;
    
    gsap.to(notesPanelRef.current, {
      opacity: 0,
      x: 50,
      duration: 0.3,
      ease: "power2.in",
    });
    
    gsap.to(calendarRef.current, {
      scale: isMobile ? 1 : SCALE_OVERVIEW,
      x: 0,
      y: 0,
      duration: 0.5,
      delay: 0.1,
      ease: "power2.inOut",
      onComplete: () => {
        setIsZoomedIn(false);
        if (draggableRef.current.length > 0 && !isMobile) {
          draggableRef.current.forEach(d => d.enable());
        }
        if (!isMobile) startFloating();
      },
    });
  }, [isZoomedIn, startFloating, isMobile]);

  useEffect(() => {
    if (!calendarRef.current || !notesPanelRef.current) return;
    
    gsap.set(calendarRef.current, {
      scale: isMobile ? 1 : SCALE_OVERVIEW,
      transformOrigin: "center center",
      x: 0,
      y: 0,
    });
    
    gsap.set(notesPanelRef.current, {
      opacity: 0,
      x: 50,
    });

    if (!isMobile) {
      draggableRef.current = Draggable.create(calendarRef.current, {
        type: "x,y",
        bounds: containerRef.current,
        inertia: true,
        edgeResistance: 0.65,
        onDragStart: () => {
          setIsDragging(true);
          stopWobble();
          stopRoaming();
          setLastInteraction(Date.now());
          gsap.to(calendarRef.current, {
            scale: SCALE_OVERVIEW + 0.05,
            duration: 0.2,
            ease: "power2.out",
          });
        },
        onDragEnd: () => {
          setTimeout(() => setIsDragging(false), 100);
          gsap.to(calendarRef.current, {
            scale: SCALE_OVERVIEW,
            duration: 0.3,
            ease: "elastic.out(1, 0.5)",
            onComplete: startFloating,
          });
        },
        onThrowComplete: () => {
          startFloating();
        },
      });
    }

    const wobbleTimer = !isMobile ? setTimeout(startFloating, 500) : null;

    return () => {
      if (wobbleTimer) clearTimeout(wobbleTimer);
      if (wobbleTimelineRef.current) {
        wobbleTimelineRef.current.kill();
      }
      if (roamingTimelineRef.current) {
        roamingTimelineRef.current.kill();
      }
      if (draggableRef.current.length > 0) {
        draggableRef.current.forEach(d => d.kill());
      }
    };
  }, [startFloating, stopWobble, stopRoaming, isMobile]);

  useEffect(() => {
    const updateInteraction = () => {
      setLastInteraction(Date.now());
      if (isRoaming) stopRoaming();
    };

    const idleInterval = setInterval(() => {
      const now = Date.now();
      const idleTime = now - lastInteraction;

      if (!isZoomedIn && !isRoaming && !isDragging && !isMobile) {
        if (idleTime > IDLE_TIME_ROAM) {
          startRoaming();
        }
      }
    }, 2000);

    window.addEventListener("mousemove", updateInteraction);
    window.addEventListener("mousedown", updateInteraction);
    window.addEventListener("touchstart", updateInteraction);
    window.addEventListener("keydown", updateInteraction);

    return () => {
      clearInterval(idleInterval);
      window.removeEventListener("mousemove", updateInteraction);
      window.removeEventListener("mousedown", updateInteraction);
      window.removeEventListener("touchstart", updateInteraction);
      window.removeEventListener("keydown", updateInteraction);
    };
  }, [lastInteraction, isZoomedIn, isRoaming, isDragging, isMobile, startRoaming, stopRoaming, handleZoomOut]);

  return (
    <div className="fixed inset-0 bg-background transition-colors duration-300 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      <header className="absolute top-0 left-0 right-0 z-50 p-4 md:p-6 overflow-visible">
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
            className="rounded-full w-10 h-10 transition-all hover:scale-110 active:scale-95 bg-background/50 backdrop-blur-md border-primary/20 hover:border-primary shadow-lg"
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

      <div 
        ref={containerRef}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className={cn(
          "flex items-center justify-center w-full h-full",
          isZoomedIn && "flex-col md:flex-row flex-nowrap md:flex-wrap items-center justify-start md:justify-center gap-6 p-4 pt-24 md:p-8 overflow-y-auto"
        )}>
          <div 
            ref={calendarRef}
            className={cn(
              "will-change-transform transition-all duration-300",
              !isZoomedIn && !isMobile && "cursor-grab active:cursor-grabbing",
              isZoomedIn 
                ? "w-[85vw] md:w-[60vw] lg:w-[45vw] max-w-[75vh] h-auto min-h-[500px] flex flex-col" 
                : isMobile ? "w-[90vw] max-w-md" : "w-[60vw] max-w-2xl"
            )}
            onClick={!isZoomedIn && !isDragging ? handleZoomIn : undefined}
          >
            <div 
              className={cn(
                "relative bg-calendar-paper rounded-xl overflow-hidden transition-all duration-500 h-auto flex flex-col glow-masterpiece",
                "shadow-[0_8px_30px_-4px_rgba(0,0,0,0.15),0_16px_60px_-8px_rgba(0,0,0,0.15)]",
                !isZoomedIn && "hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)]"
              )}
            >
              {!isZoomedIn && !isMobile && (
                <div className="absolute top-2 right-2 z-20 bg-background/80 backdrop-blur-sm rounded-full p-1.5 opacity-60">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              
              <WireBinding />

              {!isZoomedIn && (
                <HeroImage
                  month={isFlipping ? targetMonth : currentDate.getMonth()}
                  year={currentDate.getFullYear()}
                  isFlipping={isFlipping}
                  direction={flipDirection}
                  onFlipComplete={handleFlipComplete}
                />
              )}

              <div className="p-3 md:p-4 lg:p-6 flex-1 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevMonth();
                    }}
                    disabled={isFlipping}
                    className="hover:bg-muted rounded-full w-8 h-8 md:w-9 md:h-9 transition-transform hover:scale-110 active:scale-90"
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
                    disabled={isFlipping}
                    className="hover:bg-muted rounded-full w-8 h-8 md:w-9 md:h-9 transition-transform hover:scale-110 active:scale-90"
                  >
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="sr-only">Next month</span>
                  </Button>
                </div>

                <CalendarGrid className={cn(!isZoomedIn && "pointer-events-none")} />
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
              <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-r from-black/5 to-transparent pointer-events-none" />
              <div className="absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-l from-black/5 to-transparent pointer-events-none" />
            </div>
          </div>

          <aside 
            ref={notesPanelRef}
            className={cn(
              "will-change-transform h-full max-h-[85vh] z-40",
              isZoomedIn ? "w-full md:w-80 lg:w-96 flex-shrink-0 mb-8 md:mb-0" : "absolute pointer-events-none"
            )}
          >
            <NotesPanel className="h-full bg-background/80 backdrop-blur-xl border-primary/10" />
          </aside>
        </div>
      </div>

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

      {!isZoomedIn && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 text-center w-full px-4">
          <div className="bg-background/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-border/50 inline-block">
            <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
              {isMobile ? (
                <>
                  <Button variant="link" size="sm" onClick={handleZoomIn} className="p-0 h-auto font-bold text-primary">
                    <Maximize2 className="w-4 h-4" /> Open Controls
                  </Button>
                </>
              ) : (
                "Drag to move • Click to open"
              )}
            </p>
          </div>
        </div>
      )}

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
