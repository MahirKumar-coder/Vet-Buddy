import {
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  off,
  push,
} from "firebase/database";
import { realtimeDb } from "@/firebase/firebase";

export interface Appointment {
  id?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  petName: string;
  petType: string;
  serviceType: string;
  appointmentDate: string;
  appointmentTime: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  createdAt?: number;
  updatedAt?: number;
}

// Create appointment
export const createAppointment = async (
  appointment: Appointment
): Promise<string> => {
  try {
    const appointmentsRef = ref(realtimeDb, "appointments");
    const newAppointmentRef = push(appointmentsRef);
    await set(newAppointmentRef, {
      ...appointment,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return newAppointmentRef.key!;
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
};

// Get appointment
export const getAppointment = async (appointmentId: string): Promise<Appointment | null> => {
  try {
    const appointmentRef = ref(realtimeDb, `appointments/${appointmentId}`);
    const snapshot = await get(appointmentRef);
    if (snapshot.exists()) {
      return { id: appointmentId, ...snapshot.val() } as Appointment;
    }
    return null;
  } catch (error) {
    console.error("Error fetching appointment:", error);
    throw error;
  }
};

// Get all appointments for customer
export const getCustomerAppointments = async (
  customerId: string
): Promise<Appointment[]> => {
  try {
    const appointmentsRef = ref(realtimeDb, "appointments");
    const snapshot = await get(appointmentsRef);
    if (snapshot.exists()) {
      const allAppointments = snapshot.val();
      return Object.entries(allAppointments)
  .filter(([, apt]: [string, any]) => apt.customerId === customerId)
  .map(([id, apt]: [string, any]) => ({ id, ...(apt as any) } as Appointment))
        .sort((a, b) => {
          const dateTimeA = new Date(`${a.appointmentDate} ${a.appointmentTime}`);
          const dateTimeB = new Date(`${b.appointmentDate} ${b.appointmentTime}`);
          return dateTimeB.getTime() - dateTimeA.getTime();
        });
    }
    return [];
  } catch (error) {
    console.error("Error fetching customer appointments:", error);
    throw error;
  }
};

// Get all appointments
export const getAllAppointments = async (): Promise<Appointment[]> => {
  try {
    const appointmentsRef = ref(realtimeDb, "appointments");
    const snapshot = await get(appointmentsRef);
    if (snapshot.exists()) {
      const allAppointments = snapshot.val();
      return Object.entries(allAppointments)
        .map(([id, apt]) => ({ id, ...apt } as Appointment))
        .sort((a, b) => {
          const dateTimeA = new Date(`${a.appointmentDate} ${a.appointmentTime}`);
          const dateTimeB = new Date(`${b.appointmentDate} ${b.appointmentTime}`);
          return dateTimeB.getTime() - dateTimeA.getTime();
        });
    }
    return [];
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
};

// Listen to appointments in real-time
export const listenToAppointments = (
  callback: (appointments: Appointment[]) => void
): (() => void) => {
  const appointmentsRef = ref(realtimeDb, "appointments");
  onValue(appointmentsRef, (snapshot) => {
    if (snapshot.exists()) {
      const allAppointments = snapshot.val();
      const appointments = Object.entries(allAppointments)
        .map(([id, apt]) => ({ id, ...apt } as Appointment))
        .sort((a, b) => {
          const dateTimeA = new Date(`${a.appointmentDate} ${a.appointmentTime}`);
          const dateTimeB = new Date(`${b.appointmentDate} ${b.appointmentTime}`);
          return dateTimeB.getTime() - dateTimeA.getTime();
        });
      callback(appointments);
    } else {
      callback([]);
    }
  });

  return () => off(appointmentsRef);
};

// Update appointment
export const updateAppointment = async (
  appointmentId: string,
  updates: Partial<Appointment>
): Promise<void> => {
  try {
    await update(ref(realtimeDb, `appointments/${appointmentId}`), {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    throw error;
  }
};

// Update appointment status
export const updateAppointmentStatus = async (
  appointmentId: string,
  status: Appointment["status"]
): Promise<void> => {
  try {
    await update(ref(realtimeDb, `appointments/${appointmentId}`), {
      status,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    throw error;
  }
};

// Delete appointment
export const deleteAppointment = async (appointmentId: string): Promise<void> => {
  try {
    await remove(ref(realtimeDb, `appointments/${appointmentId}`));
  } catch (error) {
    console.error("Error deleting appointment:", error);
    throw error;
  }
};

// Get appointments by date
export const getAppointmentsByDate = async (date: string): Promise<Appointment[]> => {
  try {
    const appointments = await getAllAppointments();
    return appointments.filter((apt) => apt.appointmentDate === date);
  } catch (error) {
    console.error("Error fetching appointments by date:", error);
    throw error;
  }
};

// Get available time slots
export const getAvailableTimeSlots = async (date: string): Promise<string[]> => {
  try {
    const allTimeSlots = [
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
    ];

    const bookedAppointments = await getAppointmentsByDate(date);
    const bookedTimes = bookedAppointments.map((apt) => apt.appointmentTime);

    return allTimeSlots.filter((slot) => !bookedTimes.includes(slot));
  } catch (error) {
    console.error("Error fetching available time slots:", error);
    throw error;
  }
};
