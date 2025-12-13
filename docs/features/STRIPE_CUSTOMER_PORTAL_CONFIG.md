# 🔧 Configuration du Stripe Customer Portal

## Problème : Impossible de changer de plan dans le Customer Portal

Par défaut, le Stripe Customer Portal ne permet **pas** de changer de plan d'abonnement. Vous devez configurer cette fonctionnalité manuellement.

---

## ✅ Solution : Configurer les options du Customer Portal

### **Étape 1 : Accéder aux paramètres**

1. Allez sur **[Stripe Dashboard](https://dashboard.stripe.com)**
2. Cliquez sur **Settings** (en haut à droite)
3. Dans le menu de gauche, cliquez sur **Billing** > **Customer portal**

---

### **Étape 2 : Activer les changements d'abonnement**

Dans la section **"Subscriptions"** :

1. ✅ Cochez **"Allow customers to switch plans"** (Permettre aux clients de changer de plan)

2. Configurez les options :

   - **Plans disponibles :** Sélectionnez tous vos plans (Veille Basic, Veille Premium)
   - **Proration :** Recommandé : **"Always invoice immediately"** (Facturer immédiatement)
   - **Switch plans :** Autoriser le passage à un plan supérieur ET inférieur

3. Cliquez sur **Save**

---

### **Étape 3 : Activer d'autres options (optionnel)**

**Gestion des moyens de paiement :**

- ✅ Permettre l'ajout/suppression de cartes bancaires
- ✅ Mettre à jour les informations de paiement

**Annulation d'abonnement :**

- ✅ Permettre l'annulation immédiate ou à la fin de la période
- ⚠️ Option : Demander un retour d'information (feedback)

**Factures :**

- ✅ Permettre le téléchargement des factures PDF
- ✅ Afficher l'historique complet

---

## 🎯 Configuration recommandée pour Publio

```yaml
Subscriptions:
  - Allow customers to switch plans: ✅ Activé
  - Available plans:
      - Veille Basic (CHF 5/mois)
      - Veille Premium (CHF 10/mois)
  - Proration: "Always invoice immediately"
  - Allow downgrades: ✅ Oui (Basic → Premium ET Premium → Basic)

Payment methods:
  - Allow customers to update payment methods: ✅ Activé
  - Allow customers to add payment methods: ✅ Activé
  - Allow customers to remove payment methods: ✅ Activé

Cancellations:
  - Allow customers to cancel subscriptions: ✅ Activé
  - Cancellation behavior: "Cancel at period end" (Recommandé)
  - Request feedback: ✅ Optionnel

Invoices:
  - Show invoice history: ✅ Activé
  - Allow downloading invoices: ✅ Activé
```

---

## 🔄 Alternative : Créer votre propre interface de changement de plan

Si vous préférez **plus de contrôle**, vous pouvez créer votre propre système de changement de plan au lieu d'utiliser le Customer Portal Stripe.

### **Avantages :**

- Interface personnalisée selon votre design
- Contrôle total sur le processus
- Meilleure expérience utilisateur

### **Implémentation :**

1. **Créer une API route de changement de plan :**

```typescript
// app/api/stripe/change-plan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { stripe } from "@/lib/stripe";

const PRICE_IDS = {
  VEILLE_BASIC: process.env.STRIPE_VEILLE_BASIC_PRICE_ID!,
  VEILLE_UNLIMITED: process.env.STRIPE_VEILLE_UNLIMITED_PRICE_ID!,
};

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { organizationId, newPlan } = await request.json();

    // Vérifier les permissions
    const membership = await prisma.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId,
        role: { in: ["OWNER", "ADMIN"] },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Récupérer l'organisation
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "No active subscription" },
        { status: 400 }
      );
    }

    // Récupérer l'abonnement Stripe
    const subscription = await stripe.subscriptions.retrieve(
      organization.stripeSubscriptionId
    );

    // Mettre à jour l'abonnement avec le nouveau prix
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.id,
      {
        items: [
          {
            id: subscription.items.data[0].id,
            price: PRICE_IDS[newPlan as keyof typeof PRICE_IDS],
          },
        ],
        proration_behavior: "always_invoice", // Facturer immédiatement
        metadata: {
          organizationId,
          planId: newPlan,
        },
      }
    );

    // Mettre à jour en base de données
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        stripeSubscriptionPlan: newPlan,
      },
    });

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error("Error changing plan:", error);
    return NextResponse.json(
      { error: "Failed to change plan" },
      { status: 500 }
    );
  }
}
```

2. **Créer un composant de changement de plan :**

```typescript
// components/billing/change-plan-dialog.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowUpCircle } from "lucide-react";

interface ChangePlanDialogProps {
  currentPlan: string;
  organizationId: string;
}

export function ChangePlanDialog({
  currentPlan,
  organizationId,
}: ChangePlanDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePlan = async (newPlan: string) => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/stripe/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, newPlan }),
      });

      if (!response.ok) {
        throw new Error("Failed to change plan");
      }

      alert("Plan modifié avec succès !");
      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
      alert("Erreur lors du changement de plan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-artisan-yellow text-matte-black hover:bg-artisan-yellow/90">
          <ArrowUpCircle className="w-4 h-4 mr-2" />
          Passer à Premium
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Passer à Veille Premium</DialogTitle>
          <DialogDescription>
            Passez au plan Premium pour bénéficier de communes illimitées et de
            fonctionnalités avancées.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-artisan-yellow/10 rounded-lg">
            <h4 className="font-semibold mb-2">Veille Premium - CHF 10/mois</h4>
            <ul className="text-sm space-y-1">
              <li>✅ Communes illimitées</li>
              <li>✅ Export CSV des publications</li>
              <li>✅ Accès aux archives (90 jours)</li>
              <li>✅ Support prioritaire</li>
            </ul>
          </div>

          <p className="text-xs text-muted-foreground">
            Le changement sera effectif immédiatement. Vous serez facturé au
            prorata pour la période restante.
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={() => handleChangePlan("VEILLE_UNLIMITED")}
            disabled={isLoading}
            className="bg-artisan-yellow text-matte-black hover:bg-artisan-yellow/90"
          >
            {isLoading ? "Changement..." : "Confirmer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 📌 Quelle option choisir ?

| Option                      | Avantages                                                                 | Inconvénients                                       |
| --------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------- |
| **Customer Portal Stripe**  | - Facile à configurer<br>- Géré par Stripe<br>- Interface professionnelle | - Moins de contrôle<br>- Design imposé par Stripe   |
| **Interface personnalisée** | - Design sur mesure<br>- Contrôle total<br>- UX optimisée                 | - Plus de code à maintenir<br>- Gestion des erreurs |

### **Recommandation :**

Pour **Publio**, je recommande de **configurer le Customer Portal Stripe** car :

- ✅ Plus rapide à mettre en place
- ✅ Moins de maintenance
- ✅ Sécurisé par défaut
- ✅ Gestion des paiements, factures, et moyens de paiement incluse

Vous pouvez toujours créer une interface personnalisée plus tard si nécessaire.

---

## 🎬 Action immédiate

1. **Allez sur [Stripe Customer Portal Settings](https://dashboard.stripe.com/settings/billing/portal)**
2. **Activez "Allow customers to switch plans"**
3. **Ajoutez vos 2 plans** (Basic et Premium)
4. **Testez** en cliquant sur "Gérer l'abonnement" dans `/dashboard/billing`

✅ Après cette configuration, vos utilisateurs pourront passer de Basic à Premium (et vice versa) directement depuis le portail Stripe !
