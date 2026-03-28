/**
 * Shared Test Utilities
 *
 * Provee los providers comunes necesarios para que cualquier componente
 * de la app pueda instanciarse en TestBed sin errores de inyección.
 *
 * Deep Dive: En una app Ionic + Firebase + Angular Signals, casi todos
 * los componentes necesitan AuthService (que a su vez necesita Firebase Auth,
 * HttpClient, Router, FcmService). Este archivo centraliza los mocks
 * para evitar duplicación en 30+ spec files.
 */
import { Provider, EnvironmentProviders, importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { signal } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FcmService } from '../services/fcm.service';
import { of } from 'rxjs';
import { IonicModule } from '@ionic/angular';
import { provideIonicAngular } from '@ionic/angular/standalone';

/** Mock mínimo de Firebase Auth para TestBed */
const AUTH_MOCK = {
    currentUser: null,
    onAuthStateChanged: (_cb: any) => () => { },
    onIdTokenChanged: (_cb: any) => () => { }
};

/** Mock mínimo de Firestore para TestBed */
const FIRESTORE_MOCK = {};

/** Mock de FcmService que no toca FCM real */
const FCM_MOCK = {
    obtenerToken: () => Promise.resolve(null),
    iniciarEscucha: () => { }
};

/** Mock de AuthService con Signals */
const AUTH_SERVICE_MOCK = {
    currentUser: signal({ id: 1, nombre: 'Test User', email: 'test@test.com', rolNombre: 'USER', permiteContacto: true }),
    isAuthenticated: true,
    isAdmin: false,
    updateUserProfile: () => of({}),
    login: () => of(null),
    logout: () => of(void 0),
    logoutNoRedirect: () => of(void 0)
};

/**
 * Devuelve el array de providers que un TestBed necesita
 * para instanciar cualquier componente de la app.
 */
export function getCommonTestProviders(): Array<Provider | EnvironmentProviders> {
    return [
        provideIonicAngular(),
        importProvidersFrom(IonicModule.forRoot()),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: Auth, useValue: AUTH_MOCK },
        { provide: Firestore, useValue: FIRESTORE_MOCK },
        { provide: FcmService, useValue: FCM_MOCK },
        { provide: AuthService, useValue: AUTH_SERVICE_MOCK }
    ];
}
