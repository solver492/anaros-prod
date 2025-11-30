import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import FullCalendar from '@fullcalendar/react';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import interactionPlugin from '@fullcalendar/interaction';
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
import { Plus, User, Clock, Scissors, Loader2, X, Check, XCircle, Phone } from 'lucide-react';
import type { Profile, Client, ServiceWithCategory, AppointmentWithDetails, InsertAppointment } from '@shared/schema';

interface CalendarResource {
  id: string;
  title: string;
  colorCode: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  resourceId: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    appointment: AppointmentWithDetails;
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
  selectedSlot: { start: Date; end: Date; resourceId?: string } | null;
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

  useEffect(() => {
    if (selectedSlot?.resourceId) {
      setSelectedStaff(selectedSlot.resourceId);
    }
  }, [selectedSlot]);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setSelectedClient('');
      setSelectedService('');
      setSelectedStaff('');
      setClientSearch('');
      setAppointmentDate('');
      setAppointmentTime('09:00');
    }
  }, [open]);

  // Initialize date when slot is selected
  useEffect(() => {
    if (selectedSlot?.start) {
      const date = selectedSlot.start.toISOString().split('T')[0];
      const time = selectedSlot.start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', ':');
      setAppointmentDate(date);
      setAppointmentTime(selectedSlot.start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    }
  }, [selectedSlot?.start]);

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

  const filteredClients = clients.filter(
    (c) =>
      c.fullName.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.phone.includes(clientSearch)
  );

  const selectedServiceData = services.find((s) => s.id === selectedService);
  
  // Filter staff by skills for the selected service
  const availableStaff = selectedServiceData
    ? staff.filter((s) => {
        const hasSkill = staffSkills.some(
          (skill) => skill.profileId === s.id && skill.categoryId === selectedServiceData.categoryId
        );
        return hasSkill || s.role === 'admin' || s.role === 'superadmin';
      })
    : staff;

  const handleSubmit = () => {
    if (!selectedClient || !selectedService || !selectedStaff || !appointmentDate || !appointmentTime) return;

    const service = services.find((s) => s.id === selectedService);
    if (!service) return;

    // Parse date and time
    const [hours, minutes] = appointmentTime.split(':').map(Number);
    const startTime = new Date(appointmentDate);
    startTime.setHours(hours, minutes, 0);
    
    const endTime = new Date(startTime.getTime() + service.duration * 60000);

    createAppointment.mutate({
      startTime,
      endTime,
      clientId: selectedClient,
      serviceId: selectedService,
      staffId: selectedStaff,
      status: 'pending',
    });
  };

  const selectedClientData = clients.find((c) => c.id === selectedClient);
  const selectedStaffData = staff.find((s) => s.id === selectedStaff);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouveau Rendez-vous</DialogTitle>
          <DialogDescription>
            {selectedSlot && (
              <span className="flex items-center gap-2 mt-2">
                <Clock className="h-4 w-4" />
                {selectedSlot.start.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}{' '}
                à {selectedSlot.start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center gap-2 py-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {s}
              </div>
              {s < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded ${
                    step > s ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Date & Time */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appointment-date">Date du rendez-vous</Label>
              <Input
                id="appointment-date"
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                data-testid="input-appointment-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appointment-time">Heure du rendez-vous</Label>
              <Input
                id="appointment-time"
                type="time"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                data-testid="input-appointment-time"
              />
            </div>
          </div>
        )}

        {/* Step 2: Select Client */}
        {step === 2 && (
          <div className="space-y-4">
            <Label>Rechercher un client</Label>
            <Input
              placeholder="Nom ou téléphone..."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              data-testid="input-client-search"
            />
            <div className="max-h-60 overflow-auto space-y-2">
              {filteredClients.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Aucun client trouvé
                </p>
              ) : (
                filteredClients.slice(0, 10).map((client) => (
                  <div
                    key={client.id}
                    className={`p-3 rounded-lg border cursor-pointer hover-elevate ${
                      selectedClient === client.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                    onClick={() => setSelectedClient(client.id)}
                    data-testid={`client-option-${client.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {client.fullName.split(' ').map((n) => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{client.fullName}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </p>
                      </div>
                      {selectedClient === client.id && (
                        <Check className="h-5 w-5 text-primary ml-auto" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Step 3: Select Service */}
        {step === 3 && (
          <div className="space-y-4">
            <Label>Choisir une prestation</Label>
            <div className="max-h-60 overflow-auto space-y-2">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`p-3 rounded-lg border cursor-pointer hover-elevate ${
                    selectedService === service.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                  onClick={() => setSelectedService(service.id)}
                  data-testid={`service-option-${service.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{service.category?.name}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {service.duration} min
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{service.price} DA</p>
                      {selectedService === service.id && (
                        <Check className="h-5 w-5 text-primary ml-auto" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Select Staff */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Choisir un(e) employé(e)</Label>
              {selectedServiceData && (
                <Badge variant="outline" className="text-xs">
                  Compétent(e)s pour: {selectedServiceData.category?.name}
                </Badge>
              )}
            </div>
            <div className="max-h-60 overflow-auto space-y-2">
              {availableStaff.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Aucun employé disponible pour cette prestation
                </p>
              ) : (
                availableStaff.map((member) => (
                  <div
                    key={member.id}
                    className={`p-3 rounded-lg border cursor-pointer hover-elevate ${
                      selectedStaff === member.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                    onClick={() => setSelectedStaff(member.id)}
                    data-testid={`staff-option-${member.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        className="border-2"
                        style={{ borderColor: member.colorCode }}
                      >
                        <AvatarFallback
                          style={{
                            backgroundColor: `${member.colorCode}20`,
                            color: member.colorCode,
                          }}
                        >
                          {member.firstName[0]}{member.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {member.firstName} {member.lastName}
                        </p>
                      </div>
                      {selectedStaff === member.id && (
                        <Check className="h-5 w-5 text-primary ml-auto" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Summary before submit */}
        {step === 4 && selectedClient && selectedService && selectedStaff && (
          <Card className="mt-4 bg-muted/50">
            <CardContent className="pt-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Client</p>
                  <p className="font-medium">{selectedClientData?.fullName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Prestation</p>
                  <p className="font-medium">{selectedServiceData?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Employé(e)</p>
                  <p className="font-medium">
                    {selectedStaffData?.firstName} {selectedStaffData?.lastName}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <DialogFooter className="gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Retour
            </Button>
          )}
          {step < 4 && (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && (!appointmentDate || !appointmentTime)) || 
                (step === 2 && !selectedClient) || 
                (step === 3 && !selectedService)
              }
              data-testid="button-next-step"
            >
              Suivant
            </Button>
          )}
          {step === 4 && (
            <Button
              onClick={handleSubmit}
              disabled={!selectedStaff || createAppointment.isPending}
              data-testid="button-create-appointment"
            >
              {createAppointment.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer le RDV'
              )}
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

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  const statusLabels: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmé',
    completed: 'Terminé',
    cancelled: 'Annulé',
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
                data-testid="button-confirm-appointment"
              >
                <Check className="mr-2 h-4 w-4" />
                Confirmer
              </Button>
              <Button
                variant="outline"
                className="text-red-600"
                onClick={() => onStatusChange(appointment.id, 'cancelled')}
                data-testid="button-cancel-appointment"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Annuler
              </Button>
            </>
          )}
          {appointment.status === 'confirmed' && (
            <Button
              onClick={() => onStatusChange(appointment.id, 'completed')}
              data-testid="button-complete-appointment"
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

export default function Calendar() {
  const calendarRef = useRef<FullCalendar>(null);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
    resourceId?: string;
  } | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(
    null
  );
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
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

  // Transform staff to calendar resources
  const resources: CalendarResource[] = staff.map((s) => ({
    id: s.id,
    title: `${s.firstName} ${s.lastName}`,
    colorCode: s.colorCode || '#3B82F6',
  }));

  // Transform appointments to calendar events
  const events: CalendarEvent[] = appointments
    .filter((a) => a.status !== 'cancelled')
    .map((a) => ({
      id: a.id,
      title: `${a.client.fullName} - ${a.service.name}`,
      start: new Date(a.startTime).toISOString(),
      end: new Date(a.endTime).toISOString(),
      resourceId: a.staffId,
      backgroundColor: a.staff.colorCode || '#3B82F6',
      borderColor: a.staff.colorCode || '#3B82F6',
      extendedProps: { appointment: a },
    }));

  const handleDateSelect = (selectInfo: { start: Date; end: Date; resource?: { id: string } }) => {
    setSelectedSlot({
      start: selectInfo.start,
      end: selectInfo.end,
      resourceId: selectInfo.resource?.id,
    });
    setShowNewAppointment(true);
  };

  const handleEventClick = (clickInfo: { event: { extendedProps: { appointment: AppointmentWithDetails } } }) => {
    setSelectedAppointment(clickInfo.event.extendedProps.appointment);
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-muted-foreground">
              {staff.length} employé(e)s • {appointments.filter((a) => a.status !== 'cancelled').length} RDV aujourd'hui
            </p>
          </div>
          <Button onClick={() => setShowNewAppointment(true)} data-testid="button-new-appointment">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau RDV
          </Button>
        </div>

        <Card className="border-card-border overflow-hidden">
          <CardContent className="p-0">
            <div className="calendar-wrapper">
              <FullCalendar
                ref={calendarRef}
                plugins={[resourceTimeGridPlugin, interactionPlugin]}
                initialView="resourceTimeGridDay"
                resources={resources}
                events={events}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'resourceTimeGridDay,resourceTimeGridWeek',
                }}
                buttonText={{
                  today: "Aujourd'hui",
                  day: 'Jour',
                  week: 'Semaine',
                }}
                locale="fr"
                slotMinTime="09:00:00"
                slotMaxTime="20:00:00"
                slotDuration="00:30:00"
                slotLabelInterval="01:00:00"
                allDaySlot={false}
                selectable={true}
                selectMirror={true}
                select={handleDateSelect}
                eventClick={handleEventClick}
                height="calc(100vh - 14rem)"
                resourceLabelContent={(arg) => (
                  <div className="flex items-center gap-2 p-2">
                    <Avatar
                      className="h-8 w-8 border-2"
                      style={{ borderColor: (arg.resource.extendedProps as { colorCode?: string }).colorCode }}
                    >
                      <AvatarFallback
                        style={{
                          backgroundColor: `${(arg.resource.extendedProps as { colorCode?: string }).colorCode}20`,
                          color: (arg.resource.extendedProps as { colorCode?: string }).colorCode,
                        }}
                      >
                        {arg.resource.title.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{arg.resource.title}</span>
                  </div>
                )}
                eventContent={(arg) => (
                  <div className="p-1 text-xs overflow-hidden">
                    <p className="font-medium truncate">{arg.event.extendedProps.appointment.client.fullName}</p>
                    <p className="truncate opacity-80">{arg.event.extendedProps.appointment.service.name}</p>
                  </div>
                )}
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
        .calendar-wrapper .fc {
          font-family: inherit;
        }
        .calendar-wrapper .fc-theme-standard td,
        .calendar-wrapper .fc-theme-standard th {
          border-color: hsl(var(--border));
        }
        .calendar-wrapper .fc-theme-standard .fc-scrollgrid {
          border-color: hsl(var(--border));
        }
        .calendar-wrapper .fc-col-header-cell {
          background-color: hsl(var(--muted));
          padding: 0.5rem;
        }
        .calendar-wrapper .fc-timegrid-slot-label {
          font-size: 0.75rem;
          color: hsl(var(--muted-foreground));
        }
        .calendar-wrapper .fc-event {
          border-radius: 0.375rem;
          border-width: 0;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          cursor: pointer;
        }
        .calendar-wrapper .fc-event:hover {
          opacity: 0.9;
        }
        .calendar-wrapper .fc-button {
          background-color: hsl(var(--primary)) !important;
          border-color: hsl(var(--primary)) !important;
          font-weight: 500;
        }
        .calendar-wrapper .fc-button:hover {
          background-color: hsl(var(--primary) / 0.9) !important;
        }
        .calendar-wrapper .fc-button-active {
          background-color: hsl(var(--primary) / 0.8) !important;
        }
        .calendar-wrapper .fc-today-button:disabled {
          opacity: 0.5;
        }
        .calendar-wrapper .fc-day-today {
          background-color: hsl(var(--primary) / 0.05) !important;
        }
        .calendar-wrapper .fc-timegrid-now-indicator-line {
          border-color: hsl(var(--destructive));
          border-width: 2px;
        }
        .calendar-wrapper .fc-timegrid-now-indicator-arrow {
          border-color: hsl(var(--destructive));
          border-top-color: transparent !important;
          border-bottom-color: transparent !important;
        }
        .calendar-wrapper .fc-resource-header {
          background-color: hsl(var(--muted));
        }
        .dark .calendar-wrapper .fc-button {
          color: hsl(var(--primary-foreground));
        }
      `}</style>
    </Layout>
  );
}
