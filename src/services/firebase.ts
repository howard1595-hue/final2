/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword as fbSignIn, 
  createUserWithEmailAndPassword as fbCreateUser, 
  signOut as fbSignOut, 
  onAuthStateChanged as fbOnAuthStateChanged,
  User as FirebaseUser,
  updateProfile as fbUpdateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail as fbSendPasswordResetEmail,
  sendEmailVerification as fbSendEmailVerification
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { Photo, UserProfile } from '../types';

// Web App Firebase Configuration from the user
const firebaseConfig = {
  apiKey: "AIzaSyBMsqWsqUA4Rfs10-rAI6d8845YFgoGKCg",
  authDomain: "final-8f63d.firebaseapp.com",
  projectId: "final-8f63d",
  storageBucket: "final-8f63d.firebasestorage.app",
  messagingSenderId: "828237686474",
  appId: "1:828237686474:web:4910ba20f9a885dcfd3633"
};

// If config is incomplete, use local storage emulation
const isFirebaseConfigured = !!(firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId);

let app: any;
let auth: any;
let db: any;
let storage: any;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.error("Firebase initialization failed, utilizing LocalStorage fallback:", error);
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Ensure local persistence is seeded with beautiful default photography works
const seedDefaultPhotos = (): Photo[] => {
  const initial: Photo[] = [
    {
      id: "seed-1",
      title: "幽谷晨曦 (Morning in Yosemite)",
      description: "在優勝美地谷捕捉到的第一道曙光，雲霧裊繞在酋長岩與半圓頂之間，溪水靜謐地倒映著森林與晨曦的溫暖光輝。採用慢速快門使水面呈現絲綢質感。",
      category: "風景攝影",
      location: "美國 優勝美地國家公園",
      shootDate: "2026-05-12",
      imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      userId: "system-admin",
      createdAt: new Date("2026-05-12T08:00:00Z").toISOString()
    },
    {
      id: "seed-2",
      title: "光影肖像 (Portrait of Light & Shade)",
      description: "利用側光與百葉窗投影出的條紋光影，在模特兒臉上勾勒出深邃、具有立體感的戲劇化效果。強調靈魂與情緒的對比。光圈定在 f/1.8 營造極淺景深。",
      category: "人像攝影",
      location: "台北 永康街攝影棚",
      shootDate: "2026-06-02",
      imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
      userId: "system-admin",
      createdAt: new Date("2026-06-02T14:30:00Z").toISOString()
    },
    {
      id: "seed-3",
      title: "霓虹雨夜 (Tokyo Cyber Rain)",
      description: "深夜的新宿街頭突降暴雨，五彩斑斕的霓虹招牌反射在濕漉漉的柏油路上，撐著透明雨傘的行人匆匆走過。極具賽博朋克未來感的城市街景寫實。",
      category: "街拍攝影",
      location: "日本 東京新宿",
      shootDate: "2026-04-20",
      imageUrl: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80",
      userId: "system-admin",
      createdAt: new Date("2026-04-20T21:15:00Z").toISOString()
    },
    {
      id: "seed-4",
      title: "銀河之河 (Galactic River)",
      description: "遠離城市光害的合歡山主峰，滿天星斗璀璨，璀璨的銀河中心如一條發光的河流橫跨夜空。使用 25秒曝光、ISO 3200 搭配超廣角鏡頭，捕捉宇宙的浩瀚。",
      category: "夜景攝影",
      location: "台灣 南投合歡山",
      shootDate: "2026-05-30",
      imageUrl: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=1200&q=80",
      userId: "system-admin",
      createdAt: new Date("2026-05-30T23:45:00Z").toISOString()
    },
    {
      id: "seed-5",
      title: "森林秘境 (Sika Deer in Fog)",
      description: "清晨的溪頭迷霧森林中，一隻警覺而優雅的梅花鹿正回首凝視著鏡頭。霧氣使森林蒙上一層神祕的綠色薄紗，光線透過樹冠灑下微弱的丁達爾效應光芒。",
      category: "生態攝影",
      location: "台灣 南投溪頭",
      shootDate: "2026-06-10",
      imageUrl: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80",
      userId: "system-admin",
      createdAt: new Date("2026-06-10T06:20:00Z").toISOString()
    }
  ];
  localStorage.setItem('portfolio_photos', JSON.stringify(initial));
  return initial;
};

