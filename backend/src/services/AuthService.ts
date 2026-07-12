import bcrypt from 'bcryptjs';
import User from '../models/User';
import Application from '../models/Application';
import Interview from '../models/Interview';
import ActivityLog from '../models/ActivityLog';
import generateToken from '../utils/generateToken';

export class AuthService {
  static async registerUser(body: any) {
    const { email, password } = body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      const error = new Error('An account with this email already exists.');
      (error as any).status = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    try {
      const user = await User.create({
        email,
        password_hash,
      });

      return {
        _id: user._id,
        email: user.email,
        token: generateToken(String(user._id)),
      };
    } catch (error: any) {
      if (error.code === 11000) {
        const customError = new Error('An account with this email already exists.');
        (customError as any).status = 409;
        throw customError;
      }
      throw error;
    }
  }

  static async loginUser(body: any) {
    const { email, password } = body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      return {
        _id: user._id,
        email: user.email,
        token: generateToken(String(user._id)),
      };
    } else {
      const error = new Error('Invalid email or password');
      (error as any).status = 401;
      throw error;
    }
  }

  static async demoLogin() {
    const demoEmail = `demo_${Date.now()}@careerflow.demo`;
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('demopassword', salt);

    const user = await User.create({
      email: demoEmail,
      password_hash,
      is_demo: true,
    });

    // Seed 15 realistic applications
    const companies = ['Google', 'Stripe', 'Linear', 'Notion', 'Netflix', 'Amazon', 'Vercel', 'Supabase', 'OpenAI', 'Anthropic', 'Meta', 'Apple', 'Spotify', 'Airbnb', 'Uber'];
    const titles = ['Frontend Engineer', 'Full Stack Developer', 'Product Engineer', 'Senior React Developer', 'Software Engineer'];
    const statuses = ['Wishlist', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Accepted'];
    
    const priorityOptions = ['LOW', 'MEDIUM', 'HIGH'] as const;
    const sources = ['LinkedIn', 'Indeed', 'Naukri', 'Referral', 'Website'] as const;
    const healthScores = ['HEALTHY', 'AT_RISK', 'STALE', 'SUCCESS'] as const;
    
    for (let i = 0; i < 15; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)] as any;
      const priority = priorityOptions[Math.floor(Math.random() * 3)];
      const source = sources[Math.floor(Math.random() * sources.length)];
      const health = status === 'Accepted' ? 'SUCCESS' : healthScores[Math.floor(Math.random() * 4)];
      
      const pastDate = new Date(Date.now() - Math.floor(Math.random() * 15000000000));
      const app: any = await Application.create({
        user_id: user._id,
        company_name: companies[i],
        job_title: titles[Math.floor(Math.random() * titles.length)],
        status,
        priority,
        source,
        health_score: health,
        applied_date: pastDate,
        salary_min: 80000 + Math.floor(Math.random() * 40000),
        salary_max: 130000 + Math.floor(Math.random() * 50000),
        currency: 'USD'
      });

      await ActivityLog.create({
        application_id: app._id,
        event_type: 'Application Created',
        description: `Added ${app.company_name} to board via LinkedIn`,
        created_at: new Date(pastDate.getTime() - 86400000)
      });

      if (Math.random() > 0.5) {
        await ActivityLog.create({
          application_id: app._id,
          event_type: 'Application Updated',
          description: `Application notes updated`,
          created_at: new Date(pastDate.getTime() - 40000000)
        });
      }

      if (status === 'Interview' || status === 'Offer' || status === 'Accepted') {
        const mode = Math.random() > 0.5 ? 'Online' : 'Onsite';
        const round_type = Math.random() > 0.6 ? 'Technical Round' : 'HR Round';
        const scheduled_date = new Date(pastDate.getTime() + 172800000); 

        await Interview.create({
          application_id: app._id,
          round_type: round_type,
          scheduled_date: scheduled_date,
          interview_mode: mode,
          interviewer_name: 'Jane Doe',
          interviewer_email: 'jane.doe@company.com',
          status: status === 'Interview' ? 'Upcoming' : 'Completed'
        });

        await ActivityLog.create({
          application_id: app._id,
          event_type: 'Interview Scheduled',
          description: `${round_type} scheduled for ${scheduled_date.toLocaleDateString()}`,
          created_at: new Date(pastDate.getTime() + 86400000)
        });
      }
    }

    return {
      _id: user._id,
      email: user.email,
      token: generateToken(String(user._id)),
    };
  }
}
