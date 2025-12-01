import { useQuery, useMutation } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import {
  Calendar,
  Clock,
  User,
  Scissors,
  Phone,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import type { AppointmentWithDetails } from '@shared/schema';

function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function AppointmentCard({
  appointment,
  isCurrentOrUpcoming,
  onComplete,
  onCancel,
}: {
  appointment: AppointmentWithDetails;
  isCurrentOrUpcoming: boolean;
  onComplete: () => void;
  onCancel: () => void;
}) {
  const startTime = new Date(appointment.startTime);
  const endTime = new Date(appointment.endTime);

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
  };

  const statusLabels: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmé',
    completed: 'Terminé',
    cancelled: 'Annulé',
  };

  return (
    <Card
      className={`border-card-border ${
        isCurrentOrUpcoming ? 'border-l-4 border-l-primary' : ''
      }`}
      data-testid={`schedule-appointment-${appointment.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Time column */}
            <div className="text-center min-w-16">
              <p className="text-2xl font-bold">{formatTime(startTime)}</p>
              <p className="text-sm text-muted-foreground">
                → {formatTime(endTime)}
              </p>
            </div>

            {/* Details */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{appointment.client.fullName}</h3>
                <Badge className={statusColors[appointment.status]}>
                  {statusLabels[appointment.status]}
                </Badge>
              </div>

              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {appointment.client.phone}
                </p>
                <p className="flex items-center gap-2">
                  <Scissors className="h-4 w-4" />
                  {appointment.service.name}
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {appointment.service.duration} min
                  <span className="font-medium">{appointment.service.price} DA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions for active appointments */}
          {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                onClick={onComplete}
                className="gap-1"
                data-testid={`button-complete-${appointment.id}`}
              >
                <CheckCircle className="h-4 w-4" />
                Terminer
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onCancel}
                className="gap-1 text-destructive"
                data-testid={`button-cancel-${appointment.id}`}
              >
                <XCircle className="h-4 w-4" />
                Annuler
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function MySchedule() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: appointments = [], isLoading } = useQuery<AppointmentWithDetails[]>({
    queryKey: ['/api/appointments', 'staff', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/appointments?staff=${user?.id}`);
      return res.json();
    },
    enabled: !!user?.id,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest('PATCH', `/api/appointments/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({ title: 'Succès', description: 'Statut mis à jour' });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut',
        variant: 'destructive',
      });
    },
  });

  // Filter appointments for selected date and current user
  const dayAppointments = appointments
    .filter((apt) => {
      const aptDate = new Date(apt.startTime);
      return (
        apt.staffId === user?.id &&
        aptDate.toDateString() === selectedDate.toDateString() &&
        apt.status !== 'cancelled'
      );
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const now = new Date();

  // Navigate to previous/next day
  const goToPreviousDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const goToNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = selectedDate.toDateString() === now.toDateString();

  // Count by status
  const stats = {
    total: dayAppointments.length,
    pending: dayAppointments.filter((a) => a.status === 'pending').length,
    confirmed: dayAppointments.filter((a) => a.status === 'confirmed').length,
    completed: dayAppointments.filter((a) => a.status === 'completed').length,
  };

  if (isLoading) {
    return (
      <Layout title="Mon Planning">
        <div className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-10 w-64" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-16 w-16" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Mon Planning">
      <div className="p-4 lg:p-6">
        {/* Date navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" onClick={goToPreviousDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center min-w-48">
              <h2 className="text-xl font-semibold">
                {selectedDate.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </h2>
              {!isToday && (
                <Button variant="link" size="sm" onClick={goToToday} className="p-0 h-auto">
                  Retour à aujourd'hui
                </Button>
              )}
            </div>
            <Button size="icon" variant="outline" onClick={goToNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{stats.total} RDV</span>
            </div>
            {stats.pending > 0 && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                {stats.pending} en attente
              </Badge>
            )}
            {stats.completed > 0 && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                {stats.completed} terminé(s)
              </Badge>
            )}
          </div>
        </div>

        {/* Appointments list */}
        {dayAppointments.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isToday ? 'Aucun rendez-vous aujourd\'hui' : 'Aucun rendez-vous ce jour'}
              </h3>
              <p className="text-muted-foreground">
                {isToday
                  ? 'Profitez de votre journée libre !'
                  : 'Sélectionnez une autre date pour voir vos rendez-vous.'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {dayAppointments.map((appointment) => {
              const aptStart = new Date(appointment.startTime);
              const aptEnd = new Date(appointment.endTime);
              const isCurrentOrUpcoming =
                isToday &&
                (appointment.status === 'pending' || appointment.status === 'confirmed') &&
                aptEnd > now;

              return (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  isCurrentOrUpcoming={isCurrentOrUpcoming}
                  onComplete={() =>
                    updateStatus.mutate({ id: appointment.id, status: 'completed' })
                  }
                  onCancel={() =>
                    updateStatus.mutate({ id: appointment.id, status: 'cancelled' })
                  }
                />
              );
            })}
          </div>
        )}

        {/* Timeline indicator for today */}
        {isToday && dayAppointments.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Il est actuellement{' '}
              <span className="font-medium">
                {now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
