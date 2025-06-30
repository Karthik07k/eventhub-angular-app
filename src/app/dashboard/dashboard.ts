import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { Observable, Subject, combineLatest, interval } from 'rxjs';
import { map, takeUntil, startWith, switchMap } from 'rxjs/operators';

import { AuthService, User } from '../auth/auth.service';
import { EventService } from '../events/event.service';
import { Event } from '../events/event.model';

interface DashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  myEvents: number;
  totalAttendees: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule
  ],
  template: `
    <div class="dashboard-container">
      <!-- Welcome Section -->
      <div class="welcome-section" *ngIf="currentUser$ | async as user">
        <mat-card class="welcome-card">
          <mat-card-header>
            <mat-card-title class="welcome-title">
              <mat-icon class="welcome-icon">dashboard</mat-icon>
              Welcome back, {{ user.username }}!
            </mat-card-title>
            <mat-card-subtitle>
              <mat-chip [ngClass]="'role-' + user.role">{{ user.role | titlecase }}</mat-chip>
              <span class="login-time">Last login: {{ user.loginTime | date:'medium' }}</span>
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="session-info">
              <div class="session-timer">
                <mat-icon>schedule</mat-icon>
                <span>Session expires in: {{ sessionTimeDisplay$ | async }}</span>
                <button mat-button color="primary" (click)="refreshSession()">
                  <mat-icon>refresh</mat-icon>
                  Extend Session
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Stats Cards -->
      <div class="stats-section">
        <div class="stats-grid">
          <mat-card class="stat-card total-events">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon class="stat-icon">event</mat-icon>
                <div class="stat-info">
                  <h3>{{ (dashboardStats$ | async)?.totalEvents || 0 }}</h3>
                  <p>Total Events</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card upcoming-events">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon class="stat-icon">schedule</mat-icon>
                <div class="stat-info">
                  <h3>{{ (dashboardStats$ | async)?.upcomingEvents || 0 }}</h3>
                  <p>Upcoming Events</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card my-events">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon class="stat-icon">person</mat-icon>
                <div class="stat-info">
                  <h3>{{ (dashboardStats$ | async)?.myEvents || 0 }}</h3>
                  <p>My Events</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card total-attendees">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon class="stat-icon">people</mat-icon>
                <div class="stat-info">
                  <h3>{{ (dashboardStats$ | async)?.totalAttendees || 0 }}</h3>
                  <p>Total Attendees</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="actions-section">
        <mat-card class="actions-card">
          <mat-card-header>
            <mat-card-title>Quick Actions</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="action-buttons">
              <button mat-raised-button color="primary" routerLink="/events/create">
                <mat-icon>add</mat-icon>
                Create Event
              </button>
              <button mat-raised-button color="accent" routerLink="/events">
                <mat-icon>list</mat-icon>
                View All Events
              </button>
              <button mat-raised-button routerLink="/events" [queryParams]="{filter: 'my'}">
                <mat-icon>person</mat-icon>
                My Events
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Recent Events -->
      <div class="recent-events-section">
        <mat-card class="recent-events-card">
          <mat-card-header>
            <mat-card-title>Recent Events</mat-card-title>
            <button mat-button routerLink="/events">View All</button>
          </mat-card-header>
          <mat-card-content>
            <div class="events-list">
              <div *ngFor="let event of recentEvents$ | async" 
                   class="event-item" 
                   (click)="viewEvent(event.id)">
                <div class="event-image" [style.background-image]="'url(' + event.imageUrl + ')'"></div>
                <div class="event-info">
                  <h4>{{ event.title }}</h4>
                  <p class="event-date">
                    <mat-icon>event</mat-icon>
                    {{ event.date | date:'MMM dd, yyyy' }} at {{ event.time }}
                  </p>
                  <p class="event-location">
                    <mat-icon>location_on</mat-icon>
                    {{ event.location }}
                  </p>
                  <div class="event-attendance">
                    <span>{{ event.currentAttendees }}/{{ event.maxAttendees }} attendees</span>
                    <mat-progress-bar 
                      mode="determinate" 
                      [value]="(event.currentAttendees / event.maxAttendees) * 100">
                    </mat-progress-bar>
                  </div>
                </div>
                <mat-chip class="status-chip" [ngClass]="'status-' + event.status">
                  {{ event.status | titlecase }}
                </mat-chip>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentUser$: Observable<User | null>;
  dashboardStats$!: Observable<DashboardStats>;
  recentEvents$!: Observable<Event[]>;
  sessionTimeDisplay$!: Observable<string>;

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.initializeObservables();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeObservables(): void {
    // Dashboard stats observable
    this.dashboardStats$ = combineLatest([
      this.eventService.getEvents(),
      this.currentUser$
    ]).pipe(
      map(([events, user]) => this.calculateStats(events, user)),
      takeUntil(this.destroy$)
    );

    // Recent events observable (last 5 events)
    this.recentEvents$ = this.eventService.getEvents().pipe(
      map(events => events
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
      ),
      takeUntil(this.destroy$)
    );

    // Session time display observable
    this.sessionTimeDisplay$ = interval(1000).pipe(
      startWith(0),
      switchMap(() => this.authService.getSessionTimeRemaining()),
      map(remaining => this.formatTimeRemaining(remaining)),
      takeUntil(this.destroy$)
    );
  }

  private calculateStats(events: Event[], user: User | null): DashboardStats {
    const now = new Date();
    const upcomingEvents = events.filter(event => new Date(event.date) > now);
    const myEvents = user ? events.filter(event => event.createdBy === user.username) : [];
    const totalAttendees = events.reduce((sum, event) => sum + event.currentAttendees, 0);

    return {
      totalEvents: events.length,
      upcomingEvents: upcomingEvents.length,
      myEvents: myEvents.length,
      totalAttendees: totalAttendees
    };
  }

  private formatTimeRemaining(milliseconds: number): string {
    if (milliseconds <= 0) return 'Session expired';
    
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    
    if (minutes > 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    
    return `${minutes}m ${seconds}s`;
  }

  refreshSession(): void {
    this.authService.refreshSession().subscribe(success => {
      if (success) {
        // Could show a success message here
        console.log('Session refreshed successfully');
      }
    });
  }

  viewEvent(eventId: number): void {
    this.router.navigate(['/events', eventId]);
  }
} 