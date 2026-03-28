import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { UserMessagesPage } from './user-messages.page';
import { ChatService } from 'src/app/services/chat.service';
import { AuthService } from 'src/app/services/auth.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ConversacionDto, MensajeDto } from 'src/app/core/models/models';
import { Auth } from '@angular/fire/auth';
import { FcmService } from 'src/app/services/fcm.service';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { provideIonicAngular } from '@ionic/angular/standalone';

/**
 * Deep Dive: UserMessagesPage — Testing Computed Signals + Optimistic UI.
 *
 * Esta page combina:
 * 1. `conversacionesFiltradas` → computed signal que filtra por `filtroChats`.
 * 2. `toggleBuscador()` / `toggleEmojiPicker()` → UI state toggles.
 * 3. `addEmoji()` → Mutación de signal con `.update()`.
 * 4. `esPropio()` → Lógica pura que compara autorId con miId signal.
 *
 * Estrategia: Inyectamos datos directamente en los signals del componente
 * y verificamos las computadas de forma síncrona (sin fixture.detectChanges).
 */
describe('UserMessagesPage', () => {
  let component: UserMessagesPage;
  let fixture: ComponentFixture<UserMessagesPage>;
  let chatServiceSpy: jasmine.SpyObj<ChatService>;
  let usuarioServiceSpy: jasmine.SpyObj<UsuarioService>;

  const MOCK_CONVOS: ConversacionDto[] = [
    { id: 1, titulo: 'Chat con Ana', tipo: 'individual', esAdmin: false, unreadCount: 3 },
    { id: 2, titulo: 'Chat con Pedro', tipo: 'individual', esAdmin: false },
    { id: 3, titulo: 'Grupo General', tipo: 'grupal', esAdmin: true },
    { id: 4, titulo: 'Soporte Técnico', tipo: 'individual', esAdmin: true }
  ];

  beforeEach(async () => {
    chatServiceSpy = jasmine.createSpyObj('ChatService', [
      'getConversaciones', 'crearConversacion', 'getMensajes',
      'enviarMensaje', 'marcarComoLeido', 'eliminarConversacion'
    ]);
    chatServiceSpy.getConversaciones.and.returnValue(of(MOCK_CONVOS));
    chatServiceSpy.getMensajes.and.returnValue(of([]));
    chatServiceSpy.marcarComoLeido.and.returnValue(of(void 0));

    usuarioServiceSpy = jasmine.createSpyObj('UsuarioService', ['buscar', 'getDepartamentos']);
    usuarioServiceSpy.buscar.and.returnValue(of([]));

    const currentUserSignal = signal({
      id: 10, nombre: 'Test User', email: 'test@test.com',
      rolNombre: 'USER', permiteContacto: true
    });

    const authServiceMock = {
      currentUser: currentUserSignal,
      isAuthenticated: true,
      isAdmin: false,
      updateUserProfile: () => of({})
    };

    const fcmMock = {
      obtenerToken: () => Promise.resolve(null),
      iniciarEscucha: () => { }
    };

    const authMock = {
      currentUser: null,
      onAuthStateChanged: (_cb: any) => () => { }
    };

    await TestBed.configureTestingModule({
      imports: [UserMessagesPage],
      providers: [
        provideIonicAngular(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ChatService, useValue: chatServiceSpy },
        { provide: AuthService, useValue: authServiceMock },
        { provide: UsuarioService, useValue: usuarioServiceSpy },
        { provide: Auth, useValue: authMock },
        { provide: FcmService, useValue: fcmMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserMessagesPage);
    component = fixture.componentInstance;
  });

  // ─── Creación ────────────────────────────────────────

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // ─── Estado Inicial ──────────────────────────────────

  it('initial state: mostrarBuscador should be false', () => {
    expect(component.mostrarBuscador()).toBeFalse();
  });

  it('initial state: mostrarEmojiPicker should be false', () => {
    expect(component.mostrarEmojiPicker()).toBeFalse();
  });

  it('initial state: conversacionSeleccionada should be null', () => {
    expect(component.conversacionSeleccionada()).toBeNull();
  });

  it('initial state: nuevoMensaje should be empty string', () => {
    expect(component.nuevoMensaje()).toBe('');
  });

  // ─── Computed Signal: conversacionesFiltradas ────────

  it('conversacionesFiltradas: should return ALL conversations when filter is empty', () => {
    component.conversaciones.set(MOCK_CONVOS);
    component.filtroChats.set('');

    expect(component.conversacionesFiltradas().length).toBe(4);
  });

  it('conversacionesFiltradas: should filter by title (case insensitive)', () => {
    component.conversaciones.set(MOCK_CONVOS);
    component.filtroChats.set('ana');

    const result = component.conversacionesFiltradas();
    expect(result.length).toBe(1);
    expect(result[0].titulo).toBe('Chat con Ana');
  });

  it('conversacionesFiltradas: should return multiple matches', () => {
    component.conversaciones.set(MOCK_CONVOS);
    component.filtroChats.set('chat');

    const result = component.conversacionesFiltradas();
    expect(result.length).toBe(2); // 'Chat con Ana' y 'Chat con Pedro'
  });

  it('conversacionesFiltradas: should return empty when no match', () => {
    component.conversaciones.set(MOCK_CONVOS);
    component.filtroChats.set('inexistente');

    expect(component.conversacionesFiltradas().length).toBe(0);
  });

  // ─── UI Toggles ──────────────────────────────────────

  it('toggleBuscador: should toggle mostrarBuscador signal', () => {
    component.toggleBuscador();
    expect(component.mostrarBuscador()).toBeTrue();

    component.toggleBuscador();
    expect(component.mostrarBuscador()).toBeFalse();
  });

  it('toggleBuscador: should reset search state on toggle', () => {
    component.searchQuery.set('test');
    component.usuariosEncontrados.set([{ id: 1, nombre: 'X', email: 'x@x.com', rolNombre: 'USER', permiteContacto: true }]);
    component.departamentoSeleccionado.set(5);

    component.toggleBuscador();

    expect(component.searchQuery()).toBe('');
    expect(component.usuariosEncontrados().length).toBe(0);
    expect(component.departamentoSeleccionado()).toBeNull();
  });

  it('toggleEmojiPicker: should toggle mostrarEmojiPicker signal', () => {
    component.toggleEmojiPicker();
    expect(component.mostrarEmojiPicker()).toBeTrue();

    component.toggleEmojiPicker();
    expect(component.mostrarEmojiPicker()).toBeFalse();
  });

  // ─── addEmoji ────────────────────────────────────────

  it('addEmoji: should append emoji to nuevoMensaje signal', () => {
    component.nuevoMensaje.set('Hola ');
    component.addEmoji('🔥');

    expect(component.nuevoMensaje()).toBe('Hola 🔥');
  });

  it('addEmoji: should chain multiple emojis', () => {
    component.nuevoMensaje.set('');
    component.addEmoji('😀');
    component.addEmoji('👍');

    expect(component.nuevoMensaje()).toBe('😀👍');
  });

  // ─── esPropio ────────────────────────────────────────

  it('esPropio: should return true when msg.autorId matches miId', () => {
    component.miId.set(10);
    const msg: MensajeDto = {
      id: 1, texto: 'Test', autorId: 10, autorNombre: 'Yo',
      fechaEnvio: '2026-01-01', esStaff: false, leido: true
    };

    expect(component.esPropio(msg)).toBeTrue();
  });

  it('esPropio: should return false when msg.autorId does NOT match miId', () => {
    component.miId.set(10);
    const msg: MensajeDto = {
      id: 2, texto: 'Test', autorId: 99, autorNombre: 'Otro',
      fechaEnvio: '2026-01-01', esStaff: false, leido: false
    };

    expect(component.esPropio(msg)).toBeFalse();
  });

  // ─── deseleccionarConversacion ───────────────────────

  it('deseleccionarConversacion: should set conversacionSeleccionada to null', () => {
    component.conversacionSeleccionada.set(MOCK_CONVOS[0]);
    expect(component.conversacionSeleccionada()).not.toBeNull();

    component.deseleccionarConversacion();
    expect(component.conversacionSeleccionada()).toBeNull();
  });

  // ─── Reactividad Encadenada ──────────────────────────

  it('changing filtroChats should reactively update conversacionesFiltradas', () => {
    component.conversaciones.set(MOCK_CONVOS);

    // 1. Sin filtro → 4 resultados
    component.filtroChats.set('');
    expect(component.conversacionesFiltradas().length).toBe(4);

    // 2. Filtro parcial → 2 resultados
    component.filtroChats.set('chat');
    expect(component.conversacionesFiltradas().length).toBe(2);

    // 3. Filtro exacto → 1 resultado
    component.filtroChats.set('soporte');
    expect(component.conversacionesFiltradas().length).toBe(1);
  });
});
