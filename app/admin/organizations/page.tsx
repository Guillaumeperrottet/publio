import { getOrganizations } from "@/features/admin/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, FileText, CreditCard, Calendar } from "lucide-react";
import Link from "next/link";

export default async function OrganizationsPage() {
  const { organizations } = await getOrganizations({ limit: 100 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-green-500/10">
          <Building2 className="w-8 h-8 text-green-500" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white">Organizations</h1>
          <p className="text-gray-400 mt-1">
            {organizations.length} total organizations
          </p>
        </div>
      </div>

      {/* Organizations List */}
      <div className="space-y-3">
        {organizations.map((org) => {
          const subscription = org.subscriptions?.[0];

          return (
            <Link key={org.id} href={`/admin/organizations/${org.id}`}>
              <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {org.name}
                        </h3>
                        {org.email && (
                          <p className="text-sm text-gray-400">{org.email}</p>
                        )}
                      </div>
                      {subscription && (
                        <Badge className="bg-purple-500 hover:bg-purple-600">
                          {subscription.plan}
                        </Badge>
                      )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-white font-medium">
                          {org.members.length}
                        </span>
                        <span className="text-gray-400">members</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-white font-medium">
                          {org._count.tenders}
                        </span>
                        <span className="text-gray-400">tenders</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span className="text-white font-medium">
                          {org._count.offers}
                        </span>
                        <span className="text-gray-400">offers</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400">
                          {new Date(org.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Members */}
                    {org.members.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">
                          Members
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {org.members.map((member) => (
                            <Badge
                              key={member.id}
                              variant="outline"
                              className="border-gray-600 text-gray-300"
                            >
                              {member.user.name || member.user.email} (
                              {member.role})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Subscription Details */}
                    {subscription && (
                      <div className="pt-4 border-t border-gray-700">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Status</p>
                            <Badge
                              variant={
                                subscription.status === "ACTIVE"
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                subscription.status === "ACTIVE"
                                  ? "bg-green-500 hover:bg-green-600"
                                  : ""
                              }
                            >
                              {subscription.status}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-gray-500">Plan</p>
                            <p className="text-white font-medium">
                              {subscription.plan}
                            </p>
                          </div>
                          {subscription.stripeCustomerId && (
                            <div>
                              <p className="text-gray-500">Stripe ID</p>
                              <p className="text-white font-mono text-xs">
                                {subscription.stripeCustomerId.slice(0, 20)}...
                              </p>
                            </div>
                          )}
                          {subscription.currentPeriodEnd && (
                            <div>
                              <p className="text-gray-500">Renews</p>
                              <p className="text-white">
                                {new Date(
                                  subscription.currentPeriodEnd
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}

        {organizations.length === 0 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-12 text-center">
              <p className="text-gray-400">No organizations found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
