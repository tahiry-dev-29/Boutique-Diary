"use client";

import React, { useEffect, useState } from "react";
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Loader2,
  Home,
  Briefcase,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    label: "",
    street: "",
    city: "",
    postalCode: "",
    phoneNumber: "",
    isDefault: false,
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/customer/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (err) {
      console.error("Failed to fetch addresses", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = isEditing
        ? `/api/customer/addresses/${isEditing}`
        : "/api/customer/addresses";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(isEditing ? "Adresse mise à jour" : "Adresse ajoutée");
        setFormData({
          label: "",
          street: "",
          city: "",
          postalCode: "",
          phoneNumber: "",
          isDefault: false,
        });
        setIsEditing(null);
        fetchAddresses();
      } else {
        toast.error("Une erreur est survenue");
      }
    } catch (err) {
      toast.error("Erreur de connexion");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous supprimer cette adresse ?")) return;

    try {
      const res = await fetch(`/api/customer/addresses/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Adresse supprimée");
        fetchAddresses();
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (err) {
      toast.error("Erreur de connexion");
    }
  };

  const startEdit = (address: any) => {
    setIsEditing(address.id);
    setFormData({
      label: address.label || "",
      street: address.street,
      city: address.city,
      postalCode: address.postalCode,
      phoneNumber: address.phoneNumber || "",
      isDefault: address.isDefault,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">
          Chargement de vos adresses...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            Mes Adresses
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">
            Gérez vos adresses de livraison et de facturation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        {}
        <div className="space-y-4">
          {addresses.length > 0 ? (
            addresses.map((address) => (
              <div
                key={address.id}
                className={cn(
                  "p-6 rounded-[24px] border border-border transition-all group relative overflow-hidden",
                  address.isDefault
                    ? "bg-primary/5 border-primary"
                    : "bg-card hover:bg-accent/50",
                )}
              >
                {address.isDefault && (
                  <div className="absolute top-0 right-0 p-2 bg-primary text-primary-foreground rounded-bl-xl">
                    <CheckCircle2 size={16} />
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {address.label?.toLowerCase() === "maison" ? (
                      <Home size={24} />
                    ) : address.label?.toLowerCase() === "bureau" ? (
                      <Briefcase size={24} />
                    ) : (
                      <MapPin size={24} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-foreground uppercase tracking-wider text-sm">
                        {address.label || "Adresse"}
                      </h3>
                      {address.isDefault && (
                        <span className="text-[10px] font-black uppercase text-primary tracking-tighter">
                          Par défaut
                        </span>
                      )}
                    </div>
                    <p className="text-foreground font-medium">
                      {address.street}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {address.postalCode} {address.city}
                    </p>
                    {address.phoneNumber && (
                      <p className="text-muted-foreground text-xs mt-2 font-medium">
                        📞 {address.phoneNumber}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => startEdit(address)}
                      className="p-2 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-colors"
                      title="Modifier"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="p-2 hover:bg-rose-50 rounded-xl text-muted-foreground hover:text-rose-500 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-muted/20 rounded-[32px] border border-dashed border-border">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground font-medium">
                Vous n'avez pas encore d'adresse enregistrée.
              </p>
            </div>
          )}
        </div>

        {}
        <div className="bg-card border border-border rounded-[32px] p-8 shadow-sm h-fit sticky top-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              {isEditing ? <Edit2 size={20} /> : <Plus size={20} />}
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {isEditing ? "Modifier l'adresse" : "Nouvelle adresse"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                Label (ex: Maison, Bureau)
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-muted border-transparent focus:bg-background focus:border-primary transition-all outline-none text-sm font-medium"
                placeholder="Maison"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                Rue / Avenue
              </label>
              <input
                required
                type="text"
                value={formData.street}
                onChange={(e) =>
                  setFormData({ ...formData, street: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-muted border-transparent focus:bg-background focus:border-primary transition-all outline-none text-sm font-medium"
                placeholder="Logement 123, Près de..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Ville
                </label>
                <input
                  required
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-muted border-transparent focus:bg-background focus:border-primary transition-all outline-none text-sm font-medium"
                  placeholder="Antananarivo"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Code Postal
                </label>
                <input
                  required
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) =>
                    setFormData({ ...formData, postalCode: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-muted border-transparent focus:bg-background focus:border-primary transition-all outline-none text-sm font-medium"
                  placeholder="101"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-muted border-transparent focus:bg-background focus:border-primary transition-all outline-none text-sm font-medium"
                placeholder="034 00 000 00"
              />
            </div>

            <div
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl cursor-not-allowed cursor-pointer"
              onClick={() =>
                setFormData({ ...formData, isDefault: !formData.isDefault })
              }
            >
              <div
                className={cn(
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors",
                  formData.isDefault
                    ? "bg-primary border-primary"
                    : "border-muted-foreground/30",
                )}
              >
                {formData.isDefault && (
                  <CheckCircle2 className="w-3 h-3 text-white" />
                )}
              </div>
              <span className="text-sm font-bold text-foreground">
                Définir comme adresse par défaut
              </span>
            </div>

            <div className="flex gap-3 pt-4">
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(null);
                    setFormData({
                      label: "",
                      street: "",
                      city: "",
                      postalCode: "",
                      phoneNumber: "",
                      isDefault: false,
                    });
                  }}
                  className="flex-1 rounded-xl h-12 font-bold"
                >
                  Annuler
                </Button>
              )}
              <Button
                disabled={isSubmitting}
                className="flex-[2] rounded-xl h-12 font-bold shadow-lg shadow-black/10"
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : isEditing ? (
                  "Mettre à jour"
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
