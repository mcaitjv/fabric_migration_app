import { motion } from 'framer-motion';
import {
  BotIcon,
  DatabaseIcon,
  LogOutIcon,
  MoonIcon,
  RocketIcon,
  ShieldIcon,
  SparklesIcon,
  StarIcon,
  SunIcon,
  ZapIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';

import { TodoForm } from '@/components/TodoForm';
import { TodoList } from '@/components/TodoList';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/AuthContext';
import { useTodos } from '@/hooks/useTodos';

const FEATURES = [
  {
    icon: DatabaseIcon,
    iconBg: 'bg-blue-100 dark:bg-blue-500/15',
    iconColor: 'text-blue-600',
    title: 'Built-in database, ready to go',
    description: (
      <>
        Your database is up and running. The milestones above are synced from
        it.
      </>
    ),
  },
  {
    icon: BotIcon,
    iconBg: 'bg-orange-100 dark:bg-orange-500/15',
    iconColor: 'text-orange-600',
    title: 'Editable by an agent',
    description:
      'Your app is designed to be editable by an agent. When you are done reading this, go give it a try.',
  },
  {
    icon: ShieldIcon,
    iconBg: 'bg-pink-100 dark:bg-pink-500/15',
    iconColor: 'text-pink-600',
    title: 'Public by default, add auth if needed',
    description:
      "To share your app (in Private Preview), invite users to your app's Fabric workspace.",
  },
  {
    icon: SparklesIcon,
    iconBg: 'bg-yellow-100 dark:bg-yellow-500/15',
    iconColor: 'text-yellow-600',
    title: 'Private Preview with more to come',
    description:
      'We have lots of features in the works, including Fabric data connections, storage, real-time services, and native agent support.',
  },
];

/** Small icons that orbit the hero rocket. */
const ORBIT_ICONS = [
  { icon: SparklesIcon, className: 'text-yellow-400 -top-2 -left-8', delay: 0 },
  { icon: StarIcon, className: 'text-pink-400 top-2 -right-9', delay: 0.4 },
  { icon: ZapIcon, className: 'text-violet-400 -bottom-3 left-12', delay: 0.8 },
];

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
    </Button>
  );
}

function Hero() {
  return (
    <div className="text-center mb-16">
      <div className="relative inline-flex mb-6">
        <motion.div
          className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-violet-500 to-pink-500 flex items-center justify-center shadow-xl shadow-violet-500/30"
          animate={{ y: [0, -10, 0], rotate: [0, -4, 4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <RocketIcon className="w-10 h-10 text-white" />
        </motion.div>
        {ORBIT_ICONS.map(({ icon: Icon, className, delay }) => (
          <motion.span
            key={className}
            className={`absolute ${className}`}
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, delay }}
          >
            <Icon className="w-5 h-5 fill-current" />
          </motion.span>
        ))}
      </div>
      <motion.h1
        className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 dark:from-blue-400 dark:via-violet-400 dark:to-pink-400 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        Ready for liftoff
      </motion.h1>
      <motion.p
        className="mt-3 text-lg text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        Knock out your tasks and watch your progress climb.
      </motion.p>
    </div>
  );
}

export function Dashboard() {
  const { signOut } = useAuth();
  const { todos, loading, error, addTodo, toggleTodo } = useTodos();

  const completedCount = todos.filter((t) => t.isCompleted).length;
  const completedPercent =
    todos.length === 0 ? 0 : Math.round((completedCount / todos.length) * 100);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleToggle = async (id: string, isCompleted: boolean) => {
    try {
      await toggleTodo(id, isCompleted);
    } catch {
      // toggle failed silently
    }
  };

  const handleAdd = async (title: string) => {
    await addTodo(title);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-100 to-indigo-300 dark:from-slate-900 dark:via-slate-950 dark:to-black">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <span className="text-lg font-semibold">Getting Started</span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOutIcon className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <Hero />

        {/* Journey Card */}
        <div className="mb-16">
          <div className="bg-card text-card-foreground rounded-3xl shadow-xl p-8">
            <h2 className="text-3xl font-bold mb-4 text-center">
              Your journey so far
            </h2>

            {!loading && todos.length > 0 && (
              <div className="mb-6">
                <div className="flex items-baseline justify-between mb-2 text-sm">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-semibold tabular-nums">
                    {completedCount} / {todos.length} tasks
                  </span>
                </div>
                <Progress value={completedPercent} aria-label="Tasks completed" />
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TodoList todos={todos} loading={loading} onToggle={handleToggle} />

            <div className="mt-6">
              <TodoForm onAdd={handleAdd} />
            </div>
          </div>
        </div>

        {/* About your app */}
        <div className="mb-16 -mx-8">
          <h2 className="text-3xl font-bold text-center mb-8">
            About your app
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex gap-4">
                <div
                  className={`flex-shrink-0 w-12 h-12 ${feature.iconBg} rounded-2xl flex items-center justify-center`}
                >
                  <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-foreground font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
