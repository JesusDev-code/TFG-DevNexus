import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { ChatService } from 'src/app/services/chat.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { AuthService } from 'src/app/services/auth.service';
import { ConversacionDto, MensajeDto, UsuarioDto } from 'src/app/core/models/models';
import { addIcons } from 'ionicons';
import {
  searchOutline, sendOutline, trashOutline,
  personAddOutline, chatbubbleEllipsesOutline,
  closeOutline, chevronBackOutline, arrowForwardOutline
} from 'ionicons/icons';

import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-admin-mensajes',
  templateUrl: './admin-mensajes.page.html',
  styleUrls: ['./admin-mensajes.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ScrollingModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminMensajesPage implements OnInit {
  private chatService = inject(ChatService);
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private cd = inject(ChangeDetectorRef);

  conversaciones: ConversacionDto[] = [];
  conversacionesFiltradas: ConversacionDto[] = [];
  conversacionSeleccionada: ConversacionDto | null = null;
  mensajes: MensajeDto[] = [];
  miId: number | null = null;
  filtroTexto = '';
  nuevoMensaje = '';
  mostrarBuscador = false;
  busquedaUsuario = '';
  usuariosEncontrados: UsuarioDto[] = [];

  constructor() {
    addIcons({ searchOutline, sendOutline, trashOutline, personAddOutline, chatbubbleEllipsesOutline, closeOutline, chevronBackOutline, arrowForwardOutline });
  }

  ngOnInit() {
    this.miId = this.authService.currentUser()?.id ?? null;
    this.cargarConversaciones();
  }

  cargarConversaciones() {
    this.chatService.getConversaciones().subscribe({
      next: (res) => {
        this.conversaciones = res;
        this.filtrarConversaciones();
        this.cd.markForCheck();
      },
      error: () => this.presentToast('Error al cargar chats', 'danger')
    });
  }

  filtrarConversaciones() {
    this.conversacionesFiltradas = !this.filtroTexto.trim() ? this.conversaciones : this.conversaciones.filter(c => c.titulo.toLowerCase().includes(this.filtroTexto.toLowerCase()));
    this.cd.markForCheck();
  }

  seleccionarChat(chat: ConversacionDto) {
    this.conversacionSeleccionada = chat;
    this.mostrarBuscador = false;
    if (chat.unreadCount! > 0) { this.chatService.marcarComoLeido(chat.id).subscribe(); chat.unreadCount = 0; }
    this.chatService.getMensajes(chat.id).subscribe(msgs => {
      this.mensajes = msgs;
      this.cd.markForCheck();
      this.scrollToBottom();
    });
  }

  cerrarChat() { this.conversacionSeleccionada = null; }

  enviarMensaje() {
    if (!this.nuevoMensaje.trim() || !this.conversacionSeleccionada) return;
    const texto = this.nuevoMensaje;
    this.nuevoMensaje = '';
    this.chatService.enviarMensaje({ conversacionId: this.conversacionSeleccionada.id, texto }).subscribe({
      next: (msg) => {
        this.mensajes.push(msg);
        this.cd.markForCheck();
        this.scrollToBottom();
        this.conversacionSeleccionada!.ultimoMensaje = texto;
      },
      error: () => this.presentToast('Error al enviar', 'danger')
    });
  }

  buscarUsuarios(event: any) {
    this.busquedaUsuario = event.target.value;
    if (this.busquedaUsuario.length < 3) {
      this.usuariosEncontrados = [];
      this.cd.markForCheck();
      return;
    }
    this.usuarioService.buscar(this.busquedaUsuario).subscribe({
      next: (res) => {
        this.usuariosEncontrados = res;
        this.cd.markForCheck();
      },
      error: () => this.presentToast('Error al buscar usuarios', 'danger')
    });
  }

  iniciarChatCon(usuario: UsuarioDto) {
    this.chatService.crearConversacion(`Chat con ${usuario.nombre}`, 'individual', usuario.id).subscribe(nuevoChat => {
      const existe = this.conversaciones.find(c => c.id === nuevoChat.id);
      if (!existe) { this.conversaciones.unshift(nuevoChat); this.filtrarConversaciones(); }
      this.seleccionarChat(existe || nuevoChat);
      this.mostrarBuscador = false; this.busquedaUsuario = ''; this.usuariosEncontrados = [];
    });
  }

  async confirmarEliminarChat(chat: ConversacionDto, event: Event) {
    event.stopPropagation();
    const alert = await this.alertCtrl.create({
      header: '¿Borrar conversación?',
      message: 'Esto eliminará el chat de tu lista.',
      buttons: [{ text: 'Cancelar', role: 'cancel' }, {
        text: 'Eliminar', role: 'destructive', handler: () => {
          this.chatService.eliminarConversacion(chat.id).subscribe(() => {
            this.conversaciones = this.conversaciones.filter(c => c.id !== chat.id);
            this.filtrarConversaciones();
            if (this.conversacionSeleccionada?.id === chat.id) this.conversacionSeleccionada = null;
            this.cd.markForCheck();
            this.presentToast('Chat eliminado', 'success');
          });
        }
      }]
    });
    await alert.present();
  }

  scrollToBottom() {
    setTimeout(() => {
      const content = document.getElementById('chat-scroll-area');
      if (content) content.scrollTop = content.scrollHeight;
    }, 150);
  }

  esMio(msg: MensajeDto): boolean { return msg.autorId === this.miId; }
  async presentToast(msg: string, color: string) { const toast = await this.toastCtrl.create({ message: msg, duration: 2000, color, position: 'bottom' }); toast.present(); }
}