import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuditoriaDto } from 'src/app/core/models/models';
import { addIcons } from 'ionicons';
import {
  shieldCheckmarkOutline, alertCircleOutline,
  informationCircleOutline, searchOutline,
  timeOutline, personOutline, refreshOutline
} from 'ionicons/icons';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import {
  IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonSpinner, ToastController
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-admin-auditar',
  templateUrl: './admin-auditar.page.html',
  styleUrls: ['./admin-auditar.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonSpinner
  ]
})
export class AdminAuditarPage implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private toastCtrl = inject(ToastController);

  logs = signal<AuditoriaDto[]>([]);
  page = signal(0);
  size = 20;
  totalPages = signal(0);
  textoBusqueda = signal('');
  cargando = signal(false);
  private searchTimeout: any;

  allPagesLoaded = computed(() => this.totalPages() > 0 && this.page() >= this.totalPages() - 1);

  constructor() {
    addIcons({
      shieldCheckmarkOutline, alertCircleOutline,
      informationCircleOutline, searchOutline,
      timeOutline, personOutline, refreshOutline
    });
  }

  ngOnInit() { this.cargarLogs(true); }

  cargarLogs(reset: boolean = false, event?: any) {
    if (reset) { this.page.set(0); this.logs.set([]); this.cargando.set(true); }
    const url = `${this.apiUrl}/auditorias?page=${this.page()}&size=${this.size}&q=${this.textoBusqueda()}`;
    this.http.get<any>(url).pipe(
      timeout(10000),
      catchError(err => {
        this.cargando.set(false);
        if (event) event.target.complete();
        this.presentToast('Error al cargar auditoría', 'danger');
        return of(null);
      })
    ).subscribe({
      next: (res) => {
        if (!res) return;
        if (reset) this.logs.set(res.content);
        else this.logs.set([...this.logs(), ...res.content]);
        this.totalPages.set(res.totalPages);
        this.cargando.set(false);
        if (event) event.target.complete();
      },
      error: () => { this.cargando.set(false); if (event) event.target.complete(); }
    });
  }

  loadMore(event: any) {
    if (this.page() < this.totalPages() - 1) { this.page.set(this.page() + 1); this.cargarLogs(false, event); }
    else { event.target.disabled = true; }
  }

  buscar(event: any) {
    const valor = event.target.value;
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => { this.textoBusqueda.set(valor); this.cargarLogs(true); }, 500);
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 3000, color });
    await toast.present();
  }

  getIcon(severidad: string) {
    switch(severidad) {
      case 'DANGER': return 'alert-circle-outline';
      case 'WARNING': return 'information-circle-outline';
      default: return 'shield-checkmark-outline';
    }
  }

  getClass(severidad: string) { return severidad ? severidad.toLowerCase() : 'info'; }
}
