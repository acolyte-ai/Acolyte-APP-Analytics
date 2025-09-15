// Type definitions for the API response
export interface ProfileData {
    college: string;
    degree: string;
    enrolled_for: string;
    photo: string;
    year: string;
}

export interface ContactData {
    email: string;
    location: string;
    phoneno: string;
    studentID: string;
    name: string;
}

export interface CurrentGoal {
    id: number;
    label: string;
    completed: boolean;
}

export interface LearningData {
    date: string;
    progress: number;
    title: string;
    improvement: number;
}

export interface StatisticData {
    iconUrl: string;
    title: string;
    value: string;
    subtitle: string;
    parameter: string;
}

export interface Achievements {
    title: string;
    icon: string;
}

export interface ProfileResponse {
    profile: ProfileData;
    contact: ContactData;
    currentGoals: CurrentGoal[];
    myLearning: LearningData[];
    statistics: StatisticData[];
    achievements: Achievement[];
}