import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  ArrowUpward as BuyIcon,
  ArrowDownward as SellIcon,
  AccountBalanceWallet as FundsIcon,
  SwapHoriz as TradeIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import api from '../services/api';

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'buy', 'sell', 'add_funds'
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetchTransactions();
    fetchBalance();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions/');
      setTransactions(response.data);
    } catch (err) {
      setError('Failed to load transactions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await api.get('/auth/profile/');
      setBalance(response.data.balance);
    } catch (err) {
      console.error('Failed to load balance:', err);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'buy':
        return <BuyIcon color="error" />;
      case 'sell':
        return <SellIcon color="success" />;
      case 'add_funds':
        return <FundsIcon color="primary" />;
      case 'trade':
        return <TradeIcon color="warning" />;
      default:
        return <BuyIcon />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'buy':
        return 'error';
      case 'sell':
        return 'success';
      case 'add_funds':
        return 'primary';
      case 'trade':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getTransactionLabel = (type) => {
    switch (type) {
      case 'buy':
        return 'BUY';
      case 'sell':
        return 'SELL';
      case 'add_funds':
        return 'ADD FUNDS';
      case 'trade':
        return 'TRADE';
      default:
        return type.toUpperCase();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.transaction_type === filter;
  });

  const totalSpent = transactions
    .filter(t => t.transaction_type === 'buy')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalEarned = transactions
    .filter(t => t.transaction_type === 'sell')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Transaction History
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          View your purchase, sale, and balance history
        </Typography>
      </Box>

      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Current Balance
              </Typography>
              <Typography variant="h4" color="primary">
                ${parseFloat(balance).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Spent
              </Typography>
              <Typography variant="h4" color="error">
                ${totalSpent.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Earned
              </Typography>
              <Typography variant="h4" color="success.main">
                ${totalEarned.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Фильтры */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <FilterIcon color="action" />
          </Grid>
          <Grid item>
            <Typography variant="body1">Filter by:</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <MenuItem value="all">All Transactions</MenuItem>
              <MenuItem value="buy">Purchases</MenuItem>
              <MenuItem value="sell">Sales</MenuItem>
              <MenuItem value="add_funds">Balance Additions</MenuItem>
            </TextField>
          </Grid>
          <Grid item>
            <Chip 
              label={`${filteredTransactions.length} transactions`}
              color="primary"
              variant="outlined"
            />
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {filteredTransactions.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No transactions found.
            {filter !== 'all' && ' Try changing the filter.'}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Skin</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow 
                  key={transaction.id}
                  hover
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    backgroundColor: transaction.transaction_type === 'buy' ? 'rgba(244, 67, 54, 0.04)' : 
                                   transaction.transaction_type === 'sell' ? 'rgba(76, 175, 80, 0.04)' : 'inherit'
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getTransactionIcon(transaction.transaction_type)}
                      <Chip 
                        label={getTransactionLabel(transaction.transaction_type)}
                        color={getTransactionColor(transaction.transaction_type)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    {transaction.skin ? (
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {transaction.skin.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {transaction.skin.weapon} | {transaction.skin.quality}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {transaction.description}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                  <Typography 
                    variant="body1" 
                    fontWeight="bold"
                    color={
                      transaction.transaction_type === 'buy' || transaction.transaction_type === 'withdraw' 
                        ? 'error' 
                        : 'success.main'
                    }
                  >
                    {transaction.transaction_type === 'buy' || transaction.transaction_type === 'withdraw' 
                      ? '-' 
                      : '+'}
                    ${parseFloat(transaction.amount).toFixed(2)}
                  </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(transaction.created_at)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Сводка */}
      {filteredTransactions.length > 0 && (
        <Paper sx={{ p: 2, mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </Typography>
        </Paper>
      )}
    </Container>
  );
}

export default TransactionsPage;