import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild, inject, OnDestroy, Input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonFooter, IonToolbar, IonIcon, IonHeader,
  IonTitle, IonButtons, IonBackButton, IonSpinner, IonButton,
  ModalController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { send, attachOutline, happyOutline, timeOutline, chatbubblesOutline, closeOutline, personCircleOutline, addCircleOutline, informationCircleOutline } from 'ionicons/icons';
import { SupportChatService } from 'src/app/services/support-chat.service';
import { AuthService } from 'src/app/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MensajeChat } from 'src/app/core/models/models';

@Component({
  selector: 'app-support-chat',
  templateUrl: './support-chat.page.html',
  styleUrls: ['./support-chat.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonFooter, IonToolbar, IonIcon, IonHeader, IonTitle, IonButtons, IonBackButton, IonSpinner, IonButton],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupportChatPage implements OnDestroy {
  @ViewChild(IonContent) content!: IonContent;

  @Input() esModal: boolean = false;
  @Input() adminViendoChatId: string | null = null;

  private chatService = inject(SupportChatService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private modalCtrl = inject(ModalController);
  private cdr = inject(ChangeDetectorRef);
  private toastCtrl = inject(ToastController);

  mensajes: MensajeChat[] = [];
  chatSubscription?: Subscription;

  nuevoMensaje = '';
  currentUser: any = null;
  chatId = '';
  esStaff = false;
  cargando = true;
  isGuest = false;
  chatCerrado = false;

  constructor() {
    addIcons({ send, attachOutline, happyOutline, timeOutline, chatbubblesOutline, closeOutline, personCircleOutline, addCircleOutline, informationCircleOutline });

    effect(() => {
      const user = this.authService.currentUser();
      if (!user) {
        this.isGuest = true;
        this.cargando = false;
        return;
      }

      this.isGuest = false;
      this.currentUser = user;
      this.esStaff = (user.rolNombre === 'ADMIN' || user.rolNombre === 'STAFF');

      const idUrl = this.route.snapshot.paramMap.get('userId');

      if (this.adminViendoChatId) {
        this.chatId = this.adminViendoChatId;
      } else if (this.esStaff && idUrl) {
        this.chatId = idUrl;
      } else {
        this.chatId = `user_${user.id}`;
      }

      this.chatService.getChat(this.chatId).subscribe(chat => {
        if (chat && chat.estado === 'RESUELTO') {
          this.chatCerrado = true;
        } else {
          this.chatCerrado = false;
        }
        this.cdr.markForCheck();
      });

      this.cargarMensajes();
    });
  }

  cargarMensajes() {
    this.cargando = true;
    if (this.chatSubscription) { this.chatSubscription.unsubscribe(); }

    this.chatSubscription = this.chatService.getChatMessages(this.chatId).subscribe({
      next: (data) => {
        this.mensajes = data;
        this.cargando = false;
        this.cdr.markForCheck();
        setTimeout(() => this.content?.scrollToBottom(300), 100);
      },
      error: (err) => {
        console.error('Error silencioso en chat:', err);
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  async enviar() {
    console.log('[SupportChat] enviar() llamado. Estado:', {
      texto: this.nuevoMensaje,
      currentUser: this.currentUser,
      isGuest: this.isGuest,
      chatCerrado: this.chatCerrado,
      chatId: this.chatId,
      esStaff: this.esStaff
    });

    if (!this.nuevoMensaje.trim()) {
      console.warn('[SupportChat] Early return: texto vacío');
      return;
    }
    if (!this.currentUser) {
      console.warn('[SupportChat] Early return: currentUser null');
      await this.mostrarToastError('No estás autenticado. Recargá la página.');
      return;
    }
    if (this.isGuest) {
      console.warn('[SupportChat] Early return: isGuest=true');
      await this.mostrarToastError('Modo invitado: iniciá sesión para escribir.');
      return;
    }
    if (this.chatCerrado) {
      console.warn('[SupportChat] Early return: chatCerrado=true');
      await this.mostrarToastError('El chat está cerrado. Iniciá un nuevo ticket.');
      return;
    }

    const texto = this.nuevoMensaje;
    this.nuevoMensaje = '';

    console.log('[SupportChat] Llamando sendMessage con chatId:', this.chatId);

    try {
      await this.chatService.sendMessage(
        this.chatId,
        texto,
        this.currentUser.id.toString(),
        this.currentUser.nombre,
        this.esStaff
      );
      console.log('[SupportChat] sendMessage OK');
      this.content?.scrollToBottom(300);
    } catch (err: any) {
      console.error('[SupportChat] Error enviando:', err);
      const msg = err?.code ? `Firestore error (${err.code}): ${err.message}` : (err?.message ?? 'Error desconocido al enviar');
      await this.mostrarToastError(msg);
      this.nuevoMensaje = texto;
    }
  }

  private async mostrarToastError(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 4000,
      position: 'top',
      color: 'danger'
    });
    await toast.present();
  }

  iniciarNuevoTicket() {
    this.chatService.reopenChat(this.chatId).then(() => {
      this.chatCerrado = false;
      this.cdr.markForCheck();
    });
  }

  trackByFn(index: number, item: MensajeChat): string {
    return item.id || index.toString();
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  ngOnDestroy() {
    if (this.chatSubscription) { this.chatSubscription.unsubscribe(); }
  }
}