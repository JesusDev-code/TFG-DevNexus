import { Component, ViewChild, inject, effect, ChangeDetectionStrategy } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { App } from '@capacitor/app';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { SafeAreaController } from '@aashu-dubey/capacitor-statusbar-safe-area';

import { AuthService } from './services/auth.service';
import { FcmService } from './services/fcm.service';
import { FcmTokenService, Plataforma } from './services/fcm-token.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  @ViewChild(IonRouterOutlet, { static: true }) routerOutlet?: IonRouterOutlet;

  private authService = inject(AuthService);
  private fcmService = inject(FcmService);
  private fcmTokenService = inject(FcmTokenService);
  private platform = inject(Platform);

  constructor() {
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

    const token = await this.fcmService.obtenerToken();
    this.fcmService.iniciarEscucha();

    if (!token) {
      console.warn('[FCM] No se obtuvo token — notificaciones push no funcionarán');
      return;
    }

    const plataforma = this.detectarPlataforma();
    console.log('[FCM] Registrando token en backend...', plataforma);
    this.fcmTokenService.registrar(token, plataforma).subscribe({
      next: () => console.log('[FCM] Token registrado correctamente'),
      error: (err) => console.error('[FCM] Error registrando token:', err)
    });
  }

  private detectarPlataforma(): Plataforma {
    const p = Capacitor.getPlatform();
    if (p === 'android') return 'ANDROID';
    if (p === 'ios') return 'IOS';
    return 'WEB';
  }

  private configurarBotonAtras() {
    this.platform.backButton.subscribeWithPriority(-1, () => {
      if (!this.routerOutlet?.canGoBack()) {
        App.exitApp();
      }
    });
  }
}
