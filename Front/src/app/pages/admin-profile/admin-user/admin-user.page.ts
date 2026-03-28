import { Component, OnInit, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { UsuarioDto, UsuarioUpdateDto } from 'src/app/core/models/models';
import { UsuarioService } from 'src/app/services/usuario.service';
import { addIcons } from 'ionicons';
import {
  searchOutline, trashOutline, createOutline,
  closeOutline, saveOutline, eyeOffOutline,
  checkmarkCircle, ban
} from 'ionicons/icons';

@Component({
  selector: 'app-admin-user',
  templateUrl: './admin-user.page.html',
  styleUrls: ['./admin-user.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminUserPage implements OnInit {
  private usuarioService = inject(UsuarioService);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);

  // --- SIGNALS STATE ---
  usuarios = signal<UsuarioDto[]>([]);
  filtroTexto = signal('');
  departamentos = signal<any[]>([]);
  
  // Modal State
  modalAbierto = signal(false);
  usuarioEditando = signal<any>(null); // any temporal para edición flexible

  // --- COMPUTED SIGNALS ---
  usuariosFiltrados = computed(() => {
    const term = this.filtroTexto().toLowerCase().trim();
    const lista = this.usuarios();

    if (!term) return lista;

    return lista.filter(u =>
      u.nombre?.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.rolNombre && u.rolNombre.toLowerCase().includes(term))
    );
  });

  constructor() {
    addIcons({ searchOutline, trashOutline, createOutline, closeOutline, saveOutline, eyeOffOutline, checkmarkCircle, ban });
  }

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarDepartamentos();
  }

  cargarUsuarios() {
    this.usuarioService.getUsuarios().subscribe({
      next: (res) => this.usuarios.set(res),
      error: () => this.presentToast('Error cargando usuarios', 'danger')
    });
  }

  cargarDepartamentos() {
    this.usuarioService.getDepartamentos().subscribe({
      next: (res) => this.departamentos.set(res)
    });
  }

  setFiltro(event: any) {
    this.filtroTexto.set(event.target.value);
  }

  async confirmarBorrado(usuario: UsuarioDto) {
    if (usuario.rolNombre?.toUpperCase() === 'ADMIN') {
      this.presentToast('No puedes eliminar a un Administrador', 'warning');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: '¿Eliminar usuario?',
      message: 'Esta acción no se puede deshacer y el usuario perderá todo acceso.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar definitivamente',
          role: 'destructive',
          handler: () => {
            this.usuarioService.deleteUsuario(usuario.id).subscribe({
              next: () => {
                this.presentToast('Usuario eliminado', 'success');
                this.usuarios.update(prev => prev.filter(u => u.id !== usuario.id));
              },
              error: () => this.presentToast('Error al eliminar', 'danger')
            });
          }
        }
      ],
      cssClass: 'custom-alert'
    });
    await alert.present();
  }

  abrirModalEditar(usuario: UsuarioDto) {
    this.usuarioEditando.set({ ...usuario }); // Copia para editar
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
    this.usuarioEditando.set(null);
  }

  guardarEdicion() {
    const u = this.usuarioEditando();
    if (!u) return;

    // Mapeo simple de roles para el backend (ajustar según tu lógica real)
    let rolIdToSend = 1;
    const rol = u.rolNombre?.toUpperCase();
    if (rol === 'STAFF') rolIdToSend = 2;
    if (rol === 'ADMIN') rolIdToSend = 3;

    const updates: UsuarioUpdateDto = {
      nombre: u.nombre,
      biografia: u.biografia,
      foto_perfil: u.foto_perfil,
      permiteContacto: u.permiteContacto,
      motivoNoContacto: u.motivoNoContacto,
      rolId: rolIdToSend,
      departamentoId: u.departamentoId,
      fcm_token: null // No tocamos el token
    };

    this.usuarioService.updateUsuario(u.id, updates).subscribe({
      next: () => {
        this.presentToast('Usuario actualizado', 'success');
        this.cerrarModal();
        this.cargarUsuarios(); // Recargar lista para asegurar consistencia
      },
      error: () => this.presentToast('Error al actualizar', 'danger')
    });
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2500, color: color, position: 'bottom' });
    toast.present();
  }
}
