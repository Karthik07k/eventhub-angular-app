import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    // First check if user is authenticated
    if (!this.authService.isLoggedIn()) {
      return this.router.createUrlTree(['/auth/login']);
    }
    
    // Get required roles from route data
    const requiredRoles = route.data['roles'] as string[];
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No specific roles required
    }
    
    // Get current user
    const currentUser = this.authService.getCurrentUser();
    
    // For now, treat 'admin' username as admin role
    const userRoles = currentUser?.username === 'admin' ? ['admin'] : ['user'];
    
    // Check if user has any of the required roles
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (hasRequiredRole) {
      return true;
    }
    
    // User doesn't have required role, redirect to dashboard with error message
    return this.router.createUrlTree(['/dashboard'], { 
      queryParams: { error: 'insufficient-permissions' } 
    });
  }
} 