import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { InputComponent } from '../components/ui/Input.component';
import { ButtonComponent } from '../components/ui/Button.component';
import { authService } from '../services/auth.service';

type FormValues = { email: string };

export const ForgotPassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      if(data.email.trim() === '') {
        toast.error('Email is required');
        return;
      }
      await authService.requestPasswordReset(data.email);
      setSubmitted(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Could not send reset email';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex justify-center w-full transition-colors duration-300">
      <div className="w-full max-w-md bg-card min-h-screen flex flex-col justify-center px-6 py-12 shadow-2xl relative overflow-hidden border-main border-x">
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
              <KeyRound size={40} className="text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-center text-main tracking-tight">
            Forgot password
          </h2>
          <p className="mt-2 text-center text-muted mb-8 font-medium">
            Enter the email on your account. We will send a 10-digit code and a
            reset link. The code expires in 10 minutes.
          </p>

          {submitted ? (
            <div className="space-y-6">
              <div className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 p-4 rounded-xl text-sm font-medium border border-emerald-100 dark:border-emerald-900">
                If an account exists for that email, check your inbox for the
                code and link.
              </div>
              <Link
                to="/login"
                className="block text-center text-blue-600 hover:text-blue-500 font-bold"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <InputComponent
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
                error={errors.email?.message}
              />

              <ButtonComponent
                type="submit"
                className="w-full py-3 text-lg mt-4"
                isLoading={isLoading}
              >
                Send reset email
              </ButtonComponent>
            </form>
          )}

          {!submitted && (
            <p className="mt-8 text-center text-sm text-slate-600 font-medium">
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-500 font-bold transition-colors"
              >
                Back to sign in
              </Link>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};
