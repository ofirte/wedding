import { exportToExcel } from "../utils/ExcelUtils";

// Types for localization system
export type Language = "en" | "he";

export type Direction = "ltr" | "rtl";

export interface LocalizationConfig {
  language: Language;
  direction: Direction;
  isRtl: boolean;
}

export const LANGUAGE_CONFIG: Record<
  Language,
  { direction: Direction; name: string; nativeName: string }
> = {
  en: {
    direction: "ltr",
    name: "English",
    nativeName: "English",
  },
  he: {
    direction: "rtl",
    name: "Hebrew",
    nativeName: "עברית",
  },
};

export const DEFAULT_LANGUAGE: Language = "en";

// Translation key structure - expandable for different sections
export interface Translations {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    loading: string;
    error: string;
    success: string;
    confirm: string;
    yes: string;
    no: string;
    changeLanguage: string;
    signOut: string;
    user: string;
    actions: string;
    details: string;
    high: string;
    medium: string;
    budgetSpent: string;
    low: string;
    name: string;
    description: string;
    of: string;
    priority: string;
    dueDate: string;
    assignedTo: string;
    ongoing: string;
    guests: string;
    status: string;
    inProgress: string;
    unassigned: string;
    bride: string;
    groom: string;
    both: string;
    category: string;
    expectedPrice: string;
    actualPrice: string;
    downPayment: string;
    balance: string;
    contract: string;
    contractDocument: string;
    uploadContract: string;
    uploadError: string;
    allTasks: string;
    toDo: string;
    pending: string;
    completed: string;
    accepted: string;
    errorLoading: string;
    tryAgain: string;
    adding: string;
    addTask: string;
    newTask: string;
    taskTitle: string;
    taskTitleRequired: string;
    moreDetails: string;
    addMoreDetails: string;
    failedUpload: string;
    changeDaysUntil: string;
    specialDay: string;
    taskProgress: string;
    tasksCompleted: string;
    weddingCountdown: string;
    highPriority: string;
    tasksNeedAttention: string;
    percentage: string;
    emailAddress: string;
    password: string;
    fullName: string;
    confirmPassword: string;
    passwordsDoNotMatch: string;
    signInWithGoogle: string;
    dontHaveAccount: string;
    signUp: string;
    alreadyHaveAccount: string;
    signIn: string;
    editTotalBudget: string;
    weddingName: string;
    brideName: string;
    groomName: string;
    weddingDate: string;
    createWedding: string;
    joinWedding: string;
    setupWedding: string;
    welcomeNewUser: string;
    createNewWedding: string;
    joinExistingWedding: string;
    weddingId: string;
    enterWeddingId: string;
    enterWeddingIdDescription: string;
    joinWeddingDescription: string;
    haveInvitationCode: string;
    orEnterWeddingId: string;
    invitationCode: string;
    useWeddingIdInstead: string;
    pleaseEnterInvitationCode: string;
    mustBeLoggedIn: string;
    pleaseEnterWeddingName: string;
    pleasEnterWeddingId: string;
    unexpectedError: string;
    failedToSignIn: string;
    createWeddingAccount: string;
    responseRate: string;
    uploadFile: string;
    custom: string;
    expenseName: string;
    exportToExcel: string;
    filters: string;
    // Invitation sharing
    shareWedding: string;
    inviteOthers: string;
    shareInvitationDescription: string;
    invitationCodeLabel: string;
    invitationLink: string;
    copyInvitationCode: string;
    copyInvitationLink: string;
    invitationCodeCopied: string;
    invitationLinkCopied: string;
    shareViaEmail: string;
    shareViaWhatsApp: string;
    selected: string;
    noChange: string;
    more: string;
    update: string;
    clearAll: string;
  };
  nav: {
    home: string;
    budget: string;
    guests: string;
    tasks: string;
    wedding: string;
  };
  home: {
    title: string;
    welcome: string;
    countdown: string;
    daysUntil: string;
    timeline: string;
    daysRemaining: string;
    weddingCountdown: string;
    days: string;
    untilSpecialDay: string;
  };
  budget: {
    title: string;
    totalBudget: string;
    spent: string;
    remaining: string;
    addItem: string;
    planning: string;
    errorLoadingBudget: string;
    addingBudgetItem: string;
    overview: string;
    budgetSpent: string;
    budget: string;
    paidSoFar: string;
    actualTotal: string;
    expectedTotal: string;
  };
  guests: {
    title: string;
    totalGuests: string;
    confirmed: string;
    pending: string;
    declined: string;
    addGuest: string;
    accepted: string;
    side: string;
    guestList: string;
    guestsConfirmed: string;
    editGuestDetails: string;
    newGuestDetails: string;
    rsvpStatus: string;
    attendance: string;
    attendanceHelper: string;
    relation: string;
    amount: string;
    amountConfirm: string;
    cellphone: string;
    groom: string;
    bride: string;
    bulkUpdate: string;
    bulkDelete: string;
    bulkUpdateTitle: string;
    bulkUpdateDescription: string;
    bulkDeleteTitle: string;
    bulkDeleteConfirmation: string;
    selectedGuests: string;
  };
  tasks: {
    title: string;
    completed: string;
    pending: string;
    overdue: string;
    addTask: string;
    weddingTasks: string;
    tasks: string;
    taskProgress: string;
    tasksCompleted: string;
    taskDescription: string;
    tasksCompletedCount: string;
    upcomingDueTasks: string;
    dueSoon: string;
    searchTasks: string;
    editTask: string;
    mostImportant: string;
    importantTasks: string;
    noCriticalTasks: string;
    allCaughtUp: string;
  };
  wedding: {
    title: string;
    date: string;
    venue: string;
    details: string;
    planner: string;
    studio: string;
  };
  labels: {
    due: string;
    assigned: string;
    of: string;
    until: string;
  };
  placeholders: {
    exampleWeddingName: string;
    exampleWeddingId: string;
    enterInvitationCode: string;
    whatNeedsToBeDone: string;
  };
  contacts: {
    matchContacts: string;
    accessRequired: string;
    accessDescription: string;
    grantAccess: string;
    searchContacts: string;
    selectedContact: string;
    noContactsFound: string;
    tryDifferentSearch: string;
    noPhoneNumber: string;
    currentlyMatching: string;
    confirmMatch: string;
    skip: string;
    matchingComplete: string;
    completedDescription: string;
    progressLabel: string;
    noInviteesNeedPhone: string;
    next: string;
    previous: string;
    done: string;
    close: string;
    inviteeName: string;
    editNameHint: string;
    contactsFound: string;
    showingAllContacts: string;
    searchPlaceholder: string;
  };
}
