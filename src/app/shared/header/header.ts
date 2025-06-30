import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService, User } from '../../auth/auth.service';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatSidenavModule,
    RouterModule
  ],
  template: `
    <mat-toolbar color="primary" class="header-toolbar">
      <div class="toolbar-content">
        <!-- Mobile Menu Toggle -->
        <button 
          mat-icon-button 
          class="mobile-menu-toggle" 
          (click)="toggleMobileMenu()"
          [class.menu-open]="isMobileMenuOpen">
          <mat-icon>{{ isMobileMenuOpen ? 'close' : 'menu' }}</mat-icon>
        </button>
        
        <!-- Brand -->
        <div class="brand" routerLink="/dashboard" (click)="closeMobileMenu()">
          <mat-icon class="brand-icon">event</mat-icon>
          <span class="brand-text">EventHub</span>
        </div>
        
        <!-- Desktop Navigation -->
        <nav class="nav-links desktop-nav">
          <button mat-button routerLink="/dashboard" routerLinkActive="active">
            <mat-icon>dashboard</mat-icon>
            Dashboard
          </button>
          <button mat-button routerLink="/events" routerLinkActive="active">
            <mat-icon>event</mat-icon>
            Events
          </button>
          <button mat-button routerLink="/events/create">
            <mat-icon>add</mat-icon>
            Create Event
          </button>
        </nav>
        
        <!-- Desktop User Menu -->
        <div class="user-menu desktop-user-menu" *ngIf="currentUser$ | async as user">
          <span class="username">{{ user.username }}</span>
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <div class="user-info">
              <mat-icon>person</mat-icon>
              <span>{{ user.username }}</span>
            </div>
            <mat-divider></mat-divider>
            <button mat-menu-item routerLink="/profile">
              <mat-icon>person</mat-icon>
              Profile
            </button>
            <button mat-menu-item>
              <mat-icon>settings</mat-icon>
              Settings
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              Logout
            </button>
          </mat-menu>
        </div>
        
        <!-- Desktop Auth Buttons -->
        <div class="auth-buttons desktop-auth-buttons" *ngIf="!(currentUser$ | async)">
          <button mat-button routerLink="/auth/login">
            <mat-icon>login</mat-icon>
            Login
          </button>
          <button mat-raised-button color="accent" routerLink="/auth/register">
            <mat-icon>person_add</mat-icon>
            Register
          </button>
        </div>
      </div>
    </mat-toolbar>
    
    <!-- Mobile Navigation Overlay -->
    <div class="mobile-nav-overlay" 
         [class.open]="isMobileMenuOpen" 
         (click)="closeMobileMenu()">
    </div>
    
    <!-- Mobile Navigation Menu -->
    <nav class="mobile-nav" [class.open]="isMobileMenuOpen">
      <div class="mobile-nav-content">
        <!-- User Info (Mobile) -->
        <div class="mobile-user-info" *ngIf="currentUser$ | async as user">
          <div class="user-avatar">
            <mat-icon>account_circle</mat-icon>
          </div>
          <div class="user-details">
            <span class="username">{{ user.username }}</span>
            <span class="user-role">{{ user.role | titlecase }}</span>
          </div>
        </div>
        
        <!-- Navigation Links (Mobile) -->
        <div class="mobile-nav-links">
          <button mat-button routerLink="/dashboard" routerLinkActive="active" (click)="closeMobileMenu()">
            <mat-icon>dashboard</mat-icon>
            <span>Dashboard</span>
          </button>
          <button mat-button routerLink="/events" routerLinkActive="active" (click)="closeMobileMenu()">
            <mat-icon>event</mat-icon>
            <span>Events</span>
          </button>
          <button mat-button routerLink="/events/create" (click)="closeMobileMenu()">
            <mat-icon>add</mat-icon>
            <span>Create Event</span>
          </button>
        </div>
        
        <mat-divider *ngIf="currentUser$ | async"></mat-divider>
        
        <!-- User Actions (Mobile) -->
        <div class="mobile-user-actions" *ngIf="currentUser$ | async">
          <button mat-button routerLink="/profile" (click)="closeMobileMenu()">
            <mat-icon>person</mat-icon>
            <span>Profile</span>
          </button>
          <button mat-button>
            <mat-icon>settings</mat-icon>
            <span>Settings</span>
          </button>
          <button mat-button (click)="logout(); closeMobileMenu()">
            <mat-icon>logout</mat-icon>
            <span>Logout</span>
          </button>
        </div>
        
        <!-- Auth Buttons (Mobile) -->
        <div class="mobile-auth-buttons" *ngIf="!(currentUser$ | async)">
          <button mat-raised-button color="primary" routerLink="/auth/login" (click)="closeMobileMenu()">
            <mat-icon>login</mat-icon>
            <span>Login</span>
          </button>
          <button mat-raised-button color="accent" routerLink="/auth/register" (click)="closeMobileMenu()">
            <mat-icon>person_add</mat-icon>
            <span>Register</span>
          </button>
        </div>
      </div>
    </nav>
  `,
  styleUrl: './header.scss'
})
export class Header implements OnInit {
  currentUser$: Observable<User | null>;
  isMobileMenuOpen = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {}

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    // Prevent body scroll when menu is open
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
}
