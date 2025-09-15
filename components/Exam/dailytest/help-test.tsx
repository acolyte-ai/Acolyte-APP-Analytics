import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Clock,
    HelpCircle,
    Pause,
    LogOut,
    Maximize,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Circle,
    Monitor,
    Wifi,
    Shield,
    BookOpen,
    Target,
    Sun,
    Moon,
    Menu,
    X
} from 'lucide-react';

const ExaminationInstructions = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const questionTypes = [
        {
            type: 'Multiple Choice Questions',
            format: 'One question with 4-5 options (A, B, C, D, E)',
            icon: <Target className="h-4 w-4" />
        },
        {
            type: 'Matching Questions',
            format: 'Match items from Column A with Column B',
            icon: <BookOpen className="h-4 w-4" />
        },
        {
            type: 'Fill in the Blanks',
            format: 'Complete sentences with appropriate words',
            icon: <Circle className="h-4 w-4" />
        },
        {
            type: 'Case Study Questions',
            format: 'Detailed scenario with 2-3 sub-questions',
            icon: <CheckCircle className="h-4 w-4" />
        },
        {
            type: 'Sequential Logic Questions',
            format: 'Questions dependent on previous answers',
            icon: <RotateCcw className="h-4 w-4" />
        }
    ];

    const progressColors = [
        { color: 'bg-emerald-500 dark:bg-emerald-600', status: 'Answered', description: 'Questions you have completed' },
        { color: 'bg-red dark:bg-red', status: 'Skipped', description: 'Questions you chose to skip' },
        { color: 'bg-purple-500 dark:bg-purple-600', status: 'Review', description: 'Questions marked for review' },
        { color: 'bg-gray-400 dark:bg-gray-500', status: 'Pending', description: 'Questions not yet attempted' }
    ];

    const controlButtons = [
        { icon: <Clock />, name: 'Timer', description: 'Shows remaining time in HH:MM:SS format' },
        { icon: <HelpCircle />, name: 'Help', description: 'Click for technical assistance' },
        { icon: <Pause />, name: 'Pause', description: 'Temporarily stop the examination' },
        { icon: <LogOut />, name: 'Exit', description: 'End the examination (use carefully)' },
        { icon: <Maximize />, name: 'Full Screen', description: 'Expand for better visibility' }
    ];

    const navigationButtons = [
        { icon: <ChevronLeft />, name: 'Previous', description: 'Go back to previous questions' },
        { icon: <RotateCcw />, name: 'Review', description: 'Mark current question for later review' },
        { icon: <ChevronRight />, name: 'Next', description: 'Move to the next question' }
    ];

    const dosDonts = {
        dos: [
            'Read instructions carefully',
            'Manage your time effectively',
            'Use the review feature strategically',
            'Stay calm and focused',
            'Follow the prescribed examination pattern'
        ],
        donts: [
            'Do not use external resources',
            'Do not communicate with others',
            'Do not use mobile phones or other devices',
            'Do not attempt to access other websites',
            'Do not close the examination window accidentally'
        ]
    };

    const TabButton = ({ value, children, className = "" }) => (
        <TabsTrigger
            value={value}
            className={`text-xs sm:text-sm px-2 py-2 sm:px-4 sm:py-2 ${className}`}
        >
            {children}
        </TabsTrigger>
    );

    return (
        <div className="flex items-center justify-center transition-colors duration-300 bg-gradient-to-br from-sky-50 to-indigo-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 p-2 sm:p-4">
            <div className="w-[700px] h-[60vh] overflow-y-auto no-scrollbar mx-auto">

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">

                    {/* Mobile Tab Menu */}
                    <div className="sm:hidden">
                        <Button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            variant="outline"
                            className="w-full mb-4"
                        >
                            {mobileMenuOpen ? <X className="h-4 w-4 mr-2" /> : <Menu className="h-4 w-4 mr-2" />}
                            Menu
                        </Button>

                        {mobileMenuOpen && (
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {['overview', 'interface', 'questions', 'navigation', 'guidelines', 'submission'].map((tab) => (
                                    <Button
                                        key={tab}
                                        onClick={() => {
                                            setActiveTab(tab);
                                            setMobileMenuOpen(false);
                                        }}
                                        variant={activeTab === tab ? "default" : "outline"}
                                        className="text-xs capitalize"
                                    >
                                        {tab}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Desktop Tab List */}
                    <TabsList className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-1 sm:gap-2 w-full max-w-4xl mx-auto">
                        <TabButton value="overview">Overview</TabButton>
                        <TabButton value="interface">Interface</TabButton>
                        <TabButton value="questions">Questions</TabButton>
                        <TabButton value="navigation">Navigation</TabButton>
                        <TabButton value="guidelines">Guidelines</TabButton>
                        <TabButton value="submission">Submission</TabButton>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-4 sm:space-y-6">
                        <div className="grid gap-4 ">
                            <Card className="dark:bg-gray-800 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg dark:text-white">
                                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                                        Examination Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-sm sm:text-base dark:text-gray-300">Total Questions:</span>
                                        <Badge>14</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-sm sm:text-base dark:text-gray-300">Duration:</span>
                                        <Badge variant="secondary">As displayed</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-sm sm:text-base dark:text-gray-300">Language:</span>
                                        <Badge variant="outline">English</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-sm sm:text-base dark:text-gray-300">Format:</span>
                                        <Badge variant="destructive">Online</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Alert className="dark:bg-yellow-900/20 dark:border-yellow-700">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle className="dark:text-yellow-400">Important Notice</AlertTitle>
                            <AlertDescription className="text-sm dark:text-yellow-200">
                                This examination follows standard online assessment protocols. Familiarize yourself with the interface before beginning. Once submitted, answers cannot be changed.
                            </AlertDescription>
                        </Alert>
                    </TabsContent>

                    {/* Interface Tab */}
                    <TabsContent value="interface" className="space-y-4 sm:space-y-6">
                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-base sm:text-lg dark:text-white">
                                    Screen Layout & Controls
                                </CardTitle>
                                <CardDescription className="dark:text-gray-400">
                                    Understanding the examination interface
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 sm:space-y-6">
                                {/* Top Panel Controls */}
                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold mb-3 dark:text-white">Top Panel Controls</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                        {controlButtons.map((button, index) => (
                                            <Card key={index} className="p-3 sm:p-4 dark:bg-gray-700 dark:border-gray-600">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-800">
                                                        {React.cloneElement(button.icon, {
                                                            className: "h-4 w-4 sm:h-5 sm:w-5 text-sky-600 dark:text-sky-400"
                                                        })}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="font-medium text-sm sm:text-base dark:text-white">{button.name}</div>
                                                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">{button.description}</div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>

                                {/* Progress Indicator */}
                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold mb-3 dark:text-white">Progress Indicator</h3>
                                    <div className="space-y-3">
                                        {progressColors.map((item, index) => (
                                            <div key={index} className="flex items-center gap-3">
                                                <div className={`w-4 h-3 sm:w-6 sm:h-3 rounded ${item.color}`}></div>
                                                <span className="font-medium text-sm sm:text-base dark:text-white">{item.status}:</span>
                                                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">{item.description}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Questions Tab */}
                    <TabsContent value="questions" className="space-y-4 sm:space-y-6">
                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-base sm:text-lg dark:text-white">
                                    Question Types
                                </CardTitle>
                                <CardDescription className="dark:text-gray-400">
                                    Different formats you will encounter
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 sm:gap-4">
                                    {questionTypes.map((question, index) => (
                                        <Card key={index} className="p-3 sm:p-4 transition-colors hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-800">
                                                    {React.cloneElement(question.icon, {
                                                        className: "h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400"
                                                    })}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-sm sm:text-lg dark:text-white">{question.type}</h4>
                                                    <p className="text-xs sm:text-sm mt-1 break-words text-gray-600 dark:text-gray-400">{question.format}</p>
                                                </div>
                                                <Badge variant="secondary" className="text-xs">
                                                    Type {index + 1}
                                                </Badge>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Navigation Tab */}
                    <TabsContent value="navigation" className="space-y-4 sm:space-y-6">
                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-base sm:text-lg dark:text-white">
                                    Navigation Controls
                                </CardTitle>
                                <CardDescription className="dark:text-gray-400">
                                    How to move through the examination
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 sm:space-y-6">
                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold mb-3 dark:text-white">Bottom Navigation Panel</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                        {navigationButtons.map((button, index) => (
                                            <Card key={index} className="p-3 sm:p-4 text-center dark:bg-gray-700 dark:border-gray-600">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="p-2 sm:p-3 rounded-full bg-emerald-100 dark:bg-emerald-800">
                                                        {React.cloneElement(button.icon, {
                                                            className: "h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400"
                                                        })}
                                                    </div>
                                                    <div className="font-medium text-sm sm:text-base dark:text-white">{button.name}</div>
                                                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{button.description}</div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>

                                <Alert className="dark:bg-blue-900/20 dark:border-blue-700">
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertTitle className="dark:text-blue-400">Navigation Tips</AlertTitle>
                                    <AlertDescription className="text-sm dark:text-blue-200">
                                        Use the progress bar to jump to specific questions. Complete all questions first, then review marked ones. Skip difficult questions and return later.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Guidelines Tab */}
                    <TabsContent value="guidelines" className="space-y-4 sm:space-y-6">
                        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                            <Card className="dark:bg-gray-800 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="text-emerald-700 dark:text-emerald-400 text-base sm:text-lg">Do's ✓</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {dosDonts.dos.map((item, index) => (
                                            <li key={index} className="flex items-center gap-2">
                                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 flex-shrink-0" />
                                                <span className="text-xs sm:text-sm dark:text-gray-300">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="dark:bg-gray-800 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="text-red-700 dark:text-red-400 text-base sm:text-lg">Don'ts ✗</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {dosDonts.donts.map((item, index) => (
                                            <li key={index} className="flex items-center gap-2">
                                                <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" />
                                                <span className="text-xs sm:text-sm dark:text-gray-300">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <AlertTitle className="text-amber-800 dark:text-amber-400">
                                Time Management
                            </AlertTitle>
                            <AlertDescription className="text-sm text-amber-700 dark:text-amber-200">
                                Keep track of time using the timer display. Plan to finish 5-10 minutes before the deadline. System auto-submits when time expires.
                            </AlertDescription>
                        </Alert>
                    </TabsContent>

                    {/* Submission Tab */}
                    <TabsContent value="submission" className="space-y-4 sm:space-y-6">
                        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                            <Card className="dark:bg-gray-800 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg dark:text-white">
                                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-sky-600" />
                                        Manual Submission
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-sky-600 rounded-full flex-shrink-0"></div>
                                        <span className="text-xs sm:text-sm dark:text-gray-300">Click the submit button when ready</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-sky-600 rounded-full flex-shrink-0"></div>
                                        <span className="text-xs sm:text-sm dark:text-gray-300">Confirm submission when prompted</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-sky-600 rounded-full flex-shrink-0"></div>
                                        <span className="text-xs sm:text-sm dark:text-gray-300">Wait for confirmation message</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="dark:bg-gray-800 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg dark:text-white">
                                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                                        Auto Submission
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-orange-600 rounded-full flex-shrink-0"></div>
                                        <span className="text-xs sm:text-sm dark:text-gray-300">No manual intervention required</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-orange-600 rounded-full flex-shrink-0"></div>
                                        <span className="text-xs sm:text-sm dark:text-gray-300">Ensure all answers are selected</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Alert className="border-red bg-red dark:border-red dark:bg-red/20">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <AlertTitle className="text-red-800 dark:text-red-400">
                                Final Reminder
                            </AlertTitle>
                            <AlertDescription className="text-sm text-red-700 dark:text-red-200">
                                Once submitted, answers cannot be changed. Ensure you are satisfied with your responses before final submission. Keep 5-10 minutes for final review.
                            </AlertDescription>
                        </Alert>
                    </TabsContent>
                </Tabs>

                {/* Footer */}
                <div className="mt-8 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <p>This examination follows standard online assessment protocols.</p>
                    <p className="mt-1">Familiarize yourself with the interface before beginning. Good luck!</p>
                </div>
            </div>
        </div>
    );
};

export default ExaminationInstructions;