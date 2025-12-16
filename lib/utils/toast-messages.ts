import { toast } from "sonner";

/**
 * Messages de toast standardisés et explicites
 * Utilise Sonner avec des messages clairs
 */

// ============================================
// SUCCÈS
// ============================================

export const toastSuccess = {
  // Tenders
  tenderCreated: () =>
    toast.success("Appel d'offres créé", {
      description:
        "Votre appel d'offres a été créé et sera publié après paiement.",
    }),

  tenderPublished: () =>
    toast.success("Appel d'offres publié !", {
      description: "Votre appel d'offres est maintenant visible par tous.",
    }),

  tenderClosed: () =>
    toast.success("Appel d'offres clôturé", {
      description:
        "L'appel d'offres est maintenant fermé aux nouvelles offres.",
    }),

  tenderAwarded: () =>
    toast.success("Marché attribué !", {
      description: "L'offre gagnante a été notifiée par email.",
    }),

  // Offres
  offerSubmitted: () =>
    toast.success("Offre soumise avec succès", {
      description: "L'organisation émettrice a été notifiée.",
    }),

  offerWithdrawn: () =>
    toast.success("Offre retirée", {
      description: "Votre offre a été retirée avec succès.",
    }),

  // Sauvegardes
  searchSaved: () =>
    toast.success("Recherche sauvegardée", {
      description:
        "Vous recevrez des alertes pour les nouveaux projets correspondants.",
    }),

  tenderSaved: () =>
    toast.success("Projet sauvegardé", {
      description: "Retrouvez-le dans vos projets sauvegardés.",
    }),

  // Organisation
  memberInvited: () =>
    toast.success("Invitation envoyée", {
      description:
        "Le collaborateur recevra un email avec un lien d'invitation.",
    }),

  memberRemoved: () =>
    toast.success("Membre retiré", {
      description: "Le collaborateur n'a plus accès à l'organisation.",
    }),

  // Veille
  veilleActivated: () =>
    toast.success("Veille activée !", {
      description: "Vous recevrez des alertes pour les nouvelles publications.",
    }),

  // Générique
  saved: () =>
    toast.success("Enregistré", {
      description: "Vos modifications ont été enregistrées.",
    }),

  copied: () =>
    toast.success("Copié !", {
      description: "Le texte a été copié dans le presse-papier.",
    }),

  deleted: () =>
    toast.success("Supprimé", {
      description: "L'élément a été supprimé avec succès.",
    }),
};

// ============================================
// ERREURS
// ============================================

export const toastError = {
  // Authentification
  notAuthenticated: () =>
    toast.error("Non authentifié", {
      description: "Vous devez être connecté pour effectuer cette action.",
      action: {
        label: "Se connecter",
        onClick: () => (window.location.href = "/auth/signin"),
      },
    }),

  unauthorized: () =>
    toast.error("Accès refusé", {
      description: "Vous n'avez pas les permissions nécessaires.",
    }),

  // Validation
  invalidData: (field?: string) =>
    toast.error("Données invalides", {
      description: field
        ? `Le champ "${field}" est invalide ou manquant.`
        : "Veuillez vérifier les informations saisies.",
    }),

  requiredField: (field: string) =>
    toast.error("Champ requis", {
      description: `Le champ "${field}" est obligatoire.`,
    }),

  // Réseau / Serveur
  networkError: () =>
    toast.error("Erreur de connexion", {
      description:
        "Impossible de se connecter au serveur. Vérifiez votre connexion internet.",
      action: {
        label: "Réessayer",
        onClick: () => window.location.reload(),
      },
    }),

  serverError: () =>
    toast.error("Erreur serveur", {
      description:
        "Une erreur est survenue. Veuillez réessayer dans quelques instants.",
    }),

  // Paiement
  paymentFailed: () =>
    toast.error("Paiement échoué", {
      description:
        "Le paiement n'a pas pu être traité. Vérifiez vos informations bancaires.",
    }),

  // Limite atteinte
  limitReached: (limit: string) =>
    toast.error("Limite atteinte", {
      description: `Vous avez atteint la limite de ${limit}.`,
      action: {
        label: "Voir les forfaits",
        onClick: () => (window.location.href = "/dashboard/billing"),
      },
    }),

  // Fichiers
  fileTooBig: (maxSize: string) =>
    toast.error("Fichier trop volumineux", {
      description: `La taille maximale autorisée est de ${maxSize}.`,
    }),

  fileTypeInvalid: (allowedTypes: string) =>
    toast.error("Type de fichier non supporté", {
      description: `Types autorisés : ${allowedTypes}`,
    }),

  // Deadline
  deadlinePassed: () =>
    toast.error("Deadline dépassée", {
      description: "Il n'est plus possible de soumettre une offre.",
    }),

  // Générique
  generic: (message?: string) =>
    toast.error("Une erreur est survenue", {
      description:
        message ||
        "Veuillez réessayer. Si le problème persiste, contactez le support.",
    }),
};

// ============================================
// AVERTISSEMENTS
// ============================================

export const toastWarning = {
  deadlineSoon: (hours: number) =>
    toast.warning("Deadline proche", {
      description: `L'appel d'offres se termine dans ${hours}h.`,
    }),

  unsavedChanges: () =>
    toast.warning("Modifications non sauvegardées", {
      description: "N'oubliez pas d'enregistrer vos changements.",
    }),

  draftNotPublished: () =>
    toast.warning("Brouillon non publié", {
      description: "Cet appel d'offres n'est pas encore visible publiquement.",
    }),
};

// ============================================
// INFORMATIONS
// ============================================

export const toastInfo = {
  loading: (message: string = "Chargement en cours...") =>
    toast.loading(message),

  identityRevealed: () =>
    toast.info("Identité révélée", {
      description:
        "L'identité de l'organisation émettrice est maintenant visible.",
    }),

  emailSent: (email: string) =>
    toast.info("Email envoyé", {
      description: `Un email a été envoyé à ${email}.`,
    }),
};

// ============================================
// HELPERS
// ============================================

/**
 * Gestion automatique des erreurs avec messages explicites
 */
export function handleError(error: unknown, context?: string) {
  console.error(`Error in ${context || "unknown"}:`, error);

  if (error instanceof Error) {
    // Erreurs spécifiques connues
    if (
      error.message.includes("Unauthorized") ||
      error.message.includes("unauthorized")
    ) {
      toastError.unauthorized();
    } else if (
      error.message.includes("authenticated") ||
      error.message.includes("Non authentifié")
    ) {
      toastError.notAuthenticated();
    } else if (
      error.message.includes("network") ||
      error.message.includes("fetch")
    ) {
      toastError.networkError();
    } else {
      // Erreur générique avec le message
      toastError.generic(error.message);
    }
  } else {
    toastError.serverError();
  }
}

/**
 * Toast promise avec messages standardisés
 */
export function toastPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error?: string;
  }
) {
  return toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error || "Une erreur est survenue",
  });
}
