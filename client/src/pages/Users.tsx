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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import {
  Plus,
  Loader2,
  Edit,
  Trash2,
  UserCog,
  Shield,
  Palette,
} from 'lucide-react';
import type { Profile, ProfileWithSkills, ServiceCategory, InsertProfile, UserRole } from '@shared/schema';

const userSchema = z.object({
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères').optional(),
  role: z.enum(['superadmin', 'admin', 'reception', 'staff']),
  colorCode: z.string(),
  skills: z.array(z.number()).optional(),
});

type UserForm = z.infer<typeof userSchema>;

const roleLabels: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  admin: 'Administrateur',
  reception: 'Réception',
  staff: 'Employé',
};

const colorOptions = [
  '#E8B4B8', // Rose poudré
  '#D4AF37', // Doré
  '#3B82F6', // Bleu
  '#10B981', // Vert
  '#8B5CF6', // Violet
  '#F59E0B', // Orange
  '#EF4444', // Rouge
  '#EC4899', // Rose vif
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
];

function UserFormModal({
  open,
  onOpenChange,
  user,
  categories,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ProfileWithSkills | null;
  categories: ServiceCategory[];
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const isEditing = !!user;

  const form = useForm<UserForm>({
    resolver: zodResolver(
      isEditing ? userSchema.omit({ password: true }).extend({ password: z.string().optional() }) : userSchema
    ),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      password: '',
      role: user?.role || 'staff',
      colorCode: user?.colorCode || '#3B82F6',
      skills: user?.skills || [],
    },
  });

  const watchRole = form.watch('role');
  const watchSkills = form.watch('skills') || [];

  const mutation = useMutation({
    mutationFn: async (data: InsertProfile & { skills?: number[] }) => {
      if (isEditing) {
        const res = await apiRequest('PATCH', `/api/profiles/${user.id}`, data);
        return res.json();
      }
      const res = await apiRequest('POST', '/api/profiles', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/profiles/staff'] });
      queryClient.invalidateQueries({ queryKey: ['/api/staff-skills'] });
      toast({
        title: 'Succès',
        description: isEditing ? 'Utilisateur mis à jour' : 'Utilisateur créé avec succès',
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

  const onSubmit = (data: UserForm) => {
    const payload: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: data.role,
      colorCode: data.colorCode,
      skills: data.skills,
    };
    if (data.password) {
      payload.password = data.password;
    }
    mutation.mutate(payload);
  };

  const toggleSkill = (categoryId: number) => {
    const current = form.getValues('skills') || [];
    if (current.includes(categoryId)) {
      form.setValue(
        'skills',
        current.filter((id) => id !== categoryId)
      );
    } else {
      form.setValue('skills', [...current, categoryId]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifiez les informations de l\'utilisateur'
              : 'Ajoutez un nouveau membre à l\'équipe'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input placeholder="Marie" data-testid="input-user-firstname" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Dupont" data-testid="input-user-lastname" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="marie@anaros.com"
                      data-testid="input-user-email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Mot de passe {isEditing && '(laisser vide pour ne pas changer)'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      data-testid="input-user-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rôle</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-role">
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(roleLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
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
              name="colorCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Couleur (pour l'agenda)
                  </FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          field.value === color
                            ? 'border-foreground scale-110'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => field.onChange(color)}
                        data-testid={`color-option-${color}`}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchRole === 'staff' && (
              <div>
                <FormLabel className="mb-2 block">Compétences</FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer hover-elevate ${
                        watchSkills.includes(category.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border'
                      }`}
                      onClick={() => toggleSkill(category.id)}
                      data-testid={`skill-checkbox-${category.id}`}
                    >
                      <Checkbox
                        checked={watchSkills.includes(category.id)}
                        onCheckedChange={() => toggleSkill(category.id)}
                      />
                      <label className="text-sm font-medium cursor-pointer">
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={mutation.isPending} data-testid="button-save-user">
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

function UserCard({
  user,
  categories,
  onEdit,
  onDelete,
}: {
  user: ProfileWithSkills;
  categories: ServiceCategory[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const skillNames = user.skills
    .map((skillId) => categories.find((c) => c.id === skillId)?.name)
    .filter(Boolean);

  return (
    <Card className="border-card-border hover-elevate" data-testid={`user-card-${user.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar
            className="h-12 w-12 border-2"
            style={{ borderColor: user.colorCode }}
          >
            <AvatarFallback
              style={{ backgroundColor: `${user.colorCode}20`, color: user.colorCode }}
            >
              {user.firstName[0]}{user.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="secondary" className="gap-1">
                <Shield className="h-3 w-3" />
                {roleLabels[user.role]}
              </Badge>
              {skillNames.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {skillNames.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{skillNames.length - 3}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" onClick={onEdit} data-testid={`button-edit-user-${user.id}`}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-destructive"
              onClick={onDelete}
              data-testid={`button-delete-user-${user.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Users() {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<ProfileWithSkills | null>(null);
  const { toast } = useToast();

  const { data: users = [], isLoading: usersLoading } = useQuery<ProfileWithSkills[]>({
    queryKey: ['/api/profiles'],
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<ServiceCategory[]>({
    queryKey: ['/api/service-categories'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/profiles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/profiles/staff'] });
      toast({ title: 'Succès', description: 'Utilisateur supprimé' });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer cet utilisateur',
        variant: 'destructive',
      });
    },
  });

  const isLoading = usersLoading || categoriesLoading;

  const handleEdit = (user: ProfileWithSkills) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDelete = (user: ProfileWithSkills) => {
    if (confirm(`Supprimer ${user.firstName} ${user.lastName} ?`)) {
      deleteMutation.mutate(user.id);
    }
  };

  if (isLoading) {
    return (
      <Layout title="Utilisateurs">
        <div className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-40" />
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
    <Layout title="Utilisateurs">
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-muted-foreground">{users.length} membre(s) de l'équipe</p>
          </div>
          <Button
            onClick={() => {
              setEditingUser(null);
              setShowForm(true);
            }}
            data-testid="button-new-user"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvel utilisateur
          </Button>
        </div>

        {users.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <UserCog className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun utilisateur</h3>
              <p className="text-muted-foreground mb-4">
                Commencez par ajouter les membres de votre équipe
              </p>
              <Button
                onClick={() => {
                  setEditingUser(null);
                  setShowForm(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un utilisateur
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                categories={categories}
                onEdit={() => handleEdit(user)}
                onDelete={() => handleDelete(user)}
              />
            ))}
          </div>
        )}
      </div>

      <UserFormModal
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingUser(null);
        }}
        user={editingUser}
        categories={categories}
        onSuccess={() => {
          setEditingUser(null);
        }}
      />
    </Layout>
  );
}
