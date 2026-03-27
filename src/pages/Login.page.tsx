import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { InputComponent } from '../components/ui/Input.component';
import { ButtonComponent } from '../components/ui/Button.component';
import { authService } from '../services/auth.service';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      setError(null);
      setIsLoading(true);
      await authService.login(data.phone, data.password);
      toast.success('Successfully logged in!');
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
      toast.error(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex justify-center w-full transition-colors duration-300">
      <div className="w-full max-w-md bg-card min-h-screen flex flex-col justify-center px-6 py-12 shadow-2xl relative overflow-hidden border-main border-x">
        
        {/* Decorative background blur */}
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-blue-300 dark:bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-72 h-72 bg-indigo-300 dark:bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="z-10"
        >
          <div className="flex justify-center mb-8">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-lg">
              <Wallet size={40} className="text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-center text-main tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-muted mb-8 font-medium">
            Manage your life expenses efficiently
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-semibold border border-red-100">
                {error}
              </div>
            )}
            
            <InputComponent
              label="Phone Number"
              type="tel"
              placeholder="1234567890"
              {...register('phone', { required: 'Phone number is required' })}
              error={errors.phone?.message as string}
            />
            
            <InputComponent
              label="Password"
              type="password"
              placeholder="••••••••"
              {...register('password', { required: 'Password is required' })}
              error={errors.password?.message as string}
            />

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <ButtonComponent type="submit" className="w-full py-3 text-lg mt-4" isLoading={isLoading}>
              Sign In
            </ButtonComponent>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600 font-medium">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:text-blue-500 font-bold transition-colors">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
