import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../db/index.db.js";
import { User } from "../models/user.models.js";
import { Group } from "../models/group.models.js";
import { GroupMember } from "../models/groupMember.models.js";
import { Goal } from "../models/goal.models.js";
import { Assignment } from "../models/assignment.models.js";
import { Resource } from "../models/resource.models.js";
import { Submission } from "../models/submission.models.js";

dotenv.config();

const args = process.argv.slice(2);
const shouldReset = args.includes("--reset");
const force = args.includes("--force");
const defaultPassword = process.env.SEED_DEFAULT_PASSWORD || "Password@123";

const RESOURCE_FILE_URLS = [
  {
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileName: "study-guide.pdf",
    size: 13264,
  },
  {
    url: "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg",
    fileName: "whiteboard-plan.jpg",
    size: 245760,
  },
  {
    url: "https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg",
    fileName: "coding-session.jpg",
    size: 256412,
  },
  {
    url: "https://www.africau.edu/images/default/sample.pdf",
    fileName: "weekly-notes.pdf",
    size: 55371,
  },
];

const REFERENCE_LINKS = [
  "https://developer.mozilla.org",
  "https://roadmap.sh",
  "https://expressjs.com",
  "https://www.freecodecamp.org",
  "https://leetcode.com",
  "https://www.geeksforgeeks.org",
];

const makeDate = (daysFromNow) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
};

const pickRotatedItems = (items, startIndex, count) => {
  const picked = [];
  for (let i = 0; i < count; i += 1) {
    picked.push(items[(startIndex + i) % items.length]);
  }
  return picked;
};

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const createUsers = async () => {
  const mentors = [
    "Aarav Sharma",
    "Ananya Gupta",
    "Vihaan Mehta",
    "Diya Nair",
    "Ishaan Kapoor",
    "Myra Joshi",
  ];

  const learners = [
    "Riya Verma",
    "Kabir Singh",
    "Isha Patel",
    "Neel Arora",
    "Meera Das",
    "Arjun Rao",
    "Saanvi Kulkarni",
    "Advik Bhat",
    "Kiara Menon",
    "Yuvan Iyer",
    "Navya Chandra",
    "Reyansh Tiwari",
    "Aanya Ghosh",
    "Pranav Reddy",
    "Sara Khan",
    "Laksh Jain",
    "Tanvi Malhotra",
    "Rudra Mishra",
    "Pari Sethi",
    "Dev Oberoi",
    "Anika Pillai",
    "Dhruv Bansal",
    "Nisha Roy",
  ];

  const users = [
    {
      key: "admin",
      name: "Admin User",
      email: "admin@studyhive.dev",
      role: "admin",
    },
    ...mentors.map((name, index) => ({
      key: `mentor-${index + 1}`,
      name,
      email: `mentor${index + 1}@studyhive.dev`,
      role: "mentor",
    })),
    ...learners.map((name, index) => ({
      key: `learner-${index + 1}`,
      name,
      email: `learner${index + 1}@studyhive.dev`,
      role: "learner",
    })),
  ];

  const userMap = {};

  for (const user of users) {
    const createdUser = await User.create({
      name: user.name,
      email: user.email,
      role: user.role,
      password: defaultPassword,
      isEmailVerified: true,
    });

    userMap[user.key] = createdUser;
  }

  return userMap;
};

