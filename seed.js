import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Event from './models/Event.js';

dotenv.config();

const sampleEvents = [
  {
    title: 'Global AI & LLM Engineering Summit 2026',
    date: 'Oct 24, 2026',
    time: '09:00 AM - 05:00 PM PST',
    location: 'Moscone Center, San Francisco, CA & Online',
    description: 'Explore state-of-the-art Generative AI, LLM fine-tuning techniques, multi-agent frameworks, and real-time neural inference at scale.',
    category: 'AI & Data',
    price: 99,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    totalSeats: 250,
    availableSeats: 42,
    organizer: 'AI Developers Network',
    featured: true,
    tags: ['AI', 'LLMs', 'PyTorch', 'Agents'],
  },
  {
    title: 'Next.js & Fullstack Web Architecture Conference',
    date: 'Nov 12, 2026',
    time: '10:00 AM - 04:30 PM EST',
    location: 'Metropolitan Pavilion, New York, NY',
    description: 'Master Next.js App Router, Server Components, edge functions, zero-bundle-size React patterns, and distributed database caching.',
    category: 'Development',
    price: 49,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    totalSeats: 180,
    availableSeats: 180,
    organizer: 'Vercel Community Alliance',
    featured: true,
    tags: ['Nextjs', 'React', 'TypeScript', 'Frontend'],
  },
  {
    title: 'Cybersecurity & Zero-Trust Defense Workshop',
    date: 'Nov 28, 2026',
    time: '01:00 PM - 06:00 PM GMT',
    location: 'ExCeL London, UK & Hybrid',
    description: 'Hands-on offensive security penetration testing, cloud security hardening, identity management, and threat mitigation strategy.',
    category: 'Cybersecurity',
    price: 75,
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    totalSeats: 100,
    availableSeats: 12,
    organizer: 'SecOps Global',
    featured: false,
    tags: ['Security', 'ZeroTrust', 'CloudSec', 'DevSecOps'],
  },
  {
    title: 'Cloud Native & Kubernetes Summit 2026',
    date: 'Dec 05, 2026',
    time: '09:30 AM - 05:30 PM CST',
    location: 'McCormick Place, Chicago, IL',
    description: 'Deep dive into Kubernetes operators, service meshes (Istio/Linkerd), GitOps infrastructure with ArgoCD, and serverless compute.',
    category: 'Cloud & DevOps',
    price: 0,
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    totalSeats: 300,
    availableSeats: 85,
    organizer: 'Cloud Native Computing Foundation',
    featured: true,
    tags: ['Kubernetes', 'Docker', 'DevOps', 'AWS'],
  },
  {
    title: 'UI/UX Design Systems Masterclass',
    date: 'Dec 18, 2026',
    time: '11:00 AM - 03:00 PM PST',
    location: 'Design Hub, Seattle, WA',
    description: 'Learn how modern tech enterprises build scalable design tokens, accessible component libraries, and seamless Figma-to-code workflows.',
    category: 'Design & UX',
    price: 29,
    image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
    totalSeats: 80,
    availableSeats: 0,
    organizer: 'Creative Designers Guild',
    featured: false,
    tags: ['Figma', 'UI', 'UX', 'DesignSystems'],
  },
  {
    title: 'Autonomous Systems & Robotics Hackathon',
    date: 'Jan 15, 2027',
    time: '48-Hour Live Event',
    location: 'MIT Stata Center, Cambridge, MA',
    description: 'Build real-world robotic applications using ROS 2, computer vision, spatial computing, and embedded AI edge microcontrollers.',
    category: 'AI & Data',
    price: 0,
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
    totalSeats: 150,
    availableSeats: 64,
    organizer: 'Robotics Innovation Lab',
    featured: false,
    tags: ['Robotics', 'ROS2', 'Embedded', 'Hackathon'],
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB for seeding...');

    const existingCount = await Event.countDocuments();
    if (existingCount === 0) {
      await Event.insertMany(sampleEvents);
      console.log(`Successfully seeded ${sampleEvents.length} events into database!`);
    } else {
      console.log(`Database already has ${existingCount} events. Skipping auto-seed.`);
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDB();
