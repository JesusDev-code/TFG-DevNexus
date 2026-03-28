import { Component, ViewChild, inject, effect, ChangeDetectionStrategy } from '@angular/core'; // ✅ Añadido inject
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

  constructor(private platform: Platform) {
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
    this.platform.ready().then(() => {
      // Configuración visual (StatusBar, etc.)
      try {
        SafeAreaController.injectCSSVariables();
        StatusBar.setOverlaysWebView({ overlay: true }).catch(() => { });
      } catch (e) {
        console.warn('Error visual menor:', e);
      }

      this.configurarBotonAtras();
    });
  }

  // 🔄 Será llamado cuando haya un usuario autenticado por el effect
  private async iniciarSistemaNotificaciones() {
    console.log('👤 Usuario detectado. Iniciando sistema FCM...');

    // 1. Pedimos el token a FCM
    const token = await this.fcmService.obtenerToken();

    // 2. Si hay token, se lo damos a Auth para que lo guarde en la BD
    // En MVP esto hace que FCM arranque
    if (token) {
      this.authService.updateUserProfile({ fcm_token: token }).subscribe({
        next: () => console.log('✅ Token vinculado al usuario correctamente'),
        error: (err) => console.error('❌ Error guardando token en BD:', err)
      });

      // 3. Activamos la escucha de mensajes
      this.fcmService.iniciarEscucha();
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