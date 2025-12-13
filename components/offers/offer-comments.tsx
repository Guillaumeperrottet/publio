"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquare, Loader2, Send, Trash2 } from "lucide-react";
import {
  getOfferComments,
  addOfferComment,
  deleteOfferComment,
} from "@/features/offers/actions";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface OfferCommentsProps {
  offerId: string;
  organizationName: string;
  currentUserId: string;
  commentsCount?: number;
}

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  authorId: string;
  author: {
    id: string;
    name: string | null;
    email: string;
  };
};

export function OfferComments({
  offerId,
  organizationName,
  currentUserId,
  commentsCount = 0,
}: OfferCommentsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const data = await getOfferComments(offerId);
      setComments(data);
    } catch (error) {
      console.error("Error loading comments:", error);
      toast.error("Erreur lors du chargement des commentaires");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await addOfferComment(offerId, newComment.trim());

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setNewComment("");
      await loadComments();
      router.refresh();
      toast.success("Commentaire ajouté");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setDeletingId(commentId);
    try {
      const result = await deleteOfferComment(commentId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      await loadComments();
      router.refresh();
      toast.success("Commentaire supprimé");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="hover:bg-sand-light">
          <MessageSquare className="w-4 h-4 mr-2" />
          Commentaires {commentsCount > 0 && `(${commentsCount})`}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Commentaires internes</DialogTitle>
          <DialogDescription>
            Discussion d&apos;équipe sur l&apos;offre de{" "}
            <span className="font-semibold">{organizationName}</span>. Visible
            uniquement par votre organisation.
          </DialogDescription>
        </DialogHeader>

        {/* Liste des commentaires */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Aucun commentaire pour le moment</p>
              <p className="text-xs mt-1">
                Soyez le premier à commenter cette offre
              </p>
            </div>
          ) : (
            comments.map((comment) => {
              const isAuthor = comment.authorId === currentUserId;
              return (
                <div
                  key={comment.id}
                  className={`p-4 rounded-lg border-2 ${
                    isAuthor
                      ? "bg-artisan-yellow/10 border-artisan-yellow/30"
                      : "bg-sand-light/30 border-sand-light"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm flex items-center gap-2">
                        {comment.author.name || comment.author.email}
                        {isAuthor && (
                          <span className="text-xs bg-artisan-yellow text-matte-black px-2 py-0.5 rounded-full font-semibold">
                            Vous
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}{" "}
                        •{" "}
                        {new Date(comment.createdAt).toLocaleString("fr-CH", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {isAuthor && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deletingId === comment.id}
                        className="hover:bg-red-50 hover:text-red-600 h-8 px-2"
                      >
                        {deletingId === comment.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Formulaire d'ajout de commentaire */}
        <div className="border-t pt-4 mt-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajoutez un commentaire..."
            className="min-h-20 mb-3"
            disabled={isSubmitting}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleAddComment();
              }
            }}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {newComment.length} caractères • ⌘+Entrée pour envoyer
            </p>
            <Button
              onClick={handleAddComment}
              disabled={isSubmitting || !newComment.trim()}
              size="sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