const createGroupsAndMembers = async (userMap) => {
  const groupSpecs = [
    {
      name: "Full Stack Builders",
      description:
        "MERN projects, auth flows, deployment, and API performance.",
    },
    {
      name: "DSA Sprint Squad",
      description: "Daily coding rounds with topic-wise interview prep.",
    },
    {
      name: "Cloud Native Crew",
      description:
        "Containers, microservices basics, and cloud architecture labs.",
    },
    {
      name: "Python Problem Solvers",
      description: "Hands-on Python automation and backend scripting drills.",
    },
    {
      name: "Frontend Motion Lab",
      description:
        "UI composition, state management, and accessibility practices.",
    },
    {
      name: "System Design Circle",
      description: "Scalable backend design, tradeoffs, and review sessions.",
    },
    {
      name: "Competitive Coders Hub",
      description: "Contest simulations with rating-focused training plans.",
    },
    {
      name: "DevOps Apprentices",
      description: "CI/CD pipelines, observability, and production readiness.",
    },
    {
      name: "AI Foundations Guild",
      description:
        "ML fundamentals, model evaluation, and experimentation logs.",
    },
    {
      name: "Database Masters",
      description: "MongoDB + SQL design, indexing, and query optimization.",
    },
    {
      name: "Security First Team",
      description: "OWASP checks, auth hardening, and secure coding patterns.",
    },
    {
      name: "JavaScript Ninjas",
      description: "Deep JS internals, async patterns, and runtime behavior.",
    },
    {
      name: "Interview Ready Batch",
      description: "Mock interviews and role-specific placement tracks.",
    },
    {
      name: "Open Source Launchpad",
      description:
        "Issue triage, PR workflow, and maintainable contribution style.",
    },
    {
      name: "API Architecture Studio",
      description: "REST design, standards, versioning, and contract testing.",
    },
  ];

  const mentors = Array.from(
    { length: 6 },
    (_, i) => userMap[`mentor-${i + 1}`],
  );
  const learners = Array.from(
    { length: 23 },
    (_, i) => userMap[`learner-${i + 1}`],
  );

  const groupMap = {};
  const groupMemberDocs = [];

  for (const [index, groupSpec] of groupSpecs.entries()) {
    const mentor = mentors[index % mentors.length];
    const assignedLearners = pickRotatedItems(learners, index, 8);
    const inviteCode = `SH26-${String(index + 1).padStart(2, "0")}`;
    const groupKey = slugify(groupSpec.name);

    const group = await Group.create({
      name: groupSpec.name,
      description: groupSpec.description,
      mentor: mentor._id,
      members: [mentor._id, ...assignedLearners.map((learner) => learner._id)],
      inviteCode,
    });

    groupMemberDocs.push({
      group: group._id,
      user: mentor._id,
      role: "mentor",
    });

    for (const learner of assignedLearners) {
      groupMemberDocs.push({
        group: group._id,
        user: learner._id,
        role: "learner",
      });
    }

    groupMap[groupKey] = {
      group,
      mentor,
      learners: assignedLearners,
    };
  }

  await GroupMember.insertMany(groupMemberDocs);

  return groupMap;
};

const createGoalsAndAssignments = async (groupMap) => {
  const assignments = [];

  const goalTemplates = [
    {
      title: "Weekly Learning Plan",
      description: "Set milestone-based roadmap for the next two weeks.",
      status: "not_started",
    },
    {
      title: "Core Concept Mastery",
      description: "Cover foundational topics with mentor-reviewed notes.",
      status: "ongoing",
    },
    {
      title: "Hands-on Implementation",
      description:
        "Deliver a practical mini-project to apply learned concepts.",
      status: "ongoing",
    },
    {
      title: "Peer Review and Retrospective",
      description: "Review peer submissions and document improvements.",
      status: "completed",
    },
  ];

  for (const [groupKey, data] of Object.entries(groupMap)) {
    const { group, mentor, learners } = groupMap[groupKey];

    for (const [index, template] of goalTemplates.entries()) {
      const assignedLearners = pickRotatedItems(learners, index, 3);

      const goal = await Goal.create({
        title: `${template.title} - ${group.name}`,
        description: template.description,
        group: group._id,
        assignedTo: assignedLearners.map((learner) => learner._id),
        status: template.status,
        createdBy: mentor._id,
      });

      const assignment = await Assignment.create({
        title: `Assignment ${index + 1}: ${group.name}`,
        description: `Deliverables for ${template.title.toLowerCase()} in ${group.name}.`,
        goalId: goal._id,
        groupId: group._id,
        createdBy: mentor._id,
        deadline: makeDate(5 + index * 3),
        referenceMaterials: [
          REFERENCE_LINKS[index % REFERENCE_LINKS.length],
          REFERENCE_LINKS[(index + 2) % REFERENCE_LINKS.length],
        ],
        maxMarks: 100 + (index % 2) * 20,
        isActive: index !== 3,
      });

      assignments.push({ assignment, assignedLearners, groupKey, mentor });
    }
  }

  return { assignments };
};

