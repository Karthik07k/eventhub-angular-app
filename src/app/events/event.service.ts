import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Event, EventFormData } from './event.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  private eventsSubject = new BehaviorSubject<Event[]>(this.getMockEvents());
  public events$ = this.eventsSubject.asObservable();

  private getMockEvents(): Event[] {
    return [
      {
        id: 1,
        title: 'Angular Conference 2024',
        description: 'Join us for the biggest Angular conference of the year featuring talks from core team members and industry experts.',
        date: new Date('2024-07-15'),
        time: '09:00',
        location: 'San Francisco Convention Center',
        category: 'Technology',
        maxAttendees: 500,
        currentAttendees: 342,
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
        createdBy: 'admin',
        createdAt: new Date('2024-01-15'),
        status: 'upcoming'
      },
      {
        id: 2,
        title: 'Web Development Workshop',
        description: 'Hands-on workshop covering modern web development techniques with React, Angular, and Vue.js.',
        date: new Date('2024-07-20'),
        time: '10:00',
        location: 'Tech Hub Downtown',
        category: 'Workshop',
        maxAttendees: 50,
        currentAttendees: 45,
        imageUrl: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400',
        createdBy: 'admin',
        createdAt: new Date('2024-02-01'),
        status: 'upcoming'
      },
      {
        id: 3,
        title: 'Startup Networking Event',
        description: 'Connect with fellow entrepreneurs, investors, and startup enthusiasts in this networking event.',
        date: new Date('2024-07-25'),
        time: '18:00',
        location: 'Innovation Center',
        category: 'Networking',
        maxAttendees: 100,
        currentAttendees: 78,
        imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400',
        createdBy: 'admin',
        createdAt: new Date('2024-02-10'),
        status: 'upcoming'
      },
      {
        id: 4,
        title: 'AI & Machine Learning Summit',
        description: 'Explore the latest trends in artificial intelligence and machine learning with industry leaders.',
        date: new Date('2024-08-05'),
        time: '09:30',
        location: 'Tech Park Auditorium',
        category: 'Technology',
        maxAttendees: 300,
        currentAttendees: 267,
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
        createdBy: 'admin',
        createdAt: new Date('2024-03-01'),
        status: 'upcoming'
      },
      {
        id: 5,
        title: 'Design Thinking Workshop',
        description: 'Learn design thinking methodologies to solve complex problems and innovate effectively.',
        date: new Date('2024-08-10'),
        time: '14:00',
        location: 'Creative Studio',
        category: 'Design',
        maxAttendees: 30,
        currentAttendees: 28,
        imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
        createdBy: 'admin',
        createdAt: new Date('2024-03-15'),
        status: 'upcoming'
      },
      {
        id: 6,
        title: 'Digital Marketing Masterclass',
        description: 'Master the art of digital marketing with proven strategies and real-world case studies.',
        date: new Date('2024-08-15'),
        time: '11:00',
        location: 'Business Center',
        category: 'Marketing',
        maxAttendees: 80,
        currentAttendees: 65,
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
        createdBy: 'admin',
        createdAt: new Date('2024-04-01'),
        status: 'upcoming'
      }
    ];
  }

  getEvents(): Observable<Event[]> {
    return this.events$;
  }

  getEventById(id: number): Observable<Event | undefined> {
    const event = this.eventsSubject.value.find(event => event.id === id);
    return of(event);
  }

  addEvent(event: Event): void {
    const currentEvents = this.eventsSubject.value;
    this.eventsSubject.next([...currentEvents, event]);
  }

  updateEvent(updatedEvent: Event): Observable<Event> {
    const currentEvents = this.eventsSubject.value;
    const index = currentEvents.findIndex(event => event.id === updatedEvent.id);
    if (index !== -1) {
      currentEvents[index] = updatedEvent;
      this.eventsSubject.next([...currentEvents]);
      return of(updatedEvent);
    }
    return new Observable(observer => {
      observer.error(new Error('Event not found'));
    });
  }

  deleteEvent(id: number): void {
    const currentEvents = this.eventsSubject.value.filter(event => event.id !== id);
    this.eventsSubject.next(currentEvents);
  }

  createEvent(formData: EventFormData): Observable<Event> {
    const currentEvents = this.eventsSubject.value;
    const newId = Math.max(...currentEvents.map(e => e.id)) + 1;
    
    const newEvent: Event = {
      id: newId,
      title: formData.title,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      category: formData.category,
      maxAttendees: formData.maxAttendees,
      currentAttendees: 0,
      imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
      createdBy: 'current-user', // In a real app, this would come from auth service
      createdAt: new Date(),
      status: 'upcoming'
    };

    this.addEvent(newEvent);
    return of(newEvent);
  }
} 