import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationGuard implements CanActivate, CanActivateChild {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAccess(route, state);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAccess(childRoute, state);
  }

  private checkAccess(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const isAuthenticated = this.authService.isLoggedIn();
    const isAuthRoute = state.url.startsWith('/auth');
    
    // If trying to access auth routes while authenticated, redirect to events
    if (isAuthenticated && isAuthRoute) {
      return this.router.createUrlTree(['/events']);
    }
    
    // If trying to access protected routes while not authenticated, redirect to login
    if (!isAuthenticated && !isAuthRoute) {
      // Store the attempted URL for redirecting after login
      if (state.url && state.url !== '/') {
        localStorage.setItem('returnUrl', state.url);
      }
      return this.router.createUrlTree(['/auth/login']);
    }
    
    return true;
  }
} 