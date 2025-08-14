# Focus Flow - GTD Task Management

Mind Like Water - Getting Things Done (GTD) methodology based task management application.

## 🚀 Features

- **GTD Workflow**: Complete implementation of David Allen's Getting Things Done methodology
- **Inbox Processing**: Capture and process thoughts, ideas, and tasks
- **Project Management**: Break down complex projects into actionable tasks
- **Context-based Organization**: Organize tasks by context (@home, @office, etc.)
- **Smart Scheduling**: Schedule tasks for specific dates or add to next actions
- **Waiting For**: Track delegated tasks and follow up appropriately
- **Someday/Maybe**: Store future ideas and possibilities
- **Reference Material**: Keep important information easily accessible

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Payments**: Stripe
- **Deployment**: Netlify

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account (for subscription features)

## 🔧 Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd focus-flow
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Migration

Run the migration to set up your database schema:

```bash
# In your Supabase dashboard, go to SQL Editor and run:
# supabase/migrations/20250710020000_initial_setup.sql
```

### 4. Stripe Setup (Optional)

For subscription features:

1. Create a Stripe account
2. Set up products and prices
3. Update `src/stripe-config.ts` with your price IDs
4. Deploy Stripe webhook functions to Supabase

### 5. Run Development Server

```bash
npm run dev
```

## 🏗 Project Structure

```
src/
├── components/          # React components
│   ├── Auth/           # Authentication components
│   ├── Inbox/          # Inbox processing
│   ├── Lists/          # Task lists (Next Actions, Waiting For, etc.)
│   ├── Navigation/     # Sidebar and navigation
│   ├── Process/        # GTD processing wizard
│   ├── Subscription/   # Subscription management
│   └── common/         # Shared components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── lib/                # Utilities and configurations
├── types/              # TypeScript type definitions
└── utils/              # Helper functions

supabase/
├── functions/          # Edge functions
└── migrations/         # Database migrations
```

## 🎯 GTD Workflow

The application implements the complete GTD workflow:

1. **Capture**: Add items to inbox
2. **Clarify**: Process inbox items through 6-step workflow
3. **Organize**: Sort into appropriate lists
4. **Reflect**: Review and update regularly
5. **Engage**: Take action with confidence

### Processing Steps

1. **What is it?** - Clarify the item
2. **Is it actionable?** - Decide if action is required
3. **Multiple steps?** - Determine if it's a project
4. **2-minute rule** - Do it now or defer
5. **Delegate?** - Assign to someone else
6. **Schedule?** - Set specific date or add to next actions

## 📱 Features

### Free Plan
- 50 tasks per month
- 5 projects per month
- Basic search and filtering
- Core GTD workflow

### Pro Plan (¥500/month)
- Unlimited tasks and projects
- Advanced search and filtering
- Custom tags and labels
- Data export
- Priority support

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Secure authentication via Supabase Auth
- HTTPS encryption for all communications

## 🚀 Deployment

### Netlify Deployment

1. Connect your repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push to main branch

### Supabase Edge Functions

Deploy webhook handlers for Stripe integration:

```bash
# Deploy stripe webhook function
supabase functions deploy stripe-webhook

# Deploy checkout session function  
supabase functions deploy stripe-checkout
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Contact support (for Pro users)

## 🙏 Acknowledgments

- David Allen for the Getting Things Done methodology
- Supabase team for the excellent backend platform
- React and TypeScript communities