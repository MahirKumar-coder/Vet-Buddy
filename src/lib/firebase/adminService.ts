import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { createUserWithEmailAndPassword, deleteUser, getAuth } from "firebase/auth";

export interface Admin {
  id?: string;
  uid?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: "super_admin" | "admin" | "manager";
  permissions?: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const adminsCollection = collection(db, "admins");
const auth = getAuth();

// Create a new admin
export const createAdmin = async (
  admin: Admin,
  password: string
): Promise<string> => {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      admin.email,
      password
    );

    // Create admin document
    const docRef = doc(adminsCollection);
    await setDoc(docRef, {
      ...admin,
      uid: userCredential.user.uid,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating admin:", error);
    throw error;
  }
};

// Get all admins
export const getAllAdmins = async (): Promise<Admin[]> => {
  try {
    const snapshot = await getDocs(adminsCollection);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Admin));
  } catch (error) {
    console.error("Error fetching admins:", error);
    throw error;
  }
};

// Get admin by email
export const getAdminByEmail = async (email: string): Promise<Admin | null> => {
  try {
    const q = query(adminsCollection, where("email", "==", email));
    const snapshot = await getDocs(q);
    if (snapshot.docs.length > 0) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Admin;
    }
    return null;
  } catch (error) {
    console.error("Error fetching admin by email:", error);
    throw error;
  }
};

// Get admin by UID
export const getAdminByUID = async (uid: string): Promise<Admin | null> => {
  try {
    const q = query(adminsCollection, where("uid", "==", uid));
    const snapshot = await getDocs(q);
    if (snapshot.docs.length > 0) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Admin;
    }
    return null;
  } catch (error) {
    console.error("Error fetching admin by UID:", error);
    throw error;
  }
};

// Get single admin
export const getAdmin = async (adminId: string): Promise<Admin | null> => {
  try {
    const docRef = doc(adminsCollection, adminId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Admin;
    }
    return null;
  } catch (error) {
    console.error("Error fetching admin:", error);
    throw error;
  }
};

// Update admin
export const updateAdmin = async (
  adminId: string,
  updates: Partial<Admin>
): Promise<void> => {
  try {
    const docRef = doc(adminsCollection, adminId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating admin:", error);
    throw error;
  }
};

// Delete admin
export const deleteAdmin = async (adminId: string): Promise<void> => {
  try {
    const admin = await getAdmin(adminId);
    if (admin && admin.uid) {
      const adminUser = auth.currentUser;
      if (adminUser?.uid === admin.uid) {
        throw new Error("Cannot delete the current logged-in admin");
      }

      await auth.deleteUser(admin.uid);
    }

    // Delete admin document
    await deleteDoc(doc(adminsCollection, adminId));
  } catch (error) {
    console.error("Error deleting admin:", error);
    throw error;
  }
};

// Check admin permission
export const hasPermission = (
  admin: Admin,
  permission: string
): boolean => {
  if (admin.role === "super_admin") {
    return true;
  }
  return admin.permissions?.includes(permission) || false;
};

// Get admin by role
export const getAdminsByRole = async (role: Admin["role"]): Promise<Admin[]> => {
  try {
    const q = query(adminsCollection, where("role", "==", role));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Admin));
  } catch (error) {
    console.error("Error fetching admins by role:", error);
    throw error;
  }
};
