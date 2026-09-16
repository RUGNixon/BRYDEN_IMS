"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type LanguageCode = "en" | "fr" | "rw";

interface Translations {
    // Navigation
    navDashboard: string;
    navProducts: string;
    navSales: string;
    navPurchase: string;
    navExpenses: string;
    navOrders: string;
    navTaxation: string;
    navAnalytics: string;
    navNotes: string;
    navCalendar: string;
    navSettings: string;

    // Header & Common
    systemName: string;
    tagline: string;
    saveChanges: string;
    saving: string;
    savedSuccessfully: string;
    cancel: string;
    active: string;
    selected: string;
    status: string;

    // Settings General
    settingsTitle: string;
    settingsSubtitle: string;

    // Language Section
    languageTitle: string;
    languageSubtitle: string;
    english: string;
    french: string;
    kinyarwanda: string;

    // Tax Section
    taxTitle: string;
    taxSubtitle: string;
    taxMonthlyTitle: string;
    taxMonthlyDesc: string;
    taxQuarterlyTitle: string;
    taxQuarterlyDesc: string;
    taxNextDeadline: string;
    taxComplianceNote: string;
    taxMonthlyNotice: string;
    taxQuarterlyNotice: string;

    // Theme Section
    themeTitle: string;
    themeSubtitle: string;
    themeLightTitle: string;
    themeLightDesc: string;
    themeDarkTitle: string;
    themeDarkDesc: string;

    // Password Section
    passwordTitle: string;
    passwordSubtitle: string;
    currentPasswordLabel: string;
    newPasswordLabel: string;
    confirmPasswordLabel: string;
    updatePasswordBtn: string;
    passwordStrengthWeak: string;
    passwordStrengthMedium: string;
    passwordStrengthStrong: string;
    passwordSuccess: string;

    // Email Section
    emailTitle: string;
    emailSubtitle: string;
    currentEmailLabel: string;
    newEmailLabel: string;
    confirmWithPasswordLabel: string;
    updateEmailBtn: string;
    emailSuccess: string;

    // Authentication & Authorization
    authSignIn: string;
    authSignUp: string;
    authWelcomeBack: string;
    authWelcomeBackSubtitle: string;
    authCreateAccountTitle: string;
    authCreateAccountSubtitle: string;
    authFullName: string;
    authEmail: string;
    authPassword: string;
    authConfirmPassword: string;
    authPhone: string;
    authRole: string;
    authRoleAdmin: string;
    authRoleAdminDesc: string;
    authRoleManager: string;
    authRoleManagerDesc: string;
    authRememberMe: string;
    authForgotPassword: string;
    authSignInBtn: string;
    authSignUpBtn: string;
    authHaveAccount: string;
    authNoAccount: string;
    authQuickDemo: string;
    authSigningIn: string;
    authRegistering: string;
    authSignOut: string;
    authSignOutConfirm: string;
    authSessionActive: string;
}

