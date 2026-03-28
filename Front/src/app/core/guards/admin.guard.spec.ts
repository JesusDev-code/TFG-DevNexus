import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from 'src/app/services/auth.service';

describe('adminGuard', () => {
    let authServiceMock: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;
    const mockRoute = {} as ActivatedRouteSnapshot;
    const mockState = { url: '/admin-profile' } as RouterStateSnapshot;

    beforeEach(() => {
        authServiceMock = jasmine.createSpyObj('AuthService', [], {
            isAuthenticated: false,
            isAdmin: false
        });
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authServiceMock },
                { provide: Router, useValue: routerSpy }
            ]
        });
    });

    it('should allow navigation when user is authenticated AND admin', () => {
        (Object.getOwnPropertyDescriptor(authServiceMock, 'isAuthenticated')!.get as jasmine.Spy).and.returnValue(true);
        (Object.getOwnPropertyDescriptor(authServiceMock, 'isAdmin')!.get as jasmine.Spy).and.returnValue(true);

        const result = TestBed.runInInjectionContext(() => adminGuard(mockRoute, mockState));

        expect(result).toBeTrue();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should redirect to /user-profile when user is authenticated but NOT admin', () => {
        (Object.getOwnPropertyDescriptor(authServiceMock, 'isAuthenticated')!.get as jasmine.Spy).and.returnValue(true);
        // isAdmin stays false

        const result = TestBed.runInInjectionContext(() => adminGuard(mockRoute, mockState));

        expect(result).toBeFalse();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/user-profile']);
    });

    it('should redirect to /user-profile when user is NOT authenticated', () => {
        const result = TestBed.runInInjectionContext(() => adminGuard(mockRoute, mockState));

        expect(result).toBeFalse();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/user-profile']);
    });
});
