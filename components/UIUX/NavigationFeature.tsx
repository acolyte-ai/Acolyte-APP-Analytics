import JoyRide, { CallBackProps, Step } from 'react-joyride'
import CustomTooltip from "@/components/UIUX/customToolTip";
import { useSettings } from "@/context/store";
import { usePathname } from "next/navigation";
import { useEffect, useState } from 'react';

const steps: Step[] = [
    {
        target: "#knowledge-analysis",
        title: "Knowledge Analysis",
        content: "Helps you identify your learning gaps across various medical subjects.",
        placement: "bottom",
        disableBeacon: true,
    },
    {
        target: "#create-folder",
        title: "Subjects",
        content: "This is where you organize your PDF's and Notes.",
        placement: "bottom",
    },
    {

        target: "#collaborate-study",
        title: "Collaborative study",
        content: ".",
        placement: "bottom",
    },
    {

        target: "#continue-reading",
        title: "Continue Reading",
        content: ".",
        placement: "bottom",
    },
];

// todo
const steps1: Step[] = [
    {
        target: "#create-todo",
        title: "Create To-Do List",
        content: "Use this toll to remember all your important tasks and never miss on those deadlines.",
        placement: "bottom",
        disableBeacon: true,
    },
    {
        target: "#todo-describe",
        content: "Use this to describe your task.",
        placement: "bottom",
    },
    {
        target: "#todo-data-time",
        content: "Here you can add the date and time for your task completion",
        placement: "left",
    },
    {
        target: "#todo-select-date",
        content: "select the date.",
        placement: "left"
    },
    {

        target: "#calender-btn",
        title: "Calender",
        content: "Easy access to the calender.",
        placement: "bottom"
    },
    {
        target: "#todo-confirm",
        content: "Confirm your task.",
        placement: "left"
    },


]

//side bar
const step3: Step[] = [
    {

        target: "#PdfNotes",
        title: "My PDF Page",
        content: "Click to access PDF's.",
        placement: "right",
        disableBeacon: true,
    },
    {

        target: "#upload-pdf",
        content: "Click to upload a new PDF.",
        placement: "right"
    },

    {

        target: "#pdf-subject",
        title: "Subject",
        content: "Click to upload a new PDF.",
        placement: "right"
    },

    // {

    //     target: "#pdf-continue-reading",
    //     content: "Click to upload a new PDF.",
    //     placement: "left"
    // },

]

//header
const step4: Step[] = [
    {
        target: "#notes",
        title: "My Notes",
        content: " ",
        placement: "right",
        disableBeacon: true,
    },

    {
        target: "#notes-recent",
        title: "My Notes",
        content: " ",
        placement: "right",
    },
    {
        target: "#notes-flash-cards",
        title: "My Flash Cards",
        content: "Create, organize, and review all your flashcards in one place ",
        placement: "right"
    },
    // {
    //     target: "#notes-subjects",
    //     title: "Subject",
    //     content: " ",
    //     placement: "bottom"
    // },

]

//sidebar-pdf
const step5: Step[] = [
    {
        target: "#pdf-singlepage",
        title: "PDF in Single Page View",
        content: "Click to View PDF in Column Layout",
        placement: "right",
        disableBeacon: true,
    },
    {
        target: "#pdf-column",
        title: "PDF in Column Layout",
        content: "Click to access the PDF in Single Page View",
        placement: "right",
    },
    {
        target: "#pdf-smart-notetaker",
        title: "Smart Note-Taker",
        content: "Click to Add Notes While Reading",
        placement: "right",
    },
    {
        target: "#pdf-zoomin",
        title: "Expanded View",
        content: "Click to Adjust PDF to Screen",
        placement: "right",
    },
    {
        target: "#pdf-expand",
        title: "Zoom in",
        content: "Click to Reduce Screen Zoom",
        placement: "right",
    },

    {
        target: "#pdf-pdf",
        title: "PDF",
        content: "Click to switch back to the PDF",
        placement: "right",
    },
    {
        target: "#pdf-write",
        title: "PDF Notes",
        content: "Use this to enter the Note page",
        placement: "right",
    },
    {
        target: "#pdf-chat",
        title: "Acolyte AI",
        content: "Click on the Acolyte icon to enter the AI space ",
        placement: "right",
    },



]

//header
const step6: Step[] = [
    {
        target: "#header-sync",
        title: "Synchronizing With Cloud ",
        content: "Sync all your data in one place",
        placement: "bottom",
        disableBeacon: true,
    },
    {
        target: "#themes",
        title: "Themes",
        content: "Click on the theme icon to find our various themes suited for studying ",
        placement: "bottom",
    },
    {
        target: "#train-pdf",
        title: "Train the AI",
        content: "Click to Start Training AI using PDF",
        placement: "bottom",
    },

    // {
    //   target: "#theme-options",
    //   // title:"",
    //   content: "",
    //   placement: "bottom",
    // },

]