const dictionaries: Record<LanguageCode, Translations> = {
    en: {
        navDashboard: "Dashboard",
        navProducts: "Products",
        navSales: "Sales",
        navPurchase: "Purchase",
        navExpenses: "Expenses",
        navOrders: "Orders & Loans",
        navTaxation: "Taxation",
        navAnalytics: "Analytics",
        navNotes: "Notes",
        navCalendar: "Calendar",
        navSettings: "Settings",

        systemName: "Bryden IMS",
        tagline: "Inventory Management System",
        saveChanges: "Save Changes",
        saving: "Saving...",
        savedSuccessfully: "Changes saved successfully!",
        cancel: "Cancel",
        active: "Active",
        selected: "Selected",
        status: "Status",

        settingsTitle: "Settings & Preferences",
        settingsSubtitle: "Manage your system language, tax filing schedule, theme appearance, and login credentials.",

        languageTitle: "System Language",
        languageSubtitle: "Choose the default interface language for all menus, forms, and alerts.",
        english: "English (US/UK)",
        french: "Français (French)",
        kinyarwanda: "Ikinyarwanda (Rwanda)",

        taxTitle: "Tax Payment Schedule",
        taxSubtitle: "Select how often your business files taxes to compute upcoming deadlines and compliance alerts.",
        taxMonthlyTitle: "Monthly Tax Payment",
        taxMonthlyDesc: "Standard schedule for VAT (18%) and PAYE withholdings. Declarations are due by the 15th of each consecutive month.",
        taxQuarterlyTitle: "Quarterly Tax Payment",
        taxQuarterlyDesc: "Applicable for quarterly VAT schemes and provisional Corporate Income Tax (CIT) installments (Q1-Q4).",
        taxNextDeadline: "Estimated Next Payment Deadline",
        taxComplianceNote: "Note: In Rwanda (RRA), declarations and payments must be completed before the 15th of the filing month to prevent penalties.",
        taxMonthlyNotice: "You are currently tracked under the Monthly tax filing regime. Notifications will trigger before the 15th of each month.",
        taxQuarterlyNotice: "You are currently tracked under the Quarterly tax filing regime. Declarations correspond to Q1 (Apr 15), Q2 (Jul 15), Q3 (Oct 15), and Q4 (Jan 15).",

        themeTitle: "Appearance & Theme",
        themeSubtitle: "Switch between clean crisp Light mode and high-contrast OLED Dark mode.",
        themeLightTitle: "Light Theme",
        themeLightDesc: "Crisp white cards, subtle slate borders, and vibrant accents for high daylight visibility.",
        themeDarkTitle: "Dark Theme",
        themeDarkDesc: "Deep slate surfaces, relaxed contrast, and luminous neon highlights for nighttime or low-light work.",

        passwordTitle: "Update Password",
        passwordSubtitle: "Change the administrator password used to log in to the Bryden IMS portal.",
        currentPasswordLabel: "Current Password",
        newPasswordLabel: "New Password",
        confirmPasswordLabel: "Confirm New Password",
        updatePasswordBtn: "Update Password",
        passwordStrengthWeak: "Weak password (add letters, numbers, or symbols)",
        passwordStrengthMedium: "Moderate strength password",
        passwordStrengthStrong: "Strong and secure password",
        passwordSuccess: "Your password has been successfully updated!",

        emailTitle: "Update Sign-In Email",
        emailSubtitle: "Modify the primary administrator email address for sign-in and system recovery.",
        currentEmailLabel: "Current Sign-In Email",
        newEmailLabel: "New Email Address",
        confirmWithPasswordLabel: "Confirm with Current Password",
        updateEmailBtn: "Save New Email",
        emailSuccess: "Your sign-in email has been updated successfully!",
        
        authSignIn: "Sign In",
        authSignUp: "Create Account",
        authWelcomeBack: "Welcome Back",
        authWelcomeBackSubtitle: "Sign in to access your inventory management workspace and real-time operations.",
        authCreateAccountTitle: "Create Account",
        authCreateAccountSubtitle: "Register a new administrative or manager profile for your organization.",
        authFullName: "Full Name",
        authEmail: "Email Address",
        authPassword: "Password",
        authConfirmPassword: "Confirm Password",
        authPhone: "Phone Number (Optional)",
        authRole: "Account Role",
        authRoleAdmin: "Administrator",
        authRoleAdminDesc: "Full administrative access to settings, user management, and all system tools.",
        authRoleManager: "Inventory Manager",
        authRoleManagerDesc: "Manage stock levels, sales records, purchase orders, client accounts, and expenses.",
        authRememberMe: "Remember me for 30 days",
        authForgotPassword: "Forgot password?",
        authSignInBtn: "Sign In to Bryden IMS",
        authSignUpBtn: "Complete Registration",
        authHaveAccount: "Already registered?",
        authNoAccount: "Need a new account?",
        authQuickDemo: "Fill Demo Credentials (Admin)",
        authSigningIn: "Authenticating...",
        authRegistering: "Creating account...",
        authSignOut: "Sign Out",
        authSignOutConfirm: "Are you sure you want to sign out of your Bryden IMS session?",
        authSessionActive: "Session Active",
    },

    fr: {
        navDashboard: "Tableau de Bord",
        navProducts: "Produits",
        navSales: "Ventes",
        navPurchase: "Achats",
        navExpenses: "Dépenses",
        navOrders: "Commandes & Prêts",
        navTaxation: "Fiscalité",
        navAnalytics: "Analytique",
        navNotes: "Notes",
        navCalendar: "Calendrier",
        navSettings: "Paramètres",

        systemName: "Bryden IMS",
        tagline: "Système de Gestion des Stocks",
        saveChanges: "Enregistrer les modifications",
        saving: "Enregistrement...",
        savedSuccessfully: "Modifications enregistrées avec succès !",
        cancel: "Annuler",
        active: "Actif",
        selected: "Sélectionné",
        status: "Statut",

        settingsTitle: "Paramètres & Préférences",
        settingsSubtitle: "Gérez la langue du système, le calendrier fiscal, l'apparence et vos identifiants de connexion.",

        languageTitle: "Langue du Système",
        languageSubtitle: "Choisissez la langue d'affichage pour l'ensemble des menus, formulaires et notifications.",
        english: "Anglais (English)",
        french: "Français (France / Afrique)",
        kinyarwanda: "Ikinyarwanda (Rwanda)",

        taxTitle: "Mode de Paiement des Impôts",
        taxSubtitle: "Définissez la fréquence de vos déclarations fiscales pour le suivi des échéances et rappels de conformité.",
        taxMonthlyTitle: "Paiement Mensuel des Impôts",
        taxMonthlyDesc: "Régime standard pour la TVA (18%) et les retenues PAYE. Les déclarations sont dues au plus tard le 15 de chaque mois.",
        taxQuarterlyTitle: "Paiement Trimestriel des Impôts",
        taxQuarterlyDesc: "Applicable aux régimes de TVA trimestrielle et aux acomptes provisionnels de l'impôt sur les sociétés (Q1-Q4).",
        taxNextDeadline: "Prochaine Échéance Estimée",
        taxComplianceNote: "Remarque : Au Rwanda (RRA), les déclarations et règlements doivent être effectués avant le 15 du mois d'échéance pour éviter les pénalités.",
        taxMonthlyNotice: "Vous êtes actuellement sous le régime fiscal Mensuel. Des alertes s'afficheront avant le 15 de chaque mois.",
        taxQuarterlyNotice: "Vous êtes actuellement sous le régime fiscal Trimestriel. Les déclarations correspondent à T1 (15 avr), T2 (15 juil), T3 (15 oct) et T4 (15 jan).",

        themeTitle: "Apparence & Thème",
        themeSubtitle: "Basculez entre le mode Clair élégant et le mode Sombre à contraste optimisé.",
        themeLightTitle: "Thème Clair",
        themeLightDesc: "Cartes blanches nettes, bordures ardoise subtiles et lisibilité idéale en plein jour.",
        themeDarkTitle: "Thème Sombre",
        themeDarkDesc: "Surfaces ardoise profondes, contraste doux et reflets soignés pour le confort visuel.",

        passwordTitle: "Modifier le Mot de Passe",
        passwordSubtitle: "Changez le mot de passe administrateur utilisé pour vous connecter à Bryden IMS.",
        currentPasswordLabel: "Mot de Passe Actuel",
        newPasswordLabel: "Nouveau Mot de Passe",
        confirmPasswordLabel: "Confirmer le Nouveau Mot de Passe",
        updatePasswordBtn: "Mettre à jour le Mot de Passe",
        passwordStrengthWeak: "Mot de passe faible (ajoutez des lettres, chiffres ou symboles)",
        passwordStrengthMedium: "Mot de passe de force moyenne",
        passwordStrengthStrong: "Mot de passe robuste et sécurisé",
        passwordSuccess: "Votre mot de passe a été mis à jour avec succès !",

        emailTitle: "Modifier l'Email de Connexion",
        emailSubtitle: "Modifiez l'adresse email principale utilisée pour l'accès administrateur et la réinitialisation.",
        currentEmailLabel: "Email de Connexion Actuel",
        newEmailLabel: "Nouvelle Adresse Email",
        confirmWithPasswordLabel: "Confirmer avec le Mot de Passe Actuel",
        updateEmailBtn: "Enregistrer le Nouvel Email",
        emailSuccess: "Votre adresse email a été modifiée avec succès !",

        authSignIn: "Se Connecter",
        authSignUp: "Créer un Compte",
        authWelcomeBack: "Bon retour",
        authWelcomeBackSubtitle: "Connectez-vous pour accéder à votre espace de gestion des stocks et opérations en direct.",
        authCreateAccountTitle: "Créer un Compte",
        authCreateAccountSubtitle: "Enregistrez un nouveau profil administrateur ou gestionnaire pour votre entreprise.",
        authFullName: "Nom Complet",
        authEmail: "Adresse Email",
        authPassword: "Mot de Passe",
        authConfirmPassword: "Confirmer le Mot de Passe",
        authPhone: "Numéro de Téléphone (Optionnel)",
        authRole: "Rôle du Compte",
        authRoleAdmin: "Administrateur",
        authRoleAdminDesc: "Accès complet aux paramètres, gestion des utilisateurs et tous les outils du système.",
        authRoleManager: "Gestionnaire de Stock",
        authRoleManagerDesc: "Gestion des produits, ventes, achats, commandes clients et dépenses de l'inventaire.",
        authRememberMe: "Rester connecté pendant 30 jours",
        authForgotPassword: "Mot de passe oublié ?",
        authSignInBtn: "Se Connecter à Bryden IMS",
        authSignUpBtn: "Finaliser l'Inscription",
        authHaveAccount: "Déjà inscrit ?",
        authNoAccount: "Besoin d'un nouveau compte ?",
        authQuickDemo: "Identifiants Démo (Admin)",
        authSigningIn: "Authentification en cours...",
        authRegistering: "Création du compte en cours...",
        authSignOut: "Déconnexion",
        authSignOutConfirm: "Êtes-vous sûr de vouloir vous déconnecter de votre session Bryden IMS ?",
        authSessionActive: "Session Active",
    },

    rw: {
        navDashboard: "Imbonerahamwe",
        navProducts: "Ibicuruzwa",
        navSales: "Ibyagurishijwe",
        navPurchase: "Ibyaguzwe",
        navExpenses: "Amafaranga Yakoreshejwe",
        navOrders: "Amabwiriza & Inguzanyo",
        navTaxation: "Imisoro n'Amahoro",
        navAnalytics: "Isesengura",
        navNotes: "Inyandiko",
        navCalendar: "Kalandari",
        navSettings: "Ibyo Guhindura",

        systemName: "Bryden IMS",
        tagline: "Uburyo bwo Gucunga Ububiko",
        saveChanges: "Bika Impinduka",
        saving: "Birimo kubikwa...",
        savedSuccessfully: "Impinduka zabitswe neza!",
        cancel: "Reka",
        active: "Birakora",
        selected: "Byahiswemo",
        status: "Imimerere",

        settingsTitle: "Ibyo Guhindura & Amahitamo",
        settingsSubtitle: "Hindura ururimi rwa sisitemu, igihe cyo kwishyura imisoro, imigaragarire, n'amakuru yo kwinjira.",

        languageTitle: "Ururimi rwa Sisitemu",
        languageSubtitle: "Hitamo ururimi wifuza gukoresha muri gahunda zose za sisitemu.",
        english: "Icyongereza (English)",
        french: "Igifaransa (Français)",
        kinyarwanda: "Ikinyarwanda (Rwanda)",

        taxTitle: "Gahunda yo Kwishyura Imisoro",
        taxSubtitle: "Hitamo niba wishyura imisoro buri kwezi cyangwa buri gihembwe kugira ngo umenye igihe nyacyo.",
        taxMonthlyTitle: "Kwishyura Imisoro Buri Kwezi",
        taxMonthlyDesc: "Gahunda isanzwe yo kwishyura TVA (18%) na PAYE. Imenyekanisha rikorwa bitarenze itariki ya 15 ya buri kwezi gukurikira.",
        taxQuarterlyTitle: "Kwishyura Imisoro Buri Gihembwe",
        taxQuarterlyDesc: "Ikoreshwa ku bacuruzi bishyura TVA cyangwa umusoro ku nyungu (CIT) buri mezi atatu (Igihembwe cya 1 kugeza ku cya 4).",
        taxNextDeadline: "Itariki yo Kwishyura Ikurikira",
        taxComplianceNote: "Icyitonderwa: Mu Rwanda (RRA), kumenyekanisha no kwishyura bigomba gukorwa mbere y'itariki 15 y'ukwezi kw'umusoro kugira ngo hirindwe ibihano.",
        taxMonthlyNotice: "Ubu uri muri gahunda yo kumenyekanisha imisoro Buri Kwezi. Ibutsa rizakwereka itariki 15 ya buri kwezi.",
        taxQuarterlyNotice: "Ubu uri muri gahunda yo kumenyekanisha Buri Gihembwe. Igihembwe 1 (15 Mata), Igihembwe 2 (15 Nyakanga), Igihembwe 3 (15 Ukwakira), Igihembwe 4 (15 Mutarama).",

        themeTitle: "Imigaragarire ya Sisitemu (Theme)",
        themeSubtitle: "Hitamo hagati y'urumuri (Light) n'umwijima (Dark) bitewe n'aho ukorera.",
        themeLightTitle: "Urumuri (Light Mode)",
        themeLightDesc: "Amakarita yera, agaragara neza ku manywa n'ahantu hafite urumuri rwinshi.",
        themeDarkTitle: "Umwijima (Dark Mode)",
        themeDarkDesc: "Amabara yijimye arinda amaso umunaniro mu ijoro cyangwa ahantu hari umwijima.",

        passwordTitle: "Guhindura Ijambobanga",
        passwordSubtitle: "Hindura ijambobanga ukoresha winjira muri sisitemu ya Bryden IMS.",
        currentPasswordLabel: "Ijambobanga Uri Gukoresha",
        newPasswordLabel: "Ijambobanga Rishya",
        confirmPasswordLabel: "Subiramo Ijambobanga Rishya",
        updatePasswordBtn: "Hindura Ijambobanga",
        passwordStrengthWeak: "Ijambobanga riciriritse (ongeramo inyuguti, imibare cyangwa ibimenyetso)",
        passwordStrengthMedium: "Ijambobanga riringaniye",
        passwordStrengthStrong: "Ijambobanga rikomeye kandi ryizewe",
        passwordSuccess: "Ijambobanga ryawe ryahinduwe neza!",

        emailTitle: "Guhindura Imeri yo Kwinjira",
        emailSubtitle: "Hindura imeri y'umuyobozi ikoreshwa mu kwinjira no kugarura konti.",
        currentEmailLabel: "Imeri Uri Gukoresha",
        newEmailLabel: "Imeri Nshya",
        confirmWithPasswordLabel: "Emeza Ukoresheje Ijambobanga ryawe",
        updateEmailBtn: "Bika Imeri Nshya",
        emailSuccess: "Imeri yawe yo kwinjira yahinduwe neza!",

        authSignIn: "Kwinjira",
        authSignUp: "Kurema Konti",
        authWelcomeBack: "Kaze Neza",
        authWelcomeBackSubtitle: "Injira kugira ngo ukomeze gukurikirana ibicuruzwa n'imikorere y'ububiko bwawe.",
        authCreateAccountTitle: "Kurema Konti Nshya",
        authCreateAccountSubtitle: "Iyandikishe nk'umuyobozi cyangwa umucungamutungo muri Bryden IMS.",
        authFullName: "Amazina Yose",
        authEmail: "Aderesi ya Imeri",
        authPassword: "Ijambobanga",
        authConfirmPassword: "Emeza Ijambobanga",
        authPhone: "Nimero ya Telefone (Niba Uyifite)",
        authRole: "Inshingano za Konti",
        authRoleAdmin: "Umuyobozi Mukuru (Admin)",
        authRoleAdminDesc: "Uburenganzira bwose kuri sisitemu, gucunga abakoresha n'igenamiterere ryose.",
        authRoleManager: "Umucungamutungo (Manager)",
        authRoleManagerDesc: "Gucunga ibicuruzwa, ibyagurishijwe, ibyaguzwe, inguzanyo n'amafaranga asohoka.",
        authRememberMe: "Komeza unzigame mu minsi 30",
        authForgotPassword: "Wibagiwe ijambobanga?",
        authSignInBtn: "Injira Muri Bryden IMS",
        authSignUpBtn: "Komeza Iyandikishe",
        authHaveAccount: "Wamaze kwiyandikisha?",
        authNoAccount: "Ukeneye konti nshya?",
        authQuickDemo: "Koresha Konti ya Gerageza (Admin)",
        authSigningIn: "Birimo kwemeza...",
        authRegistering: "Konti irimo kuremwa...",
        authSignOut: "Sohoka muri Sisitemu",
        authSignOutConfirm: "Uremeza neza ko ushaka gusohoka muri Bryden IMS?",
        authSessionActive: "Uri Kwinjira",
    },
};