const createResources = async (groupMap) => {
  const resourcePromises = [];

  for (const [groupKey, data] of Object.entries(groupMap)) {
    const { group, mentor } = data;
    const fileA = RESOURCE_FILE_URLS[0];
    const fileB =
      RESOURCE_FILE_URLS[(group.name.length + 1) % RESOURCE_FILE_URLS.length];

    resourcePromises.push(
      Resource.create({
        title: `${group.name} Onboarding Note`,
        description: "Welcome plan and weekly milestone checklist.",
        type: "note",
        group: group._id,
        uploadedBy: mentor._id,
      }),
    );

    resourcePromises.push(
      Resource.create({
        title: `${group.name} Learning Portal`,
        type: "link",
        group: group._id,
        uploadedBy: mentor._id,
        linkUrl: REFERENCE_LINKS[group.name.length % REFERENCE_LINKS.length],
      }),
    );

    resourcePromises.push(
      Resource.create({
        title: `${group.name} Study Handbook`,
        type: "file",
        group: group._id,
        uploadedBy: mentor._id,
        fileUrl: fileA.url,
        fileName: fileA.fileName,
        fileSize: fileA.size,
        cloudinaryPublicId: `seed/${groupKey}/study-handbook`,
      }),
    );

    resourcePromises.push(
      Resource.create({
        title: `${group.name} Sprint Notes`,
        description:
          "Key takeaways, blockers, and action items from weekly sync.",
        type: "note",
        group: group._id,
        uploadedBy: mentor._id,
      }),
    );

    resourcePromises.push(
      Resource.create({
        title: `${group.name} Whiteboard Snapshot`,
        type: "file",
        group: group._id,
        uploadedBy: mentor._id,
        fileUrl: fileB.url,
        fileName: fileB.fileName,
        fileSize: fileB.size,
        cloudinaryPublicId: `seed/${groupKey}/whiteboard-snapshot`,
      }),
    );
  }

  await Promise.all(resourcePromises);
};

const createSubmissions = async (assignmentEntries) => {
  const statuses = ["submitted", "reviewed", "revision_required", "pending"];

  for (const [index, entry] of assignmentEntries.entries()) {
    const status = statuses[index % statuses.length];
    const sampleFile =
      RESOURCE_FILE_URLS[(index + 2) % RESOURCE_FILE_URLS.length];

    for (const learner of entry.assignedLearners) {
      await Submission.create({
        assignmentId: entry.assignment._id,
        userId: learner._id,
        submittedText: `Submission by ${learner.name} for ${entry.assignment.title}`,
        submittedFile: sampleFile.url,
        cloudinaryPublicId: `seed/submissions/${entry.assignment._id}/${learner._id}`,
        status,
        submittedAt: makeDate(-((index % 5) + 1)),
        marksObtained: status === "reviewed" ? 72 + (index % 25) : undefined,
        feedback:
          status === "reviewed"
            ? "Solid implementation. Improve test coverage and naming consistency."
            : status === "revision_required"
              ? "Please resubmit after fixing validation and edge-case handling."
              : undefined,
        reviewedAt:
          status === "reviewed" || status === "revision_required"
            ? makeDate(0)
            : undefined,
      });
    }
  }
};

const resetCollections = async () => {
  await Submission.deleteMany({});
  await Resource.deleteMany({});
  await Assignment.deleteMany({});
  await Goal.deleteMany({});
  await GroupMember.deleteMany({});
  await Group.deleteMany({});
  await User.deleteMany({});
};

const runSeed = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing. Add it to your .env file.");
  }

  if (process.env.NODE_ENV === "production" && !force) {
    throw new Error(
      "Seeding is blocked in production. Use --force only if you are absolutely sure.",
    );
  }

  await connectDB();

  if (!shouldReset) {
    throw new Error(
      "Pass --reset to seed dummy data safely (this script intentionally clears existing data).",
    );
  }

  await resetCollections();

  const userMap = await createUsers();
  const groupMap = await createGroupsAndMembers(userMap);
  const { assignments } = await createGoalsAndAssignments(groupMap);
  await createResources(groupMap);
  await createSubmissions(assignments);

  const countSummary = {
    users: await User.countDocuments(),
    groups: await Group.countDocuments(),
    groupMembers: await GroupMember.countDocuments(),
    goals: await Goal.countDocuments(),
    assignments: await Assignment.countDocuments(),
    resources: await Resource.countDocuments(),
    submissions: await Submission.countDocuments(),
  };

  console.log("\n✅ Dummy database seeded successfully.");
  console.table(countSummary);
  console.log("\n🔐 Seed login password for all users:", defaultPassword);
  console.log("📧 Example learner login: learner1@studyhive.dev");
  console.log("👨‍🏫 Example mentor login: mentor1@studyhive.dev");
};

runSeed()
  .catch((error) => {
    console.error("\n❌ Seeding failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
