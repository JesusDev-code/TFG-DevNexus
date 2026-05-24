import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from 'src/app/services/auth.service';

/**
 * Deep Dive: Los functional guards de Angular 14+ se testean invocándolos
 * dentro del inyector del TestBed con `TestBed.runInInjectionContext()`.
 * Esto garantiza que `inject()` dentro del guard resuelva correctamente.
 */
describe('authGuard', () => {
    let authServiceMock: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;
    const mockRoute = {} as ActivatedRouteSnapshot;
    const mockState = { url: '/user-profile' } as RouterStateSnapshot;

    beforeEach(() => {
        authServiceMock = jasmine.createSpyObj('AuthService', ['waitForAuthReady'], {
            isAuthenticated: false
        });
        authServiceMock.waitForAuthReady.and.returnValue(Promise.resolve());
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authServiceMock },
                { provide: Router, useValue: routerSpy }
            ]
        });
    });

    it('should allow navigation when user IS authenticated', async () => {
        (Object.getOwnPropertyDescriptor(authServiceMock, 'isAuthenticated')!.get as jasmine.Spy).and.returnValue(true);

        const result = await TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

        expect(result).toBeTrue();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should redirect to /dashboard when user is NOT authenticated', async () => {
        const result = await TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

        expect(result).toBeFalse();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
});
