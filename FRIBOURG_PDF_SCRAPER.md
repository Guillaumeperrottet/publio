# 📄 Scraper Feuille Officielle Fribourg - Documentation

## 🎯 Vue d'ensemble

Le scraper de la **Feuille Officielle du Canton de Fribourg** (https://fo.fr.ch/) extrait automatiquement les publications légales à partir des PDFs hebdomadaires.

### **Avantages par rapport au scraping HTML**

✅ **Source officielle** - Document juridique de référence  
✅ **Format structuré** - Plus stable qu'un site web  
✅ **Données complètes** - Toutes les informations légales  
✅ **Historique accessible** - Archives disponibles  
✅ **Maintenance réduite** - Moins sensible aux changements du site

---

## 📅 Fréquence de Publication

La Feuille Officielle de Fribourg est publiée **chaque semaine** (généralement le vendredi).

---

## 🔍 Types de Publications Extraites

### **1. Mises à l'enquête**

- Nouveaux projets de construction
- Transformations de bâtiments
- Démolitions
- Changements d'affectation

### **2. Permis de construire**

- Autorisations délivrées
- Permis définitifs

### **3. Avis officiels**

- Publications administratives
- Informations communales

### **4. Oppositions**

- Délais d'opposition
- Procédures en cours

---

## 🛠️ Architecture Technique

### **Fichier principal**

`features/veille/scrapers/fribourg-official.ts`

### **Dépendances**

```json
{
  "pdf-parse": "^1.1.1" // Extraction de texte depuis PDF
}
```

### **Classes et méthodes**

```typescript
class FribourgOfficialGazetteScraper {
  // Scraper les dernières publications
  async scrape(): Promise<ScrapedPublication[]>;

  // Extraire les liens PDF depuis la page d'accueil
  private extractPDFLinks(html: string): string[];

  // Télécharger et parser un PDF
  private processPDF(pdfUrl: string): Promise<ScrapedPublication[]>;

  // Parser le texte extrait
  private parsePublications(
    text: string,
    sourceUrl: string
  ): ScrapedPublication[];

  // Identifier les sections (mises à l'enquête, permis, etc.)
  private identifySections(
    text: string
  ): Array<{ type: string; content: string }>;

  // Extraire les publications d'une section
  private extractPublicationsFromSection(
    section,
    sourceUrl
  ): ScrapedPublication[];

  // Extraire les détails (parcelle, adresse, etc.)
  private extractDetails(text: string): Record<string, string>;
}
```

---

## 📊 Données Extraites

### **Champs principaux**

- **Commune** - Localisation du projet
- **Type** - MISE_A_LENQUETE, PERMIS_CONSTRUIRE, etc.
- **Titre** - Résumé descriptif
- **Description** - Détails du projet
- **URL** - Lien vers le PDF source

### **Métadonnées**

- **source** - "Feuille Officielle Fribourg"
- **plateforme** - "fo.fr.ch"
- **parcelle** - Numéro de parcelle cadastrale
- **adresse** - Adresse du projet
- **typeProjet** - Construction, rénovation, etc.
- **proprietaire** - Nom du propriétaire (optionnel)

---

## 🧪 Tests

### **Commande de test**

```bash
npx tsx scripts/test-fribourg-scraper.ts
```

### **Sortie attendue**

```
🧪 TEST DU SCRAPER FEUILLE OFFICIELLE FRIBOURG
============================================================
Démarrage: 2025-12-11T10:30:00.000Z

[Fribourg FO] Début du scraping de la Feuille Officielle...
[Fribourg FO] 2 PDF(s) trouvé(s)
[Fribourg FO] Traitement du PDF: https://fo.fr.ch/...
[Fribourg FO] 45 page(s) extraites
[Fribourg FO] 23 publication(s) extraite(s)

============================================================
📊 RÉSULTATS
============================================================
Total: 23 publication(s) trouvée(s)

📋 Aperçu des publications:

1. Bulle - Mise à l'enquête: Construction d'une villa familiale
   Commune: Bulle
   Type: MISE_A_LENQUETE
   Parcelle: 1234
   Adresse: Chemin des Roses 12
   ...
```

---

## 🔄 Intégration

### **Dans le MasterScraper**

Le scraper est automatiquement appelé dans `features/veille/scraper.ts` :

```typescript
async scrapeAll(): Promise<ScrapedPublication[]> {
  // ... autres scrapers ...

  // Scraper Feuille Officielle Fribourg (PDF)
  const fribourgOfficialScraper = new FribourgOfficialGazetteScraper();
  const fribourgPublications = await fribourgOfficialScraper.scrape();
  allPublications.push(...fribourgPublications);
}
```

### **Scraping automatique**

Le scraper est exécuté automatiquement 6x par jour par le cron job :

- Via `/api/cron/scrape-veille`
- Schedule : `0 4,7,10,13,16,19 * * *` (UTC)

---

## 🎨 Patterns de Parsing

### **Identification des sections**

```typescript
const sectionPatterns = [
  {
    name: "MISE_A_LENQUETE",
    patterns: [
      /MISES?\s+À\s+L['']ENQUÊTE/gi,
      /MISE\s+À\s+L['']ENQUÊTE\s+PUBLIQUE/gi,
    ],
  },
  // ...
];
```

### **Extraction des communes**

```regex
/(?:COMMUNE|VILLE)\s+(?:DE\s+)?([A-ZÉÈÊÀÙÇ][A-ZÉÈÊÀÙÇ\s\-']+)/gi
```

### **Extraction des parcelles**

```regex
/parcelle\s+n?[°o]?\s*(\d+)/i
```

### **Extraction des adresses**

```regex
/(?:adresse|lieu|situé|sis)\s*:?\s*([^,\n]{10,80})/i
```

---

## 📈 Performance

### **Métriques estimées**

- **Temps de traitement** : ~5-10 secondes pour 2 PDFs
- **Publications par semaine** : 20-40 (variable)
- **Taux de réussite** : >95% avec format standard
- **Taille des PDFs** : 2-5 MB par numéro

### **Optimisations**

- Traitement des 2 derniers numéros seulement (2 semaines)
- Limite de 5000 caractères par section pour éviter les timeouts
- Déduplication automatique

---

## 🐛 Gestion des Erreurs

### **Erreurs possibles**

1. **Site inaccessible**

   - Retry automatique dans le cron job
   - Log d'erreur sans bloquer les autres scrapers

2. **Format PDF modifié**

   - Les patterns regex peuvent ne plus matcher
   - Nécessite ajustement manuel des patterns

3. **PDF corrompu**

   - Skip du PDF et passage au suivant
   - Log d'erreur détaillé

4. **Aucun PDF trouvé**
   - Retourne tableau vide
   - Log de warning

### **Logs de debugging**

```typescript
console.log("[Fribourg FO] Début du scraping...");
console.log("[Fribourg FO] X PDF(s) trouvé(s)");
console.log("[Fribourg FO] X page(s) extraites");
console.log("[Fribourg FO] X publication(s) extraite(s)");
```

---

## 🚀 Améliorations Futures

### **Court terme**

- [ ] Extraction de la date de publication depuis le PDF
- [ ] Support des pièces jointes (plans, documents)
- [ ] Géolocalisation automatique des adresses

### **Moyen terme**

- [ ] Cache des PDFs déjà traités (éviter re-téléchargement)
- [ ] Historique complet (scraper archives)
- [ ] OCR pour PDFs scannés (si nécessaire)

### **Long terme**

- [ ] IA pour extraction intelligente (GPT-4 Vision)
- [ ] Alertes personnalisées par type de projet
- [ ] Analyse des tendances de construction

---

## 📚 Ressources

- **Site officiel** : https://fo.fr.ch/
- **Package pdf-parse** : https://www.npmjs.com/package/pdf-parse
- **Archives FO** : Disponibles sur le site officiel

---

## 🎯 Résumé

Le scraper Feuille Officielle Fribourg extrait automatiquement **20-40 publications légales par semaine** à partir des PDFs officiels, incluant :

✅ Mises à l'enquête  
✅ Permis de construire  
✅ Avis officiels  
✅ Oppositions

**Avantages clés :**

- Source officielle 100% fiable
- Données structurées et complètes
- Maintenance minimale
- Intégration transparente avec SIMAP

**Cette combinaison SIMAP + Feuille Officielle Fribourg offre une couverture quasi-totale des marchés publics et projets de construction dans le canton !** 🎉
