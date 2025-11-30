import { randomUUID } from "crypto";
import type {
  Profile,
  InsertProfile,
  ProfileWithSkills,
  ServiceCategory,
  InsertServiceCategory,
  Service,
  InsertService,
  ServiceWithCategory,
  Client,
  InsertClient,
  Appointment,
  InsertAppointment,
  AppointmentWithDetails,
  StaffSkill,
  InsertStaffSkill,
  DashboardKPIs,
  TopEmployee,
  TopService,
  GoldenClient,
  AuthUser,
  UserRole,
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private profiles: Map<string, Profile>;
  private serviceCategories: Map<number, ServiceCategory>;
  private services: Map<string, Service>;
  private staffSkills: Map<string, number[]>;
  private clients: Map<string, Client>;
  private appointments: Map<string, Appointment>;

  constructor() {
    this.profiles = new Map();
    this.serviceCategories = new Map();
    this.services = new Map();
    this.staffSkills = new Map();
    this.clients = new Map();
    this.appointments = new Map();
    
    this.initializeData();
  }

  private initializeData() {
    // Initialize service categories
    const categories: ServiceCategory[] = [
      { id: 1, name: "Onglerie" },
      { id: 2, name: "Massage" },
      { id: 3, name: "Hammam" },
      { id: 4, name: "Coiffure" },
      { id: 5, name: "Maquillage" },
      { id: 6, name: "Soins Visage" },
      { id: 7, name: "Épilation" },
    ];
    categories.forEach((c) => this.serviceCategories.set(c.id, c));

    // Initialize services (from the Anaros menu)
    const servicesData: Array<Omit<Service, "id" | "createdAt">> = [
      // Coiffure
      { categoryId: 4, name: "Brushing Cheveux Courts", price: 1000, duration: 30 },
      { categoryId: 4, name: "Brushing Cheveux Mi-longs", price: 1500, duration: 45 },
      { categoryId: 4, name: "Brushing Cheveux Longs", price: 2000, duration: 60 },
      { categoryId: 4, name: "Botox Capillaire", price: 15000, duration: 120 },
      { categoryId: 4, name: "Balayage Cheveux Courts", price: 15000, duration: 180 },
      { categoryId: 4, name: "Balayage Cheveux Mi-longs", price: 18000, duration: 200 },
      { categoryId: 4, name: "Coloration Racines", price: 5000, duration: 90 },
      { categoryId: 4, name: "Coupe Femme", price: 2500, duration: 45 },
      // Hammam
      { categoryId: 3, name: "Rituel Traditionnel", price: 2800, duration: 90 },
      { categoryId: 3, name: "Rituel Royal", price: 3800, duration: 120 },
      { categoryId: 3, name: "Rituel Sultana", price: 7000, duration: 150 },
      { categoryId: 3, name: "Gommage Savon Noir", price: 1500, duration: 45 },
      // Onglerie
      { categoryId: 1, name: "Vernis Semi-Permanent Mains", price: 3000, duration: 60 },
      { categoryId: 1, name: "Vernis Semi-Permanent Pieds", price: 2500, duration: 45 },
      { categoryId: 1, name: "Gel Mains", price: 3500, duration: 75 },
      { categoryId: 1, name: "Gel Pieds", price: 3000, duration: 60 },
      { categoryId: 1, name: "Pédicure Thuya", price: 4500, duration: 90 },
      { categoryId: 1, name: "Manucure Classique", price: 1500, duration: 30 },
      // Massage
      { categoryId: 2, name: "Massage Anti-Stress", price: 6500, duration: 60 },
      { categoryId: 2, name: "Massage Relaxant", price: 5000, duration: 60 },
      { categoryId: 2, name: "Madérothérapie", price: 10000, duration: 90 },
      { categoryId: 2, name: "Massage aux Pierres Chaudes", price: 8000, duration: 75 },
      { categoryId: 2, name: "Drainage Lymphatique", price: 7500, duration: 60 },
      // Soins Visage
      { categoryId: 6, name: "Soin Marin aux 3 Algues", price: 6000, duration: 60 },
      { categoryId: 6, name: "Hydrafacial Hydraskin Coréen", price: 15000, duration: 75 },
      { categoryId: 6, name: "Soin Anti-Âge", price: 8000, duration: 60 },
      { categoryId: 6, name: "Soin Éclat", price: 5000, duration: 45 },
      // Maquillage
      { categoryId: 5, name: "Maquillage Jour", price: 4000, duration: 45 },
      { categoryId: 5, name: "Maquillage Soirée", price: 6000, duration: 60 },
      { categoryId: 5, name: "Maquillage Mariée", price: 15000, duration: 120 },
      // Épilation
      { categoryId: 7, name: "Épilation Sourcils", price: 500, duration: 15 },
      { categoryId: 7, name: "Épilation Jambes Complètes", price: 2500, duration: 45 },
      { categoryId: 7, name: "Épilation Corps Complet", price: 8000, duration: 120 },
    ];

    servicesData.forEach((s) => {
      const id = randomUUID();
      this.services.set(id, { ...s, id, createdAt: new Date() });
    });

    // Initialize staff (employees from Anaros)
    const staffData: Array<{
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role: UserRole;
      colorCode: string;
      skills: number[];
    }> = [
      // Admin
      { firstName: "Admin", lastName: "Anaros", email: "admin@anaros.com", password: "admin123", role: "superadmin", colorCode: "#E8B4B8", skills: [] },
      // Reception
      { firstName: "Amina", lastName: "Réception", email: "amina@anaros.com", password: "amina123", role: "reception", colorCode: "#D4AF37", skills: [] },
      // Onglerie staff
      { firstName: "Dounia", lastName: "Onglerie", email: "dounia@anaros.com", password: "dounia123", role: "staff", colorCode: "#EC4899", skills: [1] },
      { firstName: "Safa", lastName: "Onglerie", email: "safa@anaros.com", password: "safa123", role: "staff", colorCode: "#F472B6", skills: [1] },
      { firstName: "Chahinez", lastName: "Onglerie", email: "chahinez@anaros.com", password: "chahinez123", role: "staff", colorCode: "#FB7185", skills: [1] },
      // Massage
      { firstName: "Samira", lastName: "Massage", email: "samira@anaros.com", password: "samira123", role: "staff", colorCode: "#8B5CF6", skills: [2] },
      // Hammam
      { firstName: "Marie", lastName: "Hammam", email: "marie@anaros.com", password: "marie123", role: "staff", colorCode: "#06B6D4", skills: [3] },
      // Coiffure
      { firstName: "Samira", lastName: "Samou", email: "samira.samou@anaros.com", password: "samira123", role: "staff", colorCode: "#3B82F6", skills: [4] },
      { firstName: "Malika", lastName: "Coloration", email: "malika@anaros.com", password: "malika123", role: "staff", colorCode: "#6366F1", skills: [4] },
      { firstName: "Kiki", lastName: "Soins", email: "kiki@anaros.com", password: "kiki123", role: "staff", colorCode: "#10B981", skills: [4] },
      { firstName: "Houda", lastName: "Brushing", email: "houda@anaros.com", password: "houda123", role: "staff", colorCode: "#F59E0B", skills: [4] },
      { firstName: "Karima", lastName: "Balayage", email: "karima@anaros.com", password: "karima123", role: "staff", colorCode: "#EF4444", skills: [4] },
      // Maquillage
      { firstName: "Sara", lastName: "Maquillage", email: "sara@anaros.com", password: "sara123", role: "staff", colorCode: "#A855F7", skills: [5] },
      // Soins Visage & Épilation
      { firstName: "Saliha", lastName: "Soins", email: "saliha@anaros.com", password: "saliha123", role: "staff", colorCode: "#14B8A6", skills: [6, 7] },
      { firstName: "Amel", lastName: "Soins", email: "amel@anaros.com", password: "amel123", role: "staff", colorCode: "#84CC16", skills: [6, 7] },
    ];

    staffData.forEach((s) => {
      const id = randomUUID();
      const { skills, ...profile } = s;
      this.profiles.set(id, { ...profile, id, createdAt: new Date() });
      this.staffSkills.set(id, skills);
    });

    // Initialize some sample clients
    const clientsData: Array<Omit<Client, "id" | "createdAt">> = [
      { fullName: "Fatima Benali", phone: "0555 12 34 56", email: "fatima@email.com", notes: "Cliente fidèle, préfère les soins du matin" },
      { fullName: "Nadia Khelifi", phone: "0661 78 90 12", email: null, notes: "Allergique à certaines huiles essentielles" },
      { fullName: "Yasmine Boudjemaa", phone: "0770 23 45 67", email: "yasmine.b@email.com", notes: null },
      { fullName: "Leila Mansouri", phone: "0550 34 56 78", email: null, notes: "Préfère le thé sans sucre" },
      { fullName: "Samia Hadj", phone: "0660 45 67 89", email: "samia.hadj@email.com", notes: null },
      { fullName: "Aicha Bouzid", phone: "0771 56 78 90", email: null, notes: "VIP - Cliente dorée du mois dernier" },
      { fullName: "Karima Slimani", phone: "0551 67 89 01", email: "k.slimani@email.com", notes: null },
      { fullName: "Meriem Hamidi", phone: "0662 78 90 12", email: null, notes: "Préfère les créneaux du weekend" },
    ];

    clientsData.forEach((c) => {
      const id = randomUUID();
      this.clients.set(id, { ...c, id, createdAt: new Date() });
    });

    // Create some sample appointments for today
    this.createSampleAppointments();
  }

  private createSampleAppointments() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const staffList = Array.from(this.profiles.values()).filter(p => p.role === 'staff');
    const clientList = Array.from(this.clients.values());
    const serviceList = Array.from(this.services.values());

    // Create appointments for today
    const timeSlots = [9, 10, 11, 14, 15, 16, 17];

    staffList.slice(0, 5).forEach((staff, staffIndex) => {
      const staffSkillIds = this.staffSkills.get(staff.id) || [];
      const staffServices = serviceList.filter(s => staffSkillIds.includes(s.categoryId));

      if (staffServices.length === 0) return;

      // Create 2-3 appointments per staff member
      const numAppointments = 2 + Math.floor(Math.random() * 2);
      const usedSlots: number[] = [];

      for (let i = 0; i < numAppointments; i++) {
        let slot: number;
        do {
          slot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
        } while (usedSlots.includes(slot));
        usedSlots.push(slot);

        const service = staffServices[Math.floor(Math.random() * staffServices.length)];
        const client = clientList[(staffIndex + i) % clientList.length];

        const startTime = new Date(today);
        startTime.setHours(slot, 0, 0, 0);

        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + service.duration);

        const statuses: Array<"pending" | "confirmed" | "completed"> = ["pending", "confirmed", "completed"];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        const id = randomUUID();
        this.appointments.set(id, {
          id,
          createdAt: new Date(),
          startTime,
          endTime,
          clientId: client.id,
          staffId: staff.id,
          serviceId: service.id,
          status,
        });
      }
    });
  }

  // Auth
  async authenticateUser(email: string, password: string): Promise<AuthUser | null> {
    const profile = Array.from(this.profiles.values()).find(
      p => p.email.toLowerCase() === email.toLowerCase() && p.password === password
    );
    
    if (!profile) return null;

    return {
      id: profile.id,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      role: profile.role,
      colorCode: profile.colorCode || '#3B82F6',
    };
  }

  // Profiles
  async getProfiles(): Promise<ProfileWithSkills[]> {
    return Array.from(this.profiles.values()).map(p => ({
      ...p,
      skills: this.staffSkills.get(p.id) || [],
    }));
  }

  async getProfile(id: string): Promise<ProfileWithSkills | undefined> {
    const profile = this.profiles.get(id);
    if (!profile) return undefined;
    return {
      ...profile,
      skills: this.staffSkills.get(id) || [],
    };
  }

  async getStaffProfiles(): Promise<Profile[]> {
    return Array.from(this.profiles.values()).filter(
      p => p.role === 'staff' || p.role === 'reception'
    );
  }

  async createProfile(data: InsertProfile & { skills?: number[] }): Promise<Profile> {
    const id = randomUUID();
    const { skills, ...profileData } = data;
    const profile: Profile = {
      ...profileData,
      id,
      createdAt: new Date(),
    };
    this.profiles.set(id, profile);
    if (skills) {
      this.staffSkills.set(id, skills);
    }
    return profile;
  }

  async updateProfile(id: string, data: Partial<InsertProfile> & { skills?: number[] }): Promise<Profile | undefined> {
    const profile = this.profiles.get(id);
    if (!profile) return undefined;

    const { skills, ...updates } = data;
    const updated = { ...profile, ...updates };
    this.profiles.set(id, updated);
    
    if (skills !== undefined) {
      this.staffSkills.set(id, skills);
    }
    
    return updated;
  }

  async deleteProfile(id: string): Promise<boolean> {
    this.staffSkills.delete(id);
    return this.profiles.delete(id);
  }

  // Service Categories
  async getServiceCategories(): Promise<ServiceCategory[]> {
    return Array.from(this.serviceCategories.values());
  }

  // Services
  async getServices(): Promise<ServiceWithCategory[]> {
    return Array.from(this.services.values()).map(s => ({
      ...s,
      category: this.serviceCategories.get(s.categoryId)!,
    }));
  }

  async getService(id: string): Promise<ServiceWithCategory | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;
    return {
      ...service,
      category: this.serviceCategories.get(service.categoryId)!,
    };
  }

  async createService(data: InsertService): Promise<Service> {
    const id = randomUUID();
    const service: Service = {
      ...data,
      id,
      createdAt: new Date(),
    };
    this.services.set(id, service);
    return service;
  }

  async updateService(id: string, data: Partial<InsertService>): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;
    const updated = { ...service, ...data };
    this.services.set(id, updated);
    return updated;
  }

  async deleteService(id: string): Promise<boolean> {
    return this.services.delete(id);
  }

  // Staff Skills
  async getStaffSkills(): Promise<StaffSkill[]> {
    const skills: StaffSkill[] = [];
    this.staffSkills.forEach((categoryIds, profileId) => {
      categoryIds.forEach(categoryId => {
        skills.push({ profileId, categoryId });
      });
    });
    return skills;
  }

  async setStaffSkills(profileId: string, categoryIds: number[]): Promise<void> {
    this.staffSkills.set(profileId, categoryIds);
  }

  // Clients
  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async getClient(id: string): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async createClient(data: InsertClient): Promise<Client> {
    const id = randomUUID();
    const client: Client = {
      ...data,
      id,
      createdAt: new Date(),
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: string, data: Partial<InsertClient>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;
    const updated = { ...client, ...data };
    this.clients.set(id, updated);
    return updated;
  }

  async deleteClient(id: string): Promise<boolean> {
    return this.clients.delete(id);
  }

  // Appointments
  private async getAppointmentWithDetails(apt: Appointment): Promise<AppointmentWithDetails> {
    const client = this.clients.get(apt.clientId)!;
    const staff = this.profiles.get(apt.staffId)!;
    const service = this.services.get(apt.serviceId)!;
    const category = this.serviceCategories.get(service.categoryId)!;

    return {
      ...apt,
      client,
      staff,
      service: { ...service, category },
    };
  }

  async getAppointments(): Promise<AppointmentWithDetails[]> {
    const appointments = Array.from(this.appointments.values());
    return Promise.all(appointments.map(apt => this.getAppointmentWithDetails(apt)));
  }

  async getAppointmentsByStaff(staffId: string): Promise<AppointmentWithDetails[]> {
    const appointments = Array.from(this.appointments.values())
      .filter(apt => apt.staffId === staffId);
    return Promise.all(appointments.map(apt => this.getAppointmentWithDetails(apt)));
  }

  async getAppointmentsByClient(clientId: string): Promise<AppointmentWithDetails[]> {
    const appointments = Array.from(this.appointments.values())
      .filter(apt => apt.clientId === clientId);
    return Promise.all(appointments.map(apt => this.getAppointmentWithDetails(apt)));
  }

  async createAppointment(data: InsertAppointment): Promise<Appointment> {
    const id = randomUUID();
    const appointment: Appointment = {
      ...data,
      id,
      createdAt: new Date(),
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointmentStatus(id: string, status: string): Promise<Appointment | undefined> {
    const apt = this.appointments.get(id);
    if (!apt) return undefined;
    const updated = { ...apt, status: status as any };
    this.appointments.set(id, updated);
    return updated;
  }

  async deleteAppointment(id: string): Promise<boolean> {
    return this.appointments.delete(id);
  }

  // Dashboard
  async getDashboardKPIs(): Promise<DashboardKPIs> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    
    const appointments = Array.from(this.appointments.values());
    
    const completedAppointments = appointments.filter(apt => apt.status === 'completed');
    
    let revenueToday = 0;
    let revenueMonth = 0;
    let revenueYear = 0;
    let appointmentsToday = 0;
    let appointmentsCompleted = 0;
    let appointmentsCancelled = 0;

    appointments.forEach(apt => {
      const aptDate = new Date(apt.startTime);
      const service = this.services.get(apt.serviceId);
      const price = service?.price || 0;
      
      const isToday = aptDate >= today && aptDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const isThisMonth = aptDate >= startOfMonth;
      const isThisYear = aptDate >= startOfYear;

      if (isToday) appointmentsToday++;
      if (apt.status === 'completed') {
        appointmentsCompleted++;
        if (isToday) revenueToday += price;
        if (isThisMonth) revenueMonth += price;
        if (isThisYear) revenueYear += price;
      }
      if (apt.status === 'cancelled') appointmentsCancelled++;
    });

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
    const appointments = Array.from(this.appointments.values())
      .filter(apt => apt.status === 'completed');
    
    const employeeStats = new Map<string, { revenue: number; count: number }>();
    
    appointments.forEach(apt => {
      const service = this.services.get(apt.serviceId);
      const price = service?.price || 0;
      
      const current = employeeStats.get(apt.staffId) || { revenue: 0, count: 0 };
      employeeStats.set(apt.staffId, {
        revenue: current.revenue + price,
        count: current.count + 1,
      });
    });

    const results: TopEmployee[] = [];
    
    employeeStats.forEach((stats, staffId) => {
      const profile = this.profiles.get(staffId);
      if (profile) {
        results.push({
          id: staffId,
          name: `${profile.firstName} ${profile.lastName}`,
          colorCode: profile.colorCode || '#3B82F6',
          revenue: stats.revenue,
          appointmentsCount: stats.count,
        });
      }
    });

    return results.sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }

  async getTopServices(): Promise<TopService[]> {
    const appointments = Array.from(this.appointments.values())
      .filter(apt => apt.status === 'completed');
    
    const serviceStats = new Map<string, { count: number; revenue: number }>();
    
    appointments.forEach(apt => {
      const service = this.services.get(apt.serviceId);
      if (!service) return;
      
      const current = serviceStats.get(apt.serviceId) || { count: 0, revenue: 0 };
      serviceStats.set(apt.serviceId, {
        count: current.count + 1,
        revenue: current.revenue + service.price,
      });
    });

    const results: TopService[] = [];
    
    serviceStats.forEach((stats, serviceId) => {
      const service = this.services.get(serviceId);
      const category = service ? this.serviceCategories.get(service.categoryId) : undefined;
      
      if (service && category) {
        results.push({
          id: serviceId,
          name: service.name,
          categoryName: category.name,
          count: stats.count,
          revenue: stats.revenue,
        });
      }
    });

    return results.sort((a, b) => b.count - a.count).slice(0, 5);
  }

  async getGoldenClient(): Promise<GoldenClient | null> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const appointments = Array.from(this.appointments.values())
      .filter(apt => 
        apt.status === 'completed' && 
        new Date(apt.startTime) >= startOfMonth
      );
    
    const clientStats = new Map<string, { totalSpent: number; count: number }>();
    
    appointments.forEach(apt => {
      const service = this.services.get(apt.serviceId);
      const price = service?.price || 0;
      
      const current = clientStats.get(apt.clientId) || { totalSpent: 0, count: 0 };
      clientStats.set(apt.clientId, {
        totalSpent: current.totalSpent + price,
        count: current.count + 1,
      });
    });

    let topClient: { clientId: string; stats: { totalSpent: number; count: number } } | null = null;
    
    clientStats.forEach((stats, clientId) => {
      if (!topClient || stats.totalSpent > topClient.stats.totalSpent) {
        topClient = { clientId, stats };
      }
    });

    if (!topClient) return null;

    const client = this.clients.get(topClient.clientId);
    if (!client) return null;

    return {
      id: client.id,
      name: client.fullName,
      phone: client.phone,
      totalSpent: topClient.stats.totalSpent,
      appointmentsCount: topClient.stats.count,
    };
  }
}

export const storage = new MemStorage();
