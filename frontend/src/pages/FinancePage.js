import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  Tab,
  Tabs
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  AddCircleOutline as DepositIcon,
  RemoveCircleOutline as WithdrawIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import api from '../services/api';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function FinancePage() {
  const [tabValue, setTabValue] = useState(0);
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    fetchBalance();
    fetchRecentTransactions();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await api.get('/auth/profile/');
      setBalance(Number(response.data.balance));
    } catch (err) {
      console.error('Failed to load balance:', err);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const response = await api.get('/transactions/');
      const financeTransactions = response.data
        .filter(t => ['add_funds', 'withdraw'].includes(t.transaction_type))
        .slice(0, 5);
      setRecentTransactions(financeTransactions);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    }
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount > 1000) {
      setError('Maximum deposit amount is $1000');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/finance/deposit/', { amount: numAmount });
      setSuccess(response.data.message);
      setBalance(Number(response.data.new_balance));
      setAmount('');
      fetchRecentTransactions();
    } catch (err) {
      setError(err.response?.data?.error || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount > 1000) {
      setError('Maximum withdrawal amount is $1000');
      return;
    }

    if (numAmount > balance) {
      setError(`Insufficient balance. You have $${Number(balance).toFixed(2)}`);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/finance/withdraw/', { amount: numAmount });
      setSuccess(response.data.message);
      setBalance(Number(response.data.new_balance));
      setAmount('');
      fetchRecentTransactions();
    } catch (err) {
      setError(err.response?.data?.error || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
    setAmount('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Financial Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Deposit or withdraw funds from your CS2 Marketplace account
        </Typography>
      </Box>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4, 
          bgcolor: 'primary.main', 
          color: 'white',
          borderRadius: 2
        }}
      >
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <WalletIcon sx={{ fontSize: 48 }} />
          </Grid>
          <Grid item xs>
            <Typography variant="h6">Current Balance</Typography>
            <Typography variant="h3">${Number(balance).toFixed(2)}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab icon={<DepositIcon />} label="DEPOSIT" />
          <Tab icon={<WithdrawIcon />} label="WITHDRAW" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Deposit Funds
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add money to your account. Maximum $1000 per transaction.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              disabled={loading}
              sx={{ mb: 2 }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleDeposit}
              disabled={loading || !amount}
              sx={{ py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Deposit Funds'}
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Withdraw Funds
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Withdraw money from your account. Maximum $1000 per transaction.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              disabled={loading}
              sx={{ mb: 2 }}
            />

            <Button
              fullWidth
              variant="contained"
              color="secondary"
              size="large"
              onClick={handleWithdraw}
              disabled={loading || !amount}
              sx={{ py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Withdraw Funds'}
            </Button>
          </Box>
        </TabPanel>
      </Paper>

      {recentTransactions.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <HistoryIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Recent Financial Transactions</Typography>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          {recentTransactions.map((transaction) => (
            <Box key={transaction.id} sx={{ mb: 2 }}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    {transaction.transaction_type === 'add_funds' ? 'Deposit' : 'Withdrawal'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(transaction.created_at)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
                  <Typography 
                    variant="h6" 
                    color={transaction.transaction_type === 'add_funds' ? 'success.main' : 'error'}
                  >
                    {transaction.transaction_type === 'add_funds' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
              {transaction.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {transaction.description}
                </Typography>
              )}
              <Divider sx={{ mt: 2 }} />
            </Box>
          ))}
          
          <Button 
            variant="text" 
            onClick={() => window.location.href = '/transactions'}
            sx={{ mt: 1 }}
          >
            View All Transactions →
          </Button>
        </Paper>
      )}
    </Container>
  );
}

export default FinancePage;