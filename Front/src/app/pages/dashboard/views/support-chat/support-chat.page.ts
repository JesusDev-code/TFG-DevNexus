import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild, inject, OnDestroy, Input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonFooter, IonToolbar, IonIcon, IonHeader,
  IonTitle, IonButtons, IonBackButton, IonSpinner, IonButton,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { send, attachOutline, happyOutline, timeOutline, chatbubblesOutline, closeOutline, personCircleOutline, addCircleOutline } from 'ionicons/icons';
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
    addIcons({ send, attachOutline, happyOutline, timeOutline, chatbubblesOutline, closeOutline, personCircleOutline, addCircleOutline });

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

  enviar() {
    if (!this.nuevoMensaje.trim() || !this.currentUser || this.isGuest || this.chatCerrado) return;

    const texto = this.nuevoMensaje;
    this.nuevoMensaje = '';

    this.chatService.sendMessage(
      this.chatId,
      texto,
      this.currentUser.id.toString(),
      this.currentUser.nombre,
      this.esStaff
    ).then(() => {
      this.content?.scrollToBottom(300);
    }).catch(err => {
      console.error('Error enviando:', err);
    });
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