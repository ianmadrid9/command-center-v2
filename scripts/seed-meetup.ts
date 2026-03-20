import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create the meetup research project
  const project = await prisma.project.upsert({
    where: { id: 'meetup-nyc-2026' },
    update: {},
    create: {
      id: 'meetup-nyc-2026',
      name: 'NYC Meetup Research & Booking',
      description: 'Research free/early-bird physical meetups in NYC (tech, AI, entrepreneurship). Book free or ≥$20 early-bird tickets to expand LinkedIn connections.',
      status: 'on_track',
      progress: 10,
      owner: 'Rook',
    },
  });

  // Create conversation with initial context
  await prisma.conversation.upsert({
    where: { projectId: project.id },
    update: {},
    create: {
      projectId: project.id,
      messages: {
        create: [
          {
            role: 'assistant',
            content: "I've started researching NYC meetups for you. Here's my approach:\n\n**Criteria**:\n• Free events OR early-bird tickets ≥$20\n• Tech, AI, entrepreneurship, startup scenes\n• Physical/in-person in NYC\n• Good for LinkedIn networking\n\n**Sources I'll check**:\n• Meetup.com\n• Eventbrite\n• LinkedIn Events\n• Tech company events (Google, Meta, etc.)\n• Startup incubators (Techstars, YC network)\n\nI'll present options with:\n- Event name + date\n- Location + expected attendance\n- Ticket price (free or early-bird)\n- Networking quality rating\n- Direct booking link\n\nWant me to prioritize any specific area? (AI/ML, fintech, general tech, startup founders)",
          },
        ],
      },
    },
  });

  console.log('✓ Seeded meetup research project');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
