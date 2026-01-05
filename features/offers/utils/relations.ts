/**
 * Utilitaires pour gérer les relations Prisma des offres
 * Évite la duplication de code dans les actions
 */

import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

// Types pour les données de formulaire (extraits de OfferFormData)
export interface OfferRelationsData {
  inclusions?: Array<{ position: number; description: string }>;
  exclusions?: Array<{ position: number; description: string }>;
  materials?: Array<{
    position: number;
    name: string;
    brand?: string;
    model?: string;
    range?: string;
    manufacturerWarranty?: string;
  }>;
  lineItems?: Array<{
    position: number;
    description: string;
    quantity?: number;
    unit?: string;
    priceHT: number;
    tvaRate: number;
    category?: string;
    sectionOrder?: number;
  }>;
  documents?: Array<{
    name: string;
    url: string;
    size: number;
    mimeType: string;
  }>;
}

/**
 * Supprimer toutes les relations d'une offre
 * Utilisé lors de la mise à jour ou suppression d'une offre
 */
export async function deleteOfferRelations(
  offerId: string,
  tx?: Prisma.TransactionClient
) {
  const client = tx || prisma;

  await Promise.all([
    client.offerInclusion.deleteMany({ where: { offerId } }),
    client.offerExclusion.deleteMany({ where: { offerId } }),
    client.offerMaterial.deleteMany({ where: { offerId } }),
    client.offerLineItem.deleteMany({ where: { offerId } }),
    client.offerDocument.deleteMany({ where: { offerId } }),
  ]);
}

/**
 * Créer les relations d'une offre
 * Utilisé lors de la création ou mise à jour d'une offre
 */
export async function createOfferRelations(
  offerId: string,
  data: OfferRelationsData,
  tx?: Prisma.TransactionClient
) {
  const client = tx || prisma;

  // Créer les inclusions
  if (data.inclusions && data.inclusions.length > 0) {
    await client.offerInclusion.createMany({
      data: data.inclusions.map((inc) => ({
        offerId,
        position: inc.position,
        description: inc.description,
      })),
    });
  }

  // Créer les exclusions
  if (data.exclusions && data.exclusions.length > 0) {
    await client.offerExclusion.createMany({
      data: data.exclusions.map((exc) => ({
        offerId,
        position: exc.position,
        description: exc.description,
      })),
    });
  }

  // Créer les matériaux
  if (data.materials && data.materials.length > 0) {
    await client.offerMaterial.createMany({
      data: data.materials.map((mat) => ({
        offerId,
        position: mat.position,
        name: mat.name,
        brand: mat.brand,
        model: mat.model,
        range: mat.range,
        manufacturerWarranty: mat.manufacturerWarranty,
      })),
    });
  }

  // Créer les lignes de prix
  if (data.lineItems && data.lineItems.length > 0) {
    await client.offerLineItem.createMany({
      data: data.lineItems.map((item) => ({
        offerId,
        position: item.position,
        description: item.description,
        quantity: item.quantity ? parseFloat(String(item.quantity)) : null,
        unit: item.unit,
        priceHT: item.priceHT,
        tvaRate: item.tvaRate,
        category: item.category,
        sectionOrder: item.sectionOrder,
      })),
    });
  }

  // Créer les documents
  if (data.documents && data.documents.length > 0) {
    await client.offerDocument.createMany({
      data: data.documents.map((doc) => ({
        offerId,
        name: doc.name,
        url: doc.url,
        size: doc.size,
        mimeType: doc.mimeType,
      })),
    });
  }
}

/**
 * Mettre à jour les relations d'une offre
 * Supprime les anciennes et crée les nouvelles
 */
export async function updateOfferRelations(
  offerId: string,
  data: OfferRelationsData,
  tx?: Prisma.TransactionClient
) {
  const client = tx || prisma;

  // Supprimer les anciennes relations
  await deleteOfferRelations(offerId, client);

  // Créer les nouvelles relations
  await createOfferRelations(offerId, data, client);
}

/**
 * Supprimer complètement une offre et toutes ses relations (y compris commentaires)
 * Utilisé lors de la suppression définitive d'une offre
 */
export async function deleteOfferCompletely(offerId: string) {
  await prisma.$transaction([
    // Supprimer les commentaires
    prisma.offerComment.deleteMany({ where: { offerId } }),
    // Supprimer les documents
    prisma.offerDocument.deleteMany({ where: { offerId } }),
    // Supprimer les line items
    prisma.offerLineItem.deleteMany({ where: { offerId } }),
    // Supprimer les inclusions
    prisma.offerInclusion.deleteMany({ where: { offerId } }),
    // Supprimer les exclusions
    prisma.offerExclusion.deleteMany({ where: { offerId } }),
    // Supprimer les matériaux
    prisma.offerMaterial.deleteMany({ where: { offerId } }),
    // Supprimer l'offre
    prisma.offer.delete({ where: { id: offerId } }),
  ]);
}
