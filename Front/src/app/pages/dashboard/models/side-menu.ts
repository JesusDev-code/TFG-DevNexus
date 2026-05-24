export interface MenuItem {
  id: string;
  stateMachine?: string;
  artboard?: string;
  status: boolean;
  show: boolean;
  route?: string;
  icon?: string;
}

export const menuItemsList: MenuItem[] = [
  {
    id: 'Inicio',
    stateMachine: 'HOME_interactivity', artboard: 'HOME',
    status: true,
    show: true,
    route: '/dashboard',
    icon: 'home-outline'
  },
  {
    id: 'Sobre la comunidad',
    stateMachine: 'SEARCH_Interactivity', artboard: 'SEARCH',
    status: false,
    show: true,
    route: '/about',
    icon: 'business-outline'
  },
  {
    id: 'Contacto',
    stateMachine: 'STAR_Interactivity', artboard: 'LIKE/STAR',
    status: false,
    show: true, 
    route: '/contacto',
    icon: 'mail-outline'
  },
  {
    id: 'Comunidad',
    stateMachine: 'CHAT_Interactivity', artboard: 'CHAT',
    status: false,
    show: true,
    route: '/blog',
    icon: 'people-outline'
  },
  {
    id: 'FAQ / Ayuda',
    stateMachine: 'HELP_Interactivity', artboard: 'HELP',
    status: false,
    show: true, 
    route: '/faq',
    icon: 'help-circle-outline'
  },
];

export const menuItems2List: MenuItem[] = [];
export const menuItems3List: MenuItem[] = [];