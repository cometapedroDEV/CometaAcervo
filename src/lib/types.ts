
export type UserRole = 'ADMIN' | 'BUYER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ExternalPlatform {
  id: string;
  name: string;
  baseUrl: string;
}

export interface ExternalAccountCredential {
  id: string;
  externalPlatformId: string;
  accessIdentifier: string; // email:senha
  providedCourseTitles: string[];
  adminNotes: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  externalPlatformId: string;
  thumbnail: string;
  learningPoints: string[];
}

export interface Purchase {
  id: string;
  userProfileId: string;
  courseId: string;
  purchaseDate: string;
  amountPaid: number;
  status: 'completed' | 'pending' | 'failed';
  deliveredCredentialId: string;
}
