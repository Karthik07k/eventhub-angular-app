import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { EventService } from '../event.service';
import { EventFormData, Event } from '../event.model';

@Component({
  selector: 'app-event-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="event-form-container">
      <div class="form-content">
        <mat-card class="event-form-card">
          <mat-card-header>
            <mat-card-title class="page-title">
              <button mat-icon-button (click)="goBack()" class="back-button">
                <mat-icon>arrow_back</mat-icon>
              </button>
              <mat-icon class="form-icon">event</mat-icon>
              {{ isEditMode ? 'Edit Event' : 'Create New Event' }}
            </mat-card-title>
            <mat-card-subtitle>
              {{ isEditMode ? 'Update the details for your event' : 'Fill in the details for your new event' }}
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="eventForm" (ngSubmit)="onSubmit()" class="event-form">
              <!-- Event Title -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Event Title</mat-label>
                <input matInput formControlName="title" placeholder="Enter event title">
                <mat-icon matSuffix>title</mat-icon>
                <mat-error *ngIf="eventForm.get('title')?.hasError('required')">
                  Event title is required
                </mat-error>
                <mat-error *ngIf="eventForm.get('title')?.hasError('minlength')">
                  Title must be at least 3 characters long
                </mat-error>
              </mat-form-field>

              <!-- Description -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="4" 
                         placeholder="Describe your event"></textarea>
                <mat-icon matSuffix>description</mat-icon>
                <mat-error *ngIf="eventForm.get('description')?.hasError('required')">
                  Description is required
                </mat-error>
                <mat-error *ngIf="eventForm.get('description')?.hasError('minlength')">
                  Description must be at least 10 characters long
                </mat-error>
              </mat-form-field>

              <!-- Date and Time Row -->
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Event Date</mat-label>
                  <input matInput [matDatepicker]="picker" formControlName="date">
                  <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                  <mat-datepicker #picker></mat-datepicker>
                  <mat-error *ngIf="eventForm.get('date')?.hasError('required')">
                    Event date is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Event Time</mat-label>
                  <input matInput type="time" formControlName="time">
                  <mat-icon matSuffix>schedule</mat-icon>
                  <mat-error *ngIf="eventForm.get('time')?.hasError('required')">
                    Event time is required
                  </mat-error>
                </mat-form-field>
              </div>

              <!-- Location -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Location</mat-label>
                <input matInput formControlName="location" placeholder="Enter event location">
                <mat-icon matSuffix>location_on</mat-icon>
                <mat-error *ngIf="eventForm.get('location')?.hasError('required')">
                  Location is required
                </mat-error>
              </mat-form-field>

              <!-- Category and Max Attendees Row -->
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Category</mat-label>
                  <mat-select formControlName="category">
                    <mat-option value="Technology">Technology</mat-option>
                    <mat-option value="Business">Business</mat-option>
                    <mat-option value="Workshop">Workshop</mat-option>
                    <mat-option value="Conference">Conference</mat-option>
                    <mat-option value="Networking">Networking</mat-option>
                    <mat-option value="Training">Training</mat-option>
                    <mat-option value="Seminar">Seminar</mat-option>
                    <mat-option value="Other">Other</mat-option>
                  </mat-select>
                  <mat-icon matSuffix>category</mat-icon>
                  <mat-error *ngIf="eventForm.get('category')?.hasError('required')">
                    Category is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Max Attendees</mat-label>
                  <input matInput type="number" formControlName="maxAttendees" 
                         placeholder="Maximum number of attendees">
                  <mat-icon matSuffix>people</mat-icon>
                  <mat-error *ngIf="eventForm.get('maxAttendees')?.hasError('required')">
                    Max attendees is required
                  </mat-error>
                  <mat-error *ngIf="eventForm.get('maxAttendees')?.hasError('min')">
                    Must allow at least 1 attendee
                  </mat-error>
                  <mat-error *ngIf="eventForm.get('maxAttendees')?.hasError('max')">
                    Cannot exceed 10,000 attendees
                  </mat-error>
                  <mat-error *ngIf="eventForm.get('maxAttendees')?.hasError('attendeeValidation')">
                    Cannot reduce capacity below current attendees ({{ currentEvent?.currentAttendees }})
                  </mat-error>
                </mat-form-field>
              </div>

              <!-- Image URL -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Image URL (Optional)</mat-label>
                <input matInput formControlName="imageUrl" placeholder="Enter image URL">
                <mat-icon matSuffix>image</mat-icon>
                <mat-error *ngIf="eventForm.get('imageUrl')?.hasError('pattern')">
                  Please enter a valid URL
                </mat-error>
              </mat-form-field>

              <!-- Form Actions -->
              <div class="form-actions">
                <button mat-button type="button" (click)="goBack()" class="cancel-button">
                  <mat-icon>cancel</mat-icon>
                  Cancel
                </button>
                <button mat-raised-button color="primary" type="submit" 
                        [disabled]="eventForm.invalid || isSubmitting" class="submit-button">
                  <mat-icon>{{ isEditMode ? 'save' : 'add' }}</mat-icon>
                  {{ getSubmitButtonText() }}
                </button>
              </div>


            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>

    <!-- Loading State -->
    <div class="loading-container" *ngIf="isLoading">
      <mat-icon class="loading-icon">event</mat-icon>
      <p>Loading event details...</p>
    </div>

    <!-- Error State -->
    <div class="error-container" *ngIf="loadError">
      <mat-icon class="error-icon">error_outline</mat-icon>
      <h3>Event Not Found</h3>
      <p>The event you're trying to edit doesn't exist or has been removed.</p>
      <button mat-raised-button color="primary" (click)="goBack()">
        <mat-icon>arrow_back</mat-icon>
        Back to Events
      </button>
    </div>
  `,
  styleUrl: './event-form.scss'
})
export class EventFormComponent implements OnInit, OnDestroy {
  eventForm: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  isLoading = false;
  loadError = false;
  currentEvent: Event | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.eventForm = this.createForm();
  }

  ngOnInit(): void {
    this.checkEditMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkEditMode(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.isEditMode = true;
      this.loadEventForEdit(+eventId);
    } else {
      // Set minimum date to today for new events
      const today = new Date();
      this.eventForm.get('date')?.setValue(today);
    }
  }

  private loadEventForEdit(eventId: number): void {
    this.isLoading = true;
    this.eventService.getEventById(eventId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (event) => {
          this.isLoading = false;
          if (event) {
            this.currentEvent = event;
            this.populateForm(event);
            this.updateValidators();
          } else {
            this.loadError = true;
          }
        },
        error: () => {
          this.isLoading = false;
          this.loadError = true;
        }
      });
  }

  private populateForm(event: Event): void {
    // Format date for HTML date input (YYYY-MM-DD format)
    const formattedDate = event.date instanceof Date ? event.date : new Date(event.date);
    
    this.eventForm.patchValue({
      title: event.title,
      description: event.description,
      date: formattedDate,
      time: event.time,
      location: event.location,
      category: event.category,
      maxAttendees: event.maxAttendees,
      imageUrl: event.imageUrl
    });
  }

  private updateValidators(): void {
    if (this.isEditMode && this.currentEvent) {
      // Add custom validator for max attendees in edit mode
      const maxAttendeesControl = this.eventForm.get('maxAttendees');
      
      maxAttendeesControl?.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(10000),
        this.attendeeCapacityValidator
      ]);
      maxAttendeesControl?.updateValueAndValidity();
    }
  }

  private attendeeCapacityValidator = (control: any) => {
    if (!this.currentEvent) return null;
    
    const newCapacity = control.value;
    const currentAttendees = this.currentEvent.currentAttendees;
    
    if (newCapacity < currentAttendees) {
      return { attendeeValidation: true };
    }
    
    return null;
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      date: ['', Validators.required],
      time: ['', Validators.required],
      location: ['', Validators.required],
      category: ['', Validators.required],
      maxAttendees: ['', [Validators.required, Validators.min(1), Validators.max(10000)]],
      imageUrl: ['']
    });
  }

  onSubmit(): void {
    if (this.eventForm.valid) {
      this.isSubmitting = true;
      const formData: EventFormData = this.eventForm.value;
      
      if (this.isEditMode && this.currentEvent) {
        this.updateEvent(formData);
      } else {
        this.createEvent(formData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createEvent(formData: EventFormData): void {
    this.eventService.createEvent(formData).subscribe({
      next: (event) => {
        this.snackBar.open('Event created successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/events']);
      },
      error: (error) => {
        this.snackBar.open('Error creating event. Please try again.', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isSubmitting = false;
      }
    });
  }

  private updateEvent(formData: EventFormData): void {
    if (!this.currentEvent) {
      this.isSubmitting = false;
      return;
    }

    const updatedEvent: Event = {
      ...this.currentEvent,
      title: formData.title,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      category: formData.category,
      maxAttendees: formData.maxAttendees,
      imageUrl: formData.imageUrl || this.currentEvent.imageUrl
    };

    this.eventService.updateEvent(updatedEvent).subscribe({
      next: (event) => {
        this.isSubmitting = false;
        this.snackBar.open('Event updated successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/events', this.currentEvent!.id]);
      },
      error: (error) => {
        this.snackBar.open('Error updating event. Please try again.', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isSubmitting = false;
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.eventForm.controls).forEach(key => {
      const control = this.eventForm.get(key);
      control?.markAsTouched();
    });
  }

  getSubmitButtonText(): string {
    if (this.isSubmitting) {
      return this.isEditMode ? 'Updating...' : 'Creating...';
    }
    return this.isEditMode ? 'Update Event' : 'Create Event';
  }

  goBack(): void {
    if (this.isEditMode && this.currentEvent) {
      this.router.navigate(['/events', this.currentEvent.id]);
    } else {
      this.router.navigate(['/events']);
    }
  }


}
