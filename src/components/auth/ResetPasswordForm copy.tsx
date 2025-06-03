import { useForm } from 'react-hook-form';
import { Button, Input, Label, useToast } from "@/components/ui";
import { useState } from 'react';

interface FormData {
  password: string;
  confirmPassword: string;
}

export function ResetPasswordForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { 
    register, 
    handleSubmit,
    watch,
    formState: { errors } 
  } = useForm<FormData>();

  // Get password value for confirmation validation
  const password = watch('password');
  
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          password: data.password,
        }),
      });

      const result = await response.json();

      if (result.status === 'error') {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to reset password. Please try again.",
        });
        return;
      }

      // Show success message
      toast({
        title: "Success",
        description: "Your password has been reset successfully. You can now log in with your new password.",
      });

      // Redirect to login page after a short delay
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 2000);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your new password"
          {...register('password', { 
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters'
            }
          })}
          className="w-full"
          aria-invalid={errors.password ? 'true' : 'false'}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your new password"
          {...register('confirmPassword', { 
            required: 'Please confirm your password',
            validate: (value: string) => value === password || "Passwords don't match"
          })}
          className="w-full"
          aria-invalid={errors.confirmPassword ? 'true' : 'false'}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Resetting Password...' : 'Reset Password'}
      </Button>
    </form>
  );
} 