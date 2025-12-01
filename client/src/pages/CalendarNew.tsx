import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Plus, User, Clock, Scissors, Loader2, X, Check, XCircle, Phone, ChevronDown } from 'lucide-react';
import type { Profile, Client, ServiceWithCategory, AppointmentWithDetails, InsertAppointment } from '@shared/schema';

// Setup date-fns localizer for react-big-calendar
const locales = {
  'fr': fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    appointment: AppointmentWithDetails;
    staffId: string;
    staffName: string;
    staffColor: string;
  };
}

function AppointmentModal({
  open,
  onOpenChange,
  selectedSlot,
  staff,
  clients,
  services,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSlot: { start: Date; end: Date; staffId?: string } | null;
  staff: Profile[];
  clients: Client[];
  services: ServiceWithCategory[];
  onSuccess: () => void;
}) {
  const [step, setStep] = useState(1);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [clientSearch, setClientSearch] = useState('');
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [appointmentTime, setAppointmentTime] = useState<string>('09:00');
  const { toast } = useToast();

  // Get staff skills from the API
  const { data: staffSkills = [] } = useQuery<{ profileId: string; categoryId: number }[]>({
    queryKey: ['/api/staff-skills'],
    enabled: open,
  });

  const createAppointment = useMutation({
    mutationFn: async (data: InsertAppointment) => {
      const res = await apiRequest('POST', '/api/appointments', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({ title: 'Succès', description: 'Rendez-vous créé avec succès' });
      onSuccess();
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: 'Erreur', description: 'Impossible de créer le rendez-vous', variant: 'destructive' });
    },
  });

  const handleCreateAppointment = async () => {
    if (!selectedClient || !selectedService || !selectedStaff || !appointmentDate || !appointmentTime) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs', variant: 'destructive' });
      return;
    }

    const startDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    const service = services.find(s => s.id === selectedService);
    const endDateTime = new Date(startDateTime.getTime() + (service?.duration || 60) * 60000);

    createAppointment.mutate({
      clientId: selectedClient,
      staffId: selectedStaff,
      serviceId: selectedService,
      startTime: startDateTime,
      endTime: endDateTime,
    });
  };

  const filteredClients = clients.filter(c =>
    c.fullName.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const availableServices = services.filter(s => {
    const staffSkill = staffSkills.find(
      sk => sk.profileId === selectedStaff && sk.categoryId === s.categoryId
    );
    return !!staffSkill;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un Rendez-vous</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {step === 1 && (
            <>
              <div>
                <Label>Sélectionner un Client</Label>
                <Input
                  placeholder="Rechercher un client..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="mt-1"
                />
                <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                  {filteredClients.map(client => (
                    <button
                      key={client.id}
                      onClick={() => {
                        setSelectedClient(client.id);
                        setStep(2);
                      }}
                      className="w-full text-left p-2 hover:bg-accent rounded"
                    >
                      <p className="font-medium">{client.fullName}</p>
                      <p className="text-sm text-muted-foreground">{client.phone}</p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <Label>Sélectionner un Employé</Label>
                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un employé" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.firstName} {s.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <Label>Sélectionner une Prestation</Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une prestation" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableServices.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} ({s.duration}min - {s.price}DA)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Heure</Label>
                <Input
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="mt-1"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
            >
              Précédent
            </Button>
          )}
          {step < 4 && (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && !selectedClient) ||
                (step === 2 && !selectedStaff) ||
                (step === 3 && !selectedService)
              }
            >
              Suivant
            </Button>
          )}
          {step === 4 && (
            <Button
              onClick={handleCreateAppointment}
              disabled={createAppointment.isPending}
            >
              {createAppointment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AppointmentDetailsModal({
  open,
  onOpenChange,
  appointment,
  onStatusChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: AppointmentWithDetails | null;
  onStatusChange: (id: string, status: string) => void;
}) {
  if (!appointment) return null;

  const statusLabels: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmé',
    completed: 'Terminé',
    cancelled: 'Annulé',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Détails du Rendez-vous</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className={statusColors[appointment.status]}>
              {statusLabels[appointment.status]}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {new Date(appointment.startTime).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </span>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{appointment.client.fullName}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {appointment.client.phone}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Scissors className="h-4 w-4" />
                Prestation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{appointment.service.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{appointment.service.category?.name}</Badge>
                <span className="text-sm text-muted-foreground">
                  {appointment.service.duration} min
                </span>
                <span className="font-medium">{appointment.service.price} DA</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horaire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">
                {new Date(appointment.startTime).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                -{' '}
                {new Date(appointment.endTime).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p className="text-sm text-muted-foreground">
                Avec {appointment.staff.firstName} {appointment.staff.lastName}
              </p>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          {appointment.status === 'pending' && (
            <>
              <Button
                variant="outline"
                className="text-emerald-600"
                onClick={() => onStatusChange(appointment.id, 'confirmed')}
              >
                <Check className="mr-2 h-4 w-4" />
                Confirmer
              </Button>
              <Button
                variant="outline"
                className="text-red-600"
                onClick={() => onStatusChange(appointment.id, 'cancelled')}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Annuler
              </Button>
            </>
          )}
          {appointment.status === 'confirmed' && (
            <Button
              onClick={() => onStatusChange(appointment.id, 'completed')}
            >
              <Check className="mr-2 h-4 w-4" />
              Marquer comme terminé
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CalendarPage() {
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
    staffId?: string;
  } | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('week');
  const [selectedStaffIds, setSelectedStaffIds] = useState<Set<string>>(new Set());
  const [searchStaff, setSearchStaff] = useState('');
  const [showStaffDropdown, setShowStaffDropdown] = useState(false);
  const { toast } = useToast();

  const { data: staff = [], isLoading: staffLoading } = useQuery<Profile[]>({
    queryKey: ['/api/profiles/staff'],
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery<ServiceWithCategory[]>({
    queryKey: ['/api/services'],
  });

  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery<
    AppointmentWithDetails[]
  >({
    queryKey: ['/api/appointments'],
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest('PATCH', `/api/appointments/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({ title: 'Succès', description: 'Statut mis à jour' });
      setShowAppointmentDetails(false);
    },
    onError: () => {
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le statut', variant: 'destructive' });
    },
  });

  const isLoading = staffLoading || clientsLoading || servicesLoading || appointmentsLoading;

  // Filter staff by search
  const filteredStaff = useMemo(() => {
    return staff.filter(s =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchStaff.toLowerCase())
    );
  }, [staff, searchStaff]);

  // Initialize selectedStaffIds with all staff if empty
  const activeStaffIds = useMemo(() => {
    if (selectedStaffIds.size === 0) {
      return new Set(staff.map(s => s.id));
    }
    return selectedStaffIds;
  }, [selectedStaffIds, staff]);

  // Toggle staff selection
  const toggleStaff = (staffId: string) => {
    const newSet = new Set(activeStaffIds);
    if (newSet.has(staffId)) {
      newSet.delete(staffId);
    } else {
      newSet.add(staffId);
    }
    setSelectedStaffIds(newSet);
  };

  // Select/deselect all filtered staff
  const toggleAllStaff = () => {
    if (filteredStaff.every(s => activeStaffIds.has(s.id))) {
      // Deselect all
      setSelectedStaffIds(new Set());
    } else {
      // Select all filtered
      setSelectedStaffIds(new Set(filteredStaff.map(s => s.id)));
    }
  };

  // Transform appointments to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return appointments
      .filter((a) => a.status !== 'cancelled' && activeStaffIds.has(a.staffId))
      .map((a) => ({
        id: a.id,
        title: `${a.client.fullName} - ${a.service.name}`,
        start: new Date(a.startTime),
        end: new Date(a.endTime),
        resource: {
          appointment: a,
          staffId: a.staffId,
          staffName: `${a.staff.firstName} ${a.staff.lastName}`,
          staffColor: a.staff.colorCode || '#3B82F6',
        },
      }));
  }, [appointments, activeStaffIds]);

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedSlot({
      start: slotInfo.start,
      end: slotInfo.end,
    });
    setShowNewAppointment(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedAppointment(event.resource.appointment);
    setShowAppointmentDetails(true);
  };

  if (isLoading) {
    return (
      <Layout title="Agenda">
        <div className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-40" />
          </div>
          <Skeleton className="h-[calc(100vh-12rem)] w-full rounded-lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Agenda">
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex-1">
            <p className="text-muted-foreground text-sm mb-3">
              {activeStaffIds.size}/{staff.length} employé(e)s • {appointments.filter((a) => a.status !== 'cancelled' && activeStaffIds.has(a.staffId)).length} RDV
            </p>
            {/* Staff Dropdown */}
            <div className="relative inline-block">
              <Button
                onClick={() => setShowStaffDropdown(!showStaffDropdown)}
                variant="outline"
                className="gap-2"
              >
                <User className="h-4 w-4" />
                Liste des employé(e)s
                <ChevronDown className={`h-4 w-4 transition-transform ${showStaffDropdown ? 'rotate-180' : ''}`} />
              </Button>

              {/* Dropdown Menu */}
              {showStaffDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 min-w-64">
                  {/* Search Input */}
                  <div className="p-3 border-b border-border">
                    <Input
                      placeholder="Rechercher un(e) employé(e)..."
                      value={searchStaff}
                      onChange={(e) => setSearchStaff(e.target.value)}
                      className="h-8"
                      autoFocus
                    />
                  </div>

                  {/* Select All Button */}
                  <div className="p-2 border-b border-border">
                    <Button
                      variant={filteredStaff.every(s => activeStaffIds.has(s.id)) ? 'default' : 'outline'}
                      size="sm"
                      onClick={toggleAllStaff}
                      className="w-full font-medium"
                    >
                      {filteredStaff.every(s => activeStaffIds.has(s.id)) ? 'Désélectionner tout' : 'Sélectionner tout'}
                    </Button>
                  </div>

                  {/* Staff List */}
                  <div className="max-h-64 overflow-y-auto">
                    {filteredStaff.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground text-sm">
                        Aucun(e) employé(e) trouvé(e)
                      </div>
                    ) : (
                      filteredStaff.map((s) => {
                        const isSelected = activeStaffIds.has(s.id);
                        return (
                          <button
                            key={s.id}
                            onClick={() => toggleStaff(s.id)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all hover:bg-muted ${
                              isSelected ? 'bg-primary/10' : ''
                            }`}
                          >
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: s.colorCode || '#3B82F6' }}
                            />
                            <span className={`text-sm font-medium flex-1 text-left ${
                              isSelected ? 'text-primary font-semibold' : 'text-foreground'
                            }`}>
                              {s.firstName} {s.lastName}
                            </span>
                            {isSelected && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <Button onClick={() => setShowNewAppointment(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau RDV
          </Button>
        </div>

        <Card className="border-card-border overflow-hidden">
          <CardContent className="p-0">
            <div className="calendar-wrapper" style={{ height: 'calc(100vh - 14rem)' }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                view={view}
                onView={setView as any}
                views={['month', 'week', 'day', 'agenda']}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                selectable
                popup
                eventPropGetter={(event) => ({
                  style: {
                    backgroundColor: event.resource.staffColor,
                    borderColor: event.resource.staffColor,
                    borderRadius: '0.375rem',
                    opacity: 0.9,
                    color: 'white',
                    border: '0px',
                    display: 'block',
                  },
                })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <AppointmentModal
        open={showNewAppointment}
        onOpenChange={setShowNewAppointment}
        selectedSlot={selectedSlot}
        staff={staff}
        clients={clients}
        services={services}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
          queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
        }}
      />

      <AppointmentDetailsModal
        open={showAppointmentDetails}
        onOpenChange={setShowAppointmentDetails}
        appointment={selectedAppointment}
        onStatusChange={(id, status) => updateStatus.mutate({ id, status })}
      />

      <style>{`
        .calendar-wrapper .rbc-calendar {
          font-family: inherit;
        }
        .calendar-wrapper .rbc-header {
          padding: 0.5rem;
          font-weight: 600;
          background-color: hsl(var(--muted));
          border-color: hsl(var(--border));
        }
        .calendar-wrapper .rbc-today {
          background-color: hsl(var(--primary) / 0.05);
        }
        .calendar-wrapper .rbc-off-range-bg {
          background-color: hsl(var(--muted) / 0.3);
        }
        .calendar-wrapper .rbc-event {
          padding: 2px 4px;
          border-radius: 0.375rem;
          font-size: 0.75rem;
        }
        .calendar-wrapper .rbc-event:hover {
          opacity: 0.8;
        }
        .calendar-wrapper .rbc-toolbar {
          padding: 1rem;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .calendar-wrapper .rbc-toolbar button {
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          border: none;
          border-radius: 0.375rem;
          padding: 0.5rem 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .calendar-wrapper .rbc-toolbar button:hover {
          background-color: hsl(var(--primary) / 0.9);
        }
        .calendar-wrapper .rbc-toolbar button.rbc-active {
          background-color: hsl(var(--primary) / 0.8);
        }
        .calendar-wrapper .rbc-toolbar button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .calendar-wrapper .rbc-month-view,
        .calendar-wrapper .rbc-time-view {
          border-color: hsl(var(--border));
        }
        .calendar-wrapper .rbc-time-slot {
          border-color: hsl(var(--border));
        }
        .calendar-wrapper .rbc-current-time-indicator {
          background-color: hsl(var(--destructive));
          height: 2px;
        }
      `}</style>
    </Layout>
  );
}
