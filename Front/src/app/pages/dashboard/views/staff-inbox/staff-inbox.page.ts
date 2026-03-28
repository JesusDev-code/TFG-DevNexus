import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
 IonList, IonItem,
  IonIcon, IonButton, ModalController, AlertController, ToastController 
} from '@ionic/angular/standalone';
import { Observable } from 'rxjs';
import { addIcons } from 'ionicons';
import { chatbubblesOutline, checkmarkDoneOutline, trashOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { SupportChatService } from 'src/app/services/support-chat.service';
import { ChatRoom } from 'src/app/core/models/models';
import { SupportChatPage } from '../support-chat/support-chat.page'; // Importamos la página para usarla de modal

@Component({
  selector: 'app-staff-inbox',
  templateUrl: './staff-inbox.page.html',
  styleUrls: ['./staff-inbox.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonList, 
    IonItem, 

    IonIcon,
    IonButton
  ]
})
export class StaffInboxPage implements OnInit {
  private chatService = inject(SupportChatService);
  private modalCtrl = inject(ModalController); // ✅ Para abrir ventana
  private alertCtrl = inject(AlertController); // ✅ Para confirmar borrado
  private toastCtrl = inject(ToastController); // ✅ Para avisar
  
  chats$!: Observable<ChatRoom[]>;

  constructor() { 
    addIcons({ chatbubblesOutline, checkmarkDoneOutline, trashOutline, checkmarkCircleOutline }); 
  }

  ngOnInit() {
    this.chats$ = this.chatService.getAllChats();
  }

  // ✅ 1. ABRIR CHAT EN VENTANA FLOTANTE (Igual que el usuario)
  async abrirChat(chat: ChatRoom) {
    const modal = await this.modalCtrl.create({
      component: SupportChatPage,
      cssClass: 'chat-modal-widget', // Usamos la misma clase CSS bonita
      componentProps: { 
        esModal: true, // Le decimos que es modal
        // Ojo: SupportChatPage coge el ID de la URL o del usuario logueado.
        // Como aquí somos ADMIN viendo a OTRO, necesitamos pasarle el ID manualmente.
        // Vamos a tener que hacer un pequeño ajuste en SupportChatPage.ts (PASO 4 abajo)
        adminViendoChatId: chat.id 
      }
    });
    await modal.present();
  }

  // ✅ 2. MARCAR COMO RESUELTO
  async resolverTicket(event: Event, chat: ChatRoom) {
    event.stopPropagation(); // Evita que se abra el chat al pulsar el botón
    await this.chatService.closeChat(chat.id);
    this.presentToast('Ticket marcado como resuelto ✅');
  }

  // ✅ 3. BORRAR CHAT
  async borrarTicket(event: Event, chat: ChatRoom) {
    event.stopPropagation(); // Evita que se abra el chat
    
    const alert = await this.alertCtrl.create({
      header: '¿Borrar conversación?',
      message: 'Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Borrar', 
          role: 'destructive',
          handler: async () => {
            await this.chatService.deleteChat(chat.id);
            this.presentToast('Conversación eliminada 🗑️');
          }
        }
      ]
    });
    await alert.present();
  }

  async presentToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      position: 'bottom',
      color: 'dark'
    });
    toast.present();
  }
}