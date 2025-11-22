import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useSnackbar } from '../../hooks/common';

export const GlobalSnackbar: React.FC = () => {
  const { snackbarState, hideSnackbar } = useSnackbar();

  return (
    <Snackbar
      open={snackbarState.open}
      autoHideDuration={3000}
      onClose={hideSnackbar}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      slotProps={{
        transition: {
          style: { transition: 'all 0.3s ease-in-out' }
        }
      }}
      sx={{ zIndex: 9999 }}
    >
      <Alert
        onClose={hideSnackbar}
        severity={snackbarState.severity}
        variant="outlined"
        sx={(theme) => ({
          width: '100%',
          minWidth: 300,
          borderRadius: 2,
          boxShadow: theme.shadows[4],
          fontWeight: 500,
          backgroundColor: theme.palette.background.paper,
          borderLeftWidth: 4,
          '& .MuiAlert-icon': {
            fontSize: 24,
          },
          '& .MuiAlert-message': {
            fontSize: 14,
            fontWeight: 500,
            color: '#333333',
          },
          ...(snackbarState.severity === 'success' && {
            borderLeftColor: theme.palette.success.main,
            backgroundColor: `${theme.palette.success.light}15`,
            '& .MuiAlert-icon': {
              color: theme.palette.success.main,
            },
          }),
          ...(snackbarState.severity === 'error' && {
            borderLeftColor: theme.palette.error.main,
            backgroundColor: `${theme.palette.error.light}15`,
            '& .MuiAlert-icon': {
              color: theme.palette.error.main,
            },
          }),
          ...(snackbarState.severity === 'warning' && {
            borderLeftColor: theme.palette.warning.main,
            backgroundColor: `${theme.palette.warning.light}15`,
            '& .MuiAlert-icon': {
              color: theme.palette.warning.main,
            },
          }),
          ...(snackbarState.severity === 'info' && {
            borderLeftColor: theme.palette.info.main,
            backgroundColor: `${theme.palette.info.light}15`,
            '& .MuiAlert-icon': {
              color: theme.palette.info.main,
            },
          }),
        })}
      >
        {snackbarState.message}
      </Alert>
    </Snackbar>
  );
};
