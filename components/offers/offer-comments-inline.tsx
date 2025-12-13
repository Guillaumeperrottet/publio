"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Trash2, MessageSquare } from "lucide-react";
import {
  getOfferComments,
  addOfferComment,
  deleteOfferComment,
} from "@/features/offers/actions";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface OfferCommentsInlineProps {
  offerId: string;
  currentUserId: string;
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

export function OfferCommentsInline({
  offerId,
  currentUserId,
}: OfferCommentsInlineProps) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <div className="space-y-4">
      {/* Liste des commentaires */}
      <div className="h-[300px] overflow-y-auto pr-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aucun commentaire</p>
            <p className="text-xs mt-1">Soyez le premier à commenter</p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => {
              const isAuthor = comment.authorId === currentUserId;
              return (
                <div
                  key={comment.id}
                  className={`p-3 rounded-lg border ${
                    isAuthor
                      ? "bg-artisan-yellow/10 border-artisan-yellow/30"
                      : "bg-sand-light/30 border-sand-light"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-xs flex items-center gap-2">
                        {comment.author.name || comment.author.email}
                        {isAuthor && (
                          <span className="text-[10px] bg-artisan-yellow text-matte-black px-1.5 py-0.5 rounded-full font-semibold">
                            Vous
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                    </div>
                    {isAuthor && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deletingId === comment.id}
                        className="hover:bg-red-50 hover:text-red-600 h-6 w-6 p-0"
                      >
                        {deletingId === comment.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                  </div>
                  <p className="text-xs whitespace-pre-wrap leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Formulaire d'ajout */}
      <div className="border-t pt-3">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Ajouter un commentaire..."
          className="min-h-[60px] text-sm mb-2"
          disabled={isSubmitting}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleAddComment();
            }
          }}
        />
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">
            {newComment.length} caractères • ⌘+Entrée
          </p>
          <Button
            onClick={handleAddComment}
            disabled={isSubmitting || !newComment.trim()}
            size="sm"
            className="h-7 text-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                <Send className="w-3 h-3 mr-1" />
                Envoyer
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
