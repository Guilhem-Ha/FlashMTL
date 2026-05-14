const en = {
  dateLocale: 'en-CA',

  tabs: {
    trips: 'Trips',
    myTrips: 'My trips',
    profil: 'Profile',
  },

  profil_lang: {
    label: 'Language',
  },

  common: {
    cancel: 'Cancel',
    error: 'Error',
    next: 'Next',
    skip: 'Skip',
    signIn: 'Log in',
    createAccount: 'Create an account',
    createStudentAccount: 'Create a student account',
    proposeTrip: '+  Offer a trip',
    leave: 'Leave',
    reservedFor: 'For students of Montréal universities only',
  },

  transport: {
    tagline: 'Student carpooling • Montréal',
    emptyTitle: 'No trips yet',
    emptyText: 'Be the first to organize a carpool!',
    alertLoginTitle: 'Sign in required',
    alertLoginBody: 'Sign in to join a trip.',
    alertLeaveTitle: 'Leave this trip?',
    alertLeaveBody: "You'll free up your seat to %{destination}.",
    alertLeaveConfirm: 'Leave',
    alertJoinError: 'Unable to join this trip.',
    alertLeaveError: 'Unable to leave this trip.',
    alertJoinSuccessTitle: "🎉 You're in!",
    alertJoinSuccessBody: 'Seat reserved for %{destination}.',
  },

  mesTrips: {
    header: 'My trips',
    guestTitle: 'Your trips here',
    guestText: 'Sign in to see the carpools you have organized or joined.',
    guestNote: 'For students of Montréal universities only',
    emptyTitle: 'No trips yet',
    emptyText: 'Join a carpool in the Trips tab, or offer your own.',
    sectionOrganized: '📋 Organized by you',
    sectionJoined: '🎒 Joined trips',
    badgeOrganizer: 'Organizer',
    places: {
      one: '1 seat free',
      other: '%{count} seats free',
    },
    pricePerPerson: '$%{price} / person',
    tripTypes: {
      aller_simple: 'One way',
      aller_retour: 'Round trip',
      recurrent: 'Recurring',
    },
  },

  profil: {
    header: 'My Profile',
    guestTitle: 'Join Junto',
    guestText:
      'Sign in with your university email to access student carpooling.',
    guestNote:
      'For students of Montréal universities (UdeM, McGill, Concordia, UQAM…)',
    verified: 'Verified student',
    campus: 'Campus',
    notifications: 'Push notifications',
    notificationsOn: 'Enabled',
    notificationsEnable: 'Enable →',
    notificationsBlockedTitle: 'Notifications blocked',
    notificationsBlockedBody:
      'Enable notifications in your phone settings for Junto.',
    signOut: 'Log out',
    signOutTitle: 'Log out',
    signOutBody: 'You will be signed out of Junto.',
  },

  auth: {
    tagline: 'Student carpooling · Montréal',
    login: {
      title: 'Log in',
      subtitle: 'Sign in with your university email',
      emailLabel: 'University email',
      emailPlaceholder: 'firstname.lastname@mcgill.ca',
      passwordLabel: 'Password',
      submit: 'Log in',
      footerText: 'No account yet? ',
      footerLink: 'Create one',
      errorCredentials: 'Incorrect email or password.',
      errorFields: 'Please fill in all fields.',
    },
    signup: {
      title: 'Create an account',
      subtitle: 'University email required',
      prenomLabel: 'First name',
      prenomPlaceholder: 'Your first name',
      emailLabel: 'University email',
      emailPlaceholder: 'firstname.lastname@mcgill.ca',
      emailHint:
        'Accepted domains: umontreal, mcgill, concordia, polymtl, hec, uqam, etsmtl',
      campusLabel: 'Campus',
      passwordLabel: 'Password',
      passwordPlaceholder: 'At least 8 characters',
      confirmLabel: 'Confirm password',
      submit: 'Create my account',
      footerText: 'Already have an account? ',
      footerLink: 'Log in',
      successTitle: 'Check your inbox!',
      successBody:
        'A confirmation link was sent to\n%{email}\n\nClick the link to activate your account.',
      successCta: 'Go to login',
      errorPrenom: 'Enter your first name.',
      errorEmail: 'Enter your email.',
      errorEmailInvalid:
        'Use a Montréal university email (e.g. @mcgill.ca).',
      errorPasswordShort: 'Password must be at least 8 characters.',
      errorPasswordMatch: "Passwords don't match.",
      errorCampus: 'Select your campus.',
      errorAlreadyUsed: 'This email is already in use. Log in instead.',
    },
  },

  onboarding: {
    tagline: 'Student carpooling · Montréal',
    slide1: {
      pickupLabel: 'Pickup point',
      pickupValue: 'Métro Berri-UQAM',
      seatsText: '2 seats free',
      cta: "I'm in →",
      sub: 'Offer or join a carpool in seconds.',
    },
    slide2: {
      title: 'Trusted network',
      subtitle: 'Exclusive to students of Montréal universities',
      trust0: 'Verified via university email',
      trust1: 'Verified student profile for every member',
      trust2: 'Peer-to-peer reputation system',
    },
    slide3: {
      title: 'Share the cost',
      subtitle: "Set your price, coordinate the pickup, Junto handles the rest.",
      stat0Value: '$0',
      stat0Label: 'commission',
      stat1Value: '< 1 min',
      stat1Label: 'to offer a ride',
      stat2Value: '∞',
      stat2Label: 'destinations',
      routesTitle: 'POPULAR ROUTES',
      route0: 'Montréal → Québec City',
      route1: 'Montréal → Mont-Tremblant',
      route2: 'Montréal → Ottawa',
    },
    skip: 'Skip',
    next: 'Next',
    start: "Let's go!",
  },

  tripCard: {
    pickupLabel: 'Pickup point',
    ownerLabel: '✦ Your carpool',
    joinedLabel: '✓ Joined  ·  Leave',
    ctaJoin: "I'm in →",
    ctaFull: 'Full',
    ctaLoading: '…',
    priceLabel: '/ person',
    priceAmount: '$%{price}',
    seats: {
      one: '1 seat free',
      other: '%{count} seats free',
    },
    seatsFull: 'Full',
    typeLabels: {
      aller_simple: 'One way',
      aller_retour: 'Round trip',
      recurrent: 'Recurring',
    },
  },
} as const

export default en
