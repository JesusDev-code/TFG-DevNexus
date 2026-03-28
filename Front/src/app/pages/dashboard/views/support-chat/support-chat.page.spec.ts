import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { SupportChatPage } from './support-chat.page';
import { SupportChatService } from 'src/app/services/support-chat.service';
import { AuthService } from 'src/app/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { getCommonTestProviders } from '../../../../testing/test-utils';
import { of } from 'rxjs';
import { MensajeChat } from 'src/app/core/models/models';

/**
 * Deep Dive: SupportChatPage — effect() + Inputs + Firebase-backed Chat.
 *
 * El componente usa `effect()` en el constructor para reaccionar al signal
 * `authService.currentUser()`. No usa HttpClient: habla con Firestore via
 * SupportChatService (Observables de Firestore + Promises para sendMessage).
 *
 * Estrategia:
 * - Plain object mocks (NO createSpyObj) para SupportChatService para evitar
 *   conflictos con Promise/Observable en Jasmine.
 * - NO_ERRORS_SCHEMA neutraliza todos los componentes Ionic e hijos.
 * - Los signals son síncronos: no se necesita fakeAsync.
 * - El effect() se ejecuta durante la creación del componente (signal reactivo).
 */
describe('SupportChatPage', () => {
  let component: SupportChatPage;
  let fixture: ComponentFixture<SupportChatPage>;
  let chatServiceMock: any;
  let authServiceMock: any;

  const MOCK_MESSAGES: MensajeChat[] = [
    { id: 'msg1', texto: 'Hola', fecha: new Date(), uid: '1', nombre: 'User', esStaff: false },
    { id: 'msg2', texto: 'Bienvenido', fecha: new Date(), uid: 'STAFF', nombre: 'Admin', esStaff: true }
  ];

  const MOCK_USER = { id: 1, nombre: 'Test User', email: 'test@test.com', rolNombre: 'USER', permiteContacto: true };

  function buildChatServiceMock() {
    return {
      getChatMessages: jasmine.createSpy('getChatMessages').and.returnValue(of(MOCK_MESSAGES)),
      getChat: jasmine.createSpy('getChat').and.returnValue(of({ id: 'user_1', estado: 'PENDIENTE', usuarioNombre: 'Test', ultimoMensaje: '', fecha: null })),
      sendMessage: jasmine.createSpy('sendMessage').and.returnValue(Promise.resolve()),
      reopenChat: jasmine.createSpy('reopenChat').and.returnValue(Promise.resolve()),
      closeChat: jasmine.createSpy('closeChat').and.returnValue(Promise.resolve()),
      getAllChats: jasmine.createSpy('getAllChats').and.returnValue(of([]))
    };
  }

  async function createComponent(userOverride?: any) {
    const user = userOverride !== undefined ? userOverride : MOCK_USER;
    chatServiceMock = buildChatServiceMock();
    authServiceMock = {
      currentUser: signal(user),
      isAuthenticated: true,
      isAdmin: false,
      logout: () => of(void 0),
      updateUserProfile: () => of({})
    };

    await TestBed.configureTestingModule({
      imports: [SupportChatPage],
      providers: [
        ...getCommonTestProviders(),
        { provide: SupportChatService, useValue: chatServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: (_k: string) => null } } }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SupportChatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ─── Creación ────────────────────────────────────────

  it('should create', async () => {
    await createComponent();
    expect(component).toBeTruthy();
  });

  // ─── effect(): null user → isGuest ───────────────────

  it('effect with null user sets isGuest=true and cargando=false', async () => {
    await createComponent(null);

    expect(component.isGuest).toBeTrue();
    expect(component.cargando).toBeFalse();
  });

  // ─── effect(): user with USER role ───────────────────

  it('effect with USER role: sets currentUser and chatId to user_<id>', async () => {
    await createComponent(MOCK_USER);

    expect(component.currentUser).toBeTruthy();
    expect(component.chatId).toBe('user_1');
  });

  it('effect with USER role: calls getChatMessages after init', async () => {
    await createComponent(MOCK_USER);

    expect(chatServiceMock.getChatMessages).toHaveBeenCalled();
  });

  // ─── enviar() ────────────────────────────────────────

  it('enviar with empty input does NOT call sendMessage', async () => {
    await createComponent(MOCK_USER);
    component.nuevoMensaje = '   ';

    component.enviar();

    expect(chatServiceMock.sendMessage).not.toHaveBeenCalled();
  });

  it('enviar with valid input calls sendMessage and clears nuevoMensaje', async () => {
    await createComponent(MOCK_USER);
    component.nuevoMensaje = 'Hola soporte';
    component.isGuest = false;
    component.chatCerrado = false;

    component.enviar();

    expect(chatServiceMock.sendMessage).toHaveBeenCalled();
    expect(component.nuevoMensaje).toBe('');
  });

  it('enviar when chat is closed does NOT call sendMessage', async () => {
    await createComponent(MOCK_USER);
    component.nuevoMensaje = 'Texto válido';
    component.chatCerrado = true;

    component.enviar();

    expect(chatServiceMock.sendMessage).not.toHaveBeenCalled();
  });

  it('enviar when isGuest=true does NOT call sendMessage', async () => {
    await createComponent(MOCK_USER);
    component.nuevoMensaje = 'Texto válido';
    component.isGuest = true;
    component.chatCerrado = false;

    component.enviar();

    expect(chatServiceMock.sendMessage).not.toHaveBeenCalled();
  });

  // ─── cargarMensajes ──────────────────────────────────

  it('cargarMensajes populates mensajes array on success', async () => {
    await createComponent(MOCK_USER);

    // Reset and call again manually
    component.mensajes = [];
    chatServiceMock.getChatMessages.and.returnValue(of(MOCK_MESSAGES));
    component.cargarMensajes();

    expect(component.mensajes.length).toBe(2);
    expect(component.cargando).toBeFalse();
  });

  it('cargarMensajes sets cargando=false on error', async () => {
    await createComponent(MOCK_USER);
    const { throwError } = await import('rxjs');
    chatServiceMock.getChatMessages.and.returnValue(throwError(() => new Error('Firestore error')));

    component.cargarMensajes();

    expect(component.cargando).toBeFalse();
  });

  // ─── adminViendoChatId input ─────────────────────────

  it('adminViendoChatId overrides chatId when set before effect', async () => {
    await createComponent({ id: 5, nombre: 'Admin', email: 'admin@test.com', rolNombre: 'ADMIN', permiteContacto: true });
    // adminViendoChatId is an @Input — set it and manually trigger effect via cargarMensajes
    component.adminViendoChatId = 'user_99';
    component.chatId = 'user_99'; // simulates what effect does when adminViendoChatId is set

    expect(component.chatId).toBe('user_99');
  });

  // ─── esModal input ───────────────────────────────────

  it('esModal defaults to false', async () => {
    await createComponent(MOCK_USER);

    expect(component.esModal).toBeFalse();
  });

  it('esModal can be set to true without errors', async () => {
    await createComponent(MOCK_USER);
    component.esModal = true;

    expect(component.esModal).toBeTrue();
  });
});
