import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  authState,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  sendPasswordResetEmail
} from '@angular/fire/auth';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, from, switchMap, tap, take, map, finalize } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UsuarioDto, UsuarioCreateDto, UsuarioUpdateDto } from '../core/models/models';
import { FcmService } from './fcm.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private http = inject(HttpClient);
  private router = inject(Router);
  private fcmService = inject(FcmService);
  private apiUrl = environment.apiUrl;

  private _currentUser = signal<UsuarioDto | null>(null);
  currentUser = this._currentUser.asReadonly();
  private isRegistering = false;

  private authReadyResolver!: () => void;
  private authReadyPromise: Promise<void> = new Promise<void>((resolve) => {
    this.authReadyResolver = resolve;
  });
  private firstEmissionHandled = false;

  constructor() {
    authState(this.auth).subscribe((user) => {
      if (this.isRegistering) {
        this.markAuthReady();
        return;
      }

      if (user && !this._currentUser()) {
        this.http.get<UsuarioDto>(`${this.apiUrl}/usuarios/perfil`)
          .pipe(take(1))
          .subscribe({
            next: (usuarioDb) => {
              this._currentUser.set(usuarioDb);
              this.activarNotificaciones();
              this.markAuthReady();
            },
            error: () => {
              this.logout().subscribe();
              this.markAuthReady();
            }
          });
      } else {
        this.markAuthReady();
      }
    });
  }

  private markAuthReady(): void {
    if (this.firstEmissionHandled) return;
    this.firstEmissionHandled = true;
    this.authReadyResolver();
  }

  waitForAuthReady(): Promise<void> {
    return this.authReadyPromise;
  }

  get isAuthenticated(): boolean { return this._currentUser() !== null; }
  get isAdmin(): boolean {
    const rol = this._currentUser()?.rolNombre?.toUpperCase();
    return rol === 'ADMIN' || rol === 'STAFF';
  }

  login(email: string, pass: string): Observable<UsuarioDto | null> {
    return from(signInWithEmailAndPassword(this.auth, email, pass)).pipe(
      switchMap(() => this.http.get<UsuarioDto>(`${this.apiUrl}/usuarios/perfil`)),
      tap((usuarioDb) => {
        this._currentUser.set(usuarioDb);
        this.activarNotificaciones();
        this.redirectBasedOnRole(usuarioDb);
      })
    );
  }

  register(datos: UsuarioCreateDto, password: string): Observable<UsuarioDto> {
    this.isRegistering = true;
    return from(createUserWithEmailAndPassword(this.auth, datos.email, password)).pipe(
      switchMap((userCredential) => from(updateProfile(userCredential.user, { displayName: datos.nombre }))),
      switchMap(() => this.http.post<UsuarioDto>(`${this.apiUrl}/usuarios/registro`, datos)),
      switchMap((usuarioDb) => from(signOut(this.auth)).pipe(map(() => usuarioDb))),
      tap(() => console.log('Registro exitoso y sesión cerrada.')),
      finalize(() => { this.isRegistering = false; })
    );
  }

  updateUserProfile(datos: UsuarioUpdateDto): Observable<UsuarioDto> {
    return this.http.put<UsuarioDto>(`${this.apiUrl}/usuarios/perfil`, datos).pipe(
      tap((usuarioActualizado) => {
        const current = this._currentUser();
        if (current) this._currentUser.set({ ...current, ...usuarioActualizado });
      })
    );
  }

  logout() {
    return from(signOut(this.auth)).pipe(
      tap(() => {
        this.fcmService.resetear();
        this._currentUser.set(null);
        this.router.navigate(['/dashboard']);
      })
    );
  }

  logoutNoRedirect() {
    return from(signOut(this.auth)).pipe(tap(() => {
      this.fcmService.resetear();
      this._currentUser.set(null);
    }));
  }

  recuperarContrasena(email: string): Observable<void> {
    return from(sendPasswordResetEmail(this.auth, email));
  }

  async loginWithGoogle() {
    this.isRegistering = true;
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(this.auth, provider);
      const user = credential.user;
      const usuarioDb = await this.syncWithBackend(user);
      this.redirectBasedOnRole(usuarioDb);
      return usuarioDb;
    } catch (error) {
      console.error('Error en Google Login', error);
      throw error;
    } finally {
      this.isRegistering = false;
    }
  }

  private async syncWithBackend(firebaseUser: User): Promise<UsuarioDto> {
    const token = await firebaseUser.getIdToken();
    const body = {
      email: firebaseUser.email,
      nombre: firebaseUser.displayName || 'Usuario Google',
      foto: firebaseUser.photoURL
    };

    return new Promise((resolve, reject) => {
      this.http.post<UsuarioDto>(`${this.apiUrl}/auth/google`, body, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).subscribe({
        next: (usuarioDeDB) => {
          this._currentUser.set(usuarioDeDB);
          this.activarNotificaciones();
          resolve(usuarioDeDB);
        },
        error: (err) => reject(err)
      });
    });
  }

  private redirectBasedOnRole(usuario: UsuarioDto) {
    const rol = usuario.rolNombre?.toUpperCase();
    if (rol === 'ADMIN' || rol === 'STAFF') {
      this.router.navigate(['/admin-profile']);
    } else {
      this.router.navigate(['/user-profile']);
    }
  }

  private activarNotificaciones() {
  }
}