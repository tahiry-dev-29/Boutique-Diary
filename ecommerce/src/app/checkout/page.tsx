"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ShoppingBag,
  User,
  MapPin,
  Truck,
  CreditCard,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCartStore, formatPrice } from "@/lib/cart-store";


const steps = [
  { id: 1, name: "Informations", icon: User },
  { id: 2, name: "Adresse", icon: MapPin },
  { id: 3, name: "Livraison", icon: Truck },
  { id: 4, name: "Paiement", icon: CreditCard },
];


const deliveryOptions = [
  {
    id: "standard",
    name: "Livraison Standard",
    description: "5-7 jours ouvrables",
    price: 15000,
  },
  {
    id: "express",
    name: "Livraison Express",
    description: "2-3 jours ouvrables",
    price: 35000,
  },
  {
    id: "pickup",
    name: "Retrait en boutique",
    description: "Disponible sous 24h",
    price: 0,
  },
];


const paymentMethods = [
  {
    id: "mvola",
    name: "MVola",
    description: "Paiement mobile sécurisé",
    icon: "📱",
  },
  {
    id: "orange",
    name: "Orange Money",
    description: "Paiement mobile Orange",
    icon: "🍊",
  },
  {
    id: "card",
    name: "Carte bancaire",
    description: "Visa, Mastercard (bientôt)",
    icon: "💳",
    disabled: true,
  },
];

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface AddressInfo {
  street: string;
  city: string;
  postalCode: string;
  region: string;
}

export default function CheckoutPage() {
  const { items, getSubtotal, clearCart } = useCartStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [addressInfo, setAddressInfo] = useState<AddressInfo>({
    street: "",
    city: "",
    postalCode: "",
    region: "",
  });
  const [selectedDelivery, setSelectedDelivery] = useState("standard");
  const [selectedPayment, setSelectedPayment] = useState("mvola");

  const subtotal = getSubtotal();
  const deliveryPrice =
    deliveryOptions.find(d => d.id === selectedDelivery)?.price || 0;
  const total = subtotal + deliveryPrice;

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      
      setIsCompleted(true);
      clearCart();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (items.length === 0 && !isCompleted) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Votre panier est vide
          </h1>
          <p className="text-muted-foreground mb-8">
            Ajoutez des articles pour passer commande
          </p>
          <Button asChild size="lg">
            <Link href="/shop">Voir la boutique</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
            <Check className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Commande confirmée !
          </h1>
          <p className="text-muted-foreground mb-2 max-w-md">
            Merci pour votre commande. Vous recevrez un email de confirmation
            avec les détails de votre commande.
          </p>
          <p className="text-lg font-semibold text-foreground mb-8">
            Numéro de commande: #BD{Date.now().toString().slice(-8)}
          </p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/customer/orders">Voir mes commandes</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/shop">Continuer mes achats</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      {}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/cart"
          className="p-2 rounded-full hover:bg-accent transition-colors text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Passer commande
        </h1>
      </div>

      {}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <React.Fragment key={step.id}>
                {}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? "bg-emerald-500 text-white"
                        : isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.name}
                  </span>
                </div>

                {}
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      step.id < currentStep ? "bg-emerald-500" : "bg-muted"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              {}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    Vos informations
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        value={customerInfo.firstName}
                        onChange={e =>
                          setCustomerInfo({
                            ...customerInfo,
                            firstName: e.target.value,
                          })
                        }
                        placeholder="Jean"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        value={customerInfo.lastName}
                        onChange={e =>
                          setCustomerInfo({
                            ...customerInfo,
                            lastName: e.target.value,
                          })
                        }
                        placeholder="Dupont"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerInfo.email}
                        onChange={e =>
                          setCustomerInfo({
                            ...customerInfo,
                            email: e.target.value,
                          })
                        }
                        placeholder="jean@example.com"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        value={customerInfo.phone}
                        onChange={e =>
                          setCustomerInfo({
                            ...customerInfo,
                            phone: e.target.value,
                          })
                        }
                        placeholder="034 00 000 00"
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>
              )}

              {}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    Adresse de livraison
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="street">Adresse</Label>
                      <Input
                        id="street"
                        value={addressInfo.street}
                        onChange={e =>
                          setAddressInfo({
                            ...addressInfo,
                            street: e.target.value,
                          })
                        }
                        placeholder="123 Rue de la Paix"
                        className="mt-1.5"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">Ville</Label>
                        <Input
                          id="city"
                          value={addressInfo.city}
                          onChange={e =>
                            setAddressInfo({
                              ...addressInfo,
                              city: e.target.value,
                            })
                          }
                          placeholder="Antananarivo"
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="postalCode">Code postal</Label>
                        <Input
                          id="postalCode"
                          value={addressInfo.postalCode}
                          onChange={e =>
                            setAddressInfo({
                              ...addressInfo,
                              postalCode: e.target.value,
                            })
                          }
                          placeholder="101"
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="region">Région</Label>
                      <Input
                        id="region"
                        value={addressInfo.region}
                        onChange={e =>
                          setAddressInfo({
                            ...addressInfo,
                            region: e.target.value,
                          })
                        }
                        placeholder="Analamanga"
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>
              )}

              {}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    Mode de livraison
                  </h2>
                  <RadioGroup
                    value={selectedDelivery}
                    onValueChange={setSelectedDelivery}
                    className="space-y-3"
                  >
                    {deliveryOptions.map(option => (
                      <label
                        key={option.id}
                        className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedDelivery === option.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-accent"
                        }`}
                      >
                        <RadioGroupItem value={option.id} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="font-medium text-foreground">
                              {option.name}
                            </span>
                            <span className="font-semibold text-foreground">
                              {option.price === 0
                                ? "Gratuit"
                                : formatPrice(option.price)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {option.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    Mode de paiement
                  </h2>
                  <RadioGroup
                    value={selectedPayment}
                    onValueChange={setSelectedPayment}
                    className="space-y-3"
                  >
                    {paymentMethods.map(method => (
                      <label
                        key={method.id}
                        className={`flex items-start gap-4 p-4 border rounded-lg transition-all ${
                          method.disabled
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        } ${
                          selectedPayment === method.id && !method.disabled
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-accent"
                        }`}
                      >
                        <RadioGroupItem
                          value={method.id}
                          disabled={method.disabled}
                          className="mt-1"
                        />
                        <span className="text-2xl">{method.icon}</span>
                        <div className="flex-1">
                          <span className="font-medium text-foreground">
                            {method.name}
                          </span>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {method.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>

                  {}
                  {selectedPayment === "mvola" && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Vous serez redirigé vers MVola pour finaliser le
                        paiement après avoir confirmé votre commande.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {}
              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
                <Button onClick={handleNext}>
                  {currentStep === 4 ? (
                    <>
                      <Package className="w-4 h-4 mr-2" />
                      Confirmer la commande
                    </>
                  ) : (
                    <>
                      Continuer
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Votre commande
              </h2>

              {}
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-14 h-14 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {}
              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="text-foreground">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Livraison</span>
                  <span className="text-foreground">
                    {deliveryPrice === 0 ? (
                      <span className="text-emerald-500 font-medium">
                        Gratuite
                      </span>
                    ) : (
                      formatPrice(deliveryPrice)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{formatPrice(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
