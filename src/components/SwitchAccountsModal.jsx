import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { switchAccount as apiSwitchAccount } from '../api/api.js';
import { setUserData } from '../redux/userSlice';
import { getSavedAccounts, removeSavedAccount } from '../utils/accountSwitch.js';

const SwitchAccountsModal = ({ isOpen, onClose }) => {
  const [accounts, setAccounts] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setAccounts(getSavedAccounts());
    }
  }, [isOpen]);

  const handleSwitch = async (account) => {
    setLoadingId(account.id);

    try {
      const response = await apiSwitchAccount(account.switchToken);
      const user = response.user;

      if (!user) {
        throw new Error('Failed to switch account');
      }

      localStorage.setItem('user', JSON.stringify(user));
      dispatch(setUserData(user));
      toast.success(`Switched to ${user.username}`);
      onClose();
      navigate('/home');
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Unable to switch accounts';
      toast.error(message);
      console.error('Switch account error:', error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleRemoveAccount = (accountId) => {
    removeSavedAccount(accountId);
    setAccounts(getSavedAccounts());
    toast.success('Account removed from switch list');
  };

  const handleAddAccount = () => {
    onClose();
    navigate('/account?add=true');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className='fixed inset-0 z-50 flex items-center justify-center px-4'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className='absolute inset-0 bg-black/70'
            onClick={onClose}
          />

          <motion.div
            className='relative z-10 max-w-xl w-full rounded-3xl border border-white/20 bg-[#0b0b0b]/95 p-6 shadow-2xl'
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
          >
            <div className='flex items-center justify-between gap-4 mb-4'>
              <div>
                <h2 className='text-white text-xl font-semibold'>Switch accounts</h2>
                <p className='text-sm text-gray-400'>Choose an account to continue with.</p>
              </div>
              <button
                type='button'
                onClick={onClose}
                className='text-white/60 hover:text-white transition'
              >
                Close
              </button>
            </div>

            {accounts.length === 0 ? (
              <div className='rounded-3xl border border-dashed border-white/10 bg-white/5 p-8 text-center'>
                <p className='text-white/80 mb-4'>No saved accounts yet.</p>
                <button
                  type='button'
                  onClick={handleAddAccount}
                  className='inline-flex items-center justify-center rounded-full bg-white text-black px-5 py-3 font-semibold shadow-lg transition hover:bg-gray-200'
                >
                  Add account
                </button>
              </div>
            ) : (
              <div className='space-y-4'>
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className='rounded-3xl border border-white/10 bg-white/5 p-4 flex items-center justify-between gap-4'
                  >
                    <div>
                      <p className='text-white font-semibold'>{account.username}</p>
                      <p className='text-sm text-gray-400'>{account.email || 'No email saved'}</p>
                    </div>

                    <div className='flex items-center gap-2'>
                      <button
                        type='button'
                        onClick={() => handleRemoveAccount(account.id)}
                        className='rounded-full border border-white/10 px-3 py-2 text-xs text-gray-300 hover:bg-white/10'
                      >
                        Remove
                      </button>
                      <button
                        type='button'
                        onClick={() => handleSwitch(account)}
                        disabled={loadingId === account.id}
                        className='rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-200 disabled:opacity-60'
                      >
                        {loadingId === account.id ? 'Switching…' : 'Switch'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className='mt-6 text-center'>
              <button
                type='button'
                onClick={handleAddAccount}
                className='inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10'
              >
                Add another account
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SwitchAccountsModal;
