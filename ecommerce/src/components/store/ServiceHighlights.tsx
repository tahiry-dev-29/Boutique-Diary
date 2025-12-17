"use client";

import { ArrowRight } from "lucide-react";

export default function ServiceHighlights() {
  return (
    <section className="py-8 px-4 md:px-6">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Item 1 */}
        <div className="bg-[#faf7f2] p-6 rounded-3xl h-[200px] flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg mb-2">
              100% Authentic
              <br />
              Product
            </h3>
            <p className="text-[10px] text-gray-500 leading-tight">
              Our products display is for "100% Authentic Guarantee" on our
              product.
            </p>
          </div>
          <button className="self-start flex items-center gap-2 border border-black/10 rounded-full pl-3 pr-2 py-1 text-[10px] font-bold hover:bg-white transition-colors">
            See More <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Item 2 */}
        <div className="bg-[#f4f7fa] p-6 rounded-3xl h-[200px] flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg mb-2">
              Free & Easy
              <br />
              Return
            </h3>
            <p className="text-[10px] text-gray-500 leading-tight">
              Provide customer with prepared short catch to make the process
              hassle-free.
            </p>
          </div>
          <button className="self-start flex items-center gap-2 border border-black/10 rounded-full pl-3 pr-2 py-1 text-[10px] font-bold hover:bg-white transition-colors">
            See More <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Item 3 */}
        <div className="bg-[#f2fcf4] p-6 rounded-3xl h-[200px] flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg mb-2">Safe Payments</h3>
            <p className="text-[10px] text-gray-500 leading-tight">
              Use fraud detection tools to verify suspicious activity such as
              unusual purchase.
            </p>
          </div>
          <button className="self-start flex items-center gap-2 border border-black/10 rounded-full pl-3 pr-2 py-1 text-[10px] font-bold hover:bg-white transition-colors">
            See More <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Item 4 - Image Banner */}
        <div className="bg-[#6ec1e4] p-6 rounded-3xl h-[200px] relative overflow-hidden flex items-center">
          <h3 className="relative z-10 text-white font-bold text-xl">
            Summer
            <br />
            Cloth
          </h3>
          {/* Decorative Elements */}
          <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-orange-500 rounded-full blur-xl opacity-80"></div>
          <div className="absolute top-10 right-4 text-orange-500 font-black text-4xl rotate-12 z-10">
            20%
            <br />
            <span className="text-sm">OFF</span>
          </div>
        </div>
      </div>
    </section>
  );
}
