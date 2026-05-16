import { Component, ViewChild, inject, effect, ChangeDetectionStrategy } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { App } from '@capacitor/app';
import { StatusBar } from '@capacitor/status-bar';
import { SafeAreaController } from '@aashu-dubey/capacitor-statusbar-safe-area';

// ✅ Importamos los servicios necesarios
import { AuthService } from './services/auth.service';
import { FcmService } from './services/fcm.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  @ViewChild(IonRouterOutlet, { static: true }) routerOutlet?: IonRouterOutlet;

  // Inyectamos los servicios
  private authService = inject(AuthService);
  private fcmService = inject(FcmService);
  private platform = inject(Platform);

  constructor() {
    // 🔔 Effect para observar el login de usuario (Signals)
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(() => {
            this.iniciarSistemaNotificaciones();
          });
        } else {
          setTimeout(() => {
            this.iniciarSistemaNotificaciones();
          }, 100);
        }
      }
    });

    this.inicializarApp();
  }

  private inicializarApp() {
    this.platform.ready().then(async () => {
      // Configuración visual (StatusBar, etc.)
      try {
        await StatusBar.setOverlaysWebView({ overlay: true });
        SafeAreaController.injectCSSVariables();
      } catch (e) {
        console.warn('Error visual menor:', e);
      }

      this.configurarBotonAtras();
    });
  }

  private async iniciarSistemaNotificaciones() {
    console.log('[FCM] Iniciando sistema de notificaciones...');

    // El SW debe registrarse ANTES de llamar a iniciarEscucha()
    // obtenerToken() es quien registra el service worker en web
    const token = await this.fcmService.obtenerToken();

    // Ahora sí — el SW está activo y onMessage puede recibir mensajes
    this.fcmService.iniciarEscucha();

    if (token) {
      console.log('[FCM] Guardando token en backend...');
      this.authService.updateUserProfile({ fcm_token: token }).subscribe({
        next: () => console.log('[FCM] ✅ Token guardado en BD correctamente'),
        error: (err) => console.error('[FCM] ❌ Error guardando token en BD:', err)
      });
    } else {
      console.warn('[FCM] ⚠️ No se obtuvo token — notificaciones push no funcionarán');
    }
  }

  private configurarBotonAtras() {
    this.platform.backButton.subscribeWithPriority(-1, () => {
      if (!this.routerOutlet?.canGoBack()) {
        App.exitApp();
      }
    });
  }
}