"use client";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import useUserId from "@/hooks/useUserId";
import { toast } from "sonner";
import { useSettings } from "@/context/store";
import VibrantButtonUI from "../UI/buttonUI";
import { Button } from "@/components/ui/button";
import SubjectFolders from "@/components/FileSystem/SubjectFolders";
import TopicSearch from "../practiceTest-dashboard/topicSearch";
import { DropdownCustomTest } from "../UI/dropDownTestUI";
import { TestCreationProgress } from "./generateTest";
import AdditionalSuggestionsTest from "../practiceTest-dashboard/AdditionalTest";
import ContentSource from "./contentSource";
import { EXTRACT_QUESTION_BANK_ID } from "../api/url";
import { AllTopicCombobox } from "../UI/all-topic-comboBox";
import { RiCloseFill } from "react-icons/ri";
import FileUploadUI from "../UI/InputFileUI";
import SimpleExamNameInput from "../UI/examNameInput";
import { getExamNameVariations } from "@/lib/utils";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import ToggleGroupTest from "../UI/toggleTest-UI";
interface Props {
  icon: string;
  title: string;
  content: string;
}

interface JobStatus {
  question_bank_id: string;
  status: string;
  message: string;
  progress: number;
  created_at: string;
  completed_at?: string;
  error?: string;
  current_step: string;
  estimated_time_remaining?: number;
  questions_generated: number;
  can_cancel: boolean;
}

