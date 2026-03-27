import React, { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { User } from '../interfaces';
import { authService } from '../services/authService';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface UserDetailsForm {
  name: string;
}

export const UserDetails: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useOutletContext<{
    user: User;
    refreshUser: () => Promise<void>;
  }>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UserDetailsForm>({
    defaultValues: { name: user.name },
  });

  useEffect(() => {
    reset({ name: user.name });
  }, [user.name, reset]);

  const onSubmit = async (data: UserDetailsForm) => {
    try {
      await authService.updateUserName(user.id, data.name);
      await refreshUser();
      toast.success('Name updated');
      reset({ name: data.name.trim() });
    } catch (error: unknown) {
      console.error('Error updating name:', error);
      const message = error instanceof Error ? error.message : 'Could not update name';
      toast.error(message);
    }
  };

  const createdLabel = new Date(user.createdAt).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-6 pb-24">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div>
          <h2 className="text-2xl font-extrabold text-main tracking-tight">Account details</h2>
          <p className="text-sm text-muted font-medium mt-1">View your profile. Only your name can be changed here.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-card rounded-2xl border border-main shadow-sm p-5 space-y-5">
            <h3 className="text-sm font-bold text-main uppercase tracking-wide">Editable</h3>
            <Input
              label="Name"
              maxLength={200}
              {...register('name', {
                required: 'Name is required',
                validate: (v) => (v.trim().length > 0 ? true : 'Name cannot be empty'),
              })}
              error={errors.name?.message}
            />
            <Button type="submit" className="w-full" disabled={!isDirty}>
              Save name
            </Button>
          </div>
        </form>

        <div className="bg-card rounded-2xl border border-main shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-bold text-main uppercase tracking-wide">Read-only</h3>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted uppercase">Phone</p>
            <p className="text-base font-medium text-main">{user.phone}</p>
          </div>

          {user.email && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted uppercase">Email</p>
              <p className="text-base font-medium text-main break-all">{user.email}</p>
            </div>
          )}

          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted uppercase">Account created</p>
            <p className="text-base font-medium text-main">{createdLabel}</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
