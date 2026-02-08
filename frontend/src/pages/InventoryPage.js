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
  Alert,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import api from '../services/api';

function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState(0);
  const [salePrices, setSalePrices] = useState({}); // {itemId: price}
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchInventory();
    fetchBalance();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/inventory/');
      setInventory(response.data);
      
      // Инициализируем цены для каждого предмета
      const prices = {};
      response.data.forEach(item => {
        if (item.skin) {
          // Устанавливаем среднюю цену как начальную
          const min = parseFloat(item.skin.min_sell_price);
          const max = parseFloat(item.skin.max_sell_price);
          prices[item.id] = ((min + max) / 2).toFixed(2);
        }
      });
      setSalePrices(prices);
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

  const handleSellClick = (item) => {
    setSelectedItem(item);
    setSellDialogOpen(true);
  };

  const handleSellConfirm = async () => {
    if (!selectedItem) return;

    const price = salePrices[selectedItem.id];
    if (!price || price <= 0) {
      alert('Please enter a valid price');
      return;
    }

    try {
      await api.post(`/inventory/${selectedItem.id}/sell/`, { price });
      alert('Skin listed for sale!');
      setSellDialogOpen(false);
      // Обновляем данные
      fetchInventory();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to list skin for sale';
      alert(errorMsg);
    }
  };

  const handleCancelSale = async (itemId) => {
    try {
      await api.post(`/inventory/${itemId}/cancel_sale/`);
      alert('Sale cancelled!');
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel sale');
    }
  };

  const handlePriceChange = (itemId, value) => {
    setSalePrices(prev => ({
      ...prev,
      [itemId]: value
    }));
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
                    
                    <Box sx={{ mt: 1, mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Price range: ${item.skin.min_sell_price} - ${item.skin.max_sell_price}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        Value: ${item.skin.base_price}
                      </Typography>
                    </Box>

                    {item.is_for_sale ? (
                      <Box sx={{ mt: 2 }}>
                        <Chip 
                          label={`FOR SALE: $${item.sale_price}`} 
                          color="success" 
                          sx={{ mb: 1, width: '100%' }}
                        />
                        <Button
                          variant="outlined"
                          color="secondary"
                          fullWidth
                          onClick={() => handleCancelSale(item.id)}
                        >
                          Cancel Sale
                        </Button>
                      </Box>
                    ) : (
                      <Box sx={{ mt: 2 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Sale Price"
                          type="number"
                          value={salePrices[item.id] || ''}
                          onChange={(e) => handlePriceChange(item.id, e.target.value)}
                          sx={{ mb: 1 }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                          helperText={`Min: $${item.skin.min_sell_price}, Max: $${item.skin.max_sell_price}`}
                        />
                        <Button
                          variant="contained"
                          color="secondary"
                          fullWidth
                          onClick={() => handleSellClick(item)}
                          disabled={!salePrices[item.id] || salePrices[item.id] <= 0}
                        >
                          Sell on Marketplace
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Sell Dialog */}
      <Dialog open={sellDialogOpen} onClose={() => setSellDialogOpen(false)}>
        <DialogTitle>List Skin for Sale</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <>
              <Typography gutterBottom>
                List <strong>{selectedItem.skin.name}</strong> for sale?
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedItem.skin.weapon} | {selectedItem.skin.quality}
              </Typography>
              
              <TextField
                autoFocus
                margin="dense"
                label="Sale Price"
                type="number"
                fullWidth
                value={salePrices[selectedItem.id] || ''}
                onChange={(e) => handlePriceChange(selectedItem.id, e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                sx={{ mt: 2 }}
              />
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Price must be between ${selectedItem.skin.min_sell_price} and ${selectedItem.skin.max_sell_price}
              </Typography>
              
              {salePrices[selectedItem.id] && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  You will receive ${salePrices[selectedItem.id]} when someone buys this skin.
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSellDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSellConfirm}
            variant="contained"
            disabled={!selectedItem || !salePrices[selectedItem.id]}
          >
            List for Sale
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default InventoryPage;