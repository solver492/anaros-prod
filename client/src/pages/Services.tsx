import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import {
  Plus,
  Loader2,
  Edit,
  Trash2,
  Clock,
  Scissors,
  Sparkles,
} from 'lucide-react';
import type { Service, ServiceCategory, ServiceWithCategory, InsertService } from '@shared/schema';

const serviceSchema = z.object({
  categoryId: z.number().min(1, 'Catégorie requise'),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  price: z.number().min(0, 'Le prix doit être positif'),
  duration: z.number().min(5, 'La durée minimum est de 5 minutes'),
});

type ServiceForm = z.infer<typeof serviceSchema>;

function ServiceFormModal({
  open,
  onOpenChange,
  service,
  categories,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: ServiceWithCategory | null;
  categories: ServiceCategory[];
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const isEditing = !!service;

  const form = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      categoryId: service?.categoryId || 0,
      name: service?.name || '',
      price: service?.price || 0,
      duration: service?.duration || 30,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertService) => {
      if (isEditing) {
        const res = await apiRequest('PATCH', `/api/services/${service.id}`, data);
        return res.json();
      }
      const res = await apiRequest('POST', '/api/services', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      toast({
        title: 'Succès',
        description: isEditing ? 'Prestation mise à jour' : 'Prestation créée avec succès',
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

  const onSubmit = (data: ServiceForm) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier la prestation' : 'Nouvelle prestation'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifiez les détails de la prestation'
              : 'Ajoutez une nouvelle prestation au catalogue'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la prestation</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Brushing Cheveux Mi-longs" data-testid="input-service-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix (DA)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1500"
                        data-testid="input-service-price"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durée (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="30"
                        data-testid="input-service-duration"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={mutation.isPending} data-testid="button-save-service">
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

function ServiceCard({
  service,
  onEdit,
  onDelete,
}: {
  service: ServiceWithCategory;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between p-4 border rounded-lg hover-elevate group"
      data-testid={`service-card-${service.id}`}
    >
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h4 className="font-medium">{service.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {service.duration} min
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-semibold text-lg">{service.price} DA</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="ghost" onClick={onEdit} data-testid={`button-edit-service-${service.id}`}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive"
            onClick={onDelete}
            data-testid={`button-delete-service-${service.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Services() {
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<ServiceWithCategory | null>(null);
  const { toast } = useToast();

  const { data: services = [], isLoading: servicesLoading } = useQuery<ServiceWithCategory[]>({
    queryKey: ['/api/services'],
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<ServiceCategory[]>({
    queryKey: ['/api/service-categories'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      toast({ title: 'Succès', description: 'Prestation supprimée' });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer cette prestation',
        variant: 'destructive',
      });
    },
  });

  const isLoading = servicesLoading || categoriesLoading;

  // Group services by category
  const servicesByCategory = categories.map((category) => ({
    category,
    services: services.filter((s) => s.categoryId === category.id),
  }));

  const handleEdit = (service: ServiceWithCategory) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleDelete = (service: ServiceWithCategory) => {
    if (confirm(`Supprimer "${service.name}" ?`)) {
      deleteMutation.mutate(service.id);
    }
  };

  if (isLoading) {
    return (
      <Layout title="Prestations">
        <div className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-16 w-full" />
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Prestations">
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-muted-foreground">
              {services.length} prestation(s) dans {categories.length} catégorie(s)
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingService(null);
              setShowForm(true);
            }}
            data-testid="button-new-service"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle prestation
          </Button>
        </div>

        {servicesByCategory.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Scissors className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune prestation</h3>
              <p className="text-muted-foreground mb-4">
                Commencez par ajouter vos premières prestations
              </p>
              <Button
                onClick={() => {
                  setEditingService(null);
                  setShowForm(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une prestation
              </Button>
            </div>
          </Card>
        ) : (
          <Accordion
            type="multiple"
            defaultValue={categories.map((c) => c.id.toString())}
            className="space-y-4"
          >
            {servicesByCategory.map(({ category, services: categoryServices }) => (
              <AccordionItem
                key={category.id}
                value={category.id.toString()}
                className="border rounded-lg overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover-elevate">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Scissors className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {categoryServices.length} prestation(s)
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  {categoryServices.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Aucune prestation dans cette catégorie
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {categoryServices.map((service) => (
                        <ServiceCard
                          key={service.id}
                          service={service}
                          onEdit={() => handleEdit(service)}
                          onDelete={() => handleDelete(service)}
                        />
                      ))}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      <ServiceFormModal
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingService(null);
        }}
        service={editingService}
        categories={categories}
        onSuccess={() => {
          setEditingService(null);
        }}
      />
    </Layout>
  );
}
