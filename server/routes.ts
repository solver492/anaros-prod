import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProfileSchema, insertServiceSchema, insertClientSchema, insertAppointmentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ===== AUTH ROUTES =====
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email et mot de passe requis" });
      }

      const user = await storage.authenticateUser(email, password);
      
      if (!user) {
        return res.status(401).json({ error: "Email ou mot de passe incorrect" });
      }

      res.json({ user });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ===== PROFILES ROUTES =====
  app.get("/api/profiles", async (req: Request, res: Response) => {
    try {
      const profiles = await storage.getProfiles();
      res.json(profiles);
    } catch (error) {
      console.error("Get profiles error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get("/api/profiles/staff", async (req: Request, res: Response) => {
    try {
      const staff = await storage.getStaffProfiles();
      res.json(staff);
    } catch (error) {
      console.error("Get staff profiles error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get("/api/profiles/:id", async (req: Request, res: Response) => {
    try {
      const profile = await storage.getProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: "Profil non trouvé" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.post("/api/profiles", async (req: Request, res: Response) => {
    try {
      const data = insertProfileSchema.parse(req.body);
      const profile = await storage.createProfile({
        ...data,
        skills: req.body.skills || [],
      });
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Create profile error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.patch("/api/profiles/:id", async (req: Request, res: Response) => {
    try {
      const profile = await storage.updateProfile(req.params.id, {
        ...req.body,
        skills: req.body.skills,
      });
      if (!profile) {
        return res.status(404).json({ error: "Profil non trouvé" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.delete("/api/profiles/:id", async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteProfile(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Profil non trouvé" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Delete profile error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ===== STAFF SKILLS ROUTES =====
  app.get("/api/staff-skills", async (req: Request, res: Response) => {
    try {
      const skills = await storage.getStaffSkills();
      res.json(skills);
    } catch (error) {
      console.error("Get staff skills error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ===== SERVICE CATEGORIES ROUTES =====
  app.get("/api/service-categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getServiceCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get service categories error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ===== SERVICES ROUTES =====
  app.get("/api/services", async (req: Request, res: Response) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      console.error("Get services error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get("/api/services/:id", async (req: Request, res: Response) => {
    try {
      const service = await storage.getService(req.params.id);
      if (!service) {
        return res.status(404).json({ error: "Service non trouvé" });
      }
      res.json(service);
    } catch (error) {
      console.error("Get service error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.post("/api/services", async (req: Request, res: Response) => {
    try {
      const data = insertServiceSchema.parse(req.body);
      const service = await storage.createService(data);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Create service error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.patch("/api/services/:id", async (req: Request, res: Response) => {
    try {
      const service = await storage.updateService(req.params.id, req.body);
      if (!service) {
        return res.status(404).json({ error: "Service non trouvé" });
      }
      res.json(service);
    } catch (error) {
      console.error("Update service error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.delete("/api/services/:id", async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteService(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Service non trouvé" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Delete service error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ===== CLIENTS ROUTES =====
  app.get("/api/clients", async (req: Request, res: Response) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      console.error("Get clients error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get("/api/clients/:id", async (req: Request, res: Response) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ error: "Client non trouvé" });
      }
      res.json(client);
    } catch (error) {
      console.error("Get client error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get("/api/clients/:id/appointments", async (req: Request, res: Response) => {
    try {
      const appointments = await storage.getAppointmentsByClient(req.params.id);
      res.json(appointments);
    } catch (error) {
      console.error("Get client appointments error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.post("/api/clients", async (req: Request, res: Response) => {
    try {
      const data = insertClientSchema.parse(req.body);
      const client = await storage.createClient(data);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Create client error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.patch("/api/clients/:id", async (req: Request, res: Response) => {
    try {
      const client = await storage.updateClient(req.params.id, req.body);
      if (!client) {
        return res.status(404).json({ error: "Client non trouvé" });
      }
      res.json(client);
    } catch (error) {
      console.error("Update client error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.delete("/api/clients/:id", async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteClient(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Client non trouvé" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Delete client error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ===== APPOINTMENTS ROUTES =====
  app.get("/api/appointments", async (req: Request, res: Response) => {
    try {
      const { staff: staffId } = req.query;
      
      if (staffId && typeof staffId === 'string') {
        const appointments = await storage.getAppointmentsByStaff(staffId);
        return res.json(appointments);
      }
      
      const appointments = await storage.getAppointments();
      res.json(appointments);
    } catch (error) {
      console.error("Get appointments error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.post("/api/appointments", async (req: Request, res: Response) => {
    try {
      // Parse dates from strings
      const data = {
        ...req.body,
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
      };
      
      const parsed = insertAppointmentSchema.parse(data);
      const appointment = await storage.createAppointment(parsed);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Create appointment error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.patch("/api/appointments/:id/status", async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: "Statut invalide" });
      }
      
      const appointment = await storage.updateAppointmentStatus(req.params.id, status);
      if (!appointment) {
        return res.status(404).json({ error: "Rendez-vous non trouvé" });
      }
      res.json(appointment);
    } catch (error) {
      console.error("Update appointment status error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.delete("/api/appointments/:id", async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteAppointment(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Rendez-vous non trouvé" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Delete appointment error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ===== DASHBOARD ROUTES =====
  app.get("/api/dashboard/kpis", async (req: Request, res: Response) => {
    try {
      const kpis = await storage.getDashboardKPIs();
      res.json(kpis);
    } catch (error) {
      console.error("Get dashboard KPIs error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get("/api/dashboard/top-employees", async (req: Request, res: Response) => {
    try {
      const topEmployees = await storage.getTopEmployees();
      res.json(topEmployees);
    } catch (error) {
      console.error("Get top employees error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get("/api/dashboard/top-services", async (req: Request, res: Response) => {
    try {
      const topServices = await storage.getTopServices();
      res.json(topServices);
    } catch (error) {
      console.error("Get top services error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get("/api/dashboard/golden-client", async (req: Request, res: Response) => {
    try {
      const goldenClient = await storage.getGoldenClient();
      res.json(goldenClient);
    } catch (error) {
      console.error("Get golden client error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  return httpServer;
}
