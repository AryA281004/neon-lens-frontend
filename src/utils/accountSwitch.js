const ACCOUNTS_KEY = 'accounts';

export const getSavedAccounts = () => {
  const raw = localStorage.getItem(ACCOUNTS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    localStorage.removeItem(ACCOUNTS_KEY);
    return [];
  }
};

export const setSavedAccounts = (accounts) => {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
};

export const addSavedAccount = (account) => {
  const accounts = getSavedAccounts();
  const existingIndex = accounts.findIndex((item) => item.id === account.id);

  const sanitized = {
    id: account.id,
    username: account.username,
    email: account.email || '',
    switchToken: account.switchToken,
  };

  if (existingIndex >= 0) {
    accounts[existingIndex] = {
      ...accounts[existingIndex],
      ...sanitized,
    };
  } else {
    accounts.unshift(sanitized);
  }

  setSavedAccounts(accounts.slice(0, 6));
};

export const removeSavedAccount = (id) => {
  const accounts = getSavedAccounts().filter((item) => item.id !== id);
  setSavedAccounts(accounts);
};

export const clearSavedAccounts = () => {
  localStorage.removeItem(ACCOUNTS_KEY);
};
