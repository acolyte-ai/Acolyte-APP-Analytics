"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";
import { Note } from "@/types/pdf";
import React from "react";
import useUserId from "@/hooks/useUserId";
import { getUserItems } from "@/lib/fileSystemUtils";
import { useViewCombination } from "@/hooks/useViewCombination.ts";


type ViewFeature = "pdf" | "notes" | "chat";
type ViewCombination = ViewFeature | `${ViewFeature}+${ViewFeature}`;

export interface ActiveTool {
  id: string;
  icon?: JSX.Element;
  type?:
  | "pencil"
  | "line"
  | "arrow"
  | "image"
  | "pencil"
  | "pen"
  | "color"
  | "marker"
  | "highlighter"
  | "pixelEraser"
  | "objectEraser"
  | "rectangleSelection"
  | "freeformSelection"
  | "text"
  | "circle"
  | "square"
  | "triangle"
  | "star"
  | "diamond"
  | "shapes"
  | "arrow"
  | "texthighlighter"
  | "line"
  | "star"
  | "hexagon"
  | null;
  style?: React.CSSProperties;
  color?: string;
  text?: string;
  className?: string;
  strokeWidth?: number;
  opacity?: number;
  fillColor?: string;
  strokeColor?: string;
}
type Modes = "read" | "write" | "chat";

interface SettingsContextType {
  scrollMode: "vertical" | "horizontal" | "two-page";
  toggleScrollMode: () => void;
  scrollToPage: (pageNumber: number) => void;
  rotateSinglePage: (pageNumber: number) => void;
  rotateAllPages: () => void;
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  setPages: Dispatch<SetStateAction<number>>;
  pages: number;
  updatePageRects: (pageNumber: number | null) => DOMRect[];
  pageRects: DOMRect[];
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  selectedText: string;
  setSelectedText: React.Dispatch<React.SetStateAction<string>>;
  first: Boolean;
  setfirst: any;
  scale: number;
  setScale: any;
  currentDocumentId: string;
  setcurrentDocumentId: any;
  isInfinite: boolean;
  setIsInfinite: any;
  theme: string;
  setTheme: any;
  isVisible: boolean;
  setIsVisible: any;
  scrollPdf: boolean;
  setScrollPdf: any;
  data: Data;
  setData: any;
  isPagesLoaded: boolean;
  setIsPagesLoaded: any;
  selectedView: ViewOption;
  setSelectedView: any;
  activeTool: ActiveTool;
  setActiveTool: any;
  viewMode: any;
  setViewMode: any;
  isHeadderVisible: boolean;
  setisHeadderVisible: any;
  isDarkFilter: boolean;
  setisDarkFilter: any;
  ispagesZooming: boolean;
  setispagesZooming: any;
  isPagesZoomingFromGesture: boolean;
  setisPagesZoomingFromGesture: any;
  isSearchVisible: boolean;
  setisSearchVisible: any;
  isExpanded: boolean;
  setisExpanded: any;
  currentView: Modes;
  setcurrentView: any;
  totalPages: number;
  setTotalPages: React.Dispatch<React.SetStateAction<number>>;
  pageDimensions: PageDimensions;
  setpageDimensions: React.Dispatch<React.SetStateAction<PageDimensions>>;

  isDarkMode: boolean;
  setisDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  SyncPdfAnnotations: boolean;
  setSyncPdfAnnotations: any;
  syncFileSystem: boolean;
  setsyncFileSystem: any;
  currentDocument: CurrentDocument;
  setcurrentDocument: React.Dispatch<React.SetStateAction<CurrentDocument>>;
  isPdfLoaded: boolean;
  setisPdfLoaded: any;
  isTrainingProgress: boolean;
  setisTrainingProgress: any;
  isUploadProgress: boolean;
  setisUploadProgress: any;
  excalidrawScale: boolean;
  setexcalidrawScale: any;
  setFileSystemSate: any;
  fileSystem: any;
  setFileSystem: any;
  isFileSystemLoaded: boolean;
  setIsFileSystemLoaded: any;
  isTrainCompleted: boolean;
  setisTrainCompleted: any;
  dashBoardNavigation: boolean;
  todoNavigation: boolean;
  setDashBoardNavigation: React.Dispatch<React.SetStateAction<boolean>>;
  setTodoNavigation: React.Dispatch<React.SetStateAction<boolean>>;
  sideBarNavigation: boolean;
  setSideBarNavigation: React.Dispatch<React.SetStateAction<boolean>>;
  headerNavigation: boolean;
  setHeaderNavigation: React.Dispatch<React.SetStateAction<boolean>>;

