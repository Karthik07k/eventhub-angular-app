import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { Router } from '@angular/router';

import { AuthService, User } from '../auth/auth.service';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTabsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <button mat-icon-button (click)="goBack()" class="back-button">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>My Profile</h1>
      </div>

      <div class="profile-content" *ngIf="currentUser$ | async as user">
        <mat-tab-group>
          <!-- Profile Information Tab -->
          <mat-tab label="Profile Information">
            <div class="tab-content">
              <mat-card class="profile-picture-card">
                <mat-card-header>
                  <mat-card-title>Profile Picture</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="profile-picture-section">
                    <div class="avatar-container">
                      <img
                        [src]="user.profilePicture || getDefaultAvatar()"
                        [alt]="user.fullName || user.username"
                        class="profile-avatar"
                        (error)="onImageError($event)"
                      />
                      <div class="avatar-overlay" (click)="triggerFileUpload()">
                        <mat-icon>camera_alt</mat-icon>
                        <span>Change Photo</span>
                      </div>
                    </div>
                    <input
                      #fileInput
                      type="file"
                      accept="image/*"
                      (change)="onFileSelected($event)"
                      style="display: none;"
                    />
                    <div class="avatar-actions">
                      <button
                        mat-raised-button
                        color="primary"
                        (click)="triggerFileUpload()"
                      >
                        <mat-icon>upload</mat-icon>
                        Upload Photo
                      </button>
                      <button
                        mat-button
                        (click)="removeProfilePicture()"
                        *ngIf="user.profilePicture"
                      >
                        <mat-icon>delete</mat-icon>
                        Remove
                      </button>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="profile-info-card">
                <mat-card-header>
                  <mat-card-title>Personal Information</mat-card-title>
                  <mat-card-subtitle
                    >Update your personal details</mat-card-subtitle
                  >
                </mat-card-header>
                <mat-card-content>
                  <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Username</mat-label>
                        <input matInput [value]="user.username" readonly />
                        <mat-icon matSuffix>account_circle</mat-icon>
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Full Name</mat-label>
                        <input
                          matInput
                          formControlName="fullName"
                          placeholder="Enter your full name"
                        />
                        <mat-icon matSuffix>person</mat-icon>
                        <mat-error
                          *ngIf="
                            profileForm.get('fullName')?.hasError('required')
                          "
                        >
                          Full name is required
                        </mat-error>
                        <mat-error
                          *ngIf="
                            profileForm.get('fullName')?.hasError('invalidName')
                          "
                        >
                          Full name can only contain letters, spaces,
                          apostrophes, and hyphens
                        </mat-error>
                        <mat-error
                          *ngIf="
                            profileForm
                              .get('fullName')
                              ?.hasError('nameTooShort')
                          "
                        >
                          Full name must be at least 2 characters long
                        </mat-error>
                        <mat-error
                          *ngIf="
                            profileForm.get('fullName')?.hasError('nameTooLong')
                          "
                        >
                          Full name must be less than 50 characters
                        </mat-error>
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Email</mat-label>
                        <input
                          matInput
                          formControlName="email"
                          type="email"
                          placeholder="Enter your email"
                        />
                        <mat-icon matSuffix>email</mat-icon>
                        <mat-error
                          *ngIf="profileForm.get('email')?.hasError('required')"
                        >
                          Email is required
                        </mat-error>
                        <mat-error
                          *ngIf="
                            profileForm.get('email')?.hasError('invalidEmail')
                          "
                        >
                          Please enter a valid email address
                        </mat-error>
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Phone Number</mat-label>
                        <input
                          matInput
                          formControlName="phone"
                          placeholder="Enter your phone number"
                          (input)="onPhoneInput($event)"
                          maxlength="14"
                        />
                        <mat-icon matSuffix>phone</mat-icon>
                        <mat-error
                          *ngIf="
                            profileForm.get('phone')?.hasError('invalidPhone')
                          "
                        >
                          Phone number can only contain digits, spaces, hyphens,
                          parentheses, and plus sign
                        </mat-error>
                        <mat-error
                          *ngIf="
                            profileForm.get('phone')?.hasError('phoneLength')
                          "
                        >
                          Phone number must be between 10 and 15 digits
                        </mat-error>
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Bio</mat-label>
                        <textarea
                          matInput
                          formControlName="bio"
                          rows="4"
                          placeholder="Tell us about yourself"
                        >
                        </textarea>
                        <mat-icon matSuffix>description</mat-icon>
                        <mat-hint align="end"
                          >{{
                            profileForm.get('bio')?.value?.length || 0
                          }}/500</mat-hint
                        >
                        <mat-error
                          *ngIf="profileForm.get('bio')?.hasError('maxlength')"
                        >
                          Bio must be less than 500 characters
                        </mat-error>
                      </mat-form-field>
                    </div>

                    <div class="form-actions">
                      <button
                        mat-raised-button
                        color="primary"
                        type="submit"
                        [disabled]="profileForm.invalid || isUpdating"
                      >
                        <mat-spinner
                          diameter="20"
                          *ngIf="isUpdating"
                        ></mat-spinner>
                        <mat-icon *ngIf="!isUpdating">save</mat-icon>
                        {{ isUpdating ? 'Updating...' : 'Update Profile' }}
                      </button>
                      <button mat-button type="button" (click)="resetForm()">
                        <mat-icon>refresh</mat-icon>
                        Reset
                      </button>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Change Password Tab -->
          <mat-tab label="Change Password">
            <div class="tab-content">
              <mat-card class="password-card">
                <mat-card-header>
                  <mat-card-title>Change Password</mat-card-title>
                  <mat-card-subtitle
                    >Update your account password</mat-card-subtitle
                  >
                </mat-card-header>
                <mat-card-content>
                  <form
                    [formGroup]="passwordForm"
                    (ngSubmit)="changePassword()"
                  >
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Current Password</mat-label>
                        <input
                          matInput
                          [type]="hideCurrentPassword ? 'password' : 'text'"
                          formControlName="currentPassword"
                          placeholder="Enter current password"
                        />
                        <button
                          mat-icon-button
                          matSuffix
                          type="button"
                          (click)="hideCurrentPassword = !hideCurrentPassword"
                        >
                          <mat-icon>{{
                            hideCurrentPassword
                              ? 'visibility'
                              : 'visibility_off'
                          }}</mat-icon>
                        </button>
                        <mat-error
                          *ngIf="
                            passwordForm
                              .get('currentPassword')
                              ?.hasError('required')
                          "
                        >
                          Current password is required
                        </mat-error>
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>New Password</mat-label>
                        <input
                          matInput
                          [type]="hideNewPassword ? 'password' : 'text'"
                          formControlName="newPassword"
                          placeholder="Enter new password"
                        />
                        <button
                          mat-icon-button
                          matSuffix
                          type="button"
                          (click)="hideNewPassword = !hideNewPassword"
                        >
                          <mat-icon>{{
                            hideNewPassword ? 'visibility' : 'visibility_off'
                          }}</mat-icon>
                        </button>
                        <mat-error
                          *ngIf="
                            passwordForm
                              .get('newPassword')
                              ?.hasError('required')
                          "
                        >
                          New password is required
                        </mat-error>
                        <mat-error
                          *ngIf="
                            passwordForm
                              .get('newPassword')
                              ?.hasError('minlength')
                          "
                        >
                          Password must be at least 6 characters
                        </mat-error>
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Confirm New Password</mat-label>
                        <input
                          matInput
                          [type]="hideConfirmPassword ? 'password' : 'text'"
                          formControlName="confirmPassword"
                          placeholder="Confirm new password"
                        />
                        <button
                          mat-icon-button
                          matSuffix
                          type="button"
                          (click)="hideConfirmPassword = !hideConfirmPassword"
                        >
                          <mat-icon>{{
                            hideConfirmPassword
                              ? 'visibility'
                              : 'visibility_off'
                          }}</mat-icon>
                        </button>
                        <mat-error
                          *ngIf="
                            passwordForm
                              .get('confirmPassword')
                              ?.hasError('required')
                          "
                        >
                          Please confirm your password
                        </mat-error>
                        <mat-error
                          *ngIf="passwordForm.hasError('passwordMismatch')"
                        >
                          Passwords do not match
                        </mat-error>
                      </mat-form-field>
                    </div>

                    <div class="form-actions">
                      <button
                        mat-raised-button
                        color="primary"
                        type="submit"
                        [disabled]="passwordForm.invalid || isChangingPassword"
                      >
                        <mat-spinner
                          diameter="20"
                          *ngIf="isChangingPassword"
                        ></mat-spinner>
                        <mat-icon *ngIf="!isChangingPassword">lock</mat-icon>
                        {{
                          isChangingPassword ? 'Changing...' : 'Change Password'
                        }}
                      </button>
                      <button
                        mat-button
                        type="button"
                        (click)="resetPasswordForm()"
                      >
                        <mat-icon>clear</mat-icon>
                        Clear
                      </button>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Account Information Tab -->
          <mat-tab label="Account Info">
            <div class="tab-content">
              <mat-card class="account-info-card">
                <mat-card-header>
                  <mat-card-title>Account Information</mat-card-title>
                  <mat-card-subtitle
                    >View your account details</mat-card-subtitle
                  >
                </mat-card-header>
                <mat-card-content>
                  <div class="info-grid">
                    <div class="info-item">
                      <mat-icon>account_circle</mat-icon>
                      <div class="info-content">
                        <span class="info-label">Username</span>
                        <span class="info-value">{{ user.username }}</span>
                      </div>
                    </div>

                    <div class="info-item">
                      <mat-icon>admin_panel_settings</mat-icon>
                      <div class="info-content">
                        <span class="info-label">Role</span>
                        <span class="info-value">{{
                          user.role | titlecase
                        }}</span>
                      </div>
                    </div>

                    <div class="info-item" *ngIf="user.createdAt">
                      <mat-icon>event</mat-icon>
                      <div class="info-content">
                        <span class="info-label">Member Since</span>
                        <span class="info-value">{{
                          user.createdAt | date : 'fullDate'
                        }}</span>
                      </div>
                    </div>

                    <div class="info-item" *ngIf="user.lastActivity">
                      <mat-icon>access_time</mat-icon>
                      <div class="info-content">
                        <span class="info-label">Last Activity</span>
                        <span class="info-value">{{
                          user.lastActivity | date : 'medium'
                        }}</span>
                      </div>
                    </div>

                    <div class="info-item" *ngIf="user.updatedAt">
                      <mat-icon>update</mat-icon>
                      <div class="info-content">
                        <span class="info-label">Profile Updated</span>
                        <span class="info-value">{{
                          user.updatedAt | date : 'medium'
                        }}</span>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styleUrl: './profile.scss',
})
export class ProfileComponent implements OnInit, OnDestroy {
  currentUser$: Observable<User | null>;
  profileForm: FormGroup;
  passwordForm: FormGroup;

