import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  shieldCheckmarkOutline, 
  fingerPrintOutline, 
  eyeOutline, 
  lockClosedOutline, 
  documentTextOutline,
  mailOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-privacidad',
  templateUrl: './privacidad.page.html',
  styleUrls: ['./privacidad.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule]
})
export class PrivacidadPage {
  constructor() {
    addIcons({ 
      shieldCheckmarkOutline, 
      fingerPrintOutline, 
      eyeOutline, 
      lockClosedOutline, 
      documentTextOutline,
      mailOutline
    });
  }
}