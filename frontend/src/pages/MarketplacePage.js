import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, CardMedia, Typography, Button } from '@mui/material';
import axios from 'axios';

function MarketplacePage() {
  const [skins, setSkins] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    axios.get(`${API_URL}/skins/`)
      .then(response => {
        setSkins(response.data);
      })
      .catch(error => {
        console.error('Error fetching skins:', error);
      });
  },[API_URL]);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Marketplace
      </Typography>
      <Grid container spacing={3}>
        {skins.map(skin => (
          <Grid item xs={12} sm={6} md={4} key={skin.id}>
            <Card>
              {skin.image_url && (
                <CardMedia
                  component="img"
                  height="140"
                  image={skin.image_url}
                  alt={skin.name}
                />
              )}
              <CardContent>
                <Typography variant="h6">{skin.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {skin.weapon} | {skin.quality}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                  ${skin.price}
                </Typography>
                <Button variant="contained" sx={{ mt: 2 }} fullWidth>
                  Buy Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default MarketplacePage;