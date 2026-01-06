import { getRevenueStats } from "@/features/admin/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Users,
  AlertCircle,
} from "lucide-react";
import { RevenueChart } from "@/components/admin/revenue-chart";

export default async function RevenuePage() {
  const stats = await getRevenueStats();

  const statCards = [
    {
      title: "MRR",
      value: `CHF ${stats.mrr.toLocaleString()}`,
      description: "Monthly Recurring Revenue",
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "ARR",
      value: `CHF ${stats.arr.toLocaleString()}`,
      description: "Annual Recurring Revenue",
      icon: TrendingUp,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total Revenue",
      value: `CHF ${stats.totalRevenue.toLocaleString()}`,
      description: "All-time revenue",
      icon: CreditCard,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Active Subscriptions",
      value: stats.activeSubscriptions,
      description: `${stats.paidInvoices}/${stats.totalInvoices} invoices paid`,
      icon: Users,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Churn Rate",
      value: `${stats.churnRate}%`,
      description: "Subscription cancellation rate",
      icon: AlertCircle,
      color: stats.churnRate > 5 ? "text-red-500" : "text-yellow-500",
      bgColor: stats.churnRate > 5 ? "bg-red-500/10" : "bg-yellow-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-green-500/10">
          <DollarSign className="w-8 h-8 text-green-500" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white">Revenue Analytics</h1>
          <p className="text-gray-400 mt-1">
            Financial metrics and subscription insights
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">
            Revenue Trend (Last 12 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={stats.monthlyRevenue} />
        </CardContent>
      </Card>

      {/* Subscriptions by Plan */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Subscriptions by Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(stats.subscriptionsByPlan).map(([plan, count]) => (
              <div
                key={plan}
                className="p-4 rounded-lg bg-gray-900 border border-gray-700 text-center"
              >
                <p className="text-3xl font-bold text-white mb-1">{count}</p>
                <p className="text-sm text-gray-400">{plan}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-900 hover:bg-gray-750 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-white font-medium">
                    {invoice.organization.name}
                  </p>
                  <p className="text-sm text-gray-400">{invoice.description}</p>
                  <p className="text-xs text-gray-500">
                    {invoice.number} •{" "}
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-lg font-bold text-white">
                    CHF {invoice.amount.toFixed(2)}
                  </p>
                  <Badge
                    variant={
                      invoice.status === "PAID" ? "default" : "secondary"
                    }
                    className={
                      invoice.status === "PAID"
                        ? "bg-green-500 hover:bg-green-600"
                        : invoice.status === "FAILED"
                        ? "bg-red-500 hover:bg-red-600"
                        : ""
                    }
                  >
                    {invoice.status}
                  </Badge>
                </div>
              </div>
            ))}

            {stats.recentInvoices.length === 0 && (
              <div className="p-12 text-center">
                <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No invoices yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
