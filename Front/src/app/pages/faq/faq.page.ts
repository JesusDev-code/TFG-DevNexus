import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
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
// ✅ AÑADIDO 'chatbubblesOutline'
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
export class FAQPage implements OnInit {
  
  private router = inject(Router);

  constructor() {
    // ✅ REGISTRADO ICONO
    addIcons({ helpBuoyOutline, shieldCheckmarkOutline, chatbubblesOutline });
  }

  ngOnInit() {}

  goToPrivacy() {
    this.router.navigate(['/privacidad']);
  }

  // ✅ NUEVA FUNCIÓN
  goToContact() {
    this.router.navigate(['/contacto']);
  }
}