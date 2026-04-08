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
import { Plus, Trash2, Edit2, Check, X, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotesPanelProps {
  className?: string;
}

export function NotesPanel({ className }: NotesPanelProps) {
  const { currentDate, selectedRange, notes, addNote, updateNote, deleteNote } =
    useCalendar();
  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Filter notes for current month or selected date
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

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-card rounded-xl border border-border shadow-sm overflow-hidden transition-all",
        className
      )}
    >
      {/* Header */}
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
        </div>
        <p className="text-sm text-muted-foreground mt-2 pl-12">
          {selectedRange.start
            ? formatDate(selectedRange.start)
            : `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
        </p>
      </div>

      {/* Add note form */}
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
          disabled={!newNote.trim()}
          size="sm"
          className="w-full transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Note
          <span className="ml-2 text-xs text-primary-foreground/60 hidden sm:inline">⌘↵</span>
        </Button>
      </div>

      {/* Notes list */}
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
                  className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-border transition-colors group"
                >
                  {/* Note date badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium px-2 py-1 rounded-md bg-background text-muted-foreground">
                      {new Date(note.date + "T00:00:00").toLocaleDateString(
                        "en-US",
                        {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>
                    {/* Actions - shown on hover on desktop */}
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
                  </div>

                  {editingId === note.id ? (
                    /* Edit mode */
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
                    /* View mode */
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{note.content}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
