import React from 'react';
import { Typography, Paper } from '@mui/material';

function InventoryPage() {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Your Inventory
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Login to see your inventory and balance.
        </Typography>
      </Paper>
    </div>
  );
}

export default InventoryPage;