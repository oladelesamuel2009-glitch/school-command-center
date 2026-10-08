export const schoolSetupSections = [
  {
    slug: "academic-sessions",
    label: "Academic Sessions",
    description: "Set up the academic years used by your school.",
  },
  {
    slug: "terms",
    label: "Terms",
    description: "Organize terms within each academic session.",
  },
  {
    slug: "classes",
    label: "Classes",
    description: "Create the classes used by your school.",
  },
  {
    slug: "class-arms",
    label: "Class Arms",
    description: "Manage class arms such as SS2A and SS2B.",
  },
  {
    slug: "subjects",
    label: "Subjects",
    description: "Configure the subjects offered by your school.",
  },
  {
    slug: "class-arm-subjects",
    label: "Class Arm Subjects",
    description:
      "Configure compulsory and elective subjects for each class arm.",
  },
] as const;

export type SchoolSetupSectionSlug =
  (typeof schoolSetupSections)[number]["slug"];
