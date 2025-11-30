import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  Crown,
  Trophy,
  Sparkles,
  DollarSign,
} from 'lucide-react';
import type { DashboardKPIs, TopEmployee, TopService, GoldenClient } from '@shared/schema';

function formatDA(amount: number): string {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' DA';
}

function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  loading,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: number;
  description?: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-card-border hover-elevate">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(trend !== undefined || description) && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {trend !== undefined && (
              <span className={trend >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                <TrendingUp className={`h-3 w-3 inline ${trend < 0 ? 'rotate-180' : ''}`} />
                {Math.abs(trend)}%
              </span>
            )}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function TopEmployeesTable({ employees, loading }: { employees: TopEmployee[]; loading: boolean }) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const getMedal = (rank: number) => {
    if (rank === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 1) return <Trophy className="h-5 w-5 text-gray-400" />;
    if (rank === 2) return <Trophy className="h-5 w-5 text-amber-700" />;
    return null;
  };

  return (
    <Card className="border-card-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Top Employés
        </CardTitle>
        <CardDescription>Classement par chiffre d'affaires généré</CardDescription>
      </CardHeader>
      <CardContent>
        {employees.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Aucune donnée disponible
          </p>
        ) : (
          <div className="space-y-3">
            {employees.map((employee, index) => (
              <div
                key={employee.id}
                className="flex items-center gap-3 p-2 rounded-lg hover-elevate"
                data-testid={`employee-row-${employee.id}`}
              >
                <div className="w-8 flex justify-center">
                  {getMedal(index) || (
                    <span className="text-sm text-muted-foreground">{index + 1}</span>
                  )}
                </div>
                <Avatar
                  className="h-10 w-10 border-2"
                  style={{ borderColor: employee.colorCode }}
                >
                  <AvatarFallback
                    style={{ backgroundColor: `${employee.colorCode}20`, color: employee.colorCode }}
                  >
                    {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{employee.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {employee.appointmentsCount} RDV
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatDA(employee.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TopServicesTable({ services, loading }: { services: TopService[]; loading: boolean }) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-card-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Top Prestations
        </CardTitle>
        <CardDescription>Services les plus demandés</CardDescription>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Aucune donnée disponible
          </p>
        ) : (
          <div className="space-y-3">
            {services.map((service, index) => (
              <div
                key={service.id}
                className="flex items-center gap-3 p-2 rounded-lg hover-elevate"
                data-testid={`service-row-${service.id}`}
              >
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{service.name}</p>
                  <Badge variant="secondary" className="text-xs">
                    {service.categoryName}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{service.count}x</p>
                  <p className="text-xs text-muted-foreground">{formatDA(service.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function GoldenClientCard({ client, loading }: { client: GoldenClient | null; loading: boolean }) {
  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!client) {
    return (
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Client Doré
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Aucune donnée ce mois-ci
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          Client Doré du Mois
        </CardTitle>
        <CardDescription>Le client ayant le plus dépensé ce mois</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-4 border-amber-400">
            <AvatarFallback className="bg-amber-100 text-amber-800 text-xl font-bold">
              {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-xl font-bold">{client.name}</p>
            <p className="text-muted-foreground">{client.phone}</p>
            <div className="flex items-center gap-4 mt-2">
              <Badge className="bg-amber-500 text-white">
                {formatDA(client.totalSpent)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {client.appointmentsCount} visites
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: kpis, isLoading: kpisLoading } = useQuery<DashboardKPIs>({
    queryKey: ['/api/dashboard/kpis'],
  });

  const { data: topEmployees = [], isLoading: employeesLoading } = useQuery<TopEmployee[]>({
    queryKey: ['/api/dashboard/top-employees'],
  });

  const { data: topServices = [], isLoading: servicesLoading } = useQuery<TopService[]>({
    queryKey: ['/api/dashboard/top-services'],
  });

  const { data: goldenClient, isLoading: clientLoading } = useQuery<GoldenClient | null>({
    queryKey: ['/api/dashboard/golden-client'],
  });

  return (
    <Layout title="Tableau de bord">
      <div className="p-4 lg:p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="CA Aujourd'hui"
            value={kpis ? formatDA(kpis.revenueToday) : '0 DA'}
            icon={DollarSign}
            description="ce jour"
            loading={kpisLoading}
          />
          <KPICard
            title="CA du Mois"
            value={kpis ? formatDA(kpis.revenueMonth) : '0 DA'}
            icon={TrendingUp}
            description="ce mois"
            loading={kpisLoading}
          />
          <KPICard
            title="RDV Aujourd'hui"
            value={kpis?.appointmentsToday?.toString() || '0'}
            icon={Calendar}
            description="rendez-vous"
            loading={kpisLoading}
          />
          <KPICard
            title="RDV Complétés"
            value={kpis?.appointmentsCompleted?.toString() || '0'}
            icon={CheckCircle}
            loading={kpisLoading}
          />
        </div>

        {/* Golden Client */}
        <GoldenClientCard client={goldenClient ?? null} loading={clientLoading} />

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopEmployeesTable employees={topEmployees} loading={employeesLoading} />
          <TopServicesTable services={topServices} loading={servicesLoading} />
        </div>
      </div>
    </Layout>
  );
}
