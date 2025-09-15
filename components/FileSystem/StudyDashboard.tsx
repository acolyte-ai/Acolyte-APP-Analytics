// import React from "react";
// import ContinueReading from "@/components/dashboard/ContinueReading";
// import DocumentList from "@/components/dashboard/documentList";

// const StudyDashboard = () => {
//   return (
//     // This container takes full viewport height and allows scrolling internally.
//     <div className="h-auto overflow-auto">
//       <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 ">
//         {/* Collaborative Study Section */}
//         <div className="w-full h-full">
//           <h2 className="text-xl sm:text-2xl font-semibold text-emerald-700 pb-2 sm:pb-4 mb-4">
//             Collaborative Study
//           </h2>
//           <div className="relative h-[500px]">
//             {/* Translucent Overlay */}
//             {/* <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
//               <div className="text-center">
//                 <h3 className="text-3xl md:text-4xl font-bold text-white tracking-wider">
//                   COMING SOON
//                 </h3>
//                 <p className="mt-1 text-gray-200 text-lg">
//                   Stay tuned for exciting updates!
//                 </p>
//               </div>
//             </div> */}
//             <DocumentList />
//           </div>
//         </div>
//         <ContinueReading />
//       </div>
//     </div>
//   );
// };





// export default StudyDashboard;
import React from 'react';
import { Book, ChevronRight, FileText, CheckCircle, Clock3 } from 'lucide-react';
import ProgressList from '../PDFViewer/analytics/ProgressList';
// import ProgressList from './ProgressList';
// import ProgressList from '@/components/analytics/ProgressList';



const documents = [
  {
    title: "Clinical Pathology Report",
    date: "Mar 18, 2025",
    type: "PDF",
    size: "4.2 MB",
    status: "completed"
  },
  {
    title: "Cardiology Study Notes",
    date: "Mar 15, 2025",
    type: "DOCX",
    size: "1.8 MB",
    status: "pending"
  },
  {
    title: "Pharmacology Guide",
    date: "Mar 10, 2025",
    type: "PDF",
    size: "12.5 MB",
    status: "completed"
  }
];

// Keep original component name
const StudyDashboard = () => {
  return (
    <div className="h-auto min-h-screen overflow-auto">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Collaborative Study Section */}
        <div className="w-full lg:w-1/2 relative">
          <h2 className="text-lg sm:text-xl font-semibold text-emerald-700 mb-3">
            Collaborative Study
          </h2>
          <div className="h-[400px] sm:h-[450px] relative" id="collaborate-study">
            {/* Coming Soon Overlay - only covering DocumentList */}
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-3xl md:text-4xl font-bold text-white tracking-wider">
                  COMING SOON
                </h3>
                <p className="mt-2 text-gray-200 text-lg">
                  Stay tuned for exciting updates!
                </p>
              </div>
            </div>
            <DocumentList />
          </div>
        </div>
        <div className="w-full max-sm:pb-32">
          <ContinueReading />
        </div>
      </div>
    </div>
  );
};


// Keep original component name
export const ContinueReading = () => {
  return (
    <div className="w-full h-auto ">
      <div className="flex flex-col w-full items-start justify-between ">
        <h2 className=" text-nowrap max-xl:text-[22px] text-[24px]
           dark:text-white text-[#228367] tracking-wide mb-2 max-sm:mb-3 font-causten-semibold">
          {/* <Book size={20} /> */}
          Continue Reading
        </h2>

        <div className="relative w-full" id="continue-reading">
          <ProgressList />
        </div>
      </div>

    </div>
  );
};


export const DocumentList = () => {
  // File type icons mapping
  const getFileIcon = (type) => {
    const iconSize = 16;

    switch (type) {
      case 'PDF':
        return (
          <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-1.5 flex items-center justify-center">
            <FileText size={iconSize} className="text-red-600 dark:text-red-400" />
          </div>
        );
      case 'DOCX':
        return (
          <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-1.5 flex items-center justify-center">
            <FileText size={iconSize} className="text-blue-600 dark:text-blue-400" />
          </div>
        );
      default:
        return (
          <div className="rounded-lg bg-gray-100 dark:bg-gray-700 p-1.5 flex items-center justify-center">
            <FileText size={iconSize} className="text-gray-600 dark:text-gray-400" />
          </div>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-[#444444] rounded-2xl w-full h-full shadow-lg overflow-hidden">
      <div className="p-3 sm:p-4 border-b">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <Book size={18} className="text-indigo-500" />
          Recent Documents
        </h2>
      </div>

      <div className="overflow-y-auto max-h-[300px] sm:max-h-[350px]">
        <ul className="divide-y">
          {documents.map((doc, index) => (
            <li key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex items-center px-3 py-3">
                <div className="mr-3">
                  {getFileIcon(doc.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{doc.title}</p>
                    <div className="mt-1 sm:mt-0 sm:ml-2 flex-shrink-0">
                      {doc.status === 'completed' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle size={12} className="mr-1" />
                          Done
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          <Clock3 size={12} className="mr-1" />
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>{doc.date}</span>
                    <span className="mx-1">•</span>
                    <span>{doc.type}</span>
                    <span className="mx-1">•</span>
                    <span>{doc.size}</span>
                  </div>
                </div>
                <div className="ml-2">
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-3 sm:p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Showing {documents.length} documents
          </span>
          <button className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            View All
            <ChevronRight size={14} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudyDashboard;