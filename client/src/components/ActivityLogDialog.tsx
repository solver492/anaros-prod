import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from "wouter";
import { format, isToday, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { History, Clock, User, Search, CalendarIcon, X } from 'lucide-react';
import type { AppointmentWithDetails } from '@shared/schema';
import { cn } from '@/lib/utils';

export function ActivityLogDialog() {
    const [, setLocation] = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [open, setOpen] = useState(false);

    const { data: appointments, isLoading } = useQuery<AppointmentWithDetails[]>({
        queryKey: ['/api/appointments'],
    });

    // Filter and group appointments
    const filteredAndGrouped = useMemo(() => {
        if (!appointments) return [];

        // Filter by date
        let filtered = appointments;
        if (selectedDate) {
            filtered = appointments.filter(apt => {
                const aptDate = new Date(apt.startTime);
                return aptDate.toDateString() === selectedDate.toDateString();
            });
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(apt =>
                apt.client.fullName.toLowerCase().includes(query) ||
                apt.staff.firstName.toLowerCase().includes(query) ||
                apt.staff.lastName.toLowerCase().includes(query) ||
                `${apt.staff.firstName} ${apt.staff.lastName}`.toLowerCase().includes(query)
            );
        }

        // Group by employee
        const groups = new Map<string, {
            staff: AppointmentWithDetails['staff'];
            appointments: AppointmentWithDetails[];
        }>();

        filtered.forEach(apt => {
            if (!groups.has(apt.staffId)) {
                groups.set(apt.staffId, {
                    staff: apt.staff,
                    appointments: []
                });
            }
            groups.get(apt.staffId)!.appointments.push(apt);
        });

        // Sort appointments within each group
        groups.forEach(group => {
            group.appointments.sort((a, b) =>
                new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
            );
        });

        return Array.from(groups.values());
    }, [appointments, searchQuery, selectedDate]);

    const totalAppointments = filteredAndGrouped.reduce((sum, group) => sum + group.appointments.length, 0);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-all duration-300 hover:scale-[1.02]">
                    <History className="h-4 w-4" />
                    Journal d'activité
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <History className="h-6 w-6 text-primary" />
                        Journal d'Activité
                    </DialogTitle>
                    <DialogDescription>
                        Historique complet des prestations par employé.
                    </DialogDescription>
                </DialogHeader>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 pb-4 border-b">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher un client ou employé..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-10"
                        />
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                onClick={() => setSearchQuery('')}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Date Picker */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full sm:w-[240px] justify-start text-left font-normal",
                                    !selectedDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? (
                                    isToday(selectedDate) ? (
                                        "Aujourd'hui"
                                    ) : (
                                        format(selectedDate, "d MMMM yyyy", { locale: fr })
                                    )
                                ) : (
                                    "Choisir une date"
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                initialFocus
                                locale={fr}
                            />
                            <div className="p-3 border-t">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setSelectedDate(new Date())}
                                >
                                    Aujourd'hui
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Results count */}
                <div className="text-sm text-muted-foreground">
                    {totalAppointments} rendez-vous trouvé{totalAppointments > 1 ? 's' : ''}
                    {selectedDate && ` le ${format(selectedDate, "d MMMM yyyy", { locale: fr })}`}
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="space-y-4 py-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-12 w-full bg-muted animate-pulse rounded" />
                        ))}
                    </div>
                ) : filteredAndGrouped.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">Aucune activité trouvée</p>
                        <p className="text-sm mt-1">
                            {searchQuery ? "Essayez une autre recherche" : "Aucun rendez-vous pour cette date"}
                        </p>
                    </div>
                ) : (
                    <ScrollArea className="h-[55vh] pr-4">
                        <div className="space-y-6">
                            {filteredAndGrouped.map((group) => (
                                <Card key={group.staff.id} className="border-2 hover-elevate">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                className="h-12 w-12 border-2"
                                                style={{ borderColor: group.staff.colorCode }}
                                            >
                                                <AvatarFallback
                                                    style={{
                                                        backgroundColor: `${group.staff.colorCode}20`,
                                                        color: group.staff.colorCode
                                                    }}
                                                    className="text-lg font-bold"
                                                >
                                                    {group.staff.firstName[0]}{group.staff.lastName[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <CardTitle className="text-xl">
                                                    {group.staff.firstName} {group.staff.lastName}
                                                </CardTitle>
                                                <CardDescription>
                                                    {group.appointments.length} rendez-vous
                                                </CardDescription>
                                            </div>
                                            <Badge
                                                variant="secondary"
                                                className="text-sm"
                                                style={{
                                                    backgroundColor: `${group.staff.colorCode}15`,
                                                    color: group.staff.colorCode,
                                                    borderColor: group.staff.colorCode
                                                }}
                                            >
                                                {group.staff.role === 'staff' ? 'Employé' :
                                                    group.staff.role === 'reception' ? 'Réception' :
                                                        group.staff.role === 'admin' ? 'Admin' : 'Super Admin'}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {group.appointments.map((apt) => (
                                                <div
                                                    key={apt.id}
                                                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
                                                >
                                                    {/* Client */}
                                                    <div
                                                        className="flex items-center gap-2 min-w-[180px] cursor-pointer hover:text-primary transition-colors"
                                                        onClick={() => {
                                                            setLocation(`/clients?clientId=${apt.client.id}`);
                                                            setOpen(false);
                                                        }}
                                                    >
                                                        <User className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                                        <span className="font-medium truncate">{apt.client.fullName}</span>
                                                    </div>

                                                    {/* Service */}
                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                        <Badge variant="outline" className="font-normal shrink-0">
                                                            {apt.service.category.name}
                                                        </Badge>
                                                        <span className="text-sm truncate">{apt.service.name}</span>
                                                    </div>

                                                    {/* Time */}
                                                    <div className="flex flex-col text-sm min-w-[140px]">
                                                        <span className="font-medium">
                                                            {format(new Date(apt.startTime), "d MMM yyyy", { locale: fr })}
                                                        </span>
                                                        <span className="text-muted-foreground flex items-center gap-1 text-xs">
                                                            <Clock className="h-3 w-3" />
                                                            {format(new Date(apt.startTime), "HH:mm")} - {format(new Date(apt.endTime), "HH:mm")}
                                                        </span>
                                                    </div>

                                                    {/* Status */}
                                                    <Badge
                                                        variant={
                                                            apt.status === 'completed' ? 'default' :
                                                                apt.status === 'cancelled' ? 'destructive' :
                                                                    'secondary'
                                                        }
                                                        className={
                                                            apt.status === 'confirmed' ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-transparent shrink-0' : 'shrink-0'
                                                        }
                                                    >
                                                        {apt.status === 'completed' ? 'Terminé' :
                                                            apt.status === 'cancelled' ? 'Annulé' :
                                                                apt.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    );
}
