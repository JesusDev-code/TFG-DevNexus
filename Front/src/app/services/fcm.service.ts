import { Injectable, inject, NgZone } from '@angular/core';
import { environment } from 'src/environments/environment';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { ToastController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

@Injectable({
  providedIn: 'root'
})
export class FcmService {
  private readonly firebaseApp = initializeApp(environment.firebase);
  private readonly VAPID_KEY = 'BIwjZcyS8a_rS1hNzyB9j6-SBCwzqOfR4qrUWtQMNkCOd3ovWX_-LGYhWmo1hk1S-fGsL_KohgH2xoBfO1RB1ug';

  private toastController = inject(ToastController);
  private router = inject(Router);
  private zone = inject(NgZone);

  private tokenYaSolicitado = false;
  private escuchaIniciada = false;

  async obtenerToken(): Promise<string | null> {
    if (this.tokenYaSolicitado) return null;
    this.tokenYaSolicitado = true;

    return Capacitor.isNativePlatform()
      ? this.obtenerTokenNativo()
      : this.obtenerTokenWeb();
  }

  iniciarEscucha() {
    if (this.escuchaIniciada) return;
    this.escuchaIniciada = true;

    if (Capacitor.isNativePlatform()) {
      this.escuchaNativa();
    } else {
      this.escuchaWeb();
    }
  }

  resetear() {
    this.tokenYaSolicitado = false;
    this.escuchaIniciada = false;
  }

  private async obtenerTokenNativo(): Promise<string | null> {
    try {
      const permisos = await PushNotifications.requestPermissions();
      if (permisos.receive !== 'granted') return null;

      await PushNotifications.register();

      return new Promise<string | null>((resolve) => {
        PushNotifications.addListener('registration', (token) => resolve(token.value));
        PushNotifications.addListener('registrationError', () => resolve(null));
      });
    } catch (err) {
      console.error('Error FCM nativo:', err);
      return null;
    }
  }

  private escuchaNativa() {
    PushNotifications.addListener('pushNotificationReceived', async (notification) => {
      await this.mostrarToast(
        notification.title ?? 'Aviso',
        notification.body ?? '',
        notification.data?.['tipo'],
        notification.data?.['url']
      );
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      const url = action.notification.data?.['url'];
      if (url) this.zone.run(() => this.router.navigateByUrl(url));
    });
  }

  private async obtenerTokenWeb(): Promise<string | null> {
    try {
      console.log('[FCM] Permiso actual:', Notification.permission);

      if (Notification.permission === 'denied') {
        console.warn('[FCM] Permiso bloqueado — no se puede obtener token');
        await this.mostrarToastBloqueo();
        return null;
      }

      const permission = await Notification.requestPermission();
      console.log('[FCM] Resultado del permiso:', permission);
      if (permission !== 'granted') return null;

      const registration = await navigator.serviceWorker.register(
        './firebase-messaging-sw.js', { scope: '/' }
      );
      await navigator.serviceWorker.ready;
      console.log('[FCM] Service Worker registrado');

      const token = await getToken(getMessaging(this.firebaseApp), {
        vapidKey: this.VAPID_KEY,
        serviceWorkerRegistration: registration
      });

      if (token) {
        console.log('[FCM] Token obtenido:', token);
      } else {
        console.warn('[FCM] getToken() devolvió vacío');
      }

      return token || null;
    } catch (err) {
      console.error('[FCM] Error obteniendo token:', err);
      return null;
    }
  }

  private escuchaWeb() {
    try {
      onMessage(getMessaging(this.firebaseApp), async (payload) => {
        console.log('[FCM] onMessage recibido:', payload);
        if (!payload.notification) {
          console.warn('[FCM] payload.notification es null — mensaje ignorado');
          return;
        }
        await this.mostrarToast(
          payload.notification.title ?? 'Aviso',
          payload.notification.body ?? '',
          payload.data?.['tipo'],
          payload.data?.['url']
        );
      });
      console.log('[FCM] Escucha web registrada');
    } catch (e) {
      console.warn('[FCM] Error registrando listener web:', e);
    }
  }

  private async mostrarToast(titulo: string, cuerpo: string, tipo?: string, url?: string) {
    let color = 'tertiary';
    let icon = 'notifications-outline';
    if (tipo === 'mensaje') { color = 'secondary'; icon = 'chatbubbles-outline'; }
    else if (tipo === 'ticket') { color = 'warning'; icon = 'ticket-outline'; }

    const toast = await this.toastController.create({
      header: titulo,
      message: cuerpo,
      duration: 8000,
      position: 'top',
      color,
      icon,
      buttons: [
        {
          text: 'VER',
          handler: () => {
            if (url) this.zone.run(() => this.router.navigateByUrl(url));
          }
        },
        { text: 'Cerrar', role: 'cancel' }
      ]
    });
    await toast.present();
  }

  private async mostrarToastBloqueo() {
    const toast = await this.toastController.create({
      message: 'Las notificaciones están bloqueadas. Habilitálas en el ícono de ajustes junto a la URL.',
      duration: 6000,
      position: 'top',
      color: 'warning',
      icon: 'notifications-off-outline'
    });
    await toast.present();
  }
}
