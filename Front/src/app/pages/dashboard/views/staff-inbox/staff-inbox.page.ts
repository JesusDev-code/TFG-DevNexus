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
import { SupportChatPage } from '../support-chat/support-chat.page';

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
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  
  chats$!: Observable<ChatRoom[]>;

  constructor() { 
    addIcons({ chatbubblesOutline, checkmarkDoneOutline, trashOutline, checkmarkCircleOutline }); 
  }

  ngOnInit() {
    this.chats$ = this.chatService.getAllChats();
  }

  async abrirChat(chat: ChatRoom) {
    const modal = await this.modalCtrl.create({
      component: SupportChatPage,
      cssClass: 'chat-modal-widget',
      componentProps: {
        esModal: true,
        adminViendoChatId: chat.id
      }
    });
    await modal.present();
  }

  async resolverTicket(event: Event, chat: ChatRoom) {
    event.stopPropagation();
    await this.chatService.closeChat(chat.id);
    this.presentToast('Ticket marcado como resuelto ✅');
  }

  async borrarTicket(event: Event, chat: ChatRoom) {
    event.stopPropagation();
    
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