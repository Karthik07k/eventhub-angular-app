import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { EventService } from '../event.service';
import { Event } from '../event.model';
import { DeleteConfirmationDialogComponent, DeleteDialogData } from '../../shared/delete-confirmation-dialog/delete-confirmation-dialog';

@Component({
  selector: 'app-event-detail',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDividerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="event-detail-container" *ngIf="event">
      <!-- Header Section -->
      <div class="detail-header">
        <button mat-icon-button (click)="goBack()" class="back-button">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1 class="page-title">Event Details</h1>
      </div>

      <!-- Event Image and Basic Info -->
      <mat-card class="event-hero-card">
        <div class="hero-content">
          <div class="event-image-container">
            <img [src]="event.imageUrl" [alt]="event.title" class="event-image">
            <div class="status-overlay">
              <mat-chip [class]="getStatusClass(event.status)">
                <mat-icon>{{ getStatusIcon(event.status) }}</mat-icon>
                {{ event.status | titlecase }}
              </mat-chip>
            </div>
          </div>
          
          <div class="event-info">
            <h2 class="event-title">{{ event.title }}</h2>
            <p class="event-description">{{ event.description }}</p>
            
            <!-- Key Information -->
            <div class="info-grid">
              <div class="info-item">
                <mat-icon>event</mat-icon>
                <div class="info-content">
                  <span class="info-label">Date</span>
                  <span class="info-value">{{ event.date | date:'fullDate' }}</span>
                </div>
              </div>
              
              <div class="info-item">
                <mat-icon>schedule</mat-icon>
                <div class="info-content">
                  <span class="info-label">Time</span>
                  <span class="info-value">{{ event.time }}</span>
                </div>
              </div>
              
              <div class="info-item">
                <mat-icon>location_on</mat-icon>
                <div class="info-content">
                  <span class="info-label">Location</span>
                  <span class="info-value">{{ event.location }}</span>
                </div>
              </div>
              
              <div class="info-item">
                <mat-icon>category</mat-icon>
                <div class="info-content">
                  <span class="info-label">Category</span>
                  <span class="info-value">{{ event.category }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </mat-card>

      <!-- Attendance Information -->
      <mat-card class="attendance-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>people</mat-icon>
            Attendance Information
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <div class="attendance-info">
            <div class="attendance-stats">
              <div class="stat-item">
                <span class="stat-number">{{ event.currentAttendees }}</span>
                <span class="stat-label">Registered</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ event.maxAttendees - event.currentAttendees }}</span>
                <span class="stat-label">Available</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ event.maxAttendees }}</span>
                <span class="stat-label">Total Capacity</span>
              </div>
            </div>
            
            <div class="progress-section">
              <div class="progress-header">
                <span>Registration Progress</span>
                <span>{{ getAttendancePercentage() }}%</span>
              </div>
              <mat-progress-bar 
                mode="determinate" 
                [value]="getAttendancePercentage()"
                [class]="getProgressBarClass()">
              </mat-progress-bar>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Event Details -->
      <mat-card class="details-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>info</mat-icon>
            Additional Information
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <div class="detail-grid">
            <div class="detail-item">
              <mat-icon>person</mat-icon>
              <div class="detail-content">
                <span class="detail-label">Organizer</span>
                <span class="detail-value">{{ event.createdBy | titlecase }}</span>
              </div>
            </div>
            
            <div class="detail-item">
              <mat-icon>calendar_today</mat-icon>
              <div class="detail-content">
                <span class="detail-label">Created</span>
                <span class="detail-value">{{ event.createdAt | date:'mediumDate' }}</span>
              </div>
            </div>
            
            <div class="detail-item">
              <mat-icon>confirmation_number</mat-icon>
              <div class="detail-content">
                <span class="detail-label">Event ID</span>
                <span class="detail-value">#{{ event.id }}</span>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Action Buttons -->
      <div class="action-section">
        <div class="primary-actions">
          <button 
            mat-raised-button 
            color="primary" 
            class="register-button"
            [disabled]="!canRegister()"
            (click)="registerForEvent()">
            <mat-icon>person_add</mat-icon>
            {{ getRegisterButtonText() }}
          </button>
          
          <button 
            mat-raised-button 
            color="accent" 
            class="share-button"
            (click)="shareEvent()">
            <mat-icon>share</mat-icon>
            Share Event
          </button>
        </div>
        
        <mat-divider class="action-divider"></mat-divider>
        
        <div class="secondary-actions">
          <button 
            mat-button 
            color="primary"
            (click)="editEvent()">
            <mat-icon>edit</mat-icon>
            Edit Event
          </button>
          
          <button 
            mat-button 
            color="warn"
            (click)="deleteEvent()">
            <mat-icon>delete</mat-icon>
            Delete Event
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div class="loading-container" *ngIf="!event && !error">
      <mat-icon class="loading-icon">event</mat-icon>
      <p>Loading event details...</p>
    </div>

    <!-- Error State -->
    <div class="error-container" *ngIf="error">
      <mat-icon class="error-icon">error_outline</mat-icon>
      <h3>Event Not Found</h3>
      <p>The event you're looking for doesn't exist or has been removed.</p>
      <button mat-raised-button color="primary" (click)="goBack()">
        <mat-icon>arrow_back</mat-icon>
        Back to Events
      </button>
    </div>
  `,
  styleUrl: './event-detail.scss'
})
export class EventDetailComponent implements OnInit, OnDestroy {
  event: Event | null = null;
  error = false;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadEvent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadEvent(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.eventService.getEventById(+eventId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (event) => {
            if (event) {
              this.event = event;
            } else {
              this.error = true;
            }
          },
          error: () => {
            this.error = true;
          }
        });
    } else {
      this.error = true;
    }
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'upcoming': return 'schedule';
      case 'ongoing': return 'play_circle';
      case 'completed': return 'check_circle';
      case 'cancelled': return 'cancel';
      default: return 'event';
    }
  }

  getAttendancePercentage(): number {
    if (!this.event) return 0;
    return Math.round((this.event.currentAttendees / this.event.maxAttendees) * 100);
  }

  getProgressBarClass(): string {
    const percentage = this.getAttendancePercentage();
    if (percentage >= 90) return 'progress-full';
    if (percentage >= 70) return 'progress-high';
    if (percentage >= 40) return 'progress-medium';
    return 'progress-low';
  }

  canRegister(): boolean {
    if (!this.event) return false;
    return this.event.status === 'upcoming' && 
           this.event.currentAttendees < this.event.maxAttendees;
  }

  getRegisterButtonText(): string {
    if (!this.event) return 'Register';
    if (this.event.status !== 'upcoming') return 'Registration Closed';
    if (this.event.currentAttendees >= this.event.maxAttendees) return 'Event Full';
    return 'Register Now';
  }

  registerForEvent(): void {
    if (!this.canRegister() || !this.event) return;
    
    // Simulate registration
    const updatedEvent = { ...this.event };
    updatedEvent.currentAttendees++;
    
    this.eventService.updateEvent(updatedEvent).subscribe({
      next: (event) => {
        this.event = event;
        this.snackBar.open('Successfully registered for the event!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        this.snackBar.open('Registration failed. Please try again.', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  shareEvent(): void {
    if (!this.event) return;
    
    const shareText = `Check out this event: ${this.event.title}`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: this.event.title,
        text: shareText,
        url: shareUrl
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareText} - ${shareUrl}`).then(() => {
        this.snackBar.open('Event link copied to clipboard!', 'Close', {
          duration: 3000
        });
      });
    }
  }

  editEvent(): void {
    if (!this.event) return;
    this.router.navigate(['/events/edit', this.event.id]);
  }

  deleteEvent(): void {
    if (!this.event) return;
    
    const dialogData: DeleteDialogData = {
      title: 'Delete Event',
      message: `Are you sure you want to delete "${this.event.title}"? This action cannot be undone.`,
      confirmText: 'Delete Event',
      cancelText: 'Cancel'
    };

    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '400px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.eventService.deleteEvent(this.event!.id);
        this.snackBar.open('Event deleted successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/events']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/events']);
  }
}