  pdfheaderNavigation: boolean;
  setPdfHeaderNavigation: React.Dispatch<React.SetStateAction<boolean>>;
  pdfSidebarNavigation: boolean;
  setPdfSidebarNavigation: React.Dispatch<React.SetStateAction<boolean>>;
  ToolBarNavigation: boolean;
  setToolBarNavigation: React.Dispatch<React.SetStateAction<boolean>>;
  isSmartNoteTakingVisible: boolean;
  setisSmartNoteTakingVisible: any;
  isToolBarCollapsed: any;
  setIsToolBarCollapsed: any;
  syncStatus: any;
  setSyncStatus: any;
  isScreenShotEnable: any;
  setIsScreenShotEnable: any;
  PdfIframeRef: any;
  setPdfIframeRef: any;
  composerInsertText: any;
  setComposerInsertText: any;
  splitViewMode: any;
  setSplitViewMode: any;
  isPdfDarkModeEnable: any;
  setisPdfDarkModeEnable: any;
  generateFlashCard: any;
  setGenerateFlashCard: any;
  showAITrainModal: boolean;
  setshowAITrainModal: any;
  trainNotificationMessage: any;
  settrainNotificationMessage: any;
  aiTrainIcon: boolean;
  setAiTrainIcon: React.Dispatch<React.SetStateAction<boolean>>;

  documentInsight: boolean;
  setDocument: React.Dispatch<React.SetStateAction<boolean>>;
  footerVisible: boolean;
  setFooterVisible: React.Dispatch<React.SetStateAction<boolean>>;

  mode: string;
  setMode: React.Dispatch<React.SetStateAction<string>>;
  currentTopic: any;
  setCurrentTopic: any;
  isPDFEnabled: any;
  setIsPDFEnabled: any;
  viewCombination: ViewCombination;
  setViewCombination: any

  flashCardGenerate: boolean;
  setFlashCardGenerate: React.Dispatch<React.SetStateAction<boolean>>;

  chatStats: { files: number; folders: number; syncedFiles: number; trainedFiles: number };
  setChatStats: React.Dispatch<React.SetStateAction<{ files: number; folders: number; syncedFiles: number; trainedFiles: number }>>;

  rootFolder: string;
  setRootFolder: React.Dispatch<React.SetStateAction<string>>;

  selectedFile: { fileName: string, id: string, subject: string, fileType: string };
  setSelectedFile: React.Dispatch<React.SetStateAction<{ fileName: string, id: string, subject: string, fileType: string }>>,

  openPmDialogBox: boolean;
  setOpenPmDialogBox: React.Dispatch<React.SetStateAction<boolean>>;

  openUploadFiles: boolean;
  setOpenUploadFiles: React.Dispatch<React.SetStateAction<boolean>>;

  currentChunk: any;
  setCurrentChunk: any

  flashcardWord: string;
  setFlashcardWord: React.Dispatch<React.SetStateAction<string>>;
  flashCardGenerated: boolean;
  setFlashCardGenerated: React.Dispatch<React.SetStateAction<boolean>>

  notifyTest: boolean;
  setNotifyTest: React.Dispatch<React.SetStateAction<boolean>>


  notificationEnable: boolean;
  setNotificationEnable: React.Dispatch<React.SetStateAction<boolean>>

}



interface SelectionPoint {
  x: number;
  y: number;
}

