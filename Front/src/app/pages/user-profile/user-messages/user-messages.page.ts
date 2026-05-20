import { Component, inject, effect, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IonicModule, AlertController, ToastController, ModalController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  send, personAddOutline, closeOutline, searchOutline,
  trashOutline, happyOutline, chatbubblesOutline,
  chevronBackOutline, peopleOutline, filterOutline
} from 'ionicons/icons';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from 'src/app/services/chat.service';
import { AuthService } from 'src/app/services/auth.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ConversacionDto, MensajeDto, UsuarioDto } from 'src/app/core/models/models';

import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-user-messages',
  templateUrl: './user-messages.page.html',
  styleUrls: ['./user-messages.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ScrollingModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserMessagesPage {
  private chatService = inject(ChatService);
  private modalCtrl = inject(ModalController);
  public authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  conversaciones = signal<ConversacionDto[]>([]);
  conversacionSeleccionada = signal<ConversacionDto | null>(null);
  mensajes = signal<MensajeDto[]>([]);

  filtroChats = signal('');
  mostrarBuscador = signal(false);
  mostrarEmojiPicker = signal(false);

  usuariosEncontrados = signal<UsuarioDto[]>([]);
  searchQuery = signal('');
  departamentos = signal<any[]>([]);
  departamentoSeleccionado = signal<number | null>(null);

  nuevoMensaje = signal('');
  miId = signal<number | null>(null);
  emojiList = ['😀', '😂', '😍', '👍', '🙌', '🔥', '🚀', '👏', '✅', '💡'];

  conversacionesFiltradas = computed(() => {
    const term = this.filtroChats().toLowerCase().trim();
    const todas = this.conversaciones();

    if (!term) return todas;
    return todas.filter(c => c.titulo.toLowerCase().includes(term));
  });

  constructor() {
    addIcons({
      send, personAddOutline, closeOutline, searchOutline,
      trashOutline, happyOutline, chatbubblesOutline,
      chevronBackOutline, peopleOutline, filterOutline
    });

    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.miId.set(user.id);
        this.cargarConversaciones();
        this.cargarDepartamentos();
      }
    });

    effect(() => {
      const query = this.searchQuery();
      const dpto = this.departamentoSeleccionado();

      if (query || dpto !== null) {
        this.ejecutarBusqueda(query, dpto);
      } else {
        this.usuariosEncontrados.set([]);
      }
    });

    this.route.queryParams.subscribe(params => {
      if (params['userId'] && params['nombre']) {
        const usuario = { id: Number(params['userId']), nombre: params['nombre'] } as any;
        this.abrirChatDirecto(usuario);
        this.router.navigate([], { replaceUrl: true, queryParams: {} });
      }
    });
  }

  cargarConversaciones() {
    this.chatService.getConversaciones().subscribe({
      next: (res) => this.conversaciones.set(res),
      error: (err) => console.error('Error cargando convers:', err)
    });
  }

  cargarDepartamentos() {
    this.http.get<any[]>(`${this.apiUrl}/usuarios/departamentos`).subscribe({
      next: (res) => this.departamentos.set(res),
      error: (err) => console.error('Error cargando departamentos', err)
    });
  }

  seleccionarConversacion(conv: ConversacionDto) {
    this.conversacionSeleccionada.set(conv);
    this.mostrarEmojiPicker.set(false);

    if (conv.unreadCount && conv.unreadCount > 0) {
      this.chatService.marcarComoLeido(conv.id).subscribe();
      this.conversaciones.update(prev =>
        prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c)
      );
    }

    this.chatService.getMensajes(conv.id).subscribe(msgs => {
      this.mensajes.set(msgs);
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  deseleccionarConversacion() {
    this.conversacionSeleccionada.set(null);
  }

  toggleBuscador() {
    this.mostrarBuscador.update(v => !v);
    this.searchQuery.set('');
    this.usuariosEncontrados.set([]);
    this.departamentoSeleccionado.set(null);
  }

  toggleEmojiPicker() {
    this.mostrarEmojiPicker.update(v => !v);
  }

  setFiltroChats(e: any) {
    this.filtroChats.set(e.target.value);
  }

  setSearchQuery(e: any) {
    this.searchQuery.set(e.target.value);
  }

  setDepartamento(id: number | null) {
    this.departamentoSeleccionado.set(id);
  }

  ejecutarBusqueda(term: string, dptoId: number | null) {
    const cleanTerm = term.trim();

    if (cleanTerm) {
      this.usuarioService.buscar(cleanTerm).subscribe({
        next: (res) => {
          let filtrados = res.filter(u => u.id !== this.miId());
          if (dptoId !== null) {
            filtrados = filtrados.filter(u => u.departamentoId == dptoId);
          }
          this.usuariosEncontrados.set(filtrados);
        },
        error: () => this.usuariosEncontrados.set([])
      });
    } else if (dptoId !== null) {
      this.http.get<UsuarioDto[]>(`${this.apiUrl}/usuarios/por-departamento/${dptoId}`).subscribe({
        next: (res) => {
          this.usuariosEncontrados.set(res.filter(u => u.id !== this.miId()));
        },
        error: () => this.usuariosEncontrados.set([])
      });
    }
  }

  private abrirChatDirecto(u: { id: number; nombre: string }) {
    this.chatService.crearConversacion(`Chat con ${u.nombre}`, 'individual', u.id).subscribe({
      next: (nuevoChat) => {
        const existe = this.conversaciones().find(c => c.id === nuevoChat.id);
        if (!existe) {
          this.conversaciones.update(prev => [nuevoChat, ...prev]);
        }
        this.seleccionarConversacion(existe ?? nuevoChat);
      },
      error: () => this.presentToast('Error al abrir el chat', 'danger')
    });
  }

  iniciarChatCon(u: UsuarioDto) {
    this.chatService.crearConversacion(`Chat con ${u.nombre}`, 'individual', u.id).subscribe({
      next: (nuevoChat) => {
        const currentConvos = this.conversaciones();
        const existe = currentConvos.find(c => c.id === nuevoChat.id);

        if (!existe) {
          this.conversaciones.update(prev => [nuevoChat, ...prev]);
          this.seleccionarConversacion(nuevoChat);
        } else {
          this.seleccionarConversacion(existe);
        }

        this.toggleBuscador();
      },
      error: () => this.presentToast('Error al crear chat', 'danger')
    });
  }

  addEmoji(emoji: string) {
    this.nuevoMensaje.update(v => v + emoji);
  }

  enviarMensaje() {
    const texto = this.nuevoMensaje().trim();
    const currentChat = this.conversacionSeleccionada();

    if (!texto || !currentChat) return;

    this.nuevoMensaje.set('');

    const user = this.authService.currentUser();
    const tempId = -Date.now();
    const mensajeOptimista: MensajeDto = {
      id: tempId,
      texto,
      autorId: this.miId()!,
      autorNombre: user?.nombre ?? '',
      autorFoto: user?.foto_perfil,
      fechaEnvio: new Date().toISOString(),
      esStaff: false,
      leido: true
    };

    this.mensajes.update(prev => [...prev, mensajeOptimista]);
    this.conversaciones.update(prev =>
      prev.map(c => c.id === currentChat.id ? { ...c, ultimoMensaje: texto } : c)
    );
    setTimeout(() => this.scrollToBottom(), 150);

    this.chatService.enviarMensaje({
      conversacionId: currentChat.id,
      texto
    }).subscribe({
      next: (msg) => {
        this.mensajes.update(prev => prev.map(m => m.id === tempId ? msg : m));
      },
      error: () => {
        this.mensajes.update(prev => prev.filter(m => m.id !== tempId));
        this.presentToast('Error al enviar', 'danger');
      }
    });
  }

  async eliminarConversacion(id: number) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar chat',
      message: '¿Estás seguro de que quieres borrar este chat?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar', role: 'destructive',
          handler: () => {
            this.chatService.eliminarConversacion(id).subscribe(() => {
              this.conversaciones.update(prev => prev.filter(c => c.id !== id));
              this.conversacionSeleccionada.set(null);
              this.presentToast('Chat eliminado', 'success');
            });
          }
        }
      ]
    });
    await alert.present();
  }

  private scrollToBottom() {
    try {
      const element = document.querySelector('.messages-scroll');
      if (element) element.scrollTop = element.scrollHeight;
    } catch (err) { }
  }

  esPropio(msg: MensajeDto): boolean {
    return msg.autorId === this.miId();
  }

  async presentToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, color, position: 'bottom' });
    t.present();
  }
}
