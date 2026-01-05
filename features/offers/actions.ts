/**
 * Point d'entrée principal pour toutes les actions liées aux offres
 * Ce fichier réexporte toutes les fonctions des différents modules
 */

// Actions de lecture/query
export {
  getTenderOffers,
  getOfferDetail,
  getOrganizationOffers,
  hasUserSubmittedOffer,
  getUnreadOffersCount,
  markOfferAsViewed,
  getTendersWithUnreadOffers,
} from "./actions/queries";

// Actions de cycle de vie
export {
  acceptOffer,
  rejectOffer,
  shortlistOffer,
  unshortlistOffer,
} from "./actions/lifecycle";

// Actions de commentaires
export {
  addOfferComment,
  getOfferComments,
  deleteOfferComment,
  updateOfferInternalNote,
  getOfferNoteHistory,
} from "./actions/comments";

// Actions principales de gestion des offres
export {
  saveDraftOffer,
  submitOffer,
  withdrawOffer,
  deleteDraftOffer,
  createOffer,
  createOfferLegacy,
  confirmOfferPayment,
  revealOfferIdentities,
} from "./actions-core";
