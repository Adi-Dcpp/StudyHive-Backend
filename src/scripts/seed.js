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
import { Announcement } from "../models/announcement.models.js";
import { Notification } from "../models/notification.models.js";
import {
  RESOURCE_FILE_URLS,
  REFERENCE_LINKS,
  generateUsers,
  generateGroupSpecs,
  generateGoals,
  generateAssignments,
  pickRotatedItems,
  getRandomItem,
  makeDate,
  slugify,
  SEED_DATA_STATS,
  SEED_CONFIG,
  SUBMISSION_FEEDBACK,
} from "./seed-data.js";

dotenv.config();

const args = process.argv.slice(2);
const shouldReset = args.includes("--reset");
const force = args.includes("--force");
const defaultPassword = process.env.SEED_DEFAULT_PASSWORD || "Password@123";

const createUsers = async () => {
  const users = generateUsers();
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
  const groupSpecs = generateGroupSpecs();
  const mentors = [];
  const learners = [];
  for (let i = 1; i <= SEED_DATA_STATS.mentors; i += 1) {
    mentors.push(userMap[`mentor-${i}`]);
  }
  for (let i = 1; i <= SEED_DATA_STATS.learners; i += 1) {
    learners.push(userMap[`learner-${i}`]);
  }
  const groupMap = {};
  const groupMemberDocs = [];
  for (const [index, groupSpec] of groupSpecs.entries()) {
    const mentor = mentors[index % mentors.length];
    const assignedLearners = pickRotatedItems(learners, index, SEED_CONFIG.learnersPerGroup);
    const inviteCode = `SH26-${String(index + 1).padStart(2, "0")}`;
    const groupKey = slugify(groupSpec.name);
    const group = await Group.create({
      name: groupSpec.name,
      description: groupSpec.description,
      mentor: mentor._id,
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
    groupMap[groupKey] = { group, mentor, learners: assignedLearners };
  }
  await GroupMember.insertMany(groupMemberDocs);
  return groupMap;
};

const createGoalsAndAssignments = async (groupMap) => {
  const assignments = [];
  const goalTemplates = generateGoals();
  const assignmentTemplates = generateAssignments();
  for (const [groupKey, data] of Object.entries(groupMap)) {
    const { group, mentor, learners } = data;
    for (const [goalIndex, goalTemplate] of goalTemplates.entries()) {
      const assignedLearners = pickRotatedItems(learners, goalIndex, 4 + (goalIndex % 3));
      const goal = await Goal.create({
        title: `${goalTemplate.title} - ${group.name}`,
        description: goalTemplate.description,
        group: group._id,
        assignedTo: assignedLearners.map((learner) => learner._id),
        status: goalTemplate.status,
        createdBy: mentor._id,
        deadline: goalTemplate.daysFromNow ? makeDate(goalTemplate.daysFromNow) : undefined,
      });
      for (const [assignIndex, assignTemplate] of assignmentTemplates.entries()) {
        const assignmentLearners = pickRotatedItems(assignedLearners, assignIndex, Math.min(2 + assignIndex, assignedLearners.length));
        const assignment = await Assignment.create({
          title: `${assignTemplate.title} - ${group.name}`,
          description: assignTemplate.description,
          goalId: goal._id,
          groupId: group._id,
          createdBy: mentor._id,
          deadline: makeDate(assignTemplate.daysFromNow),
          referenceMaterials: pickRotatedItems(REFERENCE_LINKS, (goalIndex + assignIndex), 2),
          maxMarks: assignTemplate.maxMarks,
          isActive: goalTemplate.status !== "completed",
        });
        assignments.push({ assignment, assignedLearners: assignmentLearners, groupKey, mentor, allGroupLearners: learners });
      }
    }
  }
  return assignments;
};

const createResources = async (groupMap) => {
  const resourcePromises = [];
  const noteDescriptions = [
    "Welcome plan and weekly milestone checklist.",
    "Key takeaways, blockers, and action items from weekly sync.",
    "Practice problems and solutions walkthrough.",
    "Debugging techniques and common pitfalls.",
    "Best practices and code review guidelines.",
    "Architecture decisions and trade-offs.",
  ];
  for (const [groupKey, data] of Object.entries(groupMap)) {
    const { group, mentor } = data;
    for (let i = 0; i < SEED_CONFIG.resourceTypesPerGroup.notes; i += 1) {
      resourcePromises.push(
        Resource.create({
          title: `${group.name} - ${i === 0 ? "Onboarding" : "Learning"} Notes #${i + 1}`,
          description: noteDescriptions[i % noteDescriptions.length],
          type: "note",
          group: group._id,
          uploadedBy: mentor._id,
        })
      );
    }
    for (let i = 0; i < SEED_CONFIG.resourceTypesPerGroup.links; i += 1) {
      resourcePromises.push(
        Resource.create({
          title: `${group.name} - Reference Resource #${i + 1}`,
          type: "link",
          group: group._id,
          uploadedBy: mentor._id,
          linkUrl: REFERENCE_LINKS[(group.name.length + i) % REFERENCE_LINKS.length],
        })
      );
    }
    for (let i = 0; i < SEED_CONFIG.resourceTypesPerGroup.files; i += 1) {
      const file = RESOURCE_FILE_URLS[(group.name.length + i) % RESOURCE_FILE_URLS.length];
      resourcePromises.push(
        Resource.create({
          title: `${group.name} - Study Material #${i + 1}`,
          description: `Downloadable study guide and reference material for ${group.name}`,
          type: "file",
          group: group._id,
          uploadedBy: mentor._id,
          fileUrl: file.url,
          fileName: file.fileName,
          fileSize: file.size,
          cloudinaryPublicId: `seed/${groupKey}/resource-${i}`,
        })
      );
    }
  }
  await Promise.all(resourcePromises);
};

const createSubmissions = async (assignments) => {
  let submissionCount = 0;
  for (const [index, entry] of assignments.entries()) {
    const hasAllLearners = Math.random() < SEED_CONFIG.submissionVariation;
    const learnersForSubmission = hasAllLearners ? entry.allGroupLearners : entry.assignedLearners;
    for (const learner of learnersForSubmission) {
      if (Math.random() > SEED_CONFIG.submissionVariation) continue;
      const statusRandom = Math.random();
      let status = "pending";
      let marksObtained;
      let feedback;
      let reviewedAt;
      if (statusRandom < SEED_CONFIG.reviewedPercentage) {
        status = "reviewed";
        marksObtained = 60 + Math.floor(Math.random() * 40);
        feedback = getRandomItem(SUBMISSION_FEEDBACK);
        reviewedAt = makeDate(Math.floor(Math.random() * 3));
      } else if (statusRandom < SEED_CONFIG.reviewedPercentage + SEED_CONFIG.revisionRequiredPercentage) {
        status = "revision_required";
        feedback = "Please revise and resubmit. " + getRandomItem(SUBMISSION_FEEDBACK);
        reviewedAt = makeDate(1);
      } else if (statusRandom < 0.85) {
        status = "submitted";
      }
      const sampleFile = RESOURCE_FILE_URLS[(index + submissionCount) % RESOURCE_FILE_URLS.length];
      await Submission.create({
        assignmentId: entry.assignment._id,
        userId: learner._id,
        submittedText: `Solution to ${entry.assignment.title} by ${learner.name}. Implementation covers main requirements with error handling. Time complexity: ${Math.floor(Math.random() * 3) + 1}s per test case.`,
        submittedFile: status !== "pending" ? sampleFile.url : undefined,
        cloudinaryPublicId: status !== "pending" ? `seed/submissions/${entry.assignment._id}/${learner._id}` : undefined,
        status,
        submittedAt: makeDate(-Math.floor(Math.random() * 7)),
        marksObtained,
        feedback,
        reviewedAt,
      });
      submissionCount += 1;
    }
  }
};

const resetCollections = async () => {
  await Notification.deleteMany({});
  await Announcement.deleteMany({});
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
    throw new Error("Seeding is blocked in production. Use --force only if you are absolutely sure.");
  }
  await connectDB();
  if (!shouldReset) {
    throw new Error("Pass --reset to seed dummy data safely (this script intentionally clears existing data).");
  }
  console.log("\n🌱 Starting StudyHive Database Seeding (v2.0.0)...\n");
  await resetCollections();
  console.log("✅ Collections cleared");
  const userMap = await createUsers();
  console.log(`✅ Created ${SEED_DATA_STATS.totalUsers} users`);
  const groupMap = await createGroupsAndMembers(userMap);
  console.log(`✅ Created ${SEED_DATA_STATS.groups} groups with members`);
  const assignments = await createGoalsAndAssignments(groupMap);
  console.log(`✅ Created goals and ${assignments.length} assignments`);
  await createResources(groupMap);
  console.log("✅ Created resources across all groups");
  await createSubmissions(assignments);
  console.log("✅ Created submissions with varied statuses");
  const countSummary = {
    users: await User.countDocuments(),
    groups: await Group.countDocuments(),
    groupMembers: await GroupMember.countDocuments(),
    goals: await Goal.countDocuments(),
    assignments: await Assignment.countDocuments(),
    resources: await Resource.countDocuments(),
    submissions: await Submission.countDocuments(),
  };
  console.log("\n" + "=".repeat(70));
  console.log("✅ Dummy database seeded successfully for v2.0.0!");
  console.log("=".repeat(70));
  console.log("\n📊 SEED DATA STATISTICS:");
  console.table(countSummary);
  console.log("\n📋 CONFIGURATION:");
  const expectedStats = {
    "Total Users": `${SEED_DATA_STATS.totalUsers}`,
    "Mentors": `${SEED_DATA_STATS.mentors}`,
    "Learners": `${SEED_DATA_STATS.learners}`,
    "Study Groups": `${SEED_DATA_STATS.groups}`,
    "Goals per Group": `${SEED_DATA_STATS.goalsPerGroup}`,
    "Assignments per Goal": `${SEED_DATA_STATS.assignmentsPerGoal}`,
  };
  console.table(expectedStats);
  console.log("\n🔐 AUTHENTICATION CREDENTIALS:");
  console.log(`   Default Password: ${defaultPassword}`);
  console.log("   ⚠️  Use same password for all seeded users\n");
  console.log("👤 ADMIN ACCOUNT:");
  console.log("   📧 admin@studyhive.dev\n");
  console.log("👨‍🏫 MENTOR ACCOUNTS (Sample):");
  for (let i = 1; i <= Math.min(3, SEED_DATA_STATS.mentors); i++) {
    console.log(`   📧 mentor${i}@studyhive.dev`);
  }
  console.log(`   ... and ${SEED_DATA_STATS.mentors - 3} more mentors\n`);
  console.log("👥 LEARNER ACCOUNTS (Sample):");
  for (let i = 1; i <= Math.min(5, SEED_DATA_STATS.learners); i++) {
    console.log(`   📧 learner${i}@studyhive.dev`);
  }
  console.log(`   ... and ${SEED_DATA_STATS.learners - 5} more learners\n`);
  console.log("📚 CONTENT CREATED:");
  console.log(`   • Study Groups: ${countSummary.groups}`);
  console.log(`   • Learning Goals: ${countSummary.goals}`);
  console.log(`   • Assignments: ${countSummary.assignments}`);
  console.log(`   • Resources: ${countSummary.resources}`);
  console.log(`   • Submissions: ${countSummary.submissions}\n`);
  console.log("🎯 NEXT STEPS:");
  console.log("   1. Start development server: npm run dev");
  console.log("   2. Login with any seeded account");
  console.log("   3. Explore groups, assignments, and submissions");
  console.log("   4. Test full CRUD operations\n");
  console.log("=".repeat(70));
};

runSeed()
  .catch((error) => {
    console.error("\n❌ Seeding failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
