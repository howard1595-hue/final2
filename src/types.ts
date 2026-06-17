export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  createdAt: string;
  emailVerified?: boolean;
  authProvider?: 'password' | 'google';
}

export interface Photo {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  shootDate: string;
  imageUrl: string;
  userId: string;
  createdAt: string;
}

export type CategoryType = '風景攝影' | '人像攝影' | '街拍攝影' | '夜景攝影' | '生態攝影';

export const CATEGORIES: CategoryType[] = [
  '風景攝影',
  '人像攝影',
  '街拍攝影',
  '夜景攝影',
  '生態攝影'
];
