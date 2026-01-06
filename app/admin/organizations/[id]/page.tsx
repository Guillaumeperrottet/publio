import { getOrganizationDetails } from "@/features/admin/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  FileText,
  CreditCard,
  Calendar,
  ArrowLeft,
  Mail,
  Globe,
  Phone,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { ToggleOrganizationSuspensionButton } from "@/components/admin/toggle-org-suspension-button";
import { AddCreditsButton } from "@/components/admin/add-credits-button";

interface OrganizationDetailPageProps {
  params: {
    id: string;
  };
}

export default async function OrganizationDetailPage({
  params,
}: OrganizationDetailPageProps) {
  const { id } = await params;
  const org = await getOrganizationDetails(id);
  const currentSubscription = org.subscriptions[0];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/admin/organizations">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Organizations
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-lg bg-green-500/10">
            <Building2 className="w-10 h-10 text-green-500" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-gray-900">{org.name}</h1>
              <Badge
                variant={org.isActive ? "default" : "destructive"}
                className={
                  org.isActive
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }
              >
                {org.isActive ? "ACTIVE" : "SUSPENDED"}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {org.email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {org.email}
                </div>
              )}
              {org.website && (
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  {org.website}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <AddCreditsButton
            organizationId={org.id}
            organizationName={org.name}
          />
          <ToggleOrganizationSuspensionButton
            organizationId={org.id}
            isActive={org.isActive}
          />
        </div>
      </div>

      {/* Contact Info */}
      {(org.phone || org.address || org.city) && (
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900 text-sm">
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {org.phone && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-4 h-4 text-gray-500" />
                  {org.phone}
                </div>
              )}
              {(org.address || org.city) && (
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  {[org.address, org.city, org.canton]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              )}
              {org.siret && (
                <div className="text-gray-700">
                  <span className="text-gray-600">SIRET:</span> {org.siret}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Members</p>
                <p className="text-2xl font-bold text-gray-900">
                  {org.members.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Tenders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {org.tenders.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Offers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {org.offers.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(org.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Subscription */}
      {currentSubscription && (
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Plan</p>
                <Badge className="bg-purple-500 hover:bg-purple-600 text-white">
                  {currentSubscription.plan}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <Badge
                  variant={
                    currentSubscription.status === "ACTIVE"
                      ? "default"
                      : "secondary"
                  }
                  className={
                    currentSubscription.status === "ACTIVE"
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }
                >
                  {currentSubscription.status}
                </Badge>
              </div>
              {currentSubscription.stripeCustomerId && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Stripe Customer</p>
                  <p className="text-xs font-mono text-gray-900">
                    {currentSubscription.stripeCustomerId.slice(0, 20)}...
                  </p>
                </div>
              )}
              {currentSubscription.currentPeriodEnd && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Renews</p>
                  <p className="text-sm text-gray-900">
                    {new Date(
                      currentSubscription.currentPeriodEnd
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Members ({org.members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {org.members.map((member) => (
              <Link
                key={member.id}
                href={`/admin/users/${member.user.id}`}
                className="block"
              >
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="text-gray-900 font-medium">
                      {member.user.name || "No name"}
                    </p>
                    <p className="text-sm text-gray-600">{member.user.email}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-gray-300 text-gray-700 bg-white"
                  >
                    {member.role}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Tenders */}
      {org.tenders.length > 0 && (
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Tenders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {org.tenders.map((tender) => (
                <div
                  key={tender.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{tender.title}</p>
                    <p className="text-sm text-gray-600">
                      {tender._count.offers} offers •{" "}
                      {new Date(tender.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-gray-300 text-gray-700 bg-white"
                  >
                    {tender.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Invoices */}
      {org.invoices.length > 0 && (
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Billing History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {org.invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">
                      {invoice.description}
                    </p>
                    <p className="text-sm text-gray-600">
                      {invoice.number} •{" "}
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900 font-semibold">
                      CHF {invoice.amount.toFixed(2)}
                    </p>
                    <Badge
                      variant={
                        invoice.status === "PAID" ? "default" : "secondary"
                      }
                      className={
                        invoice.status === "PAID"
                          ? "bg-green-500 hover:bg-green-600 text-white text-xs"
                          : "bg-gray-200 text-gray-700 text-xs"
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
