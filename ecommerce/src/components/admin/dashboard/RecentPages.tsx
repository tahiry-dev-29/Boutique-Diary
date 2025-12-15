import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MousePointer } from "lucide-react";

interface PageStat {
  id: string;
  title: string;
  url: string;
  visits: number;
  conversionRate: number;
  status: "Published" | "Draft";
  image?: string;
}

const defaultPages: PageStat[] = [
  {
    id: "1",
    title: "Myautoinsurance.com",
    url: "https://myautoinsurance.com",
    visits: 150,
    conversionRate: 12.5,
    status: "Published",
  },
  {
    id: "2",
    title: "Securelifenow.com",
    url: "https://securelifenow.com",
    visits: 50,
    conversionRate: -6.3,
    status: "Draft",
  },
  {
    id: "3",
    title: "Myautoinsurance.com",
    url: "https://myautoinsurance.com",
    visits: 150,
    conversionRate: 12.5,
    status: "Published",
  },
];

const RecentPages: React.FC = () => {
  return (
    <Card className="border-none shadow-sm h-full flex flex-col bg-white dark:bg-gray-900">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">
          Pages récentes
        </CardTitle>
        <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium">
          Voir tout
        </button>
      </CardHeader>
      <CardContent className="flex-1 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-gray-700">
              <th className="font-medium pb-3 pl-2">Page de destination</th>
              <th className="font-medium pb-3">Taux de conversion</th>
            </tr>
          </thead>
          <tbody className="space-y-4">
            {defaultPages.map((page, index) => (
              <tr key={`${page.id}-${index}`} className="group">
                <td className="py-4 pl-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg relative overflow-hidden flex-shrink-0">
                      {}
                      <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <MousePointer className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white text-sm">
                        {page.title}
                      </p>
                      <div
                        className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium mt-1 ${
                          page.status === "Published"
                            ? "bg-green-100 text-green-600"
                            : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1 ${
                            page.status === "Published"
                              ? "bg-green-500"
                              : "bg-orange-500"
                          }`}
                        ></span>
                        {page.status === "Published" ? "Publié" : "Brouillon"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 align-middle">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800 dark:text-white">
                      {page.visits}
                    </span>
                    <div
                      className={`text-xs font-medium flex items-center ${page.conversionRate > 0 ? "text-green-500" : "text-red-500"}`}
                    >
                      {page.conversionRate > 0 ? "↗" : "↘"}{" "}
                      {Math.abs(page.conversionRate)}%
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default RecentPages;
