import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
  IonLabel,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { helpBuoyOutline, shieldCheckmarkOutline, chatbubblesOutline } from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.page.html',
  styleUrls: ['./faq.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonContent,
    IonAccordionGroup,
    IonAccordion,
    IonItem,
    IonLabel,
    IonIcon,
    CommonModule,
    FormsModule
  ]
})
export class FAQPage {
  
  private router = inject(Router);

  constructor() {
    addIcons({ helpBuoyOutline, shieldCheckmarkOutline, chatbubblesOutline });
  }


  goToPrivacy() {
    this.router.navigate(['/privacidad']);
  }

  goToContact() {
    this.router.navigate(['/contacto']);
  }
}