import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User, PaymentMode, DEFAULT_PAYMENT_MODES } from '../interfaces';
import { paymentModeService } from '../services/paymentModeService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { AppLayout } from '../components/layout/AppLayout';

export const PaymentModes: React.FC = () => {
  const { user } = useOutletContext<{ user: User }>();
  const [customModes, setCustomModes] = useState<PaymentMode[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMode, setEditingMode] = useState<PaymentMode | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ name: string; isCredit: boolean }>();

  useEffect(() => {
    fetchModes();
  }, [user.id]);

  useEffect(() => {
    if (editingMode) {
      reset({ name: editingMode.name, isCredit: !!editingMode.isCredit });
    } else {
      reset({ name: '', isCredit: false });
    }
  }, [editingMode, reset]);

  const fetchModes = async () => {
    setLoading(true);
    try {
      const fetched = await paymentModeService.getPaymentModes(user.id);
      setCustomModes(fetched);
    } catch (error) {
      console.error('Error fetching payment modes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode?: PaymentMode) => {
    setEditingMode(mode);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMode(undefined);
    reset({ name: '' });
  };

  const onSubmit = async (data: { name: string; isCredit: boolean }) => {
    setIsSubmitting(true);
    try {
      if (editingMode?.id) {
        await paymentModeService.updatePaymentMode(editingMode.id, { 
          name: data.name,
          isCredit: data.isCredit,
          modifiedBy: user.id,
          modifiedOn: Date.now()
        });
        toast.success('Payment Mode updated!');
      } else {
        await paymentModeService.addPaymentMode({ 
          name: data.name, 
          isCredit: data.isCredit,
          createdBy: user.id,
          createdOn: Date.now()
        });
        toast.success('Payment Mode added!');
      }
      await fetchModes();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving payment mode:', error);
      toast.error('Failed to save payment mode');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this payment mode? (Expenses using this mode might not display properly)')) {
      try {
        await paymentModeService.deletePaymentMode(id);
        toast.success('Payment mode deleted');
        await fetchModes();
      } catch (error) {
        console.error('Error deleting payment mode:', error);
        toast.error('Failed to delete payment mode');
      }
    }
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-6 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-main tracking-tight">Payment Modes</h2>
            <p className="text-sm text-muted font-medium">Manage your payment methods</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-md dark:shadow-none">
            <Plus size={24} />
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {/* Default Modes */}
            <div>
              <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-3 px-1">Default Modes</h3>
              <div className="space-y-2">
                {DEFAULT_PAYMENT_MODES.map((mode) => (
                  <div key={mode.id} className="bg-primary p-4 rounded-xl shadow-sm border border-main flex items-center justify-between">
                    <span className="font-medium text-main opacity-80">{mode.name}</span>
                    <span className="text-xs font-semibold px-2 py-1 bg-slate-200 dark:bg-slate-700 text-muted rounded-full">System</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Modes */}
            <div className="mt-4">
              <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-3 px-1">Your Custom Modes</h3>
              {customModes.length === 0 ? (
                <div className="text-center py-8 bg-card rounded-2xl border border-main shadow-sm">
                  <p className="text-muted font-medium mb-3">No custom payment modes yet</p>
                  <Button variant="outline" size="sm" onClick={() => handleOpenModal()}>
                    Create Custom Mode
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {customModes.map((mode) => (
                    <div key={mode.id} className="bg-card p-4 rounded-xl shadow-sm border border-main flex items-center justify-between group transition-all hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900">
                      <div className="flex flex-col">
                        <span className="font-semibold text-main">{mode.name}</span>
                        {mode.isCredit && (
                          <span className="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-tight mt-0.5">Credit Mode</span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleOpenModal(mode)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => mode.id && handleDelete(mode.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingMode ? "Edit Payment Mode" : "New Payment Mode"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Method Name"
            placeholder="e.g. PayPal"
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message}
          />
          <div className="flex items-center space-x-3 p-1">
            <input
              type="checkbox"
              id="isCredit"
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              {...register('isCredit')}
            />
            <label htmlFor="isCredit" className="text-sm font-medium text-slate-700">
              Credit Mode (Calculate under credits)
            </label>
          </div>
          <div className="pt-4 flex space-x-3">
            <Button type="button" variant="outline" className="flex-1" onClick={handleCloseModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" isLoading={isSubmitting}>
              {editingMode ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
};
