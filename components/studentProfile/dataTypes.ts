
export interface ProfilePicture {
    hasImage: boolean;
    initials: string;
    avatarUrl: string;
    uploadedAt: string;
    allowChange: boolean;
    maxFileSize: string;
    allowedFormats: string[];
}

export interface PersonalInformation {
    fullName: string;
    phoneNumber: string;
    emailAddress: string;
    emailVerified: boolean;
    emailConfirmation: string;
    degree: string;
    examTarget: string;
    location: string;
    year: string;
    institution: string;
    specializationInterest: string;
}

export interface UserProfile {
    profilePicture: ProfilePicture;
    personalInformation: PersonalInformation;
}

export interface ProfileEditResponse {
    userProfile: UserProfile;
}
