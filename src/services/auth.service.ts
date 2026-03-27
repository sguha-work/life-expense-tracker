import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteField,
} from 'firebase/firestore';
import { db } from '../adaptors/firebase';
import bcrypt from 'bcryptjs';
import Cookies from 'js-cookie';
import { User, AuthSession } from '../interfaces';
import { config } from '../configuration/configure';
import { sendPasswordResetEmail } from './email.service';
import { buildResetPasswordUrl } from '../utils/resetPasswordUrl';

const USERS_COLLECTION = 'users';

const OTP_EXPIRY_MS = 10 * 60 * 1000;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function generateTenDigitOtp(): string {
  return String(Math.floor(1000000000 + Math.random() * 9000000000));
}

export const authService = {
  async register(
    name: string,
    phone: string,
    emailRaw: string,
    passwordString: string
  ): Promise<User> {
    const email = normalizeEmail(emailRaw);

    // Check if phone already exists
    const usersRef = collection(db, USERS_COLLECTION);
    const qPhone = query(usersRef, where('phone', '==', phone));
    const snapshotPhone = await getDocs(qPhone);

    if (!snapshotPhone.empty) {
      throw new Error('Phone number already registered');
    }

    const qEmail = query(usersRef, where('email', '==', email));
    const snapshotEmail = await getDocs(qEmail);
    if (!snapshotEmail.empty) {
      throw new Error('Email already registered');
    }

    // Hash password
    const salt = bcrypt.genSaltSync(config.auth.passwordSaltRounds);
    const passwordHash = bcrypt.hashSync(passwordString, salt);

    // Create user
    const newUser = {
      name,
      phone,
      email,
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
  },

  async requestPasswordReset(emailRaw: string): Promise<void> {
    const email = normalizeEmail(emailRaw);
    if (!email) {
      throw new Error('Email is required');
    }
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return;
    }
    const userDoc = snapshot.docs[0];
    const otp = generateTenDigitOtp();
    const passwordResetOtpExpiresAt = Date.now() + OTP_EXPIRY_MS;
    await updateDoc(doc(db, USERS_COLLECTION, userDoc.id), {
      passwordResetOtp: otp,
      passwordResetOtpExpiresAt,
    });
    const resetLink = buildResetPasswordUrl(email);
    console.log({
      toEmail: email,
      otp,
      resetLink,
    })
    await sendPasswordResetEmail({
      toEmail: email,
      otp,
      resetLink,
    });
  },

  async resetPasswordWithOtp(
    emailRaw: string,
    otpRaw: string,
    newPassword: string
  ): Promise<void> {
    const email = normalizeEmail(emailRaw);
    const otp = otpRaw.trim();

    if (!email) {
      throw new Error('Email is required');
    }
    if (!/^\d{10}$/.test(otp)) {
      throw new Error('Enter the 10-digit code from your email');
    }
    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error('Invalid or expired code');
    }

    const userDoc = snapshot.docs[0];
    const data = userDoc.data() as User;

    if (!data.passwordResetOtp || data.passwordResetOtp !== otp) {
      throw new Error('Invalid or expired code');
    }
    if (
      data.passwordResetOtpExpiresAt == null ||
      Date.now() > data.passwordResetOtpExpiresAt
    ) {
      throw new Error('Invalid or expired code');
    }

    const salt = bcrypt.genSaltSync(config.auth.passwordSaltRounds);
    const passwordHash = bcrypt.hashSync(newPassword, salt);

    await updateDoc(doc(db, USERS_COLLECTION, userDoc.id), {
      passwordHash,
      passwordResetOtp: deleteField(),
      passwordResetOtpExpiresAt: deleteField(),
    });
  },

  async updateUserName(userId: string, name: string): Promise<void> {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error('Name is required');
    }
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, { name: trimmed });
    try {
      localStorage['username'] = trimmed;
    } catch {
      /* ignore */
    }
  },
};