  private destroy$ = new Subject<void>();
  private formInitialized = false;
  isUpdating = false;
  isChangingPassword = false;
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.profileForm = this.createProfileForm();
    this.passwordForm = this.createPasswordForm();
  }

  ngOnInit(): void {
    this.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user && !this.formInitialized) {
        this.profileForm.patchValue({
          fullName: user.fullName || '',
          email: user.email || '',
          phone: user.phone || '',
          bio: user.bio || '',
        });
        this.formInitialized = true;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createProfileForm(): FormGroup {
    return this.fb.group({
      fullName: ['', [Validators.required, this.nameValidator]],
      email: ['', [Validators.required, this.emailValidator]],
      phone: ['', [this.phoneValidator]],
      bio: ['', [Validators.maxLength(500)]],
    });
  }

  // Custom validator for full name (only letters, spaces, apostrophes, hyphens)
  private nameValidator: ValidatorFn = (control: AbstractControl) => {
    if (!control.value || control.value.trim() === '') {
      return null; // Let required validator handle empty values
    }

    const namePattern = /^[a-zA-Z\s'-]+$/;
    const isValid = namePattern.test(control.value.trim());

    if (!isValid) {
      return { invalidName: true };
    }

    // Check for reasonable length
    if (control.value.trim().length < 2) {
      return { nameTooShort: true };
    }

    if (control.value.trim().length > 50) {
      return { nameTooLong: true };
    }

    return null;
  };

  // Enhanced email validator
  private emailValidator: ValidatorFn = (control: AbstractControl) => {
    if (!control.value || control.value.trim() === '') {
      return null; // Let required validator handle empty values
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = emailPattern.test(control.value.trim());

    if (!isValid) {
      return { invalidEmail: true };
    }

    // Additional checks
    const email = control.value.trim().toLowerCase();

    // Check for common typos in domains
    const commonDomains = [
      'gmail.com',
      'yahoo.com',
      'hotmail.com',
      'outlook.com',
      'aol.com',
    ];
    const domain = email.split('@')[1];

    if (domain && domain.includes('..')) {
      return { invalidEmail: true };
    }

    return null;
  };

  // Phone number validator (numbers only, with optional formatting)
  private phoneValidator: ValidatorFn = (control: AbstractControl) => {
    if (!control.value || control.value.trim() === '') {
      return null; // Phone is optional
    }

    // Remove all non-digit characters for validation
    const digitsOnly = control.value.replace(/\D/g, '');

    // Check if it contains only digits and common separators
    const phonePattern = /^[\d\s\-\(\)\+\.]+$/;
    if (!phonePattern.test(control.value)) {
      return { invalidPhone: true };
    }

    // Check digit count (adjust range as needed for international numbers)
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return { phoneLength: true };
    }

    return null;
  };

  private createPasswordForm(): FormGroup {
    const form = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });

    // Custom validator for password confirmation
    form.setValidators(this.passwordMatchValidator);
    return form;
  }

  private passwordMatchValidator: ValidatorFn = (control: AbstractControl) => {
    const form = control as FormGroup;
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (
      newPassword &&
      confirmPassword &&
      newPassword.value !== confirmPassword.value
    ) {
      return { passwordMismatch: true };
    }
    return null;
  };

  updateProfile(): void {
    console.log('Update Profile clicked!');
    console.log('Form valid:', this.profileForm.valid);
    console.log('Form values:', this.profileForm.value);
    console.log('Form errors:', this.profileForm.errors);

    // Check individual field errors
    Object.keys(this.profileForm.controls).forEach((key) => {
      const control = this.profileForm.get(key);
      if (control && control.errors) {
        console.log(`${key} errors:`, control.errors);
      }
    });

    if (this.profileForm.valid) {
      this.isUpdating = true;

      const updatedProfile = this.profileForm.value;
      console.log('Sending updated profile:', updatedProfile);

      this.authService.updateUserProfile(updatedProfile).subscribe({
        next: (success) => {
          console.log('Update result:', success);
          this.isUpdating = false;
          if (success) {
            this.snackBar.open('Profile updated successfully!', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar'],
            });
          } else {
            this.snackBar.open(
              'Failed to update profile. Please try again.',
              'Close',
              {
                duration: 3000,
                panelClass: ['error-snackbar'],
              }
            );
          }
        },
        error: (error) => {
          console.error('Update error:', error);
          this.isUpdating = false;
          this.snackBar.open('An error occurred. Please try again.', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        },
      });
    } else {
      console.log('Form is invalid, cannot update profile');
      this.snackBar.open(
        'Please fix the form errors before submitting.',
        'Close',
        {
          duration: 3000,
          panelClass: ['error-snackbar'],
        }
      );
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      this.isChangingPassword = true;

      const { currentPassword, newPassword } = this.passwordForm.value;

      this.authService.changePassword(currentPassword, newPassword).subscribe({
        next: (success) => {
          this.isChangingPassword = false;
          if (success) {
            this.snackBar.open('Password changed successfully!', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar'],
            });
            this.resetPasswordForm();
          } else {
            this.snackBar.open('Current password is incorrect.', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar'],
            });
          }
        },
        error: () => {
          this.isChangingPassword = false;
          this.snackBar.open('An error occurred. Please try again.', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        },
      });
    }
  }

  triggerFileUpload(): void {
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    fileInput?.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Please select a valid image file.', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('File size must be less than 5MB.', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
        return;
      }

      // Convert to base64 and update profile
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        this.updateProfilePicture(base64String);
      };
      reader.readAsDataURL(file);
    }
  }

  private updateProfilePicture(profilePicture: string): void {
    this.authService.updateUserProfile({ profilePicture }).subscribe({
      next: (success) => {
        if (success) {
          this.snackBar.open('Profile picture updated successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
        } else {
          this.snackBar.open('Failed to update profile picture.', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        }
      },
      error: () => {
        this.snackBar.open(
          'An error occurred while updating profile picture.',
          'Close',
          {
            duration: 3000,
            panelClass: ['error-snackbar'],
          }
        );
      },
    });
  }

  removeProfilePicture(): void {
    this.authService
      .updateUserProfile({ profilePicture: undefined })
      .subscribe({
        next: (success) => {
          if (success) {
            this.snackBar.open(
              'Profile picture removed successfully!',
              'Close',
              {
                duration: 3000,
                panelClass: ['success-snackbar'],
              }
            );
          }
        },
      });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = this.getDefaultAvatar();
  }

  getDefaultAvatar(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzUiIHI9IjE1IiBmaWxsPSIjOTk5Ii8+CjxwYXRoIGQ9Ik0yMCA4NUMyMCA3My45NTQzIDI4Ljk1NDMgNjUgNDAgNjVINjBDNzEuMDQ1NyA2NSA4MCA3My45NTQzIDgwIDg1VjEwMEgyMFY4NVoiIGZpbGw9IiM5OTkiLz4KPC9zdmc+';
  }

  resetForm(): void {
    this.currentUser$.pipe(take(1)).subscribe((user) => {
      if (user) {
        this.profileForm.patchValue({
          fullName: user.fullName || '',
          email: user.email || '',
          phone: user.phone || '',
          bio: user.bio || '',
        });
        // Mark form as dirty to show changes after reset
        this.profileForm.markAsDirty();
      }
    });
  }

  resetPasswordForm(): void {
    this.passwordForm.reset();
    this.hideCurrentPassword = true;
    this.hideNewPassword = true;
    this.hideConfirmPassword = true;
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  // Helper method to format phone number as user types
  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove all non-digits

    // Format as (XXX) XXX-XXXX for US numbers
    if (value.length >= 6) {
      value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(
        6,
        10
      )}`;
    } else if (value.length >= 3) {
      value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    }

    // Update the form control
    this.profileForm.get('phone')?.setValue(value);
  }
}
