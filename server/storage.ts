import { db } from "./db";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import {
  profiles,
  serviceCategories,
  services,
  staffSkills,
  clients,
  appointments,
  type Profile,
  type InsertProfile,
  type ProfileWithSkills,
  type ServiceCategory,
  type InsertServiceCategory,
  type Service,
  type InsertService,
  type ServiceWithCategory,
  type Client,
  type InsertClient,
  type Appointment,
  type InsertAppointment,
  type AppointmentWithDetails,
  type StaffSkill,
  type DashboardKPIs,
  type TopEmployee,
  type TopService,
  type GoldenClient,
  type AuthUser,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Auth
  authenticateUser(email: string, password: string): Promise<AuthUser | null>;

  // Profiles
  getProfiles(): Promise<ProfileWithSkills[]>;
  getProfile(id: string): Promise<ProfileWithSkills | undefined>;
  getStaffProfiles(): Promise<Profile[]>;
  createProfile(profile: InsertProfile & { skills?: number[] }): Promise<Profile>;
  updateProfile(id: string, profile: Partial<InsertProfile> & { skills?: number[] }): Promise<Profile | undefined>;
  deleteProfile(id: string): Promise<boolean>;

  // Service Categories
  getServiceCategories(): Promise<ServiceCategory[]>;

  // Services
  getServices(): Promise<ServiceWithCategory[]>;
  getService(id: string): Promise<ServiceWithCategory | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: string): Promise<boolean>;

  // Staff Skills
  getStaffSkills(): Promise<StaffSkill[]>;
  setStaffSkills(profileId: string, categoryIds: number[]): Promise<void>;

  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;

  // Appointments
  getAppointments(): Promise<AppointmentWithDetails[]>;
  getAppointmentsByStaff(staffId: string): Promise<AppointmentWithDetails[]>;
  getAppointmentsByClient(clientId: string): Promise<AppointmentWithDetails[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: string, status: string): Promise<Appointment | undefined>;
  deleteAppointment(id: string): Promise<boolean>;

  // Dashboard
  getDashboardKPIs(): Promise<DashboardKPIs>;
  getTopEmployees(): Promise<TopEmployee[]>;
  getTopServices(): Promise<TopService[]>;
  getGoldenClient(): Promise<GoldenClient | null>;
}

