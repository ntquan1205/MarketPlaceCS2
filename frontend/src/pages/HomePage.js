import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

function HomePage() {
  return (
    <Box>
      <Typography variant="h3" gutterBottom>
        Welcome to CS2 Marketplace
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1">
          Buy, sell, and trade CS2 skins with other players.
          Start with $100 and 10 random skins!
        </Typography>
      </Paper>
    </Box>
  );
}

export default HomePage;