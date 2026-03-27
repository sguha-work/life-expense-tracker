import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { authService } from '../services/auth.service';

type FormValues = {
  otp: string;
  password: string;
  confirmPassword: string;
};

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromQuery = useMemo(
    () => searchParams.get('email')?.trim() ?? '',
    [searchParams]
  );

  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>();

  const password = watch('password');

  const onSubmit = async (data: FormValues) => {
    if (!emailFromQuery.trim()) {
      toast.error('Missing email in the link. Open the link from your email.');
      return;
    }
    try {
      setIsLoading(true);
      await authService.resetPasswordWithOtp(
        emailFromQuery,
        data.otp,
        data.password
      );
      toast.success('Password updated. Sign in with your new password.');
      navigate('/login', { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Could not reset password';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex justify-center w-full transition-colors duration-300">
      <div className="w-full max-w-md bg-card min-h-screen flex flex-col justify-center px-6 py-12 shadow-2xl relative overflow-hidden border-main border-x">
        <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-indigo-200 dark:bg-indigo-900 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob" />

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="z-10"
        >
          <div className="flex justify-center mb-8">
            <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg">
              <Lock size={40} className="text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-center text-main tracking-tight">
            Reset password
          </h2>
          <p className="mt-2 text-center text-muted mb-8 font-medium text-sm">
            Enter the code from your email and choose a new password.
          </p>

          {!emailFromQuery && (
            <div className="bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100 p-3 rounded-xl text-sm font-medium border border-amber-100 dark:border-amber-900 mb-4">
              No email in this link. Use the &quot;Reset password&quot; link from your email,
              or request a new code from forgot password.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email"
              type="email"
              readOnly
              value={emailFromQuery}
              className="bg-slate-50 dark:bg-slate-900/50"
            />

            <Input
              label="One-time code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={10}
              placeholder="10-digit code"
              {...register('otp', {
                required: 'Code is required',
                pattern: {
                  value: /^\d{10}$/,
                  message: 'Enter the 10-digit code',
                },
              })}
              error={errors.otp?.message}
            />

            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Minimum 6 characters' },
              })}
              error={errors.password?.message}
            />

            <Input
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              {...register('confirmPassword', {
                required: 'Please confirm password',
                validate: (v) =>
                  v === password || 'Passwords do not match',
              })}
              error={errors.confirmPassword?.message}
            />

            <Button
              type="submit"
              className="w-full py-3 text-lg mt-4"
              isLoading={isLoading}
            >
              Update password
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600 font-medium">
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-500 font-bold transition-colors"
            >
              Back to sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
