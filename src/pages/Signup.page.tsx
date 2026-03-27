import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { authService } from '../services/auth.service';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const password = watch('password');

  const onSubmit = async (data: any) => {
    try {
      setError(null);
      setIsLoading(true);
      await authService.register(data.name, data.phone, data.email, data.password);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
      toast.error(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex justify-center w-full transition-colors duration-300">
      <div className="w-full max-w-md bg-card min-h-screen flex flex-col justify-center px-6 py-8 shadow-2xl relative overflow-hidden border-main border-x">
        
        {/* Decorative background blur */}
        <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-indigo-200 dark:bg-indigo-900 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob" />
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="z-10"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg">
              <UserPlus size={36} className="text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-center text-main tracking-tight">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-muted mb-6 font-medium text-sm">
            Join tracking your expenses today
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-semibold border border-red-100">
                {error}
              </div>
            )}
            
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              {...register('name', { required: 'Name is required' })}
              error={errors.name?.message as string}
              required={true}
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="1234567890"
              {...register('phone', { 
                required: 'Phone number is required',
                pattern: { value: /^[0-9]{10}$/, message: 'Invalid phone number (10 digits)' }
              })}
              error={errors.phone?.message as string}
              required={true}
            />

            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email',
                },
              })}
              required={true}
              error={errors.email?.message as string}
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              {...register('password', { 
                required: 'Password is required',
                minLength: { value: 6, message: 'Minimum 6 characters' }
              })}
              error={errors.password?.message as string}
              required={true}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword', { 
                required: 'Please confirm password',
                validate: value => value === password || 'Passwords do not match'
              })}
              error={errors.confirmPassword?.message as string}
              required={true}
            />

            <Button type="submit" className="w-full py-3 mt-4" variant="primary" isLoading={isLoading}>
              Sign Up
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-bold transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
