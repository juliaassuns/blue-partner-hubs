import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Building2,
  Users,
  Award,
  BadgeCheck,
  GraduationCap,
  Gift,
  ListChecks,
  BarChart3,
  Bot,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const grupos: { label: string; items: { title: string; url: string; icon: typeof Users }[] }[] = [
  {
    label: "Visão geral",
    items: [
      { title: "Dashboard Executivo", url: "/", icon: LayoutDashboard },
      { title: "Solutions Partner", url: "/solutions", icon: Award },
    ],
  },
  {
    label: "Ecossistema",
    items: [
      { title: "Revendas CSP", url: "/revendas", icon: Building2 },
      { title: "Clientes", url: "/clientes", icon: Users },
    ],
  },
  {
    label: "Capacidade",
    items: [
      { title: "Especializações", url: "/especializacoes", icon: GraduationCap },
      { title: "Certificações", url: "/certificacoes", icon: BadgeCheck },
      { title: "Benefícios e Incentivos", url: "/beneficios", icon: Gift },
    ],
  },
  {
    label: "Execução",
    items: [
      { title: "Plano de Ação", url: "/plano-acao", icon: ListChecks },
      { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
      { title: "Copilot BluePartner", url: "/copilot", icon: Bot },
      { title: "Configurações", url: "/configuracoes", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (url: string) => (url === "/" ? pathname === "/" : pathname.startsWith(url));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-1 py-2">
          <div className="grid size-8 shrink-0 place-items-center rounded bg-primary text-primary-foreground font-bold">
            B
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight">BluePartner</p>
              <p className="truncate text-[11px] text-muted-foreground">Intelligence Center</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {grupos.map((grupo) => (
          <SidebarGroup key={grupo.label}>
            {!collapsed && <SidebarGroupLabel>{grupo.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {grupo.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="size-4 shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
