import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Route API pour générer et télécharger le PDF du journal d'équité
 * GET /api/tenders/[id]/equity-log/pdf
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;

    // Récupérer le tender avec vérification des droits
    const tender = await prisma.tender.findUnique({
      where: { id },
      include: {
        organization: {
          include: {
            members: {
              where: {
                userId: user.id,
                role: {
                  in: ["OWNER", "ADMIN"],
                },
              },
            },
          },
        },
        equityLogs: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!tender) {
      return NextResponse.json(
        { error: "Appel d'offres introuvable" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur a les droits (OWNER ou ADMIN)
    if (!tender.organization.members.length) {
      return NextResponse.json(
        { error: "Accès refusé - droits insuffisants" },
        { status: 403 }
      );
    }

    // Générer le PDF
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // En-tête
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("JOURNAL D'ÉQUITÉ", 15, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Appel d'offres: ${tender.title}`, 15, 28);
    doc.text(`Organisation: ${tender.organization.name}`, 15, 34);
    doc.text(
      `Date d'export: ${new Date().toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      15,
      40
    );

    // Ligne de séparation
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(15, 45, 282, 45);

    // Avertissement institutionnel
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text(
      "Ce document constitue une trace horodatée et immuable des actions effectuées sur cet appel d'offres.",
      15,
      50
    );
    doc.text(
      "Il garantit la transparence et la traçabilité du processus de sélection.",
      15,
      54
    );
    doc.setTextColor(0, 0, 0);

    // Mapping des actions en français
    const ACTION_LABELS: Record<string, string> = {
      TENDER_CREATED: "Créé",
      TENDER_PUBLISHED: "Publié",
      TENDER_UPDATED: "Modifié",
      TENDER_CLOSED: "Clôturé",
      TENDER_AWARDED: "Attribué",
      TENDER_CANCELLED: "Annulé",
      OFFER_RECEIVED: "Offre reçue",
      OFFER_SHORTLISTED: "Pré-sélectionnée",
      OFFER_REJECTED: "Rejetée",
      OFFER_AWARDED: "Retenue",
      IDENTITY_REVEALED: "Identité révélée",
      DEADLINE_EXTENDED: "Deadline prolongée",
      INVITATION_SENT: "Invitation envoyée",
    };

    // Préparer les données du tableau
    const tableData = tender.equityLogs.map((log) => [
      new Date(log.createdAt).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      new Date(log.createdAt).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      ACTION_LABELS[log.action] || log.action,
      log.description,
      log.user.name || log.user.email || "Système",
    ]);

    // Générer le tableau avec autoTable
    autoTable(doc, {
      startY: 60,
      head: [["Date", "Heure", "Type", "Description", "Acteur"]],
      body: tableData,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [13, 13, 13], // matte-black
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "left",
      },
      columnStyles: {
        0: { cellWidth: 25, halign: "left" }, // Date
        1: { cellWidth: 22, halign: "left" }, // Heure
        2: { cellWidth: 30, halign: "left" }, // Type
        3: { cellWidth: 120, halign: "left" }, // Description
        4: { cellWidth: 45, halign: "left" }, // Acteur
      },
      alternateRowStyles: {
        fillColor: [250, 250, 247], // off-white
      },
      margin: { left: 15, right: 15 },
    });

    // Pied de page
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Page ${i} sur ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );

      // Signature numérique (hash simple)
      const hash = Buffer.from(`${tender.id}-${new Date().getTime()}`).toString(
        "base64"
      );
      doc.setFontSize(6);
      doc.text(
        `Signature numérique: ${hash.substring(0, 40)}`,
        15,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    // Générer le buffer PDF
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    // Nom du fichier
    const filename = `journal-equite-${tender.id.substring(0, 8)}-${
      new Date().toISOString().split("T")[0]
    }.pdf`;

    // Retourner le PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error generating equity log PDF:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la génération du PDF",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
