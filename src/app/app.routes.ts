import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { GuestGuard } from './auth/guest.guard';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'dashboard', 
    pathMatch: 'full'
  },
  { 
    path: 'auth', 
    loadChildren: () => import('./auth/auth-module').then(m => m.AuthModule),
    canActivate: [GuestGuard]
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'profile', 
    loadComponent: () => import('./profile/profile').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'events', 
    loadComponent: () => import('./events/event-list/event-list').then(m => m.EventListComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'events/create', 
    loadComponent: () => import('./events/event-form/event-form').then(m => m.EventFormComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'events/edit/:id', 
    loadComponent: () => import('./events/event-form/event-form').then(m => m.EventFormComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'events/:id', 
    loadComponent: () => import('./events/event-detail/event-detail').then(m => m.EventDetailComponent),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: 'auth/login' }
];
