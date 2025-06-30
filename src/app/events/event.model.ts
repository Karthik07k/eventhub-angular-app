export interface Event {
  id: number;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  category: string;
  maxAttendees: number;
  currentAttendees: number;
  imageUrl?: string;
  createdBy: string;
  createdAt: Date;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface EventFormData {
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  category: string;
  maxAttendees: number;
  imageUrl?: string;
} 