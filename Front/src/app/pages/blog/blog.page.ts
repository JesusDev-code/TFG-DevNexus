import { Component, ChangeDetectionStrategy, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ Necesario para ngModel
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IonContent, IonGrid, IonRow, IonCol, IonIcon, IonSpinner, IonText, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline, timeOutline, lockClosedOutline,
  chatbubbleEllipsesOutline, sendOutline // ✅ Nuevos iconos
} from 'ionicons/icons';
import { DiarioService } from 'src/app/services/diario.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.page.html',
  styleUrls: ['./blog.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonSpinner, IonIcon, IonGrid, IonRow, IonCol],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogPage {
  private diarioService = inject(DiarioService);
  public authService = inject(AuthService);
  private http = inject(HttpClient);
  private toastCtrl = inject(ToastController);
  private apiUrl = environment.apiUrl;

  posts = signal<any[]>([]);
  cargando = signal(false);

  constructor() {
    // Registramos los iconos de comentarios
    addIcons({
      personOutline, timeOutline, lockClosedOutline,
      chatbubbleEllipsesOutline, sendOutline
    });

    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.cargarNoticias();
      } else {
        this.posts.set([]);
        this.cargando.set(false);
      }
    });
  }


  cargarNoticias() {
    this.cargando.set(true);
    this.diarioService.getEntradasPublicas().subscribe({
      next: (res) => {
        this.posts.set(res.content || []);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error cargando blog', err);
        this.cargando.set(false);
      }
    });
  }

  // --- LÓGICA DE COMENTARIOS (Copiada de UserDiary) ---

  toggleComentarios(post: any) {
    post.mostrarComentarios = !post.mostrarComentarios;
    this.posts.set([...this.posts()]);

    // Si abrimos y no hay comentarios cargados, los pedimos
    if (post.mostrarComentarios && !post.listaComentarios) {
      post.cargandoComentarios = true;
      this.posts.set([...this.posts()]);
      this.http.get<any[]>(`${this.apiUrl}/diarios/${post.id}/comentarios`).subscribe({
        next: (comentarios) => {
          post.listaComentarios = comentarios;
          post.cargandoComentarios = false;
          this.posts.set([...this.posts()]);
        },
        error: () => {
          post.cargandoComentarios = false;
          this.posts.set([...this.posts()]);
          this.presentToast('Error cargando comentarios', 'danger');
        }
      });
    }
  }

  enviarComentario(post: any) {
    if (!post.nuevoComentario?.trim()) return;
    const texto = post.nuevoComentario;
    post.nuevoComentario = ''; // Limpiar input visualmente rápido
    this.posts.set([...this.posts()]);

    this.http.post<any>(`${this.apiUrl}/diarios/${post.id}/comentarios`, { texto }).subscribe({
      next: (nuevo) => {
        if (!post.listaComentarios) post.listaComentarios = [];
        post.listaComentarios.push(nuevo);
        this.posts.set([...this.posts()]);
      },
      error: () => {
        post.nuevoComentario = texto; // Restaurar si falla
        this.posts.set([...this.posts()]);
        this.presentToast('Error al enviar comentario', 'danger');
      }
    });
  }

  private async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color, position: 'bottom' });
    toast.present();
  }

  // --- Funciones de estilo ---

  getClassAleatoria(id: number) {
    const clases = ['bg1', 'bg2', 'bg3', 'bg6'];
    const safeId = id || 0;
    return clases[safeId % clases.length];
  }

  getCategoria(post: any) { return post.temaTitulo || 'Update'; }

  getClassChip(post: any) {
    const id = post.id || 0;
    const clases = ['tutorial', 'design', 'perf', 'backend'];
    return clases[id % clases.length];
  }
}