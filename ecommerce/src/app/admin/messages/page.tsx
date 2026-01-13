"use client";

import { useEffect, useState } from "react";
import {
  Trash2,
  Eye,
  CheckCircle,
  Mail,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userAvatar?: string | null;
}

// Generate Avatar URL using Unavatar with Initials fallback
// Generate Avatar URL using Unavatar with UI-Avatars fallback
const getAvatarUrl = (email: string, name: string): string => {
  const trimmedEmail = email?.toLowerCase().trim() || "";
  const trimmedName = name?.trim() || "User";

  // Fallback: Simple and reliable initials via ui-avatars.com
  const initialsFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmedName)}&background=random&color=fff&size=128`;
  const encodedFallback = encodeURIComponent(initialsFallback);

  // Use Unavatar to find Google/Gravatar, falling back to our custom initials
  return `https://unavatar.io/${trimmedEmail}?fallback=${encodedFallback}`;
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null,
  );
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/admin/messages");
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/admin/messages?id=${id}`, { method: "DELETE" });
      setMessages(messages.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "READ" }),
      });
      setMessages(
        messages.map((m) => (m.id === id ? { ...m, status: "READ" } : m)),
      );
    } catch (error) {
      console.error("Error updating message:", error);
    }
  };

  const openMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setShowModal(true);
    if (message.status === "UNREAD") {
      handleMarkAsRead(message.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const unreadCount = messages.filter((m) => m.status === "UNREAD").length;

  return (
    <div className="flex h-full flex-1 flex-col space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Messages de Contact
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gérez les messages reçus via le formulaire de contact
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="text-sm">
            {unreadCount} non lu{unreadCount > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100/50 dark:border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/30 dark:bg-gray-900/50">
              <TableRow className="border-b border-gray-100 dark:border-gray-700 hover:bg-transparent">
                <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4">
                  Statut
                </TableHead>
                <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4">
                  Nom
                </TableHead>
                <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4">
                  Email
                </TableHead>
                <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4 hidden md:table-cell">
                  Message
                </TableHead>
                <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4 hidden lg:table-cell">
                  Date
                </TableHead>
                <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4 text-right pr-4">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <MessageSquare className="h-8 w-8 mb-2 opacity-20" />
                      <p>Aucun message pour le moment.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((message) => (
                  <TableRow
                    key={message.id}
                    onClick={() => openMessage(message)}
                    className={`hover:bg-muted/30 cursor-pointer transition-colors border-b border-gray-100/50 dark:border-gray-700/50 ${
                      message.status === "UNREAD"
                        ? "bg-blue-50/50 dark:bg-blue-900/20 shadow-[inset_4px_0_0_0_#3b82f6]"
                        : ""
                    }`}
                  >
                    <TableCell>
                      <Badge
                        variant={
                          message.status === "UNREAD" ? "default" : "secondary"
                        }
                        className={`${
                          message.status === "UNREAD"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {message.status === "UNREAD" ? "Non lu" : "Lu"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-gray-200 dark:border-gray-700">
                          <AvatarImage
                            src={
                              message.userAvatar ||
                              getAvatarUrl(message.email, message.name)
                            }
                            alt={message.name}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                            {message.name.substring(0, 1).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{message.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 opacity-50" />
                        {message.email}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {message.message}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 opacity-50" />
                        {formatDate(message.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell
                      className="text-right pr-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openMessage(message)}
                          className="h-8 w-8 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {message.status === "UNREAD" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMarkAsRead(message.id)}
                            className="h-8 w-8 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Confirmer la suppression
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
                                Voulez-vous vraiment supprimer ce message ?
                                Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-transparent border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                                Annuler
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(message.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedMessage && (
        <Sheet open={showModal} onOpenChange={setShowModal}>
          <SheetContent className="sm:max-w-md bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-6 shadow-xl">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-xl font-bold">
                Détails du message
              </SheetTitle>
              <SheetDescription className="text-muted-foreground">
                Message reçu via le formulaire de contact
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="flex flex-col items-center justify-center -mt-4 mb-6">
                <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800 shadow-xl mb-3">
                  <AvatarImage
                    src={getAvatarUrl(
                      selectedMessage.email,
                      selectedMessage.name,
                    )}
                    alt={selectedMessage.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                    {selectedMessage.name.substring(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedMessage.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedMessage.email}
                </p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 space-y-1">
                <p className="text-xs font-black uppercase tracking-wider text-muted-foreground/70">
                  Nom
                </p>
                <p className="text-foreground font-medium">
                  {selectedMessage.name}
                </p>
              </div>

              <div className="bg-muted/50 rounded-xl p-4 space-y-1">
                <p className="text-xs font-black uppercase tracking-wider text-muted-foreground/70">
                  Email
                </p>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Mail size={16} className="text-muted-foreground" />
                  {selectedMessage.email}
                </div>
              </div>

              {selectedMessage.phone && (
                <div className="bg-muted/50 rounded-xl p-4 space-y-1">
                  <p className="text-xs font-black uppercase tracking-wider text-muted-foreground/70">
                    Téléphone
                  </p>
                  <p className="text-foreground font-medium">
                    {selectedMessage.phone}
                  </p>
                </div>
              )}

              <div className="bg-muted/50 rounded-xl p-4 space-y-1">
                <p className="text-xs font-black uppercase tracking-wider text-muted-foreground/70">
                  Message
                </p>
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </p>
              </div>

              <div className="bg-muted/50 rounded-xl p-4 space-y-1">
                <p className="text-xs font-black uppercase tracking-wider text-muted-foreground/70">
                  Date
                </p>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Calendar size={16} className="text-muted-foreground" />
                  {new Date(selectedMessage.createdAt).toLocaleString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
