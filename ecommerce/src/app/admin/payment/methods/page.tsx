"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Settings,
  CreditCard,
  Banknote,
  Smartphone,
  Check,
  X,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PaymentMethod {
  id: number;
  code: string;
  name: string;
  description: string;
  logoUrl: string | null;
  isActive: boolean;
  isDefault: boolean;
  config: any;
}

import { PageHeader } from "@/components/admin/PageHeader";

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [configuringMethod, setConfiguringMethod] =
    useState<PaymentMethod | null>(null);

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payments/methods");
      if (!res.ok) throw new Error("Failed to fetch methods");
      const data = await res.json();
      setMethods(data);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du chargement des modes de paiement");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (
    method: PaymentMethod,
    checked: boolean,
  ) => {
    try {
      setMethods((prev) =>
        prev.map((m) => (m.id === method.id ? { ...m, isActive: checked } : m)),
      );

      const res = await fetch("/api/admin/payments/methods", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: method.id, isActive: checked }),
      });

      if (!res.ok) throw new Error("Failed to update");
      toast.success(`${method.name} ${checked ? "activé" : "désactivé"}`);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la mise à jour");
      fetchMethods();
    }
  };

  const handleSetDefault = async (method: PaymentMethod) => {
    if (method.isDefault) return;
    try {
      setMethods((prev) =>
        prev.map((m) => ({ ...m, isDefault: m.id === method.id })),
      );

      const res = await fetch("/api/admin/payments/methods", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: method.id,
          isDefault: true,
          isActive: true,
        }),
      });

      if (!res.ok) throw new Error("Failed to set default");
      toast.success(`${method.name} défini par défaut`);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la définition par défaut");
      fetchMethods();
    }
  };

  const getIcon = (code: string) => {
    switch (code) {
      case "mvola":
        return <Smartphone className="w-8 h-8 text-yellow-500" />;
      case "orange_money":
        return <Smartphone className="w-8 h-8 text-orange-500" />;
      case "stripe":
        return <CreditCard className="w-8 h-8 text-indigo-500" />;
      case "cash":
        return <Banknote className="w-8 h-8 text-green-500" />;
      default:
        return <CreditCard className="w-8 h-8" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Modes de Paiement"
        description="Gérez les méthodes de paiement disponibles sur votre boutique."
        backHref="/admin/payment"
      />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {methods.map((method) => (
            <Card
              key={method.id}
              className={`transition-all ${method.isActive ? "border-primary/50 bg-primary/5" : "opacity-80"}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-background rounded-full border shadow-sm">
                    {method.logoUrl ? (
                      <div className="w-8 h-8 relative">
                        {}
                        {getIcon(method.code)}
                      </div>
                    ) : (
                      getIcon(method.code)
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      {method.name}
                      {method.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Par défaut
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {method.description}
                    </CardDescription>
                  </div>
                </div>
                <Switch
                  checked={method.isActive}
                  onCheckedChange={(checked) =>
                    handleToggleActive(method, checked)
                  }
                />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div
                    className={`w-2 h-2 rounded-full ${method.isActive ? "bg-green-500 animate-pulse" : "bg-gray-300"}`}
                  />
                  {method.isActive ? "Actif sur la boutique" : "Désactivé"}
                </div>
              </CardContent>
              <CardFooter className="bg-muted/20 border-t pt-4 flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSetDefault(method)}
                  disabled={method.isDefault}
                >
                  {method.isDefault ? <Check className="w-4 h-4 mr-2" /> : null}
                  {method.isDefault ? "Par défaut" : "Définir par défaut"}
                </Button>
                <Dialog
                  open={configuringMethod?.id === method.id}
                  onOpenChange={(open) => !open && setConfiguringMethod(null)}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfiguringMethod(method)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configurer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Configuration {method.name}</DialogTitle>
                      <DialogDescription>
                        Paramétrez vos identifiants API pour{" "}
                        {method.name.toLowerCase()}.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      {method.code === "mvola" && (
                        <>
                          <div className="grid gap-2">
                            <Label htmlFor="merchantId">ID Marchand</Label>
                            <Input
                              id="merchantId"
                              defaultValue={method.config?.merchantId || ""}
                              placeholder="ex: 123456"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="apiKey">
                              Clé API (Consumer Key)
                            </Label>
                            <Input
                              id="apiKey"
                              type="password"
                              defaultValue={method.config?.apiKey || ""}
                            />
                          </div>
                        </>
                      )}

                      {method.code === "stripe" && (
                        <>
                          <div className="grid gap-2">
                            <Label htmlFor="publicKey">Clé Publique</Label>
                            <Input
                              id="publicKey"
                              defaultValue={method.config?.publicKey || ""}
                              placeholder="pk_test_..."
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="secretKey">Clé Secrète</Label>
                            <Input
                              id="secretKey"
                              type="password"
                              defaultValue={method.config?.secretKey || ""}
                              placeholder="sk_test_..."
                            />
                          </div>
                        </>
                      )}

                      {(method.code === "orange_money" ||
                        method.code === "cash") && (
                        <p className="text-sm text-muted-foreground italic">
                          Aucune configuration supplémentaire requise pour ce
                          mode.
                        </p>
                      )}
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setConfiguringMethod(null)}
                      >
                        Annuler
                      </Button>
                      <Button
                        onClick={async () => {
                          const config: any = {};
                          if (method.code === "mvola") {
                            config.merchantId = (
                              document.getElementById(
                                "merchantId",
                              ) as HTMLInputElement
                            ).value;
                            config.apiKey = (
                              document.getElementById(
                                "apiKey",
                              ) as HTMLInputElement
                            ).value;
                          } else if (method.code === "stripe") {
                            config.publicKey = (
                              document.getElementById(
                                "publicKey",
                              ) as HTMLInputElement
                            ).value;
                            config.secretKey = (
                              document.getElementById(
                                "secretKey",
                              ) as HTMLInputElement
                            ).value;
                          }

                          try {
                            const res = await fetch(
                              "/api/admin/payments/methods",
                              {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  id: method.id,
                                  config,
                                }),
                              },
                            );

                            if (!res.ok) throw new Error("Update failed");
                            toast.success("Configuration mise à jour");
                            setConfiguringMethod(null);
                            fetchMethods();
                          } catch (error) {
                            toast.error(
                              "Erreur lors de la sauvegarde de la configuration",
                            );
                          }
                        }}
                      >
                        Enregistrer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
