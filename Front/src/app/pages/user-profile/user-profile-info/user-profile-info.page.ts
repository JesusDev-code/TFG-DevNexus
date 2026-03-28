import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import {
  IonIcon, IonModal, IonToggle, ToastController
} from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { UsuarioUpdateDto } from 'src/app/core/models/models';
import { addIcons } from 'ionicons';
import {
  cameraOutline, saveOutline, businessOutline,
  alertCircleOutline, checkmarkCircleOutline, eyeOffOutline,
  codeSlashOutline, desktopOutline, serverOutline, layersOutline,
  refreshOutline, closeOutline, checkmarkOutline // Añadido checkmark
} from 'ionicons/icons';

@Component({
  selector: 'app-user-profile-info',
  templateUrl: './user-profile-info.page.html',
  styleUrls: ['./user-profile-info.page.scss'],
  standalone: true,
  imports: [
    IonIcon, IonModal, IonToggle, CommonModule, FormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfileInfoPage implements OnInit {
  private authService = inject(AuthService);
  private toastCtrl = inject(ToastController);
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private cdr = inject(ChangeDetectorRef);

  avataresDisponibles = [
    'assets/avatars/avatar1.png', 'assets/avatars/avatar2.png',
    'assets/avatars/avatar3.png', 'assets/avatars/avatar4.png',
    'assets/avatars/avatar5.png', 'assets/avatars/avatar6.png'
  ];

  departamentos: any[] = [];

  formData = {
    nombre: '',
    email: '',
    biografia: '',
    foto_perfil: '',
    permiteContacto: true,
    motivoNoContacto: '',
    departamentoId: null as number | null
  };

  // 🔥 NUEVO: Variable para la selección temporal en el modal
  avatarTemporal: string = '';

  inicial: string = '?';
  isLoading = false;

  constructor() {
    addIcons({
      cameraOutline, saveOutline, businessOutline,
      alertCircleOutline, checkmarkCircleOutline, eyeOffOutline,
      codeSlashOutline, desktopOutline, serverOutline, layersOutline,
      refreshOutline, closeOutline, checkmarkOutline
    });
  }

  ngOnInit() {
    this.cargarDepartamentos();
    this.cargarDatosUsuario();
  }

  cargarDepartamentos() {
    this.http.get<any[]>(`${this.apiUrl}/usuarios/departamentos`).subscribe({
      next: (res) => { this.departamentos = res; this.cdr.markForCheck(); }
    });
  }

  cargarDatosUsuario() {
    const user = this.authService.currentUser();
    if (user) {
      this.formData.nombre = user.nombre;
      this.formData.email = user.email;
      this.formData.biografia = user.biografia || '';
      this.formData.foto_perfil = user.foto_perfil || '';
      this.formData.permiteContacto = user.permiteContacto ?? true;
      this.formData.motivoNoContacto = user.motivoNoContacto || '';
      this.formData.departamentoId = user.departamentoId || null;

      if (user.nombre) this.inicial = user.nombre.charAt(0).toUpperCase();
    }
  }

  getIconoRol(nombre: string): string {
    const n = nombre.toLowerCase();
    if (n.includes('front')) return 'desktop-outline';
    if (n.includes('back')) return 'server-outline';
    if (n.includes('full')) return 'layers-outline';
    return 'code-slash-outline';
  }

  seleccionarRol(id: number) { this.formData.departamentoId = id; }

  // 🔥 NUEVO: Se ejecuta al abrir el modal para resetear la selección
  iniciarSeleccionAvatar() {
    this.avatarTemporal = this.formData.foto_perfil;
  }

  // 🔥 MODIFICADO: Solo selecciona visualmente
  seleccionarAvatar(ruta: string) {
    this.avatarTemporal = ruta;
  }

  // 🔥 NUEVO: Confirma y cierra
  confirmarAvatar(modal: any) {
    this.formData.foto_perfil = this.avatarTemporal;
    modal.dismiss();
  }

  async guardarCambios() {
    if (!this.formData.nombre.trim()) {
      this.presentToast('El nombre es obligatorio', 'warning');
      return;
    }

    this.isLoading = true;

    const cambios: UsuarioUpdateDto = {
      nombre: this.formData.nombre,
      biografia: this.formData.biografia,
      foto_perfil: this.formData.foto_perfil,
      permiteContacto: this.formData.permiteContacto,
      motivoNoContacto: this.formData.motivoNoContacto,
      departamentoId: this.formData.departamentoId
    };

    this.authService.updateUserProfile(cambios).subscribe({
      next: () => {
        this.isLoading = false;
        this.presentToast('Perfil actualizado correctamente', 'success');
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.presentToast('Error al guardar cambios', 'danger');
        this.cdr.markForCheck();
      }
    });
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2500,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }
}