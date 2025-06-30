import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Event } from '../event.model';
import { EventService } from '../event.service';
import { DeleteConfirmationDialogComponent, DeleteDialogData } from '../../shared/delete-confirmation-dialog/delete-confirmation-dialog';

@Component({
  selector: 'app-event-list',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="events-container">
      <div class="events-header">
        <h1>Upcoming Events</h1>
        <button mat-raised-button color="primary" (click)="createEvent()">
          <mat-icon>add</mat-icon>
          Create Event
        </button>
      </div>

      <div class="events-grid">
        <mat-card *ngFor="let event of events$ | async" class="event-card" (click)="viewEvent(event.id)">
          <div class="card-image" [style.background-image]="'url(' + event.imageUrl + ')'">
            <div class="card-overlay">
              <mat-chip class="status-chip" [ngClass]="'status-' + event.status">
                {{ event.status | titlecase }}
              </mat-chip>
            </div>
          </div>
          
          <mat-card-header>
            <mat-card-title>{{ event.title }}</mat-card-title>
            <mat-card-subtitle>
              <mat-icon>event</mat-icon>
              {{ event.date | date:'MMM dd, yyyy' }} at {{ event.time }}
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <p class="event-description">{{ event.description }}</p>
            
            <div class="event-details">
              <div class="detail-item">
                <mat-icon>location_on</mat-icon>
                <span>{{ event.location }}</span>
              </div>
              <div class="detail-item">
                <mat-icon>category</mat-icon>
                <span>{{ event.category }}</span>
              </div>
            </div>

            <div class="attendance-info">
              <div class="attendance-text">
                <span>{{ event.currentAttendees }} / {{ event.maxAttendees }} attendees</span>
              </div>
              <mat-progress-bar 
                mode="determinate" 
                [value]="(event.currentAttendees / event.maxAttendees) * 100"
                class="attendance-bar">
              </mat-progress-bar>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button mat-button color="primary" (click)="viewEvent(event.id); $event.stopPropagation()">
              <mat-icon>visibility</mat-icon>
              View Details
            </button>
            <button mat-button (click)="editEvent(event.id); $event.stopPropagation()">
              <mat-icon>edit</mat-icon>
              Edit
            </button>
            <button mat-button color="warn" (click)="deleteEvent(event.id); $event.stopPropagation()">
              <mat-icon>delete</mat-icon>
              Delete
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styleUrl: './event-list.scss'
})
export class EventListComponent implements OnInit {
  events$!: Observable<Event[]>;

  constructor(
    private eventService: EventService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.events$ = this.eventService.getEvents();
    
    // Check for permission error in query params
    this.route.queryParams.subscribe(params => {
      if (params['error'] === 'insufficient-permissions') {
        this.snackBar.open('You do not have permission to access that resource', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        // Clean up the URL
        this.router.navigate([], { queryParams: {} });
      }
    });
  }

  viewEvent(id: number): void {
    this.router.navigate(['/events', id]);
  }

  editEvent(id: number): void {
    this.router.navigate(['/events', 'edit', id]);
  }

  createEvent(): void {
    this.router.navigate(['/events', 'create']);
  }

  deleteEvent(id: number): void {
    // Find the event to get its title
    this.eventService.getEventById(id).subscribe(event => {
      if (!event) return;

      const dialogData: DeleteDialogData = {
        title: 'Delete Event',
        message: `Are you sure you want to delete "${event.title}"? This action cannot be undone.`,
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
          this.eventService.deleteEvent(id);
          this.snackBar.open('Event deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        }
      });
    });
  }
}
