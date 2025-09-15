
import { Clock, Layers, ChevronRight } from 'lucide-react';


const units = [
  {
    id: 5,
    title: "Medical Apparatus",
    lastAccessed: "2 days ago",
    completedModules: 3,
    totalModules: 14,
    progress: 25,
    color: "#F97316"
  },
  {
    id: 1,
    title: "Anatomy Fundamentals",
    lastAccessed: "Yesterday",
    completedModules: 12,
    totalModules: 20,
    progress: 60,
    color: "#EF4444"
  },
  {
    id: 2,
    title: "Patient Assessment",
    lastAccessed: "4 days ago",
    completedModules: 7,
    totalModules: 16,
    progress: 45,
    color: "#3B82F6"
  }
];

export default function ProgressList() {
  return (
    <div className="bg-white dark:bg-[#444444] rounded-2xl w-full h-[500px] sm:h-[500px] shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col p-3 sm:p-4">
      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        <div className="space-y-1">
          {units.map((unit) => (
            <div key={unit.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer group">
              <div className="p-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="flex items-center justify-center h-6 w-6 rounded-full text-white text-xs font-medium"
                        style={{ backgroundColor: unit.color }}
                      >
                        {unit.id}
                      </div>
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                        Unit {unit.id} - {unit.title}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-x-3 sm:gap-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{unit.lastAccessed}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Layers size={14} />
                        <span>{unit.completedModules} of {unit.totalModules} modules</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-32 mt-2 sm:mt-0">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium">{unit.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${unit.progress}%`,
                            backgroundColor: unit.color
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed footer */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Showing {units.length} of 12 units
          </span>
          <button className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-white bg-emerald-600 hover:bg-emerald-700 text-xs">
            View All
            <ChevronRight size={14} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
