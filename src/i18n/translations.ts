export type Language = "en" | "he";

export const translations = {
  en: {
    // Header
    nav: {
      services: "Services",
      education: "Education",
      therapy: "Therapy",
      families: "Families",
      organisations: "Organisations",
      supervision: "Supervision",
      bookConsultation: "Book a Consultation",
    },

    // Landing page
    landing: {
      title: "A quiet space to make sense of behaviour — and what's underneath it.",
      subtitle: "Blueprint is a constructional practice for individuals, families, schools and organisations. We start with what's happened, not what's wrong — and we build from there, together.",
      exploreServices: "Find your way in",
      logIn: "Log In",
      signUp: "Sign Up",
      quote: "We do not remove behaviour. We build capability — slowly, attentively, and in your own time.",
      quoteAuthor: "Adam Dayan, MSc",
    },

    // Services page
    services: {
      tagline: "Ways we work together",
      title: "Five gentle paths into the work",
      subtitle: "Each pathway is shaped around the person in front of us — never one-size-fits-all. Choose the doorway that feels closest, and we'll meet you there.",
      approachTagline: "How we hold the work",
      approachTitle: "Constructional, not corrective",
      approachText: "We don't try to suppress, control, or eliminate behaviour. Instead, we sit with the question of what behaviour is doing — and patiently help build the skills, language, and conditions for something kinder to grow in its place. The pace is yours.",
      approachPoints: [
        "Build capability, gently — never strip behaviour away",
        "Behaviour is communication, asking to be understood",
        "Hold the whole system in mind, not just the person",
        "Ethical, evidence-led, and culturally attuned",
      ],
      credentialsTagline: "Grounded & accountable",
      credentialsTitle: "Held by science. Led with care.",
      credentials: [
        "UKBA (Cert) Registered",
        "15+ Years' Experience",
        "Senior Leadership Team Member",
        "MSc Applied Behaviour Analysis",
        "MEd Psychology of Education (candidate)",
        "UK-SBA & ACBS Member",
      ],
      ctaTitle: "Begin with a conversation",
      ctaText: "Whether you're a parent, a school, an organisation, or another practitioner — start with a quiet phone call. No commitment, no pressure. Just a chance to be heard and to think together.",
      ctaButton: "Reach out",
      quoteText: "What behaviour is asking for, more often than not, is to be understood — not removed.",
      quoteAuthor: "Adam Dayan, MSc",
      quoteRole: "UKBA (Cert) · Clinical Behaviour Analyst & Consultant",
      cards: {
        education: { title: "In Schools", description: "Building a behavioural culture that's clear, dignified, and humane — from policy down to the everyday." },
        therapy: { title: "Therapy & 1:1 Work", description: "Understanding what behaviour is for. ACT-informed, person-centred, and unhurried." },
        family: { title: "For Families", description: "A steadying hand for families holding complexity. Practical, personalised, and never blaming." },
        organisations: { title: "For Organisations", description: "Behavioural science applied with care to teams, governance, and the cultures we build at work." },
        supervision: { title: "Supervision & Mentoring", description: "Companionship for thoughtful practitioners — reflective, rigorous, and quietly held." },
      },
      learnMore: "Read on",
    },

    // Service page layout
    serviceLayout: {
      whatWeOffer: "Ways we can walk with you",
      packages: "Shapes this can take",
      packagesSubtitle: "Some people want a single conversation. Others want a slow, steady companion through complexity. None of these are fixed — every package is shaped around what you actually need.",
      idealFor: "Likely a fit if:",
      readyTitle: "When you're ready",
      readyText: "We don't try to take behaviour away. We try to build something kinder in its place. Begin with a conversation — there's no pressure to know what you need yet.",
    },

    // Offer detail page
    offerPage: {
      overview: "Overview",
      keyPoints: "Key Points",
      whoIsThisFor: "Who Is This For?",
      outcomes: "Expected Outcomes",
      ctaTitle: "Interested in This Service?",
      ctaText: "Get in touch to discuss how this service can support you.",
    },

    // Education page
    education: {
      title: "Holding behaviour with dignity, in schools",
      subtitle: "Schools & education settings",
      tagline: "A whole-school culture where children are understood before they're managed. We help leaders build systems that are humane, consistent, and quietly transformative.",
      ctaText: "Start a school conversation",
      services: [
        { name: "Whole-School PBS Framework Design", slug: "whole-school-pbs" },
        { name: "Behaviour Policy Development", slug: "behaviour-policy" },
        { name: "Functional Behaviour Assessment (FBA)", slug: "fba" },
        { name: "Individual Behaviour Support Plans", slug: "individual-support-plans" },
        { name: "Risk Assessment & Management Plans", slug: "risk-assessment" },
        { name: "Staff Training & CPD", slug: "staff-training" },
        { name: "Data-Driven Decision Systems", slug: "data-driven-decisions" },
        { name: "Multi-Disciplinary Collaboration", slug: "multi-disciplinary" },
        { name: "Behaviour Strategy for SLT", slug: "behaviour-strategy-slt" },
        { name: "Behaviour Culture Change Projects", slug: "culture-change" },
      ],
      packages: [
        {
          name: "Starter School Package",
          description: "An initial assessment to understand your school's behavioural landscape and identify priorities.",
          includes: ["Behavioural audit", "Staff consultation", "Priority report with recommendations"],
          ideal: "Schools exploring PBS for the first time",
        },
        {
          name: "Assessment & Strategic Roadmap",
          description: "Deep-dive assessment with a structured implementation roadmap aligned to your school's values.",
          includes: ["Comprehensive FBAs", "Staff survey & analysis", "Strategic roadmap document", "SLT briefing"],
          ideal: "Schools ready to commit to cultural change",
        },
        {
          name: "Full PBS Implementation",
          description: "End-to-end design and delivery of a whole-school PBS framework with ongoing support.",
          includes: ["Framework design", "Policy development", "Staff training programme", "Data systems", "Termly reviews"],
          ideal: "Schools seeking transformational, sustained change",
        },
        {
          name: "Ongoing Behaviour Leadership Partnership",
          description: "Retained advisory support for your leadership team with regular consultation and supervision.",
          includes: ["Monthly SLT consultations", "Case supervision", "Training updates", "Data review sessions"],
          ideal: "Schools maintaining and evolving their PBS culture",
        },
      ],
    },

    // Therapy page
    therapy: {
      title: "What's happened to you, not what's wrong with you",
      subtitle: "Therapy & 1:1 work",
      tagline: "Slow, contextual, and quietly attentive. ACT-informed therapy that helps you build a life shaped around what matters — without forcing the difficult parts away.",
      ctaText: "Begin with a conversation",
      services: [
        { name: "ACT-Informed Therapy", slug: "act-therapy" },
        { name: "Constructional Behavioural Intervention", slug: "constructional-intervention" },
        { name: "Emotional Regulation Support", slug: "emotional-regulation" },
        { name: "Parent Coaching", slug: "parent-coaching" },
        { name: "Functional Communication Training", slug: "functional-communication" },
        { name: "Anxiety & Avoidance Patterns", slug: "anxiety-avoidance" },
        { name: "Values-Based Behaviour Building", slug: "values-based" },
        { name: "Trauma-Informed Behaviour Planning", slug: "trauma-informed" },
      ],
      packages: [
        {
          name: "Initial Behavioural Assessment",
          description: "A comprehensive assessment to understand the individual's context, needs, and strengths.",
          includes: ["Clinical interview", "Functional assessment", "Contextual analysis", "Written formulation & recommendations"],
          ideal: "Individuals or families seeking clarity before intervention",
        },
        {
          name: "Short-Term Focused Intervention",
          description: "A structured 8–12 week programme targeting specific behavioural goals.",
          includes: ["Weekly sessions", "Collaborative goal setting", "Skill building activities", "Progress reviews"],
          ideal: "Specific, focused concerns with clear goals",
        },
        {
          name: "Extended Therapeutic Partnership",
          description: "Longer-term support for complex or multi-layered needs.",
          includes: ["Flexible session schedule", "Ongoing formulation", "Multi-system coordination", "Regular outcome reviews"],
          ideal: "Complex presentations requiring sustained, adaptive support",
        },
        {
          name: "Parent Guidance Package",
          description: "Empowering parents with practical strategies grounded in behavioural science.",
          includes: ["Parent coaching sessions", "Contextual analysis at home", "Strategy development", "Follow-up support"],
          ideal: "Parents seeking evidence-based guidance and confidence",
        },
      ],
    },

    // Families page
    families: {
      title: "A steady hand for families holding a lot",
      subtitle: "For families",
      tagline: "Practical, personal, and free of blame. We help families find their footing again — building consistency, language, and confidence at home.",
      ctaText: "Reach out, gently",
      services: [
        { name: "Behavioural Assessment at Home", slug: "home-assessment" },
        { name: "Parent Strategy Coaching", slug: "parent-strategy" },
        { name: "Sibling Dynamics Support", slug: "sibling-dynamics" },
        { name: "Consistency Planning", slug: "consistency-planning" },
        { name: "Home-School Alignment", slug: "home-school-alignment" },
        { name: "Crisis Planning & De-Escalation Strategies", slug: "crisis-planning" },
      ],
      packages: [
        {
          name: "Clarity Session",
          description: "A single in-depth session to explore concerns, identify priorities, and map next steps.",
          includes: ["90-minute consultation", "Contextual discussion", "Written summary with next steps"],
          ideal: "Families wanting clarity before committing to a programme",
        },
        {
          name: "Home Behaviour Blueprint",
          description: "A structured assessment resulting in a tailored behaviour support plan for the home environment.",
          includes: ["Home observation", "Family interview", "Written behaviour plan", "Strategy coaching session"],
          ideal: "Families ready for a structured plan at home",
        },
        {
          name: "Family Support Programme",
          description: "A 6–10 week programme with regular coaching, strategy implementation, and progress reviews.",
          includes: ["Weekly coaching sessions", "Strategy development", "Home-school coordination", "Progress tracking"],
          ideal: "Families navigating ongoing or complex needs",
        },
        {
          name: "Ongoing Behaviour Coaching",
          description: "Retained support with flexible scheduling for families with evolving needs.",
          includes: ["Fortnightly sessions", "Responsive crisis support", "Plan adjustments", "Review meetings"],
          ideal: "Families seeking sustained, adaptive guidance",
        },
      ],
    },

    // Organisations page
    organisations: {
      title: "Building cultures where behaviour makes sense",
      subtitle: "Organisations & leadership",
      tagline: "Behavioural science, applied with care. We help leadership teams shape cultures, governance, and ways of working that are humane and built to last.",
      ctaText: "Start an organisational conversation",
      services: [
        { name: "Organisational Behaviour Management (OBM)", slug: "obm" },
        { name: "Behaviour Strategy Design", slug: "behaviour-strategy" },
        { name: "Culture Change Projects", slug: "culture-change" },
        { name: "Staff Performance Systems", slug: "staff-performance" },
        { name: "Risk Governance Frameworks", slug: "risk-governance" },
        { name: "Clinical Governance Structures", slug: "clinical-governance" },
        { name: "Safeguarding & Behaviour Audits", slug: "safeguarding-audits" },
        { name: "Behaviour Data Systems", slug: "behaviour-data" },
      ],
      packages: [
        {
          name: "Behaviour Systems Audit",
          description: "A thorough audit of your current behavioural systems, policies, and practices.",
          includes: ["Document review", "Staff interviews", "Observational assessment", "Audit report with recommendations"],
          ideal: "Organisations seeking an independent behavioural review",
        },
        {
          name: "Strategic Implementation Partnership",
          description: "A collaborative programme to design and implement behaviour-led systems across your organisation.",
          includes: ["Strategy co-design", "Policy development", "Staff training", "Implementation support", "Quarterly reviews"],
          ideal: "Organisations committing to systemic behavioural change",
        },
        {
          name: "Clinical Supervision Framework",
          description: "Design and embed a clinical supervision framework for your practitioner team.",
          includes: ["Framework design", "Supervisor training", "Documentation templates", "Quality assurance system"],
          ideal: "Care providers and clinical services",
        },
        {
          name: "Training & Accreditation Pathways",
          description: "Bespoke training programmes aligned to your organisation's needs and professional standards.",
          includes: ["Training needs analysis", "Programme design", "Delivery & assessment", "Accreditation guidance"],
          ideal: "Organisations investing in workforce development",
        },
      ],
    },

    // Supervision page
    supervision: {
      title: "Companionship for thoughtful practitioners",
      subtitle: "Supervision & mentoring",
      tagline: "Reflective, rigorous, and quietly held. A space for behaviour analysts and practitioners to think out loud, grow with integrity, and stay close to their values.",
      ctaText: "Enquire about supervision",
      services: [
        { name: "UKBA Supervision", slug: "ukba-supervision" },
        { name: "Case Formulation Supervision", slug: "case-formulation" },
        { name: "Constructional Approach Mentoring", slug: "constructional-mentoring" },
        { name: "ACT Integration Support", slug: "act-integration" },
        { name: "Ethical Consultation", slug: "ethical-consultation" },
        { name: "Practitioner Development Pathways", slug: "practitioner-development" },
        { name: "Reflective Practice Groups", slug: "reflective-practice" },
      ],
      packages: [
        {
          name: "Foundational Supervision",
          description: "Structured supervision for developing practitioners building core competencies.",
          includes: ["Monthly supervision sessions", "Case discussion", "Competency tracking", "Written feedback"],
          ideal: "Early-career practitioners and trainees",
        },
        {
          name: "Advanced Clinical Supervision",
          description: "In-depth clinical supervision for experienced practitioners managing complex caseloads.",
          includes: ["Fortnightly sessions", "Complex case formulation", "Ethical decision-making support", "Professional development planning"],
          ideal: "Experienced practitioners seeking clinical depth",
        },
        {
          name: "Leadership Supervision",
          description: "Supervision for clinical leaders managing teams and organisational behaviour strategy.",
          includes: ["Strategic supervision sessions", "Leadership reflection", "Team dynamics consultation", "Governance guidance"],
          ideal: "Clinical leads and service managers",
        },
        {
          name: "Group Supervision Circles",
          description: "Facilitated group supervision for peer learning and reflective practice.",
          includes: ["Monthly group sessions", "Structured reflection framework", "Peer case discussion", "Facilitated learning"],
          ideal: "Teams and peer groups seeking shared professional growth",
        },
      ],
    },

    // Contact page
    contact: {
      tagline: "A quiet doorway in",
      title: "Begin with a conversation",
      subtitle: "Tell us a little about what's bringing you here. We'll write back within 48 hours — gently, and without pressure. Sometimes a single conversation is enough.",
      location: "Manchester, UK",
      nameLabel: "Your name",
      namePlaceholder: "What shall we call you?",
      emailLabel: "Email",
      emailPlaceholder: "you@example.com",
      interestedLabel: "What's drawing you in?",
      selectService: "Choose a doorway",
      serviceOptions: ["In Schools", "Therapy & 1:1 Work", "For Families", "For Organisations", "Supervision & Mentoring", "Something else"],
      messageLabel: "Anything you'd like us to know",
      messagePlaceholder: "There's no need to have it all figured out — a few sentences is enough...",
      sendButton: "Send",
      sending: "Sending...",
      successTitle: "Received, with care",
      successDescription: "We'll be in touch shortly.",
    },

    // Login page
    login: {
      title: "Log In",
      subtitle: "Welcome back to Blueprint",
      emailLabel: "Email",
      passwordLabel: "Password",
      button: "Log In",
      loading: "Logging in…",
      noAccount: "Don't have an account?",
      signUpLink: "Sign Up",
      google: "Continue with Google",
      or: "or",
    },

    // Signup page
    signup: {
      title: "Sign Up",
      subtitle: "Create your Blueprint account",
      nameLabel: "Full Name",
      emailLabel: "Email",
      passwordLabel: "Password",
      button: "Sign Up",
      loading: "Creating account…",
      hasAccount: "Already have an account?",
      logInLink: "Log In",
      successTitle: "Check your email",
      successDescription: "We've sent you a confirmation link.",
      google: "Continue with Google",
    },

    // Footer
    footer: {
      description: "Constructional Behaviour Services. Building capability and well-being through collaborative, ethical, and evidence-based practice.\n\n\nWe do not remove behaviour. We build capability.",
      servicesTitle: "Services",
      contactTitle: "Contact",
      copyright: "Blueprint Clinical Behaviour Services. All rights reserved.",
      links: {
        education: "PBS in Education",
        therapy: "Therapy",
        families: "Family Support",
        organisations: "Organisations",
        supervision: "Supervision",
        bookConsultation: "Book a Consultation",
      },
    },

    // Offer detail content
    offerDetails: {
      education: [
        {
          slug: "whole-school-pbs",
          title: "Whole-School PBS Framework Design",
          summary: "A comprehensive, values-driven framework that transforms school-wide behaviour culture from the ground up.",
          description: [
            "Positive Behaviour Support (PBS) at a whole-school level is about creating an environment where every pupil and staff member understands the shared expectations, values, and systems that guide behaviour. It's not about control — it's about building a culture of clarity and dignity.",
            "We work alongside your senior leadership team to design a bespoke PBS framework that reflects your school's identity, addresses your unique challenges, and creates sustainable systems for recognising and supporting positive behaviour.",
            "This process includes environmental audits, stakeholder consultation, tiered support design, and the creation of clear documentation that can guide practice across every classroom and corridor."
          ],
          keyPoints: [
            "Grounded in constructional behaviour analysis",
            "Designed with your school's values at the centre",
            "Covers universal, targeted, and intensive tiers",
            "Includes visual systems and environmental design",
            "Built for sustainability — not quick fixes"
          ],
          whoIsThisFor: [
            "Schools looking to replace punitive behaviour systems",
            "Schools in special measures or requiring improvement",
            "New schools establishing their behaviour culture",
            "Schools merging or undergoing significant change",
            "Senior leaders seeking a coherent behaviour vision"
          ],
          outcomes: [
            "A comprehensive PBS framework document",
            "Clear tiered support structure",
            "Aligned staff understanding and expectations",
            "Reduced exclusions and behavioural incidents",
            "Improved pupil wellbeing and engagement"
          ]
        },
        {
          slug: "behaviour-policy",
          title: "Behaviour Policy Development",
          summary: "Evidence-based behaviour policies that are practical, fair, and grounded in your school's values.",
          description: [
            "A strong behaviour policy doesn't sit in a drawer — it lives in every interaction, every corridor, and every classroom. We help schools develop behaviour policies that are clear, fair, and reflective of the principles they want to uphold.",
            "Our approach begins with understanding your current policy landscape and the lived experience of staff, pupils, and families. From there, we co-design a policy that is not only Ofsted-aligned but genuinely useful in everyday practice.",
            "Every policy we create includes guidance for implementation, staff training recommendations, and review cycles to ensure it evolves with your school."
          ],
          keyPoints: [
            "Rooted in ethical, constructional principles",
            "Co-designed with school leadership",
            "Practical and accessible language",
            "Aligned to statutory guidance",
            "Includes implementation support"
          ],
          whoIsThisFor: [
            "Schools reviewing or rewriting their behaviour policy",
            "Schools seeking Ofsted-ready documentation",
            "New headteachers establishing their vision",
            "MATs seeking consistency across schools"
          ],
          outcomes: [
            "A clear, values-driven behaviour policy",
            "Staff confidence in consistent application",
            "Improved parent and community understanding",
            "A framework for policy review and evolution"
          ]
        },
        {
          slug: "fba",
          title: "Functional Behaviour Assessment (FBA)",
          summary: "Understanding the function and context of behaviour to design interventions that actually work.",
          description: [
            "Functional Behaviour Assessment is the cornerstone of effective behavioural support. Rather than labelling behaviour as 'good' or 'bad', FBA seeks to understand why a behaviour occurs — what purpose it serves for the individual in their specific context.",
            "We conduct thorough FBAs using direct observation, structured interviews, and data collection to develop a clear picture of the environmental and contextual factors maintaining behaviour. This forms the foundation for intervention design.",
            "Our FBAs go beyond simple ABC charts. We consider setting events, motivational operations, skill deficits, and systemic factors that influence behaviour over time."
          ],
          keyPoints: [
            "Evidence-based assessment methodology",
            "Considers broad contextual factors",
            "Identifies function, not just form, of behaviour",
            "Directly informs intervention planning",
            "Respectful, non-blaming approach"
          ],
          whoIsThisFor: [
            "Schools supporting pupils with complex behaviour",
            "SENCOs seeking clarity on individual cases",
            "Families wanting to understand their child's behaviour",
            "Multi-agency teams requiring shared formulations"
          ],
          outcomes: [
            "A clear functional behaviour assessment report",
            "Understanding of behavioural function and context",
            "Targeted intervention recommendations",
            "A shared understanding across stakeholders"
          ]
        },
        {
          slug: "individual-support-plans",
          title: "Individual Behaviour Support Plans",
          summary: "Personalised behaviour support plans that build capability and promote dignity.",
          description: [
            "Every individual deserves support that is tailored to their unique strengths, needs, and context. Our behaviour support plans are built on thorough assessment and designed to be practical, respectful, and effective.",
            "We create plans that focus on skill building, environmental adjustments, and proactive strategies rather than reactive consequences. Each plan includes clear guidance for implementation and measurable outcomes.",
            "Plans are developed collaboratively with the individual (where appropriate), their family, and the professionals who support them daily."
          ],
          keyPoints: [
            "Person-centred and strengths-based",
            "Includes proactive and reactive strategies",
            "Measurable goals and review points",
            "Practical for daily implementation",
            "Collaborative development process"
          ],
          whoIsThisFor: [
            "Pupils with SEND and behavioural needs",
            "Individuals in residential or care settings",
            "Children and young people at risk of exclusion",
            "Families seeking structured support strategies"
          ],
          outcomes: [
            "A comprehensive, personalised behaviour support plan",
            "Clear strategies for all key settings",
            "Measurable behavioural goals",
            "Improved quality of life and engagement"
          ]
        },
        {
          slug: "risk-assessment",
          title: "Risk Assessment & Management Plans",
          summary: "Proportionate, dynamic risk assessments that prioritise safety and dignity.",
          description: [
            "Effective risk assessment balances safety with the individual's right to dignity, inclusion, and positive experience. We create dynamic risk assessments that are responsive to changing contexts and grounded in behavioural understanding.",
            "Our risk management plans include clear escalation procedures, de-escalation strategies, and environmental adjustments. They are designed to be practical tools — not bureaucratic documents that sit unused.",
            "We work closely with teams to ensure risk assessments are understood, implemented consistently, and reviewed regularly."
          ],
          keyPoints: [
            "Proportionate and rights-respecting",
            "Dynamic and regularly reviewed",
            "Includes de-escalation protocols",
            "Practical for frontline staff",
            "Legally and ethically sound"
          ],
          whoIsThisFor: [
            "Schools managing complex risk profiles",
            "Residential and care settings",
            "Services supporting individuals with challenging behaviour",
            "Teams requiring updated risk documentation"
          ],
          outcomes: [
            "Clear, proportionate risk assessment documentation",
            "Staff confidence in managing risk situations",
            "Reduced reliance on restrictive practices",
            "Safer environments for all"
          ]
        },
        {
          slug: "staff-training",
          title: "Staff Training & CPD",
          summary: "Practical, engaging professional development that transforms how staff understand and respond to behaviour.",
          description: [
            "Training is most effective when it changes how people think, not just what they do. Our CPD programmes are designed to equip staff with both the understanding and the practical skills to support behaviour constructionally.",
            "We offer bespoke training packages covering topics from PBS fundamentals to advanced FBA, from trauma-informed practice to de-escalation techniques. Every session is interactive, evidence-based, and tailored to your setting.",
            "We don't do death-by-PowerPoint. Our training uses real scenarios, collaborative exercises, and reflective discussions to embed lasting change."
          ],
          keyPoints: [
            "Interactive and evidence-based",
            "Tailored to your setting and needs",
            "Covers theory and practical application",
            "Supports ongoing professional development",
            "Can be delivered as single sessions or programmes"
          ],
          whoIsThisFor: [
            "Teaching and support staff at all levels",
            "Senior leadership teams",
            "NQTs and early-career teachers",
            "Multi-disciplinary teams",
            "Residential and care staff"
          ],
          outcomes: [
            "Increased staff confidence and competence",
            "Shared language and understanding of behaviour",
            "Practical strategies for immediate use",
            "CPD documentation and certificates"
          ]
        },
        {
          slug: "data-driven-decisions",
          title: "Data-Driven Decision Systems",
          summary: "Harnessing behavioural data to inform decisions, track outcomes, and demonstrate impact.",
          description: [
            "Good data drives good decisions. We help schools design and implement systems for collecting, analysing, and using behavioural data to guide strategy, allocate resources, and measure the impact of interventions.",
            "From choosing the right recording systems to building dashboards that make data accessible and meaningful, we support every step of the data journey. Our approach ensures that data serves people — not the other way around.",
            "We also support schools in using data for accountability, reporting to governors, and evidencing impact to Ofsted and other stakeholders."
          ],
          keyPoints: [
            "Practical data collection systems",
            "Meaningful analysis and reporting",
            "Supports strategic decision-making",
            "Evidence for accountability and reporting",
            "Accessible to non-specialists"
          ],
          whoIsThisFor: [
            "Schools wanting to use data more effectively",
            "Behaviour leads and SENCOs",
            "Senior leaders seeking evidence of impact",
            "Schools preparing for inspection"
          ],
          outcomes: [
            "A functioning behavioural data system",
            "Regular data reports and analysis",
            "Evidence-informed decision-making",
            "Demonstrable impact of behaviour strategies"
          ]
        },
        {
          slug: "multi-disciplinary",
          title: "Multi-Disciplinary Collaboration",
          summary: "Facilitating effective collaboration between professionals to deliver joined-up support.",
          description: [
            "Complex behaviour rarely has a single cause or a single solution. Effective support requires collaboration between educators, therapists, families, and external agencies — all working towards shared goals.",
            "We facilitate multi-disciplinary collaboration by providing a common behavioural framework, shared assessment tools, and structured processes for communication and joint planning.",
            "Whether you're coordinating an EHCP review, a TAC meeting, or a complex case conference, we can support the process with behavioural expertise and facilitation skills."
          ],
          keyPoints: [
            "Shared assessment and formulation frameworks",
            "Facilitated multi-agency meetings",
            "Common language across disciplines",
            "Coordinated intervention planning",
            "Focus on the individual at the centre"
          ],
          whoIsThisFor: [
            "Schools working with external agencies",
            "Multi-agency teams around a child or young person",
            "SENCOs coordinating complex support",
            "Local authorities and commissioning bodies"
          ],
          outcomes: [
            "Improved multi-agency communication",
            "Coordinated, coherent support plans",
            "Reduced duplication and contradiction",
            "Better outcomes for individuals and families"
          ]
        },
        {
          slug: "behaviour-strategy-slt",
          title: "Behaviour Strategy for SLT",
          summary: "Strategic behavioural leadership support for senior leadership teams driving whole-school change.",
          description: [
            "Senior leaders set the tone for behaviour culture. We provide strategic advisory support to help SLTs develop and implement a coherent behavioural vision that permeates every aspect of school life.",
            "This includes strategic planning sessions, governance briefings, data interpretation support, and ongoing consultation to ensure behaviour strategy remains aligned with school improvement priorities.",
            "We help leaders move beyond reactive crisis management to proactive, system-level thinking about behaviour."
          ],
          keyPoints: [
            "Strategic-level consultation",
            "Aligned to school improvement plans",
            "Governance and accountability support",
            "Data interpretation and reporting",
            "Proactive, not reactive, approach"
          ],
          whoIsThisFor: [
            "Headteachers and deputy headteachers",
            "SLT members responsible for behaviour",
            "Governing bodies seeking strategic oversight",
            "MAT leaders driving cross-school consistency"
          ],
          outcomes: [
            "A clear behavioural strategy aligned to school vision",
            "Confident, informed leadership on behaviour",
            "Effective governance reporting",
            "Sustained cultural improvement"
          ]
        },
        {
          slug: "culture-change",
          title: "Behaviour Culture Change Projects",
          summary: "Transformational projects that shift school culture from punitive to constructional, sustainably.",
          description: [
            "Culture change is the most ambitious and impactful work a school can undertake. It requires vision, commitment, and expert guidance to shift deeply embedded norms and practices.",
            "Our culture change projects are designed as multi-phase partnerships. We begin with an in-depth cultural audit, develop a shared vision with stakeholders, and guide implementation over terms and academic years.",
            "This is not about quick fixes. It's about building a school community where every interaction reflects the values of respect, dignity, and growth."
          ],
          keyPoints: [
            "Multi-phase, sustained partnership",
            "Begins with cultural audit and visioning",
            "Involves all stakeholders",
            "Measurable milestones and outcomes",
            "Supported by ongoing consultation"
          ],
          whoIsThisFor: [
            "Schools in crisis or requiring improvement",
            "Schools seeking transformational change",
            "New leadership teams establishing their vision",
            "MATs seeking to unify behaviour culture"
          ],
          outcomes: [
            "A transformed behaviour culture",
            "Reduced exclusions and incidents",
            "Improved staff wellbeing and retention",
            "A sustainable framework for ongoing development"
          ]
        }
      ],
      therapy: [
        {
          slug: "act-therapy",
          title: "ACT-Informed Therapy",
          summary: "Acceptance and Commitment Therapy that builds psychological flexibility and values-driven living.",
          description: [
            "ACT (Acceptance and Commitment Therapy) is a modern, evidence-based therapeutic approach that helps individuals develop psychological flexibility — the ability to be present, open to experience, and engaged in values-driven action.",
            "Rather than trying to eliminate difficult thoughts and feelings, ACT teaches skills for relating differently to internal experiences while taking committed action towards what matters most.",
            "Our ACT-informed approach is integrated with constructional behavioural principles, creating a uniquely powerful combination that addresses both the internal experience and the environmental context."
          ],
          keyPoints: [
            "Builds psychological flexibility",
            "Values-driven, not symptom-focused",
            "Strong evidence base across populations",
            "Integrated with behavioural principles",
            "Practical skills for everyday use"
          ],
          whoIsThisFor: [
            "Individuals experiencing anxiety or depression",
            "People struggling with avoidance patterns",
            "Those seeking greater meaning and direction",
            "Parents managing stress and overwhelm",
            "Professionals experiencing burnout"
          ],
          outcomes: [
            "Increased psychological flexibility",
            "Clearer connection to personal values",
            "Reduced impact of difficult thoughts and feelings",
            "Greater engagement in meaningful activities"
          ]
        },
        {
          slug: "constructional-intervention",
          title: "Constructional Behavioural Intervention",
          summary: "Building new skills and repertoires rather than suppressing existing behaviour.",
          description: [
            "Constructional intervention is the philosophical heart of our practice. Instead of asking 'how do we stop this behaviour?', we ask 'what skills does this person need to thrive?'",
            "This approach focuses on identifying and building the capabilities, skills, and environmental supports that make adaptive behaviour more likely. It respects the individual's autonomy and works with their existing strengths.",
            "Every intervention is designed to expand the person's repertoire — giving them more options, more skills, and more pathways to success."
          ],
          keyPoints: [
            "Builds capability rather than suppressing behaviour",
            "Respects individual autonomy and dignity",
            "Focuses on skill acquisition and environmental design",
            "Grounded in Applied Behaviour Analysis",
            "Ethical and evidence-based"
          ],
          whoIsThisFor: [
            "Individuals with learning disabilities",
            "Children and young people with SEND",
            "Anyone whose behaviour is seen as 'challenging'",
            "Families seeking a positive, non-punitive approach"
          ],
          outcomes: [
            "Expanded behavioural repertoire",
            "New functional skills",
            "Reduced need for restrictive practices",
            "Improved quality of life"
          ]
        },
        {
          slug: "emotional-regulation",
          title: "Emotional Regulation Support",
          summary: "Developing skills for understanding, managing, and expressing emotions effectively.",
          description: [
            "Emotional regulation is the ability to manage and respond to emotional experiences in adaptive ways. Difficulties with regulation can manifest as intense outbursts, withdrawal, anxiety, or rigid behaviour patterns.",
            "We take a contextual approach to emotional regulation, understanding that regulation happens within relationships and environments — not just within the individual. Our support combines skill teaching with environmental adjustments.",
            "We work with individuals and their support systems to develop personalised regulation strategies that are practical, accessible, and respectful of the person's experience."
          ],
          keyPoints: [
            "Contextual understanding of regulation",
            "Practical, teachable strategies",
            "Works with the whole support system",
            "Developmentally appropriate approaches",
            "Combines behavioural and therapeutic methods"
          ],
          whoIsThisFor: [
            "Children and young people with emotional difficulties",
            "Individuals with autism or ADHD",
            "People experiencing heightened anxiety",
            "Families wanting to support regulation at home"
          ],
          outcomes: [
            "Improved emotional awareness and vocabulary",
            "Practical regulation strategies",
            "Reduced intensity and frequency of dysregulation",
            "Greater participation in daily activities"
          ]
        },
        {
          slug: "parent-coaching",
          title: "Parent Coaching",
          summary: "Empowering parents with understanding, confidence, and practical behavioural strategies.",
          description: [
            "Parents are the most important people in their child's life — and the most powerful agents of change. Our parent coaching is designed to equip you with the understanding and strategies to support your child's behaviour effectively.",
            "We don't prescribe rigid programmes. Instead, we work collaboratively to understand your child's behaviour in context, identify what's working, and develop strategies that fit your family's values and routines.",
            "Coaching sessions are practical, supportive, and free from judgement. We believe every parent is doing their best, and our role is to help you feel more confident and effective."
          ],
          keyPoints: [
            "Collaborative and non-judgemental",
            "Tailored to your family's needs",
            "Evidence-based strategies",
            "Focuses on understanding, then action",
            "Ongoing support and adjustment"
          ],
          whoIsThisFor: [
            "Parents of children with behavioural needs",
            "Families navigating SEND diagnoses",
            "Parents feeling overwhelmed or uncertain",
            "Families wanting to build positive routines"
          ],
          outcomes: [
            "Increased parental confidence",
            "Practical strategies for home use",
            "Improved parent-child relationship",
            "Greater family harmony"
          ]
        },
        {
          slug: "functional-communication",
          title: "Functional Communication Training",
          summary: "Teaching communication skills that replace challenging behaviour with effective expression.",
          description: [
            "Many behaviours described as 'challenging' are, in fact, communication. When someone lacks the skills to express their needs, wants, or feelings verbally, they use the tools available to them — which may include behaviours that others find difficult.",
            "Functional Communication Training (FCT) identifies the communicative function of behaviour and teaches alternative, more effective ways to express the same message. It's one of the most well-evidenced interventions in behaviour analysis.",
            "We design FCT programmes that are practical, sustainable, and appropriate to the individual's developmental level and communication modality."
          ],
          keyPoints: [
            "Addresses the function of behaviour",
            "Teaches alternative communication skills",
            "Strong evidence base",
            "Appropriate across communication modalities",
            "Practical for everyday implementation"
          ],
          whoIsThisFor: [
            "Non-verbal or pre-verbal individuals",
            "Individuals with autism spectrum conditions",
            "People with learning disabilities",
            "Anyone whose behaviour serves a communicative function"
          ],
          outcomes: [
            "Effective alternative communication skills",
            "Reduction in challenging behaviour",
            "Improved social interaction",
            "Greater autonomy and self-expression"
          ]
        },
        {
          slug: "anxiety-avoidance",
          title: "Anxiety & Avoidance Patterns",
          summary: "Understanding and addressing anxiety-driven avoidance through contextual behavioural approaches.",
          description: [
            "Anxiety and avoidance often work together in a cycle that narrows a person's world. The more we avoid, the more our world shrinks — and the more anxiety grows. Breaking this cycle requires understanding, not force.",
            "Our approach combines ACT-informed methods with behavioural analysis to understand the specific contexts that trigger anxiety and the avoidance patterns that maintain it. We then build graduated, values-driven approaches to re-engagement.",
            "This is not about 'facing your fears' through sheer willpower. It's about building the skills and supports that make re-engagement possible and meaningful."
          ],
          keyPoints: [
            "Contextual understanding of anxiety",
            "Values-driven exposure and engagement",
            "ACT-informed psychological flexibility",
            "Graduated and compassionate approach",
            "Addresses both behaviour and experience"
          ],
          whoIsThisFor: [
            "Individuals with anxiety-driven school refusal",
            "People with specific phobias or generalised anxiety",
            "Those whose anxiety limits daily participation",
            "Families supporting an anxious child"
          ],
          outcomes: [
            "Increased engagement in avoided activities",
            "Practical anxiety management skills",
            "Greater psychological flexibility",
            "Expanded participation in valued activities"
          ]
        },
        {
          slug: "values-based",
          title: "Values-Based Behaviour Building",
          summary: "Helping individuals identify what matters and build behaviours aligned with their values.",
          description: [
            "When behaviour change is connected to what someone truly cares about, it becomes meaningful and sustainable. Values-based behaviour building starts with exploring what matters most and then creating pathways to live in alignment with those values.",
            "This approach moves beyond compliance and control, instead empowering individuals to make choices that reflect their authentic selves. It's applicable across age groups and settings.",
            "We use a combination of values exploration, committed action planning, and skill building to support individuals in living more fully aligned with what they care about."
          ],
          keyPoints: [
            "Grounded in personal values exploration",
            "Promotes autonomy and self-direction",
            "Applicable across age groups",
            "Integrates with ACT and behavioural approaches",
            "Focuses on meaningful, sustainable change"
          ],
          whoIsThisFor: [
            "Young people seeking direction and purpose",
            "Individuals feeling disconnected or stuck",
            "People in transition or facing life changes",
            "Anyone wanting to live more intentionally"
          ],
          outcomes: [
            "Clarity about personal values",
            "Increased values-aligned behaviour",
            "Greater sense of purpose and meaning",
            "Improved wellbeing and satisfaction"
          ]
        },
        {
          slug: "trauma-informed",
          title: "Trauma-Informed Behaviour Planning",
          summary: "Behaviour support that recognises and responds to the impact of trauma with sensitivity and skill.",
          description: [
            "Trauma can profoundly affect how individuals perceive, interpret, and respond to their environment. Behaviour that appears 'challenging' may be a survival response shaped by adverse experiences.",
            "Our trauma-informed approach ensures that behaviour planning always considers the potential impact of trauma, avoids re-traumatisation, and prioritises safety, trust, and empowerment.",
            "We integrate trauma-informed principles with constructional behaviour analysis to create support plans that are both compassionate and effective."
          ],
          keyPoints: [
            "Recognises trauma's impact on behaviour",
            "Prioritises safety and trust",
            "Avoids re-traumatisation",
            "Integrates with constructional approaches",
            "Empowers individuals in their own support"
          ],
          whoIsThisFor: [
            "Individuals with known or suspected trauma histories",
            "Children in care or with care experience",
            "Schools and settings supporting trauma-affected pupils",
            "Teams wanting to embed trauma-informed practice"
          ],
          outcomes: [
            "Behaviour plans that are trauma-sensitive",
            "Reduced risk of re-traumatisation",
            "Improved trust and therapeutic relationship",
            "More effective and sustainable support"
          ]
        }
      ],
      families: [
        {
          slug: "home-assessment",
          title: "Behavioural Assessment at Home",
          summary: "In-depth assessment in your home environment to understand behaviour in its natural context.",
          description: [
            "Behaviour doesn't happen in a vacuum — it happens within the rich, complex context of home life. A home-based assessment allows us to observe behaviour in the environment where it naturally occurs, giving us the most accurate understanding of what's happening and why.",
            "During a home assessment, we observe routines, interactions, environmental factors, and the broader family context. We combine observation with structured interviews to build a comprehensive picture.",
            "The outcome is a clear, practical formulation that explains behaviour in context and provides the foundation for effective, family-friendly support strategies."
          ],
          keyPoints: [
            "Assessment in the natural environment",
            "Observes real routines and interactions",
            "Combines observation and interview",
            "Non-judgemental and supportive",
            "Directly informs support strategies"
          ],
          whoIsThisFor: [
            "Families experiencing behavioural difficulties at home",
            "Parents seeking clarity about their child's needs",
            "Families preparing for professional assessments",
            "Multi-agency teams needing home context"
          ],
          outcomes: [
            "Clear understanding of behaviour in context",
            "Practical, actionable recommendations",
            "Foundation for a home behaviour support plan",
            "Shared understanding across the family"
          ]
        },
        {
          slug: "parent-strategy",
          title: "Parent Strategy Coaching",
          summary: "Targeted coaching to help parents develop and implement effective behavioural strategies at home.",
          description: [
            "Parent strategy coaching goes beyond general advice. We work with you to develop specific, practical strategies tailored to your child's needs and your family's context.",
            "Each coaching session focuses on understanding a particular challenge, developing a strategy, practising implementation, and reviewing progress. It's hands-on, practical, and responsive to your evolving needs.",
            "We believe parents are experts on their own children. Our role is to bring behavioural science knowledge and help you apply it in ways that work for your family."
          ],
          keyPoints: [
            "Specific, practical strategy development",
            "Collaborative and empowering",
            "Responsive to your family's needs",
            "Evidence-based approaches",
            "Ongoing review and adjustment"
          ],
          whoIsThisFor: [
            "Parents wanting practical strategies for specific behaviours",
            "Families who have had assessments but need implementation support",
            "Parents of children with SEND",
            "Any parent seeking confidence in managing behaviour"
          ],
          outcomes: [
            "A repertoire of practical strategies",
            "Increased parental confidence",
            "Improved child behaviour at home",
            "Stronger parent-child relationships"
          ]
        },
        {
          slug: "sibling-dynamics",
          title: "Sibling Dynamics Support",
          summary: "Supporting families to navigate the complex dynamics between siblings, especially where one child has additional needs.",
          description: [
            "When one child in a family has significant behavioural needs, sibling relationships can become strained. Brothers and sisters may feel overlooked, confused, or resentful — and these dynamics can amplify behavioural difficulties across the family.",
            "We help families understand and address sibling dynamics with sensitivity and practical strategies. This includes supporting siblings to understand their brother or sister's needs, addressing jealousy or frustration, and creating family routines that work for everyone.",
            "Our approach is family-centred, recognising that the wellbeing of each family member matters."
          ],
          keyPoints: [
            "Addresses the whole family system",
            "Supports siblings' emotional needs",
            "Practical strategies for family routines",
            "Reduces conflict and resentment",
            "Promotes positive sibling relationships"
          ],
          whoIsThisFor: [
            "Families where one child has SEND or behavioural needs",
            "Families experiencing sibling conflict",
            "Parents concerned about the impact on other children",
            "Families wanting to strengthen sibling bonds"
          ],
          outcomes: [
            "Improved sibling relationships",
            "Reduced family conflict",
            "Better understanding across the family",
            "Practical routines that work for everyone"
          ]
        },
        {
          slug: "consistency-planning",
          title: "Consistency Planning",
          summary: "Creating consistent, predictable routines and responses that support positive behaviour.",
          description: [
            "Consistency is one of the most powerful tools in behaviour support — and one of the hardest to maintain. When adults respond predictably and routines are clear, children feel safer and more able to engage positively.",
            "We help families develop consistency plans that cover daily routines, behavioural expectations, consequences, and communication between caregivers. We also address common barriers to consistency — tiredness, disagreements, and changing circumstances.",
            "A good consistency plan isn't rigid. It's a flexible framework that provides structure while accommodating the realities of family life."
          ],
          keyPoints: [
            "Clear, practical routines and expectations",
            "Aligned responses across caregivers",
            "Flexible and realistic for family life",
            "Addresses common barriers to consistency",
            "Regular review and adjustment"
          ],
          whoIsThisFor: [
            "Families struggling with inconsistent responses",
            "Separated families needing alignment",
            "Families with multiple caregivers",
            "Parents wanting structure without rigidity"
          ],
          outcomes: [
            "Clear, shared expectations at home",
            "Aligned adult responses to behaviour",
            "Reduced confusion and conflict",
            "More predictable, calmer home environment"
          ]
        },
        {
          slug: "home-school-alignment",
          title: "Home-School Alignment",
          summary: "Bridging the gap between home and school to create consistent support across settings.",
          description: [
            "Children move between home and school every day — and when the expectations, language, and strategies differ significantly between settings, it can create confusion and stress.",
            "We work with families and schools together to align approaches, share information effectively, and create consistency across the child's day. This might involve attending meetings, facilitating communication systems, or co-designing shared strategies.",
            "Effective home-school alignment means the child experiences coherent support wherever they are."
          ],
          keyPoints: [
            "Bridges home and school approaches",
            "Facilitates effective communication",
            "Creates shared strategies and language",
            "Supports collaborative relationships",
            "Puts the child at the centre"
          ],
          whoIsThisFor: [
            "Families feeling disconnected from their child's school",
            "Schools seeking better family engagement",
            "Children experiencing inconsistency across settings",
            "Multi-agency teams needing coherent support"
          ],
          outcomes: [
            "Aligned approaches across home and school",
            "Improved communication and trust",
            "More consistent experience for the child",
            "Stronger home-school partnership"
          ]
        },
        {
          slug: "crisis-planning",
          title: "Crisis Planning & De-Escalation Strategies",
          summary: "Preparing families with clear, calm strategies for managing crisis situations safely.",
          description: [
            "Crises happen. When they do, having a clear plan can make the difference between escalation and resolution. Our crisis planning helps families prepare for difficult moments with confidence and clarity.",
            "We develop personalised crisis plans that include early warning signs, de-escalation strategies, safety considerations, and recovery protocols. Plans are practical, accessible, and designed to be used in the moment.",
            "De-escalation is a skill that can be learned. We teach specific techniques grounded in behavioural science and trauma-informed practice that help reduce intensity and restore safety."
          ],
          keyPoints: [
            "Personalised crisis planning",
            "Practical de-escalation techniques",
            "Includes early warning identification",
            "Safety-focused and trauma-informed",
            "Recovery and reflection protocols"
          ],
          whoIsThisFor: [
            "Families managing frequent or intense behavioural crises",
            "Parents feeling unsafe or overwhelmed during incidents",
            "Families with risk management plans in place",
            "Carers of individuals with complex needs"
          ],
          outcomes: [
            "A clear, personalised crisis plan",
            "Confidence in de-escalation techniques",
            "Reduced duration and intensity of crises",
            "Improved safety for the whole family"
          ]
        }
      ],
      organisations: [
        {
          slug: "obm",
          title: "Organisational Behaviour Management (OBM)",
          summary: "Applying the science of behaviour to improve organisational performance, culture, and wellbeing.",
          description: [
            "Organisational Behaviour Management (OBM) applies the principles of behaviour analysis to improve how organisations function. It's a data-driven, systems-level approach to creating environments where people perform at their best.",
            "We help organisations understand the behavioural drivers behind performance, engagement, and culture. By analysing antecedents, consequences, and systems, we identify the levers that create meaningful, sustainable change.",
            "OBM is not about controlling people. It's about designing systems and environments that support people to do their best work."
          ],
          keyPoints: [
            "Evidence-based approach to organisational performance",
            "Data-driven analysis and intervention",
            "Systems-level thinking",
            "Improves both performance and wellbeing",
            "Sustainable, not quick-fix"
          ],
          whoIsThisFor: [
            "Organisations seeking performance improvement",
            "Leadership teams wanting to understand workforce behaviour",
            "HR and people teams",
            "Services undergoing transformation"
          ],
          outcomes: [
            "Improved organisational performance metrics",
            "Better understanding of behavioural drivers",
            "Data-informed decision-making",
            "Sustainable cultural improvement"
          ]
        },
        {
          slug: "behaviour-strategy",
          title: "Behaviour Strategy Design",
          summary: "Co-designing organisational behaviour strategies that align with your mission and deliver measurable results.",
          description: [
            "A behaviour strategy gives your organisation a coherent, evidence-based approach to managing and supporting behaviour at every level. We co-design strategies that reflect your organisation's values, context, and objectives.",
            "Our process includes stakeholder consultation, environmental analysis, and strategy co-design workshops. The resulting strategy document provides clear guidance for policy, practice, training, and monitoring.",
            "A good strategy doesn't just sit on a shelf. We help you build implementation plans that bring it to life."
          ],
          keyPoints: [
            "Co-designed with your leadership team",
            "Reflects organisational values and context",
            "Covers policy, practice, training, and monitoring",
            "Includes implementation planning",
            "Measurable outcomes and review points"
          ],
          whoIsThisFor: [
            "Organisations lacking a coherent behaviour approach",
            "Services undergoing transformation or growth",
            "Leadership teams seeking strategic clarity",
            "MATs and large organisations needing consistency"
          ],
          outcomes: [
            "A comprehensive behaviour strategy document",
            "Clear implementation roadmap",
            "Aligned organisational approach to behaviour",
            "Measurable outcomes framework"
          ]
        },
        {
          slug: "culture-change",
          title: "Culture Change Projects",
          summary: "Sustained, evidence-based projects that shift organisational culture from reactive to constructional.",
          description: [
            "Organisational culture is the sum of thousands of daily interactions, decisions, and habits. Changing culture requires sustained effort, clear vision, and expert guidance.",
            "Our culture change projects are designed as long-term partnerships. We work alongside your leadership team to understand your current culture, define your aspirational culture, and build the bridge between the two.",
            "This involves staff engagement, training programmes, policy development, and ongoing consultation. We measure progress through culture indicators and regular reviews."
          ],
          keyPoints: [
            "Long-term, sustained partnership",
            "Evidence-based culture assessment",
            "Involves all levels of the organisation",
            "Measurable culture indicators",
            "Ongoing support and adaptation"
          ],
          whoIsThisFor: [
            "Organisations in crisis or facing regulatory pressure",
            "Services wanting to shift from punitive to constructional approaches",
            "Growing organisations building their culture from scratch",
            "Leadership teams committed to lasting change"
          ],
          outcomes: [
            "Measurable culture shift",
            "Improved staff satisfaction and retention",
            "Better outcomes for service users",
            "A sustainable framework for ongoing cultural development"
          ]
        },
        {
          slug: "staff-performance",
          title: "Staff Performance Systems",
          summary: "Designing systems that support, motivate, and develop staff performance through behavioural science.",
          description: [
            "Traditional performance management often relies on annual reviews and punitive measures. Behavioural science tells us there are far more effective ways to support and develop staff performance.",
            "We help organisations design performance systems that include clear expectations, regular feedback, meaningful recognition, and supportive accountability. These systems are designed to bring out the best in people.",
            "Our approach is based on the evidence: positive reinforcement, clear antecedent arrangements, and data-informed feedback are the most effective drivers of sustained performance."
          ],
          keyPoints: [
            "Based on behavioural science principles",
            "Positive reinforcement-focused",
            "Clear expectations and feedback systems",
            "Data-informed performance monitoring",
            "Supports development, not just compliance"
          ],
          whoIsThisFor: [
            "Organisations reviewing their performance management",
            "HR teams seeking evidence-based approaches",
            "Managers wanting to improve team performance",
            "Services struggling with staff engagement"
          ],
          outcomes: [
            "A modern, evidence-based performance system",
            "Improved staff engagement and motivation",
            "Clear feedback and recognition structures",
            "Better retention and development"
          ]
        },
        {
          slug: "risk-governance",
          title: "Risk Governance Frameworks",
          summary: "Building robust governance frameworks for managing behavioural risk across your organisation.",
          description: [
            "Effective risk governance ensures that behavioural risk is identified, assessed, managed, and monitored at every level of your organisation. It provides assurance to leadership, regulators, and stakeholders.",
            "We help organisations design risk governance frameworks that are proportionate, practical, and embedded in daily operations. This includes risk policies, assessment tools, reporting structures, and escalation procedures.",
            "Good risk governance is not about avoiding all risk — it's about managing risk intelligently while maintaining dignity and inclusion."
          ],
          keyPoints: [
            "Comprehensive governance structures",
            "Proportionate and practical",
            "Embedded in daily operations",
            "Meets regulatory requirements",
            "Balances safety with dignity and inclusion"
          ],
          whoIsThisFor: [
            "Services managing behavioural risk daily",
            "Organisations preparing for inspection or audit",
            "Leadership teams needing governance assurance",
            "Services supporting individuals with complex needs"
          ],
          outcomes: [
            "A robust risk governance framework",
            "Clear reporting and escalation structures",
            "Regulatory confidence",
            "Improved safety and quality"
          ]
        },
        {
          slug: "clinical-governance",
          title: "Clinical Governance Structures",
          summary: "Establishing clinical governance that ensures quality, safety, and ethical practice across your service.",
          description: [
            "Clinical governance is the framework through which organisations ensure the quality and safety of clinical practice. For behavioural services, this includes supervision structures, outcome monitoring, ethical review processes, and quality assurance.",
            "We help organisations design and implement clinical governance structures that are robust, practical, and supportive of professional development. Good governance protects both service users and practitioners.",
            "Our approach is informed by best practice in healthcare governance, adapted for behavioural and educational settings."
          ],
          keyPoints: [
            "Comprehensive clinical governance design",
            "Supervision and quality assurance structures",
            "Ethical review and decision-making processes",
            "Outcome monitoring and reporting",
            "Professional development integration"
          ],
          whoIsThisFor: [
            "Care providers and clinical services",
            "Organisations with practitioner teams",
            "Services establishing new governance structures",
            "Organisations reviewing existing governance"
          ],
          outcomes: [
            "A functioning clinical governance framework",
            "Clear supervision and quality structures",
            "Ethical practice assurance",
            "Improved clinical outcomes and accountability"
          ]
        },
        {
          slug: "safeguarding-audits",
          title: "Safeguarding & Behaviour Audits",
          summary: "Independent audits that assess the quality and safety of your behavioural practices and safeguarding systems.",
          description: [
            "Regular auditing is essential for maintaining quality and identifying areas for improvement. Our behavioural and safeguarding audits provide an independent, expert assessment of your current practices.",
            "We review documentation, observe practice, interview staff and stakeholders, and benchmark against best practice standards. The resulting audit report provides clear findings, priorities, and recommendations.",
            "Audits can be conducted as one-off assessments or as part of an ongoing quality assurance programme."
          ],
          keyPoints: [
            "Independent, expert assessment",
            "Covers documentation, practice, and systems",
            "Benchmarked against best practice",
            "Clear findings and recommendations",
            "Can be one-off or ongoing"
          ],
          whoIsThisFor: [
            "Organisations preparing for inspection",
            "Services wanting independent quality assurance",
            "Leadership teams seeking improvement priorities",
            "Organisations responding to safeguarding concerns"
          ],
          outcomes: [
            "Comprehensive audit report",
            "Clear priorities for improvement",
            "Evidence for regulatory compliance",
            "A baseline for ongoing quality monitoring"
          ]
        },
        {
          slug: "behaviour-data",
          title: "Behaviour Data Systems",
          summary: "Designing and implementing systems for collecting, analysing, and using behavioural data effectively.",
          description: [
            "Data is only valuable if it's collected well, analysed meaningfully, and used to drive decisions. We help organisations design and implement behavioural data systems that do all three.",
            "From incident recording to outcome tracking, from staff surveys to service user feedback, we help you build systems that capture what matters and present it in ways that inform action.",
            "We support the full data journey — system design, staff training, analysis protocols, and reporting structures."
          ],
          keyPoints: [
            "Practical, purpose-driven data systems",
            "Covers collection, analysis, and reporting",
            "Staff training in data use",
            "Supports evidence-based decision-making",
            "Customised to your organisation's needs"
          ],
          whoIsThisFor: [
            "Organisations wanting to improve data quality",
            "Services needing outcome evidence",
            "Leadership teams seeking data-informed decisions",
            "Quality assurance and governance teams"
          ],
          outcomes: [
            "A functioning behavioural data system",
            "Meaningful reports and analysis",
            "Staff confidence in data use",
            "Evidence-informed service improvement"
          ]
        }
      ],
      supervision: [
        {
          slug: "ukba-supervision",
          title: "UKBA Supervision",
          summary: "Structured supervision meeting UKBA requirements for registration and continuing professional development.",
          description: [
            "UKBA supervision is a requirement for practitioners seeking or maintaining registration with the UK Board of Applied Behaviour Analysts. Our supervision meets all UKBA standards and provides the structure and support needed for professional development.",
            "Supervision sessions cover casework discussion, ethical reasoning, professional development planning, and competency assessment. We provide regular written feedback and documentation to support your registration portfolio.",
            "Our approach to supervision is collaborative, reflective, and constructional — we build your capabilities as a practitioner, not just assess them."
          ],
          keyPoints: [
            "Meets UKBA supervision requirements",
            "Structured competency development",
            "Regular written feedback",
            "Supports registration portfolio",
            "Reflective and constructional approach"
          ],
          whoIsThisFor: [
            "Practitioners seeking UKBA registration",
            "Registered practitioners maintaining CPD",
            "Trainees on supervised practice pathways",
            "Professionals transitioning to behaviour analysis"
          ],
          outcomes: [
            "UKBA-compliant supervision documentation",
            "Progressive competency development",
            "Support for registration applications",
            "Professional growth and confidence"
          ]
        },
        {
          slug: "case-formulation",
          title: "Case Formulation Supervision",
          summary: "Deep-dive supervision focused on developing sophisticated case formulation skills.",
          description: [
            "Case formulation is the art and science of understanding an individual's behaviour within their full context. It goes beyond simple functional analysis to consider setting events, learning history, systemic factors, and motivational operations.",
            "In case formulation supervision, we work together to develop increasingly sophisticated formulations that lead to more effective, nuanced interventions. This is about developing your clinical thinking, not just solving individual cases.",
            "We use real case material (with appropriate consents) to practice formulation skills, test hypotheses, and refine approaches."
          ],
          keyPoints: [
            "Develops advanced formulation skills",
            "Uses real case material",
            "Considers broad contextual factors",
            "Improves clinical reasoning",
            "Directly enhances practice quality"
          ],
          whoIsThisFor: [
            "Practitioners wanting to deepen their formulation skills",
            "Behaviour analysts working with complex cases",
            "Clinicians transitioning to constructional approaches",
            "Supervisees seeking more than routine case review"
          ],
          outcomes: [
            "More sophisticated case formulations",
            "Improved intervention effectiveness",
            "Enhanced clinical reasoning skills",
            "Greater confidence with complex cases"
          ]
        },
        {
          slug: "constructional-mentoring",
          title: "Constructional Approach Mentoring",
          summary: "Dedicated mentoring for practitioners learning to apply constructional principles in their practice.",
          description: [
            "The constructional approach represents a paradigm shift in how we think about and respond to behaviour. Moving from eliminative to constructional thinking requires guidance, practice, and support.",
            "Our mentoring programme is designed for practitioners who want to embed constructional principles in their daily practice. We work through real cases, explore the philosophical foundations, and develop practical skills for implementation.",
            "Mentoring is more than supervision — it's a developmental partnership focused on transforming how you think about behaviour and intervention."
          ],
          keyPoints: [
            "Focused on constructional philosophy and practice",
            "Developmental partnership approach",
            "Real-case application",
            "Philosophical depth with practical skills",
            "Transforms practice orientation"
          ],
          whoIsThisFor: [
            "Practitioners new to constructional approaches",
            "Experienced analysts seeking philosophical development",
            "Teams transitioning from eliminative to constructional practice",
            "Anyone wanting to deepen their ethical practice"
          ],
          outcomes: [
            "Deep understanding of constructional principles",
            "Ability to apply constructional approaches in practice",
            "Transformed professional orientation",
            "Enhanced ethical practice"
          ]
        },
        {
          slug: "act-integration",
          title: "ACT Integration Support",
          summary: "Supporting practitioners to integrate Acceptance and Commitment Therapy into their behavioural practice.",
          description: [
            "ACT and Applied Behaviour Analysis share deep roots in behavioural science, but integrating them in practice requires skill and understanding. We support practitioners to bring ACT principles and processes into their existing practice.",
            "This includes understanding the ACT hexaflex, applying ACT processes in clinical work, and integrating ACT with functional analysis and constructional intervention design.",
            "Whether you're new to ACT or looking to deepen your integration, we provide structured support tailored to your development level."
          ],
          keyPoints: [
            "Bridges ACT and ABA practice",
            "Structured integration support",
            "Practical application focus",
            "Tailored to your development level",
            "Enhances therapeutic repertoire"
          ],
          whoIsThisFor: [
            "Behaviour analysts wanting to use ACT",
            "ACT practitioners wanting to strengthen behavioural foundations",
            "Clinicians seeking integrated approaches",
            "Practitioners wanting to add therapeutic depth"
          ],
          outcomes: [
            "Confident ACT integration in practice",
            "Expanded therapeutic repertoire",
            "Enhanced client outcomes",
            "Professional development in an emerging field"
          ]
        },
        {
          slug: "ethical-consultation",
          title: "Ethical Consultation",
          summary: "Expert consultation on ethical dilemmas, complex decisions, and values-aligned practice.",
          description: [
            "Ethical practice isn't always straightforward. Complex cases, competing demands, and systemic pressures can create genuine dilemmas that require careful, informed reasoning.",
            "Our ethical consultation service provides a confidential space to explore ethical dilemmas, test decision-making processes, and develop robust reasoning. We draw on professional codes, philosophical frameworks, and practical wisdom.",
            "We can support individual practitioners, teams, or organisations with ethical consultations on specific cases or broader practice issues."
          ],
          keyPoints: [
            "Confidential ethical reasoning support",
            "Drawing on professional codes and frameworks",
            "Individual or team consultation",
            "Supports complex decision-making",
            "Strengthens ethical practice culture"
          ],
          whoIsThisFor: [
            "Practitioners facing ethical dilemmas",
            "Teams managing complex, multi-stakeholder situations",
            "Organisations reviewing ethical practices",
            "Professionals wanting to strengthen their ethical reasoning"
          ],
          outcomes: [
            "Clear ethical reasoning for complex situations",
            "Improved decision-making confidence",
            "Strengthened professional integrity",
            "Documentation support for ethical decisions"
          ]
        },
        {
          slug: "practitioner-development",
          title: "Practitioner Development Pathways",
          summary: "Structured development programmes that guide practitioners from foundational skills to advanced practice.",
          description: [
            "Professional development in behaviour analysis is a journey. Our development pathways provide structured support at every stage — from foundational training through to advanced, specialist practice.",
            "We design individualised development plans that include supervision, training, mentoring, and experiential learning. Pathways are aligned to professional standards and your career aspirations.",
            "Whether you're just starting out or leading a team, we can design a development pathway that supports your growth."
          ],
          keyPoints: [
            "Structured, individualised development",
            "Aligned to professional standards",
            "Covers all career stages",
            "Combines supervision, training, and mentoring",
            "Supports career progression"
          ],
          whoIsThisFor: [
            "Early-career behaviour practitioners",
            "Mid-career professionals seeking advancement",
            "Organisations designing staff development programmes",
            "Teams wanting structured professional growth"
          ],
          outcomes: [
            "A personalised development plan",
            "Progressive skill and competency growth",
            "Career progression support",
            "Professional confidence and identity"
          ]
        },
        {
          slug: "reflective-practice",
          title: "Reflective Practice Groups",
          summary: "Facilitated group sessions that foster peer learning, reflection, and shared professional growth.",
          description: [
            "Reflective practice is essential for maintaining quality, preventing burnout, and continuing to grow as a professional. Our reflective practice groups provide a structured, facilitated space for peer learning and reflection.",
            "Groups follow a structured framework that includes case presentation, guided reflection, peer feedback, and action planning. The facilitation ensures safety, equity, and depth.",
            "Groups can be arranged for existing teams or cross-organisational cohorts. They run on a regular cycle to build trust, depth, and ongoing development."
          ],
          keyPoints: [
            "Structured facilitation framework",
            "Peer learning and support",
            "Regular, ongoing sessions",
            "Builds reflective capacity",
            "Prevents isolation and burnout"
          ],
          whoIsThisFor: [
            "Practitioner teams in behavioural services",
            "Isolated practitioners seeking peer connection",
            "Teams wanting structured reflection time",
            "Organisations investing in staff wellbeing"
          ],
          outcomes: [
            "Enhanced reflective practice skills",
            "Stronger peer support networks",
            "Improved practice quality",
            "Reduced professional isolation and burnout"
          ]
        }
      ]
    },

    // About page
    about: {
      tagline: "About Us",
      title: "Blueprint Clinical Behaviour Services",
      subtitle: "Constructional Behaviour Analysis for Education, Families, Therapy, and Organisations. Grounded in ethics. Driven by evidence. Built to last.",
      missionTitle: "Our Mission",
      missionText: "Blueprint's mission is to support individuals, families, schools, and organisations to build capability through constructional, ethical, and evidence-based behavioural practice. We aim to utilise our skills and passion for working with people to encourage and help them discover their motivation to achieve their highest potential.",
      specialisationsTitle: "Applications of Behaviour Analysis",
      specialisationsSubtitle: "The areas of behaviour analysis that Blueprint specialises in:",
      specialisations: [
        "PBS in Education (Whole-School & Individual)",
        "ACT-Informed Therapy & Intervention",
        "Family Support & Parent Coaching",
        "Organisational Behaviour Management (OBM)",
        "Supervision for Behaviour Practitioners",
      ],
      valuesTitle: "Our Values",
      values: [
        { title: "Constructional", description: "We build capability rather than suppress behaviour. Every intervention adds to a person's repertoire." },
        { title: "Ethical", description: "Dignity, consent, and respect are non-negotiable in everything we do." },
        { title: "Evidence-Based", description: "Our practice is grounded in the science of behaviour analysis and continuously evaluated." },
        { title: "Collaborative", description: "We work with people, not on them. Partnership is at the heart of lasting change." },
      ],
      teamTitle: "Meet the Team",
      teamSubtitle: "Dedicated professionals committed to building capability through behavioural science.",
      team: [
        { name: "Adam Dayan", role: "Director & Clinical Behaviour Analyst", bio: "MSc Applied Behaviour Analysis, UKBA (Cert). Over 15 years' experience in education, therapy, and organisational behaviour.", initials: "AD", slug: "adam-dayan" },
        { name: "Brionny Pearson", role: "Therapist & Educator", bio: "QTS-qualified teacher pursuing her Masters in ABA at Bangor University. An exceptional educator and therapist bridging classroom and clinical practice.", initials: "BP", slug: "brionny-pearson" },
      ],
      ctaTitle: "Let's Start a Conversation",
      ctaText: "Whether you're a school, family, organisation, or practitioner — we're here to help build capability.",
      ctaButton: "Book a Consultation",
    },

    // Portal translations
    portal: {
      portal: "Portal",
      logOut: "Log Out",
      welcome: "Welcome back",
      dashboardSubtitle: "Your client portal",
      booking: "Book a Session",
      messages: "Messages",
      resources: "Resource Library",
      aiChat: "AI Assistant",
      upcoming: "Upcoming Sessions",
      noSessions: "No upcoming sessions. Book one to get started.",
      bookNew: "Book a Session",
      resourceLibrary: "Resource Library",
      resourceSubtitle: "Articles, guides, and materials to support your journey.",
      noResources: "No resources available yet.",
      messagesTitle: "Messages",
      messagesSubtitle: "Communicate securely with your practitioner.",
      noMessages: "No messages yet. Start a conversation.",
      typeMessage: "Type a message...",
      bookSession: "Book a Session",
      bookSubtitle: "Select a time that works for you.",
      sessionType: "Session Type",
      selectType: "Select type",
      date: "Date",
      time: "Time",
      duration: "Duration",
      notes: "Notes (optional)",
      notesPlaceholder: "Anything you'd like to discuss...",
      confirmBooking: "Confirm Booking",
      bookingSuccess: "Session booked!",
      bookingConfirmed: "Session Booked",
      bookingConfirmedText: "We'll confirm your appointment shortly.",
      bookAnother: "Book Another",
      aiAssistant: "AI Assistant",
      aiSubtitle: "Ask questions about our services, behavioural approaches, or general guidance.",
      aiWelcome: "Hi! I'm Blueprint's AI assistant. How can I help you today?",
      askAnything: "Ask anything...",
    },
    
    portalDashboard: {
      goodMorning: "Good morning",
      goodAfternoon: "Good afternoon",
      goodEvening: "Good evening",
      messages: "Messages",
      bookSession: "Book Session",
      sessionsAhead: "Sessions Ahead",
      nextSession: "Next",
      noneScheduled: "None scheduled",
      pendingTasks: "Pending Tasks",
      tasksDone: "{{completed}} of {{total}} done",
      documents: "Documents",
      sharedSecurely: "Shared securely",
      viewArrow: "View →",
      upcomingSessions: "Upcoming Sessions",
      viewCalendar: "View calendar",
      noSessionsYet: "No sessions yet",
      bookFirstSession: "Book your first session to get started.",
      bookASession: "Book a Session",
      session: "Session",
      today: "Today",
      tomorrow: "Tomorrow",
      inDays: "In {{days}}d",
      bookAnotherSession: "Book another session",
      myTasks: "My Tasks",
      allCaughtUp: "All caught up!",
      tasksFromTherapist: "Tasks from your therapist appear here.",
      due: "Due",
      quickActions: "Quick Actions",
      jumpToSection: "Jump to a section",
      chatWithTherapist: "Chat with therapist",
      unread: "unread",
      resources: "Resources",
      notesAndMaterials: "Notes & materials",
      toolkit: "Toolkit",
      exercisesAndTools: "Exercises & tools",
      taskBoard: "Task Board",
      allTasksAndCalendar: "All tasks & calendar",
      sharedFiles: "Shared files with your therapist",
      upload: "Upload",
      uploading: "Uploading...",
      noDocumentsYet: "No documents yet",
      uploadFilesToShare: "Upload files to share securely with your therapist.",
      needHelp: "Need help?",
      unreadWaiting: "Unread waiting",
      allRead: "All read",
    },
    
    
    
    settings: {
      title: "Settings",
      subtitle: "Your preferences are saved automatically.",
      appearance: "Appearance",
      theme: "Theme",
      systemDefault: "System Default",
      light: "Light",
      dark: "Dark",
      languageCard: "Language",
      languageSelect: "Language",
      en: "English",
      he: "עברית (Hebrew)",
      notificationChannels: "Notification Channels",
      notificationDesc: "Choose how you want to receive notifications.",
      notifyInApp: "In-App Notifications",
      notifyEmail: "Email Notifications",
      notifyTelegram: "Telegram Notifications",
      notifyPush: "Browser Push Notifications",
      mobile: "Mobile",
      bottomNav: "Bottom Navigation Bar",
      bottomNavDesc: "Show a floating nav bar at the bottom of the screen.",
      dashboardLayout: "Dashboard Layout",
      dashboardDesc: "Choose which widgets appear on your dashboard.",
      widgetTasks: "My Tasks",
      widgetCalendar: "Calendar",
      widgetMessages: "Messages",
      widgetLinear: "Practice Tasks (Linear)",
      widgetNotifications: "Recent Notifications",
    },
    
    portalBooking: {
      bookingConfirmed: "Session Booked",
      bookingConfirmedText: "Your payment was received and we'll confirm your appointment shortly.",
      bookAnother: "Book Another",
      paymentCancelled: "Payment Cancelled",
      paymentCancelledText: "Your payment was not completed. You can try again below.",
      tryAgain: "Try Again",
      bookASession: "Book a Session",
      bookSubtitle: "Select a service, date, and time.",
      step1: "1. Choose a Service",
      minutes: "minutes",
      step2: "2. Pick a Date",
      step3: "3. Choose a Time",
      stepPlatform: "4. Meeting Format",
      platformInPerson: "In-person",
      platformZoom: "Zoom",
      platformTeams: "Microsoft Teams",
      platformMeet: "Google Meet",
      platformHint: "A join link will be generated automatically for virtual meetings.",
      step4: "5. Additional Notes (optional)",
      notesPlaceholder: "Anything you'd like to discuss...",
      redirecting: "Redirecting to payment...",
      payAndBook: "Pay £{{price}} & Book",
      booking: "Booking...",
      confirmBooking: "Confirm Booking",
      bookingSuccess: "Session booked!",
    },
    
    portalMessages: {
      messagesTitle: "Messages",
      searchPlaceholder: "Search or start new chat...",
      startConversation: "Start a conversation",
      noUsersFound: "No users found",
      noConversationsYet: "No conversations yet",
      startNewChat: "Start a new chat",
      selectConversation: "Select a conversation to start messaging",
      typing: "typing...",
      online: "Online",
      noMessagesYet: "No messages yet. Say hello!",
      typeMessage: "Type a message...",
    },
    
    portalResources: {
      resourceLibrary: "Resource Library",
      resourceSubtitle: "Articles, guides, and materials to support your journey.",
      noResources: "No resources available yet.",
      uploadResourceTitle: "Upload a Resource",
      uploadResourceBtn: "Upload Resource",
      titleLbl: "Title",
      titlePlaceholder: "Resource title",
      descriptionLbl: "Description",
      descriptionPlaceholder: "Brief description",
      categoryLbl: "Category",
      fileLbl: "File (optional)",
      fileHint: "PDF, Word, Images, Excel, PowerPoint (max 10MB)",
      urlLbl: "External URL (optional)",
      uploadingBtn: "Uploading...",
      uploadFirst: "Upload your first resource",
      downloadBtn: "Download",
      viewBtn: "View",
    },
    
    portalToolkit: {
      toolkitTitle: "Client Toolkit",
      toolkitSubtitle: "Tools to support your focus and wellbeing.",
      actMatrix: "ACT Matrix",
      actMatrixDesc: "Map your values, obstacles, and committed actions using the ACT framework.",
      pomodoro: "Pomodoro Timer",
      pomodoroDesc: "Stay focused with timed work and break intervals.",
      mindfulness: "Mindfulness Sounds",
      mindfulnessDesc: "Ambient nature sounds for relaxation and mindful breathing exercises.",
    },
    
    portalMindfulness: {
      fireTitle: "Crackling Fire",
      fireDesc: "Warm crackling flames",
      windTitle: "Gentle Wind",
      windDesc: "Soft breeze through trees",
      waterTitle: "Water Stream",
      waterDesc: "Flowing mountain stream",
      rainTitle: "Rainfall",
      rainDesc: "Gentle rain on leaves",
      forestTitle: "Forest Ambience",
      forestDesc: "Birds and rustling leaves",
      title: "Mindfulness Sounds",
      subtitle: "Take a moment. Breathe. Listen.",
      duration: "Duration:",
      min: "min",
      playing: "Playing",
      footerNote: "These ambient sounds are generated in real-time using your browser. No internet connection is needed once loaded. Find a comfortable position, close your eyes, and focus on your breath.",
    },
    
    portalProductivity: {
      title: "Productivity Hub",
      subtitle: "Manage tasks, plan your day with AI, and stay focused — all in one place.",
      board: "Board",
      calendar: "Calendar",
    },
    
    portalPomodoro: {
      title: "Pomodoro Timer",
      subtitle: "Stay focused with timed work and break intervals.",
      backToToolkit: "Back to Toolkit",
      focus: "Focus",
      shortBreak: "Short Break",
      longBreak: "Long Break",
      completed: "Completed:",
      timerSettings: "Timer Settings",
      focusDuration: "Focus Duration: {{min}} min",
      shortBreakDuration: "Short Break: {{min}} min",
      longBreakDuration: "Long Break: {{min}} min",
      longBreakEvery: "Long break every {{count}} pomodoros",
      autoStartBreaks: "Auto-start breaks",
      autoStartFocus: "Auto-start focus",
      soundNotification: "Sound notification",
    },
    
    portalACT: {
      title: "ACT Matrix",
      subtitle: "Map your values, obstacles, and committed actions.",
      backToToolkit: "Back to Toolkit",
      towardActions: "Toward Actions",
      towardActionsPrompt: "What observable actions can you take to move toward your values, even when difficult thoughts are present?",
      awayBehaviours: "Away Behaviours",
      awayBehavioursPrompt: "What observable things do you do to escape or avoid those difficult thoughts and feelings?",
      values: "Values",
      valuesPrompt: "Who and what is important to you? What do you care about deeply?",
      internalObstacles: "Internal Obstacles",
      internalObstaclesPrompt: "What difficult thoughts, feelings, memories, or sensations show up and get in the way?",
      viewMatrix: "Matrix",
      viewVoice: "Voice Guide",
      viewHistory: "History",
      observableBehaviour: "Observable Behaviour ↑",
      awayToward: "← Away  |  Toward →",
      innerExperience: "↓ Inner Experience (Thoughts & Feelings)",
      notes: "Notes",
      notesPlaceholder: "Additional notes or observations...",
      typeOrSpeak: "Type or speak...",
      typeOrMic: "Type or use the mic...",
      saveEntry: "Save Entry",
      progressOverview: "Progress Overview",
      entriesTotal: "entries total",
      latest: "Latest: ",
      noEntries: "No entries yet.",
    },
    
    staffClinical: {
      client: "Client",
      selectClientFirst: "Select a client first",
      failedToSave: "Failed to save",
      saving: "Saving...",
      notes: "Notes",
      additionalNotes: "Additional Notes",
      entryHistory: "Entry History",
      
      abcTitle: "ABC Data Sheet",
      abcDesc: "Record Antecedent–Behaviour–Consequence sequences for functional analysis",
      dateTime: "Date & Time",
      settingContext: "Setting / Context",
      settingPlaceholder: "e.g. Classroom, home, session...",
      antecedentLbl: "A — Antecedent",
      antecedentPlaceholder: "What happened immediately before the behaviour?",
      behaviourLbl: "B — Behaviour",
      behaviourPlaceholder: "Describe the behaviour in observable, measurable terms",
      consequenceLbl: "C — Consequence",
      consequencePlaceholder: "What happened immediately after the behaviour?",
      functionHypothesis: "Function Hypothesis",
      functionPlaceholder: "Hypothesised function: attention, escape, access to tangible, sensory...",
      submitAbc: "Submit ABC Entry",
      abcSaved: "ABC entry saved",
      fillAbc: "Fill in A, B, and C fields",
      
      logTitle: "Behaviour Tracking Log",
      logDesc: "Daily frequency, intensity, and context tracking for target behaviours",
      targetBehaviour: "Target Behaviour",
      frequencyCount: "Frequency (count)",
      durationMinutes: "Duration (minutes)",
      intensity: "Intensity",
      moodBefore: "Mood Before",
      moodAfter: "Mood After",
      copingUsed: "Coping Strategy Used",
      copingPlaceholder: "e.g. Deep breathing, defusion technique, grounding...",
      submitLog: "Submit Log Entry",
      logSaved: "Behaviour log saved",
      fillBehaviour: "Enter target behaviour",
      
      caseTitle: "Case Formulation",
      caseDesc: "Structured CBS case conceptualisation with functional analysis",
      presentingProblems: "Presenting Problems",
      presentingPlaceholder: "Key concerns, referral reason, client's goals...",
      relevantHistory: "Relevant History & Context",
      historyPlaceholder: "Learning history, family, cultural context, medical factors...",
      functionalPatterns: "Functional Patterns",
      functionalPlaceholder: "Key behavioural patterns, stimulus–response relationships, rule-governed behaviour...",
      processInflexibility: "Psychological Inflexibility Processes",
      inflexibilityPlaceholder: "Fusion, avoidance, loss of contact with values, inaction, conceptualised self, past/future focus...",
      strengthsResources: "Strengths & Resources",
      strengthsPlaceholder: "Existing values, committed actions already taking, support networks...",
      treatmentTargets: "Treatment Targets",
      targetsPlaceholder: "Prioritised targets with functional rationale...",
      treatmentPlan: "Treatment Plan",
      planPlaceholder: "Intervention strategies mapped to functional analysis...",
      outcomeMeasures: "Outcome Measures",
      outcomePlaceholder: "How progress will be tracked (behavioural, self-report, functional)...",
      submitCase: "Submit Case Formulation",
      caseSaved: "Case formulation saved",
      fillSection: "Fill in at least one section",
    },
    
    advancedModels: {
      flexibilityScore: "Overall Flexibility Score",
      observationsAbout: "Observations about ",
      summaryNotes: "Summary Notes",
      summaryPlaceholder: "Overall clinical impression, treatment priorities...",
      submitHexaflex: "Submit Hexaflex Assessment",
      hexaflexSaved: "Hexaflex assessment saved",
      hexaflexTitle: "Hexaflex Tracker",
      hexaflexDesc: "Rate and track the six core ACT processes of psychological flexibility",
      assessmentHistory: "Assessment History",
      backToTherapist: "Back to Therapist Portal",
      staffMatrixTitle: "ACT Matrix",
      staffMatrixDesc: "Fill in ACT Matrix for your assigned clients.",
      bullseyeTitle: "Values Bull's Eye",
      bullseyeDesc: "Assess values importance and consistency of action across key life domains",
      whatMatters: "What matters to you in this area?",
      describeValue: "Describe what you value...",
      importance: "Importance",
      consistency: "Consistency of Action",
      clinicalNotes: "Clinical Notes",
      clinicalNotesPlaceholder: "Observations about discrepancies, barriers, willingness...",
      submitBullseye: "Submit Values Assessment",
      bullseyeSaved: "Values assessment saved",

      hexAcceptance: "Acceptance",
      hexAcceptanceDesc: "Willingness to experience difficult thoughts and feelings without avoidance",
      hexAcceptanceOpp: "Experiential Avoidance",

      hexDefusion: "Cognitive Defusion",
      hexDefusionDesc: "Ability to step back from thoughts and see them as mental events",
      hexDefusionOpp: "Cognitive Fusion",

      hexPresent: "Present Moment Awareness",
      hexPresentDesc: "Flexible attention to the here-and-now with openness",
      hexPresentOpp: "Dominance of Past/Future",

      hexSelf: "Self-as-Context",
      hexSelfDesc: "A transcendent sense of self that observes experience",
      hexSelfOpp: "Attachment to Conceptualised Self",

      hexValues: "Values",
      hexValuesDesc: "Clarity about what matters and provides direction for living",
      hexValuesOpp: "Lack of Values Clarity",

      hexAction: "Committed Action",
      hexActionDesc: "Taking effective action guided by values, even when difficult",
      hexActionOpp: "Inaction / Impulsivity",

      valWork: "Work / Education",
      valWorkDesc: "Career, study, skill development",
      
      valRelations: "Relationships",
      valRelationsDesc: "Intimate, family, social connections",

      valGrowth: "Personal Growth / Health",
      valGrowthDesc: "Physical, emotional, spiritual wellbeing",

      valLeisure: "Leisure / Recreation",
      valLeisureDesc: "Fun, hobbies, creativity, play",
    },
    
    superviseeHub: {
      goodMorning: "Good morning",
      goodAfternoon: "Good afternoon",
      goodEvening: "Good evening",
      caseLogsLabel: "Case Logs",
      caseLogsDesc: "Log session details, targets, and interventions",
      caseLogsNote: "Total sessions logged",
      myDocsLabel: "My Documents",
      myDocsDesc: "Upload and view supervision documents",
      myDocsNote: "Uploaded supervision files",
      calendarLabel: "Calendar",
      calendarDesc: "View your session schedule",
      clinicalToolsLabel: "Clinical Tools",
      clinicalToolsDesc: "ABC data sheets, functional assessments & more",
      resourcesLabel: "Resources",
      resourcesDesc: "Access shared learning resources",
      myTodosLabel: "My To-Dos",
      myTodosDesc: "Track your supervision tasks",
      myTodosNote: "Tasks to complete",
      yourTools: "Your Tools",
      everythingInOnePlace: "Everything in one place",
      notificationSettings: "Notification Settings",
      portalFooter: "Supervisee Portal · Blueprint CBS",
      
      newLog: "New Log",
      noLogs: "No case logs yet. Start logging your client sessions.",
      edit: "Edit",
      delete: "Delete",
      editLog: "Edit Case Log",
      newLogTitle: "New Case Log",
      cancel: "Cancel",
      updateLog: "Update Log",
      createLog: "Create Log",
      status: "Status",
      
      clientName: "Client Name",
      clientAge: "Client Age",
      sessionDateTime: "Session Date & Time",
      sessionType: "Session Type",
      durationMinutes: "Duration (minutes)",
      settingPlaceholder: "Setting (e.g. clinic, home, school)",
      targetsAddressed: "Targets Addressed",
      targetsPlaceholder: "List behavioural targets worked on during the session...",
      interventionsUsed: "Interventions Used",
      interventionsPlaceholder: "DTT, NET, FCT, antecedent strategies, etc.",
      clientResponse: "Client Response",
      responsePlaceholder: "How did the client respond? Prompt levels, engagement, challenging behaviours...",
      dataSummary: "Data Summary",
      dataPlaceholder: "Trial data, frequency counts, duration data, percentage correct...",
      nextSteps: "Next Steps / Recommendations",
      nextStepsPlaceholder: "Plan for next session, changes to intervention...",
      supervisionNotes: "Supervision Notes",
      supervisionPlaceholder: "Questions for supervisor, areas to discuss...",
      
      typeDirect: "Direct Service",
      typeIndirect: "Indirect Service",
      typeSupervision: "Supervision Meeting",
      typeAssessment: "Assessment",
      typeParent: "Parent/Caregiver Training",
      typeObservation: "Observation",
      
      statusDraft: "Draft",
      statusSubmitted: "Submitted for Review",
      
      fileTypeNotAllowed: "File type not allowed",
      fileUnder10MB: "File must be under 10MB",
      docUploaded: "Document uploaded",
      uploadFailed: "Upload failed",
      downloadFailed: "Download failed",
      docDeleted: "Document deleted",
      uploadDocument: "Upload Document",
      notesOptional: "Notes (optional)",
      describeDoc: "Describe this document...",
      uploading: "Uploading...",
      chooseFile: "Choose File",
      fileConstraints: "PDF, images, Word docs — max 10MB",
      loadingDocs: "Loading documents...",
      noDocsYet: "No documents yet.",
    },
    
    staffHub: {
      goodMorning: "Good morning",
      goodAfternoon: "Good afternoon",
      goodEvening: "Good evening",
      calLabel: "Calendar",
      calDesc: "View and manage all sessions",
      toolsLabel: "Clinical Tools",
      toolsDesc: "CBS data collection tools",
      clientTodosLabel: "Client To-Dos",
      clientTodosDesc: "Manage client task lists",
      matrixLabel: "ACT Matrix",
      matrixDesc: "ACT Matrix for clients",
      plannerLabel: "Business Planner",
      plannerDesc: "Financials, TME matrix, and roadmap",
      
      prodLabel: "Productivity Hub",
      prodDesc: "Task board, calendar & AI",
      resourcesLabel: "Resources",
      resourcesDesc: "Resource library",
      toolkitLabel: "Toolkit",
      toolkitDesc: "Pomodoro, ACT Matrix & more",
      msgLabel: "Messages",
      msgDesc: "Secure messaging",
      bookingLabel: "Booking",
      bookingDesc: "Manage your sessions",
      settingsLabel: "Settings",
      settingsDesc: "Preferences & notifications",

      upSessions: "Upcoming Sessions",
      upSessionsNote: "Scheduled in future",
      myTasks: "My Tasks",
      myTasksNote: "Incomplete staff to-dos",
      clientHw: "Client Homework",
      clientHwNote: "Pending from clients",
      
      clinicalToolsSection: "Clinical Tools",
      clinicalToolsSub: "Client-facing clinical work",
      myWorkspaceSection: "My Workspace",
      myWorkspaceSub: "Personal tools & settings",
      
      pendingTasks: "pending",
      viewAll: "View all",
      noPendingTasks: "No pending tasks assigned to you.",
      due: "Due",
      practiceTasks: "Practice Tasks",
      practiceTasksSub: "Team task board",
      portalFooter: "Therapist Portal · Blueprint CBS",
    },
    
    staffFunctional: {
      title: "Functional Assessment",
      desc: "Comprehensive functional behaviour analysis with CBS framework",
      
      targetBehaviour: "Target Behaviour",
      behaviourName: "Behaviour Name",
      behaviourPlaceholder: "e.g. Self-injurious behaviour",
      operationalDef: "Operational Definition",
      opDefPlaceholder: "Observable, measurable description...",
      frequency: "Frequency",
      freqPlaceholder: "e.g. 3x/day",
      intensity: "Intensity",
      intPlaceholder: "Low/Med/High",
      duration: "Duration",
      durPlaceholder: "e.g. 5 minutes",
      
      antecedents: "Antecedent Variables",
      settingEvents: "Setting Events (Distant)",
      settingEventsPlaceholder: "e.g. Poor sleep, missed medication, family conflict...",
      establishingOps: "Establishing Operations (Motivational)",
      estOpsPlaceholder: "e.g. Hunger, social deprivation, task satiation...",
      discrimStimuli: "Discriminative Stimuli (Immediate)",
      discrimStimuliPlaceholder: "e.g. Demand placed, attention withdrawn, transition signal...",
      
      consequences: "Consequence Analysis",
      srPlus: "SR+ (Positive Reinforcement — something added)",
      srPlusPlaceholder: "e.g. Attention from staff, access to preferred item...",
      srMinus: "SR− (Negative Reinforcement — something removed)",
      srMinusPlaceholder: "e.g. Escape from task demand, removal of aversive noise...",
      spPlus: "SP+ (Positive Punishment — something added)",
      spPlusPlaceholder: "e.g. Verbal reprimand, physical block...",
      spMinus: "SP− (Negative Punishment — something removed)",
      spMinusPlaceholder: "e.g. Loss of privileges, time-out from reinforcement...",
      
      formulation: "Formulation",
      hypothesisedFunc: "Hypothesised Function",
      hypothesisedFuncPlaceholder: "Based on the analysis, the behaviour appears to serve...",
      replacementBeh: "Replacement Behaviour",
      replacementBehPlaceholder: "Functionally equivalent alternative behaviour...",
      
      submitAssessment: "Submit Assessment",
      assessmentSaved: "Assessment saved",
      clinicalDataTitle: "Clinical Data Collection",
      clinicalDataDesc: "Contextual Behaviour Science tools for assessment, tracking, and case formulation",
    },
    fbaTool: {
      steps: {
        clientInfo: "Client Info",
        methods: "Methods",
        supportingDocs: "Supporting Documents",
        background: "Background",
        strengths: "Strengths & Resources",
        targetBehaviours: "Target Behaviours",
        constructionalInterview: "Constructional Interview",
        actAssessment: "ACT Assessment",
        directObservations: "Direct Observations",
        nonlinearAnalysis: "Nonlinear Analysis",
        recommendations: "Recommendations",
      },
      ui: {
        livePreview: "Live Report Preview",
        clearDraft: "Clear Draft",
        exportPdf: "Export PDF",
        back: "Back",
        next: "Next",
        generatePdf: "Generate PDF",
        step: "Step",
        of: "of",
        sectionComplete: "Section complete",
        sectionIncomplete: "Section incomplete",
        title: "FBA Report Tool",
        subtitle: "Constructional · Goldiamond (1974) · Nonlinear Contingency Analysis · ACT-Informed",
        reportPreviewScrollable: "Report Preview (scrollable)",
        clearDraftConfirm: "Are you sure you want to clear your draft and start a new report?",
      },
      form: {
        clientName: "Client Full Name",
        clientNameHint: "Full legal name",
        dob: "Date of Birth",
        diagnosis: "Primary Diagnosis or Profile",
        settingType: "Setting Type",
        settingName: "Setting Name",
        settingNamePlaceholder: "e.g., King's Academy",
        assessor: "Assessed By",
        assessmentDates: "Assessment Dates",
        referralReason: "Reason for Referral",
        referralReasonPlaceholder: "Why was this assessment requested? Key concerns and who referred...",
        reportTheme: "Report Theme",
        typography: "Typography",
        assessmentMethods: "Assessment Methods Utilized",
        selectMethods: "Select all that apply:",
        otherMethods: "Other Methods / Custom",
        otherMethodsPlaceholder: "Comma separated...",
        externalReports: "External Reports & Supporting Documents",
        docTitle: "Document Title",
        docTitlePlaceholder: "e.g., EHCP, SALT Report",
        professional: "Professional / Author",
        professionalPlaceholder: "e.g., Dr. Smith (EdPsych)",
        docDate: "Date (approx)",
        docType: "Document Type",
        keyFindings: "Key Findings & Relevance",
        keyFindingsPlaceholder: "What does this tell us relevant to the current behaviour...",
        fileAttached: "File Attached",
        attachFile: "Attach File",
        uploading: "Uploading...",
        addDocument: "Add Document",
        background: "Background & Context",
        backgroundHint: "Write a narrative history of the client, relevant medical/social background, and current situation.",
        environment: "Educational / Clinical Environment",
        supportStaff: "Support Staff & Key People",
        strengths: "Client Strengths & Resources",
        strengthsHint: "A constructional approach begins with what the client CAN do. Focus on their current successful repertoires, interests, and available support systems.",
        strengthTitle: "Strength / Asset",
        strengthTitlePlaceholder: "e.g., Highly articulate, loves trains",
        description: "Description / Context",
        descriptionPlaceholder: "How is this strength currently demonstrated...",
        addStrength: "Add Strength",
        targetBehaviours: "Target Behaviours (Form & Topography)",
        targetBehavioursHint: "Describe the behaviours objectively without assigning intent. Focus on what can be seen and measured.",
        behaviourName: "Behaviour Name",
        behaviourNamePlaceholder: "e.g., Physical Aggression, Elopement",
        topography: "Topography (What it looks like)",
        topographyPlaceholder: "The client uses closed fists to strike...",
        frequency: "Frequency",
        intensity: "Intensity",
        duration: "Duration",
        antecedents: "Antecedents / Context",
        antecedentsPlaceholder: "When and where is this most likely to occur...",
        addBehaviour: "Add Behaviour",
        constructionalQuestionnaire: "Goldiamond's Constructional Questionnaire",
        cqHint: "Rather than asking about the problem, explore where the client wants to go.",
        cq1: "1. Stated Outcome",
        cq1Hint: "What would the outcome be for you? (verbatim)",
        cq2: "2. Observed Outcome",
        cq2Hint: "What would others see when a successful outcome is achieved?",
        cq3: "3. Current State",
        cq3Hint: "How does the present situation differ from the desired outcome?",
        cq4: "4. History of the Pattern",
        cq4Hint: "How was this pattern shaped? What maintains it?",
        cq5: "5. Conditions When Better",
        cq5Hint: "When is the problem less severe or absent?",
        cq6: "6. Related Successes",
        cq6Hint: "What related challenges has the client succeeded in before?",
        cq7: "7. Natural Reinforcers",
        cq7Hint: "What would naturally maintain movement toward goals?",
        cq8: "8. Systematic Approximations (Subgoals)",
        cq8Hint: "Stepping stones from current repertoire toward terminal outcomes",
        actAssessment: "ACT-Informed Assessment (Psychological Flexibility)",
        actHint: "Once a client demonstrates language about past/future events, consider how verbal behaviour interacts with contingencies.",
        languageComplexity: "Language & Relational Repertoire",
        languageComplexityHint: "Candidate for ACT?",
        presentMoment: "Present-Moment Awareness",
        presentMomentHint: "Contact with current experience vs. past/future preoccupation",
        defusion: "Defusion (vs. Cognitive Fusion)",
        defusionHint: "Rigid entanglement with thoughts; rule-following without flexibility",
        acceptance: "Acceptance (vs. Experiential Avoidance)",
        acceptanceHint: "Escape from uncomfortable internal experiences",
        selfAsContext: "Self-as-Context (vs. Self-as-Content)",
        selfAsContextHint: "Rigid self-story; perspective-taking ability",
        values: "Values",
        valuesHint: "What matters to the client?",
        committedAction: "Committed Action",
        statedValues: "Client's Stated Values and Interests",
        reinforcers: "Preferred Reinforcers",
        directObservations: "Direct Observations",
        addObservation: "Add Observation Session",
        session: "Session",
        date: "Date",
        setting: "Setting / Activity",
        participants: "Participants Present",
        purpose: "Purpose of Observation",
        observations: "Narrative Observations (ABC Data summary)",
        analysis: "Initial Analysis / Impressions",
        nonlinearAnalysis: "Functional & Nonlinear Contingency Analysis",
        nonlinearHint: "Consider not only the consequences of the presenting behaviour, but also the consequences of NOT doing it (costs of alternatives).",
        identifiedFunction: "Identified Function",
        benefitsOfBehaviour: "Benefits of Current Pattern",
        benefitsOfBehaviourHint: "What does the behaviour successfully achieve for them?",
        costsOfAlternatives: "Costs of Alternatives",
        costsOfAlternativesHint: "What is the cost/difficulty of engaging in the desired alternative behaviour?",
        hypothesis: "Formulation / Hypothesis",
        hypothesisPlaceholder: "Therefore, the behaviour is a highly competent response to...",
        recommendations: "Recommendations & Support Plan",
        recommendationsHint: "Detail the constructional strategies to establish new repertoires aligned with the client's goals.",
        additionalNotes: "Additional Notes / Caveats",
        additionalNotesHint: "Any limitations of the assessment, risks, or other context.",
      },
      report: {
        docReviewed: "DOCUMENTS REVIEWED — REPORTS FROM OTHER PROFESSIONALS",
        fileAttached: "[file attached]",
        currentRepertoire: "CURRENT RELEVANT REPERTOIRE — STRENGTHS & RESOURCES",
        targetBehavioursTitle: "TARGET BEHAVIOURS",
        topography: "Topography:",
        frequency: "Frequency:",
        intensity: "Intensity:",
        duration: "Duration:",
        antecedents: "Antecedents/Context:",
        observations: "DIRECT OBSERVATIONS",
        setting: "Setting:",
        participants: "Participants:",
        purpose: "Purpose:",
        obsDesc: "Observations:",
        analysis: "Analysis:",
        cQuestionnaire: "CONSTRUCTIONAL INTERVIEW — GOLDIAMOND'S QUESTIONNAIRE (1974)",
        cQuestionnaireIntro: "Rather than asking about the problem, the constructional interview explores where the client wants to go, and then designs a programme to take them there using the very contingencies maintaining the current pattern.",
        actAssessment: "ACT-INFORMED ASSESSMENT — PSYCHOLOGICAL FLEXIBILITY (HEXAFLEX)",
        actAssessmentIntro: "Once a client demonstrates language about past/future events and perspective-taking, a comprehensive functional analysis must account for how verbal behaviour interacts with contingencies (Dixon et al., 2023).",
        nonlinearAnalysis: "FUNCTIONAL AND NONLINEAR CONTINGENCY ANALYSIS",
        nonlinearAnalysisIntro: "A nonlinear analysis (Layng et al., 2022) considers not only the consequences of the presenting behaviour, but also the consequences of not doing it — the costs of the alternatives. This typically reveals that the behaviour is the rational, competent outcome of available contingencies.",
        hypothesis: "Hypothesis:",
        recommendations: "RECOMMENDATIONS",
        recommendationsIntro: "The following recommendations are constructional: they focus on establishing new repertoires aligned with the client's stated values and terminal goals.",
        additionalNotes: "ADDITIONAL NOTES / CAVEATS",
        references: "REFERENCES",
        title: "Assessment & Recommendations Report",
        subtitle: "ACT-Informed Constructional Functional Behaviour Assessment",
        client: "Client:",
        dob: "Date of Birth:",
        diagnosis: "Diagnosis / Profile:",
        settingField: "Setting:",
        assessedBy: "Assessed by:",
        assessmentDates: "Assessment Dates:",
        reportDate: "Report Date:",
        confidential: "Confidential | Clinical Document",
        reasonForReferral: "REASON FOR REFERRAL",
        assessmentMethods: "ASSESSMENT METHODS",
        background: "BACKGROUND",
        backgroundIntro: "This assessment adopts a constructional approach, presenting the client as a person functioning competently given available contingencies — not as exhibiting pathology (Goldiamond, 1974; Layng et al., 2022). Where relevant, an ACT-informed lens considers the role of language and psychological flexibility (Dixon et al., 2023).",
        envTitle: "Educational / Clinical Environment:",
        supportStaffTitle: "Support Staff and Key People:",
        reportCompleted: "Report completed:"
      }
    },
  },

  he: {
    // Header
    nav: {
      services: "שירותים",
      education: "חינוך",
      therapy: "טיפול",
      families: "משפחות",
      organisations: "ארגונים",
      supervision: "הדרכה",
      bookConsultation: "לקביעת ייעוץ",
    },

    // Landing page
    landing: {
      title: "ברוכים הבאים לבניין אדם",
      subtitle: "שירותי התנהגות קונסטרוקציוניים לתמיכה ביחידים, ארגונים ומשפחות.",
      exploreServices: "לשירותים שלנו",
      logIn: "כניסה",
      signUp: "הרשמה",
      quote: "״אנחנו לא מסירים התנהגות — אנחנו בונים יכולת.״",
      quoteAuthor: "אדם דיין, MSc",
    },

    // Services page
    services: {
      tagline: "מה אנחנו עושים",
      title: "שירותי התנהגות מתמחים",
      subtitle: "חמישה מסלולי תמיכה ייחודיים, כל אחד מעוצב עם בהירות, כבוד ותוצאות מדידות במרכז.",
      approachTagline: "הגישה שלנו",
      approachTitle: "קונסטרוקציונית, לא רדוקציונית",
      approachText: "אנחנו לא מבקשים לדכא, לשלוט או לבטל התנהגות. במקום זאת, אנחנו בונים יכולות חדשות, מיומנויות ורפרטוארים שמאפשרים שינוי משמעותי. כל התערבות מתחילה בהבנת ההקשר ומסתיימת בצמיחה מדידה.",
      approachPoints: [
        "בניית רפרטוארים, לא דיכוי התנהגות",
        "התנהגות כתקשורת, לא כהתרסה",
        "חשיבה מערכתית לשינוי בר-קיימא",
        "אתי, מבוסס ראיות ורגיש תרבותית",
      ],
      credentialsTagline: "ראיות והסמכות",
      credentialsTitle: "מבוססים במדע. מובלים ביושרה.",
      credentials: [
        "רישום UKBA (Cert)",
        "15+ שנות ניסיון",
        "חבר צוות הנהגה בכיר",
        "MSc ניתוח התנהגות שימושי",
        "MEd פסיכולוגיה של חינוך (מועמד)",
        "חבר UK-SBA ו-ACBS",
      ],
      ctaTitle: "בואו נתחיל שיחה",
      ctaText: "בין אם אתם בית ספר, משפחה, ארגון או מטפלים — אנחנו כאן כדי לעזור לכם לבנות יכולת.",
      ctaButton: "לקביעת ייעוץ",
      quoteText: "״אנחנו לא מסירים התנהגות — אנחנו בונים יכולת.״",
      quoteAuthor: "אדם דיין, MSc",
      quoteRole: "UKBA (Cert) · מנתח התנהגות קליני ויועץ",
      cards: {
        education: { title: "PBS בחינוך", description: "תרבות התנהגותית בית־ספרית הבנויה על בהירות וכבוד. ממדיניות ועד יישום בפועל." },
        therapy: { title: "טיפול", description: "הבנת התנהגות דרך הקשר, לא דרך האשמה. מבוסס ACT, קונסטרוקציוני וממוקד באדם." },
        family: { title: "תמיכה משפחתית", description: "ליווי משפחות המתמודדות עם מורכבות. גישה מעשית, מותאמת אישית וללא האשמה." },
        organisations: { title: "ארגונים", description: "מדע ההתנהגות מיושם למערכות ארגוניות. שינוי תרבותי, ממשל וביצועים." },
        supervision: { title: "הדרכה וליווי", description: "מרחב רפלקטיבי למטפלים — הדרכת UKBA, חונכות בגישה הקונסטרוקציונית, וקבוצות פרקטיקה." },
      },
      learnMore: "למידע נוסף",
    },

    // Service page layout
    serviceLayout: {
      whatWeOffer: "מה אנחנו מציעים",
      packages: "חבילות שירות",
      packagesSubtitle: "תמיכה מובנית וברורה, מותאמת לצרכים שלכם. כל חבילה כוללת תוצאות מדידות וגישה שיתופית.",
      idealFor: "מתאים במיוחד עבור:",
      readyTitle: "מוכנים להתחיל?",
      readyText: "אנחנו לא מסירים התנהגות — אנחנו בונים יכולת. בואו נתחיל בשיחה.",
    },

    // Offer detail page
    offerPage: {
      overview: "סקירה כללית",
      keyPoints: "נקודות מפתח",
      whoIsThisFor: "למי זה מתאים?",
      outcomes: "תוצאות צפויות",
      ctaTitle: "מתעניינים בשירות זה?",
      ctaText: "צרו קשר כדי לדון כיצד שירות זה יכול לתמוך בכם.",
    },

    // Education page
    education: {
      title: "PBS בחינוך",
      subtitle: "בתי ספר ומסגרות חינוכיות",
      tagline: "תרבות התנהגותית בית-ספרית בנויה על בהירות וכבוד. מהערכה ליישום, אנחנו בונים מערכות שמחזיקות מעמד.",
      ctaText: "בקשת הערכה בית-ספרית",
      services: [
        { name: "עיצוב מסגרת PBS בית-ספרית", slug: "whole-school-pbs" },
        { name: "פיתוח מדיניות התנהגות", slug: "behaviour-policy" },
        { name: "הערכת התנהגות פונקציונלית (FBA)", slug: "fba" },
        { name: "תוכניות תמיכה התנהגותית אישיות", slug: "individual-support-plans" },
        { name: "תוכניות הערכת סיכונים וניהול", slug: "risk-assessment" },
        { name: "הכשרת צוות ופיתוח מקצועי", slug: "staff-training" },
        { name: "מערכות קבלת החלטות מבוססות נתונים", slug: "data-driven-decisions" },
        { name: "שיתוף פעולה רב-מקצועי", slug: "multi-disciplinary" },
        { name: "אסטרטגיית התנהגות להנהגה", slug: "behaviour-strategy-slt" },
        { name: "פרויקטי שינוי תרבות התנהגותית", slug: "culture-change" },
      ],
      packages: [
        {
          name: "חבילת התחלה בית-ספרית",
          description: "הערכה ראשונית להבנת הנוף ההתנהגותי של בית הספר וזיהוי עדיפויות.",
          includes: ["ביקורת התנהגותית", "ייעוץ צוות", "דוח עדיפויות עם המלצות"],
          ideal: "בתי ספר שחוקרים PBS לראשונה",
        },
        {
          name: "הערכה ומפת דרכים אסטרטגית",
          description: "הערכה מעמיקה עם מפת דרכים ליישום מובנה בהתאם לערכי בית הספר.",
          includes: ["FBAs מקיפים", "סקר וניתוח צוות", "מסמך מפת דרכים אסטרטגית", "תדריך הנהגה"],
          ideal: "בתי ספר מוכנים להתחייב לשינוי תרבותי",
        },
        {
          name: "יישום PBS מלא",
          description: "עיצוב ומתן מסגרת PBS בית-ספרית מקצה לקצה עם תמיכה שוטפת.",
          includes: ["עיצוב מסגרת", "פיתוח מדיניות", "תוכנית הכשרת צוות", "מערכות נתונים", "סקירות תקופתיות"],
          ideal: "בתי ספר המחפשים שינוי טרנספורמטיבי ובר-קיימא",
        },
        {
          name: "שותפות הנהגה התנהגותית שוטפת",
          description: "תמיכה ייעוצית שוטפת לצוות ההנהגה עם ייעוץ והדרכה סדירים.",
          includes: ["ייעוצי הנהגה חודשיים", "הדרכת מקרים", "עדכוני הכשרה", "מפגשי סקירת נתונים"],
          ideal: "בתי ספר שמתחזקים ומפתחים את תרבות ה-PBS שלהם",
        },
      ],
    },

    // Therapy page
    therapy: {
      title: "הבנת התנהגות דרך הקשר, לא האשמה",
      subtitle: "טיפול והתערבות",
      tagline: "מבוסס ACT, קונסטרוקציוני וממוקד באדם. אנחנו עוזרים לאנשים לבנות מיומנויות וגמישות לחיים מונחי ערכים.",
      ctaText: "קביעת ייעוץ",
      services: [
        { name: "טיפול מבוסס ACT", slug: "act-therapy" },
        { name: "התערבות התנהגותית קונסטרוקציונית", slug: "constructional-intervention" },
        { name: "תמיכה בוויסות רגשי", slug: "emotional-regulation" },
        { name: "הדרכת הורים", slug: "parent-coaching" },
        { name: "אימון תקשורת פונקציונלית", slug: "functional-communication" },
        { name: "דפוסי חרדה והימנעות", slug: "anxiety-avoidance" },
        { name: "בניית התנהגות מבוססת ערכים", slug: "values-based" },
        { name: "תכנון התנהגות מודע טראומה", slug: "trauma-informed" },
      ],
      packages: [
        {
          name: "הערכה התנהגותית ראשונית",
          description: "הערכה מקיפה להבנת ההקשר, הצרכים והחוזקות של האדם.",
          includes: ["ראיון קליני", "הערכה פונקציונלית", "ניתוח הקשרי", "ניסוח כתוב והמלצות"],
          ideal: "יחידים או משפחות המחפשים בהירות לפני התערבות",
        },
        {
          name: "התערבות ממוקדת לטווח קצר",
          description: "תוכנית מובנית של 8-12 שבועות המכוונת למטרות התנהגותיות ספציפיות.",
          includes: ["מפגשים שבועיים", "הגדרת מטרות שיתופית", "פעילויות בניית מיומנויות", "סקירות התקדמות"],
          ideal: "חששות ספציפיים וממוקדים עם מטרות ברורות",
        },
        {
          name: "שותפות טיפולית מורחבת",
          description: "תמיכה ארוכת טווח לצרכים מורכבים או רב-שכבתיים.",
          includes: ["לוח זמנים גמיש", "ניסוח שוטף", "תיאום רב-מערכתי", "סקירות תוצאות סדירות"],
          ideal: "מצבים מורכבים הדורשים תמיכה מתמשכת ומותאמת",
        },
        {
          name: "חבילת הדרכת הורים",
          description: "העצמת הורים עם אסטרטגיות מעשיות מבוססות מדע ההתנהגות.",
          includes: ["מפגשי הדרכת הורים", "ניתוח הקשרי בבית", "פיתוח אסטרטגיות", "תמיכה במעקב"],
          ideal: "הורים המחפשים הדרכה מבוססת ראיות וביטחון",
        },
      ],
    },

    // Families page
    families: {
      title: "תמיכה למשפחות שמנווטות מורכבות",
      subtitle: "תמיכה משפחתית",
      tagline: "מעשית, מותאמת אישית וללא האשמה. אנחנו עוזרים למשפחות לבנות עקביות, תקשורת וביטחון בבית.",
      ctaText: "דברו איתנו",
      services: [
        { name: "הערכה התנהגותית בבית", slug: "home-assessment" },
        { name: "הדרכת אסטרטגיות להורים", slug: "parent-strategy" },
        { name: "תמיכה בדינמיקת אחים", slug: "sibling-dynamics" },
        { name: "תכנון עקביות", slug: "consistency-planning" },
        { name: "התאמה בית-ספר-בית", slug: "home-school-alignment" },
        { name: "תכנון משבר ואסטרטגיות הפחתת מתח", slug: "crisis-planning" },
      ],
      packages: [
        {
          name: "מפגש בהירות",
          description: "מפגש מעמיק יחיד לחקירת חששות, זיהוי עדיפויות ומיפוי צעדים הבאים.",
          includes: ["ייעוץ של 90 דקות", "דיון הקשרי", "סיכום כתוב עם צעדים הבאים"],
          ideal: "משפחות שרוצות בהירות לפני התחייבות לתוכנית",
        },
        {
          name: "תוכנית התנהגות ביתית",
          description: "הערכה מובנית שמביאה לתוכנית תמיכה התנהגותית מותאמת לסביבה הביתית.",
          includes: ["תצפית בבית", "ראיון משפחתי", "תוכנית התנהגות כתובה", "מפגש הדרכת אסטרטגיות"],
          ideal: "משפחות מוכנות לתוכנית מובנית בבית",
        },
        {
          name: "תוכנית תמיכה משפחתית",
          description: "תוכנית של 6-10 שבועות עם הדרכה סדירה, יישום אסטרטגיות וסקירות התקדמות.",
          includes: ["מפגשי הדרכה שבועיים", "פיתוח אסטרטגיות", "תיאום בית-ספר", "מעקב התקדמות"],
          ideal: "משפחות שמנווטות צרכים שוטפים או מורכבים",
        },
        {
          name: "הדרכה התנהגותית שוטפת",
          description: "תמיכה שוטפת עם לוח זמנים גמיש למשפחות עם צרכים מתפתחים.",
          includes: ["מפגשים דו-שבועיים", "תמיכה במשבר מגיבה", "התאמות תוכנית", "מפגשי סקירה"],
          ideal: "משפחות המחפשות הדרכה מתמשכת ומותאמת",
        },
      ],
    },

    // Organisations page
    organisations: {
      title: "מדע ההתנהגות מיושם למערכות",
      subtitle: "ארגונים והנהגה",
      tagline: "ניהול התנהגות ארגוני מבוסס ראיות. אנחנו עוזרים לצוותי הנהגה לבנות תרבות, ממשל ומסגרות ביצועים שעובדים.",
      ctaText: "בקשת הערכה ארגונית",
      services: [
        { name: "ניהול התנהגות ארגוני (OBM)", slug: "obm" },
        { name: "עיצוב אסטרטגיית התנהגות", slug: "behaviour-strategy" },
        { name: "פרויקטי שינוי תרבותי", slug: "culture-change" },
        { name: "מערכות ביצועי צוות", slug: "staff-performance" },
        { name: "מסגרות ממשל סיכונים", slug: "risk-governance" },
        { name: "מבני ממשל קליני", slug: "clinical-governance" },
        { name: "ביקורות הגנה והתנהגות", slug: "safeguarding-audits" },
        { name: "מערכות נתוני התנהגות", slug: "behaviour-data" },
      ],
      packages: [
        {
          name: "ביקורת מערכות התנהגות",
          description: "ביקורת יסודית של המערכות ההתנהגותיות, המדיניות והפרקטיקות הנוכחיות שלכם.",
          includes: ["סקירת מסמכים", "ראיונות צוות", "הערכה תצפיתית", "דוח ביקורת עם המלצות"],
          ideal: "ארגונים המחפשים סקירה התנהגותית עצמאית",
        },
        {
          name: "שותפות יישום אסטרטגית",
          description: "תוכנית שיתופית לעיצוב ויישום מערכות מובילות התנהגות בארגון שלכם.",
          includes: ["עיצוב משותף של אסטרטגיה", "פיתוח מדיניות", "הכשרת צוות", "תמיכה ביישום", "סקירות רבעוניות"],
          ideal: "ארגונים שמתחייבים לשינוי התנהגותי מערכתי",
        },
        {
          name: "מסגרת הדרכה קלינית",
          description: "עיצוב והטמעה של מסגרת הדרכה קלינית לצוות המטפלים שלכם.",
          includes: ["עיצוב מסגרת", "הכשרת מדריכים", "תבניות תיעוד", "מערכת אבטחת איכות"],
          ideal: "ספקי טיפול ושירותים קליניים",
        },
        {
          name: "מסלולי הכשרה והסמכה",
          description: "תוכניות הכשרה מותאמות אישית בהתאם לצרכי הארגון ולסטנדרטים מקצועיים.",
          includes: ["ניתוח צרכי הכשרה", "עיצוב תוכנית", "מתן והערכה", "הדרכת הסמכה"],
          ideal: "ארגונים שמשקיעים בפיתוח כוח אדם",
        },
      ],
    },

    // Supervision page
    supervision: {
      title: "מרחב לחשיבה קלינית",
      subtitle: "הדרכה, חונכות וליווי מקצועי",
      tagline: "הדרכה רפלקטיבית, קפדנית ומיושרת ערכים — מקום שבו מטפלים ומנתחי התנהגות יכולים לחשוב לעומק, להתלבט בפתיחות ולצמוח עם בהירות.",
      ctaText: "פנייה לקבלת הדרכה",
      services: [
        { name: "הדרכת UKBA", slug: "ukba-supervision" },
        { name: "הדרכה לניסוח קליני", slug: "case-formulation" },
        { name: "חונכות בגישה הקונסטרוקציונית", slug: "constructional-mentoring" },
        { name: "ליווי בשילוב ACT", slug: "act-integration" },
        { name: "ייעוץ אתי", slug: "ethical-consultation" },
        { name: "מסלולי התפתחות מקצועית", slug: "practitioner-development" },
        { name: "קבוצות פרקטיקה רפלקטיבית", slug: "reflective-practice" },
      ],
      packages: [
        {
          name: "הדרכה בסיסית",
          description: "הדרכה מובנית למטפלים בתחילת דרכם, הבונים את כשירויות הליבה.",
          includes: ["מפגש הדרכה חודשי", "דיון מקרים", "מעקב כשירויות", "משוב כתוב"],
          ideal: "מטפלים בתחילת הדרך ומתמחים",
        },
        {
          name: "הדרכה קלינית מתקדמת",
          description: "הדרכה מעמיקה למטפלים מנוסים שמלווים מקרים מורכבים.",
          includes: ["מפגשים דו-שבועיים", "ניסוח מקרים מורכבים", "ליבון דילמות אתיות", "תכנון התפתחות מקצועית"],
          ideal: "מטפלים מנוסים המחפשים עומק קליני",
        },
        {
          name: "הדרכת מנהיגות קלינית",
          description: "הדרכה למובילים קליניים שמנהלים צוותים ומעצבים אסטרטגיה התנהגותית.",
          includes: ["מפגשי הדרכה אסטרטגיים", "רפלקציה על מנהיגות", "ייעוץ בדינמיקת צוות", "ליווי בממשל קליני"],
          ideal: "מנהלים קליניים ומנהלי שירותים",
        },
        {
          name: "מעגלי הדרכה קבוצתיים",
          description: "הדרכה קבוצתית מונחית — מקום ללמידה הדדית, רפלקציה משותפת ופרקטיקה רפלקטיבית.",
          includes: ["מפגשים קבוצתיים חודשיים", "מסגרת רפלקציה מובנית", "דיוני מקרים בין עמיתים", "למידה מונחית"],
          ideal: "צוותים וקבוצות עמיתים המחפשים צמיחה משותפת",
        },
      ],
    },

    // Contact page
    contact: {
      tagline: "צרו קשר",
      title: "קביעת ייעוץ",
      subtitle: "ספרו לנו קצת על הצרכים שלכם ונחזור אליכם תוך 48 שעות. ללא התחייבות, ללא לחץ — רק שיחה על איך נוכל לעזור.",
      location: "מנצ'סטר, בריטניה",
      nameLabel: "שם",
      namePlaceholder: "השם שלכם",
      emailLabel: "אימייל",
      emailPlaceholder: "you@example.com",
      interestedLabel: "מתעניין/ת ב",
      selectService: "בחרו תחום שירות",
      serviceOptions: ["PBS בחינוך", "טיפול", "תמיכה משפחתית", "ארגונים", "הדרכה וליווי", "אחר"],
      messageLabel: "הודעה",
      messagePlaceholder: "ספרו לנו קצת על המצב שלכם ואיך נוכל לעזור...",
      sendButton: "שליחת הודעה",
      sending: "שולח...",
      successTitle: "ההודעה נשלחה",
      successDescription: "ניצור קשר בקרוב.",
    },

    // Login page
    login: {
      title: "התחברות",
      subtitle: "ברוכים השבים לבניין",
      emailLabel: "אימייל",
      passwordLabel: "סיסמה",
      button: "התחברות",
      loading: "מתחבר…",
      noAccount: "אין לך חשבון?",
      signUpLink: "הרשמה",
      google: "המשך עם Google",
      or: "או",
    },

    // Signup page
    signup: {
      title: "הרשמה",
      subtitle: "יצירת חשבון בניין",
      nameLabel: "שם מלא",
      emailLabel: "אימייל",
      passwordLabel: "סיסמה",
      button: "הרשמה",
      loading: "יוצר חשבון…",
      hasAccount: "כבר יש לך חשבון?",
      logInLink: "התחברות",
      successTitle: "בדקו את האימייל",
      successDescription: "שלחנו לכם קישור לאישור.",
      google: "המשך עם Google",
    },

    // Footer
    footer: {
      description: "שירותי התנהגות קליניים. בניית יכולת התנהגותית באמצעות פרקטיקה קונסטרוקציונית, אתית ומבוססת ראיות. אנחנו לא מסירים התנהגות. אנחנו בונים יכולת.",
      servicesTitle: "שירותים",
      contactTitle: "צרו קשר",
      copyright: "בניין שירותי התנהגות קליניים. כל הזכויות שמורות.",
      links: {
        education: "PBS בחינוך",
        therapy: "טיפול",
        families: "תמיכה משפחתית",
        organisations: "ארגונים",
        supervision: "הדרכה",
        bookConsultation: "קביעת ייעוץ",
      },
    },

    // Offer detail content (Hebrew uses same slugs, content in Hebrew)
    offerDetails: {
      education: [
        { slug: "whole-school-pbs", title: "עיצוב מסגרת PBS בית-ספרית", summary: "מסגרת מקיפה ומונעת ערכים שמשנה את תרבות ההתנהגות בית-ספרית מהיסוד.", description: ["תמיכה התנהגותית חיובית (PBS) ברמה בית-ספרית עוסקת ביצירת סביבה שבה כל תלמיד ואיש צוות מבין את הציפיות, הערכים והמערכות המשותפות שמנחים התנהגות.", "אנחנו עובדים לצד צוות ההנהגה הבכיר שלכם לעיצוב מסגרת PBS מותאמת אישית המשקפת את זהות בית הספר שלכם."], keyPoints: ["מבוסס על ניתוח התנהגות קונסטרוקציוני", "מעוצב עם ערכי בית הספר במרכז", "מכסה שכבות אוניברסליות, ממוקדות ואינטנסיביות", "בנוי לקיימות"], whoIsThisFor: ["בתי ספר המחפשים להחליף מערכות התנהגות ענישתיות", "בתי ספר חדשים המבססים את תרבות ההתנהגות שלהם", "מנהלים בכירים המחפשים חזון התנהגותי קוהרנטי"], outcomes: ["מסמך מסגרת PBS מקיף", "מבנה תמיכה שכבתי ברור", "צמצום הרחקות ותקריות התנהגותיות"] },
        { slug: "behaviour-policy", title: "פיתוח מדיניות התנהגות", summary: "מדיניות התנהגות מבוססת ראיות שהיא מעשית, הוגנת ומושרשת בערכי בית הספר.", description: ["מדיניות התנהגות חזקה לא יושבת במגירה — היא חיה בכל אינטראקציה, מסדרון וכיתה.", "אנחנו עוזרים לבתי ספר לפתח מדיניות התנהגות ברורה, הוגנת ומשקפת את העקרונות שהם רוצים לשמור."], keyPoints: ["משורש בעקרונות אתיים וקונסטרוקציוניים", "מעוצב בשיתוף הנהגת בית הספר", "שפה מעשית ונגישה"], whoIsThisFor: ["בתי ספר הסוקרים את מדיניות ההתנהגות שלהם", "מנהלים חדשים המבססים את חזונם"], outcomes: ["מדיניות התנהגות ברורה ומונעת ערכים", "ביטחון צוות ביישום עקבי"] },
        { slug: "fba", title: "הערכת התנהגות פונקציונלית (FBA)", summary: "הבנת התפקוד וההקשר של התנהגות לעיצוב התערבויות שבאמת עובדות.", description: ["הערכת התנהגות פונקציונלית היא אבן היסוד של תמיכה התנהגותית יעילה.", "אנחנו מבצעים FBAs מעמיקים באמצעות תצפית ישירה, ראיונות מובנים ואיסוף נתונים."], keyPoints: ["מתודולוגיית הערכה מבוססת ראיות", "מזהה תפקוד, לא רק צורת התנהגות", "מיידעת ישירות תכנון התערבות"], whoIsThisFor: ["בתי ספר התומכים בתלמידים עם התנהגות מורכבת", "רכזי שילוב המחפשים בהירות"], outcomes: ["דוח הערכת התנהגות פונקציונלית ברור", "המלצות התערבות ממוקדות"] },
        { slug: "individual-support-plans", title: "תוכניות תמיכה התנהגותית אישיות", summary: "תוכניות תמיכה התנהגותית מותאמות אישית הבונות יכולת ומקדמות כבוד.", description: ["כל אדם ראוי לתמיכה המותאמת לחוזקות, לצרכים ולהקשר הייחודיים שלו.", "אנחנו יוצרים תוכניות המתמקדות בבניית מיומנויות והתאמות סביבתיות."], keyPoints: ["ממוקד באדם ומבוסס חוזקות", "כולל אסטרטגיות פרואקטיביות וריאקטיביות", "מטרות מדידות"], whoIsThisFor: ["תלמידים עם צרכים חינוכיים מיוחדים", "ילדים ובני נוער בסיכון להרחקה"], outcomes: ["תוכנית תמיכה התנהגותית מקיפה ומותאמת אישית", "מטרות התנהגותיות מדידות"] },
        { slug: "risk-assessment", title: "תוכניות הערכת סיכונים וניהול", summary: "הערכות סיכון מידתיות ודינמיות המעדיפות בטיחות וכבוד.", description: ["הערכת סיכון אפקטיבית מאזנת בין בטיחות לזכות הפרט לכבוד, הכלה וחוויה חיובית.", "אנחנו יוצרים הערכות סיכון דינמיות המגיבות להקשרים משתנים."], keyPoints: ["מידתיות ומכבדות זכויות", "דינמיות ונסקרות באופן קבוע", "כוללות פרוטוקולי הפחתת מתח"], whoIsThisFor: ["בתי ספר המנהלים פרופילי סיכון מורכבים", "שירותים התומכים באנשים עם התנהגות מאתגרת"], outcomes: ["תיעוד הערכת סיכון ברור ומידתי", "סביבות בטוחות יותר לכולם"] },
        { slug: "staff-training", title: "הכשרת צוות ופיתוח מקצועי", summary: "פיתוח מקצועי מעשי ומרתק שמשנה את האופן שבו צוות מבין ומגיב להתנהגות.", description: ["הכשרה אפקטיבית ביותר כשהיא משנה את אופן החשיבה, לא רק מה שעושים.", "אנחנו מציעים חבילות הכשרה מותאמות הכוללות נושאים מיסודות PBS ועד FBA מתקדם."], keyPoints: ["אינטראקטיבי ומבוסס ראיות", "מותאם למסגרת ולצרכים שלכם", "ניתן להעביר כמפגשים בודדים או תוכניות"], whoIsThisFor: ["צוות הוראה ותמיכה בכל הרמות", "צוותי הנהגה בכירים"], outcomes: ["ביטחון וכשירות צוות מוגברים", "אסטרטגיות מעשיות לשימוש מיידי"] },
        { slug: "data-driven-decisions", title: "מערכות קבלת החלטות מבוססות נתונים", summary: "ניצול נתוני התנהגות ליידוע החלטות, מעקב תוצאות והוכחת השפעה.", description: ["נתונים טובים מניעים החלטות טובות.", "אנחנו עוזרים לבתי ספר לעצב ולהטמיע מערכות לאיסוף, ניתוח ושימוש בנתוני התנהגות."], keyPoints: ["מערכות איסוף נתונים מעשיות", "ניתוח ודיווח משמעותיים", "נגישות ללא-מומחים"], whoIsThisFor: ["בתי ספר שרוצים להשתמש בנתונים בצורה יעילה יותר", "מנהלים בכירים המחפשים הוכחות להשפעה"], outcomes: ["מערכת נתוני התנהגות מתפקדת", "קבלת החלטות מבוססת ראיות"] },
        { slug: "multi-disciplinary", title: "שיתוף פעולה רב-מקצועי", summary: "הנחיית שיתוף פעולה אפקטיבי בין אנשי מקצוע לתמיכה מתואמת.", description: ["התנהגות מורכבת לעיתים רחוקות נובעת מסיבה אחת או פתרון אחד.", "אנחנו מנחים שיתוף פעולה רב-מקצועי על ידי מתן מסגרת התנהגותית משותפת."], keyPoints: ["מסגרות הערכה וניסוח משותפות", "שפה משותפת בין תחומים", "מיקוד בפרט במרכז"], whoIsThisFor: ["בתי ספר העובדים עם גורמים חיצוניים", "צוותים רב-מקצועיים סביב ילד"], outcomes: ["תקשורת רב-מקצועית משופרת", "תוכניות תמיכה מתואמות וקוהרנטיות"] },
        { slug: "behaviour-strategy-slt", title: "אסטרטגיית התנהגות להנהגה", summary: "תמיכה אסטרטגית בהנהגה התנהגותית לצוותי הנהגה בכירים המובילים שינוי בית-ספרי.", description: ["מנהלים בכירים קובעים את הטון לתרבות ההתנהגות.", "אנחנו מספקים תמיכה ייעוצית אסטרטגית לעזור לצוותי הנהגה לפתח חזון התנהגותי קוהרנטי."], keyPoints: ["ייעוץ ברמה אסטרטגית", "מיושר עם תוכניות שיפור בית-ספריות", "גישה פרואקטיבית, לא ריאקטיבית"], whoIsThisFor: ["מנהלים וסגני מנהלים", "חברי הנהגה האחראים על התנהגות"], outcomes: ["אסטרטגיה התנהגותית ברורה המיושרת עם חזון בית הספר", "שיפור תרבותי מתמשך"] },
        { slug: "culture-change", title: "פרויקטי שינוי תרבות התנהגותית", summary: "פרויקטים טרנספורמטיביים שמשנים את תרבות בית הספר מענישתית לקונסטרוקציונית.", description: ["שינוי תרבות הוא העבודה השאפתנית והמשפיעה ביותר שבית ספר יכול לבצע.", "פרויקטי שינוי התרבות שלנו מעוצבים כשותפויות רב-שלביות."], keyPoints: ["שותפות רב-שלבית ומתמשכת", "מתחילה בביקורת תרבותית ועיצוב חזון", "אבני דרך ותוצאות מדידות"], whoIsThisFor: ["בתי ספר במשבר או הדורשים שיפור", "צוותי הנהגה חדשים המבססים את חזונם"], outcomes: ["תרבות התנהגות שעברה טרנספורמציה", "צמצום הרחקות ותקריות"] }
      ],
      therapy: [
        { slug: "act-therapy", title: "טיפול מבוסס ACT", summary: "טיפול קבלה ומחויבות הבונה גמישות פסיכולוגית וחיים מונעי ערכים.", description: ["ACT הוא גישה טיפולית מודרנית ומבוססת ראיות שעוזרת לאנשים לפתח גמישות פסיכולוגית.", "הגישה שלנו מבוססת ACT משולבת עם עקרונות התנהגותיים קונסטרוקציוניים."], keyPoints: ["בונה גמישות פסיכולוגית", "מונע ערכים, לא ממוקד סימפטומים", "בסיס ראיות חזק"], whoIsThisFor: ["אנשים החווים חרדה או דיכאון", "אנשים שנאבקים בדפוסי הימנעות"], outcomes: ["גמישות פסיכולוגית מוגברת", "חיבור ברור יותר לערכים אישיים"] },
        { slug: "constructional-intervention", title: "התערבות התנהגותית קונסטרוקציונית", summary: "בניית מיומנויות ורפרטוארים חדשים במקום דיכוי התנהגות קיימת.", description: ["התערבות קונסטרוקציונית היא הלב הפילוסופי של העבודה שלנו.", "גישה זו מתמקדת בזיהוי ובניית היכולות והמיומנויות שהופכות התנהגות אדפטיבית לסבירה יותר."], keyPoints: ["בונה יכולת במקום לדכא התנהגות", "מכבד אוטונומיה וכבוד הפרט", "מבוסס ראיות ואתי"], whoIsThisFor: ["אנשים עם לקויות למידה", "ילדים ובני נוער עם צרכים מיוחדים"], outcomes: ["רפרטואר התנהגותי מורחב", "מיומנויות פונקציונליות חדשות"] },
        { slug: "emotional-regulation", title: "תמיכה בוויסות רגשי", summary: "פיתוח מיומנויות להבנה, ניהול והבעת רגשות באופן אפקטיבי.", description: ["ויסות רגשי הוא היכולת לנהל ולהגיב לחוויות רגשיות בדרכים אדפטיביות.", "אנחנו לוקחים גישה הקשרית לוויסות רגשי."], keyPoints: ["הבנה הקשרית של ויסות", "אסטרטגיות מעשיות וניתנות ללימוד", "עובד עם כל מערכת התמיכה"], whoIsThisFor: ["ילדים ובני נוער עם קשיים רגשיים", "אנשים עם אוטיזם או ADHD"], outcomes: ["מודעות רגשית ואוצר מילים משופרים", "אסטרטגיות ויסות מעשיות"] },
        { slug: "parent-coaching", title: "הדרכת הורים", summary: "העצמת הורים עם הבנה, ביטחון ואסטרטגיות התנהגותיות מעשיות.", description: ["הורים הם האנשים החשובים ביותר בחיי ילדם — וסוכני השינוי החזקים ביותר.", "אנחנו לא קובעים תוכניות נוקשות. במקום זאת, אנחנו עובדים בשיתוף פעולה."], keyPoints: ["שיתופי וללא שיפוטיות", "מותאם לצרכי המשפחה", "מבוסס ראיות"], whoIsThisFor: ["הורים לילדים עם צרכים התנהגותיים", "הורים שמרגישים מוצפים"], outcomes: ["ביטחון הורי מוגבר", "אסטרטגיות מעשיות לשימוש בבית"] },
        { slug: "functional-communication", title: "אימון תקשורת פונקציונלית", summary: "לימוד מיומנויות תקשורת שמחליפות התנהגות מאתגרת בהבעה אפקטיבית.", description: ["התנהגויות רבות המתוארות כ'מאתגרות' הן למעשה תקשורת.", "אימון תקשורת פונקציונלית (FCT) מזהה את התפקוד התקשורתי של ההתנהגות."], keyPoints: ["מטפל בתפקוד ההתנהגות", "מלמד מיומנויות תקשורת חלופיות", "בסיס ראיות חזק"], whoIsThisFor: ["אנשים לא-מילוליים", "אנשים עם מצבים על הספקטרום האוטיסטי"], outcomes: ["מיומנויות תקשורת חלופיות אפקטיביות", "צמצום בהתנהגות מאתגרת"] },
        { slug: "anxiety-avoidance", title: "דפוסי חרדה והימנעות", summary: "הבנה וטיפול בהימנעות מונעת חרדה באמצעות גישות התנהגותיות הקשריות.", description: ["חרדה והימנעות עובדות יחד במעגל שמצמצם את עולמו של אדם.", "הגישה שלנו משלבת שיטות מבוססות ACT עם ניתוח התנהגותי."], keyPoints: ["הבנה הקשרית של חרדה", "חשיפה ומעורבות מונעות ערכים", "גישה הדרגתית ומלאת חמלה"], whoIsThisFor: ["אנשים עם סירוב בית-ספרי מונע חרדה", "אנשים שהחרדה שלהם מגבילה השתתפות יומית"], outcomes: ["מעורבות מוגברת בפעילויות שנמנעו", "גמישות פסיכולוגית גדולה יותר"] },
        { slug: "values-based", title: "בניית התנהגות מבוססת ערכים", summary: "עזרה לאנשים לזהות מה חשוב להם ולבנות התנהגויות המיושרות עם ערכיהם.", description: ["כששינוי התנהגות מחובר למה שמישהו באמת מעוניין בו, הוא הופך למשמעותי ובר-קיימא.", "גישה זו עוברת מעבר לציות ושליטה, ומעצימה אנשים לבחירות שמשקפות את העצמי האותנטי שלהם."], keyPoints: ["מבוסס על חקירת ערכים אישיים", "מקדם אוטונומיה וכיוון עצמי", "מתאים לכל קבוצות הגיל"], whoIsThisFor: ["צעירים המחפשים כיוון ומטרה", "אנשים שמרגישים מנותקים או תקועים"], outcomes: ["בהירות לגבי ערכים אישיים", "תחושת מטרה ומשמעות גדולה יותר"] },
        { slug: "trauma-informed", title: "תכנון התנהגות מודע טראומה", summary: "תמיכה התנהגותית שמזהה ומגיבה להשפעת הטראומה ברגישות ובמיומנות.", description: ["טראומה יכולה להשפיע עמוקות על האופן שבו אנשים תופסים, מפרשים ומגיבים לסביבתם.", "הגישה שלנו מודעת לטראומה מבטיחה שתכנון ההתנהגות תמיד מתחשב בהשפעה הפוטנציאלית של טראומה."], keyPoints: ["מזהה את השפעת הטראומה על ההתנהגות", "מעדיף בטיחות ואמון", "נמנע מטראומטיזציה מחדש"], whoIsThisFor: ["אנשים עם היסטוריות טראומה ידועות או חשודות", "ילדים באומנה או עם חוויית טיפול"], outcomes: ["תוכניות התנהגות רגישות לטראומה", "תמיכה יעילה ובת-קיימא יותר"] }
      ],
      families: [
        { slug: "home-assessment", title: "הערכה התנהגותית בבית", summary: "הערכה מעמיקה בסביבת הבית להבנת התנהגות בהקשר הטבעי שלה.", description: ["התנהגות לא קורית בחלל ריק — היא קורית בהקשר העשיר והמורכב של חיי הבית.", "הערכה ביתית מאפשרת לנו לצפות בהתנהגות בסביבה שבה היא מתרחשת באופן טבעי."], keyPoints: ["הערכה בסביבה הטבעית", "צופה בשגרות ואינטראקציות אמיתיות", "לא שיפוטית ותומכת"], whoIsThisFor: ["משפחות החוות קשיים התנהגותיים בבית", "הורים המחפשים בהירות לגבי צרכי ילדם"], outcomes: ["הבנה ברורה של התנהגות בהקשר", "המלצות מעשיות וישימות"] },
        { slug: "parent-strategy", title: "הדרכת אסטרטגיות להורים", summary: "הדרכה ממוקדת לעזור להורים לפתח וליישם אסטרטגיות התנהגותיות אפקטיביות בבית.", description: ["הדרכת אסטרטגיות להורים חורגת מעבר לעצות כלליות.", "כל מפגש הדרכה מתמקד בהבנת אתגר מסוים, פיתוח אסטרטגיה ותרגול יישום."], keyPoints: ["פיתוח אסטרטגיות ספציפיות ומעשיות", "שיתופי ומעצים", "סקירה והתאמה מתמשכת"], whoIsThisFor: ["הורים שרוצים אסטרטגיות מעשיות להתנהגויות ספציפיות", "הורים לילדים עם צרכים מיוחדים"], outcomes: ["רפרטואר של אסטרטגיות מעשיות", "ביטחון הורי מוגבר"] },
        { slug: "sibling-dynamics", title: "תמיכה בדינמיקת אחים", summary: "תמיכה במשפחות לניווט הדינמיקה המורכבת בין אחים, במיוחד כשלילד אחד יש צרכים נוספים.", description: ["כשלילד אחד במשפחה יש צרכים התנהגותיים משמעותיים, יחסי אחים יכולים להפוך למתוחים.", "אנחנו עוזרים למשפחות להבין ולטפל בדינמיקת אחים ברגישות."], keyPoints: ["מטפל בכל המערכת המשפחתית", "תומך בצרכים הרגשיים של אחים", "מקדם יחסי אחים חיוביים"], whoIsThisFor: ["משפחות שבהן לילד אחד יש צרכים מיוחדים", "משפחות החוות קונפליקט בין אחים"], outcomes: ["יחסי אחים משופרים", "הפחתת קונפליקט משפחתי"] },
        { slug: "consistency-planning", title: "תכנון עקביות", summary: "יצירת שגרות ותגובות עקביות וצפויות התומכות בהתנהגות חיובית.", description: ["עקביות היא אחד הכלים החזקים ביותר בתמיכה התנהגותית.", "אנחנו עוזרים למשפחות לפתח תוכניות עקביות המכסות שגרות יומיות וציפיות התנהגותיות."], keyPoints: ["שגרות וציפיות ברורות ומעשיות", "תגובות מיושרות בין מטפלים", "גמיש וריאליסטי לחיי המשפחה"], whoIsThisFor: ["משפחות שנאבקות בתגובות לא עקביות", "משפחות מפוצלות הזקוקות ליישור"], outcomes: ["ציפיות ברורות ומשותפות בבית", "סביבה ביתית צפויה ושקטה יותר"] },
        { slug: "home-school-alignment", title: "התאמה בית-ספר-בית", summary: "גישור על הפער בין בית לבית ספר ליצירת תמיכה עקבית בין מסגרות.", description: ["ילדים עוברים בין בית ובית ספר כל יום.", "אנחנו עובדים עם משפחות ובתי ספר יחד ליישר גישות ולשתף מידע."], keyPoints: ["מגשר על גישות בית ובית ספר", "מנחה תקשורת אפקטיבית", "שם את הילד במרכז"], whoIsThisFor: ["משפחות שמרגישות מנותקות מבית הספר של ילדן", "ילדים החווים חוסר עקביות בין מסגרות"], outcomes: ["גישות מיושרות בין בית ובית ספר", "חוויה עקבית יותר עבור הילד"] },
        { slug: "crisis-planning", title: "תכנון משבר ואסטרטגיות הפחתת מתח", summary: "הכנת משפחות עם אסטרטגיות ברורות ורגועות לניהול מצבי משבר בבטחה.", description: ["משברים קורים. כשהם מתרחשים, תוכנית ברורה יכולה לעשות את ההבדל.", "אנחנו מפתחים תוכניות משבר מותאמות אישית הכוללות סימני אזהרה מוקדמים ואסטרטגיות הפחתת מתח."], keyPoints: ["תכנון משבר מותאם אישית", "טכניקות הפחתת מתח מעשיות", "ממוקד בטיחות ומודע טראומה"], whoIsThisFor: ["משפחות המנהלות משברים התנהגותיים תכופים או אינטנסיביים", "הורים שמרגישים לא בטוחים במהלך תקריות"], outcomes: ["תוכנית משבר ברורה ומותאמת אישית", "ביטחון בטכניקות הפחתת מתח"] }
      ],
      organisations: [
        { slug: "obm", title: "ניהול התנהגות ארגוני (OBM)", summary: "יישום מדע ההתנהגות לשיפור ביצועים, תרבות ורווחה ארגוניים.", description: ["OBM מיישם את עקרונות ניתוח ההתנהגות לשיפור תפקוד ארגונים.", "אנחנו עוזרים לארגונים להבין את המניעים ההתנהגותיים מאחורי ביצועים, מעורבות ותרבות."], keyPoints: ["גישה מבוססת ראיות לביצועים ארגוניים", "ניתוח והתערבות מונעי נתונים", "חשיבה ברמת מערכות"], whoIsThisFor: ["ארגונים המחפשים שיפור ביצועים", "צוותי משאבי אנוש ואנשים"], outcomes: ["מדדי ביצועים ארגוניים משופרים", "שיפור תרבותי בר-קיימא"] },
        { slug: "behaviour-strategy", title: "עיצוב אסטרטגיית התנהגות", summary: "עיצוב משותף של אסטרטגיות התנהגות ארגוניות המיושרות עם המשימה שלכם.", description: ["אסטרטגיית התנהגות נותנת לארגון שלכם גישה קוהרנטית ומבוססת ראיות.", "התהליך שלנו כולל ייעוץ עם בעלי עניין, ניתוח סביבתי וסדנאות עיצוב משותף."], keyPoints: ["מעוצב בשיתוף צוות ההנהגה", "כולל תכנון יישום", "תוצאות מדידות"], whoIsThisFor: ["ארגונים ללא גישה התנהגותית קוהרנטית", "צוותי הנהגה המחפשים בהירות אסטרטגית"], outcomes: ["מסמך אסטרטגיית התנהגות מקיף", "מפת דרכים ליישום ברורה"] },
        { slug: "culture-change", title: "פרויקטי שינוי תרבותי", summary: "פרויקטים מתמשכים ומבוססי ראיות שמשנים תרבות ארגונית מריאקטיבית לקונסטרוקציונית.", description: ["תרבות ארגונית היא סכום אלפי אינטראקציות, החלטות והרגלים יומיים.", "פרויקטי שינוי התרבות שלנו מעוצבים כשותפויות ארוכות טווח."], keyPoints: ["שותפות ארוכת טווח ומתמשכת", "הערכת תרבות מבוססת ראיות", "מדדי תרבות מדידים"], whoIsThisFor: ["ארגונים במשבר או מול לחץ רגולטורי", "ארגונים גדלים שבונים את תרבותם מאפס"], outcomes: ["שינוי תרבותי מדיד", "שיפור שביעות רצון ושימור צוות"] },
        { slug: "staff-performance", title: "מערכות ביצועי צוות", summary: "עיצוב מערכות שתומכות, מניעות ומפתחות ביצועי צוות באמצעות מדע ההתנהגות.", description: ["ניהול ביצועים מסורתי מסתמך לעיתים על סקירות שנתיות ואמצעים ענישתיים.", "אנחנו עוזרים לארגונים לעצב מערכות ביצועים הכוללות ציפיות ברורות, משוב סדיר ותגמול משמעותי."], keyPoints: ["מבוסס עקרונות מדע ההתנהגות", "ממוקד חיזוק חיובי", "תומך בפיתוח, לא רק בציות"], whoIsThisFor: ["ארגונים הסוקרים את ניהול הביצועים שלהם", "מנהלים שרוצים לשפר ביצועי צוות"], outcomes: ["מערכת ביצועים מודרנית ומבוססת ראיות", "מעורבות ומוטיבציה משופרת של צוות"] },
        { slug: "risk-governance", title: "מסגרות ממשל סיכונים", summary: "בניית מסגרות ממשל חזקות לניהול סיכון התנהגותי בארגון.", description: ["ממשל סיכונים אפקטיבי מבטיח שסיכון התנהגותי מזוהה, מוערך, מנוהל ומנוטר.", "אנחנו עוזרים לארגונים לעצב מסגרות ממשל סיכונים שהן מידתיות ומעשיות."], keyPoints: ["מבני ממשל מקיפים", "מידתיים ומעשיים", "עומדים בדרישות רגולטוריות"], whoIsThisFor: ["שירותים המנהלים סיכון התנהגותי באופן יומי", "ארגונים המתכוננים לפיקוח או ביקורת"], outcomes: ["מסגרת ממשל סיכונים חזקה", "בטיחות ואיכות משופרים"] },
        { slug: "clinical-governance", title: "מבני ממשל קליני", summary: "הקמת ממשל קליני שמבטיח איכות, בטיחות ופרקטיקה אתית.", description: ["ממשל קליני הוא המסגרת שדרכה ארגונים מבטיחים את איכות ובטיחות הפרקטיקה הקלינית.", "אנחנו עוזרים לארגונים לעצב ולהטמיע מבני ממשל קליני."], keyPoints: ["עיצוב ממשל קליני מקיף", "מבני הדרכה ואבטחת איכות", "שילוב פיתוח מקצועי"], whoIsThisFor: ["ספקי טיפול ושירותים קליניים", "ארגונים הסוקרים ממשל קיים"], outcomes: ["מסגרת ממשל קליני מתפקדת", "תוצאות קליניות ואחריותיות משופרות"] },
        { slug: "safeguarding-audits", title: "ביקורות הגנה והתנהגות", summary: "ביקורות עצמאיות המעריכות את איכות ובטיחות הפרקטיקות ההתנהגותיות ומערכות ההגנה.", description: ["ביקורת סדירה חיונית לשמירה על איכות.", "אנחנו סוקרים תיעוד, צופים בפרקטיקה, מראיינים צוות ומשווים לסטנדרטים."], keyPoints: ["הערכה עצמאית ומומחית", "ממצאים והמלצות ברורים", "ניתן לביצוע חד-פעמי או שוטף"], whoIsThisFor: ["ארגונים המתכוננים לפיקוח", "שירותים שרוצים אבטחת איכות עצמאית"], outcomes: ["דוח ביקורת מקיף", "עדיפויות ברורות לשיפור"] },
        { slug: "behaviour-data", title: "מערכות נתוני התנהגות", summary: "עיצוב והטמעה של מערכות לאיסוף, ניתוח ושימוש יעיל בנתוני התנהגות.", description: ["נתונים בעלי ערך רק אם הם נאספים היטב, מנותחים בצורה משמעותית ומשמשים להנעת החלטות.", "אנחנו עוזרים לארגונים לעצב ולהטמיע מערכות נתוני התנהגות."], keyPoints: ["מערכות נתונים מעשיות וממוקדות מטרה", "הכשרת צוות בשימוש בנתונים", "מותאם לצרכי הארגון"], whoIsThisFor: ["ארגונים שרוצים לשפר את איכות הנתונים", "צוותי אבטחת איכות וממשל"], outcomes: ["מערכת נתוני התנהגות מתפקדת", "שיפור שירות מבוסס ראיות"] }
      ],
      supervision: [
        { slug: "ukba-supervision", title: "הדרכת UKBA", summary: "הדרכה מובנית העומדת בדרישות UKBA לרישום ולהתפתחות מקצועית מתמשכת.", description: ["הדרכת UKBA היא דרישה למטפלים המבקשים רישום או שומרים על מעמדם המקצועי. ההדרכה שלנו עומדת בכל הסטנדרטים ומספקת את המסגרת שצריך כדי לגדול בביטחון.", "המפגשים כוללים דיון בעבודת מקרים, ליבון אתי ותכנון התפתחות מקצועית, עם משוב כתוב סדיר לתיק הרישום שלך.", "הגישה שלנו להדרכה היא שיתופית, רפלקטיבית וקונסטרוקציונית — אנחנו בונים יחד את היכולות שלך, לא רק מודדים אותן."], keyPoints: ["עומד בדרישות UKBA במלואן", "פיתוח כשירויות מובנה", "גישה רפלקטיבית וקונסטרוקציונית"], whoIsThisFor: ["מטפלים בדרך לרישום UKBA", "מטפלים רשומים השומרים על CPD"], outcomes: ["תיעוד הדרכה תואם UKBA", "צמיחה מקצועית וביטחון בקליניקה"] },
        { slug: "case-formulation", title: "הדרכה לניסוח קליני", summary: "הדרכה ממוקדת בפיתוח חשיבה קלינית מעמיקה ויכולת ניסוח מקרים מתוחכמת.", description: ["ניסוח קליני הוא האמנות והמדע של הבנת התנהגות בהקשר המלא שלה — ההיסטוריה, הסביבה והערכים של האדם.", "בהדרכה זו אנחנו עובדים יחד על פיתוח ניסוחים מורכבים יותר שמובילים להתערבויות מדויקות ומכבדות יותר. זה עניין של חשיבה קלינית — לא רק של פתרון מקרה בודד."], keyPoints: ["מפתח חשיבה ויכולת ניסוח מתקדמת", "עבודה על מקרים אמיתיים מהקליניקה שלך", "מחזק את האינטואיציה הקלינית"], whoIsThisFor: ["מטפלים שרוצים להעמיק את הניסוח שלהם", "מנתחי התנהגות העובדים עם מקרים מורכבים"], outcomes: ["ניסוחים קליניים עשירים ומדויקים יותר", "ביטחון בעבודה עם מורכבות"] },
        { slug: "constructional-mentoring", title: "חונכות בגישה הקונסטרוקציונית", summary: "חונכות אישית למטפלים שלומדים להטמיע את הגישה הקונסטרוקציונית בעבודתם.", description: ["הגישה הקונסטרוקציונית היא שינוי תודעה — לא להסיר התנהגות, אלא לבנות יכולת.", "תוכנית החונכות שלנו מלווה מטפלים בתהליך ההטמעה, שלב אחר שלב, על מקרים אמיתיים מהפרקטיקה שלהם."], keyPoints: ["מתמקד בפילוסופיה ובפרקטיקה הקונסטרוקציונית", "יישום על מקרים אמיתיים", "משנה את כיוון הפרקטיקה"], whoIsThisFor: ["מטפלים חדשים לגישה הקונסטרוקציונית", "מנתחים מנוסים המחפשים עומק פילוסופי"], outcomes: ["הבנה עמוקה של עקרונות קונסטרוקציוניים", "פרקטיקה אתית ומכבדת יותר"] },
        { slug: "act-integration", title: "ליווי בשילוב ACT", summary: "ליווי למטפלים המשלבים טיפול קבלה ומחויבות (ACT) בעבודתם ההתנהגותית.", description: ["ל-ACT ולניתוח התנהגות שורשים משותפים במדע ההתנהגות — אבל השילוב בקליניקה דורש תרגול וליווי.", "אנחנו מלווים מטפלים בהבאת תהליכי ACT לפרקטיקה הקיימת שלהם, באופן בטוח, יישומי וקוהרנטי."], keyPoints: ["מגשר בין ACT לבין ABA", "מיקוד ביישום מעשי בקליניקה", "מרחיב את הרפרטואר הטיפולי"], whoIsThisFor: ["מנתחי התנהגות שרוצים להשתמש ב-ACT", "מטפלים המחפשים גישה משולבת"], outcomes: ["שילוב בטוח של ACT בפרקטיקה", "תוצאות עמוקות יותר עם מטופלים"] },
        { slug: "ethical-consultation", title: "ייעוץ אתי", summary: "מרחב סודי לליבון דילמות אתיות, החלטות מורכבות ופרקטיקה מיושרת ערכים.", description: ["פרקטיקה אתית כמעט אף פעם לא פשוטה. לפעמים נכון לעצור, להתייעץ ולחשוב יחד.", "שירות הייעוץ האתי שלנו מספק מרחב חסוי — פרטני או צוותי — לליבון דילמות שדורשות מחשבה."], keyPoints: ["מרחב סודי וללא שיפוטיות", "ייעוץ פרטני או צוותי", "מחזק תרבות של פרקטיקה אתית"], whoIsThisFor: ["מטפלים מול דילמה אתית", "צוותים שמתמודדים עם מצבים מורכבים"], outcomes: ["בהירות בקבלת החלטות אתיות", "ביטחון מקצועי בהתמודדות עם מורכבות"] },
        { slug: "practitioner-development", title: "מסלולי התפתחות מקצועית", summary: "תוכניות התפתחות מובנות שמלוות מטפלים מהיסודות ועד לפרקטיקה מתקדמת.", description: ["התפתחות מקצועית בניתוח התנהגות היא מסע — לא רשימת קורסים.", "אנחנו מעצבים תוכניות אישיות שמשלבות הדרכה, חונכות ולמידה התנסותית, מותאמות לשלב שבו את/ה נמצא/ת."], keyPoints: ["תוכנית מובנית ואישית", "מיושרת עם סטנדרטים מקצועיים", "משלבת הדרכה, הכשרה וחונכות"], whoIsThisFor: ["מטפלים בתחילת הקריירה", "מטפלים באמצע הקריירה המחפשים התקדמות"], outcomes: ["מפת דרכים מקצועית ברורה", "ביטחון וזהות מקצועיים מתחזקים"] },
        { slug: "reflective-practice", title: "קבוצות פרקטיקה רפלקטיבית", summary: "מפגשי קבוצה מונחים שמטפחים למידה הדדית, רפלקציה משותפת וצמיחה מקצועית.", description: ["פרקטיקה רפלקטיבית היא חיונית לאיכות העבודה ולמניעת שחיקה — אבל קשה לקיים אותה לבד.", "הקבוצות שלנו מציעות מרחב מובנה ומונחה לחשיבה משותפת ולתמיכה הדדית בין עמיתים."], keyPoints: ["מסגרת מונחית ובטוחה", "למידה ותמיכה הדדית", "אנטידוט לבידוד מקצועי ולשחיקה"], whoIsThisFor: ["צוותי מטפלים בשירותים התנהגותיים", "מטפלים עצמאיים המחפשים חיבור עמיתים"], outcomes: ["חוסן ופרקטיקה רפלקטיבית מעמיקים", "פחות בידוד, יותר חיוניות מקצועית"] }
      ]
    },

    // Portal translations
    portal: {
      portal: "פורטל",
      logOut: "התנתק",
      welcome: "ברוך שובך",
      dashboardSubtitle: "הפורטל שלך",
      booking: "קביעת פגישה",
      messages: "הודעות",
      resources: "ספריית משאבים",
      aiChat: "עוזר AI",
      upcoming: "פגישות קרובות",
      noSessions: "אין פגישות קרובות. קבע אחת כדי להתחיל.",
      bookNew: "קביעת פגישה",
      resourceLibrary: "ספריית משאבים",
      resourceSubtitle: "מאמרים, מדריכים וחומרים לתמיכה במסע שלך.",
      noResources: "עדיין אין משאבים זמינים.",
      messagesTitle: "הודעות",
      messagesSubtitle: "תקשורת מאובטחת עם המטפל שלך.",
      noMessages: "אין הודעות עדיין. התחל שיחה.",
      typeMessage: "כתוב הודעה...",
      bookSession: "קביעת פגישה",
      bookSubtitle: "בחר זמן שמתאים לך.",
      sessionType: "סוג פגישה",
      selectType: "בחר סוג",
      date: "תאריך",
      time: "שעה",
      duration: "משך",
      notes: "הערות (אופציונלי)",
      notesPlaceholder: "משהו שתרצה לדון בו...",
      confirmBooking: "אישור הזמנה",
      bookingSuccess: "הפגישה נקבעה!",
      bookingConfirmed: "הפגישה נקבעה",
      bookingConfirmedText: "נאשר את הפגישה בהקדם.",
      bookAnother: "קבע פגישה נוספת",
      aiAssistant: "עוזר AI",
      aiSubtitle: "שאל שאלות על השירותים שלנו, גישות התנהגותיות או הדרכה כללית.",
      aiWelcome: "שלום! אני העוזר של בניין. איך אוכל לעזור לך?",
      askAnything: "שאל כל דבר...",
    },

    // About page
    about: {
      tagline: "אודותינו",
      title: "בניין — שירותי התנהגות קליניים",
      subtitle: "ניתוח התנהגות קונסטרוקציוני לחינוך, משפחות, טיפול וארגונים. מבוסס אתיקה. מונע על ידי ראיות. בנוי להחזיק מעמד.",
      missionTitle: "המשימה שלנו",
      missionText: "המשימה של בניין היא לתמוך באנשים, משפחות, בתי ספר וארגונים לבנות יכולת באמצעות פרקטיקה התנהגותית קונסטרוקציונית, אתית ומבוססת ראיות. אנו שואפים לנצל את הכישורים והתשוקה שלנו לעבודה עם אנשים כדי לעודד ולעזור להם לגלות את המוטיבציה שלהם להשיג את הפוטנציאל הגבוה ביותר שלהם.",
      specialisationsTitle: "יישומי ניתוח התנהגות",
      specialisationsSubtitle: "תחומי ניתוח ההתנהגות שבניין מתמחה בהם:",
      specialisations: [
        "PBS בחינוך (כלל בית-ספרי ואישי)",
        "טיפול והתערבות מבוססי ACT",
        "תמיכה משפחתית והדרכת הורים",
        "ניהול התנהגות ארגונית (OBM)",
        "הנחיה למקצוענים בתחום ההתנהגות",
      ],
      valuesTitle: "הערכים שלנו",
      values: [
        { title: "קונסטרוקציוני", description: "אנחנו בונים יכולת במקום לדכא התנהגות. כל התערבות מוסיפה לרפרטואר של האדם." },
        { title: "אתי", description: "כבוד, הסכמה וכבוד הם בלתי ניתנים למשא ומתן בכל מה שאנחנו עושים." },
        { title: "מבוסס ראיות", description: "הפרקטיקה שלנו מבוססת על מדע ניתוח ההתנהגות ומוערכת באופן מתמיד." },
        { title: "שיתופי", description: "אנחנו עובדים עם אנשים, לא עליהם. שותפות היא בלב השינוי המתמשך." },
      ],
      teamTitle: "הכירו את הצוות",
      teamSubtitle: "מקצוענים מסורים המחויבים לבניית יכולת באמצעות מדע ההתנהגות.",
      team: [
        { name: "אדם דיין", role: "מנהל ומנתח התנהגות קליני", bio: "MSc ניתוח התנהגות יישומי, UKBA (Cert). מעל 15 שנות ניסיון בחינוך, טיפול והתנהגות ארגונית.", initials: "אד", slug: "adam-dayan" },
        { name: "בריוני פירסון", role: "מטפלת ומחנכת", bio: "מורה מוסמכת (QTS) הלומדת תואר שני ב-ABA באוניברסיטת בנגור. מחנכת ומטפלת מצטיינת המגשרת בין הכיתה לפרקטיקה הקלינית.", initials: "בפ", slug: "brionny-pearson" },
      ],
      ctaTitle: "בואו נתחיל שיחה",
      ctaText: "בין אם אתם בית ספר, משפחה, ארגון או מטפל — אנחנו כאן לעזור לבנות יכולת.",
      ctaButton: "קביעת ייעוץ",
    },
    
    portalDashboard: {
      goodMorning: "בוקר טוב",
      goodAfternoon: "צהריים טובים",
      goodEvening: "ערב טוב",
      messages: "הודעות",
      bookSession: "קביעת פגישה",
      sessionsAhead: "פגישות קרובות",
      nextSession: "הבאה",
      noneScheduled: "לא נקבעו",
      pendingTasks: "משימות ממתינות",
      tasksDone: "{{completed}} מתוך {{total}} בוצעו",
      documents: "מסמכים",
      sharedSecurely: "שותפו בטחה",
      viewArrow: "צפייה ←",
      upcomingSessions: "פגישות עתידיות",
      viewCalendar: "ללוח השנה",
      noSessionsYet: "אין עדיין פגישות",
      bookFirstSession: "קבעו את הפגישה הראשונה שלכם כדי להתחיל.",
      bookASession: "קבע פגישה",
      session: "פגישה",
      today: "היום",
      tomorrow: "מחר",
      inDays: "בעוד {{days}}ימים",
      bookAnotherSession: "קביעת פגישה נוספת",
      myTasks: "המשימות שלי",
      allCaughtUp: "הכל הועלה!",
      tasksFromTherapist: "משימות מהמטפל יופיעו כאן.",
      due: "עד ל",
      quickActions: "פעולות מהירות",
      jumpToSection: "מעבר למדור",
      chatWithTherapist: "צ'אט עם המטפל",
      unread: "הודעות חדשות",
      resources: "משאבים",
      notesAndMaterials: "סיכומים וחומרים",
      toolkit: "ארגז כלים",
      exercisesAndTools: "תרגילים וכלים",
      taskBoard: "לוח משימות",
      allTasksAndCalendar: "כל המשימות ויומן",
      sharedFiles: "קבצים ששותפו עם המטפל",
      upload: "העלאה",
      uploading: "מעלה...",
      noDocumentsYet: "אין מסמכים עדיין",
      uploadFilesToShare: "העלאת קבצים לשיתוף מאובטח עם המטפל.",
      needHelp: "צריכים עזרה?",
      unreadWaiting: "הודעות חדשות",
      allRead: "הכל נקרא",
    },
    
    settings: {
      title: "הגדרות",
      subtitle: "ההעדפות שלכם נשמרות באופן אוטומטי.",
      appearance: "מראה",
      theme: "ערכת נושא",
      systemDefault: "ברירת מחדל של המערכת",
      light: "בהיר",
      dark: "כהה",
      languageCard: "שפה",
      languageSelect: "בחירת שפה",
      en: "English (אנגלית)",
      he: "עברית",
      notificationChannels: "ערוצי התראות",
      notificationDesc: "בחרו כיצד תרצו לקבל התראות ועדכונים.",
      notifyInApp: "התראות בתוך האפליקציה",
      notifyEmail: "התראות באימייל",
      notifyTelegram: "התראות בטלגרם",
      notifyPush: "התראות דחיפה בדפדפן (Push)",
      mobile: "מובייל",
      bottomNav: "סרגל ניווט תחתון",
      bottomNavDesc: "הצג סרגל ניווט צף בתחתית המסך.",
      dashboardLayout: "פריסת לוח הבקרה",
      dashboardDesc: "בחרו אילו ווידג'טים יופיעו בלוח הבקרה שלכם.",
      widgetTasks: "המשימות שלי",
      widgetCalendar: "לוח שנה",
      widgetMessages: "הודעות",
      widgetLinear: "משימות תרגול (ליניארי)",
      widgetNotifications: "התראות אחרונות",
    },
    
    portalBooking: {
      bookingConfirmed: "הפגישה נקבעה",
      bookingConfirmedText: "התשלום התקבל ואנו נאשר את הפגישה שלכם בהקדם.",
      bookAnother: "קביעת פגישה נוספת",
      paymentCancelled: "התשלום בוטל",
      paymentCancelledText: "התשלום לא הושלם. תוכלו לנסות שוב למטה.",
      tryAgain: "נסה שוב",
      bookASession: "קבע פגישה",
      bookSubtitle: "בחרו שירות, תאריך ושעה רצויה.",
      step1: "1. בחירת שירות",
      minutes: "דקות",
      step2: "2. בחירת תאריך",
      step3: "3. בחירת שעה",
      stepPlatform: "4. אופן הפגישה",
      platformInPerson: "פגישה פיזית",
      platformZoom: "Zoom",
      platformTeams: "Microsoft Teams",
      platformMeet: "Google Meet",
      platformHint: "קישור לפגישה ייווצר אוטומטית עבור פגישות וירטואליות.",
      step4: "5. הערות נוספות (אופציונלי)",
      notesPlaceholder: "כל דבר שתרצו לדון בו...",
      redirecting: "מעביר לתשלום...",
      payAndBook: "תשלום £{{price}} וקביעת פגישה",
      booking: "קובע...",
      confirmBooking: "אישור הפגישה",
      bookingSuccess: "הפגישה נקבעה בהצלחה!",
    },
    
    portalMessages: {
      messagesTitle: "הודעות",
      searchPlaceholder: "חיפוש או התחלת צ'אט חדש...",
      startConversation: "התחל צ'אט",
      noUsersFound: "לא נמצאו משתמשים",
      noConversationsYet: "אין שיחות עדיין",
      startNewChat: "צור שיחה חדשה",
      selectConversation: "בחר שיחה כדי להתחיל להתכתב",
      typing: "מקליד/ה...",
      online: "מחובר",
      noMessagesYet: "אין הודעות עדיין. תגידו שלום!",
      typeMessage: "הקלד הודעה...",
    },
    
    portalResources: {
      resourceLibrary: "ספריית משאבים",
      resourceSubtitle: "מאמרים, מדריכים וחומרים שילוו אתכם בתהליך.",
      noResources: "אין משאבים זמינים עדיין.",
      uploadResourceTitle: "העלאת משאב חדש",
      uploadResourceBtn: "העלאת משאב",
      titleLbl: "כותרת",
      titlePlaceholder: "כותרת המשאב",
      descriptionLbl: "תיאור",
      descriptionPlaceholder: "תיאור קצר",
      categoryLbl: "קטגוריה",
      fileLbl: "קובץ (אופציונלי)",
      fileHint: "PDF, Word, Images, Excel, PowerPoint (עד 10 מגה)",
      urlLbl: "קישור חיצוני (אופציונלי)",
      uploadingBtn: "מעלה...",
      uploadFirst: "העלו את המשאב הראשון שלכם",
      downloadBtn: "הורדה",
      viewBtn: "צפייה",
    },
    
    portalToolkit: {
      toolkitTitle: "ארגז הכלים",
      toolkitSubtitle: "כלים פסיכולוגיים לתמיכה במיקוד וברווחה הנפשית שלך.",
      actMatrix: "ACT Matrix (מטריצת אקט)",
      actMatrixDesc: "מיפוי ערכים, חסמים ומחויבויות לפעולה באמצעות מודל ה-ACT.",
      pomodoro: "טיימר פומודורו",
      pomodoroDesc: "שמירה על ריכוז בעזרת אינטרוולים של עבודה ומנוחה מתוזמנים.",
      mindfulness: "צלילי מיינדפולנס",
      mindfulnessDesc: "צלילי טבע להרפיה, רגיעה ותרגילי נשימה מודעים.",
    },
    
    portalMindfulness: {
      fireTitle: "אש מתפצפצת",
      fireDesc: "להבות אש חמימות ומרגיעות",
      windTitle: "רוח קלה",
      windDesc: "משב רוח עדין בין העצים",
      waterTitle: "פלג מים",
      waterDesc: "זרימת מים הררית מרגיעה",
      rainTitle: "גשם טיפות",
      rainDesc: "טיפות גשם קלות על עלים",
      forestTitle: "אוויר יער",
      forestDesc: "ציוץ ציפורים ורשרוש עלים",
      title: "צלילי מיינדפולנס",
      subtitle: "קח רגע. נשום. הקשב.",
      duration: "משך זמן:",
      min: "דקות",
      playing: "מנגן",
      footerNote: "צלילים אלו מסונתזים ונוצרים בזמן אמת היישר על הדפדפן שלך. אין צורך בחיבור אינטרנט לאחר הטעינה. מצא תנוחה נוחה, עצום עיניים והתרכז בנשימה.",
    },
    
    portalProductivity: {
      title: "מרכז משימות וניהול (Productivity Hub)",
      subtitle: "לנהל משימות, לתכנן את היום בעזרת AI, ולהישאר ממוקדים - הכל במקום אחד.",
      board: "לוח משימות",
      calendar: "לוח שנה",
    },
    
    portalPomodoro: {
      title: "טיימר פומודורו",
      subtitle: "שמרו על ריכוז בעזרת עבודה במקטעים והפסקות מתוזמנות.",
      backToToolkit: "חזרה לארגז הכלים",
      focus: "ריכוז",
      shortBreak: "הפסקה קצרה",
      longBreak: "הפסקה ארוכה",
      completed: "הושלמו:",
      timerSettings: "הגדרות טיימר",
      focusDuration: "זמן ריכוז: {{min}} דקות",
      shortBreakDuration: "הפסקה קצרה: {{min}} דקות",
      longBreakDuration: "הפסקה ארוכה: {{min}} דקות",
      longBreakEvery: "הפסקה ארוכה כל {{count}} מחזורים",
      autoStartBreaks: "התחלת הפסקות אוטומטית",
      autoStartFocus: "התחלת ריכוז אוטומטית",
      soundNotification: "התראות צליל",
    },
    
    portalACT: {
      title: "מטריצת אקט (ACT Matrix)",
      subtitle: "מיפוי ערכים, חסמים ומחויבויות לפעולה.",
      backToToolkit: "חזרה לארגז הכלים",
      towardActions: "פעולות מקדמות",
      towardActionsPrompt: "אילו פעולות הנראות לעין ניתן לעשות כדי להתקרב לערכים שלך, גם כשעולות מחשבות קשות?",
      awayBehaviours: "התנהגויות הימנעות",
      awayBehavioursPrompt: "אילו דברים הנראים לעין את/ה עושה כדי לברוח או להימנע מהמחשבות והרגשות הללו?",
      values: "ערכים",
      valuesPrompt: "מי ומה חשוב לך באמת? מה יקר לליבך?",
      internalObstacles: "חסמים פנימיים",
      internalObstaclesPrompt: "אילו מחשבות קשות, רגשות, זכרונות או תחושות מפריעים בדרך?",
      viewMatrix: "מטריצה",
      viewVoice: "הדרכה קולית",
      viewHistory: "היסטוריה",
      observableBehaviour: "התנהגות חיצונית הנראית לעין ↑",
      awayToward: "← התרחקות   |   התקרבות →",
      innerExperience: "↓ חוויה פנימית (מחשבות ורגשות)",
      notes: "הערות",
      notesPlaceholder: "הערות או תצפיות נוספות...",
      typeOrSpeak: "הקלד או דבר מלא...",
      typeOrMic: "הקלד או השתמש במיקרופון...",
      saveEntry: "שמירה",
      progressOverview: "סקירת התקדמות",
      entriesTotal: "רשומות סך הכל",
      latest: "אחרון: ",
      noEntries: "אין רשומות עדיין.",
    },
    
    staffClinical: {
      client: "מטופל",
      selectClientFirst: "יש לבחור מטופל תחילה",
      failedToSave: "השמירה נכשלה",
      saving: "שומר...",
      notes: "הערות",
      additionalNotes: "הערות נוספות",
      entryHistory: "היסטוריית רישומים",
      
      abcTitle: "גיליון נתוני ABC",
      abcDesc: "רישום אירוע מקדים - התנהגות - תוצאה לניתוח פונקציונלי",
      dateTime: "תאריך ושעה",
      settingContext: "הקשר / סביבה",
      settingPlaceholder: "למשל כיתה, בית, שעת טיפול...",
      antecedentLbl: "א - אירוע מקדים",
      antecedentPlaceholder: "מה קרה בדיוק לפני ההתנהגות?",
      behaviourLbl: "ב - התנהגות",
      behaviourPlaceholder: "תאר את ההתנהגות באופן מדיד ונראה לעין",
      consequenceLbl: "ג - תוצאה",
      consequencePlaceholder: "מה קרה מיד אחרי ההתנהגות?",
      functionHypothesis: "השערת פונקציה",
      functionPlaceholder: "השערה: תשומת לב, בריחה, גישה לחפץ מוחשי, חושי...",
      submitAbc: "שלח גיליון ABC",
      abcSaved: "נתוני ABC נשמרו",
      fillAbc: "חובה למלא את שדות א, ב ו-ג",
      
      logTitle: "יומן מעקב התנהגות",
      logDesc: "מעקב יומי על תדירות, עצימות והקשר על התנהגויות מטרה",
      targetBehaviour: "התנהגות מטרה",
      frequencyCount: "תדירות (כמות)",
      durationMinutes: "משך (בדקות)",
      intensity: "עצימות / אינטנסיביות",
      moodBefore: "מצב רוח לפני",
      moodAfter: "מצב רוח אחרי",
      copingUsed: "אסטרטגיית התמודדות שיושמה",
      copingPlaceholder: "למשל: נשימות עמוקות, קרקוע...",
      submitLog: "שמור רשומה ליומן",
      logSaved: "יומן ההתנהגות נשמר",
      fillBehaviour: "יש להזין התנהגות מטרה",
      
      caseTitle: "המשגת מקרה",
      caseDesc: "המשגת מקרה מובנית עפ\"י מודל CBS וניתוח פונקציונלי",
      presentingProblems: "בעיות מוצגות",
      presentingPlaceholder: "תלונות מרכזיות, סיבת ההפניה, מטרות המטופל...",
      relevantHistory: "היסטוריה והקשר רלוונטיים",
      historyPlaceholder: "היסטוריית הלמידה, משפחה, רקע תרבותי, גורמים רפואיים...",
      functionalPatterns: "דפוסים פונקציונליים",
      functionalPlaceholder: "דפוסי התנהגות מרכזיים, יחסי גירוי-תגובה, התנהגות נשלטת חוקים...",
      processInflexibility: "תהליכי נוקשות פסיכולוגית",
      inflexibilityPlaceholder: "היתוך, הימנעות חווייתית, ניתוק מפונקציה, חוסר פעולה...",
      strengthsResources: "חוזקות ומשאבים",
      strengthsPlaceholder: "ערכים קיימים, פעולות המחויבות כבר כיום, רשתות תמיכה...",
      treatmentTargets: "יעדי הטיפול",
      targetsPlaceholder: "מטרות טיפול מועדפות ורציונל...",
      treatmentPlan: "תוכנית הטיפול",
      planPlaceholder: "אסטרטגיות התערבות ומעטפת...",
      outcomeMeasures: "מדדי תוצאה (Outcome)",
      outcomePlaceholder: "כיצד תתבצע מדידת ההתקדמות...",
      submitCase: "שמור את המשגת המקרה",
      caseSaved: "המשגת המקרה נשמרה",
      fillSection: "יש למלא לפחות שדה אחד",
    },
    
    advancedModels: {
      flexibilityScore: "ציון גמישות כללי",
      observationsAbout: "תצפיות לגבי",
      summaryNotes: "סיכום טיפול",
      summaryPlaceholder: "התרשמות קלינית כללית, יעדי טיפול...",
      submitHexaflex: "הגש הערכת הקספלקס",
      hexaflexSaved: "הערכת ההקספלקס נשמרה",
      hexaflexTitle: "מעקב Hexaflex",
      hexaflexDesc: "הערעכה ומעקב אחר 6 תהליכי הליבה בגמישות פסיכולוגית על פי מודל ACT",
      assessmentHistory: "היסטוריית הערכות",
      backToTherapist: "חזרה לאזור מטפלים",
      staffMatrixTitle: "מטריצת אקט (ACT Matrix)",
      staffMatrixDesc: "מלא מטריצת אקט עבור המטופלים המשויכים אליך.",
      bullseyeTitle: "פגיעה במטרה - ערכים",
      bullseyeDesc: "הערכת חשיבות ערכים ועקביות פעולה בין תחומי חיים מרכזיים",
      whatMatters: "מה נחשב בעיניך ומשמעותי בתחום זה?",
      describeValue: "תאר את מה שאת/ה מעריך...",
      importance: "חשיבות",
      consistency: "עקביות של פעולה",
      clinicalNotes: "הערות קליניות",
      clinicalNotesPlaceholder: "תצפיות לגבי פערים, מחסומים, נכונות...",
      submitBullseye: "שלח הערכת ערכים",
      bullseyeSaved: "הערכת הערכים נשמרה",

      hexAcceptance: "קבלה (Acceptance)",
      hexAcceptanceDesc: "נכונות לחוות רגשות ומחשבות קשות ללא הימנעות חווייתית",
      hexAcceptanceOpp: "הימנעות חווייתית",

      hexDefusion: "הפרדה קוגניטיבית (Defusion)",
      hexDefusionDesc: "יכולת לקחת צעד אחורה ממחשבות ולראותן כאירועים מנטליים בני חלוף",
      hexDefusionOpp: "התמזגות (Fusion)",

      hexPresent: "קשר לרגע הנוכחי",
      hexPresentDesc: "הפניית קשב גמישה לכאן-ועכשיו מתוך גישה פתוחה",
      hexPresentOpp: "שליטה של עבר/עתיד",

      hexSelf: "העצמי כהקשר (הצופה הפנימי)",
      hexSelfDesc: "תחושת מרחב פנימי טרנסצנדנטית הצופה בחוויה",
      hexSelfOpp: "היקשרות לעצמי המושגי",

      hexValues: "ערכים",
      hexValuesDesc: "בהירות לגבי מה חשוב באמת ומספק כיוון משמעותי לחיים",
      hexValuesOpp: "חוסר בהירות בערכים",

      hexAction: "פעולה מחויבת",
      hexActionDesc: "לקיחת פעולה אפקטיבית המונחית על ידי עקרונות, גם כשקשה לעשות זאת",
      hexActionOpp: "ימנעות מפעולה / אימפולסיביות",

      valWork: "עבודה / לימודים",
      valWorkDesc: "קריירה, לימודים, התפתחות אישית",
      
      valRelations: "מערכות יחסים",
      valRelationsDesc: "זוגיות, משפחה, קשרים בינאישיים רחבים",

      valGrowth: "צמיחה אישית / בריאות",
      valGrowthDesc: "קרקע פיזית, רגשית ורוחנית",

      valLeisure: "פנאי / בידור",
      valLeisureDesc: "כיף, תחביבים, יצירתיות, זמן משחק",
    },
    
    superviseeHub: {
      goodMorning: "בוקר טוב",
      goodAfternoon: "צהריים טובים",
      goodEvening: "ערב טוב",
      caseLogsLabel: "יומני מקרים",
      caseLogsDesc: "רישום פרטי טיפול, יעדים והתערבויות",
      caseLogsNote: "סך הכל טיפולים שתועדו",
      myDocsLabel: "המסמכים שלי",
      myDocsDesc: "העלאה וצפייה במסמכי הדרכה",
      myDocsNote: "קבצי הדרכה שהועלו",
      calendarLabel: "יומן טיפולים",
      calendarDesc: "צפייה בלוח הזמנים של המפגשים שלך",
      clinicalToolsLabel: "כלים קליניים",
      clinicalToolsDesc: "גיליונות ABC, הערכות פונקציונליות ועוד",
      resourcesLabel: "משאבים",
      resourcesDesc: "גישה לחומרי למידה משותפים",
      myTodosLabel: "המשימות שלי",
      myTodosDesc: "מעקב אחר משימות ההדרכה שלך",
      myTodosNote: "משימות לביצוע",
      yourTools: "הכלים שלך",
      everythingInOnePlace: "הכל במקום אחד",
      notificationSettings: "הגדרות התראות",
      portalFooter: "פורטל מודרכים · בניין אדם CBS",
      
      newLog: "רישום חדש",
      noLogs: "אין יומנים עדיין. התחל לתעד את מפגשי המטופלים שלך.",
      edit: "ערוך",
      delete: "מחק",
      editLog: "עריכת יומן",
      newLogTitle: "יומן טיפול חדש",
      cancel: "ביטול",
      updateLog: "עדכן יומן",
      createLog: "צור יומן",
      status: "סטטוס",
      
      clientName: "שם מטופל",
      clientAge: "גיל המטופל",
      sessionDateTime: "תאריך ושעת טיפול",
      sessionType: "סוג טיפול",
      durationMinutes: "משך (בדקות)",
      settingPlaceholder: "סביבה (למשל: קליניקה, בית, בית ספר)",
      targetsAddressed: "יעדים שטופלו",
      targetsPlaceholder: "פרט את היעדים ההתנהגותיים שעבדו עליהם במהלך הטיפול...",
      interventionsUsed: "התערבויות שיושמו",
      interventionsPlaceholder: "NET, FCT, DTT, אסטרטגיות מקדימות וכד'.",
      clientResponse: "תגובת המטופל",
      responsePlaceholder: "איך המטופל הגיב? רמות תמיכה (Prompting), מעורבות, התנהגויות מאתגרות...",
      dataSummary: "סיכום משתנים",
      dataPlaceholder: "נתוני ניסיונות (Trials), תדירות, משך זמן, אחוזי הצלחה...",
      nextSteps: "הצעדים הבאים / המלצות",
      nextStepsPlaceholder: "תוכנית לטיפול הבא, שינויים במערך ההתערבות...",
      supervisionNotes: "הערות להדרכה (Supervision)",
      supervisionPlaceholder: "שאלות למדריך, נושאים לדיון בהדרכה...",
      
      typeDirect: "טיפול ישיר",
      typeIndirect: "טיפול עקיף",
      typeSupervision: "פגישת הדרכה",
      typeAssessment: "הערכה",
      typeParent: "הדרכת הורים/מטפלים",
      typeObservation: "תצפית",
      
      statusDraft: "טיוטה",
      statusSubmitted: "הוגש לבדיקה",
      
      fileTypeNotAllowed: "סוג הקובץ אינו נתמך",
      fileUnder10MB: "על הקובץ להיות מתחת ל-10MB",
      docUploaded: "המסמך הועלה",
      uploadFailed: "ההעלאה נכשלה",
      downloadFailed: "ההורדה נכשלה",
      docDeleted: "המסמך נמחק",
      uploadDocument: "העלאת מסמך",
      notesOptional: "הערות (אופציונלי)",
      describeDoc: "תאר את המסמך...",
      uploading: "מעלה...",
      chooseFile: "בחר קובץ",
      fileConstraints: "מגבלת 10MB למסמכי PDF, תמונות, וקבצי Word",
      loadingDocs: "טוען מסמכים...",
      noDocsYet: "אין מסמכים עדיין.",
    },
    
    staffHub: {
      goodMorning: "בוקר טוב",
      goodAfternoon: "צהריים טובים",
      goodEvening: "ערב טוב",
      calLabel: "יומן",
      calDesc: "צפה ונהל את כל הפגישות",
      toolsLabel: "כלים קליניים",
      toolsDesc: "כלי איסוף נתונים CBS",
      clientTodosLabel: "משימות מטופלים",
      clientTodosDesc: "ניהול רשימות משימות מטופלים",
      matrixLabel: "מטריצת ACT",
      matrixDesc: "מטריצת אקט עבור מטופלים",
      plannerLabel: "מתכנן עסקי",
      plannerDesc: "ניהול פיננסי, מטריצת TME ומפת דרכים",
      
      prodLabel: "מרכז פרודוקטיביות",
      prodDesc: "לוח משימות, יומן ובינה מלאכותית",
      resourcesLabel: "משאבים",
      resourcesDesc: "ספריית משאבים",
      toolkitLabel: "ארגז כלים",
      toolkitDesc: "פומודורו, מטריצת ACT ועוד",
      msgLabel: "הודעות",
      msgDesc: "הודעות מאובטחות",
      bookingLabel: "זימון תורים",
      bookingDesc: "נהל את התורים שלך",
      settingsLabel: "הגדרות",
      settingsDesc: "העדפות והתראות",

      upSessions: "מפגשים קרובים",
      upSessionsNote: "מתוכננים לעתיד",
      myTasks: "המשימות שלי",
      myTasksNote: "משימות צוות לא מושלמות",
      clientHw: "שיעורי בית",
      clientHwNote: "ממתינים מהמטופלים",
      
      clinicalToolsSection: "כלים קליניים",
      clinicalToolsSub: "עבודה קלינית מול מטופלים",
      myWorkspaceSection: "סביבת העבודה שלי",
      myWorkspaceSub: "כלים והגדרות אישיות",
      
      pendingTasks: "ממתינות",
      viewAll: "הצג הכל",
      noPendingTasks: "אין משימות פתוחות שמשויכות אליך.",
      due: "לביצוע עד",
      practiceTasks: "משימות קליניקה",
      practiceTasksSub: "לוח משימות צוותי",
      portalFooter: "פורטל מטפלים · בניין אדם CBS",
    },
    
    staffFunctional: {
      title: "הערכה פונקציונלית",
      desc: "ניתוח התנהגות פונקציונלי מקיף עם מודל CBS",
      
      targetBehaviour: "התנהגות מטרה",
      behaviourName: "שם ההתנהגות",
      behaviourPlaceholder: "למשל פגיעה עצמית (SIB)",
      operationalDef: "הגדרה אופרטיבית",
      opDefPlaceholder: "תיאור מדיד וברור שנראה לעין...",
      frequency: "תדירות",
      freqPlaceholder: "למשל 3 סביבות / יום",
      intensity: "עצימות",
      intPlaceholder: "נמוכה/בינונית/גבוהה",
      duration: "משך זמן",
      durPlaceholder: "למשל 5 דקות",
      
      antecedents: "משתנים מקדימים",
      settingEvents: "אירועים מכוננים (Setting Events - רחוקים)",
      settingEventsPlaceholder: "למשל: שינה גרועה, פספוס תרופה, לחץ משפחתי...",
      establishingOps: "גורמים מניעים (Establishing Operations)",
      estOpsPlaceholder: "למשל: רעב, חסך חברתי, רוויה מהמשימה...",
      discrimStimuli: "גירויים מבחינים (Discriminative Stimuli - מיידיים)",
      discrimStimuliPlaceholder: "למשל: בקשה שהוצגה, תצומי שנשלל, סימן מעבר...",
      
      consequences: "ניתוח תוצאה",
      srPlus: "חיזוק חיובי (SR+) — נוסף משהו",
      srPlusPlaceholder: "למשל: תשומת לב מאדם, גישה לחפץ מועדף...",
      srMinus: "חיזוק שלילי (SR-) — הוסר משהו",
      srMinusPlaceholder: "למשל: חמיקה/בריחה מדרישה או משימה, הסרת רעש מציק...",
      spPlus: "עונש חיובי (SP+) — נוסף משהו",
      spPlusPlaceholder: "למשל: תגובה מילולית/נזיפה, חסימה פיזית...",
      spMinus: "עונש שלילי (SP-) — הוסר משהו",
      spMinusPlaceholder: "למשל: אובדן זכויות/פריבילגיה, פסק זמן מחיזוק...",
      
      formulation: "המשגה",
      hypothesisedFunc: "השערת פונקציה",
      hypothesisedFuncPlaceholder: "מבוסס על הניתוח, נראה כי ההתנהגות משרתת פונקציה של...",
      replacementBeh: "התנהגות חלופית",
      replacementBehPlaceholder: "התנהגות חלופית שוות-ערך פונקציונלית...",
      
      submitAssessment: "שלח הערכה פונקציונלית",
      assessmentSaved: "ההערכה נשמרה",
      clinicalDataTitle: "איסוף נתונים קליניים",
      clinicalDataDesc: "כלי מדע התנהגות קונטקסטואליים (CBS) להערכה, מעקב והמשגת מקרה",
    },
    fbaTool: {
      steps: {
        clientInfo: "פרטי לקוח",
        methods: "שיטות",
        supportingDocs: "מסמכים תומכים",
        background: "רקע",
        strengths: "חוזקות ומשאבים",
        targetBehaviours: "התנהגויות מטרה",
        constructionalInterview: "ראיון קונסטרוקציוני",
        actAssessment: "הערכת ACT",
        directObservations: "תצפיות ישירות",
        nonlinearAnalysis: "ניתוח לא-ליניארי",
        recommendations: "המלצות",
      },
      ui: {
        livePreview: "תצוגה מקדימה של הדוח",
        clearDraft: "נקה טיוטה",
        exportPdf: "ייצוא PDF",
        back: "חזור",
        next: "הבא",
        generatePdf: "הפק פדף",
        step: "שלב",
        of: "מתוך",
        sectionComplete: "סעיף הושלם",
        sectionIncomplete: "סעיף לא מושלם",
        title: "כלי דוח FBA",
        subtitle: "קונסטרוקציוני · גולדיימונד (1974) · ניתוח תלויות לא-ליניארי · מבוסס ACT",
        reportPreviewScrollable: "תצוגה מקדימה (ניתן לגלול)",
        clearDraftConfirm: "האם אתה בטוח שברצונך לנקות את הטיוטה ולהתחיל דוח חדש?",
      },
      form: {
        clientName: "שם מלא של הלקוח",
        clientNameHint: "שם חוקי מלא",
        dob: "תאריך לידה",
        diagnosis: "אבחנה עיקרית או פרופיל",
        settingType: "סוג מסגרת",
        settingName: "שם מסגרת",
        settingNamePlaceholder: "לדוגמה, בית ספר תל\"י",
        assessor: "הוערך על ידי",
        assessmentDates: "תאריכי הערכה",
        referralReason: "סיבת הפנייה",
        referralReasonPlaceholder: "מדוע התבקשה הערכה זו? חששות עיקריים ומי הפנה...",
        reportTheme: "ערכת נושא לדוח",
        typography: "טיפוגרפיה",
        assessmentMethods: "שיטות הערכה בשימוש",
        selectMethods: "בחר את כל השיטות הרלוונטיות:",
        otherMethods: "שיטות אחרות / מותאם אישית",
        otherMethodsPlaceholder: "מופרד בפסיקים...",
        externalReports: "דוחות חיצוניים ומסמכים תומכים",
        docTitle: "כותרת המסמך",
        docTitlePlaceholder: "לדוגמה, אבחון פסיכודידקטי, דוח קלינאית תקשורת",
        professional: "איש מקצוע / כותב",
        professionalPlaceholder: "לדוגמה, ד\"ר כהן (פסיכיאטר)",
        docDate: "תאריך (משוער)",
        docType: "סוג מסמך",
        keyFindings: "ממצאים עיקריים ורלוונטיות",
        keyFindingsPlaceholder: "מה זה אומר לנו שרלוונטי להתנהגות הנוכחית...",
        fileAttached: "קובץ מצורף",
        attachFile: "צורף קובץ",
        uploading: "מעלה...",
        addDocument: "הוסף מסמך",
        background: "רקע והקשר",
        backgroundHint: "כתבו היסטוריה נרטיבית של הלקוח, רקע רפואי/סוציאלי רלוונטי והמצב הנוכחי.",
        environment: "סביבה חינוכית / קלינית",
        supportStaff: "צוות תמיכה ואנשי מפתח",
        strengths: "חוזקות הלקוח ומשאבים",
        strengthsHint: "גישה קונסטרוקציונית מתחילה במה שהלקוח *יכול* לעשות. התמקדו ברפרטוארים המוצלחים הנוכחיים שלו, בתחומי עניין ובמערכות תמיכה זמינות.",
        strengthTitle: "חוזקה / נכס",
        strengthTitlePlaceholder: "לדוגמה, מתבטא היטב, אוהב רכבות",
        description: "תיאור / הקשר",
        descriptionPlaceholder: "כיצד תכונה זו באה לידי ביטוי כיום...",
        addStrength: "הוסף חוזקה",
        targetBehaviours: "התנהגויות מטרה (צורה וטופוגרפיה)",
        targetBehavioursHint: "תארו את ההתנהגויות באופן אובייקטיבי ללא ייחוס כוונה. התמקדו במה שניתן לראות ולמדוד.",
        behaviourName: "שם ההתנהגות",
        behaviourNamePlaceholder: "לדוגמה, תוקפנות פיזית, בריחה",
        topography: "טופוגרפיה (איך זה נראה)",
        topographyPlaceholder: "הלקוח משתמש באגרופים קפוצים כדי להכות...",
        frequency: "תדירות",
        intensity: "עוצמה",
        duration: "משך",
        antecedents: "אירועים מקדימים / הקשר",
        antecedentsPlaceholder: "מתי ואיפה זה צפוי להתרחש יותר...",
        addBehaviour: "הוסף התנהגות",
        constructionalQuestionnaire: "שאלון קונסטרוקציוני של גולדיימונד",
        cqHint: "במקום לשאול על הבעיה, חקרו לאן הלקוח רוצה להגיע.",
        cq1: "1. תוצאה מוצהרת",
        cq1Hint: "איך תיראה התוצאה המושלמת עבורך? (מילה במילה)",
        cq2: "2. תוצאה נצפית",
        cq2Hint: "מה אחרים יראו כשתוצאה מוצלחת תושג?",
        cq3: "3. מצב נוכחי",
        cq3Hint: "במה שונה המצב הנוכחי מהתוצאה הרצויה?",
        cq4: "4. כרוניקה של הדפוס",
        cq4Hint: "כיצד עוצב דפוס זה? מה מתחזק אותו?",
        cq5: "5. תנאים שבהם המצב טוב יותר",
        cq5Hint: "מתי הבעיה פחות חמורה או איננה קיימת?",
        cq6: "6. הצלחות קשורות",
        cq6Hint: "באילו אתגרים דומים הלקוח הצליח בעבר?",
        cq7: "7. מחזקים טבעיים",
        cq7Hint: "מה ישמר באופן טבעי את ההתקדמות לעבר היעדים?",
        cq8: "8. קירובים שיטתיים (תתי-יעדים)",
        cq8Hint: "אבני דרך מהרפרטואר הנוכחי לעבר התוצאות הסופיות",
        actAssessment: "הערכה מבוססת ACT (גמישות פסיכולוגית)",
        actHint: "כאשר לקוח מפגין שפה לגבי אירועי עבר/עתיד, קחו בחשבון כיצד השפה מתקשרת עם התלויות.",
        languageComplexity: "שפה ורפרטואר יחסי",
        languageComplexityHint: "האם מתאים ל-ACT?",
        presentMoment: "מודעות לרגע הנוכחי",
        presentMomentHint: "קשר עם החוויה הנוכחית לעומת עיסוק במועקות עבר/עתיד",
        defusion: "הפרדה - Defusion (לעומת היתוך קוגניטיבי)",
        defusionHint: "הסתבכות נוקשה עם מחשבות; שמירת כללים ללא גמישות",
        acceptance: "קבלה (לעומת הימנעות חווייתית)",
        acceptanceHint: "בריחה מחוויות פנימיות לא נעימות",
        selfAsContext: "העצמי כהקשר (לעומת העצמי כתוכן)",
        selfAsContextHint: "סיפור עצמי נוקשה; יכולת לקיחת פרספקטיבה",
        values: "ערכים",
        valuesHint: "מה חשוב ללקוח?",
        committedAction: "פעולה מחויבת",
        statedValues: "ערכים ותחומי עניין מוצהרים של הלקוח",
        reinforcers: "מחזקים מועדפים",
        directObservations: "תצפיות ישירות",
        addObservation: "הוסף פגישת תצפית",
        session: "פגישה",
        date: "תאריך",
        setting: "מסגרת / פעילות",
        participants: "משתתפים נוכחים",
        purpose: "מטרת התצפית",
        observations: "תצפיות נרטיביות (סיכום נתוני ABC)",
        analysis: "ניתוח ראשוני / רשמים",
        nonlinearAnalysis: "ניתוח תלויות פונקציונלי ולא-ליניארי",
        nonlinearHint: "קחו בחשבון לא רק את ההשלכות של ההתנהגות המוצגת, אלא גם את ההשלכות של *אי* ביצועה (המחיר של החלופות).",
        identifiedFunction: "תפקוד מזוהה",
        benefitsOfBehaviour: "יתרונות הדפוס הנוכחי",
        benefitsOfBehaviourHint: "מה ההתנהגות משיגה עבורם בהצלחה?",
        costsOfAlternatives: "העלות של חלופות",
        costsOfAlternativesHint: "מהו הקושי/המחיר של עיסוק בהתנהגות החלופית הרצויה?",
        hypothesis: "ניסוח / השערה",
        hypothesisPlaceholder: "לכן, ההתנהגות היא תגובה יעילה מאוד ל...",
        recommendations: "המלצות ותוכנית תמיכה",
        recommendationsHint: "פרטו את האסטרטגיות הקונסטרוקציוניות לביסוס רפרטוארים חדשים המיושרים עם יעדי הלקוח.",
        additionalNotes: "הערות נוספות / סייגים",
        additionalNotesHint: "מגבלות של ההערכה, סיכונים או הקשר אחר.",
      },
      report: {
        docReviewed: "מסמכים שנבדקו — דוחות מאנשי מקצוע אחרים",
        fileAttached: "[קובץ מצורף]",
        currentRepertoire: "רפרטואר נוכחי רלוונטי — חוזקות ומשאבים",
        targetBehavioursTitle: "התנהגויות מטרה",
        topography: "טופוגרפיה:",
        frequency: "תדירות:",
        intensity: "עוצמה:",
        duration: "משך:",
        antecedents: "אירועים מקדימים/הקשר:",
        observations: "תצפיות ישירות",
        setting: "מסגרת:",
        participants: "משתתפים:",
        purpose: "מטרה:",
        obsDesc: "תצפיות:",
        analysis: "ניתוח:",
        cQuestionnaire: "ראיון קונסטרוקציוני — השאלון של גולדיימונד (1974)",
        cQuestionnaireIntro: "במקום לשאול על הבעיה, הראיון הקונסטרוקציוני חוקר לאן הלקוח רוצה להגיע, ואז מעצב תוכנית להביא אותו לשם תוך שימוש באותן תלויות שמשמרות את הדפוס הנוכחי.",
        actAssessment: "הערכה מבוססת ACT — גמישות פסיכולוגית (הקספלקס)",
        actAssessmentIntro: "מרגע שלקוח מפגין שפה לגבי אירועי עבר/עתיד ויכולת לקיחת פרספקטיבה, הערכה פונקציונלית מקיפה חייבת להסביר כיצד התנהגות מילולית באה במגע עם תלויות (Dixon et al., 2023).",
        nonlinearAnalysis: "ניתוח תלויות פונקציונלי ולא-ליניארי",
        nonlinearAnalysisIntro: "ניתוח לא-ליניארי (Layng et al., 2022) מדגיש לא רק את ההשלכות של ההתנהגות המוצגת, אלא גם את ההשלכות של אי-ביצועה — כלומר, מחירי החלופות. לרוב זה חושף שההתנהגות היא למעשה תוצאה רציונלית ויעילה בהינתן התנאים הקיימים.",
        hypothesis: "השערה:",
        recommendations: "המלצות",
        recommendationsIntro: "ההמלצות הבאות הן קונסטרוקציוניות: הן מתמקדות בבניית רפרטוארים חדשים המיושרים עם הערכים והיעדים המוצהרים של הלקוח.",
        additionalNotes: "הערות נוספות / סייגים",
        references: "מקורות",
        title: "הערכה ודוח המלצות",
        subtitle: "הערכת התנהגות פונקציונלית וקונסטרוקציונית מבוססת גישת ACT",
        client: "לקוח:",
        dob: "תאריך לידה:",
        diagnosis: "אבחנה / פרופיל:",
        settingField: "מסגרת:",
        assessedBy: "הוערך על ידי:",
        assessmentDates: "תאריכי הערכה:",
        reportDate: "תאריך הדוח:",
        confidential: "סודי | מסמך קליני",
        reasonForReferral: "סיבת ההפניה",
        assessmentMethods: "שיטות הערכה",
        background: "רקע",
        backgroundIntro: "הערכה זו מאמצת גישה קונסטרוקציונית המציגה את הלקוח כאדם המתפקד ביעילות לנוכח התלויות הקיימות, ולא כמי שמציג פתולוגיה כלשהי (Goldiamond, 1974; Layng et al., 2022).",
        envTitle: "סביבה חינוכית / קלינית:",
        supportStaffTitle: "צוות תמיכה ואנשי מפתח:",
        reportCompleted: "תאריך הפקה:"
      }
    },
  },
} as const;
