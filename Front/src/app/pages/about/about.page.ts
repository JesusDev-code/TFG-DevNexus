import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonGrid, IonRow, IonCol, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { rocketOutline, eyeOutline, peopleOutline, ribbonOutline, bulbOutline } from 'ionicons/icons';

@Component({
  selector: 'app-sobre-nosotros',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    CommonModule
  ]
})
export class SobreNosotrosPage {
  constructor() {
    addIcons({ 
      rocketOutline, 
      eyeOutline, 
      peopleOutline, 
      ribbonOutline, 
      bulbOutline 
    });
  }
}