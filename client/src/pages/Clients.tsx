import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useLocation, useSearch } from "wouter";
import {
  Plus,
  Search,
  Phone,
  Mail,
  Calendar,
  Loader2,
  Edit,
  Trash2,
  History,
  DollarSign,
  User,
  X,
} from 'lucide-react';
import type { Client, InsertClient, AppointmentWithDetails } from '@shared/schema';

const clientSchema = z.object({
  fullName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().min(10, 'Numéro de téléphone invalide'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  notes: z.string().optional(),
});

type ClientForm = z.infer<typeof clientSchema>;

function ClientFormModal({
  open,
  onOpenChange,
  client,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const isEditing = !!client;

  const form = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      fullName: client?.fullName || '',
      phone: client?.phone || '',
      email: client?.email || '',
      notes: client?.notes || '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertClient) => {
      if (isEditing) {
        const res = await apiRequest('PATCH', `/api/clients/${client.id}`, data);
        return res.json();
      }
      const res = await apiRequest('POST', '/api/clients', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: 'Succès',
        description: isEditing ? 'Client mis à jour' : 'Client créé avec succès',
      });
      onSuccess();
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ClientForm) => {
    mutation.mutate({
      fullName: data.fullName,
      phone: data.phone,
      email: data.email || null,
      notes: data.notes || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier le client' : 'Nouveau client'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifiez les informations du client'
              : 'Ajoutez un nouveau client à votre base'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet</FormLabel>
                  <FormControl>
                    <Input placeholder="Fatima Benali" data-testid="input-client-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input placeholder="0555 12 34 56" data-testid="input-client-phone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (optionnel)</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="exemple@email.com"
                      data-testid="input-client-email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Allergies, préférences..."
                      data-testid="input-client-notes"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={mutation.isPending} data-testid="button-save-client">
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : isEditing ? (
                  'Mettre à jour'
                ) : (
                  'Créer'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ClientDetailsModal({
  open,
  onOpenChange,
  client,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
}) {
  const { data: appointments = [], isLoading } = useQuery<AppointmentWithDetails[]>({
    queryKey: ['/api/clients', client?.id, 'appointments'],
    enabled: open && !!client,
  });

  if (!client) return null;

  const totalSpent = appointments
    .filter((a) => a.status === 'completed')
    .reduce((sum, a) => sum + a.service.price, 0);

  const formatDA = (amount: number) =>
    new Intl.NumberFormat('fr-DZ').format(amount) + ' DA';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {client.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              {client.fullName}
              <p className="text-sm font-normal text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {client.phone}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total dépensé</p>
                  <p className="text-xl font-bold">{formatDA(totalSpent)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Visites</p>
                  <p className="text-xl font-bold">
                    {appointments.filter((a) => a.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {client.notes && (
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
              <p>{client.notes}</p>
            </CardContent>
          </Card>
        )}

        <div>
          <h4 className="font-semibold flex items-center gap-2 mb-3">
            <History className="h-4 w-4" />
            Historique des rendez-vous
          </h4>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucun rendez-vous pour ce client
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-auto">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                >
                  <div>
                    <p className="font-medium">{apt.service.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(apt.startTime).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}{' '}
                      à{' '}
                      {new Date(apt.startTime).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{apt.service.price} DA</p>
                    <Badge
                      variant="secondary"
                      className={
                        apt.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                          : apt.status === 'cancelled'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : ''
                      }
                    >
                      {apt.status === 'completed'
                        ? 'Terminé'
                        : apt.status === 'cancelled'
                          ? 'Annulé'
                          : apt.status === 'confirmed'
                            ? 'Confirmé'
                            : 'En attente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ClientCard({
  client,
  onEdit,
  onDelete,
  onClick,
}: {
  client: Client;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}) {
  return (
    <Card
      className="border-card-border hover-elevate cursor-pointer group"
      onClick={onClick}
      data-testid={`client-card-${client.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary">
              {client.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{client.fullName}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {client.phone}
            </p>
            {client.email && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                <Mail className="h-3 w-3" />
                {client.email}
              </p>
            )}
          </div>
          <div
            className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <Button size="icon" variant="ghost" onClick={onEdit} data-testid={`button-edit-client-${client.id}`}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-destructive"
              onClick={onDelete}
              data-testid={`button-delete-client-${client.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {client.notes && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{client.notes}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Clients() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  const searchParams = useSearch();

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  // Open client details if clientId query param is present
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const clientId = params.get('clientId');
    if (clientId && clients.length > 0 && !selectedClient) {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        setSelectedClient(client);
        setShowDetails(true);
      }
    }
  }, [searchParams, clients, selectedClient]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({ title: 'Succès', description: 'Client supprimé' });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer ce client',
        variant: 'destructive',
      });
    },
  });

  const filteredClients = clients.filter(
    (client) =>
      client.fullName.toLowerCase().includes(search.toLowerCase()) ||
      client.phone.includes(search)
  );

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleDelete = (client: Client) => {
    if (confirm(`Supprimer ${client.fullName} ?`)) {
      deleteMutation.mutate(client.id);
    }
  };

  const handleCardClick = (client: Client) => {
    setSelectedClient(client);
    setShowDetails(true);
  };

  return (
    <Layout title="Clients">
      <div className="p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou téléphone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              data-testid="input-search-clients"
            />
            {search && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearch('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button
            onClick={() => {
              setEditingClient(null);
              setShowForm(true);
            }}
            data-testid="button-new-client"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouveau client
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {search ? 'Aucun résultat' : 'Aucun client'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {search
                  ? 'Essayez avec un autre terme de recherche'
                  : 'Commencez par ajouter votre premier client'}
              </p>
              {!search && (
                <Button
                  onClick={() => {
                    setEditingClient(null);
                    setShowForm(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un client
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onEdit={() => handleEdit(client)}
                onDelete={() => handleDelete(client)}
                onClick={() => handleCardClick(client)}
              />
            ))}
          </div>
        )}

        <p className="text-sm text-muted-foreground mt-4">
          {filteredClients.length} client(s) trouvé(s)
        </p>
      </div>

      <ClientFormModal
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingClient(null);
        }}
        client={editingClient}
        onSuccess={() => {
          setEditingClient(null);
        }}
      />

      <ClientDetailsModal
        open={showDetails}
        onOpenChange={(open) => {
          setShowDetails(open);
          // Optional: You might want to clear the URL param here if you want clean URLs
        }}
        client={selectedClient}
      />
    </Layout>
  );
}
