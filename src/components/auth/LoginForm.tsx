import { useForm } from 'react-hook-form';
import { Button, Input, Label } from "@/components/ui";
import { useAuth } from '@/components/hooks/useAuth';

interface FormData {
  email: string;
  password: string;
}

export function LoginForm() {
  const { login, isLoading } = useAuth();
  const { 
    register, 
    handleSubmit, 
    setError, 
    formState: { errors } 
  } = useForm<FormData>();
  
  const onSubmit = async (data: FormData) => {
    const success = await login(data.email, data.password);
    
    if (!success) {
      setError('password', { 
        type: 'server', 
        message: 'Invalid email or password' 
      });
    }
  };

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    window.location.href = path;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          {...register('email', { 
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
          className="w-full"
          aria-invalid={errors.email ? 'true' : 'false'}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          {...register('password', { 
            required: 'Password is required' 
          })}
          className="w-full"
          aria-invalid={errors.password ? 'true' : 'false'}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <a 
          href="/auth/recover" 
          onClick={(e) => handleNavigation(e, '/auth/recover')}
          className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
        >
          Forgot your password?
        </a>
        <a 
          href="/auth/register" 
          onClick={(e) => handleNavigation(e, '/auth/register')}
          className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
        >
          Don't have an account?
        </a>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
} 