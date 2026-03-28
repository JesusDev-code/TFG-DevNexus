import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, OnInit, Output, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonRow,
  IonText,
  ToastController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { RiveCanvas, RiveSMInput, RiveStateMachine } from 'ng-rive';
import { AuthService } from 'src/app/services/auth.service';
import { UsuarioCreateDto } from 'src/app/core/models/models';
import { addIcons } from 'ionicons';
import { logoGoogle, personOutline, arrowForwardOutline, closeOutline } from 'ionicons/icons';

@Component({
  selector: 'cr-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonText,
    IonItem,
    IonImg,
    IonInput,
    IonIcon,
    IonRow,
    IonButton,
    FormsModule,
    RiveCanvas,
    RiveStateMachine,
    RiveSMInput,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignInComponent implements OnInit {
  @Output() onClose = new EventEmitter();

  email = '';
  password = '';
  nombre = '';

  isLoading = false;
  isRegister = false;

  public authService = inject(AuthService);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    addIcons({ logoGoogle, personOutline, arrowForwardOutline, closeOutline });
  }

  ngOnInit() {}

  onSubmit(success: any, failure: any, reset: any, confetti: any) {
    if (this.isRegister) {
      this.doRegister(success, failure, reset, confetti);
    } else {
      this.doLogin(success, failure, reset, confetti);
    }
  }

  doLogin(success: any, failure: any, reset: any, confetti: any) {
    // ✅ RESET INICIAL: Limpiamos estado anterior (quita la X si estaba)
    reset?.fire(); 

    if (!this.email.trim() || !this.password.trim()) {
      this.presentToast('Faltan datos', 'warning');
      this.isLoading = true; // Mostramos Rive para que se vea el error
      setTimeout(() => { failure?.fire(); }, 50); // Pequeño delay para asegurar que reset ocurrió
      setTimeout(() => { this.isLoading = false; this.cdr.markForCheck(); }, 2000); // Ocultamos tras error
      return;
    }

    this.isLoading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: () => this.handleSuccess(success, confetti),
      error: (err) => this.handleError(err, failure, reset)
    });
  }

  doRegister(success: any, failure: any, reset: any, confetti: any) {
    // ✅ RESET INICIAL
    reset?.fire();

    if (!this.nombre.trim() || !this.email.trim() || !this.password.trim()) {
      this.presentToast('Completa todos los campos', 'warning');
      this.isLoading = true;
      setTimeout(() => { failure?.fire(); }, 50);
      setTimeout(() => { this.isLoading = false; this.cdr.markForCheck(); }, 2000);
      return;
    }

    this.isLoading = true;
    const nuevoUsuario: UsuarioCreateDto = {
      nombre: this.nombre,
      email: this.email,
      rolId: 2, 
    };

    this.authService.register(nuevoUsuario, this.password).subscribe({
      next: async () => {
        await this.authService.logout();
        this.handleSuccess(success, confetti);
      },
      error: (err) => this.handleError(err, failure, reset)
    });
  }

  // ✅ AÑADIDO argumento 'reset'
  async onGoogleLogin(success: any, failure: any, reset: any, confetti: any) {
    // ✅ RESET INICIAL: Clave para evitar la "X" fantasma
    reset?.fire();
    this.isLoading = true;

    try {
      await this.authService.loginWithGoogle();
      
      this.ngZone.run(() => {
        this.handleSuccess(success, confetti);
      });

    } catch (error: any) {
      this.ngZone.run(() => {
        console.error('Google Login Error:', error);
        
        this.isLoading = false;
        // Solo mostramos animación de error si NO fue cancelación por usuario
        // para no ser molestos
        const errStr = JSON.stringify(error).toLowerCase();
        if (errStr.includes('close') || errStr.includes('cancel') || errStr.includes('popup')) {
           this.presentToast('Inicio de sesión cancelado', 'medium');
        } else {
           failure?.fire();
           this.presentToast('No se pudo iniciar con Google', 'danger');
        }
        this.cdr.markForCheck();
      });
    }
  }

  onRecoverPassword() {
    if (!this.email.trim()) {
      this.presentToast('Escribe tu email primero para recuperarla', 'warning');
      return;
    }
    this.isLoading = true;
    this.authService.recuperarContrasena(this.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.presentToast('✅ Correo de recuperación enviado. Revisa tu bandeja.', 'success');
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.presentToast('Error. Verifica que el email sea correcto.', 'danger');
        this.cdr.markForCheck();
      }
    });
  }

  handleSuccess(success: any, confetti: any) {
    success?.fire();
    confetti?.fire();
    setTimeout(() => {
      this.isLoading = false;
      if (this.isRegister) {
        this.presentToast('¡Cuenta creada! Inicia sesión para continuar.', 'success');
        this.isRegister = false;
        this.password = '';
      } else {
        this.onSignInClose();
        if (this.authService.isAdmin) {
          this.router.navigate(['/admin-profile']);
        } else {
          this.router.navigate(['/user-profile']);
        }
      }
      this.cdr.markForCheck();
    }, 2000);
  }

  handleError(err: any, failure: any, reset: any) {
    console.error('Auth Error:', err);
    
    // Mantenemos la carga un momento para ver la X, luego ocultamos
    failure?.fire();
    setTimeout(() => {
      this.isLoading = false;
      reset?.fire(); // Dejamos limpio para la próxima
      this.cdr.markForCheck();
    }, 2000);

    let msg = '';

    if (this.isRegister) {
      const errorString = JSON.stringify(err).toLowerCase();
      const messageString = err.error?.message?.toLowerCase() || '';

      if (
        err.status === 409 || 
        errorString.includes('exist') || 
        errorString.includes('taken') || 
        errorString.includes('already') ||
        messageString.includes('duplicate')
      ) {
        msg = 'Este correo ya está registrado. Por favor, inicia sesión.';
      } else if (errorString.includes('password') || errorString.includes('weak')) {
        msg = 'La contraseña es demasiado débil.';
      } else {
        msg = 'Error al crear la cuenta. Verifica tus datos.';
      }

    } else {
      msg = 'Credenciales incorrectas. Verifica tu correo y contraseña.';
    }

    this.presentToast(msg, 'danger');
  }

  toggleMode() {
    this.isRegister = !this.isRegister;
  }

  onSignInClose() {
    this.onClose.emit();
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color: color,
      position: 'top'
    });
    toast.present();
  }
}