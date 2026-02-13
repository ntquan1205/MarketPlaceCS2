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
  Avatar,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Chip,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import api from '../services/api';

function MarketplacePage() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [buying, setBuying] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWeapon, setSelectedWeapon] = useState('all');
  const [selectedQuality, setSelectedQuality] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 2500]);
  const [maxPrice, setMaxPrice] = useState(2500);
  const [showFilters, setShowFilters] = useState(false);
  
  const [weapons, setWeapons] = useState([]);
  const [qualities, setQualities] = useState([]);

  useEffect(() => {
    fetchMarketplace();
    fetchBalance();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [items, searchTerm, selectedWeapon, selectedQuality, priceRange]);

  const fetchMarketplace = async () => {
    try {
      const response = await api.get('/marketplace/');
      setItems(response.data);
      
      const uniqueWeapons = [...new Set(response.data.map(item => item.skin.weapon))].sort();
      const uniqueQualities = [...new Set(response.data.map(item => item.skin.quality))].sort();
      
      setWeapons(uniqueWeapons);
      setQualities(uniqueQualities);
      
      const maxItemPrice = Math.max(...response.data.map(item => parseFloat(item.price)), 0);
      setMaxPrice(Math.min(maxItemPrice + 100, 2500));
      setPriceRange([0, maxItemPrice + 100]);
      
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
      setBalance(Number(response.data.balance));
    } catch (err) {
      console.error('Failed to load balance:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...items];
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.skin.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedWeapon !== 'all') {
      filtered = filtered.filter(item => item.skin.weapon === selectedWeapon);
    }
    
    if (selectedQuality !== 'all') {
      filtered = filtered.filter(item => item.skin.quality === selectedQuality);
    }
    
    filtered = filtered.filter(item => 
      parseFloat(item.price) >= priceRange[0] && 
      parseFloat(item.price) <= priceRange[1]
    );
    
    setFilteredItems(filtered);
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
      fetchMarketplace();
      fetchBalance();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to buy item');
    } finally {
      setBuying(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedWeapon('all');
    setSelectedQuality('all');
    setPriceRange([0, maxPrice]);
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

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search skins by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              endIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              Filters {showFilters ? 'Hide' : 'Show'}
            </Button>
          </Grid>
          <Grid item xs={6} md={3}>
            <Button
              fullWidth
              variant="text"
              onClick={clearFilters}
              disabled={!searchTerm && selectedWeapon === 'all' && selectedQuality === 'all'}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>

        <Collapse in={showFilters}>
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Weapon Type</InputLabel>
                  <Select
                    value={selectedWeapon}
                    onChange={(e) => setSelectedWeapon(e.target.value)}
                    label="Weapon Type"
                  >
                    <MenuItem value="all">All Weapons</MenuItem>
                    {weapons.map(weapon => (
                      <MenuItem key={weapon} value={weapon}>{weapon}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Quality</InputLabel>
                  <Select
                    value={selectedQuality}
                    onChange={(e) => setSelectedQuality(e.target.value)}
                    label="Quality"
                  >
                    <MenuItem value="all">All Qualities</MenuItem>
                    {qualities.map(quality => (
                      <MenuItem key={quality} value={quality}>{quality}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography gutterBottom>Price Range</Typography>
                <Slider
                  value={priceRange}
                  onChange={(e, newValue) => setPriceRange(newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={maxPrice}
                  step={10}
                  valueLabelFormat={(value) => `$${value}`}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">${priceRange[0]}</Typography>
                  <Typography variant="body2">${priceRange[1]}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {filteredItems.length} skins for sale
          {searchTerm && ` matching "${searchTerm}"`}
        </Typography>
        
        <Box>
          {selectedWeapon !== 'all' && (
            <Chip 
              label={`Weapon: ${selectedWeapon}`} 
              onDelete={() => setSelectedWeapon('all')}
              size="small"
              sx={{ ml: 1 }}
            />
          )}
          {selectedQuality !== 'all' && (
            <Chip 
              label={`Quality: ${selectedQuality}`} 
              onDelete={() => setSelectedQuality('all')}
              size="small"
              sx={{ ml: 1 }}
            />
          )}
          {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
            <Chip 
              label={`Price: $${priceRange[0]}-$${priceRange[1]}`} 
              onDelete={() => setPriceRange([0, maxPrice])}
              size="small"
              sx={{ ml: 1 }}
            />
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {filteredItems.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            No skins match your search criteria.
            {items.length > 0 && ' Try adjusting your filters.'}
          </Typography>
          {items.length > 0 && (
            <Button 
              variant="text" 
              onClick={clearFilters}
              sx={{ mt: 2 }}
            >
              Clear all filters
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredItems.map((item) => (
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

      {/* Buy Confirmation Dialog */}
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