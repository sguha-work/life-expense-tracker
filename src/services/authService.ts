import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../adaptors/firebase';
import bcrypt from 'bcryptjs';
import Cookies from 'js-cookie';
import { User, AuthSession } from '../interfaces';
import { config } from '../configuration/configure';

const USERS_COLLECTION = 'users';

export const authService = {
  async register(name: string, phone: string, passwordString: string): Promise<User> {
    // Check if phone already exists
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where("phone", "==", phone));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      throw new Error("Phone number already registered");
    }

    // Hash password
    const salt = bcrypt.genSaltSync(config.auth.passwordSaltRounds);
    const passwordHash = bcrypt.hashSync(passwordString, salt);

    // Create user
    const newUser = {
      name,
      phone,
      passwordHash,
      createdAt: Date.now(),
    };

    const docRef = await addDoc(usersRef, newUser);
    const user: User = { id: docRef.id, ...newUser };
    localStorage['username'] = user.name;
    this.createSession(user);
    return user;
  },

  async login(phone: string, passwordString: string): Promise<User> {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where("phone", "==", phone));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error("Invalid phone number or password");
    }

    const doc = snapshot.docs[0];
    const user = { id: doc.id, ...doc.data() } as User;

    // Verify password
    const isMatch = bcrypt.compareSync(passwordString, user.passwordHash);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    this.createSession(user);
    return user;
  },

  createSession(user: User): void {
    const expiresAt = Date.now() + config.auth.cookieExpiresInHours * 60 * 60 * 1000;
    const sessionData: AuthSession = { userId: user.id, expiresAt };
    
    Cookies.set(config.auth.cookieName, JSON.stringify(sessionData), {
      expires: config.auth.cookieExpiresInHours / 24, // js-cookie expects days
      secure: window.location.protocol === 'https:',
      sameSite: 'strict',
    });
  },

  getSession(): AuthSession | null {
    const cookieData = Cookies.get(config.auth.cookieName);
    if (!cookieData) return null;

    try {
      const session: AuthSession = JSON.parse(cookieData);
      if (Date.now() > session.expiresAt) {
        this.logout();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },

  logout(): void {
    Cookies.remove(config.auth.cookieName);
  },

  async getCurrentUser(): Promise<User | null> {
    const session = this.getSession();
    if (!session) return null;

    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where("__name__", "==", session.userId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      this.logout();
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  }
};
