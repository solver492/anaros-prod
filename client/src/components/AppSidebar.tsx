import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  UserCog,
  LogOut,
  CalendarDays,
  Globe,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function AppSidebar() {
  const { user, logout, isAdmin, isReception } = useAuth();
  const [location] = useLocation();

  const menuItems = [
    {
      title: 'Tableau de bord',
      url: '/dashboard',
      icon: LayoutDashboard,
      show: isAdmin,
    },
    {
      title: 'Agenda',
      url: '/calendar',
      icon: Calendar,
      show: isReception,
    },
    {
      title: 'Mon Planning',
      url: '/my-schedule',
      icon: CalendarDays,
      show: !isAdmin && !isReception,
    },
    {
      title: 'Clients',
      url: '/clients',
      icon: Users,
      show: isReception,
    },
    {
      title: 'Prestations',
      url: '/services',
      icon: Scissors,
      show: isAdmin,
    },
    {
      title: 'Utilisateurs',
      url: '/users',
      icon: UserCog,
      show: isAdmin,
    },
    {
      title: 'Gestion du site web',
      url: 'https://mediumseagreen-hedgehog-212144.hostingersite.com/backoffice',
      icon: Globe,
      show: isAdmin,
      external: true,
    },
  ];

  const visibleItems = menuItems.filter(item => item.show);

  const getRoleBadge = (role: string) => {
    const labels: Record<string, string> = {
      superadmin: 'Super Admin',
      admin: 'Admin',
      reception: 'Réception',
      staff: 'Employé',
    };
    return labels[role] || role;
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg"
            style={{
              backgroundColor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))'
            }}
          >
            A
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">Anaros</h1>
            <p className="text-xs text-muted-foreground">Centre de Beauté</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.url.replace('/', '')}`}
                  >
                    {item.external ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </a>
                    ) : (
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {user && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Avatar
                className="h-10 w-10 border-2"
                style={{ borderColor: user.colorCode }}
              >
                <AvatarFallback
                  style={{ backgroundColor: `${user.colorCode}20`, color: user.colorCode }}
                >
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.firstName} {user.lastName}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {getRoleBadge(user.role)}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={logout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
