import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, timer, EMPTY } from 'rxjs';
import { Router } from '@angular/router';
import { map, takeUntil, switchMap } from 'rxjs/operators';

export interface User { 
  username: string; 
  password: string; 
  email?: string;
  fullName?: string;
  bio?: string;
  phone?: string;
  profilePicture?: string;
  role?: string;
  loginTime?: Date;
  lastActivity?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  sessionExpiry?: Date;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
  private readonly STORAGE_KEY = 'auth_session';
  private readonly USERS_KEY = 'registered_users';

  private users: User[] = [
    // Default users for testing
    { 
      username: 'admin', 
      password: 'admin123', 
      role: 'admin',
      email: 'admin@eventhub.com',
      fullName: 'System Administrator',
      bio: 'System administrator with full access to EventHub platform.',
      createdAt: new Date('2024-01-01')
    },
    { 
      username: 'user', 
      password: 'user123', 
      role: 'user',
      email: 'user@example.com',
      fullName: 'Demo User',
      bio: 'Regular user of EventHub platform.',
      createdAt: new Date('2024-01-01')
    }
  ];

  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null
  });

  public authState$ = this.authStateSubject.asObservable();
  public currentUser$ = this.authState$.pipe(
    map(state => state.user)
  );
  public isAuthenticated$ = this.authState$.pipe(
    map(state => state.isAuthenticated)
  );

  private sessionTimer$: Observable<number> = EMPTY;
  private sessionEndSubject = new BehaviorSubject<boolean>(false);

  constructor(private router: Router) {
    this.loadUsersFromStorage();
    this.initializeSession();
    this.startSessionMonitoring();
  }

  private loadUsersFromStorage(): void {
    const storedUsers = localStorage.getItem(this.USERS_KEY);
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      this.users = [...this.users, ...parsedUsers];
    }
  }

  private initializeSession(): void {
    const storedSession = localStorage.getItem(this.STORAGE_KEY);
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        const now = new Date();
        const sessionExpiry = new Date(session.sessionExpiry);
        
        // Check if session is still valid
        if (sessionExpiry > now) {
          this.authStateSubject.next({
            isAuthenticated: true,
            user: session.user,
            sessionExpiry: sessionExpiry
          });
          this.startSessionTimer(sessionExpiry.getTime() - now.getTime());
        } else {
          // Session expired, clear it
          this.clearSession();
        }
      } catch (error) {
        console.error('Error parsing stored session:', error);
        this.clearSession();
      }
    }
  }

  private startSessionMonitoring(): void {
    // Monitor user activity to extend session
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, () => {
        this.updateLastActivity();
      }, { passive: true });
    });
  }

  private updateLastActivity(): void {
    const currentState = this.authStateSubject.value;
    if (currentState.isAuthenticated && currentState.user) {
      const updatedUser = {
        ...currentState.user,
        lastActivity: new Date()
      };
      
      const updatedState = {
        ...currentState,
        user: updatedUser
      };
      
      this.authStateSubject.next(updatedState);
      this.saveSessionToStorage(updatedState);
    }
  }

  private startSessionTimer(duration: number): void {
    this.sessionTimer$ = timer(duration);
    this.sessionTimer$.pipe(
      takeUntil(this.sessionEndSubject)
    ).subscribe(() => {
      this.handleSessionExpiry();
    });
  }

  private handleSessionExpiry(): void {
    this.clearSession();
    this.router.navigate(['/auth/login'], { 
      queryParams: { message: 'session-expired' } 
    });
  }

  private saveSessionToStorage(authState: AuthState): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authState));
    } catch (error) {
      console.error('Error saving session to storage:', error);
    }
  }

  private clearSession(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.authStateSubject.next({
      isAuthenticated: false,
      user: null
    });
    this.sessionEndSubject.next(true);
  }

  register(user: User): Observable<boolean> {
    return new Observable(observer => {
      if (this.users.some(u => u.username === user.username)) {
        observer.next(false);
        observer.complete();
        return;
      }

      const newUser = {
        ...user,
        role: 'user' // Default role for new users
      };

      this.users.push(newUser);
      
      // Save registered users to localStorage (excluding default users)
      const registeredUsers = this.users.filter(u => 
        u.username !== 'admin' && u.username !== 'user'
      );
      localStorage.setItem(this.USERS_KEY, JSON.stringify(registeredUsers));
      
      observer.next(true);
      observer.complete();
    });
  }

  login(username: string, password: string): Observable<boolean> {
    return new Observable(observer => {
      const user = this.users.find(u => u.username === username && u.password === password);
      
      if (user) {
        const now = new Date();
        const sessionExpiry = new Date(now.getTime() + this.SESSION_TIMEOUT);
        
        const authenticatedUser: User = {
          ...user,
          loginTime: now,
          lastActivity: now
        };

        const authState: AuthState = {
          isAuthenticated: true,
          user: authenticatedUser,
          sessionExpiry: sessionExpiry
        };

        this.authStateSubject.next(authState);
        this.saveSessionToStorage(authState);
        this.startSessionTimer(this.SESSION_TIMEOUT);
        
        observer.next(true);
      } else {
        observer.next(false);
      }
      
      observer.complete();
    });
  }

  logout(): Observable<boolean> {
    return new Observable(observer => {
      this.clearSession();
      this.router.navigate(['/auth/login']);
      observer.next(true);
      observer.complete();
    });
  }

  isLoggedIn(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  getCurrentUser(): User | null {
    return this.authStateSubject.value.user;
  }

  getUserRole(): string | null {
    return this.authStateSubject.value.user?.role || null;
  }

  hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }

  getSessionTimeRemaining(): Observable<number> {
    return this.authState$.pipe(
      map(state => {
        if (!state.sessionExpiry) return 0;
        const remaining = state.sessionExpiry.getTime() - new Date().getTime();
        return Math.max(0, remaining);
      })
    );
  }

  refreshSession(): Observable<boolean> {
    return new Observable(observer => {
      const currentState = this.authStateSubject.value;
      if (currentState.isAuthenticated && currentState.user) {
        const now = new Date();
        const newSessionExpiry = new Date(now.getTime() + this.SESSION_TIMEOUT);
        
        const refreshedState: AuthState = {
          ...currentState,
          sessionExpiry: newSessionExpiry,
          user: {
            ...currentState.user,
            lastActivity: now
          }
        };

        this.authStateSubject.next(refreshedState);
        this.saveSessionToStorage(refreshedState);
        this.sessionEndSubject.next(true); // Stop current timer
        this.startSessionTimer(this.SESSION_TIMEOUT); // Start new timer
        
        observer.next(true);
      } else {
        observer.next(false);
      }
      observer.complete();
    });
  }

  updateUserProfile(updatedProfile: Partial<User>): Observable<boolean> {
    return new Observable(observer => {
      const currentState = this.authStateSubject.value;
      if (!currentState.isAuthenticated || !currentState.user) {
        observer.next(false);
        observer.complete();
        return;
      }

      // Find user in users array
      const userIndex = this.users.findIndex(u => u.username === currentState.user!.username);
      if (userIndex === -1) {
        observer.next(false);
        observer.complete();
        return;
      }

      // Update user in users array
      const updatedUser: User = {
        ...this.users[userIndex],
        ...updatedProfile,
        updatedAt: new Date(),
        // Don't allow changing username, password, or role through this method
        username: this.users[userIndex].username,
        password: this.users[userIndex].password,
        role: this.users[userIndex].role
      };

      this.users[userIndex] = updatedUser;

      // Update current session
      const updatedAuthState: AuthState = {
        ...currentState,
        user: updatedUser
      };

      this.authStateSubject.next(updatedAuthState);
      this.saveSessionToStorage(updatedAuthState);

      // Save users to localStorage (excluding default users)
      const registeredUsers = this.users.filter(u => 
        u.username !== 'admin' && u.username !== 'user'
      );
      localStorage.setItem(this.USERS_KEY, JSON.stringify(registeredUsers));

      observer.next(true);
      observer.complete();
    });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<boolean> {
    return new Observable(observer => {
      const currentState = this.authStateSubject.value;
      if (!currentState.isAuthenticated || !currentState.user) {
        observer.next(false);
        observer.complete();
        return;
      }

      // Verify current password
      const userIndex = this.users.findIndex(u => 
        u.username === currentState.user!.username && u.password === currentPassword
      );

      if (userIndex === -1) {
        observer.next(false); // Current password is incorrect
        observer.complete();
        return;
      }

      // Update password
      this.users[userIndex] = {
        ...this.users[userIndex],
        password: newPassword,
        updatedAt: new Date()
      };

      // Update session with new user data
      const updatedAuthState: AuthState = {
        ...currentState,
        user: this.users[userIndex]
      };

      this.authStateSubject.next(updatedAuthState);
      this.saveSessionToStorage(updatedAuthState);

      // Save users to localStorage
      const registeredUsers = this.users.filter(u => 
        u.username !== 'admin' && u.username !== 'user'
      );
      localStorage.setItem(this.USERS_KEY, JSON.stringify(registeredUsers));

      observer.next(true);
      observer.complete();
    });
  }
} 