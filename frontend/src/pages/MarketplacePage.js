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
  DialogActions
} from '@mui/material';
import api from '../services/api';

function MarketplacePage() {
  const [skins, setSkins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSkin, setSelectedSkin] = useState(null);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetchSkins();
    fetchBalance();
  }, []);

  const fetchSkins = async () => {
    try {
      const response = await api.get('/skins/');
      setSkins(response.data);
    } catch (err) {
      setError('Failed to load skins');
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

  const handleBuyClick = (skin) => {
    setSelectedSkin(skin);
    setBuyDialogOpen(true);
  };

  const handleBuyConfirm = async () => {
    if (!selectedSkin) return;

    try {
      await api.post(`/market/buy/${selectedSkin.id}/`);
      alert('Purchase successful!');
      setBuyDialogOpen(false);
      // Обновляем баланс
      fetchBalance();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to buy skin');
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
          Marketplace
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {skins.map((skin) => (
          <Grid item xs={12} sm={6} md={4} key={skin.id}>
            <Card>
              {skin.image_url && (
                <CardMedia
                  component="img"
                  height="140"
                  image={skin.image_url}
                  alt={skin.name}
                  sx={{ objectFit: 'cover' }}
                />
              )}
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {skin.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {skin.weapon} | {skin.quality}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Price range: ${skin.min_sell_price} - ${skin.max_sell_price}
                </Typography>
                <Typography variant="h5" color="primary" sx={{ mt: 1, mb: 2 }}>
                  ${skin.base_price}
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleBuyClick(skin)}
                >
                  Buy Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={buyDialogOpen} onClose={() => setBuyDialogOpen(false)}>
        <DialogTitle>Confirm Purchase</DialogTitle>
        <DialogContent>
          {selectedSkin && (
            <>
              <Typography>
                Are you sure you want to buy <strong>{selectedSkin.name}</strong>?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {selectedSkin.weapon} | {selectedSkin.quality}
              </Typography>
              <Typography variant="h6" sx={{ mt: 2 }}>
                Price: ${selectedSkin.base_price}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Your balance: ${balance}
              </Typography>
              {balance < selectedSkin.base_price && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Insufficient balance!
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBuyDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleBuyConfirm}
            variant="contained"
            disabled={selectedSkin && balance < selectedSkin.base_price}
          >
            Confirm Purchase
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default MarketplacePage;