export interface MenuItem {
  id: string;
  // Propiedades de Rive que mantenemos por compatibilidad aunque no usemos
  stateMachine?: string; 
  artboard?: string;
  status: boolean;
  show: boolean;
  route?: string;
  icon?: string; // ✅ Nueva propiedad para el icono
}

export const menuItemsList: MenuItem[] = [
  {
    id: 'Inicio',
    stateMachine: 'HOME_interactivity', artboard: 'HOME',
    status: true, // Activo por defecto
    show: true,
    route: '/dashboard',
    icon: 'home-outline' // ✅ Icono
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
    id: 'Blog de noticias',
    stateMachine: 'CHAT_Interactivity', artboard: 'CHAT',
    status: false,
    show: true, 
    route: '/blog',
    icon: 'newspaper-outline'
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

// ✅ Listas vacías para eliminar las secciones "History" y "Dark Mode"
export const menuItems2List: MenuItem[] = [];
export const menuItems3List: MenuItem[] = [];