export interface Subject {
  id: string;
  name: string;
  active: boolean;
}

export interface TutorProfile {
  id: string;
  profile_id: string;
  bio: string | null;
  certification: string | null;
  experience: number | null;
  teaching_age_min: number | null;
  teaching_age_max: number | null;
  introduction_video: string | null;
  verified: boolean;
  currency?: string | null;
}

export interface TutorVideo {
  id: string;
  tutor_id: string;
  subject_id: string;
  title: string;
  description: string | null;
  video_url: string;
  created_at: string;
  subjects?: Subject; // joined relation
}

export interface LessonPackage {
  id: string;
  tutor_id: string;
  package_type: string;
  session_hours: number;
  session_minutes: number;
  days_per_week?: number | null;
  price: number;
  active: boolean;
  created_at: string;
}

export interface TutorAvailability {
  id: string;
  tutor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface UserProfileData {
  id: string;
  role: 'tutor' | 'parent' | 'admin';
  full_name: string;
  email: string;
  country: string | null;
  state: string | null;
  city: string | null;
  profile_photo: string | null;
}

export interface Child {
  id: string;
  parent_id: string;
  name: string;
  age: number;
  created_at: string;
}

export interface Country {
  id: string;
  name: string;
  active: boolean;
}

export interface Examination {
  id: string;
  country_id: string;
  name: string;
  active: boolean;
}

export interface TutorExamination {
  tutor_id: string;
  examination_id: string;
  examinations?: Examination;
}

export interface Booking {
  id: string;
  parent_id: string;
  child_id: string;
  tutor_id: string;
  lesson_package_id: string;
  scheduled_at: string;
  amount: number;
  currency: string;
  status: 'pending_payment' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  
  // Relations
  children?: Child;
  tutors?: TutorProfile;
  profiles?: UserProfileData; // Parent or Tutor depending on context
  lesson_packages?: LessonPackage;
}

export interface SavedTutor {
  id: string;
  parent_id: string;
  tutor_id: string;
  created_at: string;
  tutor_profiles?: TutorProfile; // joined relation
  profiles?: UserProfileData; // joined relation
}
