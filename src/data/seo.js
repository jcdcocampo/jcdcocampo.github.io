// Per-page <head> metadata. Used at runtime by useSeo() and at build time by scripts/postbuild.mjs
// (so crawlers and link-preview bots that don't run JS still see the right tags for every page).
export const SITE = 'https://jcdcocampo.github.io';

export const SEO = {
  "/": {
    "title": "Engr. Jose Carlo David Ocampo",
    "metas": [
      {
        "name": "description",
        "content": "Personal portfolio of Engr. Jose Carlo David Ocampo — Licensed Electronics Engineer in the Philippines. IoT, AI, and networking researcher."
      },
      {
        "name": "author",
        "content": "Jose Carlo David Ocampo"
      },
      {
        "name": "robots",
        "content": "index, follow"
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://jcdcocampo.github.io/"
      },
      {
        "property": "og:title",
        "content": "Engr. Jose Carlo David Ocampo"
      },
      {
        "property": "og:description",
        "content": "Licensed Electronics Engineer in the Philippines."
      },
      {
        "property": "og:image",
        "content": "https://jcdcocampo.github.io/assets/og-image.jpg"
      },
      {
        "property": "og:image:width",
        "content": "1200"
      },
      {
        "property": "og:image:height",
        "content": "630"
      },
      {
        "name": "twitter:card",
        "content": "summary_large_image"
      },
      {
        "name": "twitter:title",
        "content": "Engr. Jose Carlo David Ocampo"
      },
      {
        "name": "twitter:description",
        "content": "Licensed Electronics Engineer in the Philippines. IoT, AI, and networking researcher."
      },
      {
        "name": "twitter:image",
        "content": "https://jcdcocampo.github.io/assets/og-image.jpg"
      }
    ],
    "jsonLd": {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Jose Carlo David Ocampo",
      "alternateName": "JC",
      "honorificPrefix": "Engr.",
      "url": "https://jcdcocampo.github.io/",
      "image": "https://jcdcocampo.github.io/assets/profile-light.jpg",
      "jobTitle": "Application & Cloud Support Associate",
      "worksFor": {
        "@type": "Organization",
        "name": "Accenture, Inc."
      },
      "alumniOf": {
        "@type": "CollegeOrUniversity",
        "name": "Mapúa University"
      },
      "hasCredential": [
        {
          "@type": "EducationalOccupationalCredential",
          "credentialCategory": "license",
          "name": "Electronics Engineer License",
          "recognizedBy": {
            "@type": "Organization",
            "name": "Philippine Professional Regulation Commission"
          }
        },
        {
          "@type": "EducationalOccupationalCredential",
          "credentialCategory": "license",
          "name": "Electronics Technician License",
          "recognizedBy": {
            "@type": "Organization",
            "name": "Philippine Professional Regulation Commission"
          }
        }
      ],
      "memberOf": {
        "@type": "Organization",
        "name": "Institute of Electronics Engineers of the Philippines (IECEP)"
      },
      "email": "mailto:jcdcocampo@gmail.com",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Metro Manila",
        "addressCountry": "PH"
      },
      "sameAs": [
        "https://www.linkedin.com/in/jcdcocampo",
        "https://github.com/jcdcocampo"
      ]
    }
  },
  "/experience": {
    "title": "Experience — Engr. Jose Carlo David Ocampo",
    "metas": [
      {
        "name": "description",
        "content": "Work experience of Engr. Jose Carlo David Ocampo — Licensed Electronics Engineer in the Philippines."
      },
      {
        "name": "author",
        "content": "Jose Carlo David Ocampo"
      },
      {
        "name": "robots",
        "content": "index, follow"
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://jcdcocampo.github.io/experience"
      },
      {
        "property": "og:title",
        "content": "Experience — Engr. Jose Carlo David Ocampo"
      },
      {
        "property": "og:description",
        "content": "Licensed Electronics Engineer in the Philippines."
      },
      {
        "property": "og:image",
        "content": "https://jcdcocampo.github.io/assets/og-image.jpg"
      },
      {
        "name": "twitter:card",
        "content": "summary_large_image"
      },
      {
        "name": "twitter:title",
        "content": "Experience — Engr. Jose Carlo David Ocampo"
      },
      {
        "name": "twitter:description",
        "content": "Licensed Electronics Engineer in the Philippines."
      },
      {
        "name": "twitter:image",
        "content": "https://jcdcocampo.github.io/assets/og-image.jpg"
      }
    ]
  },
  "/projects": {
    "title": "Projects — Engr. Jose Carlo David Ocampo",
    "metas": [
      {
        "name": "description",
        "content": "Projects by Engr. Jose Carlo David Ocampo — IEEE-published banana shelf life research, EEG exoskeleton, stair-climbing robot, Cardinal One energy-efficient vehicle, and more."
      },
      {
        "name": "author",
        "content": "Jose Carlo David Ocampo"
      },
      {
        "name": "robots",
        "content": "index, follow"
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://jcdcocampo.github.io/projects"
      },
      {
        "property": "og:title",
        "content": "Projects — Engr. Jose Carlo David Ocampo"
      },
      {
        "property": "og:description",
        "content": "IEEE-published research, EEG brain-computer interface exoskeleton, stair-climbing robot, Cardinal One energy-efficient vehicle, and more."
      },
      {
        "property": "og:image",
        "content": "https://jcdcocampo.github.io/assets/og-image.jpg"
      },
      {
        "name": "twitter:card",
        "content": "summary_large_image"
      },
      {
        "name": "twitter:title",
        "content": "Projects — Engr. Jose Carlo David Ocampo"
      },
      {
        "name": "twitter:description",
        "content": "IEEE-published research, EEG brain-computer interface exoskeleton, stair-climbing robot, Cardinal One energy-efficient vehicle, and more."
      },
      {
        "name": "twitter:image",
        "content": "https://jcdcocampo.github.io/assets/og-image.jpg"
      }
    ]
  },
  "/certifications": {
    "title": "Certifications and Licenses — Engr. Jose Carlo David Ocampo",
    "metas": [
      {
        "name": "description",
        "content": "Certifications and licenses of Engr. Jose Carlo David Ocampo — Electronics Engineer License (PRC), CCNA, Google Cloud, and more."
      },
      {
        "name": "author",
        "content": "Jose Carlo David Ocampo"
      },
      {
        "name": "robots",
        "content": "index, follow"
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://jcdcocampo.github.io/certifications"
      },
      {
        "property": "og:title",
        "content": "Certifications and Licenses — Engr. Jose Carlo David Ocampo"
      },
      {
        "property": "og:description",
        "content": "Electronics Engineer License (PRC), CCNA, Google Cloud, and more."
      },
      {
        "property": "og:image",
        "content": "https://jcdcocampo.github.io/assets/og-image.jpg"
      },
      {
        "name": "twitter:card",
        "content": "summary_large_image"
      },
      {
        "name": "twitter:title",
        "content": "Certifications and Licenses — Engr. Jose Carlo David Ocampo"
      },
      {
        "name": "twitter:description",
        "content": "Electronics Engineer License (PRC), CCNA, Google Cloud, and more."
      },
      {
        "name": "twitter:image",
        "content": "https://jcdcocampo.github.io/assets/og-image.jpg"
      }
    ]
  },
  "/mian": {
    "title": "Mian: An Intelligent Portfolio Assistant — Engr. Jose Carlo David Ocampo",
    "metas": [
      {
        "name": "description",
        "content": "Mian is an AI portfolio assistant built by JC Ocampo — designed to help visitors learn about his background through natural conversation."
      },
      {
        "name": "author",
        "content": "Jose Carlo David Ocampo"
      },
      {
        "name": "robots",
        "content": "index, follow"
      },
      {
        "property": "og:type",
        "content": "article"
      },
      {
        "property": "og:url",
        "content": "https://jcdcocampo.github.io/mian"
      },
      {
        "property": "og:title",
        "content": "Mian: An Intelligent Portfolio Assistant"
      },
      {
        "property": "og:description",
        "content": "An AI assistant built to greet visitors and answer questions about JC's background, projects, and experience through natural conversation."
      },
      {
        "property": "og:image",
        "content": "https://jcdcocampo.github.io/assets/projects/mian-hero.jpg"
      },
      {
        "name": "twitter:card",
        "content": "summary_large_image"
      },
      {
        "name": "twitter:title",
        "content": "Mian: An Intelligent Portfolio Assistant"
      },
      {
        "name": "twitter:description",
        "content": "An AI assistant built to greet visitors and answer questions about JC's background, projects, and experience through natural conversation."
      },
      {
        "name": "twitter:image",
        "content": "https://jcdcocampo.github.io/assets/projects/mian-hero.jpg"
      }
    ]
  },
  "/bushop-project": {
    "title": "BusHop: Live Bus Tracking and Trip Planning for Victory Liner Routes | Engr. Jose Carlo David Ocampo",
    "metas": [
      {
        "name": "description",
        "content": "BusHop is a capstone project from Accenture's Digital Core Elite Bootcamp: a web application that shows where Victory Liner buses are, when the next one arrives, what the fare costs, and exactly where a commuter can board."
      },
      {
        "name": "author",
        "content": "Jose Carlo David Ocampo"
      },
      {
        "name": "robots",
        "content": "index, follow"
      },
      {
        "property": "og:type",
        "content": "article"
      },
      {
        "property": "og:url",
        "content": "https://jcdcocampo.github.io/bushop-project"
      },
      {
        "property": "og:title",
        "content": "BusHop: Live Bus Tracking and Trip Planning for Victory Liner Routes"
      },
      {
        "property": "og:description",
        "content": "A capstone project from Accenture's Digital Core Elite Bootcamp: live bus tracking, fares and boarding points for Victory Liner routes across Central and Northern Luzon."
      },
      {
        "property": "og:image",
        "content": "https://jcdcocampo.github.io/assets/projects/bushop-hero.jpg"
      },
      {
        "name": "twitter:card",
        "content": "summary_large_image"
      },
      {
        "name": "twitter:title",
        "content": "BusHop: Live Bus Tracking and Trip Planning for Victory Liner Routes"
      },
      {
        "name": "twitter:description",
        "content": "A capstone project from Accenture's Digital Core Elite Bootcamp: live bus tracking, fares and boarding points for Victory Liner routes across Central and Northern Luzon."
      },
      {
        "name": "twitter:image",
        "content": "https://jcdcocampo.github.io/assets/projects/bushop-hero.jpg"
      }
    ]
  },
  "/banana-shelflife": {
    "title": "Feedforward Neural Network for Real-time Prediction of Lakatan Banana Shelf Life — Engr. Jose Carlo David Ocampo",
    "metas": [
      {
        "name": "description",
        "content": "IEEE-published research: an IoT and machine learning system that predicts Lakatan banana shelf life in real time using sensor data from transport conditions."
      },
      {
        "name": "author",
        "content": "Jose Carlo David Ocampo"
      },
      {
        "name": "robots",
        "content": "index, follow"
      },
      {
        "property": "og:type",
        "content": "article"
      },
      {
        "property": "og:url",
        "content": "https://jcdcocampo.github.io/banana-shelflife"
      },
      {
        "property": "og:title",
        "content": "Feedforward Neural Network for Real-time Prediction of Lakatan Banana Shelf Life"
      },
      {
        "property": "og:description",
        "content": "IEEE-published research using IoT sensors and a neural network to predict banana shelf life during transport in real time."
      },
      {
        "property": "og:image",
        "content": "https://jcdcocampo.github.io/assets/projects/banana-shelflife-hero.jpg"
      },
      {
        "name": "twitter:card",
        "content": "summary_large_image"
      },
      {
        "name": "twitter:title",
        "content": "Feedforward Neural Network for Real-time Prediction of Lakatan Banana Shelf Life"
      },
      {
        "name": "twitter:description",
        "content": "IEEE-published research using IoT sensors and a neural network to predict banana shelf life during transport in real time."
      },
      {
        "name": "twitter:image",
        "content": "https://jcdcocampo.github.io/assets/projects/banana-shelflife-hero.jpg"
      }
    ]
  },
  "/aguila": {
    "title": "Aguila: Design and Development of an Energy-Efficient Vehicle for Shell Eco-marathon | Engr. Jose Carlo David Ocampo",
    "metas": [
      {
        "name": "description",
        "content": "Aguila is Mapua University Cardinal One's entry to Shell Eco-marathon Asia Pacific and the Middle East, an energy-efficient prototype vehicle developed by a team of engineers, with JC serving as Electronics Engineer and Media Manager."
      },
      {
        "name": "author",
        "content": "Jose Carlo David Ocampo"
      },
      {
        "name": "robots",
        "content": "index, follow"
      },
      {
        "property": "og:type",
        "content": "article"
      },
      {
        "property": "og:url",
        "content": "https://jcdcocampo.github.io/aguila"
      },
      {
        "property": "og:title",
        "content": "Aguila: Design and Development of an Energy-Efficient Vehicle for Shell Eco-marathon"
      },
      {
        "property": "og:description",
        "content": "Mapua University Cardinal One's entry to Shell Eco-marathon Asia Pacific and the Middle East, from internal combustion to battery electric."
      },
      {
        "property": "og:image",
        "content": "https://jcdcocampo.github.io/assets/projects/aguila-hero.jpg"
      },
      {
        "name": "twitter:card",
        "content": "summary_large_image"
      },
      {
        "name": "twitter:title",
        "content": "Aguila: Design and Development of an Energy-Efficient Vehicle for Shell Eco-marathon"
      },
      {
        "name": "twitter:description",
        "content": "Mapua University Cardinal One's entry to Shell Eco-marathon Asia Pacific and the Middle East, from internal combustion to battery electric."
      },
      {
        "name": "twitter:image",
        "content": "https://jcdcocampo.github.io/assets/projects/aguila-hero.jpg"
      }
    ]
  },
  "/eeg-exoskeleton": {
    "title": "EEG Headset-controlled Lower Body Cybernetic Exoskeleton — Engr. Jose Carlo David Ocampo",
    "metas": [
      {
        "name": "description",
        "content": "A brain-computer interface exoskeleton built by junior high school students — controlled by thought via an EEG headset, designed as an accessible rehabilitation device."
      },
      {
        "name": "author",
        "content": "Jose Carlo David Ocampo"
      },
      {
        "name": "robots",
        "content": "index, follow"
      },
      {
        "property": "og:type",
        "content": "article"
      },
      {
        "property": "og:url",
        "content": "https://jcdcocampo.github.io/eeg-exoskeleton"
      },
      {
        "property": "og:title",
        "content": "EEG Headset-controlled Lower Body Cybernetic Exoskeleton"
      },
      {
        "property": "og:description",
        "content": "A brain-computer interface exoskeleton controlled by thought via an EEG headset, designed as an accessible rehabilitation device for physical therapy."
      },
      {
        "property": "og:image",
        "content": "https://jcdcocampo.github.io/assets/projects/eeg-exoskeleton-hero.jpg"
      },
      {
        "name": "twitter:card",
        "content": "summary_large_image"
      },
      {
        "name": "twitter:title",
        "content": "EEG Headset-controlled Lower Body Cybernetic Exoskeleton"
      },
      {
        "name": "twitter:description",
        "content": "A brain-computer interface exoskeleton controlled by thought via an EEG headset, designed as an accessible rehabilitation device for physical therapy."
      },
      {
        "name": "twitter:image",
        "content": "https://jcdcocampo.github.io/assets/projects/eeg-exoskeleton-hero.jpg"
      }
    ]
  },
  "/privacy": {
    "title": "Privacy Policy — Engr. Jose Carlo David Ocampo",
    "metas": [
      {
        "name": "description",
        "content": "Privacy Policy for the personal website of Engr. Jose Carlo David Ocampo, including how the Mian AI chatbot handles your messages."
      },
      {
        "name": "author",
        "content": "Jose Carlo David Ocampo"
      },
      {
        "name": "robots",
        "content": "noindex, follow"
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://jcdcocampo.github.io/privacy"
      },
      {
        "property": "og:title",
        "content": "Privacy Policy — Engr. Jose Carlo David Ocampo"
      },
      {
        "property": "og:description",
        "content": "Privacy Policy for the personal website of Engr. Jose Carlo David Ocampo."
      },
      {
        "property": "og:image",
        "content": "https://jcdcocampo.github.io/assets/og-image.jpg"
      }
    ]
  },
  "/terms": {
    "title": "Terms and Conditions — Engr. Jose Carlo David Ocampo",
    "metas": [
      {
        "name": "description",
        "content": "Terms and Conditions for the personal website of Engr. Jose Carlo David Ocampo, including usage rules for the Mian AI chatbot."
      },
      {
        "name": "author",
        "content": "Jose Carlo David Ocampo"
      },
      {
        "name": "robots",
        "content": "noindex, follow"
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://jcdcocampo.github.io/terms"
      },
      {
        "property": "og:title",
        "content": "Terms and Conditions — Engr. Jose Carlo David Ocampo"
      },
      {
        "property": "og:description",
        "content": "Terms and Conditions for the personal website of Engr. Jose Carlo David Ocampo."
      },
      {
        "property": "og:image",
        "content": "https://jcdcocampo.github.io/assets/og-image.jpg"
      }
    ]
  },
  "/404": {
    "title": "Error 404 — Engr. Jose Carlo David Ocampo",
    "metas": [
      {
        "name": "description",
        "content": "Page not found. Jump the cacti and make your way back."
      },
      {
        "name": "robots",
        "content": "noindex, follow"
      }
    ]
  }
};
