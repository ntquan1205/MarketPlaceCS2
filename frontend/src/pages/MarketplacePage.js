import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Avatar
} from '@mui/material';
import api from '../services/api';

function MarketplacePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    fetchMarketplace();
    fetchBalance();
  }, []);

  const fetchMarketplace = async () => {
    try {
      const response = await api.get('/marketplace/');
      setItems(response.data);
    } catch (err) {
      setError('Failed to load marketplace');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await api.get('/auth/profile/');
      setBalance(parseFloat(response.data.balance));
    } catch (err) {
      console.error('Failed to load balance:', err);
    }
  };

  const handleBuyClick = (item) => {
    setSelectedItem(item);
    setBuyDialogOpen(true);
  };

  const handleBuyConfirm = async () => {
    if (!selectedItem) return;
    
    setBuying(true);
    try {
      await api.post(`/marketplace/buy/${selectedItem.id}/`);
      alert('Purchase successful!');
      setBuyDialogOpen(false);
      // Обновляем данные
      fetchMarketplace();
      fetchBalance();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to buy item');
    } finally {
      setBuying(false);
    }
  };

  const canAfford = selectedItem && balance >= parseFloat(selectedItem.price);

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
          Marketplace
        </Typography>
        <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
          <Typography variant="h6">
            Your Balance: ${balance.toFixed(2)}
          </Typography>
        </Paper>
      </Box>

      <Typography variant="h6" sx={{ mb: 3 }}>
        Skins for sale from other players
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {items.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1">
            No skins available for sale. List your own skins to sell!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {items.map((item) => (
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
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2 }}>
                    <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'secondary.main' }}>
                      {item.seller.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2">
                      Sold by: {item.seller}
                    </Typography>
                  </Box>
                  
                  <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
                    ${parseFloat(item.price).toFixed(2)}
                  </Typography>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleBuyClick(item)}
                    disabled={balance < parseFloat(item.price)}
                  >
                    {balance < parseFloat(item.price) ? 'Cannot Afford' : 'Buy Now'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={buyDialogOpen} onClose={() => !buying && setBuyDialogOpen(false)}>
        <DialogTitle>Confirm Purchase</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <>
              <Typography>
                Buy <strong>{selectedItem.skin.name}</strong> from <strong>{selectedItem.seller}</strong>?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {selectedItem.skin.weapon} | {selectedItem.skin.quality}
              </Typography>
              <Typography variant="h6" sx={{ mt: 2 }}>
                Price: ${parseFloat(selectedItem.price).toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Your balance: ${balance.toFixed(2)}
              </Typography>
              {!canAfford && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Insufficient balance! You need ${(parseFloat(selectedItem.price) - balance).toFixed(2)} more.
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBuyDialogOpen(false)} disabled={buying}>
            Cancel
          </Button>
          <Button
            onClick={handleBuyConfirm}
            variant="contained"
            disabled={!canAfford || buying}
          >
            {buying ? <CircularProgress size={24} /> : 'Confirm Purchase'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default MarketplacePage;