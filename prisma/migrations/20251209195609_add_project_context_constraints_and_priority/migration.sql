-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('COMMUNE', 'ENTREPRISE', 'PRIVE');

-- CreateEnum
CREATE TYPE "OrganizationRole" AS ENUM ('OWNER', 'ADMIN', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "TenderStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'AWARDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TenderVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "TenderMode" AS ENUM ('CLASSIC', 'ANONYMOUS');

-- CreateEnum
CREATE TYPE "MarketType" AS ENUM ('CONSTRUCTION', 'ENGINEERING', 'ARCHITECTURE', 'IT_SERVICES', 'CONSULTING', 'SUPPLIES', 'MAINTENANCE', 'SERVICES', 'OTHER');

-- CreateEnum
CREATE TYPE "TenderProcedure" AS ENUM ('OPEN', 'SELECTIVE', 'PRIVATE');

-- CreateEnum
CREATE TYPE "SelectionPriority" AS ENUM ('LOWEST_PRICE', 'QUALITY_PRICE', 'FASTEST_DELIVERY', 'BEST_REFERENCES', 'ECO_FRIENDLY');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'WITHDRAWN', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'VEILLE_BASIC', 'VEILLE_UNLIMITED');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "accountId" TEXT,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'credential',
    "provider" TEXT NOT NULL DEFAULT 'credential',
    "providerId" TEXT,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT,
    "token" TEXT,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OrganizationType" NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "website" TEXT,
    "address" TEXT,
    "city" TEXT,
    "canton" TEXT,
    "country" TEXT NOT NULL DEFAULT 'CH',
    "phone" TEXT,
    "siret" TEXT,
    "taxId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_members" (
    "id" TEXT NOT NULL,
    "role" "OrganizationRole" NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenders" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "description" TEXT NOT NULL,
    "context" TEXT,
    "currentSituation" TEXT,
    "marketType" "MarketType" NOT NULL,
    "cfcCode" TEXT,
    "budget" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'CHF',
    "showBudget" BOOLEAN NOT NULL DEFAULT true,
    "surfaceM2" DOUBLE PRECISION,
    "volumeM3" DOUBLE PRECISION,
    "unitsQuantity" TEXT,
    "hasAccessConstraints" BOOLEAN NOT NULL DEFAULT false,
    "siteOccupied" BOOLEAN NOT NULL DEFAULT false,
    "limitedHours" BOOLEAN NOT NULL DEFAULT false,
    "siteVisitRequested" BOOLEAN NOT NULL DEFAULT false,
    "contractDuration" INTEGER,
    "contractStartDate" TIMESTAMP(3),
    "isRenewable" BOOLEAN NOT NULL DEFAULT false,
    "status" "TenderStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "TenderVisibility" NOT NULL DEFAULT 'PUBLIC',
    "mode" "TenderMode" NOT NULL DEFAULT 'ANONYMOUS',
    "procedure" "TenderProcedure" NOT NULL DEFAULT 'OPEN',
    "isSimpleMode" BOOLEAN NOT NULL DEFAULT true,
    "selectionPriority" "SelectionPriority" NOT NULL DEFAULT 'QUALITY_PRICE',
    "publishedAt" TIMESTAMP(3),
    "deadline" TIMESTAMP(3) NOT NULL,
    "questionDeadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "address" TEXT,
    "city" TEXT,
    "canton" TEXT,
    "country" TEXT NOT NULL DEFAULT 'CH',
    "hasLots" BOOLEAN NOT NULL DEFAULT false,
    "allowPartialOffers" BOOLEAN NOT NULL DEFAULT true,
    "participationConditions" TEXT,
    "requiredDocuments" TEXT,
    "requiresReferences" BOOLEAN NOT NULL DEFAULT false,
    "requiresInsurance" BOOLEAN NOT NULL DEFAULT false,
    "minExperience" INTEGER,
    "contractualTerms" TEXT,
    "organizationId" TEXT NOT NULL,
    "identityRevealed" BOOLEAN NOT NULL DEFAULT false,
    "revealedAt" TIMESTAMP(3),

    CONSTRAINT "tenders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tender_documents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenderId" TEXT NOT NULL,

    CONSTRAINT "tender_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tender_invitations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenderId" TEXT NOT NULL,

    CONSTRAINT "tender_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tender_lots" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budget" DOUBLE PRECISION,
    "tenderId" TEXT NOT NULL,

    CONSTRAINT "tender_lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tender_criteria" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "weight" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "tenderId" TEXT NOT NULL,

    CONSTRAINT "tender_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offers" (
    "id" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CHF',
    "description" TEXT NOT NULL,
    "methodology" TEXT,
    "timeline" TEXT,
    "references" TEXT,
    "status" "OfferStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "viewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "stripePaymentId" TEXT,
    "paidAt" TIMESTAMP(3),
    "tenderId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "anonymousId" TEXT,
    "isAnonymized" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_documents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "offerId" TEXT NOT NULL,

    CONSTRAINT "offer_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "stripeSubscriptionId" TEXT,
    "stripeCustomerId" TEXT,
    "stripePriceId" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CHF',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "description" TEXT NOT NULL,
    "stripeInvoiceId" TEXT,
    "stripePaymentIntentId" TEXT,
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "veille_subscriptions" (
    "id" TEXT NOT NULL,
    "communes" TEXT[],
    "cantons" TEXT[],
    "keywords" TEXT[],
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "appNotifications" BOOLEAN NOT NULL DEFAULT true,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "veille_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "veille_publications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "commune" TEXT NOT NULL,
    "canton" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "veille_publications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_searches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "criteria" JSONB NOT NULL,
    "alertsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastAlertSent" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitation_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "OrganizationRole" NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "organizationId" TEXT NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitation_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "organization_members_userId_organizationId_key" ON "organization_members"("userId", "organizationId");

-- CreateIndex
CREATE INDEX "tenders_status_visibility_deadline_idx" ON "tenders"("status", "visibility", "deadline");

-- CreateIndex
CREATE INDEX "tenders_organizationId_idx" ON "tenders"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "tender_invitations_tenderId_email_key" ON "tender_invitations"("tenderId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "tender_lots_tenderId_number_key" ON "tender_lots"("tenderId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "offers_anonymousId_key" ON "offers"("anonymousId");

-- CreateIndex
CREATE INDEX "offers_tenderId_idx" ON "offers"("tenderId");

-- CreateIndex
CREATE INDEX "offers_organizationId_idx" ON "offers"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_number_key" ON "invoices"("number");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_stripeInvoiceId_key" ON "invoices"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "veille_publications_commune_canton_idx" ON "veille_publications"("commune", "canton");

-- CreateIndex
CREATE INDEX "veille_publications_publishedAt_idx" ON "veille_publications"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "invitation_tokens_token_key" ON "invitation_tokens"("token");

-- CreateIndex
CREATE INDEX "invitation_tokens_token_idx" ON "invitation_tokens"("token");

-- CreateIndex
CREATE INDEX "invitation_tokens_email_idx" ON "invitation_tokens"("email");

-- CreateIndex
CREATE INDEX "invitation_tokens_organizationId_idx" ON "invitation_tokens"("organizationId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenders" ADD CONSTRAINT "tenders_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tender_documents" ADD CONSTRAINT "tender_documents_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "tenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tender_invitations" ADD CONSTRAINT "tender_invitations_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "tenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tender_lots" ADD CONSTRAINT "tender_lots_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "tenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tender_criteria" ADD CONSTRAINT "tender_criteria_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "tenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "tenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_documents" ADD CONSTRAINT "offer_documents_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "veille_subscriptions" ADD CONSTRAINT "veille_subscriptions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation_tokens" ADD CONSTRAINT "invitation_tokens_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation_tokens" ADD CONSTRAINT "invitation_tokens_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