interface SelectionBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Data {
  url: object | null;
  selection: SelectionPoint;
  bounds: SelectionBounds;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

interface SettingsProviderProps {
  children: ReactNode;
}

const ViewMode = {
  SINGLE: "single",
  DOUBLE: "double",
  CAROUSEL: "carousel",
};
interface View {
  view: "write" | "read";
}
interface PageDimensions {
  height: number;
  width: number;
}

interface CurrentDocument {
  title: string;
  id: string;
  isTrained?: boolean;
  parentId?: string;
}

type ViewOption = 1 | 2 | 3;
export function SettingsProvider({ children }: SettingsProviderProps) {
  const [scrollMode, setScrollMode] = useState<
    "vertical" | "horizontal" | "two-page"
  >("vertical");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);
  const [pageRects, setpageRects] = useState<DOMRect[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [first, setfirst] = useState(false);
  const [scale, setScale] = useState<number>(0.9);
  const [currentDocumentId, setcurrentDocumentId] = useState<string>("");
  const [isInfinite, setIsInfinite] = useState<boolean>(false);
  const [theme, setTheme] = useState("light");
  const [isVisible, setIsVisible] = useState(true);
  const [scrollPdf, setScrollPdf] = useState(false);
  const [data, setData] = useState<Data>();
  const [isPagesLoaded, setIsPagesLoaded] = useState(false);
  const [selectedView, setSelectedView] = useState<ViewOption>(1);
  const [activeTool, setActiveTool] = useState<ActiveTool>();
  const [selectedColor, setSelectedColor] = useState("#000");
  const [viewMode, setViewMode] = useState(ViewMode.SINGLE);
  const [isHeadderVisible, setisHeadderVisible] = useState(true);
  const [isDarkFilter, setisDarkFilter] = useState(false);
  const [ispagesZooming, setispagesZooming] = useState();
  const [isPagesZoomingFromGesture, setisPagesZoomingFromGesture] =
    useState(false);
  const [isSearchVisible, setisSearchVisible] = useState(false);
  const [isExpanded, setisExpanded] = useState(false);
  const [currentView, setcurrentView] = useState<View>();
  const [pageDimensions, setpageDimensions] = useState<PageDimensions>();
  const [isDarkMode, setisDarkMode] = useState<boolean>(false);
  const [SyncPdfAnnotations, setSyncPdfAnnotations] = useState(false);
  const [syncFileSystem, setsyncFileSystem] = useState(false);
  const [currentDocument, setcurrentDocument] = useState<CurrentDocument>();
  const [isPdfLoaded, setisPdfLoaded] = useState(false);
  const [isTrainingProgress, setisTrainingProgress] = useState(false);
  const [isUploadProgress, setisUploadProgress] = useState(false);
  const [excalidrawScale, setexcalidrawScale] = useState(1);
  const [globalDarkMode, setglobalDarkMode] = useState(false);

  const userId = useUserId();
  const [isFileSystemLoaded, setIsFileSystemLoaded] = useState(false);
  const [fileSystem, setFileSystem] = useState([]);
  const [isTrainCompleted, setisTrainCompleted] = useState(false);

  const [dashBoardNavigation, setDashBoardNavigation] =
    useState<boolean>(false);
  const [todoNavigation, setTodoNavigation] = useState<boolean>(false);
  const [sideBarNavigation, setSideBarNavigation] = useState<boolean>(false);
  const [headerNavigation, setHeaderNavigation] = useState<boolean>(false);

  const [pdfheaderNavigation, setPdfHeaderNavigation] =
    useState<boolean>(false);
  const [pdfSidebarNavigation, setPdfSidebarNavigation] =
    useState<boolean>(false);
  const [ToolBarNavigation, setToolBarNavigation] = useState<boolean>(false);
  const [isSmartNoteTakingVisible, setisSmartNoteTakingVisible] =
    useState(false);
  const [PdfIframeRef, setPdfIframeRef] = useState(null);
  const [isToolBarCollapsed, setIsToolBarCollapsed] = useState(true);
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");
  const [isScreenShotEnable, setIsScreenShotEnable] = useState(false);
  const [composerInsertText, setComposerInsertText] = useState(null);
  const [splitViewMode, setSplitViewMode] = useState("note");
  const [isPdfDarkModeEnable, setisPdfDarkModeEnable] = useState(false);

  const [generateFlashCard, setGenerateFlashCard] = useState(false);
  const [showAITrainModal, setshowAITrainModal] = useState(false);
  const [trainNotificationMessage, settrainNotificationMessage] = useState("");
  const [totalPages, setTotalPages] = useState<number>(0);
  const [aiTrainIcon, setAiTrainIcon] = useState<boolean>(false);
  const [documentInsight, setDocument] = useState<boolean>(false);
  const [footerVisible, setFooterVisible] = useState<boolean>(true);
  const [mode, setMode] = useState<string>("");
  const [currentTopic, setCurrentTopic] = useState("");
  const [isPDFEnabled, setIsPDFEnabled] = useState(true);
  const [viewCombination, setViewCombination] =
    useState<ViewCombination>("pdf");
  const [flashCardGenerate, setFlashCardGenerate] = useState(false)
  const [rootFolder, setRootFolder] = useState("")
  const [selectedFile, setSelectedFile] = useState<{
    fileName: string, id: string,
    subject: string, fileType: string
  }>({ fileName: "", id: "", subject: "", fileType: "" })
  const [openPmDialogBox, setOpenPmDialogBox] = useState<boolean>(false)
  const [openUploadFiles, setOpenUploadFiles] = useState<boolean>(false);
  const [currentChunk, setCurrentChunk] = useState([]);
  const [flashcardWord, setFlashcardWord] = useState<string>("")
  const [flashCardGenerated, setFlashCardGenerated] = useState(false)
  const [notifyTest, setNotifyTest] = useState(false)
  const [notificationEnable, setNotificationEnable] = useState(false)


  useEffect(() => {
    console.log(userId);
    if (!userId) return;

    const downloadFileSystem = async () => {
      try {
        const data = await getUserItems(userId);
        setFileSystem(data);
        setIsFileSystemLoaded(true);
      } catch (error) {
        console.error("Error fetching file system:", error);
      }
    };

    downloadFileSystem();
  }, [userId]); // Depend only on userId


  return (
    <SettingsContext.Provider
      value={{
        scrollMode,
        currentPage,
        setCurrentPage,
        pages,
        setPages,
        pageRects,
        notes,
        setNotes,
        selectedText,
        setSelectedText,
        first,
        setfirst,
        scale,
        setScale,
        currentDocumentId,
        setcurrentDocumentId,
        isInfinite,
        setIsInfinite,
        theme,
        setTheme,
        isVisible,
        setIsVisible,
        scrollPdf,
        setScrollPdf,
        data,
        setData,
        isPagesLoaded,
        setIsPagesLoaded,
        selectedView,
        setSelectedView,
        activeTool,
        setActiveTool,
        selectedColor,
        setSelectedColor,
        viewMode,
        setViewMode,
        isHeadderVisible,
        setisHeadderVisible,
        isDarkFilter,
        setisDarkFilter,
        ispagesZooming,
        setispagesZooming,
        isPagesZoomingFromGesture,
        setisPagesZoomingFromGesture,
        isSearchVisible,
        setisSearchVisible,
        isExpanded,
        setisExpanded,
        currentView,
        setcurrentView,
        pageDimensions,
        setpageDimensions,
        isDarkMode,
        setisDarkMode,
        SyncPdfAnnotations,
        setSyncPdfAnnotations,
        syncFileSystem,
        setsyncFileSystem,
        currentDocument,
        setcurrentDocument,
        isPdfLoaded,
        setisPdfLoaded,
        isTrainingProgress,
        setisTrainingProgress,
        isUploadProgress,
        setisUploadProgress,
        excalidrawScale,
        setexcalidrawScale,
        globalDarkMode,
        setglobalDarkMode,
        fileSystem,
        setFileSystem,
        isFileSystemLoaded,
        setIsFileSystemLoaded,
        isTrainCompleted,
        setisTrainCompleted,

        todoNavigation,
        dashBoardNavigation,
        setTodoNavigation,
        setDashBoardNavigation,
        sideBarNavigation,
        setSideBarNavigation,
        setHeaderNavigation,
        headerNavigation,
        pdfheaderNavigation,
        setPdfHeaderNavigation,
        pdfSidebarNavigation,
        setPdfSidebarNavigation,
        ToolBarNavigation,
        setToolBarNavigation,
        isSmartNoteTakingVisible,
        setisSmartNoteTakingVisible,
        isToolBarCollapsed,
        setIsToolBarCollapsed,
        syncStatus,
        setSyncStatus,
        isScreenShotEnable,
        setIsScreenShotEnable,
        PdfIframeRef,
        setPdfIframeRef,
        composerInsertText,
        setComposerInsertText,
        splitViewMode,
        setSplitViewMode,
        isPdfDarkModeEnable,
        setisPdfDarkModeEnable,
        generateFlashCard,
        setGenerateFlashCard,
        showAITrainModal,
        setshowAITrainModal,
        trainNotificationMessage,
        settrainNotificationMessage,
        totalPages,
        setTotalPages,
        aiTrainIcon,
        setAiTrainIcon,
        documentInsight,
        setDocument,
        footerVisible,
        setFooterVisible,
        mode,
        setMode,
        currentTopic,
        setCurrentTopic,
        isPDFEnabled,
        setIsPDFEnabled,
        viewCombination,
        setViewCombination,
        flashCardGenerate,
        setFlashCardGenerate,
        rootFolder,
        setRootFolder,
        selectedFile,
        setSelectedFile,
        setOpenPmDialogBox,
        openPmDialogBox,
        openUploadFiles,
        setOpenUploadFiles,
        currentChunk, setCurrentChunk,
        flashcardWord, setFlashcardWord,
        flashCardGenerated,
        setFlashCardGenerated,
        notifyTest,
        setNotifyTest,
        notificationEnable,
        setNotificationEnable
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
