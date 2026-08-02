import {
    AlertTriangle,
    Plane,
    MapPin,
    UserX,
    FileSearch,
    ScrollText,
    Building2,
    CalendarClock,
    type LucideIcon,
  } from "lucide-react"
  
  export interface CheckType {
    id: string
    title: string
    titleAr: string
    description: string
    descriptionAr: string
    icon: LucideIcon
    price: number
    fastTrackPrice: number
    popular: boolean
    estimatedTime: string
    requiredDocuments: string[]
    optionalDocuments: string[]
  }
  
  export const checkTypes: CheckType[] = [
    {
      id: "overstay-fine",
      title: "Overstay Fine Checker",
      titleAr: "فحص غرامة التأخير",
      description: "Find unpaid overstay penalties on your visa",
      descriptionAr: "اكتشف غرامات التأخير غير المدفوعة على تأشيرتك",
      icon: AlertTriangle,
      price: 20,
      fastTrackPrice: 50,
      popular: true,
      estimatedTime: "24-48 hours",
      requiredDocuments: ["Passport scan"],
      optionalDocuments: ["Emirates ID (front & back)"],
    },
    {
      id: "travel-ban",
      title: "Travel Ban Checker",
      titleAr: "فحص حظر السفر",
      description: "Check if there's a travel restriction against you",
      descriptionAr: "تحقق مما إذا كان هناك حظر سفر ضدك",
      icon: Plane,
      price: 20,
      fastTrackPrice: 50,
      popular: true,
      estimatedTime: "24-48 hours",
      requiredDocuments: ["Passport scan"],
      optionalDocuments: ["Emirates ID (front & back)"],
    },
    {
      id: "inside-outside",
      title: "Inside/Outside UAE",
      titleAr: "داخل/خارج الإمارات",
      description: "Confirm your current entry/exit status",
      descriptionAr: "تأكيد حالة دخولك/خروجك الحالية",
      icon: MapPin,
      price: 20,
      fastTrackPrice: 50,
      popular: false,
      estimatedTime: "24-48 hours",
      requiredDocuments: ["Passport scan"],
      optionalDocuments: [],
    },
    {
      id: "absconding",
      title: "Absconding Checker",
      titleAr: "فحص الهروب",
      description: "Check for absconding case filed against you",
      descriptionAr: "تحقق من قضية الهروب المرفوعة ضدك",
      icon: UserX,
      price: 20,
      fastTrackPrice: 50,
      popular: true,
      estimatedTime: "24-48 hours",
      requiredDocuments: ["Passport scan", "Emirates ID (front & back)"],
      optionalDocuments: ["Previous visa copy"],
    },
    {
      id: "application-status",
      title: "Application Status",
      titleAr: "حالة الطلب",
      description: "Track any pending visa or residency application",
      descriptionAr: "تتبع أي طلب تأشيرة أو إقامة معلق",
      icon: FileSearch,
      price: 20,
      fastTrackPrice: 50,
      popular: false,
      estimatedTime: "24-48 hours",
      requiredDocuments: ["Passport scan", "Application reference number"],
      optionalDocuments: ["Emirates ID (front & back)"],
    },
    {
      id: "nawakas",
      title: "Nawakas Checker",
      titleAr: "فحص النواقص",
      description: "Civil status and immigration record check",
      descriptionAr: "فحص الحالة المدنية وسجل الهجرة",
      icon: ScrollText,
      price: 20,
      fastTrackPrice: 50,
      popular: false,
      estimatedTime: "24-48 hours",
      requiredDocuments: ["Passport scan", "Emirates ID (front & back)"],
      optionalDocuments: ["Previous visa copies"],
    },
    {
      id: "establishment-ban",
      title: "Establishment Card Ban",
      titleAr: "حظر بطاقة المنشأة",
      description: "Check your company establishment card status",
      descriptionAr: "تحقق من حالة بطاقة منشأتك التجارية",
      icon: Building2,
      price: 20,
      fastTrackPrice: 50,
      popular: false,
      estimatedTime: "24-48 hours",
      requiredDocuments: ["Trade license", "Establishment card"],
      optionalDocuments: ["Owner passport scan"],
    },
    {
      id: "expiry-checker",
      title: "Expiry Checker",
      titleAr: "فحص انتهاء الصلاحية",
      description: "Track visa, passport, Emirates ID, labor card expiry",
      descriptionAr: "تتبع انتهاء التأشيرة والجواز والهوية وبطاقة العمل",
      icon: CalendarClock,
      price: 20,
      fastTrackPrice: 50,
      popular: false,
      estimatedTime: "24-48 hours",
      requiredDocuments: ["Passport scan"],
      optionalDocuments: ["Emirates ID (front & back)", "Labor card"],
    },
  ]
  
  export const nationalities = [
    "Afghanistan", "Albania", "Algeria", "Argentina", "Armenia", "Australia",
    "Austria", "Azerbaijan", "Bahrain", "Bangladesh", "Belarus", "Belgium",
    "Bolivia", "Bosnia and Herzegovina", "Brazil", "Bulgaria", "Cambodia",
    "Cameroon", "Canada", "Chile", "China", "Colombia", "Croatia", "Cuba",
    "Czech Republic", "Denmark", "Ecuador", "Egypt", "Eritrea", "Estonia",
    "Ethiopia", "Finland", "France", "Georgia", "Germany", "Ghana", "Greece",
    "Hungary", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
    "Italy", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Kyrgyzstan",
    "Latvia", "Lebanon", "Libya", "Lithuania", "Malaysia", "Maldives", "Mexico",
    "Morocco", "Nepal", "Netherlands", "New Zealand", "Nigeria", "North Korea",
    "Norway", "Oman", "Pakistan", "Palestine", "Peru", "Philippines", "Poland",
    "Portugal", "Qatar", "Romania", "Russia", "Saudi Arabia", "Serbia",
    "Singapore", "Slovakia", "Slovenia", "Somalia", "South Africa", "South Korea",
    "Spain", "Sri Lanka", "Sudan", "Sweden", "Switzerland", "Syria", "Taiwan",
    "Tajikistan", "Tanzania", "Thailand", "Tunisia", "Turkey", "Turkmenistan",
    "UAE", "Uganda", "Ukraine", "United Kingdom", "United States", "Uzbekistan",
    "Venezuela", "Vietnam", "Yemen", "Zimbabwe"
  ]
  
  export interface Application {
    id: string
    checkType: CheckType
    status: "submitted" | "processing" | "completed" | "failed"
    submittedAt: Date
    estimatedCompletion: Date
    speed: "standard" | "fast-track"
    price: number
    result?: {
      summary: string
      details: string[]
      hasIssues: boolean
    }
    progress?: number
    currentStep?: string
  }
  
  export const mockApplications: Application[] = [
    {
      id: "APP-2024-001",
      checkType: checkTypes[0], // Overstay Fine
      status: "completed",
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      estimatedCompletion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      speed: "standard",
      price: 20,
      result: {
        summary: "No overstay fines found",
        details: [
          "Visa status: Valid",
          "Last entry: 15 Jan 2024",
          "Days stayed: 45 (within limit)",
          "Outstanding fines: AED 0",
        ],
        hasIssues: false,
      },
    },
    {
      id: "APP-2024-002",
      checkType: checkTypes[1], // Travel Ban
      status: "processing",
      submittedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      estimatedCompletion: new Date(Date.now() + 12 * 60 * 60 * 1000),
      speed: "fast-track",
      price: 50,
      progress: 65,
      currentStep: "Verifying with immigration database",
    },
    {
      id: "APP-2024-003",
      checkType: checkTypes[3], // Absconding
      status: "submitted",
      submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      estimatedCompletion: new Date(Date.now() + 46 * 60 * 60 * 1000),
      speed: "standard",
      price: 20,
      progress: 10,
      currentStep: "Document verification in progress",
    },
  ]
  