const step7: Step[] = [
    {
        target: "#toolbar-selection",
        title: "Selection Tool",
        content: "Click to Select Content",
        placement: "top",
        disableBeacon: true,
    },
    {
        target: "#toolbar-pen",
        title: "Pen",
        content: "Click to access the Pen Tool",
        placement: "top",
    },
    {
        target: "#toolbar-highlight",
        title: "Highlighter",
        content: "Click to access the Highlighter",
        placement: "top",
    },

    {
        target: "#toolbar-eraser",
        title: "Eraser",
        content: "Click to access the Eraser",
        placement: "top",
    },

    {
        target: "#toolbar-color",
        title: "Color Palette",
        content: "Choose color for the marker",
        placement: "top",
    },
    {
        target: "#toolbar-geometric",
        title: "Geometric Elements",
        content: "Click to access Shapes and Lines",
        placement: "top",
    },
    {
        target: "#toolbar-text",
        title: "Text",
        content: "Click here to add text",
        placement: "top",
    },
    // {
    //     target: "#toolbar-geometric-snippingtool",
    //     title: "Snipping Tool",
    //     content: "",
    //     placement: "top",
    // },
    // {
    //     target: "#toolbar-highlight-control",
    //     // title:"",
    //     content: "",
    //     placement: "top",
    // },
]


const stepInitial: Step[] = [
    {
        target: "#mode",
        title: "Dark/Light Mode",
        content: "Use this button to switch between Light and Dark mode.",
        placement: "bottom",
        disableBeacon: true,
    },
    {
        target: "#notification",
        title: "Notifications",
        content: "You can find out all about your reminders and exciting updates here.",
        placement: "bottom"
    },
    {
        target: "#feedback",
        title: "Feedback",
        content: "Use this to give us your valuable feedback or report any issues you are facing.",
        placement: "bottom"
    },
    {
        target: "#todo-tab",
        title: "Create To-Do List",
        content: "Use this toll to remember all your important tasks and never miss on those deadlines.",
        placement: "bottom",
    },
    {

        target: "#calender",
        title: "Calender",
        content: "Easy access to the calender.",
        placement: "bottom"
    },
    {
        target: "#create-todo",
        title: "Create To-Do List",
        content: "Use this tool to remember all your important tasks and never miss on those deadlines.",
        placement: "bottom",
    },
    {
        target: "#todo-describe",
        content: "Use this to describe your task.",
        placement: "bottom",
    },
    {
        target: "#todo-data-time",
        content: "Here you can add the date and time for your task completion",
        placement: "left",
    },
    {
        target: "#todo-select-date",
        content: "select the date.",
        placement: "left"
    },
    {

        target: "#calender-btn",
        title: "Calender",
        content: "Easy access to the calender.",
        placement: "bottom"
    },
    {
        target: "#todo-confirm",
        content: "Confirm your task.",
        placement: "left"
    },
    {
        target: "#home-search",
        content: "Search your PDF and Notes.",
        placement: "bottom"
    },
    // {
    //     target: "#home",
    //     title: "Home",
    //     content: "Navigate here to enter and view your PDF's.",
    //     placement: "right"
    // },
    {
        target: "#knowledge-analysis",
        title: "Knowledge Analysis",
        content: "Helps you identify your learning gaps across various medical subjects.",
        placement: "bottom",
    },
    {
        target: "#create-folder",
        title: "Subjects",
        content: "This is where you organize your PDF's and Notes.",
        placement: "bottom",
    },
    {

        target: "#collaborate-study",
        title: "Collaborative study",
        content: "Invite your friends into your learning space.",
        placement: "bottom",
    },
    // {

    //     target: "#continue-reading",
    //     title: "Continue Reading",
    //     content: ".",
    //     placement: "bottom",
    // },

    {

        target: "#PdfNotes",
        title: "My PDF Page",
        content: "Click to access PDF's.",
        placement: "right"
    },
    {

        target: "#upload-pdf",
        content: "Click to upload a new PDF.",
        placement: "right"
    },

    {

        target: "#pdf-subject",
        title: "Subject",
        content: "Find all your PDFs here.",
        placement: "right"
    },

    // {

    //     target: "#pdf-continue-reading",
    //     content: "Click to upload a new PDF.",
    //     placement: "left"
    // },
    {
        target: "#notes",
        title: "My Notes",
        content: "Click to access notes",
        placement: "right"
    },

    {
        target: "#notes-recent",
        // title: "Recent ",
        content: "Add and access your recent notes",
        placement: "right"
    },
    {
        target: "#notes-flash-cards",
        title: "My Flash Cards",
        content: "Create, organize, and review all your flashcards in one place ",
        placement: "right"
    },
    {
        target: "#notes-subjects",
        title: "Subject",
        content: " ",
        placement: "bottom"
    },
    {
        target: "#chat",
        title: "Acolyte",
        content: "Start a conversation with Acolyte AI",
        placement: "right"
    },

];

