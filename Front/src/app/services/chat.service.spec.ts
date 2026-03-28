import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ChatService } from './chat.service';
import { environment } from 'src/environments/environment';
import { ConversacionDto, MensajeDto } from '../core/models/models';

describe('ChatService', () => {
    let service: ChatService;
    let httpMock: HttpTestingController;
    const API = environment.apiUrl;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                ChatService
            ]
        });
        service = TestBed.inject(ChatService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    // ─── Conversaciones ──────────────────────────────────

    it('getConversaciones() → GET /conversaciones', () => {
        const mock: ConversacionDto[] = [
            { id: 1, titulo: 'Chat General', tipo: 'grupal', esAdmin: false }
        ];

        service.getConversaciones().subscribe(res => {
            expect(res.length).toBe(1);
            expect(res[0].titulo).toBe('Chat General');
        });

        const req = httpMock.expectOne(`${API}/conversaciones`);
        expect(req.request.method).toBe('GET');
        req.flush(mock);
    });

    it('crearConversacion() → POST /conversaciones con body completo', () => {
        service.crearConversacion('Chat con Juan', 'individual', 42).subscribe(res => {
            expect(res.id).toBe(5);
            expect(res.tipo).toBe('individual');
        });

        const req = httpMock.expectOne(`${API}/conversaciones`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ titulo: 'Chat con Juan', tipo: 'individual', invitadoId: 42 });
        req.flush({ id: 5, titulo: 'Chat con Juan', tipo: 'individual', esAdmin: false } as ConversacionDto);
    });

    it('eliminarConversacion() → DELETE /conversaciones/:id', () => {
        service.eliminarConversacion(3).subscribe();

        const req = httpMock.expectOne(`${API}/conversaciones/3`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });

    // ─── Mensajes ────────────────────────────────────────

    it('getMensajes() → GET /mensajes/conversacion/:id', () => {
        const mockMsgs: MensajeDto[] = [
            { id: 1, texto: 'Hola', autorId: 1, autorNombre: 'Ana', fechaEnvio: '2026-02-22', esStaff: false, leido: true }
        ];

        service.getMensajes(10).subscribe(res => {
            expect(res.length).toBe(1);
            expect(res[0].texto).toBe('Hola');
        });

        const req = httpMock.expectOne(`${API}/mensajes/conversacion/10`);
        expect(req.request.method).toBe('GET');
        req.flush(mockMsgs);
    });

    it('enviarMensaje() → POST /mensajes con MensajeCreateDto', () => {
        const dto = { conversacionId: 2, texto: 'Nuevo mensaje' };

        service.enviarMensaje(dto).subscribe(res => {
            expect(res.texto).toBe('Nuevo mensaje');
        });

        const req = httpMock.expectOne(`${API}/mensajes`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(dto);
        req.flush({ id: 99, texto: 'Nuevo mensaje', autorId: 1, autorNombre: 'Yo', fechaEnvio: '2026-02-22', esStaff: false, leido: false } as MensajeDto);
    });

    it('marcarComoLeido() → PUT /mensajes/leer-todo/:id', () => {
        service.marcarComoLeido(7).subscribe();

        const req = httpMock.expectOne(`${API}/mensajes/leer-todo/7`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual({});
        req.flush(null);
    });
});
