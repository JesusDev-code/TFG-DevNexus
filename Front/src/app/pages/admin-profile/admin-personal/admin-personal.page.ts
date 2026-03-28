import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, IonModal } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UsuarioDto, UsuarioUpdateDto } from 'src/app/core/models/models';
import { addIcons } from 'ionicons';
import { 
  cameraOutline, saveOutline, checkmarkCircleOutline, 
  codeSlashOutline, desktopOutline, serverOutline, layersOutline,
  alertCircleOutline, refreshOutline, closeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-admin-personal',
  templateUrl: './admin-personal.page.html',
  styleUrls: ['./admin-personal.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminPersonalPage implements OnInit {
  private http = inject(HttpClient);
  private toastCtrl = inject(ToastController);
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

  inicial: string = '?';
  isLoading = false;

  constructor() {
    addIcons({ 
      cameraOutline, saveOutline, checkmarkCircleOutline, 
      codeSlashOutline, desktopOutline, serverOutline, layersOutline,
      alertCircleOutline, refreshOutline, closeOutline
    });
  }

  ngOnInit() {
    this.cargarDepartamentos();
    this.cargarMiPerfil();
  }

  cargarDepartamentos() {
    this.http.get<any[]>(`${this.apiUrl}/usuarios/departamentos`).subscribe({
      next: (res) => { this.departamentos = res; this.cdr.markForCheck(); }
    });
  }

  cargarMiPerfil() {
    this.http.get<UsuarioDto>(`${this.apiUrl}/usuarios/perfil`).subscribe({
      next: (data) => {
        this.formData.nombre = data.nombre;
        this.formData.email = data.email;
        this.formData.biografia = data.biografia || '';
        this.formData.foto_perfil = data.foto_perfil || '';
        this.formData.permiteContacto = data.permiteContacto ?? true;
        this.formData.motivoNoContacto = data.motivoNoContacto || '';
        this.formData.departamentoId = data.departamentoId || null;

        if (this.formData.nombre) {
          this.inicial = this.formData.nombre.charAt(0).toUpperCase();
        }
        this.cdr.markForCheck();
      }
    });
  }

  getIconoRol(nombre: string): string {
    const n = nombre.toLowerCase();
    if (n.includes('front')) return 'desktop-outline';
    if (n.includes('back')) return 'server-outline';
    if (n.includes('full')) return 'layers-outline';
    return 'code-slash-outline';
  }

  seleccionarRol(id: number) { this.formData.departamentoId = id; }

  seleccionarAvatar(ruta: string, modal: IonModal) {
    this.formData.foto_perfil = ruta;
    setTimeout(() => modal.dismiss(), 250);
  }

  guardarCambios() {
    if (!this.formData.nombre.trim()) {
      this.presentToast('El nombre es obligatorio', 'warning');
      return;
    }
    
    this.isLoading = true;

    const updates: UsuarioUpdateDto = {
      nombre: this.formData.nombre,
      biografia: this.formData.biografia,
      foto_perfil: this.formData.foto_perfil,
      permiteContacto: this.formData.permiteContacto,
      motivoNoContacto: this.formData.motivoNoContacto,
      departamentoId: this.formData.departamentoId,
      rolId: undefined, 
      fcm_token: null
    };

    this.http.put(`${this.apiUrl}/usuarios/perfil`, updates).subscribe({
      next: () => {
        this.isLoading = false;
        this.presentToast('Perfil actualizado correctamente', 'success');
        this.cargarMiPerfil();
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
    const icon = color === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline';
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000, color, position: 'bottom', icon });
    toast.present();
  }
}