// Helper: Get local data
export const getLocalPhotos = (): Photo[] => {
  const data = localStorage.getItem('portfolio_photos');
  if (!data) {
    return seedDefaultPhotos();
  }
  return JSON.parse(data);
};

// Helper: Save local data
export const saveLocalPhotos = (photos: Photo[]) => {
  localStorage.setItem('portfolio_photos', JSON.stringify(photos));
};

// Helper: Get local users
const getLocalUsers = (): UserProfile[] => {
  const data = localStorage.getItem('portfolio_users');
  return data ? JSON.parse(data) : [
    {
      uid: "system-admin",
      name: "資深攝影師",
      email: "demo@example.com",
      createdAt: new Date().toISOString()
    }
  ];
};

const saveLocalUsers = (users: UserProfile[]) => {
  localStorage.setItem('portfolio_users', JSON.stringify(users));
};

// Dual-Mode Auth Implementation
export const authService = {
  isEmulator: !isFirebaseConfigured,

  onAuthStateChange: (callback: (user: any) => void) => {
    if (isFirebaseConfigured) {
      return fbOnAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          // Fetch additional user profile info if exists
          try {
            const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
            const baseProfile: UserProfile = {
              uid: fbUser.uid,
              email: fbUser.email || '',
              name: fbUser.displayName || '使用者',
              createdAt: new Date().toISOString(),
              emailVerified: fbUser.emailVerified,
              authProvider: fbUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'password'
            };

            if (userDoc.exists()) {
              callback({
                ...baseProfile,
                name: userDoc.data().name || baseProfile.name,
                createdAt: userDoc.data().createdAt || baseProfile.createdAt
              });
            } else {
              callback(baseProfile);
            }
          } catch (e) {
            callback({
              uid: fbUser.uid,
              email: fbUser.email || '',
              name: fbUser.displayName || '使用者',
              createdAt: new Date().toISOString(),
              emailVerified: fbUser.emailVerified,
              authProvider: fbUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'password'
            });
          }
        } else {
          callback(null);
        }
      });
    } else {
      // Local check
      const checkLocalUser = () => {
        const storedUser = localStorage.getItem('portfolio_current_user');
        if (storedUser) {
          callback(JSON.parse(storedUser));
        } else {
          callback(null);
        }
      };

      // Poll periodically/trigger checks via custom event for reactivity
      checkLocalUser();
      const handler = () => checkLocalUser();
      window.addEventListener('auth-state-change', handler);
      return () => {
        window.removeEventListener('auth-state-change', handler);
      };
    }
  },

  register: async (email: string, password: string, name: string): Promise<UserProfile> => {
    if (isFirebaseConfigured) {
      const userCredential = await fbCreateUser(auth, email, password);
      const user = userCredential.user;
      await fbUpdateProfile(user, { displayName: name });
      
      // Auto-trigger verification email
      try {
        await fbSendEmailVerification(user);
      } catch (err) {
        console.warn("Could not dispatch initial email verification", err);
      }
      
      const profile: UserProfile = {
        uid: user.uid,
        name: name,
        email: email,
        createdAt: new Date().toISOString(),
        emailVerified: user.emailVerified,
        authProvider: 'password'
      };
      
      // Save profile to firestore
      try {
        await setDoc(doc(db, 'users', user.uid), profile);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}`);
      }
      return profile;
    } else {
      // Mock auth registration
      const users = getLocalUsers();
      if (users.find(u => u.email === email)) {
        throw new Error("此電子郵件已被註冊");
      }
      
      const newUser: UserProfile = {
        uid: "user_" + Math.random().toString(36).substr(2, 9),
        name: name,
        email: email,
        createdAt: new Date().toISOString(),
        emailVerified: false, // Default false for password signups
        authProvider: 'password'
      };
      
      users.push(newUser);
      saveLocalUsers(users);
      
      // Keep track of local credential mapping in localStorage as simple simulation hashes
      const credentials = JSON.parse(localStorage.getItem('portfolio_credentials') || '{}');
      credentials[email] = password;
      localStorage.setItem('portfolio_credentials', JSON.stringify(credentials));

      localStorage.setItem('portfolio_current_user', JSON.stringify(newUser));
      window.dispatchEvent(new Event('auth-state-change'));
      return newUser;
    }
  },

  login: async (email: string, password: string): Promise<UserProfile> => {
    if (isFirebaseConfigured) {
      let userCredential;
      try {
        userCredential = await fbSignIn(auth, email, password);
      } catch (signInError: any) {
        // If it's the demo account and it doesn't exist yet, automatically register it!
        if (email === 'demo@example.com' && password === 'password') {
          try {
            return await authService.register('demo@example.com', 'password', '資深攝影師');
          } catch (regError) {
            console.error("Auto-registration of demo user failed:", regError);
          }
        }
        throw signInError;
      }
      const user = userCredential.user;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          return {
            ...profile,
            emailVerified: user.emailVerified,
            authProvider: 'password'
          };
        } else {
          const fallbackProfile: UserProfile = {
            uid: user.uid,
            name: user.displayName || '使用者',
            email: user.email || '',
            createdAt: new Date().toISOString(),
            emailVerified: user.emailVerified,
            authProvider: 'password'
          };
          try {
            await setDoc(doc(db, 'users', user.uid), fallbackProfile);
          } catch (writeError) {
            console.warn("Failed to create user document on login:", writeError);
          }
          return fallbackProfile;
        }
      } catch (error) {
        console.warn("Firestore user profile retrieval failed on login, falling back to base profile:", error);
        return {
          uid: user.uid,
          name: user.displayName || '使用者',
          email: user.email || '',
          createdAt: new Date().toISOString(),
          emailVerified: user.emailVerified,
          authProvider: 'password'
        };
      }
    } else {
      // Mock auth login
      const credentials = JSON.parse(localStorage.getItem('portfolio_credentials') || '{"demo@example.com":"password"}');
      const users = getLocalUsers();
      
      if (credentials[email] === password) {
        const foundUser = users.find(u => u.email === email);
        if (foundUser) {
          localStorage.setItem('portfolio_current_user', JSON.stringify(foundUser));
          window.dispatchEvent(new Event('auth-state-change'));
          return foundUser;
        }
      }
      throw new Error("電子郵件或密碼錯誤");
    }
  },

  loginWithGoogle: async (): Promise<UserProfile> => {
    if (isFirebaseConfigured) {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          return {
            ...profile,
            emailVerified: user.emailVerified,
            authProvider: 'google'
          };
        } else {
          const profile: UserProfile = {
            uid: user.uid,
            name: user.displayName || 'Google 創作者',
            email: user.email || '',
            createdAt: new Date().toISOString(),
            emailVerified: user.emailVerified,
            authProvider: 'google'
          };
          try {
            await setDoc(doc(db, 'users', user.uid), profile);
          } catch (writeErr) {
            handleFirestoreError(writeErr, OperationType.CREATE, `users/${user.uid}`);
          }
          return profile;
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        throw error;
      }
    } else {
      // Local Mock Google Sign-In
      const mockGoogleUser: UserProfile = {
        uid: "google_user_" + Math.random().toString(36).substr(2, 9),
        name: "Google 創作者",
        email: "google-creator@example.com",
        createdAt: new Date().toISOString(),
        emailVerified: true, // Google accounts are pre-verified
        authProvider: 'google'
      };
      
      const users = getLocalUsers();
      if (!users.some(u => u.email === mockGoogleUser.email)) {
        users.push(mockGoogleUser);
        saveLocalUsers(users);
      }
      
      localStorage.setItem('portfolio_current_user', JSON.stringify(mockGoogleUser));
      window.dispatchEvent(new Event('auth-state-change'));
      return mockGoogleUser;
    }
  },

  sendPasswordReset: async (email: string): Promise<void> => {
    if (isFirebaseConfigured) {
      await fbSendPasswordResetEmail(auth, email);
    } else {
      // Mock email check
      const users = getLocalUsers();
      const userExists = users.some(u => u.email === email);
      if (!userExists) {
        throw new Error("此電子郵件尚未註冊創作者帳戶");
      }
      console.log(`[Mock] Simulated Password Reset email dispatched to: ${email}`);
    }
  },

  sendVerification: async (): Promise<void> => {
    if (isFirebaseConfigured) {
      if (auth.currentUser) {
        await fbSendEmailVerification(auth.currentUser);
      } else {
        throw new Error("找不到目前登入的使用者");
      }
    } else {
      console.log("[Mock] Simulated Email Verification link dispatched!");
    }
  },

  verifyEmailSimulate: () => {
    const storedUser = localStorage.getItem('portfolio_current_user');
    if (storedUser) {
      const u = JSON.parse(storedUser);
      u.emailVerified = true;
      localStorage.setItem('portfolio_current_user', JSON.stringify(u));
      
      const users = getLocalUsers();
      const index = users.findIndex(usr => usr.uid === u.uid);
      if (index !== -1) {
        users[index].emailVerified = true;
        saveLocalUsers(users);
      }
      
      window.dispatchEvent(new Event('auth-state-change'));
    }
  },

  logout: async () => {
    if (isFirebaseConfigured) {
      await fbSignOut(auth);
    } else {
      localStorage.removeItem('portfolio_current_user');
      window.dispatchEvent(new Event('auth-state-change'));
    }
  }
};

// Dual-Mode Firestore + Storage Implementation
export const dbService = {
  isEmulator: !isFirebaseConfigured,

  // Fetch all photos
  getAllPhotos: async (): Promise<Photo[]> => {
    if (isFirebaseConfigured) {
      try {
        const querySnapshot = await getDocs(collection(db, "photos"));
        const photos: Photo[] = [];
        querySnapshot.forEach((doc) => {
          photos.push({ id: doc.id, ...doc.data() } as Photo);
        });

        // IF the remote database is empty, auto-seed it with our beautiful default photos!
        if (photos.length === 0) {
          console.log("Remote photos collection is empty. Auto-seeding default photos to Firestore...");
          const defaultPhotos = seedDefaultPhotos();
          
          // Get current logged-in user to comply with rules, else just append locally for viewing
          const currentUserId = auth?.currentUser?.uid;

          for (const item of defaultPhotos) {
            const { id, ...photoData } = item;
            try {
              if (currentUserId) {
                await setDoc(doc(db, "photos", id), {
                  ...photoData,
                  userId: currentUserId // Seed owned by current user
                });
                photos.push({ ...item, userId: currentUserId });
              } else {
                // Not logged in (guest), can't write to remote, so just show locally
                photos.push(item);
              }
            } catch (seedErr) {
              console.warn("Failed to seed photo: ", id, seedErr);
              // Fallback to local item memory so standard user can still view items
              photos.push(item);
            }
          }

          if (photos.length === 0) {
            return getLocalPhotos().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          }
        }

        // Sort by createdAt descending
        return photos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } catch (error) {
        console.warn("Firestore list photos failed, falling back to local storage:", error);
        return getLocalPhotos().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } else {
      return getLocalPhotos().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  },

  // Get single photo details
  getPhotoById: async (id: string): Promise<Photo | null> => {
    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "photos", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as Photo;
        }
        return null;
      } catch (error) {
        console.warn(`Firestore get photo ${id} failed, falling back to local storage:`, error);
        const photos = getLocalPhotos();
        return photos.find(p => p.id === id) || null;
      }
    } else {
      const photos = getLocalPhotos();
      return photos.find(p => p.id === id) || null;
    }
  },

  // Save/Upload standard photo function with image conversion/upload handling
  createPhoto: async (
    photoData: Omit<Photo, 'id' | 'imageUrl' | 'createdAt'>, 
    imageFile: File | null,
    manualUrl?: string
  ): Promise<Photo> => {
    let finalImageUrl = manualUrl || "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1200&q=80";
    const timestamp = new Date().toISOString();

    if (imageFile) {
      if (isFirebaseConfigured) {
        const storageRef = ref(storage, `photos/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        finalImageUrl = await getDownloadURL(snapshot.ref);
      } else {
        // Convert image file to Base64 to save offline in localStorage nicely!
        finalImageUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
          reader.readAsDataURL(imageFile);
        });
      }
    }

    if (isFirebaseConfigured) {
      try {
        const docRef = await addDoc(collection(db, "photos"), {
          ...photoData,
          imageUrl: finalImageUrl,
          createdAt: timestamp
        });
        return {
          id: docRef.id,
          ...photoData,
          imageUrl: finalImageUrl,
          createdAt: timestamp
        };
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, "photos");
        throw error;
      }
    } else {
      const photos = getLocalPhotos();
      const newPhoto: Photo = {
        id: "photo_" + Math.random().toString(36).substr(2, 9),
        ...photoData,
        imageUrl: finalImageUrl,
        createdAt: timestamp
      };
      photos.unshift(newPhoto);
      saveLocalPhotos(photos);
      return newPhoto;
    }
  },

  // Update photo details
  updatePhoto: async (
    id: string, 
    photoData: Partial<Omit<Photo, 'id' | 'imageUrl' | 'createdAt' | 'userId'>>, 
    imageFile: File | null,
    manualUrl?: string
  ): Promise<Photo> => {
    const existingPhoto = await dbService.getPhotoById(id);
    if (!existingPhoto) {
      throw new Error("作品不存在");
    }

    let finalImageUrl = manualUrl || existingPhoto.imageUrl;

    if (imageFile) {
      if (isFirebaseConfigured) {
        // Safe delete old image from Storage first if it was uploaded
        if (existingPhoto.imageUrl && existingPhoto.imageUrl.includes("firebasestorage")) {
          try {
            const oldRef = ref(storage, existingPhoto.imageUrl);
            await deleteObject(oldRef);
          } catch(e) {
            console.warn("Could not delete previous storage image:", e);
          }
        }
        
        const storageRef = ref(storage, `photos/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        finalImageUrl = await getDownloadURL(snapshot.ref);
      } else {
        // Convert to Base64 for local
        finalImageUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
          reader.readAsDataURL(imageFile);
        });
      }
    }

    const updatedFields = {
      ...photoData,
      imageUrl: finalImageUrl
    };

    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "photos", id);
        await updateDoc(docRef, updatedFields);
        return {
          ...existingPhoto,
          ...updatedFields
        };
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `photos/${id}`);
        throw error;
      }
    } else {
      const photos = getLocalPhotos();
      const index = photos.findIndex(p => p.id === id);
      if (index !== -1) {
        photos[index] = {
          ...photos[index],
          ...updatedFields
        };
        saveLocalPhotos(photos);
        return photos[index];
      }
      throw new Error("作品不存在於本地紀錄中");
    }
  },

  // Delete photography work
  deletePhoto: async (id: string): Promise<void> => {
    const existingPhoto = await dbService.getPhotoById(id);
    if (!existingPhoto) {
      throw new Error("作品不存在");
    }

    if (isFirebaseConfigured) {
      // Delete from storage
      if (existingPhoto.imageUrl && existingPhoto.imageUrl.includes("firebasestorage")) {
        try {
          const oldRef = ref(storage, existingPhoto.imageUrl);
          await deleteObject(oldRef);
        } catch(e) {
          console.warn("Could not delete from storage bucket:", e);
        }
      }
      // Delete from firestore
      try {
        await deleteDoc(doc(db, "photos", id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `photos/${id}`);
      }
    } else {
      const photos = getLocalPhotos();
      const updatedPhotos = photos.filter(p => p.id !== id);
      saveLocalPhotos(updatedPhotos);
    }
  }
};
