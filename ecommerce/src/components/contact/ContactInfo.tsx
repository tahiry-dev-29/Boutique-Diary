"use client";

import { contactInfo } from "@/constants/contactInfo";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactInfo() {
  return (
    <div className="w-full space-y-8">
      {/* Contact Info Card */}
      <div className="bg-[#f8f8f8] p-8 md:p-10 rounded-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-8 uppercase tracking-wide">
          COORDONNÉES
        </h2>

        <div className="space-y-8">
          <div className="flex items-start space-x-4">
            <div className="text-[#3d6b6b] mt-1">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                TÉLÉPHONE
              </h3>
              <p className="text-gray-600 font-medium text-lg">
                {contactInfo.phone}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="text-[#3d6b6b] mt-1">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                EMAIL
              </h3>
              <p className="text-gray-600 font-medium text-lg">
                {contactInfo.email}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="text-[#3d6b6b] mt-1">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                ADRESSE
              </h3>
              <p className="text-gray-600 font-medium text-lg leading-relaxed max-w-[250px]">
                {contactInfo.address}, {contactInfo.city}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Business Hours Card */}
      <div className="bg-[#f8f8f8] p-8 md:p-10 rounded-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-8 uppercase tracking-wide">
          HORAIRES D'OUVERTURE
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              LUNDI - VENDREDI
            </h3>
            <p className="text-gray-600 font-medium text-lg">
              {contactInfo.hours.weekdays}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              SAMEDI
            </h3>
            <p className="text-gray-600 font-medium text-lg">
              {contactInfo.hours.weekend}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              DIMANCHE
            </h3>
            <p className="text-gray-600 font-medium text-lg">
              {contactInfo.hours.weekend}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
