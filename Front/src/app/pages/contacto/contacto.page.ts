import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline, callOutline, chatbubblesOutline, sendOutline } from 'ionicons/icons';

@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.page.html',
  styleUrls: ['./contacto.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonContent,
    IonIcon,
    CommonModule
  ]
})
export class ContactoPage {
  
  constructor() {
    addIcons({ 
      mailOutline, 
      callOutline, 
      chatbubblesOutline, 
      sendOutline 
    });
  }

  // Se ha eliminado la función openLiveChat() y las inyecciones de servicios
}