interface LanguageContextType {
    language: LanguageCode;
    setLanguage: (lang: LanguageCode) => void;
    t: (key: keyof Translations) => string;
}

const LanguageContext = createContext<LanguageContextType>({
    language: "en",
    setLanguage: () => {},
    t: (key) => dictionaries.en[key] || "",
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<LanguageCode>("en");

    useEffect(() => {
        // Retrieve language preference from localStorage or API
        const savedLang = localStorage.getItem("bryden_language") as LanguageCode;
        if (savedLang && (savedLang === "en" || savedLang === "fr" || savedLang === "rw")) {
            setLanguageState(savedLang);
        } else {
            // Also attempt to fetch from backend settings
            fetch("/api/settings")
                .then((res) => (res.ok ? res.json() : null))
                .then((data) => {
                    if (data?.language && (data.language === "en" || data.language === "fr" || data.language === "rw")) {
                        setLanguageState(data.language);
                        localStorage.setItem("bryden_language", data.language);
                    }
                })
                .catch(() => {});
        }
    }, []);

    const setLanguage = (newLang: LanguageCode) => {
        setLanguageState(newLang);
        localStorage.setItem("bryden_language", newLang);
        document.documentElement.lang = newLang;
    };

    const t = (key: keyof Translations): string => {
        return dictionaries[language]?.[key] || dictionaries.en[key] || "";
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
