import { Injectable, inject, NgZone } from '@angular/core'; // ✅ Añadido NgZone
import { environment } from 'src/environments/environment';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { ToastController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class FcmService {
  private app = initializeApp(environment.firebase);
  private messaging = getMessaging(this.app);
  
  private toastController = inject(ToastController); 
  private router = inject(Router);
  private zone = inject(NgZone); // ✅ Inyectamos NgZone para forzar la navegación

  private readonly VAPID_KEY = 'BIwjZcyS8a_rS1hNzyB9j6-SBCwzqOfR4qrUWtQMNkCOd3ovWX_-LGYhWmo1hk1S-fGsL_KohgH2xoBfO1RB1ug'; 
  private tokenYaSolicitado = false;

  async obtenerToken(): Promise<string | null> {
    if (this.tokenYaSolicitado) return null;
    this.tokenYaSolicitado = true;

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return null;

      const registration = await navigator.serviceWorker.register('./firebase-messaging-sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;

      const token = await getToken(this.messaging, {
        vapidKey: this.VAPID_KEY,
        serviceWorkerRegistration: registration
      });

      return token || null;
    } catch (err) {
      console.error('❌ Error FCM:', err);
      return null;
    }
  }

  iniciarEscucha() {
    try {
      onMessage(this.messaging, async (payload) => {
        console.log('🔔 Notificación recibida:', payload);
        
        if (payload.notification) {
          const data = payload.data || {};
          const tipo = data['tipo'];
          const url = data['url'];

          let color = 'tertiary'; 
          let icon = 'notifications-outline';

          if (tipo === 'mensaje') {
            color = 'secondary'; 
            icon = 'chatbubbles-outline';
          } else if (tipo === 'ticket') {
            color = 'warning'; 
            icon = 'ticket-outline';
          }

          const toast = await this.toastController.create({
            header: payload.notification.title,
            message: payload.notification.body,
            duration: 8000,
            position: 'top',
            color: color, 
            icon: icon,
            buttons: [
              {
                text: 'VER',
                handler: () => {
                  // ✅ SOLUCIÓN DEFINITIVA: Ejecutamos dentro de la Zona de Angular
                  this.zone.run(() => {
                    if (url) {
                      console.log('🚀 Navegando a:', url);
                      this.router.navigateByUrl(url).catch(err => {
                        console.error('❌ Error al navegar:', err);
                      });
                    } else {
                      console.warn('⚠️ No se recibió URL en la notificación');
                    }
                  });
                }
              },
              { text: 'Cerrar', role: 'cancel' }
            ]
          });
          await toast.present();
        }
      });
    } catch (e) {
      console.warn('Error listener:', e);
    }
  }
}