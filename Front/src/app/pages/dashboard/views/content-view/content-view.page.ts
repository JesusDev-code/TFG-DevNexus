import { Component, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonGrid, IonRow, IonCol, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { copyOutline, schoolOutline, peopleOutline } from 'ionicons/icons';

@Component({
  selector: 'cr-content-view',
  templateUrl: './content-view.page.html',
  styleUrls: ['./content-view.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [IonContent, IonGrid, IonRow, IonCol, IonIcon, CommonModule],
})
export class ContentViewPage implements AfterViewInit {
  // Referencia al video en el HTML
  @ViewChild('heroVideo') videoElement!: ElementRef<HTMLVideoElement>;

  cards = [
    { title: 'Documenta', desc: 'Crea un historial impecable de tus avances.', icon: 'copy-outline' },
    { title: 'Mentoría', desc: 'Conecta con expertos que elevarán tu calidad.', icon: 'school-outline' },
    { title: 'Conecta', desc: 'Forma parte de una red de desarrolladores.', icon: 'people-outline' }
  ];

  constructor() {
    addIcons({ copyOutline, schoolOutline, peopleOutline });
  }


  ngAfterViewInit() {
    // Intentamos reproducir el video en cuanto la vista esté lista
    if (this.videoElement) {
      const video = this.videoElement.nativeElement;
      video.muted = true; // El autoplay requiere que esté silenciado
      
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log("Video reproduciéndose correctamente");
        }).catch(error => {
          console.log("Auto-reproducción bloqueada por el navegador, reintentando...", error);
        });
      }
    }
  }

  // ✅ NUEVA FUNCIÓN AÑADIDA
  triggerOnboarding() {
    // Dispara un evento global que el AppShell puede escuchar
    window.dispatchEvent(new CustomEvent('open-onboarding-modal'));
  }
}