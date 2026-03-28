import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { registerLicense } from '@syncfusion/ej2-base';
import { RIVE_FOLDER } from 'ng-rive';
import { provideMarkdown } from 'ngx-markdown';

// --- IMPORTACIONES DE FIREBASE ---
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideMessaging, getMessaging } from '@angular/fire/messaging'; // ✅ AÑADIDO

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';

registerLicense('Ngo9BigBOggjHTQxAR8/V1JFaF1cWGhIfEx1RHxQdld5ZFRHallYTnNWUj0eQnxTdEBiWH5ecXVUQ2RaUk12XkleYg==');

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    
    provideHttpClient(
      withInterceptors([authInterceptor]) 
    ),

    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideMessaging(() => getMessaging()), // ✅ CLAVE: Esto evita la pantalla blanca
    provideFirestore(() => getFirestore()),

    {
      provide: RIVE_FOLDER,
      useValue: 'assets/course_rive/rive',
    },
    provideMarkdown(),
  ],
});