export function CreateCustomTest({ icon, title, content }: Props) {
  const router = useRouter();
  const [topicDropDown, setTopicDropDown] = useState<string[]>([]);
  const {
    openPmDialogBox,
    setOpenPmDialogBox,
    selectedFile,
    setSelectedFile,
    setNotifyTest,
    setNotificationEnable,
  } = useSettings();
  const [loading, setLoading] = useState<boolean>(false);
  const userId = useUserId();
  const [qId, setqId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [selectedMode, setSelectedMode] = useState("simulated")
  const [examName, setExamName] = useState("");
  const [dropDownSelect, setDropDownSelect] = useState<{
    count: string;
    level: string;
    time: string;
  }>({
    count: "25",
    level: "Hard",
    time: "1hr",
  });

  const [error, setError] = useState<{ topic: string }>({
    topic: "",
  });

  const [step, setStep] = useState<{
    step1: boolean;
    step2: boolean;
    step3: boolean;
  }>({
    step1: true,
    step2: false,
    step3: false,
  });

  const [topicsList, setTopics] = useState<string[]>([]);

  type AllTopicsResponse = {
    success: boolean;
    pdfId: string;
    topics: string[];
    message: string;
  };

  async function getAllTopics(pdfId: string): Promise<AllTopicsResponse> {
    try {
      const url = process.env.NEXT_PUBLIC_EXAM_BASE_URL + "/api/all-topics";
      const response = await axios.post(
        url,
        { pdfId },
        {
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      const data: AllTopicsResponse = await response.data;
      setTopicDropDown(data.topics);
      setTopics(data.topics.slice(0, 2));
    } catch (error) {
      console.log("error::", error.message);
    }
  }

  async function generateBlueprintQuestionBank({
    bucket_name,
    user_id,
    key,
    model_id,
    extraction_type = "topics",
    num_questions = 10,
    difficulty = "Intermediate",
    use_provided_items = true,
    topics = [],
    additional_params = {},
    auto_generate_questions = true,
    exam_name,
  }) {
    const payload = {
      bucket_name,
      user_id,
      key,
      model_id,
      extraction_type,
      num_questions,
      difficulty,
      use_provided_items,
      topics,
      additional_params,
      auto_generate_questions,
      exam_name,
    };

    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_EXAM_BASE_URL + EXTRACT_QUESTION_BANK_ID,
        payload
      );
      console.log("=====>", payload)
      // const response = await axios.post(
      //   "https://g55m66fq-8001.inc1.devtunnels.ms" + EXTRACT_QUESTION_BANK_ID,
      //   payload
      // );

      console.log("Question bank response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error calling generateBlueprintQuestionBank:", error);
      throw error;
    }
  }

  async function getJobStatus(question_bank_id: string): Promise<JobStatus> {
    const url = `${process.env.NEXT_PUBLIC_EXAM_BASE_URL}/api/job-status/${question_bank_id}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch job status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error in getJobStatus:", error);
      throw error;
    }
  }

  const startJobPolling = (questionBankId: string) => {
    const pollJob = async () => {
      try {
        const status = await getJobStatus(questionBankId);
        setJobStatus(status);

        if (status.status === "completed" || status.status === "failed") {
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
          setLoading(false);

          if (status.status === "completed") {
            // Let TestCreationProgress handle the step transition
            // setStep((prev) => ({ ...prev, step2: false, step3: true }));
          }
          // Don't show error toast for failed jobs
        }
      } catch (error) {
        console.error("Polling error:", error);
        // Don't show error toast for polling issues
      }
    };

    // Initial call
    pollJob();

    // Set up polling every minute
    const interval = setInterval(pollJob, 60000);
    setPollingInterval(interval);
  };

  async function generateTest() {
    if (topicsList.length === 0) {
      setError((prev) => ({ ...prev, topic: "Please add some topics here" }));
      return;
    }

    setLoading(true);
    try {
      const questionData = await generateBlueprintQuestionBank({
        user_id: userId ?? "",
        key: selectedFile?.id ?? "",
        model_id: "gpt-4o-mini",
        extraction_type: "topics",
        num_questions: parseInt(dropDownSelect.count, 10),
        difficulty: dropDownSelect.level,
        use_provided_items: true,
        topics: topicsList,
        additional_params: {},
        auto_generate_questions: true,
        exam_name: examName.length > 0 ? examName : getExamNameVariations(selectedFile.fileName),
      });

      console.log("questionData:", questionData);

      if (questionData?.question_bank_id) {
        setqId(questionData.question_bank_id);
        localStorage.setItem("aco-recent-test", questionData.question_bank_id);
        localStorage.setItem("aco-exam-time", dropDownSelect.time);
        localStorage.setItem("aco-exam-question", dropDownSelect.count);
        localStorage.setItem("aco-exam-topic", topicsList.join(","));
        localStorage.setItem("aco-isSimulated", JSON.stringify(selectedMode === "simulated"))


        // const initiateExam = await axios.post(process.env.NEXT_PUBLIC_EXAM_BASE_URL + "/dev/v1/exam/initiate-exam", {
        //   "userId": userId ?? "",
        //   "questionBankId": questionData?.question_bank_id
        // })

        // await axios.post(process.env.NEXT_PUBLIC_EXAM_BASE_URL + "/dev/v1/exam/start-not-taken", {
        //   "userId": userId ?? "",
        //   "questionBankId": questionData?.question_bank_id,
        //   "attemptId": initiateExam?.attempt?.attemptId
        // })

        setStep((prev) => ({ ...prev, step1: false, step2: true }));
        // startJobPolling(questionData.question_bank_id);
      } else {
        throw new Error("No question bank ID received");
      }
    } catch (error) {
      console.error("Error in generateTest:", error);
      toast.error((error as Error).message);
      setError((prev) => ({ ...prev, topic: "Please add some topics here" }));
      setLoading(false);
    }
  }

  const handleAddTopic = (topic: string) => {
    console.log(`Added topic: ${topic}`);

    if (!topicsList.includes(topic)) {
      const newTopics = [...topicsList, topic];
      if (!(topicsList.length > 2)) {
        setTopics(newTopics);
      }

      setError((prev) => ({ ...prev, topic: "" }));
    }
  };

  const handleRemoveTopic = (topic: string) => {
    console.log(`Removed topic: ${topic}`);
    setTopics((prev) => prev.filter((item) => item !== topic));
  };

  const questionCount = ["2", "5", "10", "25", "40", "50", "60", "100"];
  const difficultyLevel = ["Hard", "Low", "Medium"];
  const timeLimit = ["30min", "1hr", "1hr 30min", "2hr", "2hr 30min"];

  useEffect(() => {
    if (selectedFile.fileName) {
      getAllTopics(selectedFile.id);
    }
  }, [selectedFile?.fileName]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const resetDialog = () => {
    setStep((prev) => {
      const { step1, step2, step3 } = prev;

      if (!step1 && !step2 && !step3) {
        // Case 1: all false → step1 true
        return { step1: true, step2: false, step3: false };
      }

      if (step1 && step3) {
        // Case 2: step1 and step3 are true → keep only step3 true
        return { step1: false, step2: false, step3: true };
      }

      // Case 3: default → step1 true
      return { ...prev };
    });
    setError({ topic: "" });
    setJobStatus(null);
    setqId("");
    setTopics([]);
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setLoading(false);
  };

  console.log("step:::", step);

  console.log("examNAme!!!23231=>", examName)

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        setOpen(isOpen);

        if (!isOpen) {
          resetDialog();
        } else {
          setOpen(isOpen);
          setStep((prev) => {
            const { step1, step2, step3 } = prev;

            if (!step1 && !step2 && !step3) {
              // Case 1: all false → step1 true
              return { step1: true, step2: false, step3: false };
            }

            if (step1 && step3) {
              // Case 2: step1 and step3 are true → keep only step3 true
              return { step1: false, step2: false, step3: true };
            }

            // Case 3: default → step1 true
            return { ...prev };
          });
        }
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <div
          className="w-full h-full flex items-center justify-between dark:bg-[#1C2626] bg-[#F3F4F9] cursor-pointer font-causten-semibold
         rounded-xl xl:py-4 max-md:py-2 py-4 border border-[#B8B8B8] shadow-md dark:shadow-none dark:border-none"
        >
          <div className="grid grid-cols-12 grid-rows-2 gap-2 max-sm:gap-1 max-md:gap-1 text-wrap h-full w-full px-4 xl:px-6 items-stretch">
            <div className="col-span-3 row-span-2 max-md:col-span-1 max-sm:col-span-2 max-xl:row-span-2 max-md:row-span-2 flex items-start justify-start md:items-start w-full  h-full">
              <Image
                src={icon}
                height={45}
                width={45}
                alt={icon}
                className="brightness-75 dark:brightness-100 object-contain contrast-150 dark:contrast-100 dark:hue-rotate-0 hue-rotate-0 h-auto p-2"
              />
            </div>
            <p className="col-span-9 row-span-1 flex items-start justify-start text-left text-[18px] xl:text-[22px] w-full text-wrap font-causten-semibold
             text-[#184C3D] dark:text-white font-medium leading-tight">
              {title}
            </p>
            <p className="col-span-9 row-span-1 justify-start max-xl:col-span-9 flex items-start text-[13px] xl:text-[14px] font-causten-semibold
            w-full text-wrap break-words text-[#747474] dark:text-[#C6C6C6] font-medium leading-relaxed">
              {content}
            </p>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent
        className="w-full h-full pt-10 min-w-[900px] max-md:min-w-[600px] max-sm:min-w-[300px] sm:rounded-[33px]
      bg-transparent dark:bg-transparent max-md:pt-5 [&>button]:hidden border-none border-0 shadow-none
       active:border-0 font-causten-bold flex flex-col items-start justify-center"
      >
        <DialogClose className="hidden"></DialogClose>

        {step.step1 && (
          <div className="w-full">
            <DialogHeader className="w-full shadow-none ">
              <DialogTitle>
                <div className="grid grid-cols-2 max-md:gap-4 w-full">
                  <p className="text-[22px] max-md:text-start max-md:col-span-2 mb-2 2xl:text-[24px] tracking-tight font-normal shadow-none  font-causten-semibold
                   dark:text-white text-[#228367] col-span-1  text-nowrap w-full">
                    Create custom test
                  </p>
                  <div className="space-x-4 max-md:col-span-2 col-span-1 w-full flex items-end justify-end max-md:justify-start 2xl:text-[23px]">
                    <div className="dark:bg-[#181A1D] bg-[#F3F4F9] space-x-2 p-1 rounded-[7.493px] dark:border-none border border-[#B8B8B8]">
                      {/* <VibrantButtonUI size={"default"} active={true} font="font-[futureHeadline] border-none">
                        <p className="text-[15px] 2xl:text-[19px]">New Upload</p>
                      </VibrantButtonUI>
                      <VibrantButtonUI size={"default"} active={false} font="font-[futureHeadline]">
                        <p className="text-[15px] 2xl:text-[19px]">Recent</p>
                      </VibrantButtonUI> */}
                    </div>
                  </div>
                </div>
              </DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>

            <div className="2xl:py-[13px] 2xl:px-[34px] py-[20px] px-[35px] max-md:px-5 shadow-none rounded-[7.493px] w-full bg-[#FFFFFF] dark:bg-[#181A1D] border border-[#B5B5B5] dark:border-none">
              <div className="max-h-[60vh] space-y-6 max-lg:space-y-3 overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                <div className="p-4 max-lg:p-2">
                  <div className="flex w-full gap-4 max-md:gap-3 max-md:flex-col">
                    <p className="text-sm 2xl:text-[15px] flex dark:text-white text-[#184C3D] items-center font-semibold text-wrap">
                      Type of test :
                    </p>

                    <ToggleGroupTest selectedMode={selectedMode} handleSelectMode={(val) => setSelectedMode(val)} />
                  </div>
                </div>

                <SimpleExamNameInput
                  examName={examName}
                  setExamName={(val: string) => setExamName(val)}
                />

                <div className="max-w-full">
                  <div className="w-full grid grid-cols-4 gap-[30px] place-content-stretch">
                    {selectedFile?.fileName ? (
                      <div className="col-span-full max-lg:col-span-full flex items-center justify-center h-[105px] xl:h-[127px] rounded-lg shadow-sm">
                        <button className="flex items-center px-4 py-6 w-full h-full flex-col dark:bg-[#282A2E] bg-transparent dark:hover:bg-[#282A2E] dark:text-white
                         text-black rounded-lg border relative border-emerald-500 transition-colors overflow-hidden text-wrap break-all">
                          <Image
                            src={"/newIcons/pdf.svg"}
                            alt="file"
                            width={30}
                            height={30}
                            className="w-7 h-7"
                          />
                          <span className="text-wrap w-auto mt-2">
                            {selectedFile.fileName}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedFile({
                                fileName: "",
                                id: "",
                                subject: "",
                                fileType: "",
                              });
                              setTopics([]);
                              setTopicDropDown([]);
                            }}
                            className="ml-2 p-1 absolute top-2 right-2 hover:bg-emerald-300 rounded-full transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => setOpenPmDialogBox(true)}
                        className={`${selectedFile?.fileName
                          ? "col-span-full max-lg:col-span-full"
                          : "col-span-full max-lg:col-span-full"
                          }`}
                      >
                        <FileUploadUI />
                      </div>
                    )}
                  </div>
                  {openPmDialogBox && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center ">
                      <div
                        className="absolute inset-0 dark:bg-black bg-opacity-50 backdrop-blur-sm"
                        onClick={() => setOpenPmDialogBox(false)}
                      />
                      <div className="relative z- max-w-4xl max-h-[90vh] w-full mx-4 rounded-lg  overflow-hidden">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-8  right-[21%] z-20 rounded-full hover:bg-white/20 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenPmDialogBox(false);
                          }}
                        >
                          <RiCloseFill
                            size={60}
                            className="scale-150 dark:text-white text-black text-xl"
                          />
                        </Button>
                        <SubjectFolders
                          isExpanded={false}
                          setIsExpanded={() => setOpenPmDialogBox(false)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {(topicsList.length > 2) && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Limit Reached</AlertTitle>
                    <AlertDescription>
                      You can only add up to 3 topics. Extra topics have been
                      ignored.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="py-4 max-lg:py-2 h-auto 2xl:mb-[14px] mb-[14px]">
                  <TopicSearch
                    onAddTopic={handleAddTopic}
                    onRemoveTopic={handleRemoveTopic}
                    topicDropDown={topicDropDown}
                    initialTopics={topicsList}
                  />
                  {/* <p className="text-red text-xs">{error.topic}</p> */}
                </div>

                <div className="flex gap-7 2xl:gap-16 max-md:flex-col w-full pb-5">
                  <DropdownCustomTest
                    value={dropDownSelect.count}
                    name={"Number of questions"}
                    options={questionCount}
                    changeOption={(val: string) => {
                      setDropDownSelect((prev) => ({ ...prev, count: val }));
                    }}
                  />
                  <DropdownCustomTest
                    value={dropDownSelect.level}
                    name={"Difficulty"}
                    options={difficultyLevel}
                    changeOption={(val: string) => {
                      setDropDownSelect((prev) => ({ ...prev, level: val }));
                    }}
                  />
                  <DropdownCustomTest
                    disabled={selectedMode !== "simulated"}
                    value={dropDownSelect.time}
                    name={"Time limit"}
                    options={timeLimit}
                    changeOption={(val: string) => {
                      setDropDownSelect((prev) => ({ ...prev, time: val }));
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step.step2 && (
          <div className="w-full flex items-center justify-center">
            <TestCreationProgress
              questionBankId={qId}
              onGetBackLater={() => {
                setOpen(false);
                setStep((prev) => ({
                  ...prev,
                  step3: false,
                  step2: false,
                  step1: false,
                }));
                resetDialog();
              }}
              // onNotifyWhenReady={() => setNotificationEnable(true)}
              testDetails={{
                testType: "practice test",
                contentSource: selectedFile?.fileName || "Sample",
                questionCount: parseInt(dropDownSelect.count),
                timeLimit: dropDownSelect.time,
                isCompleted: jobStatus?.status === "completed",
              }}
              closeBox={() => {
                setOpen(false);
                setStep((prev) => ({
                  ...prev,
                  step3: false,
                  step2: false,
                  step1: false,
                }));
                resetDialog();
              }}
              nextStep={() => {
                setStep((prev) => ({ ...prev, step3: true, step2: false }));
              }}
            />
          </div>
        )}

        {step.step3 && (
          <div className="">
            <div className="text-left w-full">
              <p className="text-[22px] max-md:text-start max-md:col-span-2 mb-2 2xl:text-[24px] tracking-tight font-normal  font-causten-semibold
                   dark:text-white text-[#228367] col-span-1 capitalize shadow-teal-200 text-nowrap w-full">
                {selectedMode} Test
              </p>
            </div>
            <div className="max-md:py-[22px] max-md:px-8 px-[56px]  rounded-[7.493px] w-full py-[26px] 2xl:px-[63px] 2xl:py-[24px]  border border-[#B5B5B5] dark:border-none  bg-white dark:bg-[#181A1D]">
              <div className="max-h-[40vh] max-md:max-h-[80vh] gap-8 2xl:gap-[36px] overflow-y-auto grid grid-cols-4 w-full 2xl:pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                <AdditionalSuggestionsTest />
                <ContentSource />

                <div className="gap-7 w-full col-span-4 grid grid-cols-3 max-md:grid-cols-1">
                  <DropdownCustomTest
                    value={dropDownSelect.count}
                    name={"Number of questions"}
                    options={questionCount}
                    changeOption={(val: string) => {
                      setDropDownSelect((prev) => ({ ...prev, count: val }));
                    }}
                    disabled={true}
                  />
                  <DropdownCustomTest
                    value={dropDownSelect.level}
                    name={"Difficulty"}
                    options={difficultyLevel}
                    changeOption={(val: string) => {
                      setDropDownSelect((prev) => ({ ...prev, level: val }));
                    }}
                    disabled={true}
                  />
                  <DropdownCustomTest
                    value={dropDownSelect.time}
                    name={"Time limit"}
                    options={timeLimit}
                    changeOption={(val: string) => {
                      setDropDownSelect((prev) => ({ ...prev, time: val }));
                    }}
                    disabled={true}
                  />
                </div>

                <div
                  className="space-x-4 max-md:space-x-0 max-md:space-y-4 w-full col-span-full text-[11px] 2xl:text-[18px] gap-4
                flex items-center justify-end max-md:justify-start place-items-end"
                >
                  <div className="w-full"></div>
                  <div className="w-full"></div>
                  <VibrantButtonUI
                    font="font-causten-semibold w-full"
                    size={"default"}
                    active={false}
                    onClick={() => {
                      setOpen(false);

                      resetDialog();
                      setStep((prev) => ({
                        ...prev,
                        step3: false,
                        step2: false,
                        step1: false,
                      }));
                    }}
                  >
                    <p className="2xl:text-[14px]">Get back later</p>
                  </VibrantButtonUI>
                  <VibrantButtonUI
                    font="font-causten-semibold w-full"
                    size={"default"}
                    active={true}
                    onClick={() => {
                      localStorage.removeItem("aco-exam-question");
                      localStorage.removeItem("aco-exam-topic");
                      router.push(
                        "/assesment/dailyTest/" +
                        localStorage.getItem("aco-recent-test") || "null"
                      );
                    }}
                  >
                    <p className="2xl:text-[14px]">Start test</p>
                  </VibrantButtonUI>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="w-full">
          {step.step1 && (
            <div className="w-full flex justify-end items-center gap-5 mt-5 max-md:mt-2 2xl:text-[18px]">
              <VibrantButtonUI
                font="font-causten-semibold max-md:w-full disabled:opacity-80"
                size={"default"}
                active={false}
                disable={loading}
                onClick={() => {
                  setOpen(false);
                  resetDialog();
                }}
              >
                <p className="text-[11px] 2xl:text-[14px]">Get Back Later</p>
              </VibrantButtonUI>
              <VibrantButtonUI
                font="font-causten-semibold max-md:w-full disabled:opacity-80"
                size={"default"}
                active={true}
                disable={
                  loading || !selectedFile?.fileName || topicsList.length === 0
                }
                onClick={generateTest}
              >
                <p className="text-[11px] 2xl:text-[14px]">
                  {loading ? (
                    <>
                      <svg
                        aria-hidden="true"
                        role="status"
                        className="inline w-4 h-4 me-3 text-white animate-spin"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C0 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="#E5E7EB"
                        />
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="currentColor"
                        />
                      </svg>
                      Generating test...
                    </>
                  ) : (
                    "Generate test"
                  )}
                </p>
              </VibrantButtonUI>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
