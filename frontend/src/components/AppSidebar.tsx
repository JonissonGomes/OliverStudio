import React from 'react';
import { 
  Calendar, 
  Camera, 
  Users, 
  UserCheck, 
  LogOut,
  LayoutDashboard,
  Menu,
  BarChart3,
  Shield,
  User,
  UserPlus
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const navigationItems = [
  { 
    title: 'Dashboard', 
    url: '/app/dashboard', 
    icon: LayoutDashboard,
    roles: ['admin', 'gerente', 'assistente', 'fotografo'] // Todos os roles têm acesso
  },
  { 
    title: 'Leads', 
    url: '/app/leads', 
    icon: UserPlus,
    roles: ['admin', 'gerente', 'assistente'] // Admin, Gerente e Assistente
  },
  { 
    title: 'Eventos', 
    url: '/app/eventos', 
    icon: Calendar,
    roles: ['admin', 'gerente', 'assistente', 'fotografo'] // Todos os roles têm acesso
  },
  { 
    title: 'Clientes', 
    url: '/app/clientes', 
    icon: Users,
    roles: ['admin', 'gerente', 'assistente'] // Admin, Gerente e Assistente
  },
  { 
    title: 'Fotógrafos', 
    url: '/app/fotografos', 
    icon: UserCheck,
    roles: ['admin', 'gerente'] // Apenas Admin e Gerente
  },
  { 
    title: 'Analytics', 
    url: '/app/analytics', 
    icon: BarChart3,
    roles: ['admin', 'gerente'] // Apenas Admin e Gerente
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { logout, user } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const adminItems = [
    { 
      title: 'Administração', 
      url: '/app/admin', 
      icon: Shield,
      roles: ['admin'] // Apenas Admin
    },
  ];

  // Função para verificar se o usuário tem acesso a um item
  const hasAccess = (itemRoles: string[]) => {
    if (!user?.roles) return false;
    return user.roles.some(role => itemRoles.includes(role));
  };

  // Filtrar itens de navegação baseado no role do usuário
  const filteredNavigationItems = navigationItems.filter(item => hasAccess(item.roles));

  // Filtrar itens de administração baseado no role do usuário
  const filteredAdminItems = adminItems.filter(item => hasAccess(item.roles));

  const isActive = (path: string) => currentPath === path;

  const handleLogout = () => {
    logout();
  };

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-60'} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex flex-col space-y-2 px-3 py-2">
          <div className="flex items-center">
            <SidebarTrigger className="h-8 w-8 -ml-1" />
          </div>
          <div className="flex items-center gap-2">
            <Camera className="h-8 w-8 text-sidebar-primary" />
            {!collapsed && (
              <div>
                <h2 className="text-lg font-bold text-sidebar-foreground">Oliver</h2>
                <p className="text-sm text-sidebar-foreground/70">Estudios</p>
              </div>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) => 
                        isActive 
                          ? 'bg-sidebar-accent text-sidebar-primary font-medium' 
                          : 'hover:bg-sidebar-accent/50'
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {filteredAdminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredAdminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url}
                        className={({ isActive }) => 
                          isActive 
                            ? 'bg-sidebar-accent text-sidebar-primary font-medium' 
                            : 'hover:bg-sidebar-accent/50'
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink 
                to="/app/profile"
                className={({ isActive }) => 
                  isActive 
                    ? 'bg-sidebar-accent text-sidebar-primary font-medium' 
                    : 'hover:bg-sidebar-accent/50'
                }
              >
                <User className="h-4 w-4" />
                {!collapsed && <span>Perfil</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sair</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}