const stepPdfStart: Step[] = [
    {
        target: "#pdf-nav-tutorial",
        title: "PDF Viewer",
        content: "Navigate through PDF Viewer",
        placement: "center",
        disableBeacon: true,
    },

    {
        target: "#pdf-singlepage",
        title: "PDF in Single Page View",
        content: "Click to access the PDF in Single Page View",
        placement: "right",
    },
    {
        target: "#pdf-column",
        title: "PDF in Column Layout",

        content: "Click to View PDF in Column Layout",
        placement: "right",
    },

    {
        target: "#pdf-smart-notetaker",
        title: "Smart Note-Taker",
        content: "Click to take Notes While Reading",
        placement: "right",
    },
    {
        target: "#pdf-zoomin",
        title: "Expanded View",
        content: "Click to Adjust PDF to Screen",
        placement: "right",
    },
    {
        target: "#pdf-expand",
        title: "Zoom in",
        content: "Click to Reduce Screen Zoom",
        placement: "right",
    },
    {
        target: "#pdf-pdf",
        title: "PDF",
        content: "Click to switch back to the PDF",
        placement: "right",
    },
    {
        target: "#pdf-write",
        title: "PDF Notes",
        content: "Use this to enter the Note page",
        placement: "right",
    },
    {
        target: "#pdf-chat",
        title: "Acolyte AI",
        content: "Click on the Acolyte icon to enter the AI space ",
        placement: "right",
    },

    {
        target: "#toolbar-selection",
        title: "Selection Tool",
        content: "Click to Select Content",
        placement: "top",
    },
    {
        target: "#toolbar-pen",
        title: "Pen",
        content: "Click to access the Pen Tool",
        placement: "top",
    },
    {
        target: "#toolbar-highlight",
        title: "Highlighter",
        content: "Click to access the Highlighter",
        placement: "top",
    },

    {
        target: "#toolbar-eraser",
        title: "Eraser",
        content: "Click to access the Eraser",
        placement: "top",
    },
    {
        target: "#toolbar-color",
        title: "Color Palette",
        content: "Choose color for the marker",
        placement: "top",
    },
    {
        target: "#toolbar-geometric",
        title: "Geometric Elements",
        content: "Click to access Shapes and Lines",
        placement: "top",
    },
    {
        target: "#toolbar-text",
        title: "Text",
        content: "Click here to add text",
        placement: "top",
    },
    {
        target: "#header-sync",
        title: "Synchronizing With Cloud ",
        content: "Sync all your data in one place",
        placement: "bottom",
    },
    {
        target: "#themes",
        title: "Themes",
        content: "Click to change the pdf's theme",
        placement: "bottom",
    },
    {
        target: "#train-pdf",
        title: "Train the AI",
        content: "Click to train the AI using the current PDF",
        placement: "bottom",
    },
]
export default function NavigationFeature() {
    const location = usePathname().split("/")[1];
    const {
        dashBoardNavigation, todoNavigation, sideBarNavigation, headerNavigation,
        pdfSidebarNavigation, pdfheaderNavigation, ToolBarNavigation
    } = useSettings();

    const [showDashNav, setShowDashNav] = useState(false);
    const [showPdfNav, setShowPdfNav] = useState(false);

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status, type, step, index, action, origin, size, lifecycle,
            controlled
        } = data;

        console.log("+++++++++++++", status, type, step, index, action,
            origin, size, lifecycle, controlled)

        // // Example of using helpers
        // if (action === "skip") {
        //     // Skip to step 5
        //    localStorage
        // }
    };


    useEffect(() => {
        if (location === "dashboard") {
            setShowDashNav(true);
        } else if (location === "workspace") {
            setShowPdfNav(true);
        }
    }, [location]);

    const commonProps = {
        continuous: true,
        showSkipButton: true,
        showProgress: true,
        hideBackButton: false,
        hideCloseButton: false,
        spotlightClicks: false,
        scrollToFirstStep: true,
        disableOverlayClose: true,

        tooltipComponent: CustomTooltip,
        // floaterProps: {
        //     styles: {
        //         floater: {
        //             zIndex: 1000,
        //         },
        //     },
        // },
        styles: {
            options: {
                arrowColor: '#ffffff',
            }
        },
        callback: handleJoyrideCallback
    };


    // const shouldShowDashNav = localStorage.getItem("aco-dash-nav") === "false";
    // const shouldShowPdfNav = localStorage.getItem("aco-pdf-nav") === "false";




    return (
        <>
            {showDashNav && (
                <>
                    <JoyRide steps={stepInitial} run={localStorage.getItem("aco-dash-nav") === "false"} {...commonProps} />
                    <JoyRide steps={steps1} run={todoNavigation} {...commonProps} />
                    <JoyRide steps={steps} run={dashBoardNavigation} {...commonProps} />
                    <JoyRide steps={step3} run={sideBarNavigation} {...commonProps} />
                    <JoyRide steps={step4} run={headerNavigation} {...commonProps} />
                </>
            )}

            {showPdfNav && (
                <>
                    <JoyRide steps={stepPdfStart} run={localStorage.getItem("aco-pdf-nav") === "false"} {...commonProps} />
                    <JoyRide steps={step5} run={pdfSidebarNavigation} {...commonProps} />
                    <JoyRide steps={step6} run={pdfheaderNavigation} {...commonProps} />
                    <JoyRide steps={step7} run={ToolBarNavigation} {...commonProps} />
                </>
            )}


        </>
    );
}