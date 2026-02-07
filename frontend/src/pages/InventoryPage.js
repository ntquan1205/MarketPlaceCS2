import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import api from '../services/api';

function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetchInventory();
    fetchBalance();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/inventory/');
      setInventory(response.data);
    } catch (err) {
      setError('Failed to load inventory');
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

  const handleSell = async (itemId) => {
    try {
      await api.post(`/market/sell/${itemId}/`);
      // Обновляем данные после продажи
      fetchInventory();
      fetchBalance();
      alert('Skin sold successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to sell skin');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">
          Your Inventory
        </Typography>
        <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
          <Typography variant="h6">
            Balance: ${balance}
          </Typography>
        </Paper>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {inventory.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1">
            Your inventory is empty. Buy some skins from the marketplace!
          </Typography>
        </Paper>
      ) : (
        <>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {inventory.length} skins in inventory
          </Typography>
          
          <Grid container spacing={3}>
            {inventory.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card>
                  {item.skin.image_url && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={item.skin.image_url}
                      alt={item.skin.name}
                      sx={{ objectFit: 'cover' }}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {item.skin.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.skin.weapon} | {item.skin.quality}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 1, mb: 2 }}>
                      ${item.skin.base_price}
                    </Typography>
                    <Button
                      variant="contained"
                      color="secondary"
                      fullWidth
                      onClick={() => handleSell(item.id)}
                    >
                      Sell
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </div>
  );
}

export default InventoryPage;