export class DatabaseStorage implements IStorage {
  // Auth
  async authenticateUser(email: string, password: string): Promise<AuthUser | null> {
    const [user] = await db
      .select()
      .from(profiles)
      .where(and(eq(profiles.email, email), eq(profiles.password, password)));

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      colorCode: user.colorCode || '#3B82F6',
    };
  }

  // Profiles
  async getProfiles(): Promise<ProfileWithSkills[]> {
    const allProfiles = await db.select().from(profiles);
    const results: ProfileWithSkills[] = [];

    for (const p of allProfiles) {
      const skills = await db
        .select()
        .from(staffSkills)
        .where(eq(staffSkills.profileId, p.id));

      results.push({
        ...p,
        skills: skills.map(s => s.categoryId),
      });
    }

    return results;
  }

  async getProfile(id: string): Promise<ProfileWithSkills | undefined> {
    const [p] = await db.select().from(profiles).where(eq(profiles.id, id));
    if (!p) return undefined;

    const skills = await db
      .select()
      .from(staffSkills)
      .where(eq(staffSkills.profileId, p.id));

    return {
      ...p,
      skills: skills.map(s => s.categoryId),
    };
  }

  async getStaffProfiles(): Promise<Profile[]> {
    return db
      .select()
      .from(profiles)
      .where(sql`role IN ('staff', 'reception')`);
  }

  async createProfile(data: InsertProfile & { skills?: number[] }): Promise<Profile> {
    const id = randomUUID();
    const { skills, ...profileData } = data;

    const [newProfile] = await db
      .insert(profiles)
      .values({ ...profileData, id })
      .returning();

    if (skills && skills.length > 0) {
      await db.insert(staffSkills).values(
        skills.map(categoryId => ({ profileId: id, categoryId }))
      );
    }

    return newProfile;
  }

  async updateProfile(id: string, data: Partial<InsertProfile> & { skills?: number[] }): Promise<Profile | undefined> {
    const { skills, ...updates } = data;

    const [updated] = await db
      .update(profiles)
      .set(updates)
      .where(eq(profiles.id, id))
      .returning();

    if (!updated) return undefined;

    if (skills !== undefined) {
      await db.delete(staffSkills).where(eq(staffSkills.profileId, id));
      if (skills.length > 0) {
        await db.insert(staffSkills).values(
          skills.map(categoryId => ({ profileId: id, categoryId }))
        );
      }
    }

    return updated;
  }

  async deleteProfile(id: string): Promise<boolean> {
    await db.delete(staffSkills).where(eq(staffSkills.profileId, id));
    const [deleted] = await db.delete(profiles).where(eq(profiles.id, id)).returning();
    return !!deleted;
  }

  // Service Categories
  async getServiceCategories(): Promise<ServiceCategory[]> {
    return db.select().from(serviceCategories);
  }

  // Services
  async getServices(): Promise<ServiceWithCategory[]> {
    const allServices = await db.select().from(services);
    const results: ServiceWithCategory[] = [];

    for (const s of allServices) {
      const [category] = await db
        .select()
        .from(serviceCategories)
        .where(eq(serviceCategories.id, s.categoryId));

      results.push({ ...s, category });
    }

    return results;
  }

  async getService(id: string): Promise<ServiceWithCategory | undefined> {
    const [s] = await db.select().from(services).where(eq(services.id, id));
    if (!s) return undefined;

    const [category] = await db
      .select()
      .from(serviceCategories)
      .where(eq(serviceCategories.id, s.categoryId));

    return { ...s, category };
  }

  async createService(data: InsertService): Promise<Service> {
    const id = randomUUID();
    const [newService] = await db
      .insert(services)
      .values({ ...data, id })
      .returning();
    return newService;
  }

  async updateService(id: string, data: Partial<InsertService>): Promise<Service | undefined> {
    const [updated] = await db
      .update(services)
      .set(data)
      .where(eq(services.id, id))
      .returning();
    return updated;
  }

  async deleteService(id: string): Promise<boolean> {
    const [deleted] = await db.delete(services).where(eq(services.id, id)).returning();
    return !!deleted;
  }

  // Staff Skills
  async getStaffSkills(): Promise<StaffSkill[]> {
    return db.select().from(staffSkills);
  }

  async setStaffSkills(profileId: string, categoryIds: number[]): Promise<void> {
    await db.delete(staffSkills).where(eq(staffSkills.profileId, profileId));
    if (categoryIds.length > 0) {
      await db.insert(staffSkills).values(
        categoryIds.map(categoryId => ({ profileId, categoryId }))
      );
    }
  }

  // Clients
  async getClients(): Promise<Client[]> {
    return db.select().from(clients);
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [c] = await db.select().from(clients).where(eq(clients.id, id));
    return c;
  }

  async createClient(data: InsertClient): Promise<Client> {
    const id = randomUUID();
    const [newClient] = await db
      .insert(clients)
      .values({ ...data, id })
      .returning();
    return newClient;
  }

  async updateClient(id: string, data: Partial<InsertClient>): Promise<Client | undefined> {
    const [updated] = await db
      .update(clients)
      .set(data)
      .where(eq(clients.id, id))
      .returning();
    return updated;
  }

  async deleteClient(id: string): Promise<boolean> {
    const [deleted] = await db.delete(clients).where(eq(clients.id, id)).returning();
    return !!deleted;
  }

  // Appointments
  private async getAppointmentWithDetails(apt: Appointment): Promise<AppointmentWithDetails> {
    const [client] = await db.select().from(clients).where(eq(clients.id, apt.clientId));
    const [staff] = await db.select().from(profiles).where(eq(profiles.id, apt.staffId));
    const [service] = await db.select().from(services).where(eq(services.id, apt.serviceId));
    const [category] = await db.select().from(serviceCategories).where(eq(serviceCategories.id, service.categoryId));

    return {
      ...apt,
      client,
      staff,
      service: { ...service, category },
    };
  }

  async getAppointments(): Promise<AppointmentWithDetails[]> {
    const allApts = await db.select().from(appointments);
    return Promise.all(allApts.map(apt => this.getAppointmentWithDetails(apt)));
  }

  async getAppointmentsByStaff(staffId: string): Promise<AppointmentWithDetails[]> {
    const staffApts = await db
      .select()
      .from(appointments)
      .where(eq(appointments.staffId, staffId));
    return Promise.all(staffApts.map(apt => this.getAppointmentWithDetails(apt)));
  }

  async getAppointmentsByClient(clientId: string): Promise<AppointmentWithDetails[]> {
    const clientApts = await db
      .select()
      .from(appointments)
      .where(eq(appointments.clientId, clientId));
    return Promise.all(clientApts.map(apt => this.getAppointmentWithDetails(apt)));
  }

  async createAppointment(data: InsertAppointment): Promise<Appointment> {
    const id = randomUUID();
    const [newApt] = await db
      .insert(appointments)
      .values({
        ...data,
        id,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime)
      })
      .returning();
    return newApt;
  }

  async updateAppointmentStatus(id: string, status: string): Promise<Appointment | undefined> {
    const [updated] = await db
      .update(appointments)
      .set({ status: status as any })
      .where(eq(appointments.id, id))
      .returning();
    return updated;
  }

  async deleteAppointment(id: string): Promise<boolean> {
    const [deleted] = await db.delete(appointments).where(eq(appointments.id, id)).returning();
    return !!deleted;
  }

  // Dashboard
  async getDashboardKPIs(): Promise<DashboardKPIs> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const startOfYear = new Date();
    startOfYear.setMonth(0, 1);
    startOfYear.setHours(0, 0, 0, 0);

    const allAppointments = await db.select().from(appointments);
    const allServices = await db.select().from(services);
    const serviceMap = new Map(allServices.map(s => [s.id, s.price]));

    let revenueToday = 0;
    let revenueMonth = 0;
    let revenueYear = 0;
    let appointmentsToday = 0;
    let appointmentsCompleted = 0;
    let appointmentsCancelled = 0;

    for (const apt of allAppointments) {
      const price = serviceMap.get(apt.serviceId) || 0;
      const aptDate = new Date(apt.startTime);

      if (apt.status === 'completed') {
        appointmentsCompleted++;
        if (aptDate >= startOfDay && aptDate < endOfDay) {
          revenueToday += price;
          appointmentsToday++;
        }
        if (aptDate >= startOfMonth) revenueMonth += price;
        if (aptDate >= startOfYear) revenueYear += price;
      } else if (apt.status === 'cancelled') {
        appointmentsCancelled++;
      }
    }

    return {
      revenueToday,
      revenueMonth,
      revenueYear,
      appointmentsToday,
      appointmentsCompleted,
      appointmentsCancelled,
    };
  }

  async getTopEmployees(): Promise<TopEmployee[]> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const apts = await db
      .select({
        staffId: appointments.staffId,
        count: sql<number>`count(*)::int`,
        revenue: sql<number>`sum(services.price)::int`,
      })
      .from(appointments)
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .where(and(eq(appointments.status, 'completed'), gte(appointments.startTime, startOfMonth)))
      .groupBy(appointments.staffId)
      .orderBy(desc(sql`sum(services.price)`))
      .limit(5);

    const results: TopEmployee[] = [];
    for (const res of apts) {
      const [profile] = await db.select().from(profiles).where(eq(profiles.id, res.staffId));
      if (profile) {
        results.push({
          id: profile.id,
          name: `${profile.firstName} ${profile.lastName}`,
          colorCode: profile.colorCode || '#3B82F6',
          revenue: res.revenue,
          appointmentsCount: res.count,
        });
      }
    }
    return results;
  }

  async getTopServices(): Promise<TopService[]> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const stats = await db
      .select({
        serviceId: appointments.serviceId,
        count: sql<number>`count(*)::int`,
        revenue: sql<number>`sum(services.price)::int`,
      })
      .from(appointments)
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .where(and(eq(appointments.status, 'completed'), gte(appointments.startTime, startOfMonth)))
      .groupBy(appointments.serviceId)
      .orderBy(desc(sql`count(*)`))
      .limit(5);

    const results: TopService[] = [];
    for (const res of stats) {
      const service = await this.getService(res.serviceId);
      if (service) {
        results.push({
          id: service.id,
          name: service.name,
          categoryName: service.category.name,
          count: res.count,
          revenue: res.revenue,
        });
      }
    }
    return results;
  }

  async getGoldenClient(): Promise<GoldenClient | null> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [stats] = await db
      .select({
        clientId: appointments.clientId,
        count: sql<number>`count(*)::int`,
        revenue: sql<number>`sum(services.price)::int`,
      })
      .from(appointments)
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .where(and(eq(appointments.status, 'completed'), gte(appointments.startTime, startOfMonth)))
      .groupBy(appointments.clientId)
      .orderBy(desc(sql`sum(services.price)`))
      .limit(1);

    if (!stats) return null;

    const [client] = await db.select().from(clients).where(eq(clients.id, stats.clientId));
    if (!client) return null;

    return {
      id: client.id,
      name: client.fullName,
      phone: client.phone,
      totalSpent: stats.revenue,
      appointmentsCount: stats.count,
    };
  }
}

export const storage = new DatabaseStorage();
