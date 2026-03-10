
export type UserRole = 'ADMIN' | 'BUYER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  accessLink: string;
  thumbnail: string;
  learningPoints: string[];
}

export interface Purchase {
  id: string;
  userId: string;
  courseId: string;
  purchaseDate: string;
  accessLink: string;
}
