"use client";

import { useState, useMemo } from "react";
import { useCalendar, CalendarNote } from "@/lib/calendar-context";
import { formatDate, MONTH_NAMES } from "@/lib/calendar-utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, Edit2, Check, X, StickyNote, ListChecks } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface NotesPanelProps {
  className?: string;
}

export function NotesPanel({ className }: NotesPanelProps) {
  const { currentDate, selectedRange, notes, addNote, updateNote, deleteNote, deleteNotes, setSelectedRange } =
    useCalendar();
  const [newNote, setNewNote] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredNotes = useMemo(() => {
    const targetDate = selectedRange.start || currentDate;
    const monthYear = `${targetDate.getFullYear()}-${String(
      targetDate.getMonth() + 1
    ).padStart(2, "0")}`;

    return notes
      .filter((note) => note.date.startsWith(monthYear))
      .sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );
  }, [notes, selectedRange.start, currentDate]);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const dateToUse = selectedRange.start || currentDate;
    addNote(dateToUse, newNote.trim());
    setNewNote("");
  };

  const handleStartEdit = (note: CalendarNote) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editContent.trim()) return;
    updateNote(editingId, editContent.trim());
    setEditingId(null);
    setEditContent("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedIds([]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredNotes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotes.map((n) => n.id));
    }
  };

  const toggleSelectNote = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    deleteNotes(selectedIds);
    setSelectedIds([]);
    setIsSelectionMode(false);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-card rounded-xl border border-border shadow-sm overflow-hidden transition-all glow-masterpiece",
        "dark:border-primary/20",
        className
      )}
    >
      <div className="p-4 md:p-5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <StickyNote className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Notes</h3>
            <p className="text-xs text-muted-foreground">
              {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSelectionMode}
            className={cn(
              "ml-auto gap-2 transition-all",
              isSelectionMode ? "bg-primary/20 text-primary border-primary/20 border" : "text-muted-foreground"
            )}
          >
            <ListChecks className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {isSelectionMode ? "Cancel" : "Select"}
            </span>
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2 pl-12">
          <p className="text-sm text-muted-foreground">
            {selectedRange.start
              ? formatDate(selectedRange.start)
              : `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
          </p>
          {isSelectionMode && filteredNotes.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">All</span>
              <Checkbox
                checked={selectedIds.length === filteredNotes.length && filteredNotes.length > 0}
                onCheckedChange={toggleSelectAll}
                className="w-4 h-4 rounded border-primary/40 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
            </div>
          )}
        </div>
      </div>

      {selectedRange.start && selectedRange.end && (
        <div className="p-4 bg-primary/5 border-b border-border">
          <div className="flex items-center justify-between mb-3 text-xs font-bold text-primary tracking-widest uppercase">
            <span>Selected Range</span>
            <span className="bg-primary/10 px-2 py-0.5 rounded">Event Mode</span>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Event Name (e.g. Vacation)"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addNote(selectedRange.start!, eventTitle.trim() || "New Event", selectedRange.end);
                  setSelectedRange({ start: null, end: null });
                  setEventTitle("");
                }
              }}
              className="w-full bg-background border border-primary/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              autoFocus
            />
            <Button
              onClick={() => {
                addNote(selectedRange.start!, eventTitle.trim() || "New Event", selectedRange.end);
                setSelectedRange({ start: null, end: null });
                setEventTitle("");
              }}
              size="sm"
              className="w-full shadow-lg hover:scale-[1.02] active:scale-95 transition-all bg-primary text-primary-foreground font-bold"
            >
              <Check className="w-4 h-4 mr-2" />
              Save Range as Event
            </Button>
          </div>
        </div>
      )}

      <div className="p-4 border-b border-border">
        <Textarea
          placeholder="Write your note here..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.metaKey) {
              handleAddNote();
            }
          }}
          className="resize-none mb-3 min-h-[80px]"
          rows={3}
        />
        <Button
          onClick={handleAddNote}
          disabled={!newNote.trim() || isSelectionMode}
          size="sm"
          className="w-full transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Note
          <span className="ml-2 text-xs text-primary-foreground/60 hidden sm:inline">⌘↵</span>
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {filteredNotes.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <div className="w-16 h-16 rounded-full bg-muted/50 mx-auto mb-4 flex items-center justify-center">
                <StickyNote className="w-8 h-8 opacity-40" />
              </div>
              <p className="text-sm font-medium">No notes yet</p>
              <p className="text-xs mt-1 max-w-[200px] mx-auto">
                Select a date and add a note to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className={cn(
                    "p-4 rounded-xl transition-all border group relative",
                    isSelectionMode ? "cursor-pointer pl-12" : "bg-muted/30 border-border/50 hover:border-border",
                    isSelectionMode && selectedIds.includes(note.id) ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20" : "bg-muted/20 border-border/40"
                  )}
                  onClick={isSelectionMode ? () => toggleSelectNote(note.id) : undefined}
                >
                  {isSelectionMode && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Checkbox
                        checked={selectedIds.includes(note.id)}
                        onCheckedChange={() => toggleSelectNote(note.id)}
                        className="w-5 h-5 rounded-md border-primary/40 data-[state=checked]:bg-primary"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                        {note.endDate ? "EVENT" : "NOTE"}
                      </span>
                      <span className="text-xs font-medium px-2 py-1 rounded-md bg-background text-muted-foreground">
                        {new Date(note.date + "T00:00:00").toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          }
                        )}
                        {note.endDate && (
                          <>
                            <span className="mx-1 opacity-50">→</span>
                            {new Date(note.endDate + "T00:00:00").toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </>
                        )}
                      </span>
                    </div>
                    {!isSelectionMode && (
                      <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStartEdit(note)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span className="sr-only">Edit note</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="sr-only">Delete note</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete note?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently
                                delete your note.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteNote(note.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>

                  {editingId === note.id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="resize-none min-h-[80px]"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={handleSaveEdit}
                          className="flex-1"
                        >
                          <Check className="w-3.5 h-3.5 mr-1.5" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="flex-1"
                        >
                          <X className="w-3.5 h-3.5 mr-1.5" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{note.content}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {isSelectionMode && selectedIds.length > 0 && (
        <div className="p-4 bg-muted/50 border-t border-border animate-in slide-in-from-bottom-2 duration-300">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full font-bold shadow-lg hover:scale-[1.01] active:scale-95 transition-all"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete {selectedIds.length} {selectedIds.length === 1 ? "Item" : "Items"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete multiple items?</AlertDialogTitle>
                <AlertDialogDescription>
                  You are about to delete {selectedIds.length} selected items. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteSelected}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Selected
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
