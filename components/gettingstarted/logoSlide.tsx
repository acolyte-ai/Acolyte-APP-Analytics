"use client";
import Image from "next/image";
import Logo from "../../public/acolytelogo.svg";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Title from "./title";
import Slide2 from "./slide-2";
import Slide3 from "./slide-3";
import Slide4 from "./slide-4";
import Slide5 from "./slide-5";
import GettingStarted from "./gettingStarted";
import useUserId from "@/hooks/useUserId";
import { parseCookies } from "nookies";
import Loading from "./loading";
import axios from "axios";

export default function LogoSlide() {
  const router = useRouter();
  const [cookies, setCookies] = useState({});

  useEffect(() => {
    // Read cookies only on the client side
    setCookies(parseCookies());
  }, []);
  const [selectedSubject, setSelectedSubject] = useState<string[]>([]);
  const [selectedExam, setSelectedExam] = useState<string[]>([]);
  const [customExam, setCustomExam] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [email, setEmail] = useState("");
  const userId = useUserId();
  const [selectOptions, setSelectOptions] = useState({
    slide1: true,
    slide2: false,
    slide3: false,
    slide4: false,
    slide5: false,
  });
  const [isSyncing, setisSyncing] = useState(false)

  const [intro, setIntro] = useState(true);

  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setFullName(localStorage.getItem("fullName") || "");
    }
  }, []);

  // Function to update slides
  const updateSlide = (newSlide) => {
    setSelectOptions({
      slide1: newSlide === 1,
      slide2: newSlide === 2,
      slide3: newSlide === 3,
      slide4: newSlide === 4,
      slide5: newSlide === 5,
    });
  };

  // Get current active slide
  const activeSlide = Object.values(selectOptions).indexOf(true) + 1;

  // Handle Next Button
  const handleNext = () => {
    if (activeSlide < 5) {
      updateSlide(activeSlide + 1);
    }
  };

  // Handle Previous Button
  const handlePrev = () => {
    if (activeSlide > 1) {
      updateSlide(activeSlide - 1);
    }
  };

  async function updateUserPreference() {
    const url = `${process.env.NEXT_PUBLIC_AUTH_URL}/userPreference`;
    const payload = {
      user_id: userId,
      userName: cookies?.userName,
      email: cookies?.userEmail,
      College: selectedCollege,
      PendingUser: "Yes",
      toughestSubject: selectedSubject,
      examPrepare: selectedExam,
      setup_completed: true,
      fullName: fullName,
    };

    const studentPayload = {
      "userId": userId,
      "username": cookies?.userName,
      "email": cookies?.userEmail,
      "profilePicture": "",
      "phoneno": "",
      "location": "",
      "studentID": "",
      "degree": "",
      "year": "",
      "college": selectedCollege,
      "enrolled_for": selectedExam
    }
    setisSyncing(true)

    try {
      // const response = await fetch(url, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(payload),
      // });

      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const studentProfile = await axios.post(process.env.NEXT_PUBLIC_PROFILE_BASE_URL + "/dev/v1/profile", studentPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      console.log("Success:", response.data.data);
      router.push("/dashboard");

      return;
    } catch (error) {
      console.error("Error:", error?.message);
    }
    finally {
      setisSyncing(false)
    }
  }

  // Handle Dashboard Navigation
  const handleDashboardRedirect = async () => {

    await updateUserPreference();
  };

  useEffect(() => {
    // Start timeout
    const introTime = setTimeout(() => setIntro(false), 2000);

    // Cleanup function to clear timeout on unmount
    return () => clearTimeout(introTime);
  }, []);

  return (
    <div className="lg:w-[57rem] lg:h-[27rem] max-lg:w-full md:h-[27rem]">
      {/* Carousel content */}
      {isSyncing && <div className="z-10 absolute inset-0 flex items-center justify-center
      h-screen w-full bg-gray-900/30 backdrop-blur-md">
        <Loading />
      </div>}

      {intro ? (
        <GettingStarted />
      ) : (
        <div
          className="grid grid-cols-1  items-center justify-center
                     mx-auto p-4 max-sm:p-2 relative  max-sm:h-[27rem]"
        >
          <div className="
           flex w-full  justify-center
          animate-scale-down col-span-1 items-start mt-10 ">
            <div className="w-28 h-28 max-sm:w-20 max-sm:h-20">
              <Image
                src={Logo}
                height={150}
                width={150}
                alt="waving hand  "
              />
            </div>

          </div>

          <div className="w-full h-[14rem]   flex
           items-center justify-center ">
            {selectOptions.slide1 && <Title />}
            {selectOptions.slide2 && (
              <Slide2
                selectedSubject={selectedSubject}
                setSelectedSubject={setSelectedSubject}
              />
            )}
            {selectOptions.slide3 && (
              <Slide3
                customExam={customExam}
                setCustomExam={setCustomExam}
                selectedExam={selectedExam}
                setSelectedExam={setSelectedExam}
              />
            )}
            {selectOptions.slide5 && (
              <Slide4 email={email} setEmail={setEmail} />
            )}
            {selectOptions.slide4 && (
              <Slide5
                selectedCollege={selectedCollege}
                setSelectedCollege={setSelectedCollege}
              />
            )}
          </div>

          <div className="text-violet-600
           items-end flex justify-between pb-3 w-full col-span-1 max-sm:text-xs ">
            {/* Previous Button */}
            <button
              className={`flex items-center pl-3 ${activeSlide === 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              onClick={handlePrev}
              disabled={activeSlide === 1}
            >
              <ArrowLeftIcon className="w-5 h-5" /> <p>Previous</p>
            </button>

            {/* Next Button or Welcome Button */}
            {activeSlide === 5 ? (
              <button
                className="flex pr-3 text-white bg-purple-600 px-4 py-1 rounded-lg "
                onClick={handleDashboardRedirect}
              >
                <p>Welcome to Acolyte</p>{" "}
                <ArrowRightIcon className="w-5 h-5 ml-1" />
              </button>
            ) : (
              <button className="flex pr-3 items-center" onClick={handleNext}>
                <p>Next</p> <ArrowRightIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Dots - Completely outside the carousel */}
          {!intro && (
            <div className="flex w-full justify-center gap-10 max-sm:gap-5 mb-8 absolute -bottom-36 max-sm:-bottom-28
            col-span-1 items-center">
              <div
                className={`w-5 h-5 max-sm:w-3 max-sm:h-3 bg-gray-400 rounded-full active:w-7
                   active:bg-purple-500 transition-all ${selectOptions.slide1 ? "w-7 bg-purple-500" : ""
                  }`}
                onClick={() => {
                  setSelectOptions({
                    slide1: true,
                    slide2: false,
                    slide3: false,
                    slide4: false,
                    slide5: false,
                  });
                }}
              ></div>
              <div
                className={`w-5 h-5 max-sm:w-3 max-sm:h-3 bg-gray-400 rounded-full active:w-7 active:bg-purple-500 transition-all ${selectOptions.slide2 ? "w-7 bg-purple-500" : ""
                  }`}
                onClick={() => {
                  setSelectOptions({
                    slide1: false,
                    slide2: true,
                    slide3: false,
                    slide4: false,
                    slide5: false,
                  });
                }}
              ></div>
              <div
                className={`w-5 h-5 max-sm:w-3 max-sm:h-3 bg-gray-400 rounded-full active:w-7 active:bg-purple-500 transition-all ${selectOptions.slide3 ? "w-7 bg-purple-500" : ""
                  }`}
                onClick={() => {
                  setSelectOptions({
                    slide1: false,
                    slide2: false,
                    slide3: true,
                    slide4: false,
                    slide5: false,
                  });
                }}
              ></div>
              <div
                className={`w-5 h-5 max-sm:w-3 max-sm:h-3 bg-gray-400 rounded-full active:w-7 active:bg-purple-500 transition-all ${selectOptions.slide4 ? "w-7 bg-purple-500" : ""
                  }`}
                onClick={() => {
                  setSelectOptions({
                    slide1: false,
                    slide2: false,
                    slide3: false,
                    slide4: true,
                    slide5: false,
                  });
                }}
              ></div>
              <div
                className={`w-5 h-5 max-sm:w-3 max-sm:h-3 bg-gray-400 rounded-full active:w-7 active:bg-purple-500 transition-all ${selectOptions.slide5 ? "w-7 bg-purple-500" : ""
                  }`}
                onClick={() => {
                  setSelectOptions({
                    slide1: false,
                    slide2: false,
                    slide3: false,
                    slide4: false,
                    slide5: true,
                  });
                }}
              ></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}