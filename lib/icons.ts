import { 
    Briefcase, 
    Trophy, 
    CreditCard, 
    Key, 
    BookOpen, 
    ClipboardList, 
    GraduationCap, 
    Award, 
    Star, 
    History,
    Search,
    Menu,
    X,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    MapPin,
    Calendar,
    Clock,
    User,
    CheckCircle2,
    AlertCircle,
    Info,
    ExternalLink,
    ArrowRight,
    ArrowLeft,
    Facebook,
    Twitter,
    Instagram,
    Youtube,
    Linkedin,
    Share2,
    Copy,
    Download
} from 'lucide-react'

/**
 * Centralized Icon Registry
 * 
 * Usage:
 * import { Icons } from '@/lib/icons'
 * <Icons.Briefcase className="..." />
 * 
 * This ensures we only import what we need and provides a single 
 * point of optimization if we switch to custom SVGs later.
 */
export const Icons = {
    Briefcase,
    Trophy,
    CreditCard,
    Key,
    BookOpen,
    ClipboardList,
    GraduationCap,
    Award,
    Star,
    History,
    Search,
    Menu,
    X,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    MapPin,
    Calendar,
    Clock,
    User,
    CheckCircle2,
    AlertCircle,
    Info,
    ExternalLink,
    ArrowRight,
    ArrowLeft,
    Facebook,
    Twitter,
    Instagram,
    Youtube,
    Linkedin,
    Share2,
    Copy,
    Download
}

export type IconType = keyof typeof Icons
