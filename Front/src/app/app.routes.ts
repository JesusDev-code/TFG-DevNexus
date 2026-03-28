import { Routes } from '@angular/router';
import { AppShellComponent } from './app-shell/app-shell.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: '',
    component: AppShellComponent,
    children: [
      // --- PÁGINAS PÚBLICAS ---
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage) },
      { path: 'about', loadComponent: () => import('./pages/about/about.page').then(m => m.SobreNosotrosPage) },
      { path: 'blog', loadComponent: () => import('./pages/blog/blog.page').then(m => m.BlogPage) },
      { path: 'faq', loadComponent: () => import('./pages/faq/faq.page').then(m => m.FAQPage) },
      { path: 'contacto', loadComponent: () => import('./pages/contacto/contacto.page').then(m => m.ContactoPage) },
      { path: 'privacidad', loadComponent: () => import('./pages/privacidad/privacidad.page').then(m => m.PrivacidadPage) },
      
      // --- ZONA PRIVADA DE USUARIO ---
      {
        path: 'user-profile',
        loadComponent: () => import('./pages/user-profile/user-profile.page').then(m => m.UserProfilePage),
        canActivate: [authGuard],
        children: [
          { path: 'perfil', loadComponent: () => import('./pages/user-profile/user-profile-info/user-profile-info.page').then(m => m.UserProfileInfoPage) },
          { path: 'diario', loadComponent: () => import('./pages/user-profile/user-diary/user-diary.page').then(m => m.UserDiaryPage) },
          { path: 'tickets', loadComponent: () => import('./pages/user-profile/user-tickets/user-tickets.page').then(m => m.UserTicketsPage) },
          { path: 'mensajes', loadComponent: () => import('./pages/user-profile/user-messages/user-messages.page').then(m => m.UserMessagesPage) },
          { path: 'mensajes/:id', loadComponent: () => import('./pages/user-profile/user-messages/user-messages.page').then(m => m.UserMessagesPage) },
          { path: 'notificaciones', loadComponent: () => import('./pages/user-profile/user-notifications/user-notifications.page').then(m => m.UserNotificationsPage) },
          { path: 'eventos', loadComponent: () => import('./pages/user-profile/user-events/user-events.page').then(m => m.UserEventsPage) },
          { path: '', redirectTo: 'perfil', pathMatch: 'full' }
        ]
      },

      // --- ZONA PRIVADA DE ADMIN ---
      {
        path: 'admin-profile',
        loadComponent: () => import('./pages/admin-profile/admin-profile.page').then(m => m.AdminProfilePage),
        canActivate: [authGuard, adminGuard], // 🔒 Protegido
        children: [
          { path: 'admin-user', loadComponent: () => import('./pages/admin-profile/admin-user/admin-user.page').then(m => m.AdminUserPage) },
          { path: 'admin-tickets', loadComponent: () => import('./pages/admin-profile/admin-tickets/admin-tickets.page').then(m => m.AdminTicketsPage) },
          
          { path: 'admin-mensajes', loadComponent: () => import('./pages/admin-profile/admin-mensajes/admin-mensajes.page').then(m => m.AdminMensajesPage) },
          { path: 'admin-mensajes/:id', loadComponent: () => import('./pages/admin-profile/admin-mensajes/admin-mensajes.page').then(m => m.AdminMensajesPage) },

          { path: 'admin-eventos', loadComponent: () => import('./pages/admin-profile/admin-eventos/admin-eventos.page').then(m => m.AdminEventosPage) },
          { path: 'admin-auditar', loadComponent: () => import('./pages/admin-profile/admin-auditar/admin-auditar.page').then(m => m.AdminAuditarPage) },
          
          { path: 'admin-diarios', loadComponent: () => import('./pages/admin-profile/admin-diarios/admin-diarios.page').then( m => m.AdminDiariosPage) },
        
          { path: 'admin-personal', loadComponent: () => import('./pages/admin-profile/admin-personal/admin-personal.page').then(m => m.AdminPersonalPage) },
          
          // ✅ AHORA ES SEGURO: Está dentro de la zona protegida
          { 
            path: 'staff-inbox', 
            loadComponent: () => import('./pages/dashboard/views/staff-inbox/staff-inbox.page').then( m => m.StaffInboxPage)
          },
          
          { path: '', redirectTo: 'admin-user', pathMatch: 'full' }
        ]
      }
    ]
  },
  
  // Rutas de chat individual (se quedan fuera para poder abrirse en ventana completa o modal)
  {
    path: 'support-chat',
    loadComponent: () => import('./pages/dashboard/views/support-chat/support-chat.page').then( m => m.SupportChatPage)
  },
  {
    path: 'support-chat/:userId',
    loadComponent: () => import('./pages/dashboard/views/support-chat/support-chat.page').then( m => m.SupportChatPage)
  }
];